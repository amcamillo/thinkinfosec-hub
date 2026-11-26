# Cover banner: NCSC Top 10 and the Falcon boundary (`ncsc-top-10-crowdstrike`)

**Metaphor:** the map is not the territory. An antique chart shows an archipelago of ten islands, one per control. A surveyor's lamp floods part of the chart with teal light, and those islands look fully charted. A dashed boundary line marks where that light stops. Beyond it, the islands are only outlined, and a small surveyor stands upright on one of them with a tripod instrument, walking it himself and leaving magenta flags. The light is real coverage. The rest of the territory still has to be walked by whoever owns it.

## Main prompt

An antique sea chart laid flat and seen from slightly above, showing an archipelago of ten distinct islands of varied shapes scattered across open water. A brass surveyor's lamp at one corner of the chart casts a cone of bright teal light across the nearer islands, which are richly detailed with contour lines and hatching. A hot magenta dashed line curves across the chart where the light stops. Beyond it, the remaining islands are drawn only as pale outlines. On one of those far islands, a tiny surveyor stands upright beside a tripod theodolite, with a short trail of small magenta flags behind him marking where he has already walked. Delicate rhumb lines radiate across the water. The scene is quiet and precise.

Style: hand-tinted antique cartographic plate, with fine pen linework, stippled coastlines and watercolour washes.

Palette led by deep navy #12244A for the linework, the water hatching and the shadows, bright teal #00E5D0 for the lamp's light and the charted islands, and hot magenta #FF2D9A for the boundary line and the flags, with white highlights and only faint neutral tints otherwise. The chart is a self-contained shape with soft deckled edges, isolated on a pure white #FFFFFF background, with no table, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas, readable as a thumbnail. No text, letters, numbers, place names, cartouches, compass letters, logos or watermarks. Aspect ratio 7:6.

Avoid: sea monsters, dragons, birds of prey, ships, storms, padlocks, shields, binary code, a globe, flat vector style, engraving style, gouache style, woodblock style, cut-paper style, mosaic style, claymation style, risograph style.

## Alternative (philosophical domain)

Diogenes and his lantern: a long classical colonnade of ten marble columns recedes in a gentle diagonal. An old philosopher in a plain robe walks upright along it, holding up a lantern whose bright teal circle of light reaches only the nearest few columns. Where the light ends, a hot magenta chalk line runs across the floor. Beyond it, a second figure stands upright at a far column, holding a plumb line against it, checking the column himself.

Style: charcoal and soft pastel drawing on smooth paper, with smudged tonal shading and crisp highlights.

Palette led by deep navy #12244A for the charcoal shading and shadows, bright teal #00E5D0 for the lantern light, and hot magenta #FF2D9A for the chalk line, with white highlights and only faint neutral tints otherwise. The colonnade is isolated on a pure white #FFFFFF background, with no sky or landscape to the edges, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas. No text, letters, numbers, inscriptions, logos or watermarks. Aspect ratio 7:6.

Avoid: ruins or collapse, a barrel, nudity, weapons, padlocks, shields, binary code, flat vector style.

## Install, once the image exists

1. Whiten near-white pixels (every channel 242 or higher becomes `#FFFFFF`), resize to 1000px wide, and save as `Research/ncsc-top-10-crowdstrike/cover.webp` (quality about 86).
2. Add `"cover": "cover.webp"` to `Research/ncsc-top-10-crowdstrike/meta.json`. Add `<figure class="cover-art cover-art-wide"><img src="cover.webp" width="…" height="…" alt="…"></figure>` above the kicker, and point `og:image` at the cover (it currently uses the hub logo).
3. Run `node scripts/research.cjs build` (it also rebuilds the catalog), then check the cover in light and dark themes, and on the hub's Research tab.
4. Update this briefing's row in `_design/banners/README.md` to "Live", noting which prompt was used.
