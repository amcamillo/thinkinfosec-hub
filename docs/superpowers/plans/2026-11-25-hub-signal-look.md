# Hub Signal Look Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the ThinkInfoSec hub Signal's visual identity. That means drifting glow bubbles, frosted panels, live readouts, a trace banner when a story has no image, a moving wave under the active tab, and a DM Sans 300 wordmark with magenta in the name.

**Architecture:** This is a static GitHub Pages site with no build step. Pure logic goes in `assets/hub/lib.js` (UMD, unit-tested under Node). DOM building goes in `assets/hub/render.js` (`createElementNS`, never `innerHTML`). Tab behaviour lives in `assets/hub/tabs.js`. All styling, including the animations, lives in `assets/hub.css`. The CSP stays unchanged (`style-src 'self'`, `font-src 'self'`). Inline styles are set only through the CSSOM (`el.style.x = …`), which the CSP allows.

**Tech Stack:** Vanilla JS (classic scripts), CSS, Node 24 `node:test`, and Playwright (Chromium) for smoke tests. The fonts are self-hosted woff2 files: DM Sans 300 and Space Mono 400/700, both under the SIL OFL.

**Spec:** `docs/superpowers/specs/2026-11-25-hub-signal-look-design.md`

**Worktree:** `C:\dev\thinkinfosec-hub-images`, branch `news-images`. The news-images commit `ccca5d7` and the spec commit `d9d53d0` are already on it. The git identity is set repo-local to `AI Assistant <support@thinkinfosec.org>`. Every commit message ends with:
```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

**Running tests** (from `tests/`):
- Unit: `node --test unit/ 2>&1 | grep -E "^ℹ (pass|fail)"`. The baseline is 21 passing.
- Smoke: `NODE_PATH=C:/dev/thinkinfosec-hub-redesign/tests/node_modules node --test smoke/ 2>&1 | grep -E "^ℹ (pass|fail)"`. The baseline is 12 passing. This worktree has no `node_modules`; don't create a junction.

**Hard design rules** (from the owner):
- No grid lines anywhere. No hairline rules between list rows. Depth comes from glow bubbles and frosted panels.
- No pale blue or cyan text on blue backgrounds. In Dark, Cyber labels sitting on a panel use `--panel-kicker` (white) text, and only the `●` dot is teal.
- Every text pair must reach 4.5:1, including over the worst-case "tinted panel" (`--tint`).
- Decorative layers are `aria-hidden="true"` and stop moving under `prefers-reduced-motion: reduce`.

---

## File map

| File | Responsibility | Change |
|---|---|---|
| `assets/fonts/` | DM Sans 300 and Space Mono 400/700 woff2 files, plus their OFL licences | Create |
| `assets/hub.css` | Tokens, `@font-face`, bubbles, glass, pill, readouts, trace banner, tab wave | Modify |
| `index.html` | Bubble layer, masthead (wordmark, pill, date), tab wave markup | Modify |
| `assets/hub/lib.js` | `channel`, `utcTime`, `signalPill` (replaces `signalStatus`), `traceSpec` | Modify |
| `assets/hub/render.js` | `traceBanner`, `traceThumb`, `listening`, channel labels, trace fallbacks | Modify |
| `assets/hub/app.js` | Pill wiring, listening states, trace options | Modify |
| `assets/hub/tabs.js` | `placePulse` for the moving wave | Modify |
| `tests/unit/contrast.test.js` | New tokens and tint pairs | Modify |
| `tests/unit/lib.test.js` | Tests for the new lib functions | Modify |
| `tests/smoke/hub.smoke.test.js` | Smoke checks for the trace, pill, wave, reduced motion and font | Modify |

---

### Task 1: Self-hosted fonts

**Files:**
- Create: `assets/fonts/dm-sans-300.woff2`, `assets/fonts/space-mono-400.woff2`, `assets/fonts/space-mono-700.woff2`, `assets/fonts/OFL-DMSans.txt`, `assets/fonts/OFL-SpaceMono.txt`
- Modify: `assets/hub.css` (top of the file), `tests/smoke/hub.smoke.test.js:10` (MIME map)

- [ ] **Step 1: Download the latin woff2 files and the licences.** Google serves woff2 only to a modern browser user agent. This takes the `/* latin */` block's URL for each face.

```bash
cd /c/dev/thinkinfosec-hub-images && mkdir -p assets/fonts && cd assets/fonts
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
get() { curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=$1&display=swap" | awk '/\/\* latin \*\//{f=1} f&&/url\(/{match($0,/url\([^)]*\)/);print substr($0,RSTART+4,RLENGTH-5);exit}'; }
curl -s -o dm-sans-300.woff2   "$(get 'DM+Sans:wght@300')"
curl -s -o space-mono-400.woff2 "$(get 'Space+Mono:wght@400')"
curl -s -o space-mono-700.woff2 "$(get 'Space+Mono:wght@700')"
curl -s -o OFL-DMSans.txt   https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/OFL.txt
curl -s -o OFL-SpaceMono.txt https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/OFL.txt
for f in *.woff2; do printf '%s ' "$f"; head -c 4 "$f"; echo; done; head -1 OFL-*.txt
```
Expected: each woff2 starts with `wOF2`, each file is 10–60 KB, and each OFL file's first line names the font's copyright.

- [ ] **Step 2: Add the `@font-face` rules** at the very top of `assets/hub.css`, above the comment header.

```css
@font-face { font-family: "DM Sans"; font-weight: 300; font-style: normal; font-display: swap; src: url("fonts/dm-sans-300.woff2") format("woff2"); }
@font-face { font-family: "Space Mono"; font-weight: 400; font-style: normal; font-display: swap; src: url("fonts/space-mono-400.woff2") format("woff2"); }
@font-face { font-family: "Space Mono"; font-weight: 700; font-style: normal; font-display: swap; src: url("fonts/space-mono-700.woff2") format("woff2"); }
```

- [ ] **Step 3: Teach the smoke server woff2.** In `tests/smoke/hub.smoke.test.js`, add `'.woff2': 'font/woff2'` to the `TYPES` map on line 10.

- [ ] **Step 4: Commit.**

```bash
git add assets/fonts assets/hub.css tests/smoke/hub.smoke.test.js
git commit -m "Self-host DM Sans 300 and Space Mono (OFL)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Signal palette tokens and contrast test

**Files:**
- Modify: `tests/unit/contrast.test.js` (the `PAIRS` list)
- Modify: `assets/hub.css` (both `:root[data-theme]` blocks)

- [ ] **Step 1: Write the failing test.** Replace `PAIRS` in `tests/unit/contrast.test.js` with the following, and leave the rest of the file as it is:

```js
const PAIRS = [
  ['ink', 'bg'], ['muted', 'bg'], ['ink', 'panel'], ['muted', 'panel'], ['acc-ink', 'bg'],
  ['mag-ink', 'bg'], ['mag-ink', 'panel'], ['gold-ink', 'bg'], ['panel-kicker', 'panel'], ['on-acc', 'acc'],
  // --tint is the worst case: a glow bubble showing through a frosted panel.
  ['ink', 'tint'], ['muted', 'tint'], ['mag-ink', 'tint'], ['gold-ink', 'tint'], ['panel-kicker', 'tint']
];
```
Also add this after the existing tests:

```js
test('light accent text also clears 4.5:1 on the tint (light allows teal on panels)', () => {
  const t = tokens('light');
  assert.ok(ratio(t['acc-ink'], t.tint) >= 4.5);
});
```

- [ ] **Step 2: Run it and confirm it fails.** Run the unit command. Expected: FAIL with `missing --ink or --tint` for both themes.

- [ ] **Step 3: Replace both token blocks** in `assets/hub.css` (currently lines 4–21 after Task 1's font rules) with:

```css
:root[data-theme="dark"] {
  --bg: #070F1F; --bg2: #0D1F3C; --panel: #0d1f3c; --tint: #1c3a5a; --line: #2f4f86;
  --glass: rgba(13, 31, 60, .62); --glass-bd: rgba(255, 255, 255, .12);
  --ink: #EAF2FA; --muted: #C9D6E6;
  --acc: #00BFCF; --acc-ink: #5fe9f5; --on-acc: #02050b;
  --mag: #FF2D78; --mag-ink: #ff8cc0;
  --gold-ink: #f5c542;
  --panel-kicker: #ffffff;
  --orb-blend: screen; --orb-opacity: .8; --glow: drop-shadow(0 0 6px #00BFCF);
  color-scheme: dark;
}
:root[data-theme="light"] {
  --bg: #F8F4FB; --bg2: #E3F1F8; --panel: #ffffff; --tint: #efe2ee; --line: #d9d3e3;
  --glass: rgba(255, 255, 255, .86); --glass-bd: rgba(18, 36, 74, .10);
  --ink: #12244A; --muted: #3A4D72;
  --acc: #00BFCF; --acc-ink: #036A7C; --on-acc: #12244A;
  --mag: #FF2D78; --mag-ink: #B0125B;
  --gold-ink: #7a4f00;
  --panel-kicker: #036A7C;
  --orb-blend: multiply; --orb-opacity: .7; --glow: none;
  color-scheme: light;
}
```
Update the comment header above them to say: *"Rule: in dark, accent text (--acc-ink) sits only on --bg, never on a panel (no cyan on blue). Labels on panels use --panel-kicker. --tint is the worst-case panel colour with a bubble showing through."*

- [ ] **Step 4: Run it and confirm it passes.** Run the unit command. Expected: `ℹ pass 22`, `ℹ fail 0`. If a pair fails, darken the light foreground or lighten the dark one by one step and re-run. Don't change `--tint`.

- [ ] **Step 5: Commit** with the message `Adopt Signal palette tokens with worst-case tint contrast checks` and the trailer.

---

### Task 3: Glow bubbles, glass surfaces, no rules

**Files:**
- Modify: `index.html` (right after `<body>`)
- Modify: `assets/hub.css`

- [ ] **Step 1: Add the bubble layer** as the first child of `<body>`, before the skip link:

```html
  <div class="orbs" aria-hidden="true"><i class="orb orb-1"></i><i class="orb orb-2"></i><i class="orb orb-3"></i><i class="orb orb-4"></i><i class="orb orb-5"></i></div>
```

- [ ] **Step 2: Add the CSS** after the `* { box-sizing… }` rule. Then change `html, body { background: var(--bg); … }` to `html { background: var(--bg); } body { color: var(--ink); background: radial-gradient(900px 640px at 10% 6%, color-mix(in srgb, var(--mag) 14%, transparent), transparent 62%), radial-gradient(1000px 700px at 92% 14%, color-mix(in srgb, var(--acc) 18%, transparent), transparent 62%), linear-gradient(160deg, var(--bg), var(--bg2)) fixed; isolation: isolate; }`.

```css
.orbs { position: fixed; inset: -12%; z-index: -1; pointer-events: none; filter: blur(70px); mix-blend-mode: var(--orb-blend); opacity: var(--orb-opacity); }
.orb { position: absolute; width: var(--s); height: var(--s); left: var(--l); top: var(--t); border-radius: 50%; background: radial-gradient(circle, var(--c) 0%, transparent 68%); animation: orb-float var(--d) ease-in-out var(--delay, 0s) infinite alternate; will-change: transform; }
.orb-1 { --s: 46vmax; --l: -14%; --t: -6%;  --c: rgba(255, 45, 120, .55); --x: 9vw;   --y: 12vh;  --d: 47s; }
.orb-2 { --s: 50vmax; --l: 62%;  --t: -22%; --c: rgba(0, 191, 207, .60);  --x: -12vw; --y: 9vh;   --d: 61s; --delay: -14s; }
.orb-3 { --s: 42vmax; --l: 70%;  --t: 48%;  --c: rgba(60, 100, 220, .50); --x: -8vw;  --y: -14vh; --d: 53s; --delay: -30s; }
.orb-4 { --s: 44vmax; --l: 30%;  --t: 66%;  --c: rgba(130, 90, 215, .42); --x: 14vw;  --y: -8vh;  --d: 67s; --delay: -8s; }
.orb-5 { --s: 38vmax; --l: -10%; --t: 56%;  --c: rgba(0, 191, 207, .45);  --x: 10vw;  --y: -12vh; --d: 58s; --delay: -40s; }
@keyframes orb-float {
  50%  { transform: translate(var(--x), var(--y)) scale(1.25); }
  100% { transform: translate(calc(var(--x) * -.7), calc(var(--y) * .8)) scale(.9); }
}
.glass, .card, .band, .wire, .search input, .listening { background: var(--glass); border: 1px solid var(--glass-bd); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass, .card, .band, .wire, .search input, .listening { background: var(--panel); }
}
```

- [ ] **Step 3: Remove the rules and lines.** Edit these existing rules in `assets/hub.css`:
  - `.masthead`: `background: var(--glass); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);` and remove `border-bottom`.
  - `.wire`: add `padding: 14px 16px; border-radius: 12px;`.
  - `.wire li, .news-list li`: remove `border-top: 1px solid var(--line);`.
  - `.results-list li`: remove `border-top`.
  - `.card`: remove `border-top: 3px solid var(--acc);`, change `border-radius` to `12px`, and remove the `background` and `border` declarations (`.glass` supplies them). Delete the `.card.accent-mag { border-top-color… }` rule.
  - `.band`: remove `background` and `border` (keep `border-left: 4px solid var(--acc)`, the colour block), and change `border-radius` to `12px`.
  - `.site-foot`: remove `border-top`.
  - `.lead-art`: remove `border: 1px solid var(--line);` and replace the gradient `background` with `background: linear-gradient(160deg, #070F1F, #0D1F3C); isolation: isolate;`. Change `border-radius` to `12px`.

- [ ] **Step 4: Extend the reduced-motion rule.** Replace the last line of `hub.css` with:

```css
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; scroll-behavior: auto !important; }
  .orb, .trace-orb, .pill .dot, .wave-base path, .wave-pulse path, .listening path { animation: none !important; }
}
```

- [ ] **Step 5: Check it.**
  - Run the unit command. Expected: 22 pass.
  - Run the smoke command. Expected: 12 pass (no behaviour changed).
  - `grep -n "border-top" assets/hub.css` should print nothing.

- [ ] **Step 6: Commit** with the message `Signal glow bubbles and frosted panels; drop divider rules` and the trailer.

---

### Task 4: Wordmark, readout type and Dark lane labels

**Files:**
- Modify: `index.html:17` (brand link), `assets/hub.css`

- [ ] **Step 1: Wordmark markup.** It stays `<a class="brand" href="#front">Think<span>InfoSec</span> <small>Hub</small></a>`; no change is needed.

- [ ] **Step 2: Wordmark CSS.** Replace the three `.brand` rules with:

```css
.brand { font-family: "DM Sans", -apple-system, "Segoe UI", sans-serif; font-weight: 300; font-size: 1.9rem; letter-spacing: -0.01em; text-decoration: none; }
.brand span { color: var(--mag-ink); }
.brand small { font-size: 0.6em; letter-spacing: 0.04em; color: var(--muted); }
```

- [ ] **Step 3: Readout type.** Add `--mono: "Space Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;` to a `:root` rule placed just after the token blocks. Then:

```css
.mono, .kicker, .meta, .dateline, .num, .pill { font-family: var(--mono); letter-spacing: 0.06em; }
.kicker { font-weight: 700; }
.kicker[class*="lane-"]::before { content: "● "; }
.lane-cyber::before { color: var(--acc); }
.lane-ai::before { color: var(--mag); }
.lane-geo::before { color: var(--gold-ink); }
/* No cyan on blue: in dark, Cyber labels on panels are white and only the dot is teal. */
:root[data-theme="dark"] :is(.wire, .card, .glass, .news-list) .lane-cyber { color: var(--panel-kicker); }
```
Also change the existing `.card .kicker, .band .kicker { color: var(--panel-kicker); }` to `.card .kicker:not([class*="lane-"]), .band .kicker { color: var(--panel-kicker); }`.

- [ ] **Step 4: Add a contrast regression test** to `tests/unit/contrast.test.js`:

```js
test('css keeps dark cyber labels on panels white', () => {
  assert.match(css, /:root\[data-theme="dark"\][^{]*\.lane-cyber\s*\{\s*color:\s*var\(--panel-kicker\)/);
});
test('wordmark uses DM Sans 300 with magenta InfoSec', () => {
  assert.match(css, /\.brand\s*\{[^}]*"DM Sans"[^}]*font-weight:\s*300/);
  assert.match(css, /\.brand span\s*\{\s*color:\s*var\(--mag-ink\)/);
});
```
Run the unit command. Expected: 24 pass.

- [ ] **Step 5: Commit** with the message `DM Sans 300 wordmark with magenta, Space Mono readouts` and the trailer.

---

### Task 5: Signal live pill

**Files:**
- Modify: `assets/hub/lib.js` (replace `signalStatus` and export `signalPill`)
- Modify: `tests/unit/lib.test.js:162-166`
- Modify: `index.html` (masthead), `assets/hub/app.js`, `assets/hub.css`, `tests/smoke/hub.smoke.test.js` (the `#dateline` waits and asserts)

- [ ] **Step 1: Write the failing test.** Replace the `signalStatus` test in `tests/unit/lib.test.js` with:

```js
test('signalPill', () => {
  assert.deepEqual(L.signalPill({ data: null }, NOW, 0), { state: 'none', label: 'NO SIGNAL', detail: '' });
  assert.deepEqual(L.signalPill({ data: { generated: '2026-11-25T11:56:00Z' }, cached: false }, NOW, 93),
    { state: 'live', label: 'SIGNAL LIVE', detail: '93 STORIES · 4M AGO' });
  assert.deepEqual(L.signalPill({ data: { generated: '2026-11-25T11:59:50Z' }, cached: false }, NOW, 1),
    { state: 'live', label: 'SIGNAL LIVE', detail: '1 STORY · JUST NOW' });
  assert.deepEqual(L.signalPill({ data: { generated: '2026-11-25T11:00:00Z' }, cached: true }, NOW, 5, 'UTC'),
    { state: 'snapshot', label: 'SIGNAL SNAPSHOT', detail: '25 NOV, 11:00' });
  assert.deepEqual(L.signalPill({ data: { generated: 'bad' }, cached: false }, NOW, 2),
    { state: 'live', label: 'SIGNAL LIVE', detail: '2 STORIES' });
});
```
Run the unit command. Expected: FAIL, `L.signalPill is not a function`.

- [ ] **Step 2: Implement.** In `assets/hub/lib.js`, replace the whole `signalStatus` function with the code below. In the export list, replace `signalStatus` with `signalPill`.

```js
  function signalPill(res, now, count, tz) {
    if (!res || !res.data) return { state: 'none', label: 'NO SIGNAL', detail: '' };
    const gen = Date.parse(res.data.generated);
    if (res.cached) return { state: 'snapshot', label: 'SIGNAL SNAPSHOT', detail: Number.isFinite(gen) ? formatTime(gen, tz).toUpperCase() : '' };
    const stories = count + (count === 1 ? ' STORY' : ' STORIES');
    if (!Number.isFinite(gen)) return { state: 'live', label: 'SIGNAL LIVE', detail: stories };
    const ago = timeAgo(gen, now);
    return { state: 'live', label: 'SIGNAL LIVE', detail: stories + ' · ' + (ago === 'just now' ? 'JUST NOW' : ago.toUpperCase() + ' AGO') };
  }
```
Run the unit command. Expected: 24 pass. If `grep -rn signalStatus assets tests` finds anything, those are leftovers to fix in Step 4.

- [ ] **Step 3: Masthead markup.** In `index.html`, change the masthead so the date sits under the brand and the pill sits beside the theme toggle:

```html
    <div class="wrap masthead-row">
      <div>
        <a class="brand" href="#front">Think<span>InfoSec</span> <small>Hub</small></a>
        <p class="dateline" id="dateline"></p>
      </div>
      <div class="masthead-tools">
        <p class="pill" id="signalPill" data-state="none"><span class="dot" aria-hidden="true"></span><span id="pillText" aria-live="polite">LISTENING FOR SIGNAL</span></p>
        <div class="theme-toggle" role="group" aria-label="Colour theme">
          <button type="button" data-theme-set="dark" aria-pressed="false">Dark</button>
          <button type="button" data-theme-set="light" aria-pressed="true">Light</button>
        </div>
      </div>
    </div>
```
Delete the old `<p class="wrap dateline" id="dateline" aria-live="polite"></p>` line.

- [ ] **Step 4: Wiring.** In `assets/hub/app.js`:
  - Replace `$('dateline').textContent = L.formatDay(now) + ' · Loading Signal…';` with `$('dateline').textContent = L.formatDay(now).toUpperCase();`.
  - Replace `$('dateline').textContent = L.formatDay(now) + ' · ' + L.signalStatus(newsRes, now);` with `R.pill($('signalPill'), L.signalPill(newsRes, now, news.length));`.
  - In the `catch`, replace the dateline line with `R.pill($('signalPill'), L.signalPill(null, now, 0));`.

  In `assets/hub/render.js`, add `pill` and export it:

```js
  function pill(node, p) {
    node.dataset.state = p.state;
    node.querySelector('#pillText').textContent = p.detail ? p.label + ' · ' + p.detail : p.label;
  }
```

- [ ] **Step 5: Pill CSS:**

```css
.masthead-tools { display: flex; align-items: center; gap: 10px; }
.pill { display: flex; align-items: center; gap: 8px; margin: 0; padding: 6px 12px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; color: var(--ink); background: var(--glass); border: 1px solid var(--glass-bd); }
.pill .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--muted); flex: none; }
.pill[data-state="live"] .dot { background: var(--acc); box-shadow: 0 0 0 3px color-mix(in srgb, var(--acc) 25%, transparent), 0 0 12px var(--acc); animation: pill-pulse 2.4s ease-in-out infinite; }
@keyframes pill-pulse { 50% { box-shadow: 0 0 0 6px transparent, 0 0 18px var(--acc); } }
.dateline { font-size: 0.72rem; margin: 2px 0 8px; }
@media (max-width: 760px) { .masthead-tools { flex-direction: column; align-items: flex-end; gap: 6px; } .pill { font-size: 0.62rem; padding: 4px 10px; } }
```
On phones the pill stays visible and stacks above the theme toggle. Don't hide it: it carries the `aria-live` status.

- [ ] **Step 6: Update the smoke tests.** In `tests/smoke/hub.smoke.test.js`:
  - Replace every `waitForFunction(() => /Signal (updated|snapshot|unavailable)/.test(document.getElementById('dateline').textContent))` with `waitForFunction(() => document.getElementById('signalPill').dataset.state !== 'none' || /NO SIGNAL/.test(document.getElementById('pillText').textContent))`.
  - Replace `/Signal unavailable/` with `/NO SIGNAL/`.
  - Replace `/Signal snapshot from/` with `/SIGNAL SNAPSHOT/`. Use `page.textContent('#pillText')` for each.
  - Add an assertion in the first happy-path test: `assert.equal(await page.getAttribute('#signalPill', 'data-state'), 'live');`.

- [ ] **Step 7: Run both suites.** Expected: unit 24 pass, smoke 12 pass.

- [ ] **Step 8: Commit** with the message `Signal live pill replaces the status dateline` and the trailer.

---

### Task 6: Channel numbers and UTC readout helpers

**Files:**
- Modify: `assets/hub/lib.js`, `tests/unit/lib.test.js`, `assets/hub/render.js` (`headlineRow`)

- [ ] **Step 1: Failing tests.** Append to `tests/unit/lib.test.js`:

```js
test('channel', () => {
  assert.equal(L.channel(1), 'CH-01');
  assert.equal(L.channel(12), 'CH-12');
});
test('utcTime', () => {
  assert.equal(L.utcTime(Date.parse('2026-11-25T14:32:09Z')), '14:32 UTC');
  assert.equal(L.utcTime(Date.parse('2026-11-25T03:05:00Z')), '03:05 UTC');
});
```
Run them. Expected: FAIL, not a function.

- [ ] **Step 2: Implement** in `lib.js` and add both to the exports:

```js
  function channel(n) { return 'CH-' + String(n).padStart(2, '0'); }
  function utcTime(ts) { const d = new Date(ts); return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ' UTC'; }
```

- [ ] **Step 3: Use it in the rows.** In `render.js` `headlineRow`, replace `el('span', 'num', String(index + 1).padStart(2, '0'))` with `el('span', 'num', L.channel(index + 1))`. In `hub.css`, change `.wire li, .news-list li { grid-template-columns: 2.2em 1fr; … }` to `grid-template-columns: 4.2em 1fr;`. Make the matching changes to `.news-list li.has-thumb` (`4.2em 1fr 96px`) and to its 480px media rule (`4.2em 1fr 64px`). Add `.num { font-size: 0.72rem; padding-top: 3px; }` and change the existing `.num` rule's `font-weight: 800` to `700`.

- [ ] **Step 4: Run both suites.** Expected: unit 26 pass. Smoke: 12 pass, unless a smoke assertion reads row numbers. If one checks `01`/`02`, update it to `CH-01`/`CH-02`.

- [ ] **Step 5: Commit** with the message `Channel numbers on wire and News rows` and the trailer.

---

### Task 7: `traceSpec`, the deterministic lane trace

**Files:**
- Modify: `assets/hub/lib.js`, `tests/unit/lib.test.js`

- [ ] **Step 1: Failing tests.** Append to `tests/unit/lib.test.js`:

```js
test('traceSpec is deterministic per title and differs between titles', () => {
  const a = L.traceSpec({ title: 'Ransomware hits hospitals', cat: 'cyber' });
  assert.deepEqual(L.traceSpec({ title: 'Ransomware hits hospitals', cat: 'cyber' }), a);
  assert.notEqual(L.traceSpec({ title: 'Different story', cat: 'cyber' }).d, a.d);
});
test('traceSpec shapes follow the lane', () => {
  const cyber = L.traceSpec({ title: 't', cat: 'cyber' });
  const ai = L.traceSpec({ title: 't', cat: 'ai' });
  const geo = L.traceSpec({ title: 't', cat: 'geo' });
  assert.match(cyber.d, /^M[\d. ]+C/);
  assert.match(ai.d, /^M[\d. ]+C/);
  assert.match(geo.d, /^M[\d. ]+(L[\d. ]+)+$/);
  assert.notEqual(cyber.d, ai.d);
  assert.equal(cyber.color, '#5fe9f5'); assert.equal(ai.color, '#ff8cc0'); assert.equal(geo.color, '#f5c542');
});
test('traceSpec stays inside the plate and marks the highest peak', () => {
  for (const cat of ['cyber', 'ai', 'geo', 'unknown']) {
    const s = L.traceSpec({ title: 'Bounds check ' + cat, cat }, 640, 240);
    const nums = s.d.match(/-?[\d.]+/g).map(Number);
    for (let i = 0; i < nums.length; i += 2) {
      assert.ok(nums[i] >= 0 && nums[i] <= 640, cat + ' x out of bounds: ' + nums[i]);
      assert.ok(nums[i + 1] >= 8 && nums[i + 1] <= 232, cat + ' y out of bounds: ' + nums[i + 1]);
    }
    assert.equal(s.peak.y, Math.min(...s.points.map(p => p.y)));
    assert.equal(s.orbs.length, 3);
  }
});
```
Run them. Expected: FAIL, not a function.

- [ ] **Step 2: Implement** in `lib.js`, above `return {`, and export `traceSpec`:

```js
  // Signal trace for stories without an image: a lane-shaped line, seeded by the title so every story differs.
  const TRACE_COLORS = { cyber: ['#5fe9f5', '#00BFCF'], ai: ['#ff8cc0', '#FF2D78'], geo: ['#f5c542', '#f5c542'] };
  const ORB_COLORS = ['rgba(0,191,207,.65)', 'rgba(255,45,120,.45)', 'rgba(76,141,224,.5)', 'rgba(130,90,215,.45)'];
  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return function () { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function traceSpec(item, w, h) {
    w = w || 640; h = h || 240;
    const cat = TRACE_COLORS[item && item.cat] ? item.cat : 'cyber';
    const r = rng(seedOf((item && item.title) || ''));
    const base = h * 0.55, lo = 8, hi = h - 8;
    const clampY = y => Math.min(hi, Math.max(lo, y));
    const r1 = v => Math.round(v * 10) / 10;
    let pts = [];
    if (cat === 'cyber') {
      const n = 16, spikeA = 4 + Math.floor(r() * 4), spikeB = spikeA + 2 + Math.floor(r() * 4);
      for (let i = 0; i < n; i++) {
        let y = base + (r() - 0.5) * 16;
        if (i === spikeA) y = base - (55 + r() * 35);
        if (i === spikeA + 1) y = base + (40 + r() * 30);
        if (i === spikeB) y = base - (30 + r() * 30);
        pts.push({ x: (w * i) / (n - 1), y: clampY(y) });
      }
    } else if (cat === 'ai') {
      const n = 24, amp = 25 + r() * 20, freq = 1.5 + r() * 1.5, phase = r() * Math.PI * 2;
      for (let i = 0; i < n; i++) {
        const x = (w * i) / (n - 1);
        pts.push({ x, y: clampY(base + amp * Math.sin((2 * Math.PI * freq * x) / w + phase)) });
      }
    } else {
      const steps = 6;
      let x = 0;
      for (let s = 0; s < steps; s++) {
        const y = clampY(base + (r() - 0.5) * 90);
        const nx = s === steps - 1 ? w : x + w / steps;
        pts.push({ x, y }, { x: nx, y });
        x = nx;
      }
    }
    pts = pts.map(p => ({ x: r1(Math.min(w, Math.max(0, p.x))), y: r1(p.y) }));
    let d = 'M' + pts[0].x + ' ' + pts[0].y;
    if (cat === 'geo') {
      for (let i = 1; i < pts.length; i++) d += ' L' + pts[i].x + ' ' + pts[i].y;
    } else {
      // Catmull-Rom to cubic Bezier, control points clamped into the plate.
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        const c1x = r1(Math.min(w, Math.max(0, p1.x + (p2.x - p0.x) / 6))), c1y = r1(clampY(p1.y + (p2.y - p0.y) / 6));
        const c2x = r1(Math.min(w, Math.max(0, p2.x - (p3.x - p1.x) / 6))), c2y = r1(clampY(p2.y - (p3.y - p1.y) / 6));
        d += ' C' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + p2.x + ' ' + p2.y;
      }
    }
    const peak = pts.reduce((a, b) => (b.y < a.y ? b : a));
    const orbs = [0, 1, 2].map(() => ({ x: r1(r() * 100), y: r1(r() * 100), size: r1(40 + r() * 25), color: ORB_COLORS[Math.floor(r() * ORB_COLORS.length)] }));
    return { cat, d, points: pts, peak, color: TRACE_COLORS[cat][0], glow: TRACE_COLORS[cat][1], orbs };
  }
```

- [ ] **Step 3: Run the tests.** Expected: unit 29 pass.

- [ ] **Step 4: Commit** with the message `traceSpec: deterministic lane-shaped Signal trace` and the trailer.

---

### Task 8: Trace banner, trace thumbnails and the lead fallback

**Files:**
- Modify: `assets/hub/render.js` (`lead`, `card`, `headlineRow`, new `traceBanner`/`traceThumb`, exports)
- Modify: `assets/hub/app.js` (pass the trace options), `assets/hub.css`
- Modify: `tests/smoke/hub.smoke.test.js`

- [ ] **Step 1: Failing smoke tests.** Add these to `tests/smoke/hub.smoke.test.js`. They reuse the existing `open()` and `feeds()` helpers; read the first tests in the file to match how a page is opened and closed.

```js
test('lead shows the Signal trace behind the image, and keeps it when the image 404s', async () => {
  const { page, context } = await open('#front');
  await page.waitForSelector('#leadStory .trace-banner svg path');
  assert.ok(await page.$('#leadStory .trace-banner .trace-readout'));
  assert.match(await page.textContent('#leadStory .trace-readout'), /CYBER · CH-01 · \d\d:\d\d UTC/);
  await context.close();
});
test('cards without images get a mini trace', async () => {
  const { page, context } = await open('#front');
  await page.waitForSelector('#latestRail .card .trace-thumb svg');
  await context.close();
});
test('News rows without an image get a mini trace thumb', async () => {
  const { page, context } = await open('#news');
  await page.waitForSelector('#newsList li.has-thumb .trace-thumb');
  await context.close();
});
```
Run the smoke command. Expected: the 3 new tests FAIL (timeout waiting for the selector).

- [ ] **Step 2: Implement the SVG builders** in `render.js`, after `pic`:

```js
  const SVG = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) { const n = document.createElementNS(SVG, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; }
  function traceSvg(spec, w, h, marker) {
    const svg = svgEl('svg', { viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' });
    const path = svgEl('path', { d: spec.d, fill: 'none', stroke: spec.color, 'stroke-width': w > 300 ? '2.6' : '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'trace-line' });
    path.style.setProperty('--trace-glow', spec.glow);
    svg.append(path);
    if (marker) svg.append(svgEl('circle', { cx: spec.peak.x, cy: spec.peak.y, r: '5', fill: '#fff', class: 'trace-line' }));
    return svg;
  }
  function orbLayer(spec) {
    const layer = el('div', 'trace-orbs');
    spec.orbs.forEach(o => {
      const i = el('i', 'trace-orb');
      i.style.left = o.x + '%'; i.style.top = o.y + '%'; i.style.width = o.size + '%'; i.style.setProperty('--c', o.color);
      layer.append(i);
    });
    return layer;
  }
  function traceBanner(item) {
    const spec = L.traceSpec(item, 640, 240);
    const box = el('div', 'trace-banner');
    box.setAttribute('aria-hidden', 'true');
    const mark = el('span', 'trace-mark');
    mark.append('Think', el('b', null, 'InfoSec'), ' Signal');
    const readout = el('span', 'trace-readout');
    readout.append(el('b', 'lane-' + spec.cat, L.LANES[spec.cat].toUpperCase()), ' · ' + L.channel(1) + ' · ' + L.utcTime(item.ts));
    box.append(orbLayer(spec), traceSvg(spec, 640, 240, true), mark, readout);
    if (item.source) box.append(el('span', 'trace-src', item.source));
    return box;
  }
  function traceThumb(item, cls) {
    const spec = L.traceSpec(item, 200, 60);
    const box = el('div', 'trace-thumb ' + (cls || ''));
    box.setAttribute('aria-hidden', 'true');
    box.append(orbLayer(spec), traceSvg(spec, 200, 60, false));
    return box;
  }
```

- [ ] **Step 3: Use them.**
  - In `lead()`, replace the `art.setAttribute('aria-hidden', 'true');` line and everything after it that adds the image, up to (not including) `const h = el('h3');`, with:

```js
    art.setAttribute('aria-hidden', 'true');
    art.append(traceBanner(item));
    if (item.image) art.append(pic(item.image, 'lead-img', false));
```
  The image sits above the banner. If it fails to load, `pic` removes it and the trace shows.

  - In `headlineRow`, replace the `if (opts && opts.thumb && item.image) {…}` block with:

```js
    if (opts && opts.thumb) {
      li.classList.add('has-thumb');
      li.append(item.image ? pic(item.image, 'row-thumb', true) : traceThumb(item, 'row-thumb'));
    }
```
  - Change `card(item, kicker, accent)` to `card(item, kicker, accent, opts)`. Replace its thumbnail block with the code below:

```js
    const thumb = L.safeUrl(item.thumb);
    if (thumb) c.append(pic(thumb, 'thumb', true));
    else if (opts && opts.trace) c.append(traceThumb({ title: item.title, cat: accent === 'mag' ? 'ai' : 'cyber' }, 'thumb'));
```
  - Export `traceBanner` and `traceThumb`.

- [ ] **Step 4: Pass the options** in `app.js`:
  - `renderResearch`: `R.card(r, …, r.source === 'medium' ? 'mag' : null, { trace: true })`.
  - `renderGuides`: `R.card(g, L.GUIDE_GROUPS[g.group], null, { trace: true })`.
  - In `renderFront`, the rail: `R.card(Object.assign({}, x[1], { summary: '' }), x[0], x[2], { trace: true })`. Drop `thumb: null` so YouTube keeps its real thumbnail.

- [ ] **Step 5: CSS.** Add after `.lead-img`:

```css
.trace-banner, .trace-thumb { position: absolute; inset: 0; overflow: hidden; isolation: isolate; color: #EAF2FA; background: linear-gradient(160deg, #070F1F, #0D1F3C); }
.trace-thumb { position: relative; display: block; }
.trace-thumb.row-thumb { width: 96px; height: 64px; border-radius: 6px; border: 0; }
.trace-thumb.thumb { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; margin-bottom: 6px; }
.trace-banner svg, .trace-thumb svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.trace-line { filter: drop-shadow(0 0 7px var(--trace-glow, #00BFCF)); }
.trace-orbs { position: absolute; inset: -20%; z-index: -1; filter: blur(30px); mix-blend-mode: screen; }
.trace-orb { position: absolute; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, var(--c) 0%, transparent 68%); animation: orb-float 24s ease-in-out infinite alternate; --x: 3%; --y: 4%; }
.trace-mark { position: absolute; left: 14px; top: 11px; font: 300 0.9rem "DM Sans", sans-serif; }
.trace-mark b { font-weight: 300; color: #ff8cc0; }
.trace-src { position: absolute; right: 14px; top: 11px; font: 700 0.68rem var(--mono); padding: 3px 9px; border-radius: 999px; background: rgba(255, 255, 255, .12); }
.trace-readout { position: absolute; left: 14px; bottom: 10px; font: 700 0.68rem var(--mono); letter-spacing: .08em; color: #EAF2FA; }
.trace-readout b { color: #EAF2FA; font-weight: 700; }
.trace-readout b::before { content: "● "; }
@media (max-width: 480px) { .trace-thumb.row-thumb { width: 64px; height: 48px; } }
```
The banner text is white (#EAF2FA) on navy, and only the `●` dot takes the lane colour, so there's no cyan text on the blue plate.

- [ ] **Step 6: Run both suites.**
  - Expected: unit 29 pass, smoke 15 pass.
  - The existing "lead img removed on error and `.lead-art` kept" test must still pass.
  - If an older test asserted that News rows *without* images have no thumb, update it: such rows now show a `.trace-thumb` and must not contain an `img`.

- [ ] **Step 7: Commit** with the message `Signal trace banner and mini trace thumbnails` and the trailer.

---

### Task 9: "Listening for signal" states

**Files:**
- Modify: `assets/hub/render.js` (`listening`, `lead`), `assets/hub/app.js`, `assets/hub.css`, `tests/smoke/hub.smoke.test.js`

- [ ] **Step 1: Failing smoke test.** Add:

```js
test('feed-dependent empty states say Listening for signal', async () => {
  const { page, context } = await open('#front', { feeds: 'down' });
  await page.waitForFunction(() => /LISTENING FOR SIGNAL/.test(document.getElementById('liveWire').textContent));
  assert.match(await page.textContent('#leadStory'), /LISTENING FOR SIGNAL/);
  await context.close();
});
```
Check how the existing "down" test passes the feed mode to `open()`, and use the same option name. Run it. Expected: FAIL.

- [ ] **Step 2: Implement** in `render.js` and export `listening`:

```js
  function listening(node, message) {
    const box = el('div', 'listening');
    const svg = svgEl('svg', { viewBox: '0 0 120 22', 'aria-hidden': 'true', focusable: 'false' });
    svg.append(svgEl('path', { d: 'M0 11 C20 11 30 11 46 11 C52 11 54 6 60 6 C66 6 68 16 74 16 C80 16 84 11 92 11 C104 11 112 11 120 11', fill: 'none', stroke: '#00BFCF', 'stroke-width': '2', 'stroke-linecap': 'round' }));
    box.append(svg, el('span', 'mono', 'LISTENING FOR SIGNAL… ' + message));
    node.replaceChildren(box);
  }
```
In `lead()`, replace `return setEmpty(node, 'Headlines appear here when Signal is reachable.');` with `return listening(node, 'headlines appear here when Signal is reachable');`.

- [ ] **Step 3: Use it in `app.js`.** `R.list` accepts a string as its empty message. Add an empty-renderer variant to `render.js`, so callers can pass a function:

```js
  function list(node, items, make, empty) {
    if (!items.length) return typeof empty === 'function' ? empty(node) : setEmpty(node, empty);
    node.replaceChildren(...items.map(make));
  }
```
Then in `app.js`:
  - `renderNews`: empty → `n => R.listening(n, 'no headlines in this lane yet')`.
  - `renderFront` wire: `n => R.listening(n, 'waiting for the wire')`.
  - `renderVideos`: `n => R.listening(n, 'videos appear when the feed is reachable')`.

- [ ] **Step 4: CSS:**

```css
.listening { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; color: var(--muted); font-size: 0.78rem; }
.listening svg { width: 120px; height: 22px; flex: none; filter: var(--glow); }
.listening path { transform-origin: 50% 50%; animation: wave-ripple 1.8s ease-in-out infinite alternate; }
```
(`wave-ripple` is defined in Task 10. Until then the path is static, which is fine.)

- [ ] **Step 5: Run both suites.** Expected: unit 29, smoke 16. Update any old assertion on `'Waiting for Signal.'` or `'No headlines right now.'` to `/LISTENING FOR SIGNAL/`.

- [ ] **Step 6: Commit** with the message `Listening for signal empty and offline states` and the trailer.

---

### Task 10: Moving wave under the active tab

**Files:**
- Modify: `index.html` (inside the `<nav>`, after the tablist), `assets/hub/tabs.js`, `assets/hub.css`, `tests/smoke/hub.smoke.test.js`

- [ ] **Step 1: Failing smoke tests:**

```js
test('wave pulse moves under the selected tab', async () => {
  const { page, context } = await open('#front');
  await page.waitForSelector('.wave-pulse');
  const before = await page.$eval('.wave-pulse', n => n.style.transform);
  await page.click('#tab-tools');
  await page.waitForFunction(b => document.querySelector('.wave-pulse').style.transform !== b, before);
  const box = await page.$eval('#tab-tools', t => { const r = t.getBoundingClientRect(); return r.left + r.width / 2; });
  const pulse = await page.$eval('.wave-pulse', n => { const m = /translateX\(([-\d.]+)px\)/.exec(n.style.transform); return Number(m[1]) + 120 + n.parentElement.getBoundingClientRect().left; });
  assert.ok(Math.abs(pulse - box) < 2, `pulse centre ${pulse} vs tab centre ${box}`);
  await context.close();
});
test('reduced motion stops the bubbles and waves', async () => {
  const { page, context } = await open('#front');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const running = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => a.effect.target.className.baseVal ?? a.effect.target.className));
  assert.deepEqual(running, []);
  await context.close();
});
test('wordmark font is loaded', async () => {
  const { page, context } = await open('#front');
  await page.evaluate(() => document.fonts.ready);
  assert.ok(await page.evaluate(() => document.fonts.check('300 16px "DM Sans"')));
  await context.close();
});
```
Run them. Expected: the first FAILS (no `.wave-pulse`). The reduced-motion test may already pass; it guards the next steps.

- [ ] **Step 2: Markup.** In `index.html`, right after the closing `</div>` of `.tabs`, still inside `<nav>`:

```html
      <div class="tab-wave" aria-hidden="true">
        <svg class="wave-base" viewBox="0 0 840 22" preserveAspectRatio="none" focusable="false"><path d="M0 12 C40 10 80 14 120 12 S200 10 240 12 S320 14 360 12 S440 10 480 12 S560 14 600 12 S680 10 720 12 S800 14 840 12 S920 10 960 12"/></svg>
        <svg class="wave-pulse" viewBox="0 0 240 22" focusable="false"><defs><linearGradient id="wavePulseGrad" x1="0" x2="1"><stop offset="0" stop-color="#00BFCF" stop-opacity="0"/><stop offset=".5" stop-color="#00BFCF"/><stop offset="1" stop-color="#FF2D78" stop-opacity="0"/></linearGradient></defs><path d="M0 12 C30 12 60 12 80 12 C92 12 96 4 108 4 C120 4 120 20 132 20 C144 20 148 8 160 12 C180 12 210 12 240 12"/></svg>
      </div>
```

- [ ] **Step 3: CSS.** Replace the two `.tabs [role="tab"]` rules with:

```css
.tabs [role="tab"] { background: none; border: 0; color: var(--muted); font: inherit; font-weight: 600; padding: 10px 12px; white-space: nowrap; cursor: pointer; }
.tabs [role="tab"][aria-selected="true"] { color: var(--ink); font-weight: 700; }
.tab-wave { position: relative; height: 22px; overflow: hidden; }
.tab-wave svg { position: absolute; top: 0; left: 0; height: 22px; }
.wave-base { width: calc(100% + 120px); }
.wave-base path { fill: none; stroke: #4C8DE0; stroke-opacity: .4; stroke-width: 1.5; animation: wave-drift 6s ease-in-out infinite alternate; }
.wave-pulse { width: 240px; transition: transform .7s cubic-bezier(.65, 0, .35, 1); filter: var(--glow); }
.wave-pulse path { fill: none; stroke: url(#wavePulseGrad); stroke-width: 2.4; stroke-linecap: round; transform-origin: 50% 55%; animation: wave-ripple 1.8s ease-in-out infinite alternate; }
@keyframes wave-drift { to { transform: translateX(-120px); } }
@keyframes wave-ripple { from { transform: scaleY(.55); } to { transform: scaleY(1.15); } }
```
The pulse's visual centre is at x = 120 of its 240-wide viewBox.

- [ ] **Step 4: `placePulse`** in `assets/hub/tabs.js`. Add it after the `tabs`/`ids` constants:

```js
  const tablist = document.querySelector('[role="tablist"]');
  const pulse = document.querySelector('.wave-pulse');
  function placePulse() {
    const on = tabs.find(t => t.getAttribute('aria-selected') === 'true');
    if (!pulse || !on) return;
    const x = on.offsetLeft - tablist.scrollLeft + on.offsetWidth / 2 - 120;
    pulse.style.transform = 'translateX(' + Math.round(x) + 'px)';
  }
```
Call `placePulse()` as the last line of `select()`. After the `select(initial, false);` line, add:

```js
  window.addEventListener('resize', placePulse);
  tablist.addEventListener('scroll', placePulse, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePulse);
```
Also add `placePulse` to `root.HubTabs`.

If `offsetLeft` is relative to a different offset parent than `.tab-wave`, add `position: relative` to `.tabs` and `nav`, so both measure from the same box. The smoke test checks alignment to within 2 px.

- [ ] **Step 5: Run both suites.** Expected: unit 29, smoke 19.

- [ ] **Step 6: Commit** with the message `Moving signal wave under the active tab` and the trailer.

---

### Task 11: Screenshots, README and final review

**Files:**
- Modify: `README.md` (front page section), `docs/superpowers/specs/2026-11-25-hub-signal-look-design.md` (status line only)

- [ ] **Step 1: Screenshots.** Use a throwaway Node script in the scratchpad, not committed. It starts the same static server pattern as the smoke test, routes `https://thinkinfosec.github.io/Signal/*` to `tests/fixtures`, and saves:
  - `tests/artifacts/look-light-1280.png`
  - `tests/artifacts/look-dark-1280.png`
  - `tests/artifacts/look-light-390.png`
  - `tests/artifacts/look-dark-390.png`

  To get dark, set `localStorage['hub-theme']='dark'` with an init script. Wait for `document.fonts.ready`. Use `reducedMotion: 'reduce'` so the frames are stable. Look at each image once and check:
  - no grid lines or divider rules
  - the wordmark is light weight with magenta InfoSec
  - the trace banner is on the lead when it has no image
  - no cyan text on navy panels in Dark
  - the wave pulse sits under "Front page"
  - nothing overflows at 390

- [ ] **Step 2: README.** Under the front page section, add one paragraph covering:
  - the Signal look (bubbles, frosted panels, live pill, trace banner, tab wave)
  - fonts self-hosted under `assets/fonts` (OFL)
  - all motion stops under reduced motion

- [ ] **Step 3: Spec status.** Change `Status: approved in browser mockups, awaiting spec review.` to `Status: implemented on branch news-images.`

- [ ] **Step 4: Final full run of both suites.** Expected: unit 29, smoke 19, 0 fail.

- [ ] **Step 5: Commit** with the message `Document the Signal look` and the trailer. Do not push. Pushing and opening PRs need the owner's explicit yes.

---

## Self-review notes

- **Spec coverage:**
  - §1 is already built.
  - §2 is covered by Tasks 7 and 8.
  - §3: A and B in Task 3, C in Task 5, D in Task 4, E in Task 6, F in Task 8, G in Task 9. H is covered by the tokens in Task 2, `--glow` and Dark lane labels in Task 4, and the Dark screenshots in Task 11.
  - §4 is covered by Task 10, §5 by Tasks 1 and 4.
  - Contrast is covered by Tasks 2 and 4. Testing is spread across the tasks plus Task 11.
- **Departure from the mockups:** in Dark, Cyber lane text on panels and on the banner readout is white with a teal dot. The mockups showed teal text there, which breaks the standing "no blue on blue" rule.
- **Names used consistently:** `traceSpec` returns `{cat, d, points, peak, color, glow, orbs}`. `signalPill` returns `{state, label, detail}`. Other names: `channel`, `utcTime`, `traceBanner`, `traceThumb`, `listening`, `pill`, `placePulse`.
