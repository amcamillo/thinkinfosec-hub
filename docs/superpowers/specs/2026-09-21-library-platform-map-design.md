# Library platform map

**Date:** 2026-09-21  
**Page:** `Learn/helpful-links/`  
**Status:** approved for implementation

## Goal

Replace the sticky sideways pillar chips with a wrapping 14-tile GTM map and a collapsible Falcon Core Stack. Tiles filter Datasheets (01), Demos (04), and How-tos (05). Expanding the stack shows the same `falcon-core` template as the hub diagram builder. Clicking a module jumps to that product’s cards.

## Non-goals

- Iframe or embed `tools/diagram-builder/` chrome (toggles, export bar, telemetry template).
- PNG / image-map export.
- Changing numbered sections, search, Intro / Deploy / Tools / More, or the datasheet corpus.
- Making the Core Stack’s seven columns equal the 14 GTM tiles. Extra GTM tiles (Network, Email, OT, GRC, AppSec) filter without a matching column.

## Placement

Sticky bar keeps **section nav + search only**. Chips and `.sticky-filter` go away.

A **platform map** sits at the top of `<main>`, above section 01, not sticky:

1. Label: “Filter datasheets, demos, and how-tos”.
2. **All pillars** control plus **14 wrapping tiles** (same `PILLARS` list as today, native / hybrid / partner colour).
3. `<details>` closed by default: summary “Show Falcon Core Stack”. Open state shows the Core Stack on a **light canvas** (builder tokens) so it reads as the ThinkInfoSec diagram, not a second chip row.

## Click model

| Control | Action |
|---|---|
| All pillars | `activePillar = "all"`, clear product focus, re-render 01 / 04 / 05 |
| GTM tile | `activePillar = that id`, clear product focus, re-render. Pressed tile uses the same selected treatment as today’s chips |
| Core Stack module | Highlight the mapped GTM tile. If the module has a match string, set `productFocus` and show matching cards **across pillars** (so Exposure Management still appears even though the tile is GRC). If the match is empty, behave like a tile click on that pillar. Scroll to `#datasheets`. |
| Search | Unchanged; combines with pillar and product focus |

Product focus matches a card if `title` or `domain` contains the match string (case-insensitive). If nothing matches, keep the mapped pillar filter and still scroll to datasheets.

Open the `<details>` when a module is clicked so the selected block stays visible.

## Core Stack source

Do **not** live-load the builder page.

Copy the `falcon-core` template (zones, blocks, connections, coverage colours) into `Learn/helpful-links/core-stack.js`. Render SVG in-page with `data-block` on each module group, all blocks **on** (no gap ghosts, no sidebar). Layout and type follow the builder: seven equal columns, telemetry pipeline, NG-SIEM bar, services band.

A short comment at the top of `core-stack.js` names `tools/diagram-builder/index.html` (`TEMPLATES` id `falcon-core`) as the source. If the builder template changes later, update this copy.

## Module → library map

| Block id | Match | Pillar |
|---|---|---|
| `epp` | Falcon Prevent | endpoint |
| `edr` | Falcon Insight | endpoint |
| `fw` | Falcon Firewall | endpoint |
| `devctl` | Falcon Device Control | endpoint |
| `mobile` | Falcon for Mobile | endpoint |
| `forensics` | Forensics | endpoint |
| `itdr` | Identity Threat | identity |
| `fid` | Falcon ID | identity |
| `privacc` | Next-Gen Identity | identity |
| `cnapp` | Falcon Cloud Security | cloud |
| `shield` | Falcon Shield | cloud |
| `cdr` | CDR | cloud |
| `dlp` | Data Security for Endpoint | data |
| `ds-cloud` | Data Security for Cloud | data |
| `seb` | Falcon Secure Access | network |
| `aidr-wf` | Guardian | ai |
| `aidr-ag` | Guardian | ai |
| `ctem` | Exposure Management | grc |
| `surface` | Falcon Surface | grc |
| `spotlight` | Falcon Spotlight | grc |
| `discover` | Falcon Discover | grc |
| `filevantage` | FileVantage | endpoint |
| `forit` | Falcon for IT | infra |
| `drp` | Adversary Intelligence | intel |
| `soar` | Charlotte | secops |
| `charlotte` | Charlotte AI | secops |
| `agentworks` | Charlotte | secops |
| `cti` | Adversary Intelligence | intel |
| `foundry` | Foundry | secops |
| `onum` | Onum | infra |
| `logcoll` | Next-Gen SIEM | secops |
| `siem` | Next-Gen SIEM | secops |
| `complete` | Falcon Complete | services |
| `overwatch` | OverWatch | services |
| `ir` | Falcon Complete | services |
| `ps` | Falcon Complete | services |
| `mssp-svc` | *(pillar only)* | services |
| `gsi` | *(pillar only)* | services |

Echo / span copies of a module share the same id and the same click.

Zone chrome (column labels) is not a second click target; GTM tiles already cover pillars.

## Filter logic

```
visible if matchesQuery(item)
     and (productFocus
            ? title/domain contains productFocus
            : inActivePillar(item))
```

Counts on 01 / 04 / 05 follow this. Intro / Deploy / Tools / More ignore pillar and product focus.

## Interaction and accessibility

- Tiles are `<button>` with `aria-pressed`.
- Core Stack modules are focusable (`tabindex="0"`, Enter/Space activate). Selected module gets a CRWD-red stroke (library accent) on the light canvas.
- `<details>` is the collapse control; no custom accordion.
- Expanded SVG may scroll horizontally on small screens. Tiles wrap; they never row-scroll.
- Recalculate `--sticky-offset` after collapse toggle (sticky is shorter without chips).

## Files

- `Learn/helpful-links/index.html` — remove chips; add map + details host
- `Learn/helpful-links/style.css` — tile grid; light diagram card; drop sticky chip styles
- `Learn/helpful-links/app.js` — tile + module handlers; product focus
- `Learn/helpful-links/core-stack.js` — template + SVG render
- `index.html` script order: catalog, datasheets, other, core-stack, app

## Verify

Local HTTP, not `file://`.

1. Sticky has no chips; tiles wrap at desktop and ~375px width.
2. Identity tile → 01 / 04 / 05 counts drop to identity-only; Intro unchanged.
3. Email tile still shows the alliance cards.
4. Expand Core Stack; click Falcon Shield → cloud tile + Shield cards; scroll to `#datasheets`.
5. Click Falcon Exposure Management → GRC tile pressed, Exposure Management cards still visible (they remain tagged intel in the corpus).
6. Search `XIoT` still hides empty 02 / 03 / 06 / 07.
7. Collapse the stack; sticky offset does not cover section titles.
