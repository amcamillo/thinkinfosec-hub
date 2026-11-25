# Cover banner: PHP2Shell and the runtime (`php2shell`)

**Metaphor:** one grafted fruit tree carries many different fruits (WordPress, Drupal, Joomla), but they all draw on the same root. The flaw is in the root, so pruning the branches (updating the CMS) changes nothing.

## Main prompt

A single old fruit tree with many grafted branches, each bearing a different kind of fruit: pears, plums, lemons, apples and figs on one trunk. A gardener stands upright beside it on a short wooden ladder, carefully trimming one branch with shears, absorbed in the work. Below the ground line the soil is cut away in a clean arc to show the root system, and the roots turn gradually into fine bundled cables. Deep in the root ball, a single bright hot-magenta fracture glows through the main root, unseen by the gardener. Small teal leaves and teal highlights on the fruit tie the canopy together. The ground is only a thin strip of soil under the tree, not a landscape.

Style: vintage botanical gouache painting with visible brushwork and soft paper grain, like a hand-painted plate from an old horticultural society journal.

Palette led by deep navy #12244A for the trunk, roots and cables, bright teal #00E5D0 for leaves and highlights, and hot magenta #FF2D9A for the glowing fracture and a few ripe fruits, with white highlights and only faint neutral tints otherwise. The tree and its root ball are isolated on a pure white #FFFFFF background, with no sky, no horizon, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas, readable as a thumbnail. The gardener stands upright on the ladder. No text, letters, numbers, labels, logos or watermarks. Aspect ratio 7:6.

Avoid: rot, worms, insects, decay or anything slimy; root or branch shapes that look anatomical; a cross-section of a building; padlocks, shields, bugs drawn as insects, binary code, engraving style, flat vector style.

## Alternative (celestial domain)

A total solar eclipse seen close up. A dark navy moon covers the face of the sun (the firewall rule), but the sun's corona still flares out past the moon's edge in long hot-magenta and teal streamers. Small, carefully drawn satellites and rack-mounted servers float in a loose ring around the eclipse, and the streamers reach past the moon to touch several of them. The moon is perfect and calm; the light behind it is not contained.

Style: two-colour risograph print with slight misregistration and grainy halftone texture.

Palette led by deep navy #12244A, bright teal #00E5D0 and hot magenta #FF2D9A, with white highlights and only faint neutral tints otherwise. Isolated on a pure white #FFFFFF background, with no star field to the edges, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas. No text, letters, numbers, logos or watermarks. Aspect ratio 7:6.

Avoid: a face on the sun or moon, glowing globes, padlocks, shields, binary code, engraving style, flat vector style.

## Install, once the image exists

1. Whiten near-white pixels (every channel 242 or higher becomes `#FFFFFF`), resize to 1000px wide, and save as `Research/php2shell/cover.webp` (quality about 86).
2. Add `"cover": "cover.webp"` to `Research/php2shell/meta.json`. Add `<figure class="cover-art cover-art-wide"><img src="cover.webp" width="…" height="…" alt="…"></figure>` above the kicker, and point `og:image` at the cover (it currently uses the hub logo).
3. Run `node scripts/research.cjs build`, then check the cover in light and dark themes, and on the hub's Research tab.
4. Update this briefing's row in `_design/banners/README.md` to "Live", noting which prompt was used.
