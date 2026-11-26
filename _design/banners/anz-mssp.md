# Cover banner: ANZ MSSP Landscape (`anz-mssp`)

**Metaphor:** a carillon played across a map. One player at a single keyboard rings bells spread over Australia and New Zealand, because the wires do the heavy work. That is the briefing's thesis: automation breaks the link between headcount and revenue, so one analyst can serve many clients across two markets from one console.

## Main prompt

A map of Australia and New Zealand seen from directly above, carved as raised landmasses with crisp, recognisable coastlines, the Tasman Sea between them shown as plain white. On a small round stone platform in the Tasman Sea, one carillonneur sits upright on a plain wooden bench at a wooden baton keyboard, both hands on the batons. From the keyboard, taut teal wires fan out across the sea to small bronze bells standing on wooden frames at points across both countries: many across Australia, fewer across New Zealand's two islands. A few bells are mid-swing, with small hot magenta sound arcs radiating from their rims. A kangaroo stands upright in the Australian outback, ears turned towards a ringing bell, and a kiwi bird stands beside a bell on New Zealand's North Island. The scene is calm, orderly and a little magical.

Style: hand-carved linocut print, with bold gouged lines, carved contour ripples along the coastlines, visible carving texture and flat blocks of ink colour.

Palette led by deep navy #12244A for the landmasses, frames, animals and outlines, bright teal #00E5D0 for the wires, the keyboard and the coastline ripples, and hot magenta #FF2D9A for the sound arcs, with white highlights and only faint neutral tints otherwise. The two landmasses and the platform form one self-contained shape isolated on a pure white #FFFFFF background, with no ocean colour, no sky, no grid lines, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas, readable as a thumbnail. No text, letters, numbers, place names, compass labels, logos or watermarks. Aspect ratio 7:6.

Avoid: church crosses or religious symbols, aged parchment, sea monsters, compass roses, padlocks, shields, hooded hackers, binary code, glowing brains, flat vector style, engraving style, gouache style, woodblock style, cut-paper style, mosaic style, claymation style, risograph style, antique map style, chromolithograph style.

## Alternative (agriculture domain)

A beekeeper in a plain veiled hat and long coat stands upright on a small grassy island, tending a long row of wooden hives with one smoker held in a raised hand. A gentle teal smoke trail curls from the smoker along the whole row. A second, smaller island sits just behind, linked by a slim footbridge, with its own shorter row of hives. Hot magenta bees fly neat loops between the hives and a single shared honey store at the centre.

Style: cyanotype photogram print, with the subject in crisp silhouette and fine tonal detail, tinted to the house palette.

Palette led by deep navy #12244A for the islands, hives and the keeper, bright teal #00E5D0 for the smoke trail and the footbridge, and hot magenta #FF2D9A for the bees, with white highlights and only faint neutral tints otherwise. The two islands are one self-contained shape isolated on a pure white #FFFFFF background, with no sea to the edges, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas. No text, letters, numbers, logos or watermarks. Aspect ratio 7:6.

Avoid: stings or swarms on the keeper, map outlines of real countries, padlocks, shields, binary code, flat vector style.

## Install, once the image exists

1. Whiten near-white pixels (every channel 242 or higher becomes `#FFFFFF`), resize to 1000px wide, and save as `Research/anz-mssp/cover.webp` (quality about 86).
2. Add `"cover": "cover.webp"` to `Research/anz-mssp/meta.json`. Add `<figure class="cover-art cover-art-wide"><img src="cover.webp" width="…" height="…" alt="…"></figure>` above the kicker, and point `og:image` at the cover (it currently uses the hub logo).
3. Run `node scripts/research.cjs build` (it also rebuilds the catalog), then check the cover in light and dark themes, and on the hub's Research tab.
4. Update this briefing's row in `_design/banners/README.md` to "Live", noting which prompt was used.
