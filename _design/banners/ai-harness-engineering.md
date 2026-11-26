# Cover banner: The harness is the control plane (`ai-harness-engineering`)

**Metaphor:** a sailing ship. The wind (the model) supplies the power, but the rigging, the rudder and the crew's ropes (the harness) decide where the ship actually goes. The rope ladder up the mast has rungs (the paper's H0 to H3 ladder) and a fifth rung that is only sketched in (this briefing's H4 trust boundary). The paper assumes a benign sea; a magenta-sailed boat slipping out of the fog is the adversary it never models.

## Main prompt

A single tall sailing ship seen side-on, sails full, on a narrow band of calm sea. A stylised gust of wind, drawn as flowing teal curls from the left, fills the sails. The ship's rigging is the star of the picture: dense, carefully drawn ropes, pulleys and stays, with a navigator standing upright at the wheel and two sailors upright on deck hauling lines. Up the main mast runs a rope ladder with four solid rungs, each a little higher, and a fifth rung at the top drawn only as a dotted outline, unfinished. Off the stern, half hidden in a low bank of white fog, a small boat with a hot-magenta sail is quietly approaching, unseen by the crew.

Style: Roman floor mosaic made of small stone and glass tesserae, with visible grout lines, slightly uneven tiles and a hand-laid feel.

Palette led by deep navy #12244A for the hull, rigging and sea, bright teal #00E5D0 for the wind and the sail highlights, and hot magenta #FF2D9A for the small boat's sail, with white and pale stone tiles for highlights and only faint neutral tints otherwise. The ship, its strip of sea and the fog bank are isolated on a pure white #FFFFFF background, with no horizon line to the edges, no mosaic border, no vignette and no frame. One clear focal subject filling about 85% of the canvas, readable as a thumbnail. No text, letters, numbers, flags with symbols, logos or watermarks. Aspect ratio 7:6.

Avoid: a storm, a shipwreck, pirates with weapons, skull-and-crossbones flags, tentacles or sea monsters, a horse harness, padlocks, shields, binary code, engraving style, gouache style, woodblock style, cut-paper style, flat vector style.

## Alternative (philosophical domain)

Plato's chariot from the Phaedrus: a charioteer standing upright in a light two-wheeled chariot, holding the reins of two winged horses, one calm and one pulling hard against the harness. The reins and harness straps are drawn in glowing teal, clearly the thing that steers. Along the road ahead lie four low stone steps and a fifth step drawn only as an outline. Off to one side, a hot-magenta shape stands across the road ahead, half hidden behind a rock, which the charioteer has not seen.

Style: embroidered medieval-style tapestry with visible stitching, wool texture and slightly naive drawing.

Palette led by deep navy #12244A, bright teal #00E5D0 and hot magenta #FF2D9A, with white highlights and only faint neutral tints otherwise. Isolated on a pure white #FFFFFF background, with no landscape to the edges, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas. No text, letters, numbers, logos or watermarks. Aspect ratio 7:6.

Avoid: a whip, a fallen or injured horse, a crash, weapons, padlocks, shields, binary code, flat vector style.

## Install, once the image exists

1. Whiten near-white pixels (every channel 242 or higher becomes `#FFFFFF`), resize to 1000px wide, and save as `Research/ai-harness-engineering/cover.webp` (quality about 86).
2. Add `"cover": "cover.webp"` to `Research/ai-harness-engineering/meta.json`. Add `<figure class="cover-art cover-art-wide"><img src="cover.webp" width="…" height="…" alt="…"></figure>` above the kicker, and point `og:image` at the cover (it currently uses the hub logo).
3. Run `node scripts/research.cjs build`, then check the cover in light and dark themes, and on the hub's Research tab.
4. Update this briefing's row in `_design/banners/README.md` to "Live", noting which prompt was used.
