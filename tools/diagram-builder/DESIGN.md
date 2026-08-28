# Diagram Builder — Design Selections

Living record of the design decisions behind the Diagram Builder overhaul (August 2026).
All templates are rendered by one shared engine, so every selection below applies uniformly
to Falcon Core Stack, Managed Services, Data Protection, and Telemetry Ingest.

## 1. Brand & shell

- **ThinkInfoSec tokens** — the shell runs on the hub's design tokens (`--accent`, `--navy`,
  `--bg`, `--surface`, `--border`, `--text`) with the official logo in the header.
- **Light/dark theme** — toggle in the header, persisted in `localStorage` (`tih-db-theme`),
  defaults to light, respects `prefers-color-scheme` on first visit.
- **Typography** — hub font stacks everywhere, including inside SVG (so exports match):
  - UI: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif`
  - Mono: `'Space Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
  - Exposed to renderers as `FONT_SANS` / `FONT_MONO` constants; no raw font literals.

## 2. Code architecture

Single `index.html`, internally layered so the schema can be extracted later:

1. **SCHEMA** — registries (`SOURCES`, `PATHS`, `OUTCOMES`, `PIPELINES`), coverage taxonomy,
   connection types, template definitions.
2. **MODEL** — state (`blockStates`, `pathOverrides`, `showGaps`, `palette`, `authorName`),
   `normalizeConfig()` validation for load.
3. **RENDER** — SVG engine (`renderAlliance` grid engine, `renderTelemetry` swimlanes),
   palette resolver `C()`.
4. **SHELL** — tabs, sidebar, export bar, modals, tooltips, persistence.

## 3. Shared diagram language

- **Zones** — rounded rectangles (`rx:6`), tinted fill at ~6% of the border hue, mono
  uppercase labels. `overlay` zones get dashed borders; services zones get dashed + ⚙;
  the NG-SIEM bar gets a heavier 1.5px navy stroke.
- **Blocks** — white card, 3px accent bar on the left, coverage dot top-right, Inter label
  + Space Mono sub-label. Disabled blocks render as dashed "GAP" ghosts at 55% opacity.
- **Coverage taxonomy** — `NATIVE` (cyan), `HYBRID` (orange), `PARTNER` (violet),
  `SERVICES` (magenta); ghost grey for gaps.
- **Connections** — `ops` solid cyan, `response` dashed magenta, `data` dotted violet,
  with arrowhead markers; hover a block to highlight its chain.
- **Echo blocks** — modules that genuinely span pillars declare `span:[...]` and render a
  dashed, italic, `⇄`-marked copy in each secondary pillar. Echo and primary share toggle
  state and hover highlighting.

## 4. Template layout pattern (all three alliance templates)

Uniform top-to-bottom narrative:

1. **Capability columns** — equal visual weight, side by side
   (7 pillars in Falcon Core; Detect/Protect/Platform in Managed Services;
   Browser/SaaS/Cloud in Data Protection under the AIDR overlay band).
2. **Telemetry Pipeline row** — Falcon Onum lives here
   (official CrowdStrike categorisation), sub-labelled
   "Real-time data control plane — parse · enrich · filter · route".
   Falcon LogScale Collector sits alongside it as the log-shipping ingest path,
   with its own `data` edge into the NG-SIEM bar.
3. **NG-SIEM bar** — full-width data backbone; Onum connects into it with a `data` edge.
4. **Services band/columns at the very bottom** — never a side rail.

## 4a. Falcon Core module set (2026)

The template aims for the complete 2026 Falcon portfolio under official module names
(verified against CrowdStrike docs/data sheets). Naming and placement decisions:

- **Falcon Surface** is the EASM module — labelled "Falcon Surface", sub-labelled
  "EASM — external attack surface". It sits in Exposure Mgmt as its own block alongside
  **Falcon Spotlight** (vulnerability management); both are components of the unified
  Falcon Exposure Management, whose block sub-label now reads "RBVM / ExPRT.AI".
- **Only discrete, separately-licensed modules get blocks.** Capabilities bundled inside
  a parent module fold into the parent's sub-label instead: ASPM is part of Falcon Cloud
  Security (`CNAPP — CSPM/CIEM/CWPP/ASPM`), and Falcon Sandbox malware analysis is part of
  Falcon Adversary Intelligence (`Threat intel · Sandbox analysis`). Neither renders as
  its own block.
- **Falcon Secure Access** (secure enterprise browser, ex-Seraphic) is primary in
  Data Security with an echo in Endpoint — in-session browser protection is a data
  control that happens to run on endpoints.
- **Falcon AIDR ships as two modules** — AIDR for Workforce (AI traffic on endpoints) and
  AIDR for Agents (AI workloads in cloud). Both are blocks in AI Security with an echo
  where each runs (Endpoint / Cloud & SaaS). Ids `aidr-wf` / `aidr-ag` match the Data
  Protection lens, so toggle state carries over.
