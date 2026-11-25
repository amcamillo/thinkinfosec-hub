# ThinkInfoSec Hub front-page redesign: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hub's single scrolling page with a tabbed, editorial front page (Front page · News · Research · Videos · Tools · Guides & Assets · About), in dark and light themes. News comes from Signal; Medium and YouTube come from a new `media.json`. Both feeds are published by GitHub Actions workflows in the Signal repo.

**Architecture:** The hub stays a static GitHub Pages site with no build step. `index.html` becomes a shell. Plain classic scripts under `assets/hub/` attach small globals (`HubLib`, `HubRender`, `HubFeeds`, `HubSearch`, `HubTabs`). `lib.js` is pure logic and also exports for Node, so it can be unit tested. Content comes from `catalog/catalog.js` (the existing corpus) plus two JSON feeds fetched from `https://thinkinfosec.github.io/Signal/`. The Signal repo gains `build_media.py`, and each news item gets a `link`.

**Tech stack:** HTML, CSS and vanilla JS (ES2020). Python 3 stdlib (`unittest`, `xml.etree`). Node 24 `node:test`. Playwright (Chromium) for smoke tests.

**Spec:** `docs/superpowers/specs/2026-11-25-hub-front-page-redesign-design.md`

**Repos:**
- Hub: `C:\dev\thinkinfosec-hub`. It has unrelated uncommitted changes, so **always `git add` explicit paths, never `git add -A` or `.`**.
- Signal: `C:\dev\Signal`

**Facts already verified (do not re-check):**
- The Medium feed is `https://medium.com/feed/@andrecamillo`. `@amcamillo` returns an empty feed.
- The YouTube channel ID for `@thinkinfosecorg` is `UCK5IydDSpf-Yz7qCmVjDN5Q`. Its RSS feed returns 15 entries.
- `news.json` items have `source, cat (cyber|geo|ai), title, summary, ts` and **no link** (Task 2 adds it).
- Every card that is hard-coded in today's `index.html` already exists in `catalog/corpus.json` (matched by link). Corpus kinds: `tool` (12), `research` (12), `writing` (13 Medium), `learn` (1 hub guide plus 4 YouTube).
- `catalog/catalog.js` is rebuilt from `taxonomy.json` and `corpus.json` with a one-line Python command (Task 5). `tools/corpus-map` reads it too, so keep existing kinds and fields. Only add fields.

---

## File map

**Signal (`C:\dev\Signal`)**

| File | Change |
| --- | --- |
| `scripts/build_news.py` | Add `item_link()` and a `link` field on each item |
| `scripts/build_media.py` | New. Medium and YouTube RSS → merged, append-only `media.json` |
| `.github/workflows/refresh-news.yml` | Adopt the owner's untracked draft: tests, build, rebase, push (every 15 min) |
| `.github/workflows/refresh-media.yml` | New: tests, `build_media.py`, push (every 6 h) |
| `tests/test_build_news_link.py` | New. Unit tests for link extraction |
| `tests/test_build_media.py` | New. Unit tests for parsing and merging |
| `.gitignore` | Add `__pycache__/` |

**Hub (`C:\dev\thinkinfosec-hub`)**

| File | Responsibility |
| --- | --- |
| `index.html` | Shell: CSP, masthead, tabs, panels, static About, script tags |
| `assets/hub.css` | Theme tokens and all components |
| `assets/hub/theme-init.js` | Sets `data-theme` before first paint (external file because the CSP forbids inline script) |
| `assets/hub/theme.js` | Dark/Light toggle and persistence |
| `assets/hub/lib.js` | Pure data logic (UMD: `window.HubLib` or `module.exports`) |
| `assets/hub/feeds.js` | Fetches Signal JSON with a `localStorage` fallback |
| `assets/hub/render.js` | DOM builders. Text goes in through `textContent` only |
| `assets/hub/tabs.js` | ARIA tabs, hash routing, aliases, keyboard |
| `assets/hub/search.js` | One search across everything |
| `assets/hub/app.js` | Wires data to renderers |
| `catalog/corpus.json`, `catalog/catalog.js` | Add `featured`, `points`, `group` and `date` fields |
| `tests/package.json` | Playwright dev dependency |
| `tests/unit/lib.test.js`, `tests/unit/contrast.test.js` | Node unit tests |
| `tests/smoke/hub.smoke.test.js` | Playwright smoke tests |
| `tests/fixtures/news.json`, `tests/fixtures/media.json` | Feed fixtures |
| `.gitignore` | Add `tests/node_modules/` |
| `.cursor/skills/writing-hub-research/publishing.md` | Local and untracked. Replace the "Homepage card" step |

---

### Task 0: Preconditions

- [ ] **Step 1: Check that git has an identity in both repos**

Run:
```bash
cd /c/dev/thinkinfosec-hub && git config user.name; cd /c/dev/Signal && git config user.name
```
Expected: a name printed for each repo. If either prints nothing, **stop and ask the owner** which identity to use. Then set it repo-local with `git config user.name "<name>"` and `git config user.email "<email>"` using the owner's answer. Never use `--global`.

- [ ] **Step 2: Check the tools**

Run: `python --version && node --version`
Expected: Python 3.10+ and Node v24.x.

---

### Task 1: Signal `build_media.py` (TDD)

**Files:**
- Create: `C:\dev\Signal\tests\test_build_media.py`
- Create: `C:\dev\Signal\scripts\build_media.py`

- [ ] **Step 1: Write the failing tests**

`C:\dev\Signal\tests\test_build_media.py`:
```python
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import build_media  # noqa: E402

MEDIUM = b"""<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0"><channel>
<title><![CDATA[Stories by Andre Camillo on Medium]]></title>
<item>
<title><![CDATA[Agents on the estate]]></title>
<link>https://andrecamillo.medium.com/agents-on-the-estate-1a2b3c4d5e6f?source=rss-5cfa35a50265------2</link>
<guid isPermaLink="false">https://medium.com/p/1a2b3c4d5e6f</guid>
<pubDate>Tue, 24 Nov 2026 07:00:00 GMT</pubDate>
<content:encoded><![CDATA[<figure><img src="https://cdn-images-1.medium.com/max/1024/1*abc.png" /></figure><p>""" + b"word " * 460 + b"""</p>]]></content:encoded>
</item>
<item><title>No date</title><link>https://andrecamillo.medium.com/x-111111111111</link></item>
</channel></rss>"""

YOUTUBE = b"""<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
<title>ThinkInfoSec</title><published>2018-09-13T02:14:36+00:00</published>
<entry>
<yt:videoId>S8cgevadQ_A</yt:videoId>
<title>Kernel access, redesigned</title>
<published>2026-06-14T07:00:19+00:00</published>
<media:group><media:description>What changed   and why.</media:description></media:group>
</entry>
<entry><yt:videoId>bad</yt:videoId><title>Broken</title><published>2026-06-01T00:00:00+00:00</published></entry>
</feed>"""


class MediumTests(unittest.TestCase):
    def test_parses_article(self):
        items = build_media.medium_items(MEDIUM)
        self.assertEqual(len(items), 1)
        item = items[0]
        self.assertEqual(item["id"], "medium:1a2b3c4d5e6f")
        self.assertEqual(item["kind"], "article")
        self.assertEqual(item["title"], "Agents on the estate")
        self.assertEqual(item["url"], "https://andrecamillo.medium.com/agents-on-the-estate-1a2b3c4d5e6f")
        self.assertEqual(item["thumb"], "https://cdn-images-1.medium.com/max/1024/1*abc.png")
        self.assertEqual(item["minutes"], 2)
        self.assertLessEqual(len(item["summary"]), build_media.SUMMARY_MAX + 1)
        self.assertIsInstance(item["ts"], int)


class YouTubeTests(unittest.TestCase):
    def test_parses_video_and_skips_bad_ids(self):
        items = build_media.youtube_items(YOUTUBE)
        self.assertEqual([i["id"] for i in items], ["youtube:S8cgevadQ_A"])
        item = items[0]
        self.assertEqual(item["url"], "https://www.youtube.com/watch?v=S8cgevadQ_A")
        self.assertEqual(item["thumb"], "https://i.ytimg.com/vi/S8cgevadQ_A/hqdefault.jpg")
        self.assertEqual(item["summary"], "What changed and why.")
        self.assertEqual(item["kind"], "video")


class XmlGuardTests(unittest.TestCase):
    def test_refuses_entity_declarations(self):
        bomb = b'<?xml version="1.0"?><!DOCTYPE r [<!ENTITY a "aaaa">]><rss><channel></channel></rss>'
        with self.assertRaises(ValueError):
            build_media.medium_items(bomb)


class MergeTests(unittest.TestCase):
    def test_keeps_old_items_and_updates_by_id(self):
        old = [{"id": "a", "ts": 1, "title": "old a"}, {"id": "b", "ts": 2, "title": "b"}]
        fresh = [{"id": "a", "ts": 1, "title": "new a"}, {"id": "c", "ts": 3, "title": "c"}]
        merged = build_media.merge(old, fresh)
        self.assertEqual([i["id"] for i in merged], ["c", "b", "a"])
        self.assertEqual(merged[2]["title"], "new a")

    def test_no_duplicates(self):
        merged = build_media.merge([{"id": "a", "ts": 1}], [{"id": "a", "ts": 1}])
        self.assertEqual(len(merged), 1)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `cd /c/dev/Signal && python -m unittest tests.test_build_media -v 2>&1 | tail -5`
Expected: FAIL with `ModuleNotFoundError: No module named 'build_media'`.

- [ ] **Step 3: Implement**

First add a shared DTD guard to `C:\dev\Signal\scripts\build_news.py`. Put it directly above `def items_from_feed`, and change the first line of `items_from_feed` from `root = ET.fromstring(raw)` to `root = parse_xml(raw)`:
```python
def parse_xml(raw: bytes) -> ET.Element:
    """Third-party feed: refuse DTDs so entity-expansion payloads never reach the parser."""
    if b"<!DOCTYPE" in raw or b"<!ENTITY" in raw:
        raise ValueError("feed declares a DTD; refusing to parse")
    return ET.fromstring(raw)
