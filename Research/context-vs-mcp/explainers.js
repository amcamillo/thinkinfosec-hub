/* Context vs MCP explainers: three steppable figures that share one visual kit.
 * Staples: the context window (25 x 10 cells, 1 cell ~ 800 tokens of a 200k window), the dashed
 * harness wrapper, the model block, document icons for files, and the MCP server card.
 * Values marked illustrative are a simulation shaped by the research cited in the article. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const COLS = 25, ROWS = 10, CAP = COLS * ROWS, TOK = 800;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const KIND = {
    sys:     { label: 'System prompt', fill: '#12244A' },
    rules:   { label: 'CLAUDE.md, project root', fill: '#2E4A7D' },
    nested:  { label: 'Nested, path-scoped rules', fill: '#6F86B5' },
    tools:   { label: 'Tool definitions', fill: '#7D8DB0' },
    hist:    { label: 'Conversation', fill: '#8E9BB5' },
    file:    { label: 'Uploaded files', fill: '#036A7C' },
    result:  { label: 'Tool results', fill: '#00BFCF' },
    web:     { label: 'Untrusted web page', fill: '#FF2D78' },
    hook:    { label: 'Hook-added context', fill: '#5B6B8C' },
    think:   { label: 'Thinking blocks', fill: '#B7AFC6' },
    mid:     { label: 'Rule typed mid-session', fill: '#FFFFFF', stroke: '#B0125B' },
    user:    { label: 'Your question', fill: '#FFFFFF', stroke: '#036A7C' },
    out:     { label: 'Generated token', fill: '#FFFFFF', stroke: '#12244A' },
    summary: { label: 'Summary, written by the model', hatch: 'n' },
    laund:   { label: 'Web text inside the summary', hatch: 'm' },
  };
  const fillOf = (k, fid) => KIND[k].hatch ? `url(#xp-hatch-${KIND[k].hatch}-${fid})` : KIND[k].fill;

  /* ---------- tiny DOM/SVG helpers ---------- */
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, str, cls, anchor) {
    const e = el('text', { x, y, class: cls, 'text-anchor': anchor || 'start' }, parent);
    e.textContent = str;
    return e;
  }
  function wrap(parent, x, y, str, max, cls, lh) {
    const t = el('text', { x, y, class: cls }, parent);
    let line = '', first = true;
    const flush = () => { const s = el('tspan', { x, dy: first ? 0 : (lh || 15) }, t); s.textContent = line; first = false; };
    for (const w of str.split(' ')) {
      const next = line ? line + ' ' + w : w;
      if (next.length > max && line) { flush(); line = w; } else line = next;
    }
    if (line) flush();
    return t;
  }
  function h(tag, cls, parent) { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
  const anim = (e, on, delay) => { if (on) { e.classList.add('xp-in'); if (delay) e.style.animationDelay = delay + 'ms'; } return e; };

  function defs(svg, fid) {
    const d = el('defs', {}, svg);
    const hatch = (id, base, stripe) => {
      const p = el('pattern', { id, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, d);
      el('rect', { width: 6, height: 6, fill: base }, p);
      el('rect', { width: 2.6, height: 6, fill: stripe }, p);
    };
    hatch(`xp-hatch-n-${fid}`, '#E3E8F2', '#12244A');
    hatch(`xp-hatch-m-${fid}`, '#FFD3E4', '#12244A');
    for (const [n, c] of [['ink', '#12244A'], ['teal', '#036A7C'], ['mag', '#B0125B']]) {
      const m = el('marker', { id: `xp-arr-${n}-${fid}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d);
      el('path', { d: 'M0,0 L10,5 L0,10 z', fill: c }, m);
    }
  }

  /* ---------- staples ---------- */
  function harness(g, x, y, w, ht, name, sub) {
    el('rect', { x, y, width: w, height: ht, rx: 18, class: 'xp-harness' }, g);
    const t = txt(g, x + 16, y + 20, name.toUpperCase(), 'xp-cap xp-teal');
    if (sub) { const s = el('tspan', { class: 'xp-lbl', dx: 8 }, t); s.textContent = sub; s.setAttribute('style', 'letter-spacing:0;font-family:inherit;font-weight:400'); }
  }
  function model(g, x, y, w, ht, sub) {
    const grp = el('g', { 'data-tip': 'The model: tokens in, one predicted token out. It never touches files or servers itself.' }, g);
    el('rect', { x, y, width: w, height: ht, rx: 12, class: 'xp-model' }, grp);
    // a small layered-network glyph
    const gx = x + 18, gy = y + ht / 2;
    for (let c = 0; c < 3; c++) for (let r = -1; r <= 1; r++) {
      el('circle', { cx: gx + c * 14, cy: gy + r * 11, r: 3.2, fill: c === 1 ? '#00BFCF' : '#FFFFFF' }, grp);
      if (c < 2) for (let r2 = -1; r2 <= 1; r2++) el('line', { x1: gx + c * 14, y1: gy + r * 11, x2: gx + (c + 1) * 14, y2: gy + r2 * 11, stroke: 'rgba(255,255,255,.28)', 'stroke-width': .8 }, grp);
    }
    txt(grp, x + 66, y + ht / 2 - 3, 'Model', 'xp-h xp-white');
    if (sub) txt(grp, x + 66, y + ht / 2 + 14, sub, 'xp-lbl xp-white');
  }
  function doc(g, x, y, label, o) {
    o = o || {};
    const grp = el('g', { 'data-hl': 'file', 'data-tip': o.tip || 'Uploaded file, about 15k tokens' }, g);
    el('path', { d: `M${x},${y} h22 l10,10 v30 h-32 z`, fill: '#fff', stroke: o.ring ? '#036A7C' : '#12244A', 'stroke-width': o.ring ? 2.4 : 1.2 }, grp);
    el('path', { d: `M${x + 22},${y} v10 h10`, fill: 'none', stroke: '#12244A', 'stroke-width': 1 }, grp);
    for (let i = 0; i < 3; i++) el('line', { x1: x + 6, y1: y + 16 + i * 6, x2: x + 26, y2: y + 16 + i * 6, stroke: o.ring ? '#036A7C' : '#8E9BB5', 'stroke-width': 1.6 }, grp);
    txt(grp, x + 16, y + 54, label, 'xp-lbl', 'middle');
    return grp;
  }
  function disk(g, x, y, w, ht, lines) {
    const grp = el('g', { 'data-hl': 'sys rules file', 'data-tip': 'Files on disk the harness can reload verbatim after compaction' }, g);
    el('path', { d: `M${x},${y + 10} v${ht - 20} a${w / 2},10 0 0 0 ${w},0 v-${ht - 20}`, fill: '#fff', stroke: '#036A7C', 'stroke-width': 1.5 }, grp);
    el('ellipse', { cx: x + w / 2, cy: y + 10, rx: w / 2, ry: 10, fill: '#E3F1F8', stroke: '#036A7C', 'stroke-width': 1.5 }, grp);
    lines.forEach((l, i) => txt(grp, x + w / 2, y + 36 + i * 15, l, i ? 'xp-lbl' : 'xp-cap xp-teal', 'middle'));
  }
  function band(g, d, width, color, kinds, on, extra) {
    const p = el('path', Object.assign({ d, class: 'xp-band' + (on ? ' xp-draw' : ''), stroke: color, 'stroke-width': Math.max(2, width), 'data-kind': kinds }, extra || {}), g);
    return p;
  }
  function arrow(g, x1, y1, x2, y2, color, fid, label, o) {
    o = o || {};
    const grp = el('g', {}, g);
    const midx = (x1 + x2) / 2;
    const d = o.curve ? `M${x1},${y1} C${midx},${y1} ${midx},${y2} ${x2},${y2}` : `M${x1},${y1} L${x2},${y2}`;
    el('path', { d, fill: 'none', stroke: color === 'mag' ? '#B0125B' : color === 'teal' ? '#036A7C' : '#12244A', 'stroke-width': 1.6, 'stroke-dasharray': o.dash ? '5 4' : null, 'marker-end': `url(#xp-arr-${color}-${fid})`, class: o.anim ? 'xp-draw' : null }, grp);
    if (label) txt(grp, o.lx !== undefined ? o.lx : midx, o.ly !== undefined ? o.ly : Math.min(y1, y2) - 6, label, o.cls || 'xp-mono', o.anchor || 'middle');
    return grp;
  }

  /** The context window staple: fills cells in order from a list of { kind, n, id?, tip? }. */
  function windowStaple(g, x, y, items, o) {
    o = o || {};
    const p = o.pitch || 16, c = p - 3, W = COLS * p + 12, H = ROWS * p + 12;
    const grp = el('g', { transform: `translate(${x},${y})` }, g);
    const frame = el('rect', { x: 0, y: 0, width: W, height: H, rx: 10, class: 'xp-win-frame' }, grp);
    txt(grp, 0, -9, (o.title || 'Context window').toUpperCase(), 'xp-cap');
    const pos = {}, at = i => ({ x: x + 6 + (i % COLS) * p, y: y + 6 + Math.floor(i / COLS) * p, c });
    let i = 0;
    for (const it of items) {
      const k = KIND[it.kind];
      for (let n = 0; n < it.n && i < CAP; n++, i++) {
        const a = at(i);
        const r = el('rect', {
          x: a.x - x, y: a.y - y, width: c, height: c, rx: 2.5, class: 'xp-cell', 'data-kind': it.kind,
          fill: fillOf(it.kind, o.fid), stroke: k.stroke || 'rgba(18,36,74,.3)', 'stroke-width': k.stroke ? 1.8 : .6,
          'stroke-dasharray': it.dash || null, opacity: it.opacity || null,
          'data-tip': it.tip || `${k.label} · about ${TOK} tokens per cell`,
        }, grp);
        anim(r, o.animate, Math.min(i * (o.stagger || 6), 1500));
        if (it.id) (pos[it.id] = pos[it.id] || []).push({ x: a.x + c / 2, y: a.y + c / 2, el: r });
      }
    }
    const used = i;
    for (; i < CAP; i++) { const a = at(i); el('rect', { x: a.x - x, y: a.y - y, width: c, height: c, rx: 2.5, class: 'xp-cell-empty' }, grp); }
    if (o.meter !== false) txt(grp, W, -9, `${Math.round(used * TOK / 1000)}k of 200k tokens`, 'xp-cap xp-num', 'end');
    return { pos, at, used, W, H, frame, x, y };
  }

  /* ---------- figure controller ---------- */
  let FID = 0;
  function mount(root, cfg) {
    const fid = ++FID;
    root.textContent = '';
    root.classList.add('xp');
    const head = h('div', 'xp-head', root);
    const tabs = h('div', 'xp-steps', head);
    tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Steps');
    const st = Object.assign({ step: 1 }, cfg.state);
    cfg.steps.forEach((s, i) => {
      const b = h('button', 'xp-step', tabs); b.type = 'button';
      b.innerHTML = `<span>${i + 1}</span>${s[0]}`;
      b.addEventListener('click', () => { st.step = i + 1; draw(true); });
    });
    const nav = h('div', 'xp-nav', head);
    const prev = h('button', '', nav); prev.type = 'button'; prev.textContent = '← Back';
    const next = h('button', '', nav); next.type = 'button'; next.textContent = 'Next →';
    prev.addEventListener('click', () => { if (st.step > 1) { st.step--; draw(true); } });
    next.addEventListener('click', () => { if (st.step < cfg.steps.length) { st.step++; draw(true); } });
    const stage = h('div', 'xp-stage', root);
    const svg = el('svg', { viewBox: `0 0 1000 ${cfg.h}`, role: 'img', 'aria-label': cfg.alt }, stage);
    const tip = h('div', 'xp-tip', stage); tip.hidden = true;
    const nar = h('p', 'xp-nar', root); nar.setAttribute('aria-live', 'polite');
    const knobs = h('div', 'xp-knobs', root);
    cfg.knobs(knobs, st, () => draw(false));

    function draw(animate) {
      svg.textContent = '';
      defs(svg, fid);
      const g = el('g', {}, svg);
      cfg.render(g, st, !!animate && !reduce, fid);
      const [name, text] = cfg.steps[st.step - 1];
      nar.innerHTML = `<b>Step ${st.step} · ${name}.</b> ${typeof text === 'function' ? text(st) : text}`;
      tabs.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === st.step - 1)));
      prev.disabled = st.step === 1; next.disabled = st.step === cfg.steps.length;
    }
    const clearHl = () => { svg.classList.remove('xp-hl'); svg.querySelectorAll('.xp-on').forEach(e => e.classList.remove('xp-on')); };
    svg.addEventListener('pointermove', e => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (t) {
        const r = stage.getBoundingClientRect();
        tip.textContent = t.getAttribute('data-tip');
        tip.hidden = false;
        const left = Math.min(e.clientX - r.left + 14, r.width - 250);
        tip.style.left = Math.max(0, left) + 'px';
        tip.style.top = (e.clientY - r.top + 14) + 'px';
      } else tip.hidden = true;
      const hl = e.target.closest && e.target.closest('[data-hl]');
      clearHl();
      if (hl) {
        const kinds = hl.getAttribute('data-hl').split(' ');
        svg.classList.add('xp-hl');
        svg.querySelectorAll('.xp-cell, .xp-band').forEach(c => { if (kinds.some(k => (c.getAttribute('data-kind') || '').split(' ').includes(k))) c.classList.add('xp-on'); });
      }
    });
    svg.addEventListener('pointerleave', () => { tip.hidden = true; clearHl(); });
    draw(false);
    if ('IntersectionObserver' in window && !reduce) {
      const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); draw(true); } }, { threshold: .35 });
      io.observe(root);
    }
    return { draw, st };
  }

  function range(parent, label, min, max, val, onInput, fmt) {
    const l = h('label', '', parent);
    l.append(label + ' ');
    const i = h('input', '', l); i.type = 'range'; i.min = min; i.max = max; i.step = 1; i.value = val;
    const out = h('output', '', l); out.textContent = fmt ? fmt(val) : val;
    i.addEventListener('input', () => { out.textContent = fmt ? fmt(+i.value) : i.value; onInput(+i.value); });
    return i;
  }

  /* ============ Figure 1: loading context, then inference ============ */
  function sim1(n) {
    // Illustrative: the answer's weight falls as look-alike files are added and it drifts to the middle.
    const cells = 4 + 15 + 25 + n * 19 + 1;
    const R = n > 2 ? 0.75 : 1, D = 0.55 * (n - 1), N = 0.004 * cells;
    const v = [R, 0.8 * D, 0.2 * D + N, 0.05], s = v.reduce((a, b) => a + b, 0);
    return { p: v.map(x => x / s), R, D, N, att: { answer: R / (R + D + N), near: n > 1 ? D / (n - 1) / (R + D + N) : 0 } };
  }
  const FIG1 = {
    h: 600,
    alt: 'Interactive diagram: sources load into the context window inside the agent harness, the model attends over every cell, and next-token probabilities shift as more look-alike files are uploaded.',
    state: { files: 4 },
    steps: [
      ['Assemble', 'Before the model sees a word, the harness assembles one long input: the system prompt, tool definitions, the conversation so far and every uploaded file. Band width is token count.'],
      ['Tokenise', st => `It all becomes tokens in one window, with no separate channel for instructions and data. Each cell is about 800 tokens of a 200k window. Your ${st.files} file${st.files > 1 ? 's take' : ' takes'} ${st.files * 15}k of it.`],
      ['Attend', st => st.files > 1 ? `To predict each token, the model weighs every earlier token. The cell holding the answer (teal ring) now competes with ${st.files - 1} look-alike${st.files > 2 ? 's' : ''} (pink rings). Line width is its share of attention, illustratively.` : 'To predict each token, the model weighs every earlier token. With one file, the cell holding the answer (teal ring) has almost no competition. Add files with the slider.'],
      ['Predict', st => { const p = sim1(st.files).p; return p[1] > p[0] ? `The weights become probabilities. The near-miss now outranks the answer (${Math.round(p[1] * 100)}% vs ${Math.round(p[0] * 100)}%): a fluent, confident wrong answer, appended to the window for the next turn.` : `The weights become probabilities. The answer still leads (${Math.round(p[0] * 100)}%), and the chosen token is appended to the window for the next turn. Push the slider up and watch it flip.`; }],
    ],
    knobs(k, st, redraw) {
      range(k, 'Files uploaded', 1, 8, st.files, v => { st.files = v; redraw(); });
      const n = h('span', '', k); n.innerHTML = 'Hover any block or legend row to trace it.';
    },
    render(g, st, an, fid) {
      const n = st.files, ans = Math.floor((n - 1) / 2), sim = sim1(n);
      // sources
      txt(g, 24, 58, 'WHAT GETS LOADED', 'xp-cap');
      const src = [['sys', 'System prompt', '3k tokens'], ['tools', 'Tool definitions', '12k tokens'], ['hist', 'Conversation so far', '20k tokens']];
      src.forEach(([k, l, s], i) => {
        const y = 72 + i * 52, grp = el('g', { 'data-hl': k, 'data-tip': `${l}: ${s}` }, g);
        el('rect', { x: 20, y, width: 184, height: 40, rx: 9, class: 'xp-card' }, grp);
        el('rect', { x: 32, y: y + 14, width: 12, height: 12, rx: 2.5, fill: KIND[k].fill }, grp);
        txt(grp, 52, y + 18, l, 'xp-h');
        txt(grp, 52, y + 33, s, 'xp-lbl');
      });
      txt(g, 24, 244, 'UPLOADED FILES', 'xp-cap');
      txt(g, 24, 258, '15k tokens each', 'xp-lbl');
      for (let j = 0; j < n; j++) {
        const x = 26 + (j % 4) * 45, y = 272 + Math.floor(j / 4) * 70;
        anim(doc(g, x, y, `F${j + 1}`, { ring: j === ans, tip: j === ans ? 'This file holds the passage that answers the question' : 'A look-alike: last quarter’s version, a similar clause' }), an && st.step === 1, j * 60);
      }
      if (n > 1) wrap(g, 24, 430, `F${ans + 1} holds the answer. The others hold look-alikes: older versions, similar clauses.`, 30, 'xp-lbl', 14);
      else wrap(g, 24, 430, 'One file, and it holds the answer.', 30, 'xp-lbl', 14);

      harness(g, 228, 36, 756, 552, 'Agent harness', 'assembles the context and runs the loop');
      const items = [{ kind: 'sys', n: 4 }, { kind: 'tools', n: 15 }, { kind: 'hist', n: 25 }];
      for (let j = 0; j < n; j++) {
        const id = j === ans ? 'answer' : 'near';
        items.push({ kind: 'file', n: 9 }, { kind: 'file', n: 1, id, tip: j === ans ? 'The passage that answers the question' : 'A look-alike passage from another file' }, { kind: 'file', n: 9 });
      }
      items.push({ kind: 'user', n: 1, id: 'q', tip: 'Your question' });
      if (st.step >= 4) items.push({ kind: 'out', n: 1, id: 'out', tip: 'The generated token, appended for the next step' });

      // bands from sources into the window (width = tokens)
      const bands = el('g', {}, g);
      const W = windowStaple(g, 262, 92, items, { fid, animate: an && st.step === 1, stagger: 7 });
      [['sys', 92, 3], ['tools', 144, 12], ['hist', 196, 20]].forEach(([k, y, t], i) =>
        band(bands, `M204,${y} C236,${y} 236,${120 + i * 30} 262,${120 + i * 30}`, t / 2.2, KIND[k].fill, k, an && st.step === 1));
      band(bands, `M208,300 C236,300 236,215 262,215`, Math.min(22, n * 15 / 2.6), KIND.file.fill, 'file', an && st.step === 1);

      // marks on the answer and look-alikes
      if (st.step >= 3 || (n > 1 && st.step >= 2)) {
        (W.pos.answer || []).forEach(a => el('rect', { x: a.x - 9.5, y: a.y - 9.5, width: 19, height: 19, rx: 5, fill: 'none', stroke: '#036A7C', 'stroke-width': 2.4, 'data-tip': 'The passage that answers the question' }, g));
        (W.pos.near || []).forEach(a => el('rect', { x: a.x - 9.5, y: a.y - 9.5, width: 19, height: 19, rx: 5, fill: 'none', stroke: '#FF2D78', 'stroke-width': 2, 'stroke-dasharray': '3 2', 'data-tip': 'A look-alike passage from another file' }, g));
      }

      // step 2+: what fills the window
      if (st.step >= 2) {
        const lg = el('g', {}, g);
        txt(lg, 262, 300, 'WHAT FILLS THE WINDOW', 'xp-cap');
        const rows = [['sys', 3], ['tools', 12], ['hist', 20], ['file', n * 15], ['user', 1]];
        rows.forEach(([k, t], i) => {
          const y = 322 + i * 24, row = el('g', { 'data-hl': k, 'data-tip': `${KIND[k].label}: about ${t}k tokens` }, lg);
          anim(row, an && st.step === 2, i * 80);
          el('rect', { x: 262, y: y - 10, width: 11, height: 11, rx: 2.5, fill: KIND[k].fill, stroke: KIND[k].stroke || 'rgba(18,36,74,.3)', 'stroke-width': KIND[k].stroke ? 1.6 : .6 }, row);
          txt(row, 280, y, KIND[k].label, 'xp-lbl');
          el('rect', { x: 420, y: y - 9, width: Math.max(2, t * 1.9), height: 9, rx: 2, fill: KIND[k].stroke || KIND[k].fill, opacity: .85 }, row);
          txt(row, 426 + Math.max(2, t * 1.9), y, `${t}k`, 'xp-mono');
        });
        txt(lg, 262, 456, '1 cell ≈ 800 tokens · a 200k-token window, for scale', 'xp-lbl');
      }

      model(g, 742, 92, 214, 86, 'predicts the next token');

      // step 3+: attention lines (illustrative)
      if (st.step >= 3) {
        const ag = el('g', {}, g);
        const ox = 742, oy = 135;
        for (let i = 3; i < W.used; i += 11) { const a = W.at(i); el('path', { d: `M${ox},${oy} C700,${oy} 700,${a.y + 6} ${a.x + 6},${a.y + 6}`, fill: 'none', stroke: '#8E9BB5', 'stroke-width': .7, opacity: .45, class: an && st.step === 3 ? 'xp-draw' : null }, ag); }
        (W.pos.near || []).forEach(a => el('path', { d: `M${ox},${oy} C700,${oy} 700,${a.y} ${a.x},${a.y}`, fill: 'none', stroke: '#FF2D78', 'stroke-width': 1 + 14 * sim.att.near, opacity: .75, class: an && st.step === 3 ? 'xp-draw' : null, 'data-tip': `Look-alike: about ${Math.round(sim.att.near * 100)}% of attention each (illustrative)` }, ag));
        (W.pos.answer || []).forEach(a => el('path', { d: `M${ox},${oy} C700,${oy} 700,${a.y} ${a.x},${a.y}`, fill: 'none', stroke: '#036A7C', 'stroke-width': 1 + 14 * sim.att.answer, opacity: .85, class: an && st.step === 3 ? 'xp-draw' : null, 'data-tip': `Answer: about ${Math.round(sim.att.answer * 100)}% of attention (illustrative)` }, ag));
        txt(g, 742, 196, 'ATTENTION · ILLUSTRATIVE', 'xp-cap');
        txt(g, 742, 211, 'line width = share of weight', 'xp-lbl');
      }

      // step 4: next-token candidates and the loop
      if (st.step >= 4) {
        const og = el('g', {}, g);
        txt(og, 742, 250, 'NEXT TOKEN · ILLUSTRATIVE', 'xp-cap');
        const labs = [['Correct, from the current file', '#036A7C'], ['Near-miss, from a look-alike', '#FF2D78'], ['Plausible guess', '#8E9BB5'], ['“I don’t know”', '#D9D3E3']];
        sim.p.forEach((p, i) => {
          const y = 276 + i * 48, row = el('g', { 'data-tip': `${labs[i][0]}: ${Math.round(p * 100)}%` }, og);
          anim(row, an, i * 120);
          txt(row, 742, y, labs[i][0], 'xp-lbl');
          el('rect', { x: 742, y: y + 6, width: 200, height: 14, rx: 3, fill: '#EEF1F7' }, row);
          el('rect', { x: 742, y: y + 6, width: Math.max(2, 200 * p), height: 14, rx: 3, fill: labs[i][1] }, row);
          txt(row, 948, y + 17, `${Math.round(p * 100)}%`, 'xp-mono', 'end');
        });
        const o = (W.pos.out || [])[0];
        if (o) {
          el('path', { d: `M849,472 C849,540 ${o.x},540 ${o.x},${o.y + 9}`, fill: 'none', stroke: '#12244A', 'stroke-width': 1.5, 'stroke-dasharray': '5 4', 'marker-end': `url(#xp-arr-ink-${fid})`, class: an ? 'xp-draw' : null }, og);
          txt(og, 860, 482, 'appended, then', 'xp-lbl');
          txt(og, 860, 497, 'the loop runs again', 'xp-lbl');
        }
      }
      if (st.step >= 3) wrap(g, 262, 500, n > 1 ? `${n} files: the answer sits in F${ans + 1}, mid-pack, with ${n - 1} look-alike${n > 2 ? 's' : ''} pulling weight away.` : 'One file: the answer has almost no competition.', 52, 'xp-h', 17);
    },
  };

  /* ============ Figure 2: compaction and what it loses ============ */
  const BEFORE = [
    { kind: 'sys', n: 4 }, { kind: 'rules', n: 6 }, { kind: 'nested', n: 3 }, { kind: 'hist', n: 10 }, { kind: 'file', n: 20 },
    { kind: 'result', n: 14 }, { kind: 'web', n: 2, id: 'web', tip: 'A web page the agent read, carrying an injected instruction' }, { kind: 'hist', n: 8 },
    { kind: 'mid', n: 1, id: 'mid', tip: 'A rule you typed mid-session: “don’t touch the production config”' }, { kind: 'hook', n: 3 },
    { kind: 'result', n: 20 }, { kind: 'file', n: 25 }, { kind: 'think', n: 30 }, { kind: 'result', n: 16 }, { kind: 'hist', n: 26 },
  ]; // 188 cells, about 150k tokens
  const MID_STATE = ['', 'paraphrased in the summary', 'reduced to a passing mention', 'no longer in the summary', 'no longer in the summary'];
  const FIG2 = {
    h: 640,
    alt: 'Interactive diagram: a full context window hits the compaction trigger; reloaded items come back from disk, session content is rewritten into a model-written summary, earlier blocks and thinking are dropped; four risks follow.',
    state: { c: 1 },
    steps: [
      ['Fill', 'A long session fills the window turn by turn: files, tool results, chat and thinking. Two cells to watch: the white one with a pink border is a rule you typed mid-session, and the solid pink pair is a web page carrying an injected instruction.'],
      ['Trigger', 'At the threshold, the harness compacts. Per Anthropic’s docs, the API default is 150k input tokens, configurable down to 50k. Claude Code compacts as it nears its own limit.'],
      ['Rewrite', 'Each item goes one of three ways, per the docs. What lives on disk is reloaded verbatim. Everything said in the session is rewritten by the model into a summary. Blocks before the compaction point and earlier thinking are dropped.'],
      ['After', st => `The new window has room again. That's the point. But the mid-session rule is now ${MID_STATE[st.c]}, and the web page’s words can sit inside “trusted” memory with nothing marking where they came from. Hover the four risks.`],
    ],
    knobs(k, st, redraw) {
      range(k, 'Compactions so far', 1, 4, st.c, v => { st.c = v; if (st.step < 4) st.step = 4; redraw(); });
      const n = h('span', '', k); n.textContent = 'Fates follow Anthropic’s docs; the summary’s content is illustrative.';
    },
    render(g, st, an, fid) {
      harness(g, 150, 36, 840, 372, 'Agent harness', 'compacts the window when it fills');
      const B = windowStaple(g, 170, 96, BEFORE, { fid, pitch: 12, title: 'Before compaction', animate: an && st.step === 1, stagger: 8 });
      // threshold flag after the last cell
      const last = B.at(B.used - 1);
      if (st.step >= 2) {
        el('rect', { x: B.x - 3, y: B.y - 3, width: B.W + 6, height: B.H + 6, rx: 12, class: 'xp-alert' + (an && st.step === 2 ? ' xp-pulse' : '') }, g);
        el('line', { x1: last.x + 11, y1: last.y - 2, x2: last.x + 11, y2: last.y + 12, stroke: '#B0125B', 'stroke-width': 2.5 }, g);
        txt(g, B.x, B.y + B.H + 18, '150k reached: compaction fires', 'xp-h xp-mag');
      }
      disk(g, 20, 110, 110, 150, ['ON DISK', 'CLAUDE.md (root)', 'auto memory', 'skills', 'recent files']);
      txt(g, 20, 280, 'outside the window;', 'xp-lbl');
      txt(g, 20, 295, 'reloadable verbatim', 'xp-lbl');

      if (st.step >= 3) {
        const bg = el('g', {}, g);
        // three fates
        band(bg, `M130,150 C140,74 200,72 300,72 L560,72 C640,72 660,90 668,118`, 16 / 2.4, '#036A7C', 'sys rules file', an && st.step === 3);
        txt(g, 560, 66, 're-injected from disk', 'xp-mono xp-teal', 'middle');
        band(bg, `M482,170 C505,170 505,175 528,175`, 22, 'url(#xp-hatch-n-' + fid + ')', 'nested hist mid hook web file result', an && st.step === 3);
        band(bg, `M482,215 C510,215 520,300 552,306`, 10, '#B7AFC6', 'think', an && st.step === 3);
        const sm = el('g', { 'data-tip': 'The model reads the old window and writes the summary. It decides what mattered.' }, g);
        el('rect', { x: 528, y: 142, width: 118, height: 70, rx: 12, fill: '#fff', stroke: '#B0125B', 'stroke-width': 1.6 }, sm);
        txt(sm, 587, 168, 'Model writes', 'xp-h', 'middle');
        txt(sm, 587, 185, 'the summary', 'xp-h', 'middle');
        txt(sm, 587, 201, 'rewritten', 'xp-mono xp-mag', 'middle');
        band(bg, `M646,178 C656,178 658,190 668,190`, 5, 'url(#xp-hatch-n-' + fid + ')', 'summary laund', an && st.step === 3);
        const bin = el('g', { 'data-hl': 'think', 'data-tip': 'Content blocks before the compaction block are dropped; earlier thinking is not carried forward' }, g);
        el('path', { d: 'M536,292 h128 l-10,46 h-108 z', fill: '#fff', stroke: '#12244A', 'stroke-width': 1.4 }, bin);
        txt(bin, 600, 314, 'Dropped', 'xp-h', 'middle');
        txt(bin, 600, 330, 'thinking, old blocks', 'xp-lbl', 'middle');
      }
      // after window
      const after = [{ kind: 'sys', n: 4 }, { kind: 'rules', n: 6 }, { kind: 'file', n: 10, tip: 'Up to five recently modified files, re-read from disk' }];
      if (st.step >= 4) {
        const sumTip = 'Summary written by the model: everything said in the session, compressed';
        after.push({ kind: 'summary', n: 4, tip: sumTip }, { kind: 'laund', n: 1, id: 'laund', tip: 'The injected web text, paraphrased into the summary with no marker of where it came from' }, { kind: 'summary', n: 3, tip: sumTip });
        if (st.c === 1) after.push({ kind: 'mid', n: 1, id: 'mid2', dash: '2 2', tip: 'Your rule, as the summary paraphrased it' });
        else if (st.c === 2) after.push({ kind: 'mid', n: 1, id: 'mid2', dash: '2 2', opacity: .45, tip: 'Your rule, reduced to a passing mention' });
        else after.push({ kind: 'summary', n: 1, tip: sumTip });
        after.push({ kind: 'summary', n: Math.max(2, 6 - st.c), tip: sumTip });
      }
      windowStaple(g, 668, 96, st.step >= 4 ? after : [], { fid, pitch: 12, title: 'After compaction', animate: an && st.step === 4, stagger: 30, meter: st.step >= 4 });

      // legend
      const lg = el('g', {}, g);
      txt(lg, 668, 268, 'KEY', 'xp-cap');
      ['mid', 'web', 'summary', 'laund'].forEach((k, i) => {
        const y = 288 + i * 19, row = el('g', { 'data-hl': k === 'web' ? 'web laund' : k === 'mid' ? 'mid' : k }, lg);
        el('rect', { x: 668, y: y - 10, width: 11, height: 11, rx: 2.5, fill: fillOf(k, fid), stroke: KIND[k].stroke || 'rgba(18,36,74,.3)', 'stroke-width': KIND[k].stroke ? 1.6 : .6 }, row);
        txt(row, 686, y, KIND[k].label, 'xp-lbl');
      });

      // risks
      if (st.step >= 4) {
        const risks = [
          ['RISK 1', 'Subtle detail lost', 'Old file content and tool results survive only as the summary describes them. What matters later may not be in it.', 'file result summary'],
          ['RISK 2', 'Rule drift', `A rule typed in chat is ${MID_STATE[st.c]}. Rules in the root CLAUDE.md come back verbatim; nested ones don't.`, 'mid nested'],
          ['RISK 3', 'Provenance laundering', 'Text from an untrusted page can resurface inside the trusted summary, unmarked. My read, not a vendor claim.', 'web laund'],
          ['RISK 4', 'Audit gap', 'Thinking from before the compaction isn’t carried forward, so the reasoning trail for earlier actions ends here.', 'think'],
        ];
        risks.forEach(([tag, title, body, hl], i) => {
          const x = 20 + i * 245, y = 430, grp = el('g', { 'data-hl': hl }, g);
          anim(grp, an, 200 + i * 140);
          el('rect', { x, y, width: 232, height: 196, rx: 12, fill: '#fff', stroke: i === 2 ? '#FF2D78' : '#d9d3e3', 'stroke-width': 1.4 }, grp);
          txt(grp, x + 16, y + 26, tag, 'xp-cap xp-mag');
          txt(grp, x + 16, y + 48, title, 'xp-h');
          wrap(grp, x + 16, y + 72, body, 33, 'xp-lbl', 16);
        });
      } else {
        wrap(g, 20, 460, 'Step through to see what compaction keeps, rewrites and drops, then the risks that follow.', 90, 'xp-lbl', 16);
      }
    },
  };

  /* ============ Figure 3: model, MCP, and a schema-shaped result ============ */
  const FIELDS = [['title', 12], ['section', 8], ['source', 15], ['updated', 6], ['excerpt', 120], ['full_body', 1800], ['owner_email', 10], ['acl', 40]];
  const tokens3 = st => st.k * FIELDS.reduce((a, [f, t]) => a + (st.f[f] ? t : 0), 0) + 60;
  const SOURCES = ['policy.md §4.2 · 2026-10', 'runbook-ir.md §2 · 2026-11', 'policy.md §7.1 · 2026-10', 'faq-soc.md §3 · 2026-09', 'standard-iam.md §5 · 2026-08'];
  const FIG3 = {
    h: 640,
    alt: 'Interactive diagram: the harness discovers MCP tools, the model emits a tool call, the server checks identity and filters its index, and the tool’s output schema decides which fields of the top results return into the context window.',
    state: { k: 3, f: { title: true, section: true, source: true, updated: true, excerpt: true, full_body: false, owner_email: false, acl: false } },
    steps: [
      ['Discover', 'The harness asks the server what it offers (tools/list). Only short tool definitions enter the window, not the data behind them.'],
      ['Call', st => `The model never fetches anything itself. It emits a structured request, here search_docs with top_k of ${st.k}, and the harness sends it to the server as tools/call.`],
      ['Retrieve', 'The server checks who is asking, searches its index, and drops anything the caller can’t open, all before the model sees a byte. These counts are illustrative.'],
      ['Return', st => { const t = tokens3(st); return `The tool’s output schema decides which fields come back, and top_k decides how many. Only that lands in context: about ${t.toLocaleString()} tokens, each chunk tagged with its source. Toggle fields below to see the cost.`; }],
    ],
    knobs(k, st, redraw) {
      range(k, 'top_k', 1, 10, st.k, v => { st.k = v; redraw(); });
      const grp = h('div', 'xp-k-group', k);
      const t = h('span', 'xp-k-title', grp); t.textContent = 'Fields returned';
      FIELDS.forEach(([f]) => {
        const l = h('label', '', grp);
        const c = h('input', '', l); c.type = 'checkbox'; c.checked = !!st.f[f];
        const code = h('code', '', l); code.textContent = f;
        c.addEventListener('change', () => { st.f[f] = c.checked; if (st.step < 4) st.step = 4; redraw(); });
      });
    },
    render(g, st, an, fid) {
      harness(g, 20, 36, 420, 584, 'Agent harness', 'the MCP client');
      model(g, 40, 70, 380, 70, 'asks for data, never fetches it');
      if (st.step >= 2) {
        const call = el('g', { 'data-tip': 'A tool call is just structured text the model emits. The harness decides whether to run it.' }, g);
        anim(call, an && st.step === 2, 0);
        el('rect', { x: 40, y: 150, width: 380, height: 40, rx: 8, fill: '#fff', stroke: '#12244A', 'stroke-width': 1 }, call);
        txt(call, 52, 166, 'TOOLS/CALL · SEARCH_DOCS', 'xp-cap');
        txt(call, 52, 182, `{"query":"phishing escalation steps","top_k":${st.k}}`, 'xp-mono');
      }
      const items = [{ kind: 'sys', n: 4 }, { kind: 'tools', n: st.step >= 1 ? 2 : 0, tip: 'search_docs and get_doc definitions, about 1.2k tokens' }, { kind: 'hist', n: 3 }, { kind: 'user', n: 1, tip: 'Your question' }];
      const t = tokens3(st), cells = Math.max(1, Math.ceil(t / TOK));
      if (st.step >= 4) items.push({ kind: 'result', n: cells, id: 'res', tip: `Returned results: about ${t.toLocaleString()} tokens` });
      windowStaple(g, 38, 228, items, { fid, pitch: 15, animate: an && (st.step === 1 || st.step === 4), stagger: st.step === 4 ? 25 : 30 });

      // server, IdP, index
      const sv = el('g', {}, g);
      el('rect', { x: 560, y: 52, width: 420, height: 252, rx: 14, class: 'xp-server' }, sv);
      el('path', { d: 'M560,66 a14,14 0 0 1 14,-14 h392 a14,14 0 0 1 14,14 v22 h-420 z', fill: '#036A7C' }, sv);
      txt(sv, 578, 75, 'RETRIEVAL MCP SERVER', 'xp-cap xp-white');
      txt(sv, 578, 112, 'TOOLS', 'xp-cap xp-teal');
      const tl = el('g', { 'data-hl': 'tools', 'data-tip': 'Tools: functions the model can ask the harness to call' }, sv);
      txt(tl, 578, 134, 'search_docs(query, top_k)', 'xp-mono');
      txt(tl, 578, 154, 'get_doc(id)', 'xp-mono');
      txt(sv, 578, 190, 'RESOURCES', 'xp-cap xp-teal');
      const rs = el('g', { 'data-tip': 'Resources: data the application can attach as context, by URI' }, sv);
      txt(rs, 578, 212, 'policy://security/*', 'xp-mono');
      txt(rs, 578, 232, 'runbook://soc/*', 'xp-mono');
      wrap(sv, 800, 128, 'Per the MCP spec: tools are functions for the model to execute; resources are context and data.', 26, 'xp-lbl', 15);
      txt(sv, 578, 282, 'descriptions here are untrusted input, per the spec', 'xp-lbl xp-mag');

      const idp = el('g', { 'data-tip': 'The server checks the caller’s token (MCP authorisation builds on OAuth 2.1 for HTTP transports)' }, g);
      el('rect', { x: 560, y: 334, width: 190, height: 66, rx: 10, class: 'xp-card' }, idp);
      txt(idp, 576, 360, 'Identity provider', 'xp-h');
      txt(idp, 576, 378, 'who is asking?', 'xp-lbl');
      disk(g, 790, 330, 190, 84, ['INDEX', '12,400 chunks', 'illustrative']);

      // messages across the gap
      if (st.step >= 1) {
        arrow(g, 440, 110, 558, 110, 'ink', fid, 'tools/list', { anim: an && st.step === 1, ly: 102 });
        arrow(g, 558, 128, 440, 128, 'teal', fid, '← definitions', { anim: an && st.step === 1, ly: 146, cls: 'xp-mono xp-teal' });
      }
      if (st.step >= 2) arrow(g, 440, 172, 558, 172, 'ink', fid, 'tools/call', { anim: an && st.step === 2, ly: 166 });
      if (st.step >= 3) {
        arrow(g, 655, 304, 655, 332, 'ink', fid, 'token ok', { anim: an && st.step === 3, lx: 662, ly: 322, anchor: 'start' });
        arrow(g, 885, 304, 885, 328, 'ink', fid, '', { anim: an && st.step === 3 });
        const f = el('g', {}, g);
        anim(f, an && st.step === 3, 300);
        txt(f, 980, 432, '40 match → 27 allowed → top ' + st.k, 'xp-mono', 'end');
      }
      if (st.step >= 4) {
        arrow(g, 558, 260, 440, 300, 'teal', fid, 'structuredContent', { anim: an, curve: true, lx: 500, ly: 254, cls: 'xp-mono xp-teal' });
        // schema card
        const sc = el('g', { 'data-hl': 'result', 'data-tip': 'The output schema is the filter: only checked fields leave the server' }, g);
        anim(sc, an, 0);
        el('rect', { x: 560, y: 448, width: 420, height: 172, rx: 12, fill: '#fff', stroke: '#12244A', 'stroke-width': 1.4 }, sc);
        txt(sc, 576, 472, 'OUTPUTSCHEMA → WHAT COMES BACK', 'xp-cap');
        FIELDS.forEach(([f, tk], i) => {
          const x = 576 + (i % 2) * 204, y = 498 + Math.floor(i / 2) * 26, on = !!st.f[f];
          const risky = f === 'owner_email' || f === 'acl' || f === 'full_body';
          txt(sc, x, y, on ? '✓' : '✕', on ? (risky ? 'xp-mono xp-mag' : 'xp-mono xp-teal') : 'xp-mono', 'start');
          const ft = txt(sc, x + 16, y, f, 'xp-mono');
          if (!on) ft.setAttribute('opacity', '.45');
          txt(sc, x + 186, y, `${tk} tok`, 'xp-lbl', 'end');
        });
        txt(sc, 576, 608, `per result × top_k ${st.k} + 60 overhead = ${t.toLocaleString()} tokens`, 'xp-lbl');

        // sources and the comparison
        txt(g, 38, 434, 'EACH CHUNK CARRIES ITS SOURCE', 'xp-cap');
        const show = Math.min(st.k, 3);
        for (let i = 0; i < show; i++) {
          const x = 38 + i * 132, chip = el('g', { 'data-hl': 'result', 'data-tip': st.f.source ? `Source: ${SOURCES[i]}` : 'No source field: the model can’t cite this chunk' }, g);
          el('rect', { x, y: 444, width: 126, height: 24, rx: 12, fill: st.f.source ? '#E3F7F9' : '#F3F5FA', stroke: st.f.source ? '#036A7C' : '#CBD3E2' }, chip);
          txt(chip, x + 63, 460, st.f.source ? SOURCES[i].split(' ·')[0] : 'no source', 'xp-lbl', 'middle');
        }
        if (st.k > 3) txt(g, 38 + 3 * 132, 460, `+${st.k - 3}`, 'xp-lbl');
        txt(g, 38, 500, 'TOKENS INTO CONTEXT, VS THE 200K WINDOW', 'xp-cap');
        const bw = 386;
        el('rect', { x: 38, y: 510, width: bw, height: 14, rx: 3, fill: '#EEF1F7' }, g);
        el('rect', { x: 38, y: 510, width: Math.max(2, bw * Math.min(1, t / 200000)), height: 14, rx: 3, fill: '#00BFCF' }, g);
        txt(g, 38, 540, `This fetch: ${t.toLocaleString()} tokens`, 'xp-h');
        el('rect', { x: 38, y: 552, width: bw, height: 14, rx: 3, fill: '#FF2D78', opacity: .85 }, g);
        txt(g, 38, 582, 'Loading the 27 matching docs whole: ~405k. Doesn’t fit.', 'xp-lbl xp-mag');
        const warn = st.f.full_body ? 'full_body returns whole documents: you’ve rebuilt the stuffed window.' : (st.f.owner_email || st.f.acl) ? 'owner_email and acl put personal data and policy structure into context.' : 'Small, cited, permission-filtered. That’s the shape you want.';
        txt(g, 38, 604, warn, (st.f.full_body || st.f.owner_email || st.f.acl) ? 'xp-h xp-mag' : 'xp-h xp-teal');
      }
    },
  };

  const FIGS = { load: FIG1, compact: FIG2, mcp: FIG3 };
  function init() { document.querySelectorAll('[data-xp]').forEach(r => { const c = FIGS[r.getAttribute('data-xp')]; if (c) mount(r, c); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
