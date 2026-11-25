# ThinkInfoSec Hub: front-page redesign

Date: 2026-11-25. Status: draft for review.

## Goal

Replace the single scrolling page at amcamillo.github.io/thinkinfosec-hub with a tabbed, editorial front page. It should hold clear news headlines from Signal, research (hub briefings plus the Medium archive), YouTube videos, tools and a growing Guides & Assets library. The layout takes ideas from sintesetech.com, such as filters for each news lane and labels showing where each story came from. It does not copy that site's layout, text or styling.

Approved mockups are in `.superpowers/brainstorm/582-1795555081/content/` (`front-page-themes.html` and `dark-contrast-v2.html`).

## Decisions

- Layout: "Front page" (option A). A masthead, a top tab bar, a large lead story and a numbered live wire beside it.
- Themes: dark and light, using the higher-contrast dark set. Light is the default for every first visit (owner decision, 2026-11-25); the user's choice is then remembered in `localStorage`. This replaces the Legacy/Modern switch.
- Build: a tabbed shell with split files and hash routing. No build step. The site stays static on GitHub Pages.
- Medium and YouTube data: a GitHub Actions workflow in Signal writes `media.json`.

## Kept from the current hub

- One search box across the whole catalogue.
- Outcomes shown first. It becomes a band on the front page and the first group on the Tools tab.
- The tool origin filters: This site / Live elsewhere / Source.
- Cards are built from `catalog/corpus.json` and `taxonomy.json`. The People / Processes / Technology taxonomy is unchanged.
- Accessibility: headings for screen readers, `aria-pressed` on filters, and a live region announcing search results.
- Existing URLs under `Research/`, `tools/` and `Learn/` stay where they are.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Shell: masthead, tab bar, search, one `<section role="tabpanel">` per tab, CSP meta |
| `assets/hub.css` | Theme tokens (`[data-theme=dark]` and `[data-theme=light]`), layout, components |
| `assets/hub/theme-init.js` | Sets `data-theme` before first paint (an external file, because the CSP forbids inline script) |
| `assets/hub/theme.js` | The Dark/Light toggle; saves the choice |
| `assets/hub/lib.js` | Pure data logic, unit tested in Node |
| `assets/hub/app.js` | Wires data to renderers |
| `assets/hub/tabs.js` | Hash routing (`#front #news #research #videos #tools #guides #about`), ARIA tabs, arrow and Home/End keys |
| `assets/hub/feeds.js` | Fetches `news.json` and `media.json`, caches them in `localStorage`, reports when the data is stale |
| `assets/hub/render.js` | Card, list and grid renderers. Inserts text with `textContent` only |
| `assets/hub/search.js` | One index across corpus, news and media items, with type filters |

An unknown hash falls back to `#front`. The old anchors `#outcomes` and `#learn` redirect to `#tools` and `#guides`.

## Tabs

- **Front page:** the Outcomes band, the lead Signal story with summary, source and age, a live wire of the next four headlines, and a row with the latest research, Medium article, YouTube video and guide.
- **News:** the full Signal feed, with chips for All / Cyber / Geopolitics / AI. Signal's world lane is filtered in the hub to stories that bear on cyber or AI (a keyword list in `lib.js`); sport and unrelated world news are dropped. The Signal display itself is unchanged. Each item shows its lane label, headline, source and how long ago it was published. A footer shows when the snapshot was built.
- **Research:** hub briefings and Medium articles merged and sorted newest first, with chips for All / Hub / Medium. Medium items carry an external ↗ marker.
- **Videos:** a grid of 16:9 thumbnails with title, date and a link that opens on YouTube. Nothing is embedded, so no YouTube script loads.
- **Tools:** Outcomes tools first, then the origin filters.
- **Guides & Assets:** chips for Guides & how-tos (including Helpful links; the prompt-injection techniques page stays under Tools), Diagrams & cheat sheets, and Templates & downloads.
- **About:** the about and connect content.

## Palette

The dark set uses a near-black background `#02050b`, panels `#0f2547`, panel borders `#2f4f86`, body text white, secondary text `#d3dcea` (14.8:1), accent `#00BFCF` and accent text `#5fe9f5`. Accent text is used only on the black background. Labels on navy panels are white. Magenta is `#FF3D9A` for fills and `#ff7ab8` for text.

The light set uses background `#f6f8fb`, panels white, text `#0D1F3C`, secondary text `#4a5a72`, accent fill `#00BFCF`, accent text `#007C87` and magenta text `#B0125B`.

There is no pale blue or cyan text on any blue background. Every text and background pair must reach at least 4.5:1.

## Data

### Signal (`c:\dev\Signal`)

- Add `scripts/build_media.py`. It reads `https://medium.com/feed/@andrecamillo` (the `@amcamillo` feed is empty; the existing links use `andrecamillo.medium.com`) and the YouTube RSS feed for `@thinkinfosecorg` (`feeds/videos.xml?channel_id=UCK5IydDSpf-Yz7qCmVjDN5Q`).
- Each item has the shape `{id, kind: "article"|"video", title, url, ts, summary?, thumb?, minutes?}`.
- New items are merged into `media.json` by `id` and old items are never dropped. The 13 curated Medium rows in `corpus.json` act as the backfill. Research shows those rows plus every article the feed has returned since the job started. To list an older article, add its URL to `corpus.json`.
- Publishing moves to GitHub Actions in the Signal repo. `refresh-news.yml` (the owner's draft, every 15 min) and the new `refresh-media.yml` (every 6 h, since there is at most one new article and one new video a day) each run the unit tests, build, and commit only if something changed. They share the `signal-publish` concurrency group without cancelling, and rebase before pushing to `main`. The local `publish_news.ps1` scheduled task is retired by the owner once the workflows are live.
- A failure in `build_media.py` is logged and does not block the news publish.

### Hub

- The hub fetches `https://thinkinfosec.github.io/Signal/news.json` and `/media.json`. GitHub Pages sends `Access-Control-Allow-Origin: *`.
- `corpus.json` keeps its existing kinds (`tool`, `research`, `writing`, `learn`), because `tools/corpus-map` reads them. It gains optional fields: `featured` and `points` (the Outcomes band), `group` (`guide`, `diagram` or `template`), and `date` (YYYY-MM-DD). It also accepts the new kinds `guide`, `diagram` and `template` for future items.
- `build_news.py` adds an https `link` to each news item, because headlines need a URL and today's `news.json` has none.
- Feed XML that declares a DTD is refused before parsing.

## Failure and safety

- If a fetch fails, the hub shows the cached copy labelled "Signal snapshot from <time>". If there is no cache, the panel shows an empty state and the other tabs keep working.
- News older than 6 hours shows a stale notice.
- All feed text is plain text set with `textContent`. Only `https:` links are accepted. External links use `rel="noopener noreferrer"`.
- The CSP allows `default-src 'self'`. `connect-src` allows `'self'` and `https://thinkinfosec.github.io`. `img-src` allows `'self'` and any `https:` host (publisher images from Signal news items).

## Testing

- Playwright smoke tests:
  - each tab renders, including when opened from a direct link
  - the theme toggle survives a reload
  - search returns items of every kind
  - with the feed routes blocked, the cached snapshot or the empty state is shown
- A contrast script that checks every token pair in both themes is at least 4.5:1.
- A unit test of `build_media.py`'s merge using saved RSS fixtures: no duplicates, and old items are kept.

## Out of scope

- A newsletter or email capture.
- Comments or accounts.
- Embedded video players.
- Changing the internal layout of the research pages.
