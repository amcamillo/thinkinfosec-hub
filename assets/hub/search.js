(function (root) {
  const L = root.HubLib, R = root.HubRender;
  function init(o) {
    function run() {
      const q = o.input.value.trim();
      if (!q) { o.results.hidden = true; o.results.replaceChildren(); o.status.textContent = ''; return; }
      const hits = L.search(o.entries(), q);
      o.status.textContent = hits.length === 1 ? '1 result' : hits.length + ' results';
      const ol = R.el('ol', 'results-list');
      hits.slice(0, 40).forEach(h => {
        const li = R.el('li');
        const t = R.el('h4', 'headline');
        t.append(R.titleNode(h));
        li.append(R.el('span', 'kicker', h.label), t);
        ol.append(li);
      });
      o.results.replaceChildren(ol);
      o.results.hidden = false;
    }
    o.form.addEventListener('submit', e => e.preventDefault());
    o.input.addEventListener('input', run);
    o.input.addEventListener('keydown', e => { if (e.key === 'Escape') { o.input.value = ''; run(); } });
    return { run };
  }
  root.HubSearch = { init };
})(window);
