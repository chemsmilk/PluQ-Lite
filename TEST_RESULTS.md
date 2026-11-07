# Verification results

Date: November 7, 2026

## Completed automated checks
- `node tests.js`: 23 tests passed using Node v24.22.1, with no added packages.
- `node --check script.js`: passed.
- SHA-256 comparison: assets/shield.png exactly matches the supplied original image (FE447B0AA1338BD1A4DC3F1203A75E8D8E5CBA9DD1B6A176835F326829E239D1).
- HTTPS, HTTP, IPv4, IPv6, alternative IPv4 normalization, credentials, path/query @, correct hostnames, Unicode length, 100/101-character boundary, invalid input, and international hostname normalization tested.
- DOM-substitute event tests cover submission, four findings, Simple/Technical, last-five history, reanalysis, clearing, examples, and safe text rendering.
- Static assertions cover same-page navigation targets, responsive breakpoint/viewport, absence of destination request/navigation/storage calls, and CSP connection/form restrictions.

The initial Unicode fixture expected 20 characters instead of the correct 21; the fixture was corrected and the entire suite rerun successfully.

## Browser verification still required
The browser tool rejected file:// preview under its URL security policy. No alternate browser route was attempted. Consequently, desktop/mobile appearance, actual browser interaction, accessibility behavior, and Network-panel observation are NOT claimed as verified. No preview server was created.

Open index.html manually in your browser. Check both desktop and a 375px responsive viewport; confirm no horizontal scrolling and that the header, input, findings, history, tips, and original logo are readable. Test keyboard focus and Enter submission. Use the README manual checklist and Network panel to confirm no requests occur when analyzing URLs after initial page load. Reload to confirm session history resets.

## Repository scope
All project writes are in C:\Users\Kevin\Downloads\PluQ-Lite. The original PlutoHacks2026 project was not edited. No remote repository was created, and nothing was pushed, deployed, or published.
