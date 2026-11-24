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