- **Falcon Foundry** (low-code custom apps) sits in Security Operations.
- **Falcon LogScale Collector** sits in the Telemetry Pipeline row next to Onum.
- `seb` and `foundry` share ids with the Managed Services / Data Protection templates,
  so their toggle state carries over (global module state); Falcon Core declares them
  first and sets the shared default (`off` — newer modules, honest gap-assessment default).

## 5. Grid engine (renderAlliance)

Templates declare structure, not coordinates: `layout.tracks[]` = vertical columns of
row-stacks; each row lists zone ids.

- **Content-driven heights** — a zone's height is computed from its visible block count
  (`ZHDR + ZPAD*2 + n*BH + (n-1)*BGAP`); horizontal bands and the SIEM bar have fixed heights.
- **Reflow on removal** — hidden zones (gap view off, no enabled modules) vanish; remaining
  zones in the row widen proportionally and shift left to close the hole.
- **Track equalisation** — shorter tracks stretch their last row so all column bottoms
  end flush.
- **Adaptive canvas** — height is computed at render time (header + rows + footer);
  width stays 1440.

## 6. Gap view

- **Toggle** in the export bar, persisted per session and in saved configs (`showGaps`).
- **On** — disabled modules show as dashed GAP blocks (gap-assessment mode).
- **Off** — disabled modules are removed, the layout reflows, and any zone left empty
  (including the NG-SIEM bar) is removed entirely. Flow arrows and the telemetry-ingestion
  annotation are gated so they never float over removed sections.

## 7. Documentation header

Every diagram carries a documentation block:

- Title (template name) + "CrowdStrike architecture reference — thinkinfosec.org" subtitle.
- Meta block top-right: `GENERATED DD MMM YYYY` and `AUTHOR <name>`.
- Author comes from the export-bar input, persists in `localStorage` (`tih-db-author`),
  and is stored in saved configs (`author`). Defaults to "ThinkInfoSec".
- Thin divider rule separates header from canvas. Footer keeps the watermark + disclaimer.

## 8. Palettes

- **Standard** (default) — ThinkInfoSec accent set.
- **Pro** — CrowdStrike-flavoured: muted teal `#3F7E7C`, muted CS red `#A6494B`,
  charcoal `#23282D`, numbed plum/bronze, warm neutral greys.
- Implemented as a render-time resolver `C()` that maps any hard-coded hex or `rgba()`
  through `PRO_COLORS` (alpha preserved), so templates stay palette-agnostic.
- Toggle in the export bar; persisted (`tih-db-palette`) and saved in configs (`palette`).

## 9. Sidebar

- Collapsible sections and zone groups with chevrons; state remembered per template
  for the session.
- **Collapse all / Expand all** button at the top of the sidebar.
- Zone groups show enabled/total counts; coverage and connection legends included.
- **Global module state** — toggle state is keyed by module id, not by template:
  disabling Falcon Onum in Falcon Core Stack disables it in Managed Services and Data
  Protection too. Module ids are unified across templates (`siem`, `dlp`, `ds-cloud`, …)
  so the same capability always maps to the same key. First template to declare an id
  sets its default.

## 9a. Hero (value prop)

- A dismissible hero band sits between the header and the workspace, explaining the tool's
  value: clear visualisations of coverage and the roadmap of new capabilities through three
  lenses — technology-aligned (Falcon Core Stack), services-aligned (Managed Services),
  outcome-aligned (Data Protection).
- The lens flow is rendered as a **dependency-free HTML/CSS flow** (no external diagram
  library): question node → three lens chips with a distinct accent border per lens
  (cyan / magenta / violet) → gap assessment → roadmap. It inherits the app theme via CSS
  variables, so it reads in both light and dark mode with zero re-render logic. Collapse
  state persists (`tih-db-hero`).

## 10. Telemetry Ingest template (ALPHA)

- Five swimlanes: Sources → Collection → Pipeline → Destination → Outcomes.
- Each source chip shows its active **collection path pill** (sensor-native, Falcon Shield,
  connector, Onum, syslog, API pull); click to cycle supported paths.
- Sensor-native routes direct to NG-SIEM; everything else funnels via Onum or a connector.
- **Volume view** toggle: Sankey-style bands sized by relative source volume (low/med/high).
- Sources map to detection/visibility outcomes (EDR, ITDR, …) shown in the outcomes lane.

## 11. Persistence & export

- **Save/Load** — versioned JSON config: template, block states, path overrides,
  `volumeView`, `showGaps`, `palette`, `theme`, `author`. Validated via `normalizeConfig()`
  with non-fatal error reporting.
- **Exports** — PNG (2×), SVG, Mermaid (simplified), D2 (simplified). Exports render from
  the live SVG, so header, palette, and reflow state carry over exactly.