```

Then create `C:\dev\Signal\scripts\build_media.py`:
```python
"""Build media.json from the Medium and YouTube feeds.

Items are merged by id and never dropped, so the archive grows past the
10 to 15 items each feed returns. The file is only rewritten when items change.
"""
from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_news import child_text, fetch, local_name, parse_ts, parse_xml, strip_html  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "media.json"
MEDIUM_FEED = "https://medium.com/feed/@andrecamillo"
YOUTUBE_CHANNEL = "UCK5IydDSpf-Yz7qCmVjDN5Q"
YOUTUBE_FEED = f"https://www.youtube.com/feeds/videos.xml?channel_id={YOUTUBE_CHANNEL}"
SUMMARY_MAX = 240
WORDS_PER_MINUTE = 230
IMG_RE = re.compile(r'<img[^>]+src="(https://(?:cdn-images-1|miro)\.medium\.com/[^"]+)"')
MEDIUM_ID_RE = re.compile(r"-([0-9a-f]{8,12})(?:[/?#]|$)")
VIDEO_ID_RE = re.compile(r"[\w-]{11}")


def clip(text: str, limit: int) -> str:
    text = " ".join((text or "").split())
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0]
    return cut + "…"


def medium_items(raw: bytes) -> list[dict]:
    root = parse_xml(raw)
    out: list[dict] = []
    for node in root.iter():
        if local_name(node.tag) != "item":
            continue
        link = child_text(node, "link").strip().split("?", 1)[0]
        title = strip_html(child_text(node, "title"))
        ts = parse_ts(child_text(node, "pubDate"))
        if not (link.startswith("https://") and title and ts):
            continue
        body = child_text(node, "encoded")
        text = strip_html(body)
        match = MEDIUM_ID_RE.search(link)
        item = {
            "id": "medium:" + (match.group(1) if match else link),
            "kind": "article",
            "title": title,
            "url": link,
            "ts": ts,
            "summary": clip(text, SUMMARY_MAX),
            "minutes": max(1, round(len(text.split()) / WORDS_PER_MINUTE)),
        }
        img = IMG_RE.search(body)
        if img:
            item["thumb"] = img.group(1)
        out.append(item)
    return out


def youtube_items(raw: bytes) -> list[dict]:
    root = parse_xml(raw)
    out: list[dict] = []
    for entry in root:
        if local_name(entry.tag) != "entry":
            continue
        vid = child_text(entry, "videoId").strip()
        title = child_text(entry, "title").strip()
        ts = parse_ts(child_text(entry, "published"))
        if not (VIDEO_ID_RE.fullmatch(vid) and title and ts):
            continue
        desc = ""
        for node in entry.iter():
            if local_name(node.tag) == "description":
                desc = "".join(node.itertext())
        out.append(
            {
                "id": "youtube:" + vid,
                "kind": "video",
                "title": title,
                "url": f"https://www.youtube.com/watch?v={vid}",
                "ts": ts,
                "summary": clip(desc, SUMMARY_MAX),
                "thumb": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
            }
        )
    return out


def merge(existing: list[dict], fresh: list[dict]) -> list[dict]:
    by_id = {item["id"]: item for item in existing if "id" in item}
    for item in fresh:
        by_id[item["id"]] = item
    return sorted(by_id.values(), key=lambda item: item.get("ts", 0), reverse=True)


def load_existing() -> list[dict]:
    try:
        data = json.loads(OUT.read_text(encoding="utf-8"))
        return data["items"] if isinstance(data.get("items"), list) else []
    except (OSError, ValueError, AttributeError):
        return []


def main() -> int:
    existing = load_existing()
    fresh: list[dict] = []
    ok = 0
    for name, url, parse in (("medium", MEDIUM_FEED, medium_items), ("youtube", YOUTUBE_FEED, youtube_items)):
        try:
            got = parse(fetch(url))
            fresh.extend(got)
            ok += 1
            print(f"ok  {name}: {len(got)}")
        except Exception as exc:  # one dead feed must not wipe the archive
            print(f"err {name}: {exc}", file=sys.stderr)
    if ok == 0:
        print("no media feeds fetched; leaving media.json unchanged", file=sys.stderr)
        return 1
    items = merge(existing, fresh)
    if items == existing:
        print("media unchanged")
        return 0
    payload = {"generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "items": items}
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(items)} media items")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `cd /c/dev/Signal && python -m unittest tests.test_build_media -v 2>&1 | tail -3`
Expected: `Ran 5 tests` and `OK`.

- [ ] **Step 5: Commit**

```bash
cd /c/dev/Signal && git add scripts/build_news.py scripts/build_media.py tests/test_build_media.py && git commit -m "Add the Medium and YouTube media builder."
```

---

### Task 2: Signal news items carry a link (TDD)

**Files:**
- Create: `C:\dev\Signal\tests\test_build_news_link.py`
- Modify: `C:\dev\Signal\scripts\build_news.py` (`items_from_feed`, around lines 127-157)

- [ ] **Step 1: Write the failing tests**

`C:\dev\Signal\tests\test_build_news_link.py`:
```python
import sys
import time
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import build_news  # noqa: E402

NOW = int(time.time() * 1000)
FEED = {"name": "Fixture", "cat": "cyber"}
DATE = time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime())

RSS = f"""<rss version="2.0"><channel><item><title>RSS story</title>
<link>https://example.com/rss-story</link><pubDate>{DATE}</pubDate></item>
<item><title>Plain http story</title><link>http://example.com/insecure</link><pubDate>{DATE}</pubDate></item>
</channel></rss>""".encode()

ATOM = f"""<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Atom story</title>
<link rel="self" href="https://example.com/self"/><link rel="alternate" href="https://example.com/atom-story"/>
<updated>{time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}</updated></entry></feed>""".encode()


class LinkTests(unittest.TestCase):
    def test_rss_link(self):
        items = build_news.items_from_feed(FEED, RSS, NOW)
        self.assertEqual(items[0]["link"], "https://example.com/rss-story")

    def test_http_link_dropped(self):
        items = build_news.items_from_feed(FEED, RSS, NOW)
        self.assertNotIn("link", items[1])

    def test_atom_alternate_link(self):
        items = build_news.items_from_feed(FEED, ATOM, NOW)
        self.assertEqual(items[0]["link"], "https://example.com/atom-story")


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `cd /c/dev/Signal && python -m unittest tests.test_build_news_link -v 2>&1 | tail -4`
Expected: FAIL with `KeyError: 'link'`.

- [ ] **Step 3: Implement**

In `scripts/build_news.py`, add this function directly above `def items_from_feed`:
```python
def item_link(node: ET.Element) -> str:
    """Return an RSS <link> text or the Atom rel=alternate href, if it is https."""
    for child in node:
        if local_name(child.tag) != "link":
            continue
        href = (child.get("href") or "").strip()
        if href:
            if child.get("rel", "alternate") == "alternate" and href.startswith("https://"):
                return href
            continue
        text = "".join(child.itertext()).strip()
        if text.startswith("https://"):
            return text
    return ""
```
In `items_from_feed`, replace the `kept.append({...})` block with:
```python
        item = {
            "source": feed["name"],
            "cat": feed["cat"],
            "title": title,
            "summary": summary,
            "ts": ts,
        }
        link = item_link(node)
        if link:
            item["link"] = link
        kept.append(item)
```

- [ ] **Step 4: Run all Signal tests**

Run: `cd /c/dev/Signal && python -m unittest discover -s tests -v 2>&1 | tail -3`
Expected: `Ran 8 tests` and `OK`.

- [ ] **Step 5: Check that the Signal screen ignores the new field**

Run: `cd /c/dev/Signal && grep -n "Object.keys\|\.link" signal.js | head`
Expected: no code that rejects unknown keys. If there is any, stop and report.

- [ ] **Step 6: Commit**

```bash
cd /c/dev/Signal && git add scripts/build_news.py tests/test_build_news_link.py && git commit -m "Keep each story's https link in news.json."
```

---

### Task 3: Publish media.json and news.json with GitHub Actions

Signal moves from the local scheduled task (`publish_news.ps1`) to GitHub Actions. The owner's draft `.github/workflows/refresh-news.yml` is untracked; this task adopts it. Both workflows push to `main`, so they share one concurrency group (no cancelling) and rebase before pushing.

**Files:**
- Modify (then commit; currently untracked): `C:\dev\Signal\.github\workflows\refresh-news.yml`
- Create: `C:\dev\Signal\.github\workflows\refresh-media.yml`
- Modify: `C:\dev\Signal\.gitignore`
- Do not modify: `scripts/publish_news.ps1`. It is retired by the owner, not by this task.

- [ ] **Step 1: Replace `.github/workflows/refresh-news.yml`**

```yaml
name: Refresh news

on:
  schedule:
    - cron: "*/15 * * * *"
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: signal-publish
  cancel-in-progress: false

jobs:
  refresh:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Test
        run: python -m unittest discover -s tests
      - name: Build news.json
        run: python scripts/build_news.py
      - name: Commit and push if changed
        run: |
          git add news.json
          if git diff --cached --quiet; then
            echo "News unchanged"
            exit 0
          fi
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git commit -m "Refresh the Signal news snapshot."
          git pull --rebase origin main
          git push origin HEAD:main
```

- [ ] **Step 2: Create `.github/workflows/refresh-media.yml`**

Medium and YouTube change at most once a day, so this runs every 6 hours.
```yaml
name: Refresh media

on:
  schedule:
    - cron: "17 */6 * * *"
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: signal-publish
  cancel-in-progress: false

jobs:
  refresh:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Test
        run: python -m unittest discover -s tests
      - name: Build media.json
        run: python scripts/build_media.py
      - name: Commit and push if changed
        run: |
          git add media.json
          if git diff --cached --quiet; then
            echo "Media unchanged"
            exit 0
          fi
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git commit -m "Refresh the Signal media list."
          git pull --rebase origin main
          git push origin HEAD:main
