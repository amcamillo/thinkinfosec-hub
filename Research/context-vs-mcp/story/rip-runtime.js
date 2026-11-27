/* thinkinfosec-visuals · RIP runtime (Research Interactive Presentation).
 * One Canvas 2D engine driven by steps: every narration card (hero and beats) is a step the page snaps to, and the
 * stage tweens the scene to that step's target progress, so any scroll lands on a finished frame. The cover art is cut into glass panes (window.RIP_ART, from panes.js),
 * each <section class="scene" data-draw="name"> is drawn by a function registered in the story's scenes.js:
 *   RIP.scene('name', (p, k) => { ... })   p = tweened progress through the scene, 0..1 (step j of n targets (j+1)/n,
 *                                          or the beat's data-to); k = drawing kit
 *   RIP.init(k => { ... })                 runs once the art is loaded; scenes can be registered here too
 * Works from file:// (no fetch) and over http. window.RIP.debug exposes state for the validator. */
(() => {
  'use strict';
  const reg = {}, inits = [];
  const debug = { ready: false, cur: 0, prog: 0, step: -1, target: 0, settled: false, steps: 0, errors: [], art: null, scenes: 0, missing: [], labels: { clipped: [], clash: [] } };
  const RIP = window.RIP = { scene: (n, fn) => { reg[n] = fn; }, init: fn => inits.push(fn), debug };
  addEventListener('error', e => debug.errors.push(String(e.message || e)));

  const root = document.documentElement;
  const KEY = 'tih-story-theme';
  const themeBtns = [...document.querySelectorAll('[data-theme-set]')];
  const syncTheme = () => themeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === root.dataset.theme)));
  themeBtns.forEach(b => b.addEventListener('click', () => {
    root.dataset.theme = b.dataset.themeSet;
    try { localStorage.setItem(KEY, root.dataset.theme); } catch (e) {}
    syncTheme();
  }));
  syncTheme();

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const now = () => reduced ? 0 : performance.now();

  // One wheel gesture = one card. Mandatory snap alone pulls a small wheel notch back to the same card, so the
  // runtime takes the gesture and moves to the neighbouring card. A gesture ends after 180ms without wheel events,
  // so trackpad inertia counts once. Cards that scroll internally (long text on phones) scroll natively first.
  let wheelLock = false, wheelAcc = 0, wheelQuiet = 0;
  const cards = () => [...document.querySelectorAll('.hero, .beat')];
  function nearestCard() {
    const els = cards(), y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    let i = 0, bd = Infinity;
    els.forEach((el, j) => { const d = Math.abs(Math.min(el.getBoundingClientRect().top + y, max) - y); if (d < bd) { bd = d; i = j; } });
    return i;
  }
  function goCard(dir, from) {
    const els = cards(), i = from == null ? nearestCard() : from;
    const t = els[Math.max(0, Math.min(els.length - 1, i + dir))];
    if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  addEventListener('wheel', e => {
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const box = e.target.closest && e.target.closest('.beat > div, .hero > div');
    if (box && (e.deltaY > 0 ? box.scrollTop + box.clientHeight < box.scrollHeight - 1 : box.scrollTop > 0)) return;
    e.preventDefault();
    clearTimeout(wheelQuiet);
    wheelQuiet = setTimeout(() => { wheelLock = false; wheelAcc = 0; }, 180);
    if (wheelLock) return;
    wheelAcc += e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? innerHeight : 1);
    if (Math.abs(wheelAcc) < 24) return;
    wheelLock = true;
    goCard(wheelAcc > 0 ? 1 : -1);
  }, { passive: false });

  // Touch: native snap pages on a long or fast swipe, but a short deliberate one snaps back to the same card.
  // If a swipe of 40px+ ends where it started, move one card in its direction. Swipes on controls, or ones that
  // scrolled a long card's own text, are left alone.
  let touch = null;
  addEventListener('touchstart', e => {
    if (e.touches.length !== 1) { touch = null; return; }
    const box = e.target.closest && e.target.closest('.beat > div, .hero > div');
    touch = { y: e.touches[0].clientY, card: nearestCard(), box, top: box ? box.scrollTop : 0,
      control: !!(e.target.closest && e.target.closest('input[type=range], textarea, select')) };
  }, { passive: true });
  addEventListener('touchend', e => {
    const t = touch; touch = null;
    if (!t || t.control || !e.changedTouches.length) { debug.assist = 'touch: ignored (control or no touch)'; return; }
    const dy = t.y - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 40 || (t.box && t.box.scrollTop !== t.top)) { debug.assist = 'touch: native (' + Math.round(dy) + 'px)'; return; }
    // decide once the page has been still for 150ms: if native snap moved a card, leave it; if it snapped back, assist
    let quiet = 0;
    const decide = () => { removeEventListener('scroll', wait); const n = nearestCard(); debug.assist = 'touch: from ' + t.card + ' now ' + n + (n === t.card ? ' -> assist' : ''); if (n === t.card) goCard(dy > 0 ? 1 : -1, t.card); };
    const wait = () => { clearTimeout(quiet); quiet = setTimeout(decide, 150); };
    addEventListener('scroll', wait, { passive: true }); wait();
  }, { passive: true });

  function boot() {
    const cv = document.getElementById('glass'), ctx = cv.getContext('2d');
    const scenes = [...document.querySelectorAll('.scene')];
    debug.scenes = scenes.length;
    debug.missing = scenes.map(s => s.dataset.draw).filter(n => !reg[n]);
    const rail = document.getElementById('rail');
    scenes.forEach(() => rail.appendChild(document.createElement('i')));
    const A = window.RIP_ART;
    if (!A) { debug.errors.push('RIP_ART missing: panes.js did not load'); return; }

    const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('image failed: ' + src)); i.src = src; });
    Promise.all([A.atlas, A.grey, A.lead, ...(A.extraLead || [])].map(load))
      .then(([atlas, grey, lead, ...extra]) => start(atlas, grey, lead, extra))
      .catch(e => debug.errors.push(String(e.message || e)));

    function start(atlas, grey, lead, extra) {
      const { W, H, panes } = A, MID = A.mid || W / 2;
      panes.forEach(p => { p.half = p.cx < MID ? 'L' : 'R'; });
      const leadGlow = document.createElement('canvas'); leadGlow.width = W; leadGlow.height = H;
      const lg = leadGlow.getContext('2d'); lg.drawImage(lead, 0, 0);
      lg.globalCompositeOperation = 'source-in'; lg.fillStyle = '#00BFCF'; lg.fillRect(0, 0, W, H);

      // Layout: wide = art in the left 58%, narration on the right; narrow = art in the top half, cards below it.
      let dpr = 1;
      const view = { s: 1, ox: 0, oy: 0, wide: true };
      function resize() {
        dpr = Math.min(2, devicePixelRatio || 1);
        const w = cv.clientWidth, h = cv.clientHeight;
        cv.width = w * dpr; cv.height = h * dpr;
        const wide = w >= 900, top = wide ? 70 : 58;
        const aw = wide ? w * 0.58 : w, ah = wide ? h - top - 16 : h * 0.46;
        const s = Math.min(aw / W, ah / H) * (wide ? 0.92 : 0.95);
        Object.assign(view, { s, wide, aw, ox: (aw - W * s) / 2, oy: top + (ah - H * s) / 2 });
        debug.art = { x: view.ox, y: view.oy, w: W * s, h: H * s };
      }

      const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
      const seg = (p, a, b) => ease((p - a) / (b - a));
      const css = n => getComputedStyle(root).getPropertyValue(n).trim();
      const rnd = i => { const x = Math.sin(i * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
      const fsz = () => Math.max(22, 13 / view.s);

      function doc(x, y, w, h, o) {
        o = o || {};
        ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.globalAlpha = o.a == null ? 1 : o.a;
        const g = o.grey || 0, base = o.tint || [239, 230, 210];
        const mix = c => Math.round(c * (1 - g) + 150 * g);
        ctx.fillStyle = `rgb(${mix(base[0])},${mix(base[1])},${mix(base[2])})`;
        ctx.strokeStyle = '#0a0f1c'; ctx.lineWidth = o.thin ? 1.5 : 3;
        ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.fill(); ctx.stroke();
        ctx.lineWidth = 2; ctx.globalAlpha *= .55;
        for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 8, -h / 2 + i * h / 4.2); ctx.lineTo(w / 2 - 8 - (i === 3 ? w * .3 : 0), -h / 2 + i * h / 4.2); ctx.stroke(); }
        if (o.ring) { ctx.globalAlpha = 1; ctx.strokeStyle = o.ring; ctx.lineWidth = 4; ctx.strokeRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12); }
        if (o.seal) { ctx.globalAlpha = 1; ctx.fillStyle = '#FF2D78'; ctx.beginPath(); ctx.arc(w / 2 - 12, h / 2 - 12, 8, 0, 7); ctx.fill(); }
        ctx.restore();
      }
      // labels stay inside the art column: shrink to fit (down to 65%), then slide sideways; report what still clashes
      const boxes = [];
      function label(t, x, y, c, align, a) {
        const al = a == null ? 1 : a;
        if (al <= 0.02) return;
        ctx.save(); let fs = fsz(); ctx.font = `700 ${fs}px "Space Mono", monospace`;
        const L = (-view.ox + 4) / view.s, R = (view.aw - view.ox - 4) / view.s;
        let m = ctx.measureText(t), w = m.width + fs * .9;
        if (w > R - L) { fs *= Math.max(.65, (R - L) / w); ctx.font = `700 ${fs}px "Space Mono", monospace`; m = ctx.measureText(t); w = m.width + fs * .9; }
        let bx = align === 'left' ? x - fs * .45 : align === 'right' ? x - m.width - fs * .45 : x - w / 2;
        const shift = bx < L ? L - bx : bx + w > R ? R - bx - w : 0;
        bx += shift; x += shift;
        ctx.textAlign = align || 'center';
        const box = { t, x: bx, y: y - fs * 1.05, w, h: fs * 1.5 };
        if (al > .5) {
          if (bx < L - 1 || bx + w > R + 1) debug.labels.clipped.push(t);
          for (const o of boxes) {
            const ix = Math.min(box.x + box.w, o.x + o.w) - Math.max(box.x, o.x), iy = Math.min(box.y + box.h, o.y + o.h) - Math.max(box.y, o.y);
            if (ix > 0 && iy > 0 && ix * iy > .2 * Math.min(box.w * box.h, o.w * o.h)) debug.labels.clash.push(o.t + ' / ' + t);
          }
          boxes.push(box);
        }
        ctx.globalAlpha = .88 * al; ctx.fillStyle = css('--bg'); ctx.beginPath(); ctx.roundRect(bx, y - fs * 1.05, w, fs * 1.5, fs * .3); ctx.fill();
        ctx.globalAlpha = al; ctx.fillStyle = c || css('--ink'); ctx.fillText(t, x, y); ctx.restore();
      }
      function card(x, y, lines, o) {
        o = o || {};
        ctx.save(); const fs = fsz() * .92; ctx.font = `400 ${fs}px "Space Mono", monospace`;
        const w = Math.max(...lines.map(l => ctx.measureText(l[0]).width)) + fs * 1.6, h = lines.length * fs * 1.45 + fs * .9;
        const al = o.a == null ? 1 : o.a;
        ctx.globalAlpha = al; ctx.fillStyle = css('--bg'); ctx.strokeStyle = o.stroke || css('--line'); ctx.lineWidth = 1.6 / view.s;
        ctx.beginPath(); ctx.roundRect(x, y, w, h, fs * .4); ctx.fill(); ctx.stroke();
        lines.forEach((l, i) => { ctx.globalAlpha = al * (l[2] == null ? 1 : l[2]); ctx.fillStyle = l[1] || css('--ink'); ctx.fillText(l[0], x + fs * .8, y + fs * 1.35 + i * fs * 1.45); });
        ctx.restore(); return { w, h };
      }
      function pipe(pts, color, width, a, dash) {
        ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (dash) ctx.setLineDash(dash);
        ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore();
      }
      function along(pts, f) {
        const L = []; let tot = 0;
        for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
        let r = f * tot;
        for (let i = 0; i < L.length; i++) { if (r <= L[i]) { const q = r / L[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * q, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * q]; } r -= L[i]; }
        return pts[pts.length - 1];
      }
      function drawLead(img, o) {
        const L = Object.assign({ a: 1, dx: 0 }, o.L), R = Object.assign({ a: 1, dx: 0 }, o.R), base = o.lead == null ? 1 : o.lead;
        for (const [h, x0, x1] of [[L, 0, MID], [R, MID, W]]) {
          const a = base * h.a; if (a <= 0) continue;
          ctx.save(); ctx.beginPath(); ctx.rect(x0 + h.dx, 0, x1 - x0, H); ctx.clip();
          ctx.globalAlpha = a; ctx.drawImage(img, h.dx, 0); ctx.restore();
        }
      }
      // fn(pane) -> { a, g (greyness), dx, dy, k (scale) } | null.  o: { lead, glow, water, L:{a,dx}, R:{a,dx} }
      function drawPanes(fn, o) {
        o = typeof o === 'number' ? { lead: o, glow: arguments[2] } : (o || {});
        for (const p of panes) {
          const st = fn(p); if (!st || st.a <= 0.003) continue;
          const sc = st.k == null ? 1 : st.k;
          ctx.save();
          ctx.translate(p.cx + (st.dx || 0), p.cy + (st.dy || 0)); ctx.scale(sc, sc); ctx.translate(-p.cx, -p.cy);
          const gr = st.g || 0;
          if (gr < 1) { ctx.globalAlpha = st.a * (1 - gr); ctx.drawImage(atlas, p.ax, p.ay, p.w, p.h, p.x, p.y, p.w, p.h); }
          if (gr > 0) { ctx.globalAlpha = st.a * gr; ctx.drawImage(grey, p.ax, p.ay, p.w, p.h, p.x, p.y, p.w, p.h); }
          ctx.restore();
        }
        drawLead(lead, o);
        // extra lead layers (e.g. around water) travel with the left half
        extra.forEach(img => drawLead(img, { lead: (o.lead == null ? 1 : o.lead) * (o.water == null ? 1 : o.water), L: o.L, R: o.L }));
        if (o.glow > 0) { ctx.globalAlpha = o.glow; ctx.drawImage(leadGlow, 0, 0); }
        ctx.globalAlpha = 1;
      }

      const gauge = document.getElementById('gauge');
      const gVal = document.getElementById('gVal'), gFill = document.getElementById('gFill'), gLabel = document.getElementById('gLabel'), gNote = document.getElementById('gNote');
      function setGauge(on, v, lab, note) {
        if (!gauge) return;
        gauge.classList.toggle('on', on); if (!on) return;
        gVal.textContent = typeof v === 'number' ? Math.round(v).toLocaleString('en-NZ') : v;
        gFill.style.width = (typeof v === 'number' ? Math.min(100, v / ((A.gaugeMax || 150000) / 100)) : 2) + '%';
        gFill.classList.toggle('over', typeof v === 'number' && v >= (A.gaugeMax || 150000));
        gLabel.textContent = lab || A.gaugeLabel || 'In the window'; gNote.textContent = note || A.gaugeNote || '';
      }

      // steps: the hero and every beat, in page order, each with the scene progress it settles on
      const steps = [];
      scenes.forEach((s, si) => {
        const els = [...s.querySelectorAll('.hero, .beat')];
        els.forEach((el, j) => steps.push({ el, scene: si, to: el.dataset.to != null ? +el.dataset.to : (j + 1) / els.length }));
      });
      debug.steps = steps.length;
      const STEP_MS = 1200, MIN_MS = 350;
      let cur = 0, prog = 0, step = -1, from = 0, target = 0, t0 = 0, dur = 1;
      const toImg = ev => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left - view.ox) / view.s, (ev.clientY - r.top - view.oy) / view.s]; };
      const k = {
        ctx, view, W, H, MID, panes, reduced, now, ease, seg, css, rnd, doc, label, card, pipe, along, drawPanes, setGauge,
        lh: () => fsz() * 1.6, halfShift: (p, d) => p.half === 'L' ? -d : d, canvas: cv, toImg, cur: () => cur, prog: () => prog,
      };
      // built-in scenes
      reg.still = reg.still || (() => { drawPanes(() => ({ a: 1 }), 1, 0); setGauge(false); });
      reg['lead-reveal'] = reg['lead-reveal'] || (p => { const e = seg(p, .4, .9); drawPanes(() => ({ a: 1 - .72 * e, g: .5 * e }), 1 - .5 * e, e); setGauge(false); });

      // the current step is the card holding the middle of the viewport (or the nearest one)
      function pick() {
        const mid = innerHeight * .5;
        let best = 0, bd = Infinity;
        for (let i = 0; i < steps.length; i++) {
          const r = steps[i].el.getBoundingClientRect();
          const d = r.top <= mid && r.bottom > mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
          if (d < bd) { bd = d; best = i; }
        }
        return best;
      }
      function measure(t) {
        const i = pick();
        if (i !== step) {
          const s = steps[i];
          if (s.scene !== cur || step < 0) {
            // entering a scene: play only this step, starting from the neighbouring step's end state
            const prev = steps[i - 1], next = steps[i + 1];
            prog = (step < 0 || i > step) ? (prev && prev.scene === s.scene ? prev.to : 0) : (next && next.scene === s.scene ? next.to : 1);
            cur = s.scene;
          }
          step = i; from = prog; target = s.to; t0 = t;
          dur = Math.max(MIN_MS, Math.abs(target - from) * STEP_MS);
        }
        prog = reduced ? target : from + (target - from) * ease(Math.min(1, (t - t0) / dur));
        debug.cur = cur; debug.prog = prog; debug.step = step; debug.target = target; debug.settled = Math.abs(prog - target) < 1e-4;
        [...rail.children].forEach((d, i) => d.classList.toggle('on', i === cur));
      }
      function frame(t) {
        measure(t == null ? performance.now() : t);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.setTransform(dpr * view.s, 0, 0, dpr * view.s, dpr * view.ox, dpr * view.oy);
        boxes.length = 0; debug.labels = { clipped: [], clash: [] };
        const fn = reg[scenes[cur].dataset.draw] || reg.still;
        try { fn(Math.max(0, Math.min(1, prog)), k); } catch (e) { if (debug.errors.length < 20) debug.errors.push('scene ' + scenes[cur].dataset.draw + ': ' + e.message); }
        requestAnimationFrame(frame);
      }
      addEventListener('resize', resize);
      resize();
      inits.forEach(fn => { try { fn(k); } catch (e) { debug.errors.push('init: ' + e.message); } });
      // scenes may be registered inside RIP.init, so check for missing ones after it runs
      debug.missing = scenes.map(s => s.dataset.draw).filter(n => !reg[n]);
      frame();
      debug.ready = true;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
