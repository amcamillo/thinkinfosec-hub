# Hub brand pass and Signal blend: design

**Date:** 2026-11-25
**Status:** approved in mockups (brainstorm companion v5)
**Builds on:** `2026-11-25-hub-signal-look-design.md` (shipped in PR #16)

## Goal

Make the hub look official and personal, and make it feel like one product with Signal:

1. the official logo in the masthead, the footer and the favicon
2. the owner's photo in About
3. LinkedIn visible in three places
4. Signal's animated background, fading smoothly to near-white at the top, so there is no hard band under the masthead
5. an **Enter Signal** button that crossfades into Signal full screen, and back

## Non-goals

- No change to tabs, the tab wave, the Signal pill, the news pipeline or the card content.
- No change to Signal's repo. Signal is embedded as-is.
- No regeneration or redraw of the logo. It is the owner's asset; we only resize it.

## 1. Brand assets

All files are generated once with Pillow from the existing tracked sources and committed under `assets/brand/`. The generator script is committed as `tools/brand-assets.py` so the files can be rebuilt.

| File | Source | Treatment |
|---|---|---|
| `logo-96.webp`, `logo-192.webp` | `assets/thinkinfosec-logo.png` | crop (12,14,w-12,h-14), circle mask, transparent outside |
| `favicon-32.png`, `favicon-180.png` | same | as above; 180 is also the `apple-touch-icon` |
| `photo-160.webp`, `photo-320.webp` | `assets/your-photo.png` | see below |

**Photo treatment:**
- Remove the background by flood fill from the image edges, matching only pure black (`max(r,g,b) < 10`) and the white halo (`min(r,g,b) > 185`). A looser black threshold eats the dark shirt and the neck shadow. This happened in v4 and must not regress.
- Erode the mask 5px (MinFilter 5), feather it 1.2px, and composite over a light vertical gradient from `#FAE4F0` at the top to `#DEF0F8` at the bottom.
- Crop a circle centred at (196, 240) with radius 178, so the neck and shirt run to the bottom edge.
- The same light background is used in both themes.

## 2. Background: Signal blend

Layers, back to front, all `position: fixed`, `pointer-events: none`, `aria-hidden`:

1. **Body gradient:** unchanged (the mesh plus the `--bg` to `--bg2` linear gradient).
2. **Orbs:** unchanged.
3. **Paint canvas** `#paint`: a port of Signal's painterly flow-field canvas (`signal.js`, "Painterly canvas" section) into a new classic script, `assets/hub/paint.js` (`HubPaint`).
   - Same palette, sprite cache, flow field, spawn and dissolve logic.
   - Renders at half resolution, about 30 fps, and pauses when `document.hidden`.
   - Light uses `multiply` blending; Dark uses `screen`. On theme change, clear the canvas and the strokes.
   - Reduced motion: spawn every 2600 ms and cap at 4 strokes, as Signal does.
   - If `getContext('2d')` fails, do nothing; the page still looks right without it.
4. **Vignette** `.vignette`: a radial fade to `--bg` at the edges.
5. **Top wash** `.top-wash`: 340px tall. It is a linear gradient of `--top` from solid at 0 to 30%, 55% at 62%, and transparent at 100%.
   - Light: `--top: #FFFDFE`.
   - Dark: `--top: #070F1F`.

## 3. Masthead

- Remove the glass panel: no `backdrop-filter` and no opaque `--glass` slab.
- The masthead stays sticky. Its background is a gradient of `--top`: solid to 55%, 70% at 78%, transparent at 100%. Add 40px of bottom padding so the fade happens below the tab wave. When scrolled, content slides under a soft fade, not an edge.
- Left side: the logo badge (`logo-96.webp` shown at 48px, round, with a magenta ring and glow), then the existing wordmark and dateline.
- Right side, in this order:
  1. the existing Signal pill
  2. a **LinkedIn** pill (a small blue "in" mark plus the label)
  3. the **Enter Signal ⤢** button
  4. the existing theme toggle
- Narrow screens (≤ 720px): the LinkedIn pill and the Enter Signal button collapse to icon-only, each keeping an `aria-label`.

## 4. Panels

- Cards, the search box, the About card and the chips stop using translucent glass. They use `--solid`:
  - Light: `rgba(255,255,255,.92)`.
  - Dark: `rgba(236,242,250,.94)`. Panels stay light in Dark.
- In Dark, light panels set their own light-theme ink tokens: `--ink: #0D1F3C`, the muted text token `#3d4b66`, and the accent `#C4146F`. Their shadow deepens to `0 10px 40px rgba(0,0,0,.35)`.
- Exceptions that stay dark, with white text: the lead story banner, the trace banners and thumbnails, and image overlays.
- Contrast: every text token on `--solid` must meet 4.5:1 or better in both themes. Add this to the existing contrast unit test. Expected values: about 15:1 for ink, about 8:1 for muted text, about 5.5:1 for the accent.

## 5. About

The About panel becomes a single card:
- On the left, the photo (`photo-320.webp` shown at 150px, round, with a magenta ring and a teal glow). The alt text is the owner's name. It is `loading="lazy"` with explicit `width` and `height`.
- On the right, the name in DM Sans 300, a monospace role line ("Security · AI · ThinkInfoSec"), and the existing two bio paragraphs, unchanged.
- The call-to-action row: **Connect on LinkedIn** as a solid `#0A66C2` button with white text, then YouTube, Medium, Podcast and Discord as quiet pills.
- At ≤ 640px the card stacks, with the photo centred above the text.

## 6. Footer

Add the logo at 28px on the left. Keep "ThinkInfoSec · thinkinfosec.org", and add a LinkedIn button on the right.

All LinkedIn links point to `https://www.linkedin.com/in/amcamillo/` with `target="_blank" rel="noopener noreferrer"`.

## 7. Enter Signal: full-screen crossfade

**Markup:**
- The button is a real link: `<a id="enterSignal" href="https://thinkinfosec.github.io/Signal/">`. Without JS it simply navigates.
- A stage element, hidden until the button is clicked: `<div id="signalStage" role="dialog" aria-modal="true" aria-label="Signal" hidden>`. It contains a **Back to hub** button and an `<iframe title="Signal" allow="autoplay; fullscreen" allowfullscreen>` with no `src` until first use.

**New script** `assets/hub/stage.js` (`HubStage`):
- **Open:**
  - `preventDefault`, then set the iframe `src` (once) and add `body.leaving`, which fades and blurs `.page` to 0 over 700 ms (opacity, `blur(8px)`, `scale(1.015)`).
  - After 450 ms, show the stage. It fades from 0 to 1 over 900 ms on a navy (`#070F1F` to `#0D1F3C`) base, so the iframe's loading time looks like part of the fade.
  - Call `stage.requestFullscreen()`. If it is rejected, carry on, since the stage is already viewport-sized.
  - Set the hub content `inert` and move focus to Back.
- **Close** (triggered by Back, by Escape while focus is in the hub document, or by `fullscreenchange` leaving full screen):
  - Fade the stage out, exit full screen if it is active, remove `body.leaving` after 500 ms, clear `inert`, and return focus to the button.
  - Close must be idempotent.
- Keep the iframe loaded after closing, so reopening is instant.
- **Reduced motion:** opacity only, 200 ms, with no blur or scale.

**Security:**
- The CSP gains `frame-src https://thinkinfosec.github.io`. Nothing else changes: `script-src` stays `'self'`, and no inline script or style is added.
- The iframe has no `sandbox`, because Signal needs scripts, audio and fullscreen. It is a same-owner origin that is already trusted for `connect-src`. Accepted.
- GitHub Pages does not send `X-Frame-Options`, so the embedding works today. If Signal ever starts refusing to be framed, the button still works as a plain link (the no-JS path).

## 8. Files

**New:**
- `assets/brand/*`
- `assets/hub/paint.js`
- `assets/hub/stage.js`
- `tools/brand-assets.py`

**Modified:**
- `index.html`: CSP, favicon links, the paint, vignette and wash layers, masthead, About, footer, stage, and script tags
- `assets/hub.css`

**Untouched:**
- `Research/*`. The owner has uncommitted edits there.

## 9. Testing

**Unit (`node:test`):**
- Contrast of the `--solid` panel tokens in both themes.
- `HubStage` state: open then close leaves no `inert` and no `leaving`; a double close is a no-op; the `src` is set only once. Run against a minimal DOM stub, following the existing unit test style.

**Playwright smoke** (reinstall Playwright in `tests/` first). New checks:
- The logo image, favicon and About photo load with status 200.
- There are three LinkedIn links, all pointing to the correct URL.
- Clicking Enter Signal shows the stage, the iframe gets the Signal URL, and Back hides the stage and returns focus to the button.
- There are no CSP violations in the console.
- The masthead's computed `backdrop-filter` is `none`.

**Screenshots:** Light and Dark at 1280px and 390px, for the owner's review.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Paint canvas cost on low-end devices | Half resolution, 30 fps cap, pause while hidden, reduced-motion caps |
| Autoplay audio inside the iframe | Signal already waits for a user gesture through its start overlay. The click that opens the stage also counts as a gesture inside the hub only, so Signal's overlay still shows. Acceptable |
| Escape typed inside the iframe never reaches the hub | Full-screen Escape fires `fullscreenchange`, which closes the stage; otherwise use the visible Back button |
