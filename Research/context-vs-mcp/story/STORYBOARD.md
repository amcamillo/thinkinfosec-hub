# Stop feeding the window — cinematic storyboard

Companion scroll-story to `../index.html`. Source of truth for every number: the article.
Built on the hub shell (header, theme toggle, tokens from `assets/hub.css`) as a starting
point only; everything inside the story follows the narrative.

## The image is the argument

The cover already contains the whole thesis, so the story never leaves it. It takes it apart.

| In the glass | In the article |
|---|---|
| Left figure, hands on the basin | Front-loading: you decide what's in the window, once |
| The basin | The context window |
| Water and scrolls pouring over the rim | Stuffed context: everything, whether needed or not |
| Right figure, cup under the tap | Fetching just in time: the agent decides, per step |
| The tap | The MCP tool |
| The magenta ribbon on the tap | Identity / authorisation on the fetch (OAuth 2.1, "OPTIONAL" in spec) |
| The cup | One step's worth of retrieved chunks |
| **Lead lines between panes** | **Provenance**: the boundary that says where each piece came from |

That last row is the big idea. Stained glass is pieces held apart by lead. Compaction melts
the lead. Fetching keeps it.

Palette is already on-brand: basin navy `--bg2`, water `--acc`, ribbon `--mag`.

## Running device: the window gauge

A thin vertical gauge on the basin's rim, counting tokens in the left-hand window.
It climbs through scenes 2–4, hits **150,000** (the API's default compaction trigger),
collapses to the summary, and in scene 6 the right-hand cup reads **2,000**.
It's not a decorative readout: every value it shows comes from the article.

## Scenes

### 0 · The question — *enter: none (static)*
- Number: the four stat tiles (18 · 39% · 150k · 5), shown as they appear in the article.
- Image: the full cover, still, inside the normal hub header. Plays it completely straight.
- Beat 2: the lead lines alone light up, faintly cyan. The colour drains. You see it's pieces.
- Line: **"Every window is made of pieces."**

### 1 · Three ways in — *enter: the glass splits down the spout*
- Number: who decides what's in the window.
- Image: the two halves drift apart. Left: scrolls pour into the basin whether needed or not.
  Right: the cup fills only when a hand lifts it to the tap.
- Narration ends on Anthropic's own tell: at a threshold, project knowledge "will automatically enable RAG mode".
  The vendor stops pouring and starts fetching.

### 2 · The rot — *enter: water rises*
- Number: 20 → 50 documents = ~1.5% better (GPT-3.5) for 2.5× the tokens. 18 models, Chroma.
- Image: one scroll is the answer. As more scrolls pour in, the panes of that scroll lose their
  colour, more in the middle of the basin than at the rim (the U-curve of Lost in the Middle).
  Gauge climbs.
- Honesty line: "Illustrative, after Liu et al. and Chroma; not a model run."

### 3 · The guess — *enter: slam*
- Number: 1 in 365 (guess a birthday) vs 0 (say "I don't know").
- Image: near-identical scrolls surface: last quarter's policy, a similar clause. A hand reaches in
  and lifts the wrong one, and it carries the right seal.
- Line: **"It uses your words. That's why you believe it."**
- Honesty line: the chain from rot to confident wrong answer is the author's read.

### 4 · Compaction — *enter: the basin hits the rim*
- Number: 150,000 in. What comes back: root `CLAUDE.md`, up to 5 files, skills capped at 5,000 each / 25,000 total.
- Image: the gauge hits 150k. The water drains. Every pane in the basin melts into one small,
  dull summary pane. Only what's **carved into the stone** of the basin (re-injected from disk) comes back sharp.
- Log-scale bars from the article reused as the stone's carved inscription.

### 5 · The laundering — *enter: re-leading*  ← the turn
- Number: none. This scene is about a boundary disappearing.
- Image A: one pane came from outside (a poisoned page), tinted slightly wrong. Compaction re-leads
  the window, and that pane comes out **the same colour as everything else**. Scrub back and forth:
  you can't find it.
- Image B: a mid-session rule ("don't touch the production config") is a magenta pane. Each compaction
  bleaches it a little more. Three firings and it's clear glass.
- Line: **"The lead was the provenance."**
- Honesty line: the author's own analysis; not yet demonstrated end to end.

### 6 · Why fetch — *enter: the camera swings to the right figure*
- Number: 150,000 → 2,000 tokens (98.7%, Anthropic's example) · 78.5% (AIMultiple, independent).
- Image: the basin drains down into one cup. Five panes of the cup light up in turn: freshness,
  access control (the ribbon), provenance (each pane keeps its lead), audit, a smaller window.
- Gauge: the cup reads 2,000.

### 7 · The cost — *enter: tear*
- Number: three legs of the lethal trifecta.
- Image: the ribbon frays. The tap's description has a hidden pane in it (tool poisoning). Then two more
  taps appear: untrusted content, an outbound channel. When all three pour into one cup, the cup leaks.
- Line: **"Uploads fail silently. Fetching fails where you can see it."**

### 8 · RAG over MCP — *enter: cutaway*
- Number: 49% fewer failed retrievals, 67% with reranking (Anthropic, own top-20 setup).
- Image: the plinth goes transparent. Pipes from source systems, a valve that checks the ribbon
  (identity) and filters by ACL **before** water reaches the cup, chunks arriving with their lead intact.

### 9 · When to use which — *enter: line*
- The one lever: drag the divider between basin and tap. Feed it material types
  (one policy, two contracts, a 100-page standard, a changing ticket queue, a permissioned SharePoint).
  Each lands on the side the article's decision rule puts it.

### 10 · Return and hold — *enter: reassemble*
- The cover again, whole, back in the plain hub frame. Feels finished.
- Question left on screen: **"What does your agent start with?"**
- After a few seconds, one pane in the basin glints the wrong colour. The scene 5 pane is still there.

## Build notes

- Pieces come from the image itself: lead lines thresholded and labelled into individual panes
  (first pass: 158 usable regions from the figures). The basin and water need a colour-aware
  pass because the navy is close to the lead's luminance.
- Rendering: one Canvas 2D scene engine driven by scroll position. No WebGL; a sprite atlas of panes
  is enough for melt, bleach, drift and re-lead effects.
- Security: self-hosted only, no third-party scripts or fonts, strict CSP via meta, no analytics.
- Accessibility: `prefers-reduced-motion` shows each scene's end state as a static frame plus narration;
  full narration is real text, not baked into canvas.
- Dark default, light variant via the hub toggle. No telemetry-style strings anywhere.