```

- [ ] **Step 3: Ignore Python caches**

Append `__pycache__/` to `C:\dev\Signal\.gitignore`.

- [ ] **Step 4: Validate the YAML locally**

Run: `cd <signal worktree> && python -c "import yaml,sys;[yaml.safe_load(open(f)) for f in sys.argv[1:]];print('ok')" .github/workflows/refresh-news.yml .github/workflows/refresh-media.yml`
Expected: `ok`. If PyYAML is missing, run `pip install pyyaml` first.

- [ ] **Step 5: Seed media.json once and inspect it**

Run: `python scripts/build_media.py && python -c "import json,collections;d=json.load(open('media.json',encoding='utf-8'));print(collections.Counter(i['kind'] for i in d['items']))"`
Expected: `ok  medium: 10`, `ok  youtube: 15`, and roughly 10 articles and 15 videos. Then run `python scripts/build_media.py` again. Expected: `media unchanged`.

- [ ] **Step 6: Commit, but do not push**

```bash
git add .github/workflows/refresh-news.yml .github/workflows/refresh-media.yml .gitignore media.json && git commit -m "Publish news and media with GitHub Actions."
```
Report that two things are left for the owner:
- Pushing the branch and merging it to `main`, which is when the schedules start.
- Disabling the local scheduled task that runs `publish_news.ps1`, so two publishers don't race.

---

### Task 4: Hub test scaffold

**Files:**
- Create: `tests/package.json`, `tests/fixtures/news.json`, `tests/fixtures/media.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create `tests/package.json`**

```json
{
  "name": "thinkinfosec-hub-tests",
  "private": true,
  "scripts": {
    "unit": "node --test \"unit/*.test.js\"",
    "smoke": "node --test \"smoke/*.test.js\""
  },
  "devDependencies": {
    "playwright": "^1.50.0"
  }
}
```

- [ ] **Step 2: Create the fixtures**

`tests/fixtures/news.json`:
```json
{
  "generated": "2026-11-25T09:00:00Z",
  "items": [
    { "source": "Fixture Wire", "cat": "cyber", "title": "Fixture cyber headline on ransomware crews", "summary": "Cyber summary text.", "ts": 1795597200000, "link": "https://example.com/cyber" },
    { "source": "Fixture Lab", "cat": "ai", "title": "Fixture AI headline on model releases", "summary": "AI summary text.", "ts": 1795593600000, "link": "https://example.com/ai" },
    { "source": "Fixture World", "cat": "geo", "title": "Fixture world headline on trade talks", "summary": "World summary text.", "ts": 1795590000000 }
  ]
}
```
`tests/fixtures/media.json`:
```json
{
  "generated": "2026-11-25T08:00:00Z",
  "items": [
    { "id": "medium:abc123def456", "kind": "article", "title": "Fixture Medium article on agent identity", "url": "https://andrecamillo.medium.com/fixture-article-abc123def456", "ts": 1795500000000, "summary": "Medium summary text.", "minutes": 6 },
    { "id": "youtube:AAAAAAAAAAA", "kind": "video", "title": "Fixture video on kernel access", "url": "https://www.youtube.com/watch?v=AAAAAAAAAAA", "ts": 1795400000000, "summary": "Video summary text.", "thumb": "https://i.ytimg.com/vi/AAAAAAAAAAA/hqdefault.jpg" }
  ]
}
```

- [ ] **Step 3: Ignore node_modules and install**

Append `tests/node_modules/` to `.gitignore`. Then run:
```bash
cd /c/dev/thinkinfosec-hub/tests && npm install --no-audit --no-fund 2>&1 | tail -2 && npx playwright install chromium 2>&1 | tail -1
```
Expected: the install completes and Chromium is present.

- [ ] **Step 4: Commit**

```bash
cd /c/dev/thinkinfosec-hub && git add .gitignore tests/package.json tests/package-lock.json tests/fixtures/news.json tests/fixtures/media.json && git commit -m "Add the hub test scaffold and feed fixtures."
```

---

### Task 5: Corpus fields for the new tabs

**Files:**
- Modify: `catalog/corpus.json`, `catalog/catalog.js`

- [ ] **Step 1: Add `featured`, `points`, `group` and hub research dates**

Run from `C:\dev\thinkinfosec-hub`:
```bash
python - <<'EOF'
import json, subprocess
p = "catalog/corpus.json"
d = json.load(open(p, encoding="utf-8"))
for i in d["items"]:
    if i["id"] == "thinkinfosec-outcomes":
        i["featured"] = True
        i["points"] = [
            "Track program outcomes against the work actually delivered",
            "Visualise framework and control coverage in one place",
            "Brief stakeholders on security value, not a tool inventory",
        ]
    if i["id"] == "learn-helpful-links":
        i["group"] = "guide"
    if i["kind"] == "research" and i["origin"] == "hub" and not i.get("date"):
        out = subprocess.run(["git", "log", "--diff-filter=A", "--format=%as", "--", i["link"]],
                             capture_output=True, text=True).stdout.split()
        if out:
            i["date"] = out[-1]
open(p, "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
print([(i["id"], i.get("date")) for i in d["items"] if i["kind"] == "research"])
EOF
```
Expected: every hub research item printed with a `YYYY-MM-DD` date. If any shows `None`, its folder was added under a different path. Leave it undated; it sorts last.

- [ ] **Step 2: Rebuild catalog.js**

```bash
python -c "import json; t=json.load(open('catalog/taxonomy.json',encoding='utf-8')); c=json.load(open('catalog/corpus.json',encoding='utf-8')); open('catalog/catalog.js','w',encoding='utf-8').write('window.THINKINFOSEC_CATALOG = '+json.dumps({'taxonomy':t,'corpus':c},separators=(',',':'))+';')"
```

- [ ] **Step 3: Check that the corpus map still loads**

Run: `node -e "global.window={};require('./catalog/catalog.js');console.log(window.THINKINFOSEC_CATALOG.corpus.items.length)"`
Expected: `42`.

- [ ] **Step 4: Commit**

```bash
git add catalog/corpus.json catalog/catalog.js && git commit -m "Mark the Outcomes feature, guide group and research dates in the corpus."
```

---

### Task 6: `lib.js` pure logic (TDD)

**Files:**
- Create: `tests/unit/lib.test.js`
- Create: `assets/hub/lib.js`

- [ ] **Step 1: Write the failing tests**

