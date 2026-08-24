# Thinkinfosec Hub folder layout and catalog

Date: 2026-08-24

## Goal

Reorganize GitHub Pages so hub-hosted pages live in folders with `index.html`, keep old URLs working via stubs, and treat off-site tools, YouTube, and follow links as catalog entries — not fake folders.

## Origins

| Origin | Meaning | GitHub folder? |
|---|---|---|
| Hub | Static page in this repo | `tools/<slug>/` or `Research/<slug>/` |
| Elsewhere | Live app on another host | No |
| Source | GitHub repository | No |
| YouTube | Video or channel | No |

## Tree (target)

```
index.html                 # hub catalog only
assets/                    # logos, photo, shared images
tools/<slug>/index.html    # hub-hosted tools
Research/<slug>/index.html # keep Research/ casing (existing URLs, Windows)
learn/                     # only hub-hosted lessons (e.g. audio) — later phase
old/ old-25/ Audio/        # unchanged until a later phase
```

`Research/` stays capitalized to avoid a Windows case-fold and to keep current `/Research/...` prefixes.

## Homepage IA (Phase 2)

Nav: **Tools · Research · Learn · Connect · About**

- Tools: one grid, origin badges, button labels by origin
- Research: hub publications
- Learn: YouTube episodes (elsewhere) + any hub-hosted lessons
- Connect: YouTube channel and other follow links (`#connect` on `index.html`, not a folder)
- About: bio

## Redirects

Old file URLs keep a tiny HTML stub (`meta refresh` + `location.replace`) so existing GitHub Pages links do not break.

## Out of scope until later phases

- MDV (`tools/mdv/`)
- Moving `old/`, `old-25/`, `Audio/`
- Redesigning individual tool UIs
