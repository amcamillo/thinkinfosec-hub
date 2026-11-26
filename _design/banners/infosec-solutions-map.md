# Cover banner: CrowdStrike Alliance Landscape (`infosec-solutions-map`)

**Metaphor:** a walled town seen as an architect's model. The central keep is the platform. Around it, fourteen quarters hold the seventy domains: some buildings are cut from the keep's own navy stone (native modules), some are timber annexes bolted on by outside builders (alliance partners), and a few are workshops where craftspeople come in to do the job (services). The map's question is the town planner's question: who built each house, and who keeps it standing?

## Main prompt

An isometric architectural model of a round walled town, seen from above at a gentle angle. At the centre stands a tall navy stone keep with a teal-lit doorway. Around it, the town is divided by straight lanes into many small quarters. Most buildings are cut from the same navy stone as the keep. Others are timber annexes joined onto them, wrapped in hot magenta scaffolding, with small builders standing upright on ladders and walkways fitting new beams. A few open-fronted workshops show craftspeople at workbenches. Thin teal lanes run from every quarter back to the keep. The whole town sits on a clean round base, like a planner's model.

Style: isometric architectural watercolour, with fine pen outlines, soft washes and crisp white paper showing through the highlights.

Palette led by deep navy #12244A for the keep, stone buildings and outlines, bright teal #00E5D0 for the lanes and the keep's doorway, and hot magenta #FF2D9A for the scaffolding, with white highlights and only faint neutral tints otherwise. The round model base is isolated on a pure white #FFFFFF background, with no landscape, no sky, no table, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas, readable as a thumbnail. No text, letters, numbers, signs, flags with emblems, logos or watermarks. Aspect ratio 7:6.

Avoid: castles under siege, weapons, fire, ruins, padlocks, shields, hooded hackers, binary code, glowing globes, flat vector style, engraving style, gouache style, woodblock style, cut-paper style, mosaic style, claymation style, risograph style, antique map style, chromolithograph style, linocut style.

## Alternative (zoology domain)

A calm elephant walks upright across a small, self-contained patch of savanna ground. Its broad back carries a whole community: oxpecker birds perched along its spine, cattle egrets stepping beside its feet, and a small heron riding on its shoulder. The elephant's skin is deep navy with fine texture; the birds are white with teal and hot magenta accents on their wings and beaks. A few teal grasses rise around its feet.

Style: Mughal miniature painting, with fine brushwork, flat jewel-like colour and delicate patterned detail.

Palette led by deep navy #12244A for the elephant and outlines, bright teal #00E5D0 for the grasses and wing accents, and hot magenta #FF2D9A for the beaks and a few wing tips, with white highlights and only faint neutral tints otherwise. The ground patch is isolated on a pure white #FFFFFF background, with no horizon, no sky, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas. No text, letters, numbers, logos or watermarks. Aspect ratio 7:6.

Avoid: hunting, tusks as weapons, ornate borders, padlocks, shields, binary code, flat vector style.

## Install, once the image exists

1. Whiten near-white pixels (every channel 242 or higher becomes `#FFFFFF`), resize to 1000px wide, and save as `Research/infosec-solutions-map/cover.webp` (quality about 86).
2. Add `"cover": "cover.webp"` to `Research/infosec-solutions-map/meta.json`. Add `<figure class="cover-art cover-art-wide"><img src="cover.webp" width="…" height="…" alt="…"></figure>` above the kicker, and point `og:image` at the cover (it currently uses the hub logo).
3. Run `node scripts/research.cjs build` (it also rebuilds the catalog), then check the cover in light and dark themes, and on the hub's Research tab.
4. Update this briefing's row in `_design/banners/README.md` to "Live", noting which prompt was used.
