/* Research article shell: theme toggle (shared with the hub via localStorage 'hub-theme')
   and the reading-progress wave nav, built from the .toc links. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme */
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-theme-set]'));
  function applyTheme(theme, save) {
    root.setAttribute('data-theme', theme);
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.themeSet === theme)); });
    if (save) { try { localStorage.setItem('hub-theme', theme); } catch (e) {} }
  }
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
  buttons.forEach(function (b) { b.addEventListener('click', function () { applyTheme(b.dataset.themeSet, true); }); });

  /* Nav */
  var nav = document.querySelector('.toc');
  var inner = nav && nav.querySelector('.toc-inner');
  if (!inner) return;
  var links = Array.prototype.slice.call(inner.querySelectorAll('a'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if (!links.length || sections.some(function (s) { return !s; })) return;
  var n = links.length;

  var GRAD = '<stop offset="0" stop-color="#00BFCF"/><stop offset="1" stop-color="#FF2D78"/>';
  var PULSE_GRAD = '<stop offset="0" stop-color="#00BFCF" stop-opacity="0"/><stop offset=".5" stop-color="#00BFCF"/><stop offset="1" stop-color="#FF2D78" stop-opacity="0"/>';
  var H_WAVE = 'M0 12 C40 10 80 14 120 12 S200 10 240 12 S320 14 360 12 S440 10 480 12 S560 14 600 12 S680 10 720 12 S800 14 840 12';
  var H_PULSE = 'M0 12 C30 12 60 12 80 12 C92 12 96 4 108 4 C120 4 120 20 132 20 C144 20 148 8 160 12 C180 12 210 12 240 12';
  var V_PULSE = 'M12 0 C12 30 12 60 12 80 C12 92 4 96 4 108 C4 120 20 120 20 132 C20 144 8 148 12 160 C12 180 12 210 12 240';

  // Compact bar: "● 3/8  The models  ▾" with a horizontal progress wave.
  var bar = document.createElement('div');
  bar.className = 'toc-bar frost';
  bar.innerHTML =
    '<button type="button" class="toc-now" aria-expanded="false" aria-controls="tocRail">' +
      '<span class="toc-count"></span><span class="toc-title"></span><span class="toc-chev" aria-hidden="true">&#9662;</span></button>' +
    '<div class="wave-h" aria-hidden="true">' +
      '<svg class="w-base" viewBox="0 0 840 22" preserveAspectRatio="none" focusable="false"><path d="' + H_WAVE + '"/></svg>' +
      '<svg class="w-fill" viewBox="0 0 840 22" preserveAspectRatio="none" focusable="false"><defs><linearGradient id="rwFillH" x1="0" x2="1">' + GRAD + '</linearGradient></defs><path stroke="url(#rwFillH)" d="' + H_WAVE + '"/></svg>' +
      '<svg class="w-pulse" viewBox="0 0 240 22" preserveAspectRatio="none" focusable="false"><defs><linearGradient id="rwPulseH" x1="0" x2="1">' + PULSE_GRAD + '</linearGradient></defs><path stroke="url(#rwPulseH)" d="' + H_PULSE + '"/></svg>' +
    '</div>';
  var nowBtn = bar.querySelector('.toc-now');
  var countEl = bar.querySelector('.toc-count');
  var titleEl = bar.querySelector('.toc-title');
  var hWrap = bar.querySelector('.wave-h');
  var hFill = bar.querySelector('.w-fill');
  var hPulse = bar.querySelector('.w-pulse');

  // Vertical wave list (dropdown on small screens, margin rail on wide ones).
  var rail = document.createElement('div');
  rail.className = 'toc-rail frost';
  rail.id = 'tocRail';
  rail.innerHTML =
    '<div class="wave-v" aria-hidden="true">' +
      '<svg class="w-base" focusable="false"><path/></svg>' +
      '<svg class="w-fill" focusable="false"><defs><linearGradient id="rwFillV" x1="0" y1="0" x2="0" y2="1">' + GRAD + '</linearGradient></defs><path stroke="url(#rwFillV)"/></svg>' +
      '<svg class="w-pulse" viewBox="0 0 24 240" preserveAspectRatio="none" focusable="false"><defs><linearGradient id="rwPulseV" x1="0" y1="0" x2="0" y2="1">' + PULSE_GRAD + '</linearGradient></defs><path stroke="url(#rwPulseV)" d="' + V_PULSE + '"/></svg>' +
    '</div>';
  var vWrap = rail.querySelector('.wave-v');
  var vBase = vWrap.querySelector('.w-base');
  var vFill = vWrap.querySelector('.w-fill');
  var vPulse = vWrap.querySelector('.w-pulse');

  nav.insertBefore(bar, inner);
  nav.insertBefore(rail, inner);
  rail.appendChild(inner);
  nav.classList.add('toc-js');

  function vPath(h) {
    var d = 'M12 0', y = 0, left = true;
    while (y < h) { var x = left ? 9 : 15; d += ' C' + x + ' ' + (y + 13) + ' ' + x + ' ' + (y + 27) + ' 12 ' + (y + 40); y += 40; left = !left; }
    return d;
  }
  var centres = [], railH = 0;
  function layout() {
    railH = vWrap.clientHeight;
    if (!railH) return;
    [vBase, vFill].forEach(function (svg) {
      svg.setAttribute('viewBox', '0 0 24 ' + railH);
      svg.setAttribute('height', railH);
      svg.querySelector('path').setAttribute('d', vPath(railH));
    });
    var top = vWrap.getBoundingClientRect().top;
    centres = links.map(function (a) { var r = a.getBoundingClientRect(); return r.top - top + r.height / 2; });
  }

  var active = -1;
  function update() {
    var ref = window.innerHeight * 0.35;
    var i = 0;
    for (var k = 0; k < n; k++) { if (sections[k].getBoundingClientRect().top <= ref) i = k; }
    var r = sections[i].getBoundingClientRect();
    var frac = Math.min(1, Math.max(0, (ref - r.top) / Math.max(1, r.height)));
    if (i === 0 && r.top > ref) frac = 0;

    if (i !== active) {
      active = i;
      links.forEach(function (l, k) { l.classList.toggle('on', k === i); if (k === i) l.setAttribute('aria-current', 'location'); else l.removeAttribute('aria-current'); });
      countEl.textContent = (i + 1) + '/' + n;
      titleEl.textContent = links[i].textContent;
    }

    // Horizontal: overall position through the sections, equal segments.
    var w = hWrap.clientWidth;
    if (w) {
      var x = ((i + frac) / n) * w;
      hFill.style.clipPath = 'inset(0 ' + Math.max(0, w - x) + 'px 0 0)';
      hPulse.style.transform = 'translateX(' + Math.round(x - 60) + 'px)';
    }
    // Vertical: from the active link towards the next one.
    if (railH && centres.length) {
      var y0 = centres[i], y1 = i + 1 < n ? centres[i + 1] : railH;
      var y = y0 + (y1 - y0) * frac;
      vFill.style.clipPath = 'inset(0 0 ' + Math.max(0, railH - y) + 'px 0)';
      vPulse.style.transform = 'translateY(' + Math.round(y - 60) + 'px)';
    }
  }

  var queued = false;
  function onScroll() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; update(); }); }
  function relayout() { layout(); update(); }

  function setOpen(open) {
    nav.classList.toggle('open', open);
    nowBtn.setAttribute('aria-expanded', String(open));
    if (open) relayout();
  }
  nowBtn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
  links.forEach(function (l) { l.addEventListener('click', function () { setOpen(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); nowBtn.focus(); } });
  document.addEventListener('click', function (e) { if (nav.classList.contains('open') && !nav.contains(e.target)) setOpen(false); });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  window.addEventListener('load', relayout);
  if (reduce) { hPulse.style.transition = 'none'; vPulse.style.transition = 'none'; }
  relayout();
})();
