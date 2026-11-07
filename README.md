# PluQ Lite

Know the link before the click. A beginner-friendly URL structure checker for PlutoHacks 2026, built around the supplied Figma design and original cyan shield logo.

## The problem
Familiar-looking text and HTTPS can make deceptive links seem trustworthy. PluQ Lite makes the actual destination and four structural signals easier to understand before clicking.

## Run
Open `index.html` directly in a modern browser. No installation, backend, package manager, API key, or internet connection is needed. All fonts and assets are local.

## Features and implementation
- HTTPS detection, with an explicit reminder that encryption does not prove legitimacy.
- IPv4 and IPv6 hostname detection using the browser's built-in `URL` parser, including normalized alternative IPv4 notation.
- Nonempty username/password detection. An @ in a path or query is not a credentials warning.
- A documented long-URL heuristic: strictly more than 100 Unicode code points, after trimming surrounding whitespace. This is a readability threshold, not a scientific risk score.
- Actual destination hostname, four explained findings, and a warning count.
- Simple/Technical explanations of identical results.
- Last five successful analyses in JavaScript memory, reanalysis buttons, and Clear history.
- Harmless demonstration inputs, education, Privacy, and About sections.
- Responsive layout, keyboard controls, focus states, and accessible status announcements.

Only explicit HTTP/HTTPS URLs are accepted. Spaces, line breaks, backslashes, missing hosts, invalid ports, and unsupported protocols are rejected. Encoded spaces are allowed. The parser normalizes hostnames (including international names to their ASCII representation). No DNS lookup occurs. Results describe the initial URL, not redirects or final server content.

## Privacy and limitations
The application never requests, opens, previews, or navigates to submitted destinations. Input is rendered with `textContent`, never HTML. CSP blocks network connections and form submissions. There is no analytics, cookie, localStorage, database, or permanent URL history. Reloading clears history. Clear history removes recent entries; the current input and analysis stay visible until replaced or the page is reloaded.

A passed check is not a safe verdict. Legitimate URLs may trigger warnings. Phishing URLs may trigger none. The app does not inspect reputation, website content, malware, redirects, certificate validity, or ownership. Do not use it as the sole basis for trusting a link. Avoid entering sensitive URLs in a public demonstration or screen recording.

## Technologies and files
- `index.html`: semantic layout, input, navigation, results, education, and metadata.
- `style.css`: the navy/cyan visual design and mobile breakpoints.
- `script.js`: URL analysis, predefined explanations, rendering, and memory-only history.
- `assets/shield.png`: supplied shield image, copied without editing its artwork/background.
- `tests.js`: dependency-free Node test runner for analysis and UI event logic; Node is optional for development tests only.
- `README.md`: operation, limitations, testing, demonstration, and submission guidance.
- `.gitignore`: excludes common local noise and environment files.

The main flow is `submitAnalysis` → `analyzeUrl` → `renderResults` and `renderHistory`. `analyzeUrl` returns data without visiting the URL. `explainCheck` selects predefined wording, and `setMode` changes wording without rechecking or adding history.

## AI's role
AI assisted planning, code development, testing, and explanation. PluQ Lite uses deterministic rules, not live AI threat detection. It supports the theme “Build with AI, Protect What Matters, Innovate with People at the Center.” If PlutoHacks requires AI executing inside the application, confirm that requirement with organizers: this version does not do that.

## Tests
Run `node tests.js` if Node is installed. Tests exercise URL parsing, thresholds, error handling, explanation modes, history, clearing, examples, navigation markup, and blocked network-related APIs using a lightweight DOM substitute. They do not establish visual quality or real-browser accessibility. See TEST_RESULTS.md for the actual verification performed.

For manual browser verification: open index.html; analyze each example; verify hostname, counts, and all four findings; switch modes; click a recent entry; clear history; reload; visit Home/Privacy/About; use Tab and Enter; inspect widths of 375px and 1280px in browser developer tools. In the Network panel, clear the log after initial page load and analyze several URLs: there should be no requests. Check that logo, layout, focus outlines, and wrapping are legible.

## Three-minute live demo
1. Open the site. Explain: “This helps people read a URL before clicking.”
2. Click HTTPS, then Analyze URL. Show example.com and zero warnings; point out this is not a safety guarantee.
3. Click Misleading @, then Analyze URL. Show that untrusted.example is the actual destination, even though trusted.example appears first.
4. Toggle Technical, then Simple. The same findings get different explanations.
5. Try IP address: HTTP and the IP destination produce two warnings.
6. Reanalyze a Recent Check, then Clear history.
7. Point to the phishing tips and Privacy/About. Explain that rules run locally without visiting links or using a live AI model.

Talking points: the browser URL parser separates hostname from login text; four rules produce warnings; predefined explanations keep results understandable; no threat-reputation service or website scanning is involved.

## Screen-recording checklist
- Close unrelated tabs and hide private notifications; reload to clear demo history.
- Set readable browser zoom and check microphone audio with a short recording.
- Record the same sequence above in approximately three minutes, showing the actual product.
- Replay the recording to verify readable results and audible narration; ensure no personal URLs or notifications appear.
- Submit the video link in the format requested by organizers. No slides are needed.

## Separate GitHub submission (requires your approval)
This project has its own local Git repository. No original repository should be changed. Review `git status` and the file list before committing. When ready, create a new empty GitHub repository named `PluQ-Lite` (choose visibility deliberately; do not initialize it with another README). Only after approving remote creation/publishing, connect and push this repository:

```text
git add index.html style.css script.js assets/shield.png README.md .gitignore tests.js TEST_RESULTS.md
git commit -m "Build PluQ Lite local URL checker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/PluQ-Lite.git
git push -u origin main
```

Check the destination repository before pushing. A public website is optional for the local demo. GitHub Pages deployment would be a separate publishing action requiring approval. Verify the event's submission deadline, repository visibility, video requirements, and any runtime-AI requirement directly with organizers.
