/* Pure data logic for the hub. Loaded as window.HubLib in the browser, or with require() in tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HubLib = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const LANES = { cyber: 'Cyber', geo: 'Geopolitics', ai: 'AI' };
  // Signal's world lane carries all world news; the hub keeps only stories that bear on cyber or AI.
  const GEO_RELEVANT = new RegExp('\\b(?:' + [
    'cyber\\w*', 'hack(?:s|er|ers|ed|ing)?', 'breach(?:es|ed)?', 'ransomware', 'malware', 'spyware', 'phishing',
    'espionage', 'spy', 'spies', 'surveillance', 'intelligence', 'sanction(?:s|ed)?', 'export controls?',
    'chips?', 'chipmakers?', 'semiconductors?', 'nvidia', 'tsmc', 'huawei', 'tiktok', '5g', 'telecoms?',
    'satellites?', 'undersea cables?', 'critical infrastructure', 'power grid', 'data (?:breach|centres?|centers?|protection)',
    'privacy', 'encryption', 'disinformation', 'misinformation', 'election (?:interference|security)',
    'ai', 'artificial intelligence', 'tech', 'technology', 'trade secrets?', 'china', 'chinese', 'beijing',
    'taiwan', 'russia', 'russian', 'kremlin', 'iran', 'iranian', 'north korea', 'pyongyang', 'nato',
    'drones?', 'military', 'defen[cs]e', 'pentagon', 'nsa', 'gchq', 'fbi', 'cia', 'tariffs?', 'quantum', 'crypto\\w*'
  ].join('|') + ')\\b', 'i');
  function isRelevant(item) { return item.cat !== 'geo' || GEO_RELEVANT.test(item.title + ' ' + item.summary); }
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
        summary: typeof i.summary === 'string' ? i.summary : '', source: String(i.source || ''), url: isExternal(safeUrl(i.link)) ? safeUrl(i.link) : null,
        image: isExternal(safeUrl(i.image)) ? safeUrl(i.image) : null
      }))
      .filter(isRelevant)
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
      map.set(k, { key: k, source: 'medium', title: m.title, url: m.url, summary: prev.summary || clip(m.summary, 180), ts: m.ts, thumb: isExternal(safeUrl(m.thumb)) ? safeUrl(m.thumb) : undefined, minutes: m.minutes });
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

  // Lead with the newest cyber story (this is a security hub); the wire takes the next newest from any lane.
  function frontPage(news, wireSize) {
    const lead = news.find(n => n.cat === 'cyber') || news[0] || null;
    return { lead, wire: news.filter(n => n !== lead).slice(0, wireSize) };
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

  function signalPill(res, now, count, tz) {
    if (!res || !res.data) return { state: 'none', label: 'NO SIGNAL', detail: '' };
    const gen = Date.parse(res.data.generated);
    if (res.cached) return { state: 'snapshot', label: 'SIGNAL SNAPSHOT', detail: Number.isFinite(gen) ? formatTime(gen, tz).toUpperCase() : '' };
    const stories = count + (count === 1 ? ' STORY' : ' STORIES');
    if (!Number.isFinite(gen)) return { state: 'live', label: 'SIGNAL LIVE', detail: stories };
    const ago = timeAgo(gen, now);
    return { state: 'live', label: 'SIGNAL LIVE', detail: stories + ' · ' + (ago === 'just now' ? 'JUST NOW' : ago.toUpperCase() + ' AGO') };
  }

  function channel(n) { return 'CH-' + String(n).padStart(2, '0'); }
  function utcTime(ts) { const d = new Date(ts); return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ' UTC'; }

  // Signal trace for stories without an image: a lane-shaped line, seeded by the title so every story differs.
  const TRACE_COLORS = { cyber: ['#5fe9f5', '#00BFCF'], ai: ['#ff8cc0', '#FF2D78'], geo: ['#f5c542', '#f5c542'] };
  const ORB_COLORS = ['rgba(0,191,207,.65)', 'rgba(255,45,120,.45)', 'rgba(76,141,224,.5)', 'rgba(130,90,215,.45)'];
  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return function () { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function traceSpec(item, w, h) {
    w = w || 640; h = h || 240;
    const cat = TRACE_COLORS[item && item.cat] ? item.cat : 'cyber';
    const r = rng(seedOf((item && item.title) || ''));
    const base = h * 0.55, lo = 8, hi = h - 8;
    const clampY = y => Math.min(hi, Math.max(lo, y));
    const r1 = v => Math.round(v * 10) / 10;
    let pts = [];
    if (cat === 'cyber') {
      const n = 16, spikeA = 4 + Math.floor(r() * 4), spikeB = spikeA + 2 + Math.floor(r() * 4);
      for (let i = 0; i < n; i++) {
        let y = base + (r() - 0.5) * 16;
        if (i === spikeA) y = base - (55 + r() * 35);
        if (i === spikeA + 1) y = base + (40 + r() * 30);
        if (i === spikeB) y = base - (30 + r() * 30);
        pts.push({ x: (w * i) / (n - 1), y: clampY(y) });
      }
    } else if (cat === 'ai') {
      const n = 24, amp = 25 + r() * 20, freq = 1.5 + r() * 1.5, phase = r() * Math.PI * 2;
      for (let i = 0; i < n; i++) {
        const x = (w * i) / (n - 1);
        pts.push({ x, y: clampY(base + amp * Math.sin((2 * Math.PI * freq * x) / w + phase)) });
      }
    } else {
      const steps = 6;
      let x = 0;
      for (let s = 0; s < steps; s++) {
        const y = clampY(base + (r() - 0.5) * 90);
        const nx = s === steps - 1 ? w : x + w / steps;
        pts.push({ x, y }, { x: nx, y });
        x = nx;
      }
    }
    pts = pts.map(p => ({ x: r1(Math.min(w, Math.max(0, p.x))), y: r1(p.y) }));
    let d = 'M' + pts[0].x + ' ' + pts[0].y;
    if (cat === 'geo') {
      for (let i = 1; i < pts.length; i++) d += ' L' + pts[i].x + ' ' + pts[i].y;
    } else {
      // Catmull-Rom to cubic Bezier, control points clamped into the plate.
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        const c1x = r1(Math.min(w, Math.max(0, p1.x + (p2.x - p0.x) / 6))), c1y = r1(clampY(p1.y + (p2.y - p0.y) / 6));
        const c2x = r1(Math.min(w, Math.max(0, p2.x - (p3.x - p1.x) / 6))), c2y = r1(clampY(p2.y - (p3.y - p1.y) / 6));
        d += ' C' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + p2.x + ' ' + p2.y;
      }
    }
    const peak = pts.reduce((a, b) => (b.y < a.y ? b : a));
    const orbs = [0, 1, 2].map(() => ({ x: r1(r() * 100), y: r1(r() * 100), size: r1(40 + r() * 25), color: ORB_COLORS[Math.floor(r() * ORB_COLORS.length)] }));
    return { cat, d, points: pts, peak, color: TRACE_COLORS[cat][0], glow: TRACE_COLORS[cat][1], orbs };
  }

  return {
    LANES, ORIGINS, GUIDE_GROUPS, safeUrl, isExternal, clip, timeAgo, formatDay, formatDate, formatTime, isStale,
    mediumKey, youtubeId, newsItems, mediaItems, researchItems, videoItems, toolItems, guideItems,
    isRelevant, frontPage, filterBy, searchEntries, search, signalPill, channel, utcTime, traceSpec
  };
});
