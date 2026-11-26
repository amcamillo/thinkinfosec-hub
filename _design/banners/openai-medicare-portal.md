# Cover banner: When goals become the threat vector (`openai-medicare-portal`)

**Metaphor:** water always finds a way. A small paper boat (the agent's goal) floats down a stream until a closed wooden sluice gate (the portal's refusal) stops it. The gate holds, but the water, and the boat with it, simply finds a side channel through the reeds and arrives at the pond beyond. The refusal didn't end the goal; it only changed the route.

## Main prompt

A small miniature landscape seen from a gentle three-quarter view above: a narrow stream runs from the left toward a sturdy closed wooden sluice gate with an iron wheel on top. The gate holds firm, and the main stream stops in a still pool in front of it. But just beside the gate, a new narrow side channel has cut through the reeds and grass, glowing hot magenta along its bed, and a small folded paper boat is calmly sailing along it, already past the gate. Beyond the gate, the channel opens into a small round pond where a few floating paper charts and folders drift on the water. A tiny gatekeeper stands upright beside the closed gate, looking at it proudly, facing the wrong way. The scene is calm and gently comic.

Style: stop-motion plasticine (claymation) miniature, with soft modelled clay textures, visible fingerprints and tool marks, and warm studio lighting.

Palette led by deep navy #12244A for the gate, the deep water and the shadows, bright teal #00E5D0 for the stream and the pond, and hot magenta #FF2D9A for the side channel, with white for the paper boat and charts and only faint neutral greens and browns otherwise. The miniature landscape is a rounded island of clay, isolated on a pure white #FFFFFF background, with no table, no backdrop, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas, readable as a thumbnail. No text, letters, numbers, labels, logos or watermarks; the charts are blank shapes. Aspect ratio 7:6.

Avoid: flooding, a broken or burst dam, drowning, insects, anything slimy, humanoid robots, padlocks, shields, binary code, engraving style, gouache style, woodblock style, cut-paper style, mosaic style, flat vector style.

## Alternative (philosophical domain)

Inspired by Kafka's parable "Before the Law": a tall, grand doorway with a doorkeeper standing upright in front of it, arms folded, firmly barring the way. Nobody is waiting at the door, though. Around the side of the gatehouse, a small brass wind-up figure with a winding key in its back has already walked along the wall and is stepping calmly through a small open back window, which glows hot magenta. A neat teal path of small footprints leads from the front of the door, around the corner, to the window.

Style: black-and-white linocut with two spot colours, bold carved lines and slightly uneven ink.

Palette led by deep navy #12244A, bright teal #00E5D0 and hot magenta #FF2D9A, with white highlights and only faint neutral tints otherwise. The gatehouse is isolated on a pure white #FFFFFF background, with no street or sky to the edges, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas. No text, letters, numbers, signs, logos or watermarks. Aspect ratio 7:6.

Avoid: a break-in with tools, broken glass, weapons, a humanoid robot, padlocks, shields, binary code, flat vector style.

## Install, once the image exists

1. Whiten near-white pixels (every channel 242 or higher becomes `#FFFFFF`), resize to 1000px wide, and save as `Research/openai-medicare-portal/cover.webp` (quality about 86).
2. Add `"cover": "cover.webp"` to `Research/openai-medicare-portal/meta.json`. Add `<figure class="cover-art cover-art-wide"><img src="cover.webp" width="…" height="…" alt="…"></figure>` above the kicker, and point `og:image` at the cover (it currently uses the hub logo).
3. Run `node scripts/research.cjs build`, then check the cover in light and dark themes, and on the hub's Research tab.
4. Update this briefing's row in `_design/banners/README.md` to "Live", noting which prompt was used.
