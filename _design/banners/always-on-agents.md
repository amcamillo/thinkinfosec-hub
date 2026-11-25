# Cover banner: Always-on agents through a security lens (`always-on-agents`)

**Metaphor:** a grand hotel's front desk after midnight. The clerk's chair is empty (the user has closed the laptop), but three clockwork birds (dots, Muse, Grok Bot) keep working: lifting keys off the key wall and carrying them out into the night. One bird carries a whole ring of keys (Grok Bot's one shared computer). The only thing that can stop them is the guest register on the desk, the identity plane every key has to pass through.

## Main prompt

A grand hotel front desk at night, seen straight on. Behind the desk rises a tall wooden wall of pigeonholes, each holding a brass room key on a tag. The clerk's chair is empty, with a folded jacket over its back and a small reading lamp still on. Three small brass clockwork birds with visible winding keys are busy at the key wall: one lifts a single key out of its pigeonhole, one flies toward an open arched window carrying a key in its beak, and one carries a whole heavy ring of keys at once. Out on the desk lies a large open guest register with a teal ribbon bookmark and a brass bell beside it, and a thin teal thread runs from the register to every pigeonhole. One key, carried toward the window, glows hot magenta. Calm, quiet and a little uncanny.

Style: layered cut-paper diorama, with each plane cut from coloured card and set at a slightly different depth, crisp paper edges and soft drop shadows between layers.

Palette led by deep navy #12244A for the key wall, desk and shadows, bright teal #00E5D0 for the register's thread, ribbon and lamp light, and hot magenta #FF2D9A for the one glowing key, with brass and white highlights and only faint neutral tints otherwise. The desk and key wall are isolated on a pure white #FFFFFF background, with no room walls to the edges, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas, readable as a thumbnail. No text, letters, numbers, labels, logos or watermarks; the key tags and the register's pages are blank. Aspect ratio 7:6.

Avoid: a sleeping or slumped person, a bedroom, a bed, humanoid robots, glowing brains, padlocks, shields, binary code, engraving style, gouache style, woodblock style, flat vector style.

## Alternative (mythological domain)

Odin's two ravens, Huginn and Muninn (thought and memory), shown leaving through a tall arched doorway at dawn, with a third raven, in brass, joining them. The carved wooden high seat behind them is empty, a cloak folded across its arm. One raven flies out with a sealed letter; another returns carrying a letter sealed in hot magenta wax. At the doorway stands a tall teal-lit gatepost carved with a single blank tally board, which every raven must fly past.

Style: stained-glass window with bold navy lead lines, translucent coloured glass panes and light shining through.

Palette led by deep navy #12244A, bright teal #00E5D0 and hot magenta #FF2D9A, with white highlights and only faint neutral tints otherwise. The window shape is isolated on a pure white #FFFFFF background, with no surrounding wall, no border, no vignette and no frame. One clear focal subject filling about 85% of the canvas. No text, runes, letters, numbers, logos or watermarks. Aspect ratio 7:6.

Avoid: Odin himself, an eye, blood, weapons, a dead or injured bird, padlocks, shields, binary code, flat vector style.

## Install, once the image exists

1. Whiten near-white pixels (every channel 242 or higher becomes `#FFFFFF`), resize to 1000px wide, and save as `Research/always-on-agents/cover.webp` (quality about 86).
2. Add `"cover": "cover.webp"` to `Research/always-on-agents/meta.json`. Add `<figure class="cover-art cover-art-wide"><img src="cover.webp" width="…" height="…" alt="…"></figure>` above the kicker, and point `og:image` at the cover (it currently uses the hub logo).
3. Run `node scripts/research.cjs build`, then check the cover in light and dark themes, and on the hub's Research tab.
4. Update this briefing's row in `_design/banners/README.md` to "Live", noting which prompt was used.
