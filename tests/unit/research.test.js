const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const R = require('../../scripts/research.cjs');

const ROOT = path.resolve(__dirname, '../..');
const tax = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog/taxonomy.json'), 'utf8').replace(/^﻿/, ''));

const good = () => ({
  id: 'research-sample', slug: 'sample', title: 'Sample briefing', summary: 'A sample summary that is long enough to pass.',
  published: '2026-11-01', author: 'Andre Camillo', pillar: 'process', people: ['thought-leadership'],
  processes: ['threat-model'], tech: [62], themes: ['securing-ai'], frameworks: ['mitre-attack'], regions: ['global'],
  tags: ['sample-tag'], vendors: ['crowdstrike'], caveats: { ai_assisted: true, not_legal_advice: true },
});

test('a well-formed meta.json validates', () => {
  assert.deepEqual(R.validate(good(), tax, 'sample'), []);
});

test('validator rejects unknown vocabulary, bad shapes and unknown fields', () => {
  const m = Object.assign(good(), { themes: ['not-a-theme'], tech: [999], tags: ['Bad Tag'], slug: 'other', extra: 1 });
  delete m.caveats;
  const errs = R.validate(m, tax, 'sample').join('\n');
  for (const want of ['themes: "not-a-theme"', 'tech: "999"', 'tags: "Bad Tag"', 'must equal folder', 'unknown field "extra"', 'missing "caveats"']) {
    assert.ok(errs.includes(want), `expected "${want}" in:\n${errs}`);
  }
});

test('every meta.json in Research/ is valid and generated files are current', () => {
  const { problems, writes } = R.plan(ROOT);
  assert.deepEqual(problems, []);
  const stale = writes.filter((w) => !fs.existsSync(w.file) || fs.readFileSync(w.file, 'utf8') !== w.text).map((w) => path.relative(ROOT, w.file));
  assert.deepEqual(stale, [], 'run: node scripts/research.cjs build');
});

test('every briefing with meta.json keeps both caveats on the page', () => {
  for (const d of fs.readdirSync(path.join(ROOT, 'Research'))) {
    const metaPath = path.join(ROOT, 'Research', d, 'meta.json');
    if (!fs.existsSync(metaPath)) continue;
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    // Strip the generated JSON-LD: its disclaimer must not stand in for the visible caveat.
    const raw = fs.readFileSync(path.join(ROOT, 'Research', d, 'index.html'), 'utf8');
    const html = raw.slice(0, raw.indexOf(R.LD_START) >>> 0) + (raw.includes(R.LD_END) ? raw.slice(raw.indexOf(R.LD_END)) : '');
    if (meta.caveats.ai_assisted) assert.match(html, /AI-assisted research/i, `${d}: AI caveat missing`);
    if (meta.caveats.not_legal_advice) assert.match(html, /not legal advice/i, `${d}: legal caveat missing`);
  }
});

test('injecting JSON-LD twice is idempotent', () => {
  const html = '<html><head><title>x</title></head><body><main></main></body></html>';
  const once = R.injectLd(html, { a: 1 });
  assert.equal(R.injectLd(once, { a: 1 }), once);
  assert.equal(once.split(R.LD_START).length, 2);
});

test('source extraction keeps external citations only, de-duplicated', () => {
  const html = '<main><a href="https://example.org/a">A</a><a href="https://example.org/a#x">again</a>' +
    '<a href="../../index.html">hub</a><a href="https://www.linkedin.com/in/amcamillo/">me</a></main>';
  assert.deepEqual(R.extractSources(html), [{ url: 'https://example.org/a', host: 'example.org', text: 'A' }]);
});

// Public files must never describe private tooling or its schema.
test('public research files carry no private-tooling identifiers', () => {
  const banned = /cyberdoc|\bDOM-\d{3}\b|\bprod_[a-z]|\bdoc_type\b|\bcontent_basis\b|\breview_after\b|\bsource_type\b|multivendor-catalogue/i;
  const files = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(html|json|js|md)$/.test(e.name)) files.push(p);
    }
  };
  walk(path.join(ROOT, 'Research'));
  walk(path.join(ROOT, 'catalog'));
  files.push(path.join(ROOT, 'scripts/research.cjs'));
  const hits = files.filter((f) => banned.test(fs.readFileSync(f, 'utf8'))).map((f) => path.relative(ROOT, f).split(path.sep).join('/'));
  // Pre-existing pages that name the private corpus in reader-facing text. Clean these up, then empty this list.
  const KNOWN = [
    'Research/essential-eight-crowdstrike/assessment.json', 'Research/essential-eight-crowdstrike/index.html',
    'Research/ncsc-top-10-crowdstrike/assessment.json', 'Research/ncsc-top-10-crowdstrike/index.html',
  ];
  assert.deepEqual(hits.filter((h) => !KNOWN.includes(h)), [], 'new public file names private tooling');
});
