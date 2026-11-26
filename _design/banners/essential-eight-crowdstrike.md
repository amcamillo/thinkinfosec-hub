# Cover banner: Essential 8 and CrowdStrike Falcon Ecosystem (`essential-eight-crowdstrike`)

**Metaphor:** the loom is not the cloth. A great wooden floor loom has eight harness frames, one per strategy, and they all weave one fabric. A bright mechanical flying shuttle (the platform) races across some of the warp threads and carries the yarn, but whole bands of the cloth only take shape where the seated weaver ties, sets and checks the threads by hand. The tool does real work. The pattern, and whether the cloth holds, belongs to the weaver.

## Main prompt

A large wooden floor loom seen from a gentle three-quarter view, with eight upright harness frames in a row, each strung with taut warp threads. A sleek mechanical flying shuttle glowing bright teal is mid-flight across the warp, trailing a teal thread through the first few frames. Beyond those, several frames hold threads that the shuttle has not reached. A weaver sits upright on a sturdy wooden bench in front of the loom, both hands raised, calmly tying a hot magenta thread into one of those frames, with a pattern card propped on the breast beam. The finished cloth rolls toward the viewer, woven in eight bands of navy, teal and magenta that interlock into one fabric. The scene is calm and absorbed.

Style: risograph print with two or three overlapping ink layers, visible grain, slight misregistration and flat halftone shading.

Palette led by deep navy #12244A for the loom frame, the shadows and the darkest bands, bright teal #00E5D0 for the shuttle and its thread, and hot magenta #FF2D9A for the weaver's thread and its band in the cloth, with white highlights and only faint neutral tints otherwise. The loom and weaver are isolated on a pure white #FFFFFF background, with no room, no floor to the edges, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas, readable as a thumbnail. No text, letters, numbers, labels, logos or watermarks; the pattern card shows only blank squares. Aspect ratio 7:6.

Avoid: tangled or snapped threads, spiders or webs, a humanoid robot, padlocks, shields, checklists with ticks, binary code, flat vector style, engraving style, gouache style, woodblock style, cut-paper style, mosaic style, claymation style.

## Alternative (mythological domain)

Theseus in the labyrinth, seen from above as a cut-away: a square labyrinth of eight chambers on one winding route. A bright teal thread, Ariadne's, is laid neatly along the path through every chamber, from the entrance to the centre. The thread shows the way, but only one chamber is lit: there a young hero stands upright with a lamp, walking the route himself. A small hot magenta glow marks the chambers he has already crossed, a trail of light behind him. The rest of the route waits, thread laid but unwalked.

Style: ancient Greek red-figure vase painting, with figures and walls reserved against a dark ground, fine black relief lines and a flat frieze composition, adapted to the palette.

Palette led by deep navy #12244A for the walls and the ground, bright teal #00E5D0 for the thread, and hot magenta #FF2D9A for the walked chambers, with white highlights and only faint neutral tints otherwise. The labyrinth is a self-contained square isolated on a pure white #FFFFFF background, with no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas. No text, letters, numbers, Greek lettering, logos or watermarks. Aspect ratio 7:6.

Avoid: the Minotaur, any monster or combat, weapons, blood, nudity, padlocks, shields, binary code, flat vector style.

## Install, once the image exists

1. Whiten near-white pixels (every channel 242 or higher becomes `#FFFFFF`), resize to 1000px wide, and save as `Research/essential-eight-crowdstrike/cover.webp` (quality about 86).
2. Add `"cover": "cover.webp"` to `Research/essential-eight-crowdstrike/meta.json`. Add `<figure class="cover-art cover-art-wide"><img src="cover.webp" width="…" height="…" alt="…"></figure>` above the kicker, and point `og:image` at the cover (it currently uses the hub logo).
3. Run `node scripts/research.cjs build`, then rebuild the catalog, and check the cover in light and dark themes, and on the hub's Research tab.
4. Update this briefing's row in `_design/banners/README.md` to "Live", noting which prompt was used.
