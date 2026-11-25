# ThinkInfoSec hub

Live site: [https://amcamillo.github.io/thinkinfosec-hub/](https://amcamillo.github.io/thinkinfosec-hub/)

## Front page

`index.html` is a tabbed shell. Cards come from `catalog/corpus.json` (rebuild `catalog/catalog.js` after editing). News and the Medium and YouTube lists come from `news.json` and `media.json`, published by the Signal repo at `https://thinkinfosec.github.io/Signal/`.

The page uses the Signal look: drifting glow bubbles, frosted panels, a live signal pill, a trace banner on stories without an image, and a moving wave under the active tab. Fonts (DM Sans 300, Space Mono 400/700) are self-hosted under `assets/fonts` (SIL OFL). All motion stops under `prefers-reduced-motion: reduce`.

Tests: `cd tests && npm install && npx playwright install chromium`, then from the repo root `node --test "tests/unit/*.test.js" "tests/smoke/*.test.js"`.
