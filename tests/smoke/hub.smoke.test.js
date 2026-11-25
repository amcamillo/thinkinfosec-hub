const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const FIX = path.join(__dirname, '..', 'fixtures');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp' };
const TABS = ['front', 'news', 'research', 'videos', 'tools', 'guides', 'about'];
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
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
    if (route.request().resourceType() === 'document') return route.fulfill({ body: '<!doctype html><title>Signal</title><p>Signal stub</p>', contentType: 'text/html' });
    if (mode === 'down') return route.abort();
    if (mode === 'empty') return route.fulfill({ body: '{}', contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' } });
    const name = path.basename(new URL(route.request().url()).pathname);
    return route.fulfill({ path: path.join(FIX, name), contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' } });
  });
}
async function open(hash, opts = {}) {
  const context = await browser.newContext({ colorScheme: opts.scheme || 'dark' });
  await context.route(/i\.ytimg\.com|medium\.com/, r => r.abort());
  await context.route('https://img.example/*', r => r.request().url().endsWith('missing.png')
    ? r.fulfill({ status: 404, body: '' })
    : r.fulfill({ body: PNG, contentType: 'image/png' }));
  await feeds(context, opts.feeds || 'up');
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED/.test(m.text())) errors.push(m.text()); });
  await page.goto(base + (hash || ''));
  await page.waitForFunction(() => document.getElementById('signalPill').dataset.state !== 'none' || /NO SIGNAL/.test(document.getElementById('pillText').textContent));
  await page.waitForFunction(() => !document.documentElement.classList.contains('booting')); // load screen gone
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
  assert.equal(await page.getAttribute('#signalPill', 'data-state'), 'live');
  assert.equal(await page.locator('#newsList li').count(), 4);
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
  assert.equal(await page.locator('#liveWire li').count(), 3);
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

test('theme defaults to light even on a dark system, then remembers the choice', async () => {
  const { context, page } = await open('', { scheme: 'dark' });
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
  assert.match(await page.textContent('#pillText'), /NO SIGNAL/);
  assert.match(await page.textContent('#newsList'), /LISTENING FOR SIGNAL/);
  await page.click('#tab-tools');
  assert.ok(await page.locator('#toolGrid .card').count() > 5);
  await context.close();
});

test('feed returning {} after a good load falls back to the cached snapshot', async () => {
  const { context, page } = await open('#news');
  await feeds(context, 'empty');
  await page.reload();
  await page.waitForFunction(() => document.getElementById('signalPill').dataset.state !== 'none' || /NO SIGNAL/.test(document.getElementById('pillText').textContent));
  assert.match(await page.textContent('#pillText'), /SIGNAL SNAPSHOT/);
  await context.close();
});

test('feeds down with a cache: snapshot label', async () => {
  const { context, page } = await open('#news');
  await feeds(context, 'down');
  await page.reload();
  await page.waitForFunction(() => document.getElementById('signalPill').dataset.state !== 'none' || /NO SIGNAL/.test(document.getElementById('pillText').textContent));
  assert.match(await page.textContent('#pillText'), /SIGNAL SNAPSHOT/);
  assert.equal(await page.locator('#newsList li').count(), 4);
  await context.close();
});

test('lead story shows the publisher image, wire stays text-only', async () => {
  const { context, page, errors } = await open('#front', { scheme: 'light' });
  const src = await page.getAttribute('#leadStory .lead-art img', 'src');
  assert.equal(src, 'https://img.example/lead.png');
  await page.waitForFunction(() => { const i = document.querySelector('#leadStory .lead-art img'); return i && i.complete && i.naturalWidth > 0; });
  assert.equal(await page.locator('#liveWire img').count(), 0);
  assert.deepEqual(errors, []);
  await context.close();
});

test('news rows show thumbs, drop insecure images, remove broken ones', async () => {
  const { context, page, errors } = await open('#news');
  assert.equal(await page.locator('#newsList li').count(), 4);
  await page.waitForFunction(() => document.querySelectorAll('#newsList li')[2].querySelectorAll('img').length === 0);
  assert.deepEqual(await page.$$eval('#newsList img', is => is.map(i => i.getAttribute('src'))), ['https://img.example/lead.png', 'https://img.example/ai.png']);
  assert.equal(await page.locator('#newsList li', { hasText: 'insecure image' }).locator('img').count(), 0);
  assert.equal(await page.locator('#newsList li', { hasText: 'chip export' }).locator('img').count(), 0);
  assert.deepEqual(errors, []);
  await context.close();
});

test('a lead image that fails to load is removed and the gradient remains', async () => {
  const { context, page } = await open('#front');
  await page.evaluate(() => document.querySelector('#leadStory .lead-art img').dispatchEvent(new Event('error')));
  assert.equal(await page.locator('#leadStory .lead-art img').count(), 0);
  assert.equal(await page.locator('#leadStory .lead-art').count(), 1);
  await context.close();
});

test('lead shows the Signal trace behind the image, and keeps it when the image 404s', async () => {
  const { page, context } = await open('#front');
  await page.waitForSelector('#leadStory .trace-banner svg path');
  assert.ok(await page.$('#leadStory .trace-banner .trace-readout'));
  assert.match(await page.textContent('#leadStory .trace-readout'), /CYBER · CH-01 · \d\d:\d\d UTC/);
  await context.close();
});
test('cards without images get a mini trace', async () => {
  const { page, context } = await open('#front');
  await page.waitForSelector('#latestRail .card .trace-thumb svg');
  await context.close();
});
test('News rows without an image get a mini trace thumb', async () => {
  const { page, context } = await open('#news');
  await page.waitForSelector('#newsList li.has-thumb .trace-thumb');
  await context.close();
});