`tests/unit/lib.test.js`:
```js
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../../assets/hub/lib.js');

const NOW = Date.UTC(2026, 10, 25, 12, 0, 0);

test('safeUrl keeps relative and https links, rejects others', () => {
  assert.equal(L.safeUrl('Research/double-agents/'), 'Research/double-agents/');
  assert.equal(L.safeUrl('https://example.com/a?b=1'), 'https://example.com/a?b=1');
  assert.equal(L.safeUrl('http://example.com'), null);
  assert.equal(L.safeUrl('javascript:alert(1)'), null);
  assert.equal(L.safeUrl('//evil.example'), null);
  assert.equal(L.safeUrl(''), null);
  assert.equal(L.safeUrl(undefined), null);
});

test('timeAgo buckets', () => {
  assert.equal(L.timeAgo(NOW - 30e3, NOW), 'just now');
  assert.equal(L.timeAgo(NOW - 5 * 60e3, NOW), '5m');
  assert.equal(L.timeAgo(NOW - 3 * 3600e3, NOW), '3h');
  assert.equal(L.timeAgo(NOW - 72 * 3600e3, NOW), '3d');
});

test('date formatting in a fixed zone', () => {
  assert.equal(L.formatDay(NOW, 'UTC'), 'Wed 25 Nov 2026');
  assert.equal(L.formatDate(NOW, 'UTC'), '25 Nov 2026');
});

test('clip cuts on a word boundary', () => {
  assert.equal(L.clip('one two three four', 9), 'one two…');
  assert.equal(L.clip('short', 9), 'short');
  assert.equal(L.clip(undefined, 9), '');
});

test('isStale', () => {
  assert.equal(L.isStale('2026-11-25T11:00:00Z', NOW, 6), false);
  assert.equal(L.isStale('2026-11-25T05:00:00Z', NOW, 6), true);
  assert.equal(L.isStale('garbage', NOW, 6), true);
});

test('mediumKey matches profile and publication URLs of one post', () => {
  const a = L.mediumKey('https://andrecamillo.medium.com/agents-on-the-estate-1a2b3c4d5e6f');
  const b = L.mediumKey('https://medium.com/@andrecamillo/agents-on-the-estate-1a2b3c4d5e6f?source=rss');
  assert.equal(a, 'medium:1a2b3c4d5e6f');
  assert.equal(a, b);
  assert.equal(L.mediumKey('https://andrecamillo.medium.com/'), 'url:https://andrecamillo.medium.com');
});

test('youtubeId', () => {
  assert.equal(L.youtubeId('https://www.youtube.com/watch?v=aQANe1ZJCds'), 'aQANe1ZJCds');
  assert.equal(L.youtubeId('https://youtu.be/aQANe1ZJCds'), 'aQANe1ZJCds');
  assert.equal(L.youtubeId('https://example.com'), null);
});

test('newsItems validates and sorts', () => {
  const items = L.newsItems({ items: [
    { cat: 'ai', title: 'B', ts: 1, source: 'S' },
    { cat: 'cyber', title: 'A', ts: 2, source: 'S', link: 'https://x.example/a' },
    { cat: 'sport', title: 'drop', ts: 3 },
    { cat: 'geo', title: '', ts: 4 },
    { cat: 'geo', title: 'bad link', ts: 0, link: 'javascript:x' }
  ] });
  assert.deepEqual(items.map(i => i.title), ['A', 'B', 'bad link']);
  assert.equal(items[0].url, 'https://x.example/a');
  assert.equal(items[2].url, null);
  assert.deepEqual(L.newsItems(null), []);
});

const CORPUS = [
  { id: 'r1', kind: 'research', origin: 'hub', title: 'Hub one', link: 'Research/one/', description: 'd', date: '2026-11-18' },
  { id: 'w1', kind: 'writing', origin: 'medium', title: 'Old title', link: 'https://andrecamillo.medium.com/post-1a2b3c4d5e6f', description: 'corpus summary' },
  { id: 'w2', kind: 'writing', origin: 'medium', title: 'Undated', link: 'https://andrecamillo.medium.com/' },
  { id: 'w3', kind: 'writing', origin: 'medium', title: 'Also undated', link: 'https://andrecamillo.medium.com/' },
  { id: 'v1', kind: 'learn', origin: 'youtube', title: 'Corpus video', link: 'https://www.youtube.com/watch?v=aQANe1ZJCds', description: 'v' },
  { id: 'g1', kind: 'learn', origin: 'hub', title: 'Resource Library', link: 'Learn/helpful-links/', group: 'guide' },
  { id: 'g2', kind: 'template', origin: 'hub', title: 'Board pack', link: 'assets/board.docx' },
  { id: 't1', kind: 'tool', origin: 'hub', title: 'Hasher', link: 'tools/password-hasher/' },
  { id: 't2', kind: 'tool', origin: 'elsewhere', title: 'Outcomes', link: 'https://cyber-roadmap.acrmai.org', featured: true, points: ['p'] }
];
const MEDIA = [
  { id: 'medium:1a2b3c4d5e6f', kind: 'article', title: 'Fresh title', url: 'https://medium.com/@andrecamillo/post-1a2b3c4d5e6f', ts: Date.UTC(2026, 10, 24), minutes: 5 },
  { id: 'youtube:aQANe1ZJCds', kind: 'video', title: 'Feed video', url: 'https://www.youtube.com/watch?v=aQANe1ZJCds', ts: Date.UTC(2026, 10, 20) },
  { kind: 'video', title: 'no url' }
];

test('mediaItems drops invalid entries', () => {
  assert.equal(L.mediaItems({ items: MEDIA }).length, 2);
  assert.deepEqual(L.mediaItems(undefined), []);
});

test('researchItems merges Medium by post id, newest first', () => {
  const r = L.researchItems(CORPUS, L.mediaItems({ items: MEDIA }));
  assert.deepEqual(r.map(i => i.title), ['Fresh title', 'Hub one', 'Undated', 'Also undated']);
  assert.equal(r[0].source, 'medium');
  assert.equal(r[0].summary, 'corpus summary');
  assert.equal(r[0].minutes, 5);
  assert.equal(r[1].source, 'hub');
});

test('videoItems dedupes by video id', () => {
  const v = L.videoItems(CORPUS, L.mediaItems({ items: MEDIA }));
  assert.equal(v.length, 1);
  assert.equal(v[0].title, 'Feed video');
  assert.equal(v[0].thumb, 'https://i.ytimg.com/vi/aQANe1ZJCds/hqdefault.jpg');
});

test('toolItems puts featured first; guideItems groups', () => {
  const t = L.toolItems(CORPUS);
  assert.deepEqual(t.map(i => i.title), ['Outcomes', 'Hasher']);
  assert.deepEqual(t[0].points, ['p']);
  const g = L.guideItems(CORPUS);
  assert.deepEqual(g.map(i => [i.title, i.group]), [['Resource Library', 'guide'], ['Board pack', 'template']]);
});

test('filterBy and search', () => {
  const items = [{ k: 'a', title: 'x' }, { k: 'b', title: 'y' }];
  assert.equal(L.filterBy(items, 'k', 'all').length, 2);
  assert.equal(L.filterBy(items, 'k', 'b')[0].title, 'y');
  const entries = L.searchEntries({
    news: L.newsItems({ items: [{ cat: 'cyber', title: 'Ransomware crews regroup', ts: 1, source: 'S' }] }),
    research: L.researchItems(CORPUS, []), videos: L.videoItems(CORPUS, []),
    tools: L.toolItems(CORPUS), guides: L.guideItems(CORPUS)
  });
  assert.deepEqual(L.search(entries, 'ransomware').map(e => e.label), ['News']);
  assert.deepEqual(L.search(entries, 'resource library').map(e => e.label), ['Guides & how-tos']);
  assert.deepEqual(L.search(entries, 'old title').map(e => e.label), ['Research · Medium']);
  assert.equal(L.search(entries, '   ').length, 0);
});

test('signalStatus', () => {
  assert.equal(L.signalStatus({ data: null }, NOW), 'Signal unavailable');
  assert.equal(L.signalStatus({ data: { generated: '2026-11-25T11:56:00Z' }, cached: false }, NOW), 'Signal updated 4m ago');
  assert.match(L.signalStatus({ data: { generated: '2026-11-25T11:00:00Z' }, cached: true }, NOW, 'UTC'), /^Signal snapshot from 25 Nov, 11:00$/);
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `cd /c/dev/thinkinfosec-hub && node --test "tests/unit/lib.test.js" 2>&1 | tail -4`
Expected: FAIL with `Cannot find module '../../assets/hub/lib.js'`.

- [ ] **Step 3: Implement**

`assets/hub/lib.js`:
```js
/* Pure data logic for the hub. Loaded as window.HubLib in the browser, or with require() in tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HubLib = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const LANES = { cyber: 'Cyber', geo: 'World', ai: 'AI' };
  const ORIGINS = { hub: 'This site', elsewhere: 'Live elsewhere', source: 'Source' };
  const GUIDE_GROUPS = { guide: 'Guides & how-tos', diagram: 'Diagrams & cheat sheets', template: 'Templates & downloads' };

  function safeUrl(value) {
    if (typeof value !== 'string' || !value || value.startsWith('//')) return null;
    if (/^[A-Za-z0-9._~\-/]+(#[A-Za-z0-9_\-]*)?$/.test(value)) return value;
    try {
      const u = new URL(value);
      return u.protocol === 'https:' ? u.href : null;
    } catch (e) {
      return null;
    }
  }
  function isExternal(url) { return /^https:/.test(url || ''); }

  function clip(text, limit) {
    const t = String(text || '').split(/\s+/).filter(Boolean).join(' ');
    if (t.length <= limit) return t;
    const cut = t.slice(0, limit);
    const space = cut.lastIndexOf(' ');
    return (space > 0 ? cut.slice(0, space) : cut) + '…';
  }

  function timeAgo(ts, now) {
    const s = Math.max(0, Math.floor((now - ts) / 1000));
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return m + 'm';
    const h = Math.floor(m / 60);
    if (h < 48) return h + 'h';
    return Math.floor(h / 24) + 'd';
  }
  function fmt(ts, opts, timeZone) {
    return new Date(ts).toLocaleString('en-GB', Object.assign({}, opts, timeZone ? { timeZone } : {}));
  }
  function formatDay(ts, tz) { return fmt(ts, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }, tz).replace(',', ''); }
  function formatDate(ts, tz) { return fmt(ts, { day: 'numeric', month: 'short', year: 'numeric' }, tz); }
  function formatTime(ts, tz) { return fmt(ts, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }, tz); }
  function isStale(iso, now, hours) {
    const g = Date.parse(iso);
    return !Number.isFinite(g) || now - g > hours * 3600e3;
  }

  function mediumKey(url) {
    const m = /-([0-9a-f]{8,12})(?:[/?#]|$)/.exec(url || '');
    if (m) return 'medium:' + m[1];
    return 'url:' + String(url || '').split(/[?#]/)[0].replace(/\/+$/, '').toLowerCase();
  }
  function youtubeId(url) {
    const m = /(?:[?&]v=|youtu\.be\/|\/shorts\/)([\w-]{11})/.exec(url || '');
    return m ? m[1] : null;
  }
  const byTs = (a, b) => (b.ts || 0) - (a.ts || 0);
  const dated = c => (c.date ? Date.parse(c.date) || 0 : 0);

  function newsItems(feed) {
    const items = feed && Array.isArray(feed.items) ? feed.items : [];
    return items
      .filter(i => i && typeof i.title === 'string' && i.title && LANES[i.cat] && Number.isFinite(i.ts))
      .map(i => ({
        key: 'news:' + i.ts + ':' + i.title, title: i.title, cat: i.cat, ts: i.ts,
        summary: typeof i.summary === 'string' ? i.summary : '', source: String(i.source || ''), url: safeUrl(i.link)
      }))
      .sort(byTs);
  }
  function mediaItems(feed) {
    const items = feed && Array.isArray(feed.items) ? feed.items : [];
    return items.filter(i => i && (i.kind === 'article' || i.kind === 'video') && typeof i.title === 'string' &&
      i.title && isExternal(safeUrl(i.url)) && Number.isFinite(i.ts));
  }

  function researchItems(corpus, media) {
    const map = new Map();
    corpus.forEach(c => {
      if (c.kind === 'research') {
        map.set('hub:' + c.id, { key: 'hub:' + c.id, source: 'hub', title: c.title, url: c.link, summary: c.description || '', ts: dated(c) });
      } else if (c.kind === 'writing') {
        // Rows that link only to the profile root have no post id: key them by corpus id so none overwrite each other.
        const mk = mediumKey(c.link);
        const k = mk.startsWith('medium:') ? mk : 'writing:' + c.id;
        map.set(k, { key: k, source: 'medium', title: c.title, url: c.link, summary: c.description || '', ts: dated(c) });
      }
    });
    media.filter(m => m.kind === 'article').forEach(m => {
      const k = mediumKey(m.url);
      const prev = map.get(k) || {};
      map.set(k, { key: k, source: 'medium', title: m.title, url: m.url, summary: prev.summary || clip(m.summary, 180), ts: m.ts, thumb: m.thumb, minutes: m.minutes });
    });
    return Array.from(map.values()).sort(byTs);
  }
  function video(id, title, summary, ts) {
    return { key: 'youtube:' + id, title, url: 'https://www.youtube.com/watch?v=' + id, summary: clip(summary, 160), ts, thumb: 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg' };
  }
  function videoItems(corpus, media) {
    const map = new Map();
    corpus.forEach(c => {
      const id = c.kind === 'learn' && c.origin === 'youtube' ? youtubeId(c.link) : null;
      if (id) map.set(id, video(id, c.title, c.description, dated(c)));
    });
    media.filter(m => m.kind === 'video').forEach(m => {
      const id = youtubeId(m.url);
      if (id) map.set(id, video(id, m.title, m.summary, m.ts));
    });
    return Array.from(map.values()).sort(byTs);
  }
  function toolItems(corpus) {
    return corpus.filter(c => c.kind === 'tool').map(c => ({
      key: 'tool:' + c.id, title: c.title, url: c.link, summary: c.description || '', origin: c.origin,
      featured: !!c.featured, points: Array.isArray(c.points) ? c.points : []
    })).sort((a, b) => Number(b.featured) - Number(a.featured));
  }
  function guideItems(corpus) {
    return corpus.filter(c => (c.kind === 'learn' && c.origin !== 'youtube') || GUIDE_GROUPS[c.kind]).map(c => ({
      key: 'guide:' + c.id, title: c.title, url: c.link, summary: c.description || '', ts: dated(c),
      group: GUIDE_GROUPS[c.group] ? c.group : (GUIDE_GROUPS[c.kind] ? c.kind : 'guide')
    }));
  }

  function filterBy(items, key, value) { return value === 'all' ? items : items.filter(i => i[key] === value); }

  function searchEntries(s) {
    const out = [];
    const add = (items, label) => items.forEach(i => out.push({ label: label(i), title: i.title, summary: i.summary || '', url: i.url }));
    add(s.news, () => 'News');
    add(s.research, r => (r.source === 'medium' ? 'Research · Medium' : 'Research'));
    add(s.videos, () => 'Video');
    add(s.tools, () => 'Tool');
    add(s.guides, g => GUIDE_GROUPS[g.group]);
    return out;
  }
  function search(entries, q) {
    const tokens = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    return entries.filter(e => {
      const hay = (e.title + ' ' + e.summary + ' ' + e.label).toLowerCase();
      return tokens.every(t => hay.includes(t));
    });
  }

  function signalStatus(res, now, tz) {
    if (!res || !res.data) return 'Signal unavailable';
    const gen = Date.parse(res.data.generated);
    if (!Number.isFinite(gen)) return res.cached ? 'Signal snapshot' : 'Signal updated';
    if (res.cached) return 'Signal snapshot from ' + formatTime(gen, tz);
    const ago = timeAgo(gen, now);
    return ago === 'just now' ? 'Signal updated just now' : 'Signal updated ' + ago + ' ago';
  }

  return {
    LANES, ORIGINS, GUIDE_GROUPS, safeUrl, isExternal, clip, timeAgo, formatDay, formatDate, formatTime, isStale,
    mediumKey, youtubeId, newsItems, mediaItems, researchItems, videoItems, toolItems, guideItems,
    filterBy, searchEntries, search, signalStatus
  };
});
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `node --test "tests/unit/lib.test.js" 2>&1 | grep -E "^# (pass|fail)"`
Expected: `# pass 14` and `# fail 0`. If `formatDay` or `formatTime` differs only in punctuation for the ICU build, adjust that function's output (not the test) so it produces exactly `Wed 25 Nov 2026` and `25 Nov, 11:00`.

- [ ] **Step 5: Commit**

```bash
git add assets/hub/lib.js tests/unit/lib.test.js && git commit -m "Add the hub data library with unit tests."
```

---

### Task 7: Theme tokens, styles and contrast test (TDD)

**Files:**
- Create: `tests/unit/contrast.test.js`
- Create: `assets/hub.css`

- [ ] **Step 1: Write the failing contrast test**

`tests/unit/contrast.test.js`:
```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '../../assets/hub.css'), 'utf8');
function tokens(theme) {
  const m = css.match(new RegExp(':root\\[data-theme="' + theme + '"\\]\\s*\\{([^}]*)\\}'));
  assert.ok(m, theme + ' token block missing');
  const t = {};
  for (const [, k, v] of m[1].matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) t[k] = v;
  return t;
}
function lum(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(x => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

const PAIRS = [
  ['ink', 'bg'], ['muted', 'bg'], ['ink', 'panel'], ['muted', 'panel'], ['acc-ink', 'bg'],
  ['mag-ink', 'bg'], ['mag-ink', 'panel'], ['gold-ink', 'bg'], ['panel-kicker', 'panel'], ['on-acc', 'acc']
];
for (const theme of ['dark', 'light']) {
  test(theme + ' theme text pairs reach 4.5:1', () => {
    const t = tokens(theme);
    for (const [fg, bg] of PAIRS) {
      assert.ok(t[fg] && t[bg], theme + ' missing --' + fg + ' or --' + bg);
      const r = ratio(t[fg], t[bg]);
      assert.ok(r >= 4.5, `${theme}: --${fg} on --${bg} is ${r.toFixed(2)}:1`);
    }
  });
}
test('dark panel labels are not cyan on blue', () => {
  assert.equal(tokens('dark')['panel-kicker'].toLowerCase(), '#ffffff');
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `node --test "tests/unit/contrast.test.js" 2>&1 | tail -3`
Expected: FAIL with `ENOENT ... hub.css`.

- [ ] **Step 3: Write `assets/hub.css`**

```css
/* ThinkInfoSec Hub.
   Rule: in dark, accent text (--acc-ink) sits only on --bg, never on --panel (no cyan on blue).
   Labels on panels use --panel-kicker. */
