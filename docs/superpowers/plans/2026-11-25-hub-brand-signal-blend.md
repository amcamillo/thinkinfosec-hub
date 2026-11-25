# Hub brand pass and Signal blend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the official logo, the owner's photo and prominent LinkedIn links; blend the hub into Signal's animated background with a soft near-white top; make panels solid (light in both themes); and add an Enter Signal button that crossfades into Signal full screen.

**Architecture:** The hub is static GitHub Pages with no build step. It uses classic scripts loaded at the end of `<body>`, a strict CSP meta tag, and no innerHTML. Two new scripts:
- `assets/hub/paint.js`: decorative canvas, self-starting, no exports.
- `assets/hub/stage.js`: UMD module `HubStage` with a pure `create()` that is unit-tested with stubs, plus a browser `init()`.

Brand images are pre-built by a Pillow script and committed.

**Tech Stack:** HTML, CSS, vanilla JS, Python 3 with Pillow 12 (one-off asset build), Node `node:test` (unit tests), and Playwright (smoke tests in `tests/`).

**Spec:** `docs/superpowers/specs/2026-11-25-hub-brand-signal-blend-design.md`

**Deliberate deviations from the spec:**
- The asset script lives at `scripts/brand-assets.py`, not `tools/`, because `tools/` holds catalog apps.
- The narrow breakpoint is the existing 760px, not 720px.
- Chips keep their transparent style. A light panel token set on a transparent chip would put navy text on the dark page.
- `paint.js` exposes no global, because nothing needs one.

---

## Ground rules for every task

- Repo: `C:\dev\thinkinfosec-hub`, branch `brand-signal-blend`. The git identity is already repo-local (`AI Assistant <support@thinkinfosec.org>`). Do not change it.
- The owner has **uncommitted edits in `Research/*`, `_design/diagram-builder.md`, `.cursor/` and `.output/`**:
  - Never `git add -A`, `git add .` or `git commit -a`.
  - Always `git add` the exact files.
  - Never stash, reset or checkout those paths.
- End every commit message with a blank line, then `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- No inline `<script>` or `style=""` attributes. The CSP is `script-src 'self'; style-src 'self'`. Setting `el.style.x` from JS (CSSOM) is allowed.
- Run tests from `C:\dev\thinkinfosec-hub\tests`:
  - Unit: `npm run unit`.
  - One smoke test: `node --test --test-name-pattern="<words>" "smoke/*.test.js"`.
  - Run the full smoke suite only in Task 7.
- Put new CSS **at the end of `assets/hub.css`** unless a step says to replace a specific line.

---

### Task 0: Test tooling baseline

**Files:** none changed.

- [ ] **Step 1: Install test dependencies and the browser**

```bash
cd /c/dev/thinkinfosec-hub/tests && npm ci && npx playwright install chromium
```
Expected: it finishes without errors.

- [ ] **Step 2: Baseline unit run**

Run: `cd /c/dev/thinkinfosec-hub/tests && npm run unit 2>&1 | tail -5`
Expected: `# pass 30`, `# fail 0`.

- [ ] **Step 3: Baseline smoke spot-check**

Run: `node --test --test-name-pattern="wordmark" "smoke/*.test.js" 2>&1 | tail -5`
Expected: `# pass 1`, `# fail 0`.

---

### Task 1: Brand assets

**Files:**
- Create: `scripts/brand-assets.py`
- Create (generated): `assets/brand/logo-96.webp`, `assets/brand/logo-192.webp`, `assets/brand/favicon-32.png`, `assets/brand/favicon-180.png`, `assets/brand/photo-160.webp`, `assets/brand/photo-320.webp`

- [ ] **Step 1: Write the script**

```python
"""Build web-size brand assets from the tracked sources.

Run from the repo root:  python scripts/brand-assets.py
Sources: assets/thinkinfosec-logo.png, assets/your-photo.png. Output: assets/brand/.
"""
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "brand"


def circle(im):
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0) + im.size, fill=255)
    out.paste(im, (0, 0), mask)
    return out


def logo():
    im = Image.open(ROOT / "assets" / "thinkinfosec-logo.png").convert("RGBA")
    w, h = im.size  # 1024 x 1032
    top = (h - (w - 24)) // 2
    badge = circle(im.crop((12, top, w - 12, top + w - 24)))  # square, trims the pale corners
    for px in (96, 192):
        badge.resize((px, px), Image.LANCZOS).save(OUT / f"logo-{px}.webp", quality=90)
    for px in (32, 180):
        badge.resize((px, px), Image.LANCZOS).save(OUT / f"favicon-{px}.png", optimize=True)


def photo():
    im = Image.open(ROOT / "assets" / "your-photo.png").convert("RGB")
    w, h = im.size
    px = im.load()
    # Background = pure black outside the oval + the white halo. A looser black
    # threshold eats the dark shirt and the neck shadow, so keep max < 10.
    is_bg = lambda c: min(c) > 185 or max(c) < 10
    seen = bytearray(w * h)
    queue = deque([(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)])
    while queue:
        x, y = queue.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x] or not is_bg(px[x, y]):
            continue
        seen[y * w + x] = 1
        queue.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    mask = Image.new("L", im.size, 255)
    mp = mask.load()
    for y in range(h):
        for x in range(w):
            if seen[y * w + x]:
                mp[x, y] = 0
    mask = mask.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    bg = Image.new("RGB", im.size)
    draw = ImageDraw.Draw(bg)
    top, bottom = (250, 228, 240), (222, 240, 248)  # #FAE4F0 -> #DEF0F8
    for y in range(h):
        t = y / (h - 1)
        draw.line([(0, y), (w, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    im = Image.composite(im, bg, mask)
    cx, cy, r = 196, 240, 178  # neck and shirt run to the bottom edge
    disc = circle(im.crop((cx - r, cy - r, cx + r, cy + r)))
    for size in (160, 320):
        disc.resize((size, size), Image.LANCZOS).save(OUT / f"photo-{size}.webp", quality=88)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    logo()
    photo()
    for f in sorted(OUT.iterdir()):
        print(f.name, f.stat().st_size)
```

