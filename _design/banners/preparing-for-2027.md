# Cover banner: Preparing for 2027 (`preparing-for-2027`)

**Metaphor:** the fable's race, rerun for 2027. The hare (the adversary, 29 minutes) has already crossed the finish line. A messenger (the 72-hour report) is still running. The tortoise (the 30-day statutory clock) plods on, and its shell is a neat stack of tabbed ledger pages, the dated evidence the regulator will ask for. The point is not to beat the hare. It is to arrive with your working shown.

## Main prompt

A long curving racetrack seen from a gentle three-quarter view above, ending at a finish line marked by a slack ribbon. A sleek hare, glowing hot magenta at its edges, has already burst through the ribbon and is bounding away. Halfway down the track, a small messenger in a plain tunic runs upright carrying a sealed scroll. Near the start, a calm tortoise walks steadily forward, and its shell is a tidy stack of tabbed ledger pages tied with a teal ribbon, each tab a blank coloured slip. Small teal milestone posts line the track at even intervals. The scene is light and gently comic.

Style: vintage chromolithograph storybook illustration, with soft printed colour, fine outline work and a slightly faded paper finish on the figures only.

Palette led by deep navy #12244A for the track edges, outlines and shadows, bright teal #00E5D0 for the tortoise's ribbon and the milestone posts, and hot magenta #FF2D9A for the hare's glow and the finish ribbon, with white highlights and only faint neutral tints otherwise. The track is a self-contained curving strip isolated on a pure white #FFFFFF background, with no grass to the edges, no crowd, no sky, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas, readable as a thumbnail. No text, letters, numbers, dates, clock faces with numerals, logos or watermarks. Aspect ratio 7:6.

Avoid: a stopwatch or hourglass as the main subject, injured animals, hunting, padlocks, shields, binary code, flat vector style, engraving style, gouache style, woodblock style, cut-paper style, mosaic style, claymation style, risograph style, antique map style.

## Alternative (mechanical domain)

A clockmaker's mechanism laid open as a single self-contained assembly: three meshed gears of very different sizes on one brass plate. The smallest gear spins so fast it is a hot magenta blur. A medium gear turns steadily. The largest gear turns slowly, and a fine teal paper tape feeds out from it, punched with an even row of holes like a dated record. A small hand-cranked lever sits beside it, untouched.

Style: technical blueprint drawing, with white and teal linework on deep navy, dimension arrows without numbers, and crisp drafting hatching, set as a navy plate.

Palette led by deep navy #12244A for the plate, bright teal #00E5D0 for the linework and the tape, and hot magenta #FF2D9A for the fast gear, with white highlights and only faint neutral tints otherwise. The navy blueprint plate has rounded corners and is isolated on a pure white #FFFFFF background, with no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas. No text, letters, numbers, dimensions, logos or watermarks. Aspect ratio 7:6.

Avoid: clock faces, explosions, broken teeth, padlocks, shields, binary code, flat vector style.

## Install, once the image exists

1. Whiten near-white pixels (every channel 242 or higher becomes `#FFFFFF`), resize to 1000px wide, and save as `Research/preparing-for-2027/cover.webp` (quality about 86).
2. Add `"cover": "cover.webp"` to `Research/preparing-for-2027/meta.json`. Add `<figure class="cover-art cover-art-wide"><img src="cover.webp" width="…" height="…" alt="…"></figure>` above the kicker, and point `og:image` at the cover (it currently uses the hub logo).
3. Run `node scripts/research.cjs build` (it also rebuilds the catalog), then check the cover in light and dark themes, and on the hub's Research tab.
4. Update this briefing's row in `_design/banners/README.md` to "Live", noting which prompt was used.
