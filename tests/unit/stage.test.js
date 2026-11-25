const test = require('node:test');
const assert = require('node:assert/strict');
const { create } = require('../../assets/hub/stage.js');

function el(name, log) {
  const attrs = {}, cls = new Set();
  return {
    name, hidden: true, attrs,
    classList: { add: c => cls.add(c), remove: c => cls.delete(c), contains: c => cls.has(c) },
    setAttribute(k, v) { attrs[k] = String(v); log.push(name + ':set:' + k); },
    getAttribute: k => (k in attrs ? attrs[k] : null),
    removeAttribute(k) { delete attrs[k]; },
    focus() { log.push(name + ':focus'); }
  };
}
function rig() {
  const log = [], queue = [];
  const stage = el('stage', log);
  stage.requestFullscreen = () => Promise.reject(new Error('denied'));
  const o = {
    doc: { body: el('body', log), fullscreenElement: null },
    stage, frame: el('frame', log), link: el('link', log), back: el('back', log),
    hub: [el('main', log), el('masthead', log)],
    src: 'https://thinkinfosec.github.io/Signal/', reduce: false,
    wait: fn => queue.push(fn), next: fn => fn()
  };
  const flush = () => { while (queue.length) queue.shift()(); };
  return { o, log, flush, s: create(o) };
}

test('show sets the src, fades the hub, then reveals the stage with focus on Back', () => {
  const { o, log, flush, s } = rig();
  s.show();
  assert.equal(o.frame.getAttribute('src'), o.src);
  assert.ok(o.doc.body.classList.contains('leaving'));
  assert.equal(o.stage.hidden, true, 'stage waits for the hub to fade');
  flush();
  assert.equal(o.stage.hidden, false);
  assert.ok(o.stage.classList.contains('on'));
  assert.ok(o.hub.every(h => h.getAttribute('inert') === ''));
  assert.equal(log[log.length - 1], 'back:focus');
  assert.equal(s.isOpen(), true);
});

test('hide restores the hub and returns focus to the link', () => {
  const { o, log, flush, s } = rig();
  s.show(); flush();
  s.hide(); flush();
  assert.equal(o.stage.hidden, true);
  assert.ok(!o.stage.classList.contains('on'));
  assert.ok(!o.doc.body.classList.contains('leaving'));
  assert.ok(o.hub.every(h => h.getAttribute('inert') === null));
  assert.equal(log[log.length - 1], 'link:focus');
  assert.equal(s.isOpen(), false);
});

test('hide is idempotent and a no-op before show', () => {
  const { o, log, flush, s } = rig();
  s.hide(); flush();
  assert.deepEqual(log, []);
  s.show(); flush(); s.hide(); s.hide(); flush();
  assert.equal(log.filter(l => l === 'link:focus').length, 1);
});

test('the iframe src is set only once across reopenings', () => {
  const { log, flush, s } = rig();
  s.show(); flush(); s.hide(); flush(); s.show(); flush();
  assert.equal(log.filter(l => l === 'frame:set:src').length, 1);
});

test('closing during the fade-out never reveals the stage', () => {
  const { o, flush, s } = rig();
  s.show(); s.hide(); flush();
  assert.equal(o.stage.hidden, true);
  assert.ok(!o.doc.body.classList.contains('leaving'));
});

test('exits fullscreen on hide when the stage is fullscreen', () => {
  const { o, flush, s } = rig();
  let exited = false;
  o.doc.exitFullscreen = () => { exited = true; return Promise.resolve(); };
  s.show(); flush();
  o.doc.fullscreenElement = o.stage;
  s.hide(); flush();
  assert.equal(exited, true);
});
