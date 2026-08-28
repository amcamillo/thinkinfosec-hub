# Diagram Builder v2 — Telemetry Ingest Overhaul

**Date:** 2026-08-27
**Status:** Approved design, pre-implementation
**Scope:** `tools/diagram-builder/index.html` (single-file tool on the ThinkInfoSec hub)

---

## 1. Purpose

The current diagram builder is a CrowdStrike alliance-landscape mapper with three fixed templates. It cannot tell a credible **telemetry-ingest** story: how sources' data reaches NG-SIEM, via which collection path, at what relative volume, and which detection outcomes it enables.

v2 keeps the CrowdStrike focus and the existing templates, and adds a flagship **telemetry-ingest** capability, while re-skinning the whole tool to the ThinkInfoSec design language.

## 2. Goals / non-goals

**Goals**
- Align the builder's design language with the ThinkInfoSec hub: tokens, typography, official logo, light editorial shell by default, dark mode toggle.
- Add a flagship telemetry-ingest template built on layered swimlanes.
- Make the collection path **explicit per source** (sensor-native / Falcon Shield / connector / Onum / syslog / API pull), with a recommended default the user can override.
- Introduce a real, versioned, documented **data model** (the "schema") as the product's backbone.
- Semi-composable: palette of sources / pipeline / destinations; user arranges; auto-layout assists.
- Save/load diagram configs as JSON; export PNG/SVG; keep Mermaid/D2 for alliance templates.

**Non-goals (YAGNI)**
- Not a vendor-agnostic pipeline builder — CrowdStrike remains the frame.
- Not a freeform draw.io-style canvas — no arbitrary drag-anywhere.
- No backend, no accounts, no multi-user. Static GitHub Pages tool.
- Schema is *extractable*, not yet a separate published package.

## 3. Design language

Tokens (single source of truth in `:root`, mirrored in dark overrides):

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#E9ECF1` | `#0D1F3C` | app background |
| `--surface` | `#FFFFFF` | `#112240` | cards, canvas, sidebar |
| `--surface-2` | `#F4F5F7` | `#0D1F3C` | sidebar bg |
| `--border` | `#DFE1E6` | `#1A3358` | hairlines |
| `--text` | `#172B4D` | `#E9ECF1` | primary text |
| `--text-muted` | `#6B778C` | `#8BA0B8` | secondary text |
| `--accent` | `#00BFCF` | `#00BFCF` | ThinkInfoSec cyan accent |
| `--accent-strong` | `#0D1F3C` | `#5EE0EA` | accent-emphasis text |
| `--accent-soft` | `rgba(0,191,207,.14)` | `rgba(0,191,207,.16)` | accent tint bg |

Typography: **Inter** for UI/labels, **Space Mono** for eyebrows/tags/technical sublabels (matches the current builder + hub mono usage). Logo: `assets/learning-hub-logo.png` in the header, linking back to `../../index.html` (consistent with other tools).

**Theme:** light editorial is default. A header toggle sets `data-theme="dark"` on `<html>` and persists to `localStorage('tih-db-theme')`. Dark = navy shell and canvas (direction A), light = editorial (direction B). Both are first-class.

## 4. Architecture — one file, four layers

`tools/diagram-builder/index.html` remains a single self-contained file (repo convention). Internally it is split into four banner-commented layers, in this order:

1. **SCHEMA** — the data model as pure data + JSDoc typedefs, led by `const SCHEMA_VERSION = "2.0";`. Written so it can be lifted into its own file later with zero changes (the "nod to 3").
2. **MODEL** — pure functions: `normalizeConfig(json)`, `resolveActivePath(source, overrides)`, `computeDerived(config)` (volume totals, outcome coverage). No DOM.
3. **RENDER** — the existing SVG engine, refactored to draw from the model rather than hardcoded `blocks`/`zones`. Keeps the current orthogonal routing, hover-highlight, and tooltip logic, re-tokened.
4. **SHELL** — header (logo, title, theme toggle, template tabs), sidebar (palette), canvas, export bar.

The boundary that matters: **RENDER and SHELL never read schema constants directly; they read the normalized model.** That is what keeps the schema extractable.

## 5. The schema (durable artifact)

All entities are JSON-serializable. A saved diagram is a `Diagram`.