test('feed-dependent empty states say Listening for signal', async () => {
  const { page, context } = await open('#front', { feeds: 'down' });
  await page.waitForFunction(() => /LISTENING FOR SIGNAL/.test(document.getElementById('liveWire').textContent));
  assert.match(await page.textContent('#leadStory'), /LISTENING FOR SIGNAL/);
  await context.close();
});

test('wave pulse moves under the selected tab', async () => {
  const { page, context } = await open('#front');
  await page.waitForSelector('.wave-pulse');
  const before = await page.$eval('.wave-pulse', n => n.style.transform);
  await page.click('#tab-tools');
  await page.waitForFunction(b => document.querySelector('.wave-pulse').style.transform !== b, before);
  const box = await page.$eval('#tab-tools', t => { const r = t.getBoundingClientRect(); return r.left + r.width / 2; });
  const pulse = await page.$eval('.wave-pulse', n => { const m = /translateX\(([-\d.]+)px\)/.exec(n.style.transform); return Number(m[1]) + 120 + n.parentElement.getBoundingClientRect().left; });
  assert.ok(Math.abs(pulse - box) < 2, `pulse centre ${pulse} vs tab centre ${box}`);
  await context.close();
});
test('reduced motion stops the bubbles and waves', async () => {
  const { page, context } = await open('#front');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const running = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => a.effect.target.className.baseVal ?? a.effect.target.className));
  assert.deepEqual(running, []);
  await context.close();
});
test('wordmark font is loaded', async () => {
  const { page, context } = await open('#front');
  await page.evaluate(() => document.fonts.ready);
  assert.ok(await page.evaluate(() => document.fonts.check('300 16px "DM Sans"')));
  await context.close();
});
test('masthead has no glass slab and the paint layer is running', async () => {
  const { page, context, errors } = await open('#front');
  assert.equal(await page.$eval('.masthead', el => getComputedStyle(el).backdropFilter), 'none');
  assert.ok(await page.$eval('#paint', c => c.width > 0 && c.height > 0), 'paint canvas sized');
  assert.equal(await page.isVisible('.top-wash'), true);
  assert.deepEqual(errors, []);
  await context.close();
});
test('masthead shows the logo, LinkedIn and Enter Signal; favicon is served', async () => {
  const { page, context } = await open('#front');
  await page.waitForFunction(() => { const i = document.querySelector('.brand-badge'); return i && i.complete && i.naturalWidth > 0; });
  assert.equal(await page.locator('.masthead a[href="https://www.linkedin.com/in/amcamillo/"]').count(), 1);
  assert.equal(await page.getAttribute('#enterSignal', 'href'), 'https://thinkinfosec.github.io/Signal/');
  const fav = await page.request.get(new URL('assets/brand/favicon-32.png', base).href);
  assert.equal(fav.status(), 200);
  assert.equal(await page.getAttribute('link[rel="icon"]', 'href'), 'assets/brand/favicon-32.png');
  await context.close();
});
test('About shows the photo and LinkedIn is linked from masthead, About and footer', async () => {
  const { page, context } = await open('#about');
  await page.waitForFunction(() => [...document.querySelectorAll('.about-photo, .foot-badge')].every(i => i.complete && i.naturalWidth > 0) && document.querySelector('.about-photo'));
  for (const sel of ['.masthead', '#panel-about', '.site-foot']) {
    const a = page.locator(sel + ' a[href="https://www.linkedin.com/in/amcamillo/"]');
    assert.equal(await a.count(), 1, sel);
    assert.equal(await a.getAttribute('target'), '_blank', sel);
    assert.match(await a.getAttribute('rel'), /noopener/, sel);
  }
  await context.close();
});

test('Enter Signal crossfades to the full-screen stage and Back returns', async () => {
  const { page, context, errors } = await open('#front');
  assert.equal(await page.isHidden('#signalStage'), true);
  await page.click('#enterSignal');
  await page.waitForSelector('#signalStage.on');
  assert.equal(await page.getAttribute('#signalStage iframe', 'src'), 'https://thinkinfosec.github.io/Signal/');
  assert.equal(await page.evaluate(() => document.getElementById('main').inert), true);
  await page.waitForFunction(() => document.activeElement && document.activeElement.id === 'stageBack');
  await page.click('#stageBack');
  await page.waitForFunction(() => document.getElementById('signalStage').hidden && document.activeElement.id === 'enterSignal');
  assert.equal(await page.evaluate(() => document.body.classList.contains('leaving')), false);
  assert.deepEqual(errors, [], 'no CSP or script errors');
  await context.close();
});
test('signal pill keeps its detail on desktop and shows one line on mobile', async () => {
  const { page, context } = await open('#front');
  assert.match(await page.textContent('#pillText'), /SIGNAL LIVE · \d+ STOR/);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.isVisible('#pillText .pill-detail'), false);
  assert.ok(await page.$eval('#signalPill', p => p.getBoundingClientRect().height < 32), 'pill is one line');
  await context.close();
});

test('load screen covers the hub until feeds render, then is removed', async () => {
  const context = await browser.newContext();
  let release;
  const gate = new Promise(r => { release = r; });
  await context.route('https://thinkinfosec.github.io/Signal/*', async r => { await gate; return r.fulfill({ body: '{}', contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' } }); });
  const page = await context.newPage();
  await page.goto(base + '#front');
  await page.waitForTimeout(300);
  assert.ok(await page.isVisible('#boot'), 'loader visible while feeds are pending');
  assert.equal(await page.$eval('main', m => getComputedStyle(m).opacity), '0');
  release();
  await page.waitForFunction(() => !document.getElementById('boot') && !document.documentElement.classList.contains('booting'), null, { timeout: 7000 });
  assert.equal(await page.$eval('main', m => getComputedStyle(m).opacity), '1');
  await context.close();
});
