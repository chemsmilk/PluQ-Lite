# PluQ Lite

Know the link before the click. A cybersecurity project for the PlutoHacks 2026 Hackathon.

## The problem
Because of the rise of phishing scams, PluQ intends to protect users from this security problem by checking the structure of links before users click on them, making sure they look structurally sound.

## Run
Open `index.html` directly in a modern browser. No installation, backend, package manager, API key, or internet connection is needed. All fonts and assets are local.

## Features and implementation
- HTTPS detection, with an explicit reminder that encryption does not prove legitimacy.
- IPv4 and IPv6 hostname detection using the browser's built-in `URL` parser, including normalized alternative IPv4 notation.
- Nonempty username/password detection. An @ in a path or query is not a credentials warning.
- A documented long-URL heuristic: strictly more than 100 Unicode code points, after trimming surrounding whitespace. This is a readability threshold, not a scientific risk score.
- Actual destination hostname, four explained findings, and a warning count.
- Simple/Technical explanations of identical results.
- Last five successful analyses in JavaScript memory, explicit Analyze again buttons (the displayed URLs are noninteractive text), and Clear history.
- Harmless demonstration inputs, education, Privacy, and About sections.
- Responsive layout, keyboard controls, focus states, and accessible status announcements.

Only explicit HTTP/HTTPS URLs are accepted. Spaces, line breaks, backslashes, missing hosts, invalid ports, and unsupported protocols are rejected. Encoded spaces are allowed. The parser normalizes hostnames (including international names to their ASCII representation). No DNS lookup occurs. Results describe the initial URL, not redirects or final server content.

## Privacy and limitations
The application never requests, opens, previews, or navigates to submitted destinations. Input is rendered with `textContent`, never HTML. CSP blocks network connections and form submissions. There is no analytics, cookie, localStorage, database, or permanent URL history. Reloading clears history. Clear history removes recent entries; the current input and analysis stay visible until replaced or the page is reloaded.

Results are structural observations, not safety verdicts. When all four rules produce no warning, the interface says **“No structural warnings detected”**, using neutral blue information icons rather than green approval checkmarks. A prominent notice above the findings says **“Website safety has not been assessed.”** PluQ Lite does not inspect website content or consult threat intelligence databases. An ordinary-looking HTTPS URL can host harmful content and trigger zero structural warnings; never treat that result as permission to click. Legitimate URLs may trigger warnings. Phishing URLs may trigger none. The app does not inspect reputation, website content, malware, redirects, certificate validity, or ownership. Do not use it as the sole basis for trusting a link. Avoid entering sensitive URLs in a public demonstration or screen recording.

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
AI assisted in code development, explanation, and initial testing.

## Tests
Run `node tests.js` if Node is installed. Tests exercise URL parsing, thresholds, error handling, explanation modes, history, clearing, examples, navigation markup, and blocked network-related APIs using a lightweight DOM substitute. They do not establish visual quality or real-browser accessibility. See TEST_RESULTS.md for the actual verification performed.

For manual browser verification: open index.html; analyze each example; verify hostname, counts, and all four findings; switch modes; click its Analyze again button; clear history; reload; visit Home/Privacy/About; use Tab and Enter; inspect widths of 375px and 1280px in browser developer tools. In the Network panel, clear the log after initial page load and analyze several URLs: there should be no requests. Check that logo, layout, focus outlines, and wrapping are legible.

To submit, provide this repository URL and your recorded demonstration according to the event instructions. For the live demonstration, open index.html locally. GitHub Pages is not enabled by this source-code upload; deploying a public website is a separate action.

For later updates, review changes and test before committing and pushing from this project folder. Verify the event's deadline, repository visibility, video requirements, and any runtime-AI requirement directly with organizers.