```js
/** @typedef {{id:string,label:string,kind:'source'|'path'|'pipeline'|'destination'}} NodeRef */

Path        = { id: 'sensor-native'|'falcon-shield'|'connector'|'onum'|'syslog'|'api-pull',
                label: string, via: 'direct'|'onum'|'collector' }

Source      = { id, label, category: 'endpoint'|'identity'|'cloud'|'saas'|'network'|'ot',
                ocsfClasses: string[],        // OCSF event classes this source emits
                outcomes: string[],           // Outcome ids this source feeds
                paths: string[],              // supported Path ids, e.g. M365: ['falcon-shield','connector','onum']
                defaultPath: string,          // recommended Path id (pre-selected)
                volume: 'low'|'med'|'high' }  // relative weight → drives Sankey overlay + cost hints

Pipeline    = { id, label, stages: string[] }   // e.g. Onum: ['parse','enrich','filter','route']
Destination = { id, label, kind: 'ng-siem'|'data-lake'|'third-party-siem' }
Outcome     = { id, label, sources: string[] }  // detection/visibility outcome → contributing Source ids

Diagram     = { version: '2.0',
                template: string,              // template id
                nodes: NodeRef[],              // placed nodes
                edges: Array<{ from, to, path }>, // active connections
                pathOverrides: { [sourceId]: pathId },
                theme: 'light'|'dark' }        // theme the diagram was saved in;
                                               // on load it overrides the app default
```

**Theme precedence:** `localStorage('tih-db-theme')` sets the *app* default. A loaded `Diagram.theme` overrides it for that session (the diagram reloads as it was saved); the header toggle then re-points the session and updates `localStorage`.

Design decisions baked in:
- `Source.paths` is an **array** because collection path is a per-source *choice* (M365: Falcon Shield *or* connector *or* Onum). `defaultPath` is the recommended one; `Diagram.pathOverrides` records user picks.
- `ocsfClasses` is the "common schema" hook — ties each source to OCSF event classes (`Authentication`, `Process Activity`, …).
- `outcomes` map sources to what they *enable* (e.g. "Identity threat detection" ← Okta + Entra + sensor), satisfying "coverage should align to outcomes."
- `volume` is a coarse relative band (not precise EPS) — enough to drive the Sankey overlay and cost guidance without false precision.

## 6. Flagship telemetry template

Layered swimlanes, top→bottom:

```
SOURCES → COLLECTION PATH → PIPELINE → DESTINATION → OUTCOMES
```

- Each **source** chip shows its label + active **path tag** (pill). Sensor-native sources draw a *direct* arrow to NG-SIEM; all others route through their chosen path first.
- The **collection path** band has a view toggle:
  - **Path view** — chips per path (default, the editing view).
  - **Volume view** — Sankey-style bands whose width = source `volume`, merging into the destination (the detection-funnel / cost story).
- Hovering a source highlights its full route **and** the outcomes it feeds; hovering an outcome highlights contributing sources.
- Palette (sidebar) offers sources grouped by category, plus pipeline and destination nodes. Toggling a source adds it with its `defaultPath`; **clicking the path pill on a placed source cycles through its other supported `paths`** (and records the choice in `pathOverrides`). Sources with a single supported path show a static, non-interactive pill.

## 7. Existing templates

The three alliance templates (Falcon Core Stack, Managed Services, Data Protection) are ported onto the new model verbatim in content; they gain the new skin, logo, and theme toggle. No content changes.

## 8. Save/load & export

- **Save** — serialize the current `Diagram` to a pretty-printed `.json` download (`diagram-<template>-<yyyymmdd>.json`).
- **Load** — file picker → `normalizeConfig()` validates against `SCHEMA_VERSION`. On version mismatch it migrates if a migration exists, else rejects with a clear, human-readable error. Invalid JSON or unknown entity ids are rejected, never silently dropped.
- **Export**
  - PNG and SVG for all templates (unchanged mechanism, re-tokened).
  - Mermaid/D2 remain for the alliance templates. For the telemetry template they emit a **simplified flow** — swimlanes and volume don't map to Mermaid; the code modal states this degradation explicitly.

## 9. Error handling

- Unknown `pathId` in an override → fall back to the source's `defaultPath`, surface a non-blocking notice.
- Load-time validation errors → modal listing every problem found (not just the first).
- Export to PNG requires the SVG to be in-document; guard with a user-visible message if the canvas is empty.

## 10. Testing

Manual-first (static site, no test harness in repo), but the MODEL layer is pure and therefore unit-testable. Concretely:
- A small in-file `selfTest()` runs in dev (`?test=1`) and asserts: every template normalizes without error; every `defaultPath` ∈ its source's `paths`; every `Outcome.sources` id resolves; every edge endpoint exists.
- Manual checks: theme toggle persists across reload; save→load round-trips to an identical diagram; PNG/SVG export opens; telemetry view switches path/volume; hover highlights route + outcomes.

## 11. Fidelity ledger (for the redesign itself)

What changes for existing users of the alliance templates:
- Visual: new tokens, logo, theme toggle — same layout and content.
- Behavioral: none removed; save/load and the telemetry template are additive.
- Export: unchanged for alliance templates; telemetry template exports a simplified Mermaid/D2 by design.
