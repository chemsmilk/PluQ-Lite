'use strict';
// Optional development checks: node tests.js. No dependencies or network access.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let passed = 0;
function test(name, action) { action(); passed++; console.log(`PASS ${name}`); }
class Element {
  constructor() { this.children = []; this.attributes = {}; this.events = {}; this.value = ''; this.textContent = ''; this.dataset = {}; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attributes[key] = value; }
  removeAttribute(key) { delete this.attributes[key]; }
  addEventListener(name, callback) { this.events[name] = callback; }
  focus() { this.focused = true; }
}
const html = fs.readFileSync('index.html', 'utf8');
const source = fs.readFileSync('script.js', 'utf8');
const elements = {};
for (const match of html.matchAll(/id="([^"]+)"/g)) elements[match[1]] = new Element();
const examples = [...html.matchAll(/data-example="([^"]+)"/g)].map(match => { const element = new Element(); element.dataset.example = match[1]; return element; });
const blocked = () => { throw new Error('Unexpected network or storage access'); };
const context = vm.createContext({ URL, console, fetch: blocked, XMLHttpRequest: blocked, WebSocket: blocked, open: blocked, localStorage: new Proxy({}, {get: blocked}), document: { getElementById: id => { assert.ok(elements[id], `Unknown element ${id}`); return elements[id]; }, createElement: () => new Element(), querySelectorAll: selector => { assert.equal(selector, '[data-example]'); return examples; } } });
vm.runInContext(source, context);
const analyze = value => context.analyzeUrl(value);
const warning = (url, key) => analyze(url).checks.find(check => check.key === key).warning;
test('HTTPS and HTTP', () => { assert.equal(analyze('https://example.com').warningCount, 0); assert.equal(warning('http://example.com', 'https'), true); });
test('IPv4 and canonical destination', () => { assert.equal(analyze('http://192.0.2.1').warningCount, 2); assert.equal(analyze('http://192.0.2.1').hostname, '192.0.2.1'); });
test('IPv6 and port', () => { assert.equal(warning('https://[2001:db8::1]:443/a', 'ip'), true); assert.equal(analyze('https://[2001:db8::1]:443/a').hostname, '[2001:db8::1]'); });
test('Alternative IPv4 normalization', () => { assert.equal(warning('https://0xC0000201', 'ip'), true); assert.equal(analyze('https://0xC0000201').hostname, '192.0.2.1'); });
test('Credentials reveal actual hostname', () => { const result = analyze('https://trusted.example@untrusted.example'); assert.equal(result.hostname, 'untrusted.example'); assert.equal(result.warningCount, 1); });
test('Password-only and encoded credentials', () => { assert.ok(warning('https://:secret@example.com', 'credentials')); assert.ok(warning('https://user%40name@example.com', 'credentials')); });
test('Path/query @ symbols are not credentials', () => { assert.equal(warning('https://example.com/a@b?q=x@y', 'credentials'), false); });
test('Empty userinfo is not nonempty credentials', () => assert.equal(warning('https://@example.com', 'credentials'), false));
test('Length boundary at 100 and 101', () => { const prefix = 'https://example.com/'; assert.equal(warning(prefix + 'a'.repeat(100 - prefix.length), 'length'), false); assert.equal(warning(prefix + 'a'.repeat(101 - prefix.length), 'length'), true); });
test('Whitespace trim and Unicode length', () => { assert.equal(analyze('  https://example.com  ').hostname, 'example.com'); assert.equal(analyze('https://example.com/😀').urlLength, 21); });
test('Invalid inputs rejected', () => { for (const input of ['', 'hello', 'example.com', 'javascript:alert(1)', 'ftp://example.com', 'https://', 'https:///example.com', 'https://exa mple.com', 'https://example.com:99999', 'https://[invalid]', 'https://example.com\\evil', 'https://example.com/\nabc']) assert.throws(() => analyze(input), undefined, input); });
test('Hostname normalization and IDN', () => { assert.equal(analyze('HTTPS://EXAMPLE.COM:443/a').hostname, 'example.com'); assert.equal(analyze('https://bücher.example').hostname, 'xn--bcher-kva.example'); });
function submit(url) { elements['url-input'].value = url; let prevented = false; elements.analyzer.events.submit({ preventDefault() { prevented = true; } }); assert.ok(prevented); }
test('Submit renders four findings and hostname', () => { submit('https://trusted.example@untrusted.example'); assert.equal(elements.hostname.textContent, 'untrusted.example'); assert.equal(elements.findings.children.length, 4); assert.match(elements['warning-count'].textContent, /^1 structural warning/); });
test('Simple/Technical toggle changes explanation, not history', () => { const simple = elements.findings.children[0].children[1].children[1].textContent; elements['technical-mode'].events.click(); assert.equal(elements['technical-mode'].attributes['aria-pressed'], 'true'); assert.notEqual(elements.findings.children[0].children[1].children[1].textContent, simple); assert.equal(elements['history-list'].children.length, 1); elements['simple-mode'].events.click(); assert.equal(elements.findings.children[0].children[1].children[1].textContent, simple); });
test('History retains five most recent successful checks', () => { for(let i = 0; i < 6; i++) submit(`https://example.com/${i}`); assert.equal(elements['history-list'].children.length, 5); assert.equal(elements['history-list'].children[0].children[0].textContent, 'https://example.com/5'); assert.equal(elements['history-list'].children[4].children[0].textContent, 'https://example.com/1'); });
test('Invalid submission preserves history and labels stale results', () => { submit('invalid'); assert.equal(elements['history-list'].children.length, 5); assert.equal(elements['url-input'].attributes['aria-invalid'], 'true'); assert.equal(elements['result-title'].textContent, 'Previous Analysis Result'); });
test('Reanalysis loads URL and refreshes results', () => { elements['history-list'].children[4].children[2].events.click(); assert.equal(elements['url-input'].value, 'https://example.com/1'); assert.equal(elements['result-title'].textContent, 'Analysis Result'); });
test('Clear history empties list and disables clear button', () => { elements['clear-history'].events.click(); assert.equal(elements['history-list'].children.length, 0); assert.equal(elements['clear-history'].disabled, true); assert.equal(elements['history-empty'].hidden, false); });
test('All examples load without automatic analysis', () => { for(const example of examples) { example.events.click(); assert.equal(elements['url-input'].value, example.dataset.example); assert.equal(elements['history-list'].children.length, 0); } assert.equal(examples.length, 4); });
test('Submitted markup is displayed as text', () => { const url = 'https://example.com/<img>'; submit(url); assert.equal(elements['history-list'].children[0].children[0].textContent, url); assert.equal(source.includes('innerHTML'), false); });
test('Navigation has matching section anchors', () => { for (const id of ['home', 'privacy', 'about']) { assert.ok(html.includes(`href="#${id}"`)); assert.ok(elements[id]); } });
test('No network/navigation/storage calls and CSP blocks connections', () => { assert.doesNotMatch(source, /\b(fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|sendBeacon)\s*[.(]/); assert.doesNotMatch(source, /\b(location|href|src)\s*=/); assert.ok(html.includes("connect-src 'none'")); assert.ok(html.includes("form-action 'none'")); });
test('Responsive breakpoint and viewport supplied', () => { assert.ok(html.includes('width=device-width')); assert.ok(fs.readFileSync('style.css', 'utf8').includes('@media(max-width:760px)')); });
test('Ordinary HTTPS results never convey a definitive safety verdict', () => {
  for (const url of ['https://example.com', 'https://www.wicar.org', 'https://ordinary.example/account']) {
    submit(url); // Parse as text only: no destination is requested.
    for (const mode of ['simple', 'technical']) {
      elements[mode + '-mode'].events.click();
      assert.equal(elements['warning-count'].textContent, 'No structural warnings detected');
      assert.equal(elements['warning-count'].className, 'badge neutral');
      assert.match(elements['result-announcement'].textContent, /Website safety has not been assessed/);
      for (const row of elements.findings.children) {
        const icon = row.children[0];
        assert.equal(icon.textContent, 'i');
        assert.equal(icon.className, 'status-icon neutral');
        assert.equal(icon.attributes['aria-label'], 'Structural observation');
        assert.doesNotMatch(row.children[1].children[0].textContent, /\b(safe|approved|trusted|verified|passed)\b/i);
      }
      assert.doesNotMatch(elements['warning-count'].textContent, /\b(safe|approved|trusted|verified|passed)\b/i);
      assert.equal(elements['history-list'].children[0].children[1].textContent, 'No structural warnings detected');
      assert.equal(elements['history-list'].children[0].children[1].className, 'history-meta neutral');
    }
  }
  assert.ok(html.includes('Website safety has not been assessed.'));
  assert.ok(html.includes('does not inspect website content or consult threat intelligence databases'));
  assert.ok(html.indexOf('class="scope-notice"') < html.indexOf('class="result-grid"'));
  assert.doesNotMatch(source, /Check passed|✓/);
});
test('Only Analyze again button reanalyzes a history entry', () => {
  const entry = elements['history-list'].children[0];
  assert.equal(entry.children[0].events.click, undefined);
  assert.equal(entry.children[0].attributes.href, undefined);
  assert.equal(entry.children[2].textContent, 'Analyze again');
  assert.equal(entry.children[2].type, 'button');
  elements['url-input'].value = '';
  entry.children[2].events.click();
  assert.equal(elements['url-input'].value, entry.children[0].textContent);
});
console.log(`\n${passed} tests passed. DOM substitute tests do not replace real-browser visual, accessibility, or Network-panel checks.`);

