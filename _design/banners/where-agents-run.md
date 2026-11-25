# Cover banner: Your agent is not the model (`where-agents-run`)

**Metaphor:** the Delphic oracle only speaks. The real work happens out of sight, in machinery beneath the temple floor, which is exactly where the article says your EDR can't see.

## Main prompt

A cut-away view of a small classical Greek temple, shown as a cross-section. Above the floor, the oracle of Delphi is seated upright on a high-backed marble chair, in a dignified side view, veiled and calm, holding a laurel branch in her lap. Beside her, on its own, stands a tall bronze tripod holding a shallow bowl, from which a curl of bright teal vapour rises upward like words she will never act on. She speaks toward a brass speaking horn mounted on the temple wall at head height, a little distance from her. Its narrow brass pipe runs straight down inside the wall into the floor. Below the floor, revealed by the cut, is a hidden machine room: brass gears, server racks and many articulated mechanical arms in hot magenta, busy pulling levers, typing on a keyboard and opening a door to the outside. The pipe from the wall ends in a horn above the machines. Nothing touches the oracle or her chair. The temple's columns and stonework are deep navy line work.

Style: fine copperplate engraving with hand-applied ink-and-wash colour, like a plate from an eighteenth-century encyclopaedia of machines.

Palette led by deep navy #12244A, bright teal #00E5D0 and hot magenta #FF2D9A, with white highlights and only faint neutral tints otherwise. The cut-away temple is isolated on a pure white #FFFFFF background, with no ground plane to the edges, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas, readable as a thumbnail. No text, letters, numbers, logos or watermarks. Aspect ratio 7:6.

Avoid: squatting or crouching poses, the oracle sitting on the tripod, any hose, cable or pipe attached to her body or chair, padlocks, shields, glowing brains, humanoid robots, binary code, a modern office, flat vector style.

## Alternative (astrological domain)

The constellation of Gemini drawn as a celestial-atlas plate: the twin figures traced in fine navy line work with teal stars at their joints. One twin, Castor, gazes upward and points at the sky, thinking. The other, Pollux, has turned away and reaches down with a hot magenta hand into a small, detailed data-centre aisle floating beneath the constellation, his fingers on a server's open drawer. The twins remain joined at the shoulder, and only one of them touches the machine.

Style: hand-coloured celestial atlas engraving, like a plate from a seventeenth-century star atlas.

Palette led by deep navy #12244A, bright teal #00E5D0 and hot magenta #FF2D9A, with white highlights and only faint neutral tints otherwise. Isolated on a pure white #FFFFFF background, no star field to the edges, no border, no vignette, no frame. One clear focal subject filling about 85% of the canvas. No text, letters, numbers, zodiac glyphs, logos or watermarks. Aspect ratio 7:6.

Avoid: mirrored faces in profile (used by Double Agents), padlocks, shields, binary code, flat vector style.

## Install, once the image exists

1. Whiten near-white pixels (every channel 242 or higher becomes `#FFFFFF`) and save as `Research/where-agents-run/cover.webp` (quality about 88).
2. Add `"cover": "cover.webp"` to `Research/where-agents-run/meta.json`. Add `<figure class="cover-art"><img src="cover.webp" width="…" height="…" alt="…"></figure>` above the kicker, and point `og:image` at the cover (it currently uses the hub logo).
3. Run `node scripts/research.cjs build`, then check the cover in light and dark themes.
4. Update this briefing's row in `_design/banners/README.md` to "Live", noting which prompt was used.
