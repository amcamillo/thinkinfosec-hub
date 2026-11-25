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

test('newsItems rejects non-https feed links', () => {
  const items = L.newsItems({ items: [{ cat: 'ai', title: 'Rel', ts: 1, link: 'Research/x/' }] });
  assert.equal(items[0].url, null);
});

test('newsItems validates and sorts', () => {
  const items = L.newsItems({ items: [
    { cat: 'ai', title: 'B', ts: 1, source: 'S' },
    { cat: 'cyber', title: 'A', ts: 2, source: 'S', link: 'https://x.example/a' },
    { cat: 'sport', title: 'drop', ts: 3 },
    { cat: 'geo', title: '', ts: 4 },
    { cat: 'geo', title: 'bad link on China sanctions', ts: 0, link: 'javascript:x' }
  ] });
  assert.deepEqual(items.map(i => i.title), ['A', 'B', 'bad link on China sanctions']);
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

test('geopolitics stories are kept only when they bear on cyber or AI', () => {
  const titles = L.newsItems({ items: [
    { cat: 'geo', title: 'Bellingham stunner, Mbappe brace help Real Madrid rout PSV', ts: 6, source: 'S' },
    { cat: 'geo', title: 'Colombian president blames ex-FARC rebels for car bomb blast', ts: 5, source: 'S' },
    { cat: 'geo', title: 'Huawei found guilty of stealing trade secrets', ts: 4, source: 'S' },
    { cat: 'geo', title: 'Todd Blanche declines to confirm if Nvidia boss was investigated', ts: 3, source: 'S' },
    { cat: 'geo', title: 'Summit ends', summary: 'Leaders agree new export controls on AI accelerators.', ts: 2, source: 'S' },
    { cat: 'ai', title: 'Lab raises funding round', ts: 1, source: 'S' }
  ] }).map(i => i.title);
  assert.deepEqual(titles, ['Huawei found guilty of stealing trade secrets',
    'Todd Blanche declines to confirm if Nvidia boss was investigated', 'Summit ends', 'Lab raises funding round']);
});

test('frontPage leads with the newest cyber story', () => {
  const news = L.newsItems({ items: [
    { cat: 'geo', title: 'Taiwan chip curbs', ts: 5, source: 'S' },
    { cat: 'ai', title: 'Model', ts: 4, source: 'S' },
    { cat: 'cyber', title: 'Breach', ts: 3, source: 'S' },
    { cat: 'geo', title: 'Russia sanctions', ts: 2, source: 'S' }
  ] });
  const f = L.frontPage(news, 2);
  assert.equal(f.lead.title, 'Breach');
  assert.deepEqual(f.wire.map(n => n.title), ['Taiwan chip curbs', 'Model']);
  assert.equal(L.frontPage(news.filter(n => n.cat !== 'cyber'), 4).lead.title, 'Taiwan chip curbs');
  assert.deepEqual(L.frontPage([], 4), { lead: null, wire: [] });
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

test('signalPill', () => {
  assert.deepEqual(L.signalPill({ data: null }, NOW, 0), { state: 'none', label: 'NO SIGNAL', detail: '' });
  assert.deepEqual(L.signalPill({ data: { generated: '2026-11-25T11:56:00Z' }, cached: false }, NOW, 93),
    { state: 'live', label: 'SIGNAL LIVE', detail: '93 STORIES · 4M AGO' });
  assert.deepEqual(L.signalPill({ data: { generated: '2026-11-25T11:59:50Z' }, cached: false }, NOW, 1),
    { state: 'live', label: 'SIGNAL LIVE', detail: '1 STORY · JUST NOW' });
  assert.deepEqual(L.signalPill({ data: { generated: '2026-11-25T11:00:00Z' }, cached: true }, NOW, 5, 'UTC'),
    { state: 'snapshot', label: 'SIGNAL SNAPSHOT', detail: '25 NOV, 11:00' });
  assert.deepEqual(L.signalPill({ data: { generated: 'bad' }, cached: false }, NOW, 2),
    { state: 'live', label: 'SIGNAL LIVE', detail: '2 STORIES' });
});

test('newsItems keeps https images and drops everything else', () => {
  const base = { cat: 'ai', title: 'T', ts: 1 };
  const img = image => L.newsItems({ items: [Object.assign({}, base, image === undefined ? {} : { image })] })[0].image;
  assert.equal(img('https://cdn.example.com/a.png'), 'https://cdn.example.com/a.png');
  assert.equal(img('http://cdn.example.com/a.png'), null);
  assert.equal(img('javascript:alert(1)'), null);
  assert.equal(img('assets/local.png'), null);
  assert.equal(img(undefined), null);
});

test('channel', () => {
  assert.equal(L.channel(1), 'CH-01');
  assert.equal(L.channel(12), 'CH-12');
});
test('utcTime', () => {
  assert.equal(L.utcTime(Date.parse('2026-11-25T14:32:09Z')), '14:32 UTC');
  assert.equal(L.utcTime(Date.parse('2026-11-25T03:05:00Z')), '03:05 UTC');
});

test('traceSpec is deterministic per title and differs between titles', () => {
  const a = L.traceSpec({ title: 'Ransomware hits hospitals', cat: 'cyber' });
  assert.deepEqual(L.traceSpec({ title: 'Ransomware hits hospitals', cat: 'cyber' }), a);
  assert.notEqual(L.traceSpec({ title: 'Different story', cat: 'cyber' }).d, a.d);
});
test('traceSpec shapes follow the lane', () => {
  const cyber = L.traceSpec({ title: 't', cat: 'cyber' });
  const ai = L.traceSpec({ title: 't', cat: 'ai' });
  const geo = L.traceSpec({ title: 't', cat: 'geo' });
  assert.match(cyber.d, /^M[\d. ]+C/);
  assert.match(ai.d, /^M[\d. ]+C/);
  assert.match(geo.d, /^M[\d. ]+(L[\d. ]+)+$/);
  assert.notEqual(cyber.d, ai.d);
  assert.equal(cyber.color, '#5fe9f5'); assert.equal(ai.color, '#ff8cc0'); assert.equal(geo.color, '#f5c542');
});
test('traceSpec stays inside the plate and marks the highest peak', () => {
  for (const cat of ['cyber', 'ai', 'geo', 'unknown']) {
    const s = L.traceSpec({ title: 'Bounds check ' + cat, cat }, 640, 240);
    const nums = s.d.match(/-?[\d.]+/g).map(Number);
    for (let i = 0; i < nums.length; i += 2) {
      assert.ok(nums[i] >= 0 && nums[i] <= 640, cat + ' x out of bounds: ' + nums[i]);
      assert.ok(nums[i + 1] >= 8 && nums[i + 1] <= 232, cat + ' y out of bounds: ' + nums[i + 1]);
    }
    assert.equal(s.peak.y, Math.min(...s.points.map(p => p.y)));
    assert.equal(s.orbs.length, 3);
  }
});
test('traceSpec scales amplitude to the plate so thumbnails are not clipped flat', () => {
  for (const cat of ['cyber', 'ai', 'geo']) {
    for (const title of ['Fixture Medium article on agent identity', 'CrowdStrike Public Resource Library', 'Double agents']) {
      const s = L.traceSpec({ title, cat }, 200, 60);
      const clipped = s.points.filter(p => p.y <= 8 || p.y >= 52).length;
      assert.equal(clipped, 0, `${cat} "${title}" has ${clipped} points pinned to the edge`);
    }
  }
});