:root[data-theme="dark"] {
  --bg: #02050b; --panel: #0f2547; --line: #2f4f86;
  --ink: #ffffff; --muted: #d3dcea;
  --acc: #00BFCF; --acc-ink: #5fe9f5; --on-acc: #02050b;
  --mag: #FF3D9A; --mag-ink: #ff7ab8;
  --gold-ink: #f5c542;
  --panel-kicker: #ffffff;
  color-scheme: dark;
}
:root[data-theme="light"] {
  --bg: #f6f8fb; --panel: #ffffff; --line: #d9e1ec;
  --ink: #0D1F3C; --muted: #4a5a72;
  --acc: #00BFCF; --acc-ink: #007C87; --on-acc: #0D1F3C;
  --mag: #FF3D9A; --mag-ink: #B0125B;
  --gold-ink: #8a5a00;
  --panel-kicker: #007C87;
  color-scheme: light;
}
* { box-sizing: border-box; }
html, body { background: var(--bg); color: var(--ink); }
body { margin: 0; font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
a { color: inherit; text-underline-offset: 3px; }
a:hover { text-decoration-color: var(--acc); text-decoration-thickness: 2px; }
:focus-visible { outline: 3px solid var(--acc); outline-offset: 2px; }
.wrap { width: min(1200px, 100% - 32px); margin-inline: auto; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.skip { position: absolute; left: -999px; top: 8px; background: var(--acc); color: var(--on-acc); padding: 8px 12px; z-index: 20; }
.skip:focus { left: 8px; }

.masthead { position: sticky; top: 0; z-index: 10; background: var(--bg); border-bottom: 1px solid var(--line); }
.masthead-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-top: 16px; }
.brand { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.01em; text-decoration: none; }
.brand span { color: var(--acc-ink); }
.brand small { font-size: 0.8rem; font-weight: 500; color: var(--muted); }
.dateline { color: var(--muted); font-size: 0.85rem; margin-top: 2px; margin-bottom: 8px; }
.theme-toggle { display: flex; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; }
.theme-toggle button { background: none; border: 0; color: var(--muted); font: inherit; font-size: 0.85rem; padding: 4px 12px; cursor: pointer; }
.theme-toggle button[aria-pressed="true"] { background: var(--acc); color: var(--on-acc); font-weight: 700; }
.tabs { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
.tabs [role="tab"] { background: none; border: 0; color: var(--muted); font: inherit; font-weight: 600; padding: 10px 12px; white-space: nowrap; cursor: pointer; box-shadow: inset 0 -3px 0 transparent; }
.tabs [role="tab"][aria-selected="true"] { color: var(--ink); box-shadow: inset 0 -3px 0 var(--acc); }

.search { margin: 20px 0 12px; }
.search input { width: 100%; padding: 10px 14px; font: inherit; color: var(--ink); background: var(--panel); border: 1px solid var(--line); border-radius: 8px; }
.search input::placeholder { color: var(--muted); }
.search-status { color: var(--muted); font-size: 0.85rem; min-height: 1.2em; margin: 6px 0 0; }
.results { margin-bottom: 24px; }
[role="tabpanel"] { padding: 8px 0 48px; }
[hidden] { display: none !important; }

.kicker { display: inline-block; margin: 0 0 4px; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--acc-ink); }
.kicker-mag, .lane-ai { color: var(--mag-ink); }
.lane-cyber { color: var(--acc-ink); }
.lane-geo { color: var(--gold-ink); }
.card .kicker, .band .kicker { color: var(--panel-kicker); }
.meta { color: var(--muted); font-size: 0.85rem; }
.section-title { font-size: 1.4rem; margin: 8px 0 12px; }

.band { display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center; margin-bottom: 24px; padding: 14px 18px; background: var(--panel); border: 1px solid var(--line); border-left: 4px solid var(--acc); border-radius: 8px; }
.band h3 { margin: 0; font-size: 1.1rem; }
.band p { margin: 2px 0 6px; }
.band ul { margin: 0; padding-left: 18px; color: var(--muted); font-size: 0.9rem; }
.band-cta { background: var(--acc); color: var(--on-acc); font-weight: 700; padding: 8px 14px; border-radius: 6px; text-decoration: none; white-space: nowrap; }

.lead-grid { display: grid; grid-template-columns: 2fr 1.2fr; gap: 28px; margin-bottom: 28px; }
.lead-art { aspect-ratio: 16 / 6; border-radius: 8px; border: 1px solid var(--line); background: linear-gradient(118deg, #163a72 0 52%, #00BFCF 52% 56%, #FF3D9A 56% 59%, #081428 59%); margin-bottom: 10px; }
.lead h3 { font-size: clamp(1.6rem, 3vw, 2.4rem); line-height: 1.1; margin: 4px 0 8px; }
.lead h3 a { text-decoration: none; }
.lead p { color: var(--muted); font-size: 1.05rem; margin: 0 0 8px; }
.wire ol, .news-list { list-style: none; margin: 0; padding: 0; }
.wire li, .news-list li { display: grid; grid-template-columns: 2.2em 1fr; gap: 6px; padding: 10px 0; border-top: 1px solid var(--line); }
.results-list { list-style: none; margin: 0; padding: 0; }
.results-list li { padding: 8px 0; border-top: 1px solid var(--line); }
.num { font-weight: 800; color: var(--muted); }
.headline { margin: 0 0 2px; font-size: 1rem; line-height: 1.3; }
.headline a { text-decoration: none; }
.more { display: inline-block; margin-top: 8px; color: var(--muted); }

.rail { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.card { display: flex; flex-direction: column; gap: 4px; padding: 14px; background: var(--panel); border: 1px solid var(--line); border-top: 3px solid var(--acc); border-radius: 8px; }
.card.accent-mag { border-top-color: var(--mag); }
.card h4 { margin: 0; font-size: 1.05rem; line-height: 1.25; }
.card h4 a { text-decoration: none; }
.card p { margin: 0; color: var(--muted); font-size: 0.92rem; }
.thumb { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 6px; background: var(--line); margin-bottom: 6px; }
.ext::after { content: " ↗"; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 16px; }
.chip { font: inherit; font-size: 0.85rem; color: var(--ink); background: none; border: 1px solid var(--line); border-radius: 999px; padding: 4px 12px; cursor: pointer; }
.chip[aria-pressed="true"] { background: var(--acc); border-color: var(--acc); color: var(--on-acc); font-weight: 700; }
.empty { color: var(--muted); padding: 24px 0; }
.notice { border-left: 4px solid var(--gold-ink); padding: 6px 12px; color: var(--muted); }
.stamp { color: var(--muted); font-size: 0.85rem; margin-top: 12px; }

.about { max-width: 70ch; }
.connect { display: flex; flex-wrap: wrap; gap: 10px; list-style: none; padding: 0; }
.connect a { display: inline-block; border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; text-decoration: none; }
.site-foot { border-top: 1px solid var(--line); color: var(--muted); font-size: 0.85rem; padding: 20px 0 40px; }

@media (max-width: 760px) {
  .lead-grid, .band { grid-template-columns: 1fr; }
  .brand { font-size: 1.4rem; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; scroll-behavior: auto !important; } }
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `node --test "tests/unit/contrast.test.js" 2>&1 | grep -E "^# (pass|fail)"`
Expected: `# pass 3` and `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add assets/hub.css tests/unit/contrast.test.js && git commit -m "Add the hub theme tokens and styles with a contrast test."
```

---

### Task 8: Browser modules (theme, feeds, render, tabs, search, app)

**Files:**
- Create: `assets/hub/theme-init.js`, `theme.js`, `feeds.js`, `render.js`, `tabs.js`, `search.js`, `app.js`

These modules are covered by the smoke tests in Task 10. Write them all, then commit.

- [ ] **Step 1: `assets/hub/theme-init.js`**

```js
(function () {
  var t = null;
  try { t = localStorage.getItem('hub-theme'); } catch (e) {}
  if (t !== 'dark' && t !== 'light') {
    t = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.documentElement.setAttribute('data-theme', t);
})();
```

- [ ] **Step 2: `assets/hub/theme.js`**

```js
(function () {
  const buttons = document.querySelectorAll('[data-theme-set]');
  function apply(theme, save) {
    document.documentElement.setAttribute('data-theme', theme);
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === theme)));
    if (save) { try { localStorage.setItem('hub-theme', theme); } catch (e) {} }
  }
  apply(document.documentElement.getAttribute('data-theme') || 'dark', false);
  buttons.forEach(b => b.addEventListener('click', () => apply(b.dataset.themeSet, true)));
})();
```

- [ ] **Step 3: `assets/hub/feeds.js`**

```js
(function (root) {
  const BASE = 'https://thinkinfosec.github.io/Signal/';
  async function load(name) {
    const key = 'hub-feed:' + name;
    try {
      const res = await fetch(BASE + name, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      try { localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data })); } catch (e) {}
      return { data, cached: false };
    } catch (err) {
      try {
        const hit = JSON.parse(localStorage.getItem(key) || 'null');
        if (hit && hit.data) return { data: hit.data, cached: true };
      } catch (e) {}
      return { data: null, cached: false };
    }
  }
  root.HubFeeds = { load };
})(window);
```

- [ ] **Step 4: `assets/hub/render.js`**

```js
(function (root) {
  const L = root.HubLib;

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function link(href, text, cls) {
    const a = el('a', cls, text);
    const safe = L.safeUrl(href);
    if (safe) {
      a.href = safe;
      if (L.isExternal(safe)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; a.classList.add('ext'); }
    }
    return a;
  }
  function titleNode(item) { return L.safeUrl(item.url) ? link(item.url, item.title) : el('span', null, item.title); }
  function setEmpty(node, message) { node.replaceChildren(el('p', 'empty', message)); }
  function list(node, items, make, emptyMessage) {
    if (!items.length) return setEmpty(node, emptyMessage);
    node.replaceChildren(...items.map(make));
  }

  function chips(container, options, onPick) {
    container.replaceChildren();
    options.forEach((o, i) => {
      const b = el('button', 'chip', o.count == null ? o.label : o.label + ' (' + o.count + ')');
      b.type = 'button';
      b.dataset.value = o.value;
      b.setAttribute('aria-pressed', String(i === 0));
      b.addEventListener('click', () => {
        container.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        onPick(o.value);
      });
      container.append(b);
    });
  }
  function activeChip(container) {
    const on = container.querySelector('.chip[aria-pressed="true"]');
    return on ? on.dataset.value : 'all';
  }

  function headlineRow(item, index, now) {
    const li = el('li');
    const body = el('div');
    const h = el('h4', 'headline');
    h.append(titleNode(item));
    body.append(el('span', 'kicker lane-' + item.cat, L.LANES[item.cat]), h, el('span', 'meta', item.source + ' · ' + L.timeAgo(item.ts, now)));
    li.append(el('span', 'num', String(index + 1).padStart(2, '0')), body);
    return li;
  }

  function card(item, kicker, accent) {
    const c = el('article', 'card' + (accent === 'mag' ? ' accent-mag' : ''));
    const thumb = L.safeUrl(item.thumb);
    if (thumb) {
      const img = el('img', 'thumb');
      img.src = thumb; img.alt = ''; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
      c.append(img);
    }
    const h = el('h4');
    h.append(titleNode(item));
    c.append(el('span', 'kicker', kicker), h);
    if (item.summary) c.append(el('p', null, item.summary));
    const meta = [];
    if (item.ts) meta.push(L.formatDate(item.ts));
    if (item.minutes) meta.push(item.minutes + ' min read');
    if (meta.length) c.append(el('span', 'meta', meta.join(' · ')));
    return c;
  }

  function lead(node, item, now) {
    if (!item) return setEmpty(node, 'Headlines appear here when Signal is reachable.');
    const art = el('div', 'lead-art');
    art.setAttribute('aria-hidden', 'true');
    const h = el('h3');
    h.append(titleNode(item));
    node.replaceChildren(art, el('span', 'kicker lane-' + item.cat, L.LANES[item.cat] + ' · lead story'), h,
      el('p', null, L.clip(item.summary, 260)), el('span', 'meta', item.source + ' · ' + L.timeAgo(item.ts, now)));
  }

  function outcomes(node, tools) {
    node.replaceChildren(...tools.filter(t => t.featured).map(t => {
      const band = el('section', 'band');
      band.setAttribute('aria-label', 'Outcomes');
      const mid = el('div');
      mid.append(el('h3', null, t.title), el('p', 'meta', t.summary));
      if (t.points.length) {
        const ul = el('ul');
        t.points.forEach(p => ul.append(el('li', null, p)));
        mid.append(ul);
      }
      band.append(el('span', 'kicker', 'Outcomes'), mid, link(t.url, 'Open ' + t.title, 'band-cta'));
      return band;
    }));
  }

  root.HubRender = { el, link, titleNode, setEmpty, list, chips, activeChip, headlineRow, card, lead, outcomes };
})(window);
```

- [ ] **Step 5: `assets/hub/tabs.js`**

```js
(function (root) {
  const ALIASES = { outcomes: 'tools', projects: 'tools', learn: 'guides', connect: 'about' };
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const ids = tabs.map(t => t.dataset.tab);

  function resolve(hash) {
    const id = String(hash || '').replace(/^#/, '');
    const real = ALIASES[id] || id;
    return ids.includes(real) ? real : 'front';
  }
  function select(id, focus) {
    tabs.forEach(t => {
      const on = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById('panel-' + t.dataset.tab).hidden = !on;
      if (on && focus) t.focus();
    });
    document.title = (id === 'front' ? '' : tabs[ids.indexOf(id)].textContent + ' · ') + 'ThinkInfoSec Hub';
  }
  function go(id, focus) {
    if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
    select(id, focus);
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => go(t.dataset.tab, false));
    t.addEventListener('keydown', e => {
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); go(ids[j], true); }
    });
  });
  function known(hash) {
    const id = String(hash || '').replace(/^#/, '');
    return ids.includes(ALIASES[id] || id);
  }
  // Non-tab hashes (e.g. #main from the skip link) must not switch tabs.
  function onNav() { if (!location.hash || known(location.hash)) select(resolve(location.hash), false); }
  window.addEventListener('popstate', onNav);
  window.addEventListener('hashchange', onNav);

  const initial = resolve(location.hash);
  if (location.hash && location.hash !== '#' + initial) history.replaceState(null, '', '#' + initial);
  select(initial, false);
  root.HubTabs = { go };
})(window);
```

- [ ] **Step 6: `assets/hub/search.js`**

```js
(function (root) {
  const L = root.HubLib, R = root.HubRender;
  function init(o) {
    function run() {
      const q = o.input.value.trim();
      if (!q) { o.results.hidden = true; o.results.replaceChildren(); o.status.textContent = ''; return; }
      const hits = L.search(o.entries(), q);
      o.status.textContent = hits.length === 1 ? '1 result' : hits.length + ' results';
      const ol = R.el('ol', 'results-list');
      hits.slice(0, 40).forEach(h => {
        const li = R.el('li');
        const t = R.el('h4', 'headline');
        t.append(R.titleNode(h));
        li.append(R.el('span', 'kicker', h.label), t);
        ol.append(li);
      });
      o.results.replaceChildren(ol);
      o.results.hidden = false;
    }
    o.form.addEventListener('submit', e => e.preventDefault());
    o.input.addEventListener('input', run);
    o.input.addEventListener('keydown', e => { if (e.key === 'Escape') { o.input.value = ''; run(); } });
    return { run };
  }
  root.HubSearch = { init };
})(window);
```

- [ ] **Step 7: `assets/hub/app.js`**

```js
(async function () {
  const L = window.HubLib, R = window.HubRender;
  const $ = id => document.getElementById(id);
  const now = Date.now();
  const cat = window.THINKINFOSEC_CATALOG;
  const corpus = cat && cat.corpus && Array.isArray(cat.corpus.items) ? cat.corpus.items : [];

  const tools = L.toolItems(corpus);
  const guides = L.guideItems(corpus);
  let research = L.researchItems(corpus, []);
  let videos = L.videoItems(corpus, []);
  let news = [];

  const all = (extra) => [{ value: 'all', label: 'All' }].concat(extra);
  const pairs = obj => Object.keys(obj).map(value => ({ value, label: obj[value] }));

  function renderTools(origin) {
    R.list($('toolGrid'), L.filterBy(tools.filter(t => !t.featured), 'origin', origin),
      t => R.card(t, L.ORIGINS[t.origin] || 'Tool'), 'No tools in this group yet.');
  }
  function renderGuides(group) {
    R.list($('guideGrid'), L.filterBy(guides, 'group', group),
      g => R.card(g, L.GUIDE_GROUPS[g.group]), 'Nothing in this group yet. New items land here as they are published.');
  }
  function renderResearch(source) {
    R.list($('researchList'), L.filterBy(research, 'source', source),
      r => R.card(r, r.source === 'medium' ? 'Medium' : 'Hub research', r.source === 'medium' ? 'mag' : null), 'No research yet.');
  }
  function renderVideos() {
    R.list($('videoGrid'), videos, v => R.card(v, 'YouTube'), 'Videos appear here when the feed is reachable.');
  }
  function renderNews(lane) {
    R.list($('newsList'), L.filterBy(news, 'cat', lane), (n, i) => R.headlineRow(n, i, now), 'No headlines right now.');
  }
  function renderFront() {
    R.lead($('leadStory'), news[0], now);
    R.list($('liveWire'), news.slice(1, 5), (n, i) => R.headlineRow(n, i + 1, now), 'Waiting for Signal.');
    const latest = [
      ['Research', research.find(r => r.source === 'hub'), null],
      ['Medium', research.find(r => r.source === 'medium'), 'mag'],
      ['YouTube', videos[0], null],
      ['Guide', guides[0], 'mag']
    ].filter(x => x[1]);
    R.list($('latestRail'), latest, x => R.card(Object.assign({}, x[1], { summary: '', thumb: null }), x[0], x[2]), 'Nothing new yet.');
  }

  R.outcomes($('outcomesBand'), tools);
  R.outcomes($('toolsOutcomes'), tools);
  R.chips($('toolChips'), all(pairs(L.ORIGINS)), renderTools);
  R.chips($('guideChips'), [{ value: 'all', label: 'All', count: guides.length }].concat(
    pairs(L.GUIDE_GROUPS).map(o => Object.assign(o, { count: guides.filter(g => g.group === o.value).length }))), renderGuides);
  R.chips($('researchChips'), all([{ value: 'hub', label: 'Hub' }, { value: 'medium', label: 'Medium' }]), renderResearch);
  R.chips($('newsChips'), all(pairs(L.LANES)), renderNews);
  renderTools('all'); renderGuides('all'); renderResearch('all'); renderVideos(); renderNews('all'); renderFront();
  $('dateline').textContent = L.formatDay(now) + ' · Loading Signal…';

  window.HubSearch.init({
    form: $('searchForm'), input: $('q'), status: $('searchStatus'), results: $('searchResults'),
    entries: () => L.searchEntries({ news, research, videos, tools, guides })
  });

  const [newsRes, mediaRes] = await Promise.all([window.HubFeeds.load('news.json'), window.HubFeeds.load('media.json')]);
  news = L.newsItems(newsRes.data);
  const media = L.mediaItems(mediaRes.data);
  research = L.researchItems(corpus, media);
  videos = L.videoItems(corpus, media);
  renderNews(R.activeChip($('newsChips')));
  renderResearch(R.activeChip($('researchChips')));
  renderVideos();
  renderFront();

  $('dateline').textContent = L.formatDay(now) + ' · ' + L.signalStatus(newsRes, now);
  const stamp = $('newsStamp');
  if (newsRes.data && L.isStale(newsRes.data.generated, now, 6)) {
    stamp.className = 'notice';
    stamp.textContent = 'These headlines are more than 6 hours old. Signal may be paused.';
  } else if (newsRes.data) {
    stamp.className = 'stamp';
    stamp.textContent = 'Snapshot built ' + L.formatTime(Date.parse(newsRes.data.generated));
  }
})();
```
Note that the live wire starts numbering at `02`, because `01` is the lead story.

- [ ] **Step 8: Commit**

```bash
git add assets/hub/theme-init.js assets/hub/theme.js assets/hub/feeds.js assets/hub/render.js assets/hub/tabs.js assets/hub/search.js assets/hub/app.js && git commit -m "Add the hub browser modules."
```

---

### Task 9: Replace `index.html` with the shell

**Files:**
- Modify (full replace): `index.html`

- [ ] **Step 1: Write the new `index.html`**

The old file stays in git history, so there's no need to keep a copy.
```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://i.ytimg.com https://cdn-images-1.medium.com https://miro.medium.com; connect-src 'self' https://thinkinfosec.github.io; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>ThinkInfoSec Hub</title>
  <meta name="description" content="Research, tools, guides and the day's cyber, world and AI headlines from ThinkInfoSec.">
  <script src="assets/hub/theme-init.js"></script>
  <link rel="stylesheet" href="assets/hub.css">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="masthead">
    <div class="wrap masthead-row">
      <a class="brand" href="#front">Think<span>InfoSec</span> <small>Hub</small></a>
      <div class="theme-toggle" role="group" aria-label="Colour theme">
        <button type="button" data-theme-set="dark" aria-pressed="true">Dark</button>
        <button type="button" data-theme-set="light" aria-pressed="false">Light</button>
      </div>
    </div>
    <p class="wrap dateline" id="dateline" aria-live="polite"></p>
    <nav class="wrap" aria-label="Sections">
      <div class="tabs" role="tablist" aria-label="Hub sections">
        <button type="button" role="tab" id="tab-front" aria-controls="panel-front" data-tab="front">Front page</button>
        <button type="button" role="tab" id="tab-news" aria-controls="panel-news" data-tab="news">News</button>
        <button type="button" role="tab" id="tab-research" aria-controls="panel-research" data-tab="research">Research</button>
        <button type="button" role="tab" id="tab-videos" aria-controls="panel-videos" data-tab="videos">Videos</button>
        <button type="button" role="tab" id="tab-tools" aria-controls="panel-tools" data-tab="tools">Tools</button>
        <button type="button" role="tab" id="tab-guides" aria-controls="panel-guides" data-tab="guides">Guides &amp; Assets</button>
        <button type="button" role="tab" id="tab-about" aria-controls="panel-about" data-tab="about">About</button>
      </div>
    </nav>
  </header>

  <main id="main" class="wrap">
    <form class="search" role="search" id="searchForm">
      <label class="visually-hidden" for="q">Search the hub</label>
      <input id="q" type="search" placeholder="Search research, articles, videos, tools, guides…" autocomplete="off">
      <p id="searchStatus" class="search-status" aria-live="polite"></p>
    </form>
    <section id="searchResults" class="results" aria-label="Search results" hidden></section>

    <section role="tabpanel" id="panel-front" aria-labelledby="tab-front" hidden>
      <div id="outcomesBand"></div>
      <div class="lead-grid">
        <article id="leadStory" class="lead"></article>
        <aside class="wire" aria-labelledby="wire-h">
          <h3 id="wire-h" class="kicker kicker-mag">Live wire</h3>
          <ol id="liveWire"></ol>
          <a href="#news" class="more">All news →</a>
        </aside>
      </div>
      <h3 class="kicker">Latest</h3>
      <div id="latestRail" class="rail"></div>
    </section>

    <section role="tabpanel" id="panel-news" aria-labelledby="tab-news" hidden>
      <h2 class="section-title">News from Signal</h2>
      <div id="newsChips" class="chips" role="group" aria-label="Filter news by lane"></div>
      <ol id="newsList" class="news-list"></ol>
      <p id="newsStamp" class="stamp"></p>
    </section>

    <section role="tabpanel" id="panel-research" aria-labelledby="tab-research" hidden>
      <h2 class="section-title">Research and articles</h2>
      <div id="researchChips" class="chips" role="group" aria-label="Filter research by source"></div>
      <div id="researchList" class="grid"></div>
    </section>

    <section role="tabpanel" id="panel-videos" aria-labelledby="tab-videos" hidden>
      <h2 class="section-title">Videos</h2>
      <div id="videoGrid" class="grid"></div>
      <p class="stamp"><a href="https://www.youtube.com/@thinkinfosecorg" class="ext" target="_blank" rel="noopener noreferrer">All videos on YouTube</a></p>
    </section>

    <section role="tabpanel" id="panel-tools" aria-labelledby="tab-tools" hidden>
      <h2 class="section-title">Tools</h2>
      <div id="toolsOutcomes"></div>
      <div id="toolChips" class="chips" role="group" aria-label="Filter tools by where they are hosted"></div>
      <div id="toolGrid" class="grid"></div>
    </section>

    <section role="tabpanel" id="panel-guides" aria-labelledby="tab-guides" hidden>
      <h2 class="section-title">Guides &amp; Assets</h2>
      <div id="guideChips" class="chips" role="group" aria-label="Filter guides and assets by type"></div>
      <div id="guideGrid" class="grid"></div>
    </section>

    <section role="tabpanel" id="panel-about" aria-labelledby="tab-about" hidden>
      <h2 class="section-title">About</h2>
      <div class="about">
        <p>Welcome to my learning hub! I specialize in AI, InfoSec, and Cloud technologies, with a passion for sharing knowledge and building practical solutions.</p>
        <p>Through this platform, I share tools, research, and educational content to help the cybersecurity and cloud community grow and learn together.</p>
      </div>
      <h3 class="kicker">Connect</h3>
      <ul class="connect">
        <li><a href="https://www.youtube.com/@thinkinfosecorg" target="_blank" rel="noopener noreferrer">YouTube</a></li>
        <li><a href="https://andrecamillo.medium.com/" target="_blank" rel="noopener noreferrer">Medium</a></li>
        <li><a href="https://www.linkedin.com/in/amcamillo/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
        <li><a href="https://open.spotify.com/show/2e32C7SFXNUqfRR3YemmtI" target="_blank" rel="noopener noreferrer">Podcast</a></li>
        <li><a href="https://discord.gg/NMefYksn" target="_blank" rel="noopener noreferrer">Discord</a></li>
      </ul>
    </section>
  </main>

  <footer class="wrap site-foot"><p>ThinkInfoSec · <a href="https://thinkinfosec.org">thinkinfosec.org</a></p></footer>

  <script src="catalog/catalog.js"></script>
  <script src="assets/hub/lib.js"></script>
  <script src="assets/hub/theme.js"></script>
  <script src="assets/hub/feeds.js"></script>
  <script src="assets/hub/render.js"></script>
  <script src="assets/hub/tabs.js"></script>
  <script src="assets/hub/search.js"></script>
  <script src="assets/hub/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Check that nothing else in the repo depends on removed inline IDs**

Run: `grep -rn "featuredGrid\|projectsGrid\|data-set-look\|thinkinfosec-look" --include=*.html --include=*.js . | grep -v node_modules | grep -v .superpowers | head`
Expected: no matches outside `index.html`. If research pages still read or write `thinkinfosec-look`, leave them alone; the hub no longer uses that key. If research pages reference `index.html#<anchor>`, check that the anchor is a tab id or an alias (`research`, `tools`, `learn`, `outcomes`, `connect`).

- [ ] **Step 3: Commit**

```bash
git add index.html && git commit -m "Replace the hub page with the tabbed front-page shell."
```

---

### Task 10: Smoke tests

**Files:**
- Create: `tests/smoke/hub.smoke.test.js`

- [ ] **Step 1: Write the smoke tests**

```js
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const FIX = path.join(__dirname, '..', 'fixtures');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const TABS = ['front', 'news', 'research', 'videos', 'tools', 'guides', 'about'];
let server, browser, base;

before(async () => {
  server = http.createServer((req, res) => {
    let file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/index.html';
  browser = await chromium.launch();
});
after(async () => { await browser.close(); server.close(); });

async function feeds(context, mode) {
  await context.unroute('https://thinkinfosec.github.io/Signal/*').catch(() => {});
  await context.route('https://thinkinfosec.github.io/Signal/*', route => {
    if (mode === 'down') return route.abort();
    const name = path.basename(new URL(route.request().url()).pathname);
    return route.fulfill({ path: path.join(FIX, name), contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' } });
  });
}
async function open(hash, opts = {}) {
  const context = await browser.newContext({ colorScheme: opts.scheme || 'dark' });
  await context.route(/i\.ytimg\.com|medium\.com/, r => r.abort());
  await feeds(context, opts.feeds || 'up');
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED/.test(m.text())) errors.push(m.text()); });
  await page.goto(base + (hash || ''));
  await page.waitForFunction(() => /Signal (updated|snapshot|unavailable)/.test(document.getElementById('dateline').textContent));
  return { context, page, errors };
}

test('every tab renders from a direct link with no errors', async () => {
  for (const id of TABS) {
    const { context, page, errors } = await open('#' + id);
    assert.equal(await page.getAttribute('#tab-' + id, 'aria-selected'), 'true', id);
    assert.equal(await page.isVisible('#panel-' + id), true, id);
    const visible = await page.$$eval('[role="tabpanel"]', ps => ps.filter(p => !p.hidden).length);
    assert.equal(visible, 1, id);
    assert.deepEqual(errors, [], id);
    await context.close();
  }
});

test('panels show feed and corpus content', async () => {
  const { context, page } = await open('#news');
  assert.equal(await page.locator('#newsList li').count(), 3);
  await page.click('#newsChips [data-value="ai"]');
  assert.equal(await page.locator('#newsList li').count(), 1);
  await page.click('#tab-research');
  assert.match(await page.textContent('#researchList'), /Fixture Medium article on agent identity/);
  assert.ok(await page.locator('#researchList .card').count() > 10);
  await page.click('#tab-videos');
  assert.match(await page.textContent('#videoGrid'), /Fixture video on kernel access/);
  await page.click('#tab-tools');
  assert.equal(await page.locator('#toolsOutcomes .band').count(), 1);
  await page.click('#tab-front');
  assert.match(await page.textContent('#leadStory'), /Fixture cyber headline/);
  assert.equal(await page.locator('#liveWire li').count(), 2);
  await context.close();
});

test('old anchors redirect to their tab', async () => {
  const { context, page } = await open('#outcomes');
  assert.equal(await page.getAttribute('#tab-tools', 'aria-selected'), 'true');
  assert.match(page.url(), /#tools$/);
  await context.close();
});

test('arrow keys move between tabs', async () => {
  const { context, page } = await open('');
  await page.focus('#tab-front');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getAttribute('#tab-news', 'aria-selected'), 'true');
  await page.keyboard.press('End');
  assert.equal(await page.getAttribute('#tab-about', 'aria-selected'), 'true');
  await context.close();
});

test('theme follows the system setting, then remembers the choice', async () => {
  const { context, page } = await open('', { scheme: 'light' });
  assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
  await page.click('[data-theme-set="dark"]');
  await page.reload();
  assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
  assert.equal(await page.getAttribute('[data-theme-set="dark"]', 'aria-pressed'), 'true');
  await context.close();
});

test('search finds every kind of item', async () => {
  const { context, page } = await open('');
  const labels = async q => {
    await page.fill('#q', q);
    return page.$$eval('#searchResults .kicker', ks => ks.map(k => k.textContent));
  };
  assert.ok((await labels('ransomware')).includes('News'));
  assert.ok((await labels('agent identity')).includes('Research · Medium'));
  assert.ok((await labels('kernel access')).includes('Video'));
  assert.ok((await labels('password hasher')).includes('Tool'));
  assert.ok((await labels('resource library')).includes('Guides & how-tos'));
  await page.fill('#q', '');
  assert.equal(await page.isHidden('#searchResults'), true);
  await context.close();
});

test('feeds down with no cache: empty states, rest of hub works', async () => {
  const { context, page } = await open('#news', { feeds: 'down' });
  assert.match(await page.textContent('#dateline'), /Signal unavailable/);
  assert.match(await page.textContent('#newsList'), /No headlines right now/);
  await page.click('#tab-tools');
  assert.ok(await page.locator('#toolGrid .card').count() > 5);
  await context.close();
});

test('feeds down with a cache: snapshot label', async () => {
  const { context, page } = await open('#news');
  await feeds(context, 'down');
  await page.reload();
  await page.waitForFunction(() => /Signal (updated|snapshot|unavailable)/.test(document.getElementById('dateline').textContent));
  assert.match(await page.textContent('#dateline'), /Signal snapshot from/);
  assert.equal(await page.locator('#newsList li').count(), 3);
  await context.close();
});
```

- [ ] **Step 2: Run all hub tests (first of at most two full runs)**

Run: `cd /c/dev/thinkinfosec-hub && node --test "tests/unit/*.test.js" "tests/smoke/*.test.js" 2>&1 | grep -E "^# (pass|fail)|^not ok" `
Expected: `# pass 25` and `# fail 0` (14 lib, 3 contrast, 8 smoke). If anything fails, fix the module, not the test, unless the test contradicts the spec. Rerun only the failing file.

- [ ] **Step 3: Commit**

```bash
git add tests/smoke/hub.smoke.test.js && git commit -m "Add Playwright smoke tests for the tabbed hub."
```

---

### Task 11: Visual check and local docs

**Files:**
- Modify: `.cursor/skills/writing-hub-research/publishing.md` (local and untracked, not committed)
- Modify: `README.md`

- [ ] **Step 1: Take two screenshots**

Serve with `cd /c/dev/thinkinfosec-hub && python -m http.server 8768` running in the background. Using the Playwright MCP at 1366×900, open `http://127.0.0.1:8768/index.html#front` in dark, then click Light. Save `front-dark.png` and `front-light.png` to the session scratchpad. Look at each once. Check that the lead story, live wire, Outcomes band and Latest rail are laid out as in the approved mockup `dark-contrast-v2.html`, and that no text is cyan on a navy panel. Feeds load live here; if `media.json` is not pushed yet, Videos and Medium still show the corpus items.

- [ ] **Step 2: Replace the "Homepage card" step in the publishing guide**

```bash
python - <<'EOF'
import re
p = ".cursor/skills/writing-hub-research/publishing.md"
s = open(p, encoding="utf-8").read()
new = ("## Homepage card\n\nThe hub front page builds every card from `catalog/corpus.json`. Do not edit `index.html`. "
       "Add the corpus row below with a `date` (YYYY-MM-DD) so the briefing sorts first in Research, then rebuild `catalog.js`.\n\n")
s2 = re.sub(r"## Homepage card\n.*?(?=\n## )", new.rstrip("\n") + "\n", s, count=1, flags=re.S)
assert s2 != s, "section not found"
s2 = s2.replace("index.html                          # Research card in #research\n", "")
open(p, "w", encoding="utf-8").write(s2)
EOF
```

- [ ] **Step 3: Add a short README section**

Append to `README.md`:
```markdown
## Front page

`index.html` is a tabbed shell. Cards come from `catalog/corpus.json` (rebuild `catalog/catalog.js` after editing). News and the Medium and YouTube lists come from `news.json` and `media.json`, published by the Signal repo at `https://thinkinfosec.github.io/Signal/`.

Tests: `cd tests && npm install && npx playwright install chromium`, then from the repo root `node --test "tests/unit/*.test.js" "tests/smoke/*.test.js"`.
```

- [ ] **Step 4: Commit**

```bash
git add README.md && git commit -m "Document the tabbed front page and its tests."
```

- [ ] **Step 5: Report to the owner**

Include the test counts, the paths to both screenshots, and that the Signal commits (Tasks 1-3) are unpushed until the owner or the scheduled job pushes them. Merging to `main` (Pages) is a separate request.