- [ ] **Step 2: Run it**

Run: `cd /c/dev/thinkinfosec-hub && python scripts/brand-assets.py`
Expected: six files are listed. Each `logo-*`, `favicon-*` and `photo-*` file is under 40 KB.

- [ ] **Step 3: Look at the photo once**

Open `assets/brand/photo-320.webp` with the Read tool. Expected:
- the face is on a pale pink-to-ice background
- the neck and dark shirt reach the bottom of the circle
- there are no black blotches on the face

If blotches appear, the threshold was changed; it must stay `max(c) < 10`.

- [ ] **Step 4: Commit**

```bash
git add scripts/brand-assets.py assets/brand/logo-96.webp assets/brand/logo-192.webp assets/brand/favicon-32.png assets/brand/favicon-180.png assets/brand/photo-160.webp assets/brand/photo-320.webp
git commit -m "feat: web-size logo, favicon and About photo

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Solid panels, light in both themes

**Files:**
- Modify: `assets/hub.css`: the token blocks (lines 5–27), the panel rule (lines 41–44), and `.search input` (line 85)
- Test: `tests/unit/contrast.test.js`

- [ ] **Step 1: Write the failing tests** (append to `tests/unit/contrast.test.js`)

```js
test('dark theme light panels: sheet text reaches 4.5:1 on the sheet and its worst case', () => {
  const t = tokens('dark');
  for (const fg of ['sheet-ink', 'sheet-muted', 'sheet-mag', 'sheet-acc', 'sheet-gold']) {
    for (const bg of ['sheet', 'sheet-tint']) {
      assert.ok(t[fg] && t[bg], 'dark missing --' + fg + ' or --' + bg);
      const r = ratio(t[fg], t[bg]);
      assert.ok(r >= 4.5, `dark: --${fg} on --${bg} is ${r.toFixed(2)}:1`);
    }
  }
});
test('panels are solid, and in dark re-point text tokens to the sheet set', () => {
  assert.match(css, /\.glass, \.card, \.band, \.wire, \.search input, \.listening \{[^}]*background: var\(--solid\)/);
  assert.doesNotMatch(css, /\.glass, \.card[^{]*\{[^}]*backdrop-filter/);
  assert.match(css, /:root\[data-theme="dark"\] :is\(\.glass, \.card[^)]*\) \{[^}]*--ink: var\(--sheet-ink\)/);
});
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `cd tests && npm run unit 2>&1 | tail -8`
Expected: 2 failures ("dark missing --sheet-ink", and the regex mismatch).

- [ ] **Step 3: Add the tokens**

In the `:root[data-theme="dark"] {` block, add this line after `--panel-kicker: #ffffff;`:
```css
  --solid: rgba(236, 242, 250, .94); --top: #070F1F;
  --sheet: #ECF2FA; --sheet-tint: #DCE3EC; --sheet-ink: #0D1F3C; --sheet-muted: #3D4B66;
  --sheet-mag: #B0125B; --sheet-acc: #036A7C; --sheet-gold: #7a4f00; --sheet-line: #C5D0DE;
```
`--sheet-tint` is the worst case: `--sheet` at 94% over `--bg`. In the `:root[data-theme="light"] {` block, add this line after `--panel-kicker: #036A7C;`:
```css
  --solid: rgba(255, 255, 255, .92); --top: #FFFDFE;
```

- [ ] **Step 4: Replace the panel rule**

Replace these lines:
```css
.glass, .card, .band, .wire, .search input, .listening { background: var(--glass); border: 1px solid var(--glass-bd); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass, .card, .band, .wire, .search input, .listening { background: var(--panel); }
}
```
with:
```css
.glass, .card, .band, .wire, .search input, .listening { background: var(--solid); border: 1px solid var(--glass-bd); color: var(--ink); }
/* Panels stay light in dark: inside them, text tokens point at the light "sheet" set. */
:root[data-theme="dark"] :is(.glass, .card, .band, .wire, .search input, .listening) {
  --ink: var(--sheet-ink); --muted: var(--sheet-muted); --mag-ink: var(--sheet-mag); --acc-ink: var(--sheet-acc);
  --gold-ink: var(--sheet-gold); --panel-kicker: var(--sheet-acc); --line: var(--sheet-line); --glass-bd: rgba(18, 36, 74, .10);
  box-shadow: 0 10px 40px rgba(0, 0, 0, .35);
}
```
In the `.search input { ... }` rule (about line 85), change `background: var(--panel);` to `background: var(--solid);`.

- [ ] **Step 5: Run the unit tests**

