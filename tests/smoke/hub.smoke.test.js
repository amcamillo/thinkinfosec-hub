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
    if (mode === 'empty') return route.fulfill({ body: '{}', contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' } });
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

test('feed returning {} after a good load falls back to the cached snapshot', async () => {
  const { context, page } = await open('#news');
  await feeds(context, 'empty');
  await page.reload();
  await page.waitForFunction(() => /Signal (updated|snapshot|unavailable)/.test(document.getElementById('dateline').textContent));
  assert.match(await page.textContent('#dateline'), /Signal snapshot from/);
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
