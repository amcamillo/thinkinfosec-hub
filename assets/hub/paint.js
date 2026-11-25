/* Painterly background: soft blots drifting along a slow flow field (ported from Signal's signal.js).
   Decorative only: aria-hidden canvas, half resolution, ~30 fps, paused while the tab is hidden. */
(function () {
  if (typeof document === 'undefined') return;
  const cv = document.getElementById('paint');
  const ctx = cv && cv.getContext ? cv.getContext('2d') : null;
  if (!ctx) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SC = 0.5;
  const PAL = {
    dark: ['0,191,207', '76,141,224', '127,231,239', '255,45,120', '255,128,180', '190,150,255'],
    light: ['0,175,194', '42,95,196', '196,20,111', '255,45,120', '255,120,170', '120,90,210']
  };
  const sprites = {};
  let W = 0, H = 0, T = 0, strokes = [], frameN = 0, lastSpawn = 0, lastFrame = 0;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const isLight = () => document.documentElement.getAttribute('data-theme') !== 'dark';

  function sprite(rgb) {
    if (sprites[rgb]) return sprites[rgb];
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(' + rgb + ',1)');
    r.addColorStop(0.35, 'rgba(' + rgb + ',.55)');
    r.addColorStop(0.7, 'rgba(' + rgb + ',.14)');
    r.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    return (sprites[rgb] = c);
  }
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * SC); cv.height = Math.round(H * SC);
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    ctx.clearRect(0, 0, W, H);
    strokes = [];
  }
  function flow(x, y) {
    const s = 0.0013;
    return Math.sin(x * s * 1.3 + T * 0.04) * 2.1 + Math.cos(y * s * 1.7 - T * 0.03) * 2.1 + Math.sin((x + y) * s * 0.7 + T * 0.025) * 1.2;
  }
  function spawn() {
    const unit = Math.min(W, H) / 900;
    let x, y;
    if (Math.random() < 0.6) { // favour the rim, let some wander inland
      const d = Math.pow(Math.random(), 2) * 0.3, side = Math.floor(Math.random() * 4);
      if (side === 0) { x = rand(0, W); y = d * H; } else if (side === 1) { x = rand(0, W); y = H - d * H; }
      else if (side === 2) { x = d * W; y = rand(0, H); } else { x = W - d * W; y = rand(0, H); }
    } else { x = rand(0, W); y = rand(0, H); }
    const light = isLight(), pal = PAL[light ? 'light' : 'dark'];
    strokes.push({ x, y, k: 0, max: rand(280, 640), v: rand(0.9, 1.7) * unit + 0.4, r: rand(55, 140) * unit + 20,
      a: rand(0.014, 0.032) * (light ? 1.6 : 1), seed: rand(0, 6.28), col: pal[Math.floor(Math.random() * pal.length)] });
  }
  function stepStroke(s) {
    const ang = flow(s.x, s.y) + Math.sin(s.k * 0.015 + s.seed) * 0.7;
    s.x += Math.cos(ang) * s.v; s.y += Math.sin(ang) * s.v; s.k++;
    const env = Math.pow(Math.sin(Math.PI * clamp(s.k / s.max, 0, 1)), 0.8);
    const r = s.r * (0.75 + 0.25 * Math.sin(s.k * 0.03 + s.seed)) * (0.5 + 0.5 * env);
    ctx.globalAlpha = s.a * env;
    ctx.drawImage(sprite(s.col), s.x - r, s.y - r, r * 2, r * 2);
    return s.k < s.max && s.x > -160 && s.x < W + 160 && s.y > -160 && s.y < H + 160;
  }
  function loop(now) {
    window.requestAnimationFrame(loop);
    if (document.hidden || now - lastFrame < 33) return;
    lastFrame = now; T += 0.033; frameN++;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'destination-out'; // slow dissolve; a stronger pass clears 8-bit residue
    ctx.fillStyle = 'rgba(0,0,0,' + (frameN % 40 === 0 ? 0.06 : 0.005) + ')';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    if (now - lastSpawn > (reduce ? 2600 : 1000) && strokes.length < (reduce ? 4 : 11)) { spawn(); lastSpawn = now; }
    strokes = strokes.filter(s => stepStroke(s) && stepStroke(s));
    ctx.globalAlpha = 1;
  }
  window.addEventListener('resize', resize);
  new MutationObserver(() => { ctx.clearRect(0, 0, W, H); strokes = []; })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  resize();
  window.requestAnimationFrame(loop);
}());
