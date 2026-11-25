# Hub: news images and the Signal look

Date: 2026-11-25. Status: implemented on branch news-images.
Builds on `2026-11-25-hub-front-page-redesign-design.md` (shipped in PR #15).

## Goal

Give the hub the visual identity of Signal, its own news backend. That means glowing drifting colour bubbles, live "instrument" readouts and a signal trace, plus real images on news stories. It replaces the current flat look, which the owner considers lacking in personality.

## Scope

In scope:
1. News images (already built on the `news-images` branches in both repos, not yet merged).
2. A Signal trace as the default banner when a story has no image.
3. The Signal visual language across the hub (items A–H below).
4. A moving wave under the active tab.
5. A new wordmark.

Out of scope, parked for the next design pass: the official logo, the About photo and the LinkedIn links. The owner will supply the logo and photo files.

## 1. News images (built)

- **Signal:** `build_news.py` adds an optional `image` field to each item, an absolute https URL.
  - Source order: the feed's own image (media:content, media:thumbnail, an image enclosure, or the first `<img>` in the description). Failing that, the article page's `og:image` or `twitter:image`.
  - Article page fetches are limited: https only, public hosts only (re-checked on every redirect, at most 3 redirects), 512 KB per page, 10 s per page, 60 s per run, and at most 30 new fetches per run.
  - Results are cached in `image-cache.json`, which the workflow commits.
- **Hub:**
  - `newsItems` keeps `image` only when it is https.
  - The lead story shows the image as its banner. News tab rows show a 96×64 thumbnail.
  - The live wire stays text-only.
  - Images load lazily (except the lead), send no referrer, and are removed if they fail to load.
  - CSP `img-src 'self' https:`, accepted by the owner as the cost of loading images straight from publishers.

## 2. Default banner: Signal trace

Shown inside `.lead-art` whenever the lead story has no image, or its image fails to load. It is generated in the browser as inline SVG, with no image files.

- **Plate:** a deep navy gradient (`#070F1F` to `#0D1F3C`) with 2–3 blurred glow bubbles in Signal colours. No grid lines.
- **Trace:** one glowing line whose shape comes from the lane. Cyber is a smoothed spike pattern, AI is a flowing sine-like wave, Geopolitics is a softened stepped line.
  - Peak positions and amplitudes come from a hash of the story title, so two stories never look the same.
  - A white glowing marker sits on the highest peak.
- **Overlays:**
  - Top left: the "ThinkInfoSec Signal" wordmark.
  - Top right: a pill with the source name.
  - Bottom left: a monospace readout, `● CYBER · CH-01 · 14:32 UTC`. The lane word is in the lane colour; the time is the story time in UTC.
- **Mini variant:** the same plate and trace at thumbnail size, with no overlays. Used by item F.
- The banner keeps its dark plate in both themes. White and pale-teal text on it stays at 7:1 or better.

Code: a new pure function `HubLib.traceSpec(item)` returns the path data, marker position and colours, and is unit-tested for determinism and lane shape. Building the SVG nodes happens in `render.js` (`traceBanner(item, {mini})`) using `createElementNS`, never `innerHTML`.

## 3. Signal visual language

Palette moves to Signal's tokens:
- Light (default): background `#F8F4FB` to `#E3F1F8`, ink `#12244A`, muted `#3A4D72`.
- Dark: background `#070F1F` to `#0D1F3C`, ink `#EAF2FA`, muted `#C9D6E6`.
- Lane text colours:

| Lane | Light | Dark |
|---|---|---|
| Teal (Cyber) | `#036A7C` | `#5fe9f5` |
| Magenta (AI) | `#B0125B` | `#ff8cc0` |
| Gold (Geopolitics) | `#7a4f00` | `#f5c542` |

There are no grid lines anywhere. Hairline rules between list rows are replaced by spacing, and groups sit on frosted panels.

- **A. Glow bubbles:** a fixed background layer of 4–6 large blurred radial orbs (pink `#FF2D78`, teal `#00BFCF`, blue `#4C8DE0`, violet `#9B7BFF`) drifting slowly, as on Signal.
  - Blend mode is `multiply` in Light and `screen` in Dark.
  - `pointer-events: none`, `aria-hidden`.
- **B. Frosted panels:** panels, cards, the wire and empty states use a glass surface. Light: `rgba(255,255,255,.86)`. Dark: `rgba(13,31,60,.62)`. Both use `backdrop-filter: blur`.
  - Where `backdrop-filter` is unsupported, fall back to a solid panel colour.
- **C. "Signal live" pill** in the masthead: a pulsing teal dot, `SIGNAL LIVE`, the story count and the time since the last update.
  - When showing the cached copy: grey dot, `SIGNAL SNAPSHOT · <time>`.
  - When unavailable: grey dot, `NO SIGNAL`.
  - It replaces the current status text, and keeps `aria-live="polite"` on the text.
- **D. Readout type:** section labels (kickers), source/time lines and the masthead date use Space Mono with a `●` marker before lane labels. Headlines and body text stay in the current sans.
- **E. Channel numbers:** wire and News rows show `CH-02`, `CH-03` and so on, in place of `02`. The lead is CH-01.
- **F. Trace thumbnails:** any card or row that would show an image but has none gets the mini trace in its section colour. This covers research, Medium, guides and News rows. Videos always have YouTube thumbnails.
- **G. "Listening for signal":** loading, offline and empty states show a flat-line trace with a soft pulse and readout wording. For example: `LISTENING FOR SIGNAL… showing the last snapshot from 13:58`, or `LISTENING FOR SIGNAL… no headlines in this lane yet`.
- **H. Dark parity:** every item above exists in Dark. Traces, the live dot and the banner get a soft glow (`drop-shadow`) in Dark only.

## 4. Moving wave under the active tab

Replaces the flat rule and the underline under the tab bar.

- **Base wave:** a faint blue sine wave across the full width, drifting slowly (6 s, back and forth).
- **Pulse:** a brighter teal-to-pink pulse, about 240 px wide, sits centred under the selected tab and ripples gently (1.8 s amplitude breathing).
  - On tab change it slides to the new tab (0.7 s ease-in-out).
  - It is repositioned on resize and when the fonts finish loading (`document.fonts.ready`).
- **Accessibility:**
  - The tab state is still carried by `aria-selected`, and the selected tab keeps a non-motion cue (ink colour and weight).
  - The wave SVG is `aria-hidden`.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, nothing drifts or ripples, and the pulse jumps without a transition.
- **Code:** `tabs.js` gets a small `placePulse(tab)` hook; the CSS in `hub.css` does the animation.

## 5. Wordmark

- "ThinkInfoSec Hub" set in **DM Sans 300**: "Think" in ink, "InfoSec" in magenta (`#B0125B` Light, `#ff8cc0` Dark), "Hub" smaller at 70% opacity.
  - It replaces the bold teal mark in the masthead and in the banner overlay (the overlay reads "ThinkInfoSec Signal").
- **Fonts are self-hosted** in `assets/fonts/` as woff2, with their OFL licence files: DM Sans 300 (Latin subset) and Space Mono 400/700.
  - `font-display: swap`.
  - The CSP is unchanged: `font-src 'self'` already covers them.

## Accessibility and contrast

- Every text colour is at least 4.5:1, checked against the worst case of a glow bubble tinting the frosted panel behind it.
  - Light measured: muted 6.8, teal 5.0, magenta 5.4, gold 5.7.
  - Dark worst case: muted 7.9, teal 8.0, magenta 5.4, gold 7.2.
- No pale blue or cyan text on blue backgrounds.
- `tests/unit/contrast.test.js` is extended to these tokens and to a "tinted panel" background for each theme.
- Decorative layers (bubbles, traces, waves) are all `aria-hidden` and are never the only carrier of meaning.

## Testing

- **Unit:**
  - `traceSpec` is deterministic per title, differs between titles, follows the lane shape and keeps coordinates in bounds.
  - Channel numbering.
  - The status pill states.
  - Contrast tokens.
- **Smoke (Playwright, fixtures):**
  - The trace banner appears when the lead has no image and when its image 404s.
  - The pulse moves under the newly selected tab (its transform changes).
  - Reduced motion: no running animations (`getAnimations()` is empty for the wave and the orbs).
  - Wordmark font loaded (`document.fonts.check('300 16px "DM Sans"')`).
  - No console or CSP errors.
- **Screenshots:** Light and Dark at 1280 and 390 wide, reviewed once.

## Delivery

- One hub branch continuing from `news-images`, which already has the images commit.
- The Signal `news-images` branch is unchanged by this spec.
- Merge order: Signal PR, then hub PR.
