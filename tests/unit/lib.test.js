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

test('frontPage leads with the newest cyber story', () => {
  const news = L.newsItems({ items: [
    { cat: 'geo', title: 'Football', ts: 5, source: 'S' },
    { cat: 'ai', title: 'Model', ts: 4, source: 'S' },
    { cat: 'cyber', title: 'Breach', ts: 3, source: 'S' },
    { cat: 'geo', title: 'Trade', ts: 2, source: 'S' }
  ] });
  const f = L.frontPage(news, 2);
  assert.equal(f.lead.title, 'Breach');
  assert.deepEqual(f.wire.map(n => n.title), ['Football', 'Model']);
  assert.equal(L.frontPage(news.filter(n => n.cat !== 'cyber'), 4).lead.title, 'Football');
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

test('signalStatus', () => {
  assert.equal(L.signalStatus({ data: null }, NOW), 'Signal unavailable');
  assert.equal(L.signalStatus({ data: { generated: '2026-11-25T11:56:00Z' }, cached: false }, NOW), 'Signal updated 4m ago');
  assert.match(L.signalStatus({ data: { generated: '2026-11-25T11:00:00Z' }, cached: true }, NOW, 'UTC'), /^Signal snapshot from 25 Nov, 11:00$/);
});
