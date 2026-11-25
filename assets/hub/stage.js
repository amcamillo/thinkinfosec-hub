/* Enter Signal: fade the hub out, crossfade into Signal in a full-screen stage, and back.
   create() is pure (DOM-like objects and timers are injected) so it can be unit-tested; init() wires the page. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HubStage = api;
  if (typeof document !== 'undefined' && typeof window !== 'undefined') api.init(document, window);
}(typeof self !== 'undefined' ? self : this, function () {
  function create(o) {
    const t = o.reduce ? { swap: 0, fade: 200, out: 200 } : { swap: 450, fade: 900, out: 500 };
    let open = false;
    function show() {
      if (open) return;
      open = true;
      if (!o.frame.getAttribute('src')) o.frame.setAttribute('src', o.src);
      o.doc.body.classList.add('leaving');
      o.wait(() => {
        if (!open) return;
        o.stage.hidden = false;
        o.next(() => { if (open) o.stage.classList.add('on'); });
        o.hub.forEach(h => h.setAttribute('inert', ''));
        o.back.focus();
        const fs = o.stage.requestFullscreen ? o.stage.requestFullscreen() : null;
        if (fs && fs.catch) fs.catch(() => {});
      }, t.swap);
    }
    function hide() {
      if (!open) return;
      open = false;
      o.stage.classList.remove('on');
      if (o.doc.fullscreenElement && o.doc.exitFullscreen) {
        const p = o.doc.exitFullscreen();
        if (p && p.catch) p.catch(() => {});
      }
      o.hub.forEach(h => h.removeAttribute('inert'));
      o.wait(() => { if (!open) { o.doc.body.classList.remove('leaving'); o.link.focus(); } }, t.out);
      o.wait(() => { if (!open) o.stage.hidden = true; }, t.fade);
    }
    return { show, hide, isOpen: () => open };
  }

  function init(doc, win) {
    const link = doc.getElementById('enterSignal');
    const stage = doc.getElementById('signalStage');
    if (!link || !stage) return null;
    // Signal only accepts being framed where location.ancestorOrigins proves the hub is its parent.
    // Without it (Firefox) the frame would be blank, so leave the button as a plain link to Signal.
    if (!win.location || !win.location.ancestorOrigins) return null;
    const s = create({
      doc, stage, link,
      frame: stage.querySelector('iframe'),
      back: doc.getElementById('stageBack'),
      hub: [doc.querySelector('.masthead'), doc.getElementById('main'), doc.querySelector('.site-foot')].filter(Boolean),
      src: link.href,
      reduce: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
      wait: (fn, ms) => win.setTimeout(fn, ms),
      next: fn => win.requestAnimationFrame(() => win.requestAnimationFrame(fn))
    });
    link.addEventListener('click', e => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let new-tab clicks through
      e.preventDefault();
      s.show();
    });
    doc.getElementById('stageBack').addEventListener('click', s.hide);
    doc.addEventListener('keydown', e => { if (e.key === 'Escape') s.hide(); });
    doc.addEventListener('fullscreenchange', () => { if (!doc.fullscreenElement) s.hide(); });
    return s;
  }

  return { create, init };
}));
