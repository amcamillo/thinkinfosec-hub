# Cover banner: Kernel-Access Redesigned (`kernel-access-redesigned`)

**Metaphor:** Saturn's rings as the protection rings. Ring 0 is the ring closest to the planet, where the guards used to live and where one stumble scorched the whole planet. Each platform has moved its watch post a different way: one keeps it close but sealed in glass (Linux, eBPF), one has moved it out to an outer ring with a window back in (macOS, Endpoint Security), and one is still being towed outward, half-built (Windows, WESP). Saturn is also the astrological ruler of boundaries and structure.

## Main prompt

The planet Saturn seen at a gentle tilt, with its wide ring system sweeping across the frame. On the innermost ring, nearest the planet, a row of empty iron brackets shows where watchtowers once stood, and a faint hot-magenta scorch mark on the planet's surface sits just above them. Three small watch stations now ride the rings, each different. Close in, a tiny lantern-lit watch post sits sealed inside a clear glass bell jar, still on an inner ring. Further out, on the outermost ring, a small round observatory with a large teal-lit window looks back toward the planet. Between them, a third watch post is being towed outward along the rings by a small tug, still wrapped in wooden scaffolding, unfinished. A few tiny keepers stand upright at their stations. The scene is calm and orderly.

Style: Japanese woodblock print (ukiyo-e) with visible wood grain, flat layered colour and fine carved outlines, like a Meiji-era print of a night landscape.

Palette led by deep navy #12244A for the planet's bands and the outlines, bright teal #00E5D0 for the rings' highlights and the observatory window, and hot magenta #FF2D9A for the scorch mark and the lanterns, with white highlights and only faint neutral tints otherwise. Saturn and its rings are isolated on a pure white #FFFFFF background, with no star field to the edges, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas, readable as a thumbnail. No text, letters, numbers, labels, logos or watermarks. Aspect ratio 7:6.

Avoid: explosions, fire, a face on the planet, astronauts in spacesuits, rockets, padlocks, shields, binary code, glowing brains, engraving style, gouache style, flat vector style.

## Alternative (physical domain)

Two mountaineers on a steep glacier ridge, both standing upright. For years they were roped together, and the old rope still lies coiled between them, frayed and cut cleanly through. Each climber is now clipped to their own anchor driven into the ice, with separate teal ropes. A third anchor nearby is only half driven in, with its rope not yet attached. Below the ridge a magenta crevasse glows faintly where a single fall once pulled both climbers down. Fate sharing, undone one anchor at a time.

Style: Art Nouveau travel-poster lithograph with flowing outlines and flat, softly graded colour.

Palette led by deep navy #12244A, bright teal #00E5D0 and hot magenta #FF2D9A, with white highlights and only faint neutral tints otherwise. The ridge is isolated on a pure white #FFFFFF background, with no sky, no mountain range to the edges, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas. No text, letters, numbers, logos or watermarks. Aspect ratio 7:6.

Avoid: anyone falling, injury, ropes around necks or bodies in a way that reads as binding, padlocks, shields, binary code, flat vector style.

## Install, once the image exists

1. Whiten near-white pixels (every channel 242 or higher becomes `#FFFFFF`), resize to 1000px wide, and save as `Research/kernel-access-redesigned/cover.webp` (quality about 86).
2. Add `"cover": "cover.webp"` to `Research/kernel-access-redesigned/meta.json`. Add `<figure class="cover-art cover-art-wide"><img src="cover.webp" width="…" height="…" alt="…"></figure>` above the kicker, and point `og:image` at the cover (it currently uses the hub logo).
3. Run `node scripts/research.cjs build`, then check the cover in light and dark themes, and on the hub's Research tab.
4. Update this briefing's row in `_design/banners/README.md` to "Live", noting which prompt was used.
