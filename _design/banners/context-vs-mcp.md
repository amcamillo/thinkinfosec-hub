# Cover banner: context-vs-mcp ("Stop feeding the window")

**Metaphor:** One reading desk, two ways to know things. On one side a scholar has the whole library piled on the desk and can't find the page. On the other, a pneumatic tube from the stacks delivers the one page asked for, already labelled with where it came from.

## Main prompt

A cut-away reading room seen from slightly above. On the left half, a scholar sits upright on a tall wooden chair at a desk buried under a teetering mountain of open books, loose pages and scrolls in deep navy (#12244A), some pages sliding off the edge, a few faded and blank. On the right half, the same desk is clear: a brass pneumatic-tube system runs from the wall into a neat receiving slot, and a single glowing teal (#00E5D0) capsule has just arrived, opening to show one page tied with a small hot-magenta (#FF2D9A) provenance tag. A thin teal tube network climbs the wall behind toward unseen stacks. White highlights on the brass and the capsule.
Style: mid-century screen-print poster, flat overlapping ink layers, slight registration offset, visible paper grain only inside the shapes.
Palette led by deep navy #12244A, bright teal #00E5D0 and hot magenta #FF2D9A, with white highlights; navy carries the weight, teal and magenta are accents; other colours only as faint neutral tints. Subject isolated on pure white #FFFFFF background: no scenery to the edges, no border, no vignette, no frame. One clear focal subject filling about 85% of the canvas, readable as a small thumbnail. No text, letters, numbers, logos or watermarks anywhere. Aspect ratio about 7:6 (1400 x 1200).
Avoid: padlocks, shields, hooded hackers, binary rain, glowing brains, robots, readable writing on the pages, tubes or pipes touching the scholar's body.

## Alternative prompt (philosophical domain)

The two springs of the Greek underworld, Lethe and Mnemosyne, as a single sculpted fountain. On the left, a wide navy (#12244A) basin overflows with a heavy flood of water in which half-dissolved scrolls and pages swirl and blur. On the right, a slender standing figure in a long robe draws one clear cup of teal (#00E5D0) water from a narrow spout labelled only by a small hot-magenta (#FF2D9A) ribbon tied around the spout. The figure stands upright, holding the cup at chest height with both hands. White highlights on the water surfaces.
Style: stained-glass window, bold dark leading lines, flat translucent colour panes, isolated as a free-standing panel shape.
Palette led by deep navy #12244A, bright teal #00E5D0 and hot magenta #FF2D9A, with white highlights; navy carries the weight, teal and magenta are accents; other colours only as faint neutral tints. Subject isolated on pure white #FFFFFF background: no scenery to the edges, no border, no vignette, no frame. One clear focal subject filling about 85% of the canvas, readable as a small thumbnail. No text, letters, numbers, logos or watermarks anywhere. Aspect ratio about 7:6 (1400 x 1200).
Avoid: padlocks, shields, hooded hackers, binary rain, glowing brains, robots, faces in the water, water coming from any figure.

## Install steps, once the image is supplied

1. Whiten near-white pixels (every channel 242 or higher becomes `#FFFFFF`) and save as `Research/context-vs-mcp/cover.webp` (quality about 88).
2. Add `"cover": "cover.webp"` to `Research/context-vs-mcp/meta.json`, add a `<figure class="cover-art">` with descriptive alt text above the kicker, and add an `og:image` meta pointing at it.
3. Run `node scripts/research.cjs build`, then check the cover in light and dark themes.
4. Mark this briefing's row in `_design/banners/README.md` as "Live", noting which prompt was used.
