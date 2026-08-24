# People / Process / Technology corpus schema

Date: 2026-08-24  
Status: Approved for Phase 3a (taxonomy + tagged corpus + simple explorer)

## Goal

One categorization schema for everything ThinkInfoSec has published or built: **People → Processes → Technology**, with Technology taken from the April 2026 three-vendor landscape (70 domains) plus **Falcon Onum / data pipeline security**. Hub cards and the corpus mind map read the same data.

## Spine

- **People:** thought-leadership, teaching, community, skills-career, awareness-culture
- **Processes:** govern-assure, architect-zt, threat-model, detect-hunt, respond-recover, channel-mssp, build-demo, enable-certify
- **Technology:** 14 landscape categories; sub-domains 1–70 from `260427-landscape_reference_3vendors.xlsx`; **71 DPS** (Security Data Pipeline, Falcon Onum) under Security Operations, sorted after SIEM

## Artefact record

`kind` (tool | research | learn | writing), `origin` (hub | elsewhere | source | youtube | medium), `pillar`, `people[]`, `processes[]`, `tech[]` (domain ids), `link`, optional `note`.

AI App Security is **tech 62** (AI / LLM Threat Detection), not Application Security.

## Runtime

`catalog/catalog.js` is the source of truth (works on GitHub Pages and `file://`). Excel stays in the Alliance Landscape project; it is not served from Pages.

## Phases

- **3a (this gate):** taxonomy + tagged corpus + nested explorer at `tools/corpus-map/`
- **3b:** interactive mind map
- **3c:** hub homepage reads `catalog.js` (stop duplicating cards)
- **MDV:** still after this workstream unless requested in parallel
