# Hub folder layout implementation plan

> **For agentic workers:** Implement one phase, push, then stop for human verification. Do not start the next phase until the user approves.

**Goal:** Ship a folder-per-page GitHub Pages layout with origin-honest catalog, gated so each phase can be checked live.

**Architecture:** Only hub-hosted HTML moves into `tools/` or `Research/<slug>/`. Off-site work stays as catalog links. Old paths become redirect stubs.

**Tech stack:** Static HTML/CSS/JS on GitHub Pages.

---

## Phase 1 — Folders, moves, redirects (this PR)

Verify on Pages: new pretty URLs load; old URLs redirect; hub cards for moved items work.

- [x] Spec and this plan
- [ ] Branch `restructure/phase-1-folders`
- [ ] `git mv` hub assets into `assets/`
- [ ] `git mv` tools into `tools/password-hasher/` and `tools/prompt-injection/`
- [ ] `git mv` research HTML into slug folders; keep `Research/` casing
- [ ] Fix relative logo/hub links in moved files
- [ ] Write redirect stubs at old paths
- [ ] Point `index.html` at new paths (including NCSC empty href)
- [ ] Commit, push, open PR

## Phase 2 — Homepage IA (do not start until Phase 1 is verified)

Nav Tools / Research / Learn / Connect / About. Origin badges. Connect strip with YouTube channel. Catalog fields: `origin`, optional `note`.

## Phase 3 — MDV (do not start until Phase 2 is verified)

Add `tools/mdv/index.html` from `mdv_3.html`, hub card (`origin: hub`), keep CSP. Decide `robots` when implementing.

## Phase 4 — Housekeeping (optional)

`archive/` for `old` + `old-25`; optional `learn/audio/`; README vs live site.

---

## Phase 1 file map

Create:

- `tools/password-hasher/index.html` (from `password-generator.html`)
- `tools/prompt-injection/index.html` (from `PromptInjTechniques.html`)
- `Research/anz-mssp/index.html`
- `Research/infosec-solutions-map/index.html`
- `Research/ncsc-critical-controls/index.html`
- Redirect stubs at previous file paths
- `assets/learning-hub-logo.png`, `assets/your-photo.png`, `assets/thinkinfosec-logo.png`

Modify: `index.html` links and image `src`.

## Phase 1 verification

After Pages deploys the branch or `main`:

1. `/thinkinfosec-hub/tools/password-hasher/`
2. `/thinkinfosec-hub/tools/prompt-injection/`
3. `/thinkinfosec-hub/Research/anz-mssp/`
4. `/thinkinfosec-hub/password-generator.html` redirects
5. `/thinkinfosec-hub/Research/ncsc-critical-controls/` from the research card
6. Hub logo and about photo still load