Run: `npm run unit 2>&1 | tail -5`
Expected: `# pass 32`, `# fail 0`.

- [ ] **Step 6: Commit**

```bash
git add assets/hub.css tests/unit/contrast.test.js
git commit -m "feat: solid panels, light in both themes, with sheet contrast tokens

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Signal background layers and the masthead fade

**Files:**
- Create: `assets/hub/paint.js`
- Modify: `index.html` (after the `.orbs` div on line 14, plus a script tag after `app.js`)
- Modify: `assets/hub.css`: the `.masthead` rule (line 57) and `html { scroll-padding-top }` (about line 45); new CSS at the end
- Test: `tests/smoke/hub.smoke.test.js`

- [ ] **Step 1: Write the failing smoke test** (append)

```js
test('masthead has no glass slab and the paint layer is running', async () => {
  const { page, context, errors } = await open('#front');
  assert.equal(await page.$eval('.masthead', el => getComputedStyle(el).backdropFilter), 'none');
  assert.ok(await page.$eval('#paint', c => c.width > 0 && c.height > 0), 'paint canvas sized');
  assert.equal(await page.isVisible('.top-wash'), true);
  assert.deepEqual(errors, []);
  await context.close();
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `cd tests && node --test --test-name-pattern="paint layer" "smoke/*.test.js" 2>&1 | tail -8`
Expected: FAIL. `backdropFilter` is `blur(12px)`.

- [ ] **Step 3: Create `assets/hub/paint.js`**

```js
/* Painterly background: soft blots drifting along a slow flow field (ported from Signal's signal.js).
   Decorative only: aria-hidden canvas, half resolution, ~30 fps, paused while the tab is hidden. */
(function () {
  if (typeof document === 'undefined') return;
  const cv = document.getElementById('paint');
  const ctx = cv && cv.getContext ? cv.getContext('2d') : null;
  if (!ctx) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SC = 0.5;
  const PAL = {
    dark: ['0,191,207', '76,141,224', '127,231,239', '255,45,120', '255,128,180', '190,150,255'],
    light: ['0,175,194', '42,95,196', '196,20,111', '255,45,120', '255,120,170', '120,90,210']
  };
  const sprites = {};
  let W = 0, H = 0, T = 0, strokes = [], frameN = 0, lastSpawn = 0, lastFrame = 0;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const isLight = () => document.documentElement.getAttribute('data-theme') !== 'dark';

  function sprite(rgb) {
    if (sprites[rgb]) return sprites[rgb];
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(' + rgb + ',1)');
    r.addColorStop(0.35, 'rgba(' + rgb + ',.55)');
    r.addColorStop(0.7, 'rgba(' + rgb + ',.14)');
    r.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    return (sprites[rgb] = c);
  }
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * SC); cv.height = Math.round(H * SC);
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    ctx.clearRect(0, 0, W, H);
    strokes = [];
  }
  function flow(x, y) {
    const s = 0.0013;
    return Math.sin(x * s * 1.3 + T * 0.04) * 2.1 + Math.cos(y * s * 1.7 - T * 0.03) * 2.1 + Math.sin((x + y) * s * 0.7 + T * 0.025) * 1.2;
  }
  function spawn() {
    const unit = Math.min(W, H) / 900;
    let x, y;
    if (Math.random() < 0.6) { // favour the rim, let some wander inland
      const d = Math.pow(Math.random(), 2) * 0.3, side = Math.floor(Math.random() * 4);
      if (side === 0) { x = rand(0, W); y = d * H; } else if (side === 1) { x = rand(0, W); y = H - d * H; }
      else if (side === 2) { x = d * W; y = rand(0, H); } else { x = W - d * W; y = rand(0, H); }
    } else { x = rand(0, W); y = rand(0, H); }
    const light = isLight(), pal = PAL[light ? 'light' : 'dark'];
    strokes.push({ x, y, k: 0, max: rand(280, 640), v: rand(0.9, 1.7) * unit + 0.4, r: rand(55, 140) * unit + 20,
      a: rand(0.014, 0.032) * (light ? 1.6 : 1), seed: rand(0, 6.28), col: pal[Math.floor(Math.random() * pal.length)] });
  }
  function stepStroke(s) {
    const ang = flow(s.x, s.y) + Math.sin(s.k * 0.015 + s.seed) * 0.7;
    s.x += Math.cos(ang) * s.v; s.y += Math.sin(ang) * s.v; s.k++;
    const env = Math.pow(Math.sin(Math.PI * clamp(s.k / s.max, 0, 1)), 0.8);
    const r = s.r * (0.75 + 0.25 * Math.sin(s.k * 0.03 + s.seed)) * (0.5 + 0.5 * env);
    ctx.globalAlpha = s.a * env;
    ctx.drawImage(sprite(s.col), s.x - r, s.y - r, r * 2, r * 2);
    return s.k < s.max && s.x > -160 && s.x < W + 160 && s.y > -160 && s.y < H + 160;
  }
  function loop(now) {
    window.requestAnimationFrame(loop);
    if (document.hidden || now - lastFrame < 33) return;
    lastFrame = now; T += 0.033; frameN++;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'destination-out'; // slow dissolve; a stronger pass clears 8-bit residue
    ctx.fillStyle = 'rgba(0,0,0,' + (frameN % 40 === 0 ? 0.06 : 0.005) + ')';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    if (now - lastSpawn > (reduce ? 2600 : 1000) && strokes.length < (reduce ? 4 : 11)) { spawn(); lastSpawn = now; }
    strokes = strokes.filter(s => stepStroke(s) && stepStroke(s));
    ctx.globalAlpha = 1;
  }
  window.addEventListener('resize', resize);
  new MutationObserver(() => { ctx.clearRect(0, 0, W, H); strokes = []; })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  resize();
  window.requestAnimationFrame(loop);
}());
```

- [ ] **Step 4: Add the layers to `index.html`**

Directly after the line `<div class="orbs" aria-hidden="true">…</div>`, add:
```html
  <canvas id="paint" class="paint" aria-hidden="true"></canvas>
  <div class="vignette" aria-hidden="true"></div>
  <div class="top-wash" aria-hidden="true"></div>
```
After `<script src="assets/hub/app.js"></script>`, add:
```html
  <script src="assets/hub/paint.js"></script>
```

- [ ] **Step 5: Change the CSS**

Replace the `.masthead { ... }` rule with:
```css
.masthead { position: sticky; top: 0; z-index: 10; padding-bottom: 40px; background: linear-gradient(180deg, var(--top) 0%, var(--top) 55%, color-mix(in srgb, var(--top) 70%, transparent) 78%, transparent 100%); }
```
Change `html { scroll-padding-top: 140px; }` to `html { scroll-padding-top: 180px; }`.

Append to the end of the file:
```css
/* Signal blend: painted field, vignette, and a wash that fades it to near-white (navy in dark) at the top. */
.paint { position: fixed; inset: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; mix-blend-mode: var(--orb-blend); filter: blur(9px) saturate(1.3); }
.vignette { position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(ellipse 80% 76% at 50% 45%, transparent 60%, color-mix(in srgb, var(--bg) 60%, transparent) 100%); }
.top-wash { position: fixed; inset: 0 0 auto 0; height: 340px; z-index: -1; pointer-events: none; background: linear-gradient(180deg, var(--top) 0%, var(--top) 30%, color-mix(in srgb, var(--top) 55%, transparent) 62%, transparent 100%); }
```
These layers share `z-index: -1` with `.orbs`. `body` has `isolation: isolate`, so they paint in DOM order above the orbs and below the content.

- [ ] **Step 6: Run the smoke test and the unit tests**

Run: `node --test --test-name-pattern="paint layer|reduced motion" "smoke/*.test.js" 2>&1 | tail -5` and `npm run unit 2>&1 | tail -3`
Expected: smoke `# pass 2`, unit `# pass 32`.

- [ ] **Step 7: Commit**

```bash
git add assets/hub/paint.js index.html assets/hub.css tests/smoke/hub.smoke.test.js
git commit -m "feat: Signal painted background with a soft top wash, no masthead slab

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Masthead brand: logo badge, LinkedIn pill, Enter Signal link, favicon

**Files:**
- Modify: `index.html` (the `<head>` links, plus the masthead at lines 17–28)
- Modify: `assets/hub.css` (append; also the `prefers-reduced-motion` block, about line 175)
- Modify: `tests/smoke/hub.smoke.test.js` (the `TYPES` map)

- [ ] **Step 1: Teach the smoke server WebP**

In `tests/smoke/hub.smoke.test.js`, add `'.webp': 'image/webp'` to the `TYPES` object.

- [ ] **Step 2: Write the failing smoke test** (append)

```js
test('masthead shows the logo, LinkedIn and Enter Signal; favicon is served', async () => {
  const { page, context } = await open('#front');
  await page.waitForFunction(() => { const i = document.querySelector('.brand-badge'); return i && i.complete && i.naturalWidth > 0; });
  assert.equal(await page.locator('.masthead a[href="https://www.linkedin.com/in/amcamillo/"]').count(), 1);
  assert.equal(await page.getAttribute('#enterSignal', 'href'), 'https://thinkinfosec.github.io/Signal/');
  const fav = await page.request.get(new URL('assets/brand/favicon-32.png', base).href);
  assert.equal(fav.status(), 200);
  assert.equal(await page.getAttribute('link[rel="icon"]', 'href'), 'assets/brand/favicon-32.png');
  await context.close();
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `node --test --test-name-pattern="masthead shows" "smoke/*.test.js" 2>&1 | tail -5`
Expected: FAIL, timing out on `.brand-badge`.

- [ ] **Step 4: Change the head and the masthead in `index.html`**

After `<link rel="stylesheet" href="assets/hub.css">`, add:
```html
  <link rel="icon" type="image/png" sizes="32x32" href="assets/brand/favicon-32.png">
  <link rel="apple-touch-icon" href="assets/brand/favicon-180.png">
```
Replace the brand block:
```html
      <div>
        <a class="brand" href="#front">Think<span>InfoSec</span> <small>Hub</small></a>
        <p class="dateline" id="dateline"></p>
      </div>
```
with:
```html
      <div class="brand-block">
        <img class="brand-badge" src="assets/brand/logo-96.webp" width="48" height="48" alt="ThinkInfoSec logo">
        <div>
          <a class="brand" href="#front">Think<span>InfoSec</span> <small>Hub</small></a>
          <p class="dateline" id="dateline"></p>
        </div>
      </div>
```
Inside `<div class="masthead-tools">`, directly after the `<p class="pill" id="signalPill" …>…</p>` line and before the theme toggle, add:
```html
        <a class="mast-btn mast-li" href="https://www.linkedin.com/in/amcamillo/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><span class="li-mark" aria-hidden="true">in</span><span class="btn-label">LinkedIn</span></a>
        <a class="mast-btn mast-signal" id="enterSignal" href="https://thinkinfosec.github.io/Signal/" aria-label="Enter Signal full screen"><span class="dot" aria-hidden="true"></span><span class="btn-label">Enter Signal</span><span aria-hidden="true">⤢</span></a>
```

- [ ] **Step 5: CSS** (append to the end of `assets/hub.css`)

```css
/* Brand: logo badge, LinkedIn, Enter Signal. */
.brand-block { display: flex; align-items: center; gap: 12px; }
.brand-badge { width: 48px; height: 48px; border-radius: 50%; flex: none; box-shadow: 0 0 0 2px color-mix(in srgb, var(--mag) 55%, transparent), 0 0 22px color-mix(in srgb, var(--mag) 35%, transparent); }
.mast-btn { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px; font-size: 0.85rem; font-weight: 700; text-decoration: none; white-space: nowrap; }
.mast-li { color: var(--ink); background: var(--glass); border: 1px solid var(--glass-bd); }
.mast-signal { color: #fff; background: linear-gradient(100deg, #0D1F3C, #1d3a6b 55%, #8a1450); box-shadow: 0 0 24px rgba(255, 45, 120, .35); }
.mast-signal .dot { width: 8px; height: 8px; border-radius: 50%; background: #FF2D78; box-shadow: 0 0 10px #FF2D78; animation: signal-blink 2.4s ease-in-out infinite; }
@keyframes signal-blink { 50% { opacity: .35; } }
.li-mark { display: inline-block; width: 18px; height: 18px; border-radius: 4px; background: #0A66C2; color: #fff; font: 700 12px/18px -apple-system, "Segoe UI", sans-serif; text-align: center; letter-spacing: 0; }
a.cta-li { display: inline-flex; align-items: center; gap: 8px; background: #0A66C2; color: #fff; border: 0; border-radius: 999px; padding: 8px 16px; font-weight: 700; text-decoration: none; }
a.cta-li .li-mark { background: #fff; color: #0A66C2; }
@media (max-width: 760px) {
  .masthead-tools { flex-direction: row; flex-wrap: wrap; justify-content: flex-end; }
  .mast-btn { padding: 6px 10px; }
  .mast-btn .btn-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .brand-badge { width: 36px; height: 36px; }
}
```
In the existing `@media (prefers-reduced-motion: reduce)` block, add `.mast-signal .dot` to the selector list of the `animation: none !important` rule.

- [ ] **Step 6: Run the smoke tests**

Run: `node --test --test-name-pattern="masthead shows|reduced motion" "smoke/*.test.js" 2>&1 | tail -5`
Expected: `# pass 2`.

- [ ] **Step 7: Commit**

```bash
git add index.html assets/hub.css tests/smoke/hub.smoke.test.js
git commit -m "feat: masthead logo badge, LinkedIn pill, Enter Signal link and favicon

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: About card and footer

**Files:**
- Modify: `index.html`: the About section (lines ~101–113) and the footer (line ~118)
- Modify: `assets/hub.css`: remove `.about { max-width: 70ch; }` (about line 166) and the `.site-foot` rule; append new CSS

- [ ] **Step 1: Write the failing smoke test** (append)

```js
test('About shows the photo and LinkedIn is linked from masthead, About and footer', async () => {
  const { page, context } = await open('#about');
  await page.waitForFunction(() => [...document.querySelectorAll('.about-photo, .foot-badge')].every(i => i.complete && i.naturalWidth > 0) && document.querySelector('.about-photo'));
  for (const sel of ['.masthead', '#panel-about', '.site-foot']) {
    const a = page.locator(sel + ' a[href="https://www.linkedin.com/in/amcamillo/"]');
    assert.equal(await a.count(), 1, sel);
    assert.equal(await a.getAttribute('target'), '_blank', sel);
    assert.match(await a.getAttribute('rel'), /noopener/, sel);
  }
  await context.close();
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `node --test --test-name-pattern="About shows" "smoke/*.test.js" 2>&1 | tail -5`
Expected: FAIL (timeout: there is no `.about-photo`).

- [ ] **Step 3: Replace the About section's inner content**

Keep the `<section role="tabpanel" … id="panel-about" …>` tag and its `<h2 class="section-title">About</h2>`. Replace everything from `<div class="about">` through the closing `</ul>` of the connect list with:
```html
      <div class="glass about-card">
        <img class="about-photo" src="assets/brand/photo-320.webp" srcset="assets/brand/photo-160.webp 160w, assets/brand/photo-320.webp 320w" sizes="150px" width="150" height="150" loading="lazy" alt="André Camillo">
        <div class="about-body">
          <h3 class="about-name">André Camillo</h3>
          <p class="about-role mono">Security · AI · ThinkInfoSec</p>
          <p>Welcome to my learning hub! I specialize in AI, InfoSec, and Cloud technologies, with a passion for sharing knowledge and building practical solutions.</p>
          <p>Through this platform, I share tools, research, and educational content to help the cybersecurity and cloud community grow and learn together.</p>
          <ul class="connect" aria-label="Connect">
            <li><a class="cta-li" href="https://www.linkedin.com/in/amcamillo/" target="_blank" rel="noopener noreferrer"><span class="li-mark" aria-hidden="true">in</span>Connect on LinkedIn</a></li>
            <li><a href="https://www.youtube.com/@thinkinfosecorg" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            <li><a href="https://andrecamillo.medium.com/" target="_blank" rel="noopener noreferrer">Medium</a></li>
            <li><a href="https://open.spotify.com/show/2e32C7SFXNUqfRR3YemmtI" target="_blank" rel="noopener noreferrer">Podcast</a></li>
            <li><a href="https://discord.gg/NMefYksn" target="_blank" rel="noopener noreferrer">Discord</a></li>
          </ul>
        </div>
      </div>
```
This removes the old `<h3 class="kicker">Connect</h3>`. The list's `aria-label` replaces it.

- [ ] **Step 4: Replace the footer**

```html
  <footer class="wrap site-foot">
    <img class="foot-badge" src="assets/brand/logo-96.webp" width="28" height="28" alt="">
    <p>ThinkInfoSec · <a href="https://thinkinfosec.org">thinkinfosec.org</a></p>
    <a class="cta-li" href="https://www.linkedin.com/in/amcamillo/" target="_blank" rel="noopener noreferrer"><span class="li-mark" aria-hidden="true">in</span>LinkedIn</a>
  </footer>
```

- [ ] **Step 5: CSS**

- Delete the line `.about { max-width: 70ch; }`.
- Replace the `.site-foot { … }` rule with:
```css
.site-foot { display: flex; align-items: center; gap: 12px; color: var(--muted); font-size: 0.85rem; padding: 20px 0 40px; }
.site-foot p { margin: 0; flex: 1; }
.foot-badge { border-radius: 50%; flex: none; }
```
- Append to the end of the file:
```css
/* About card: photo, name, bio, LinkedIn first. */
.about-card { display: grid; grid-template-columns: auto 1fr; gap: 28px; align-items: center; padding: 24px; border-radius: 20px; max-width: 900px; }
.about-photo { width: 150px; height: 150px; border-radius: 50%; box-shadow: 0 0 0 3px color-mix(in srgb, var(--mag) 60%, transparent), 0 0 40px color-mix(in srgb, var(--acc) 35%, transparent); }
.about-name { font-family: "DM Sans", -apple-system, "Segoe UI", sans-serif; font-weight: 300; font-size: 1.7rem; margin: 0; }
.about-role { color: var(--muted); font-size: 0.75rem; text-transform: uppercase; margin: 4px 0 12px; }
.about-body p { max-width: 70ch; }
.about-card .connect { margin: 16px 0 0; }
@media (max-width: 640px) {
  .about-card { grid-template-columns: 1fr; justify-items: center; text-align: center; }
  .about-card .connect { justify-content: center; }
}
```
`a.cta-li` (from Task 4) appears later in the file than `.connect a`. Both have specificity 0,1,1, so `a.cta-li` wins: no border, blue fill.

- [ ] **Step 6: Run the smoke tests**

Run: `node --test --test-name-pattern="About shows|every tab renders" "smoke/*.test.js" 2>&1 | tail -5`
Expected: `# pass 2`.

- [ ] **Step 7: Commit**

```bash
git add index.html assets/hub.css tests/smoke/hub.smoke.test.js
git commit -m "feat: About card with photo and LinkedIn CTA, footer logo and LinkedIn

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Enter Signal full-screen crossfade (`HubStage`)

**Files:**
- Create: `assets/hub/stage.js`
- Create: `tests/unit/stage.test.js`
- Modify: `index.html`: the CSP meta (line 6), the stage markup after the footer, and a script tag
- Modify: `assets/hub.css` (append; and the reduced-motion block)
- Modify: `tests/smoke/hub.smoke.test.js`: the `feeds()` route, plus a new test

- [ ] **Step 1: Write the failing unit tests** in `tests/unit/stage.test.js`

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { create } = require('../../assets/hub/stage.js');

function el(name, log) {
  const attrs = {}, cls = new Set();
  return {
    name, hidden: true, attrs,
    classList: { add: c => cls.add(c), remove: c => cls.delete(c), contains: c => cls.has(c) },
    setAttribute(k, v) { attrs[k] = String(v); log.push(name + ':set:' + k); },
    getAttribute: k => (k in attrs ? attrs[k] : null),
    removeAttribute(k) { delete attrs[k]; },
    focus() { log.push(name + ':focus'); }
  };
}
function rig() {
  const log = [], queue = [];
  const stage = el('stage', log);
  stage.requestFullscreen = () => Promise.reject(new Error('denied'));
  const o = {
    doc: { body: el('body', log), fullscreenElement: null },
    stage, frame: el('frame', log), link: el('link', log), back: el('back', log),
    hub: [el('main', log), el('masthead', log)],
    src: 'https://thinkinfosec.github.io/Signal/', reduce: false,
    wait: fn => queue.push(fn), next: fn => fn()
  };
  const flush = () => { while (queue.length) queue.shift()(); };
  return { o, log, flush, s: create(o) };
}

test('show sets the src, fades the hub, then reveals the stage with focus on Back', () => {
  const { o, log, flush, s } = rig();
  s.show();
  assert.equal(o.frame.getAttribute('src'), o.src);
  assert.ok(o.doc.body.classList.contains('leaving'));
  assert.equal(o.stage.hidden, true, 'stage waits for the hub to fade');
  flush();
  assert.equal(o.stage.hidden, false);
  assert.ok(o.stage.classList.contains('on'));
  assert.ok(o.hub.every(h => h.getAttribute('inert') === ''));
  assert.equal(log[log.length - 1], 'back:focus');
  assert.equal(s.isOpen(), true);
});

test('hide restores the hub and returns focus to the link', () => {
  const { o, log, flush, s } = rig();
  s.show(); flush();
  s.hide(); flush();
  assert.equal(o.stage.hidden, true);
  assert.ok(!o.stage.classList.contains('on'));
  assert.ok(!o.doc.body.classList.contains('leaving'));
  assert.ok(o.hub.every(h => h.getAttribute('inert') === null));
  assert.equal(log[log.length - 1], 'link:focus');
  assert.equal(s.isOpen(), false);
});

test('hide is idempotent and a no-op before show', () => {
  const { o, log, flush, s } = rig();
  s.hide(); flush();
  assert.deepEqual(log, []);
  s.show(); flush(); s.hide(); s.hide(); flush();
  assert.equal(log.filter(l => l === 'link:focus').length, 1);
});

test('the iframe src is set only once across reopenings', () => {
  const { log, flush, s } = rig();
  s.show(); flush(); s.hide(); flush(); s.show(); flush();
  assert.equal(log.filter(l => l === 'frame:set:src').length, 1);
});

test('closing during the fade-out never reveals the stage', () => {
  const { o, flush, s } = rig();
  s.show(); s.hide(); flush();
  assert.equal(o.stage.hidden, true);
  assert.ok(!o.doc.body.classList.contains('leaving'));
});

test('exits fullscreen on hide when the stage is fullscreen', () => {
  const { o, flush, s } = rig();
  let exited = false;
  o.doc.exitFullscreen = () => { exited = true; return Promise.resolve(); };
  s.show(); flush();
  o.doc.fullscreenElement = o.stage;
  s.hide(); flush();
  assert.equal(exited, true);
});
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `cd tests && npm run unit 2>&1 | tail -5`
Expected: FAIL with "Cannot find module '../../assets/hub/stage.js'".

- [ ] **Step 3: Create `assets/hub/stage.js`**

```js
/* Enter Signal: fade the hub out, crossfade into Signal in a full-screen stage, and back.
   create() is pure (DOM-like objects and timers are injected) so it can be unit-tested; init() wires the page. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HubStage = api;
  if (typeof document !== 'undefined' && typeof window !== 'undefined') api.init(document, window);
}(typeof self !== 'undefined' ? self : this, function () {
  function create(o) {
    const t = o.reduce ? { swap: 0, fade: 200, out: 200 } : { swap: 450, fade: 900, out: 500 };
    let open = false;
    function show() {
      if (open) return;
      open = true;
      if (!o.frame.getAttribute('src')) o.frame.setAttribute('src', o.src);
      o.doc.body.classList.add('leaving');
      o.wait(() => {
        if (!open) return;
        o.stage.hidden = false;
        o.next(() => { if (open) o.stage.classList.add('on'); });
        o.hub.forEach(h => h.setAttribute('inert', ''));
        o.back.focus();
        const fs = o.stage.requestFullscreen ? o.stage.requestFullscreen() : null;
        if (fs && fs.catch) fs.catch(() => {});
      }, t.swap);
    }
    function hide() {
      if (!open) return;
      open = false;
      o.stage.classList.remove('on');
      if (o.doc.fullscreenElement && o.doc.exitFullscreen) {
        const p = o.doc.exitFullscreen();
        if (p && p.catch) p.catch(() => {});
      }
      o.hub.forEach(h => h.removeAttribute('inert'));
      o.wait(() => { if (!open) { o.doc.body.classList.remove('leaving'); o.link.focus(); } }, t.out);
      o.wait(() => { if (!open) o.stage.hidden = true; }, t.fade);
    }
    return { show, hide, isOpen: () => open };
  }

  function init(doc, win) {
    const link = doc.getElementById('enterSignal');
    const stage = doc.getElementById('signalStage');
    if (!link || !stage) return null;
    const s = create({
      doc, stage, link,
      frame: stage.querySelector('iframe'),
      back: doc.getElementById('stageBack'),
      hub: [doc.querySelector('.masthead'), doc.getElementById('main'), doc.querySelector('.site-foot')].filter(Boolean),
      src: link.href,
      reduce: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
      wait: (fn, ms) => win.setTimeout(fn, ms),
      next: fn => win.requestAnimationFrame(() => win.requestAnimationFrame(fn))
    });
    link.addEventListener('click', e => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let new-tab clicks through
      e.preventDefault();
      s.show();
    });
    doc.getElementById('stageBack').addEventListener('click', s.hide);
    doc.addEventListener('keydown', e => { if (e.key === 'Escape') s.hide(); });
    doc.addEventListener('fullscreenchange', () => { if (!doc.fullscreenElement) s.hide(); });
    return s;
  }

  return { create, init };
}));
```

- [ ] **Step 4: Run the unit tests**

Run: `npm run unit 2>&1 | tail -5`
Expected: `# pass 38`, `# fail 0`.

- [ ] **Step 5: Change `index.html`**

- In the CSP meta tag, insert `frame-src https://thinkinfosec.github.io; ` directly after `connect-src 'self' https://thinkinfosec.github.io; `.
- Confirm the main element is `<main id="main" …>`, using `grep -n "<main" index.html`. The skip link already targets `#main`.
- Directly after the closing `</footer>`, add:
```html
  <div id="signalStage" class="signal-stage" role="dialog" aria-modal="true" aria-label="Signal" hidden>
    <button type="button" id="stageBack" class="stage-back">← Back to hub</button>
    <iframe title="Signal" allow="autoplay; fullscreen" allowfullscreen></iframe>
  </div>
```
- After `<script src="assets/hub/paint.js"></script>`, add:
```html
  <script src="assets/hub/stage.js"></script>
```

- [ ] **Step 6: CSS** (append to the end of the file)

```css
/* Enter Signal stage: hub fades and blurs out, Signal fades in on a navy base. */
.signal-stage { position: fixed; inset: 0; z-index: 50; opacity: 0; background: linear-gradient(160deg, #070F1F, #0D1F3C); transition: opacity .9s ease; }
.signal-stage.on { opacity: 1; }
.signal-stage iframe { display: block; width: 100%; height: 100%; border: 0; }
.stage-back { position: absolute; top: 16px; left: 16px; z-index: 1; font: inherit; font-weight: 700; color: #fff; background: rgba(13, 31, 60, .6); border: 1px solid rgba(255, 255, 255, .25); border-radius: 999px; padding: 8px 16px; cursor: pointer; }
.masthead, main, .site-foot { transition: opacity .7s ease, filter .7s ease, transform .7s ease; }
body.leaving :is(.masthead, main, .site-foot) { opacity: 0; filter: blur(8px); transform: scale(1.015); }
@media (prefers-reduced-motion: reduce) {
  body.leaving :is(.masthead, main, .site-foot) { filter: none; transform: none; }
  .signal-stage, .masthead, main, .site-foot { transition: opacity .2s ease !important; }
}
```
The `!important` here beats the earlier `* { transition: none !important }` because it is more specific.

- [ ] **Step 7: Smoke: serve a stub Signal page and add the test**

In `feeds()`, inside the `context.route('https://thinkinfosec.github.io/Signal/*', route => {` handler, make this the first line:
```js
    if (route.request().resourceType() === 'document') return route.fulfill({ body: '<!doctype html><title>Signal</title><p>Signal stub</p>', contentType: 'text/html' });
```
Append this test:
```js
test('Enter Signal crossfades to the full-screen stage and Back returns', async () => {
  const { page, context, errors } = await open('#front');
  assert.equal(await page.isHidden('#signalStage'), true);
  await page.click('#enterSignal');
  await page.waitForSelector('#signalStage.on');
  assert.equal(await page.getAttribute('#signalStage iframe', 'src'), 'https://thinkinfosec.github.io/Signal/');
  assert.equal(await page.evaluate(() => document.getElementById('main').inert), true);
  await page.waitForFunction(() => document.activeElement && document.activeElement.id === 'stageBack');
  await page.click('#stageBack');
  await page.waitForFunction(() => document.getElementById('signalStage').hidden && document.activeElement.id === 'enterSignal');
  assert.equal(await page.evaluate(() => document.body.classList.contains('leaving')), false);
  assert.deepEqual(errors, [], 'no CSP or script errors');
  await context.close();
});
```

- [ ] **Step 8: Run the smoke tests**

Run: `node --test --test-name-pattern="Enter Signal|reduced motion" "smoke/*.test.js" 2>&1 | tail -5`
Expected: `# pass 2`. A "Refused to frame" error means the CSP edit is wrong.

- [ ] **Step 9: Commit**

```bash
git add assets/hub/stage.js tests/unit/stage.test.js index.html assets/hub.css tests/smoke/hub.smoke.test.js
git commit -m "feat: Enter Signal full-screen crossfade stage

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Full verification and screenshots

**Files:** none, unless a fix is needed.

- [ ] **Step 1: Full suites, run once each**

Run: `cd tests && npm run unit 2>&1 | tail -4 && npm run smoke 2>&1 | tail -4`
Expected: unit `# pass 38`; smoke `# pass 23` (19 existing plus 4 new); `# fail 0` for both.

- [ ] **Step 2: Screenshots for the owner**

With a Playwright script in the scratchpad, using the same static-server approach as the smoke test and the Signal routes stubbed, capture `#front` and `#about` in Light and Dark at 1280×900 and 390×844. That is 8 PNGs, saved to the scratchpad. Look at each once and check:
- there is no hard horizontal edge under the masthead
- panels are light in Dark, with navy text
- the lead story banner and trace thumbnails are still dark, with readable white text
- the logo, photo and LinkedIn buttons are visible
- at 390px, LinkedIn and Enter Signal are icon-only and the masthead does not overflow

- [ ] **Step 3: Fix anything found, then commit with an exact `git add`**

A likely candidate is white text inside a panel that relied on dark `--ink`. Give that element an explicit `color: #fff` only if it sits on its own dark background.

- [ ] **Step 4: Report**

Report:
- the commit list (`git log --oneline main..HEAD`)
- the test counts
- the screenshot paths

Do not push. Pushing needs the owner's explicit yes.
