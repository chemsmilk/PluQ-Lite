'use strict';

// A readability heuristic, not a threat-detection boundary.
const LONG_URL_THRESHOLD = 100;
let currentAnalysis = null;
let currentMode = 'simple';
let recentChecks = [];

function analyzeUrl(input) {
  const submittedUrl = input.trim();
  if (!submittedUrl) throw new Error('Enter a URL to analyze. Try https://example.com.');
  if (!/^https?:\/\//i.test(submittedUrl)) {
    throw new Error('Include http:// or https:// at the start. Other protocols are not supported.');
  }
  // Reject ambiguous spelling that browsers might silently repair.
  if (/[\s\\]/u.test(submittedUrl) || !/^https?:\/\/[^/?#]/i.test(submittedUrl)) {
    throw new Error('Use a complete URL without spaces, line breaks, or backslashes. Encode spaces as %20.');
  }
  let parsedUrl;
  try { parsedUrl = new URL(submittedUrl); }
  catch { throw new Error('That URL could not be parsed. Check the hostname and port, then try again.'); }
  if (!parsedUrl.hostname) throw new Error('Enter a URL with a destination hostname.');
  const hostname = parsedUrl.hostname;
  // URL normalizes alternative IPv4 spellings, and brackets IPv6 hostnames.
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isIpv6 = hostname.startsWith('[') && hostname.endsWith(']');
  const hasCredentials = parsedUrl.username !== '' || parsedUrl.password !== '';
  const urlLength = Array.from(submittedUrl).length;
  const checks = [
    { key: 'https', warning: parsedUrl.protocol !== 'https:' },
    { key: 'ip', warning: isIpv4 || isIpv6 },
    { key: 'credentials', warning: hasCredentials },
    { key: 'length', warning: urlLength > LONG_URL_THRESHOLD }
  ];
  return { submittedUrl, hostname, protocol: parsedUrl.protocol, urlLength, checks,
    warningCount: checks.filter(check => check.warning).length };
}

function explainCheck(check, analysis, mode) {
  const technical = mode === 'technical';
  const explanations = {
    https: check.warning
      ? ['No HTTPS', technical ? `Protocol is ${analysis.protocol} rather than https:. HTTP does not provide TLS encryption.` : 'This link uses HTTP, which does not encrypt the connection.']
      : ['Uses HTTPS', technical ? 'Protocol is https:. TLS encrypts the connection; it does not establish website legitimacy.' : 'HTTPS encrypts the connection, but deceptive websites can use HTTPS too.'],
    ip: check.warning
      ? ['IP-address destination', technical ? 'The parsed hostname is an IPv4 or IPv6 literal. IP literals can be legitimate; verify the intended destination.' : 'This link points directly to an IP address. That can be legitimate, but deserves a closer look.']
      : ['No IP-address destination', technical ? 'The parsed hostname is not an IPv4 or IPv6 literal. This does not establish domain reputation.' : 'The destination uses a name rather than an IP address. A name alone does not prove trustworthiness.'],
    credentials: check.warning
      ? ['Login information before @', technical ? 'Nonempty URL username or password detected. Userinfo precedes @; the parsed hostname is the actual destination.' : 'Text before @ is login information, not the website you will reach. Check the actual destination shown on the left.']
      : ['No URL credentials detected', technical ? 'The URL parser returned empty username and password fields. Any @ in the path or query is not userinfo.' : 'No login information is hiding the destination before an @. Other forms of misleading links are still possible.'],
    length: check.warning
      ? ['Unusually long URL', technical ? `${analysis.urlLength} Unicode code points exceeds the ${LONG_URL_THRESHOLD}-character heuristic. Length alone does not indicate maliciousness.` : `This link is longer than ${LONG_URL_THRESHOLD} characters. Long links can be legitimate, but details can be harder to notice.`]
      : ['URL within length threshold', technical ? `${analysis.urlLength} Unicode code points; threshold is strictly greater than ${LONG_URL_THRESHOLD}, after trimming surrounding whitespace.` : `This link has ${analysis.urlLength} characters, within our ${LONG_URL_THRESHOLD}-character threshold. Short links can still be deceptive.`]
  };
  return explanations[check.key];
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  // Submitted text is never inserted as HTML or turned into a destination link.
  if (text !== undefined) element.textContent = text;
  return element;
}

function structuralSummary(warningCount) {
  return warningCount === 0
    ? 'No structural warnings detected'
    : `${warningCount} structural warning${warningCount === 1 ? '' : 's'} detected`;
}

function renderResults() {
  if (!currentAnalysis) return;
  const analysis = currentAnalysis;
  document.getElementById('hostname').textContent = analysis.hostname;
  document.getElementById('destination-help').textContent = currentMode === 'technical'
    ? `Parsed hostname · Protocol: ${analysis.protocol} · Input length: ${analysis.urlLength}`
    : 'This is the website name or IP address in your link. Check that it matches where you intended to go.';
  const badge = document.getElementById('warning-count');
  badge.className = `badge ${analysis.warningCount ? 'warning' : 'neutral'}`;
  badge.textContent = structuralSummary(analysis.warningCount);
  const findings = document.getElementById('findings');
  findings.replaceChildren();
  analysis.checks.forEach(check => {
    const [title, explanation] = explainCheck(check, analysis, currentMode);
    const row = makeElement('div', 'finding');
    const icon = makeElement('span', `status-icon ${check.warning ? 'warning' : 'neutral'}`, check.warning ? '!' : 'i');
    icon.setAttribute('aria-label', check.warning ? 'Structural warning' : 'Structural observation');
    const content = makeElement('div');
    content.append(makeElement('h3', '', title), makeElement('p', '', explanation));
    row.append(icon, content);
    findings.append(row);
  });
  document.getElementById('result-announcement').textContent = `${analysis.hostname}: ${structuralSummary(analysis.warningCount)}. ${currentMode} explanations shown. Website safety has not been assessed. Website content and threat intelligence databases are not checked.`;
}

function renderHistory() {
  const list = document.getElementById('history-list');
  list.replaceChildren();
  recentChecks.forEach(analysis => {
    const item = makeElement('li');
    const urlText = makeElement('span', 'history-url', analysis.submittedUrl);
    const button = makeElement('button', 'reanalyze-button', 'Analyze again');
    button.type = 'button';
    button.setAttribute('aria-label', `Analyze again: ${analysis.submittedUrl}`);
    button.addEventListener('click', () => {
      document.getElementById('url-input').value = analysis.submittedUrl;
      submitAnalysis();
    });
    item.append(urlText, makeElement('div', `history-meta ${analysis.warningCount ? 'warning' : 'neutral'}`, structuralSummary(analysis.warningCount)), button);
    list.append(item);
  });
  document.getElementById('history-empty').hidden = recentChecks.length > 0;
  document.getElementById('clear-history').disabled = recentChecks.length === 0;
}

function submitAnalysis(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('url-input');
  const error = document.getElementById('input-error');
  error.textContent = '';
  input.removeAttribute('aria-invalid');
  try {
    const result = analyzeUrl(input.value);
    currentAnalysis = result;
    recentChecks.unshift(result);
    recentChecks = recentChecks.slice(0, 5);
    renderResults();
    renderHistory();
    document.getElementById('result-title').textContent = 'Analysis Result';
  } catch (failure) {
    error.textContent = failure.message;
    input.setAttribute('aria-invalid', 'true');
    // Make it explicit that any still-visible results belong to the previous URL.
    if (currentAnalysis) document.getElementById('result-title').textContent = 'Previous Analysis Result';
    input.focus();
  }
}

function setMode(mode) {
  currentMode = mode;
  document.getElementById('simple-mode').setAttribute('aria-pressed', String(mode === 'simple'));
  document.getElementById('technical-mode').setAttribute('aria-pressed', String(mode === 'technical'));
  renderResults();
}

function initializePage() {
  document.getElementById('analyzer').addEventListener('submit', submitAnalysis);
  document.getElementById('simple-mode').addEventListener('click', () => setMode('simple'));
  document.getElementById('technical-mode').addEventListener('click', () => setMode('technical'));
  document.getElementById('clear-history').addEventListener('click', () => {
    recentChecks = [];
    renderHistory();
    document.getElementById('history-status').textContent = 'Recent checks cleared.';
  });
  document.querySelectorAll('[data-example]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById('url-input');
      input.value = button.dataset.example;
      input.removeAttribute('aria-invalid');
      document.getElementById('input-error').textContent = '';
      input.focus();
    });
  });
}

if (typeof document !== 'undefined') initializePage();
