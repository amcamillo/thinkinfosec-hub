/* Research library: search and faceted filters over Research/index.json, labelled from catalog/taxonomy.json.
   Within a facet, choices widen (OR); across facets they narrow (AND). State lives in the URL query. */
(function () {
  'use strict';
  var FEED = 'index.json';
  var TAXONOMY = '../catalog/taxonomy.json';
  var FACETS = [
    { key: 'theme', label: 'Theme', field: 'themes' },
    { key: 'tech', label: 'Technology', field: 'techCategories' },
    { key: 'framework', label: 'Framework', field: 'frameworks' },
    { key: 'region', label: 'Region', field: 'regions' }
  ];
  var SORTS = ['newest', 'oldest', 'short'];
  var MONTHS =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var $ = function (id) { return document.getElementById(id); };
  var grid = $('results'), facetsEl = $('facets'), countEl = $('libCount'), emptyEl = $('libEmpty');
  var q = $('q'), sortEl = $('sort'), clearBtn = $('libClear');

  var items = [], labels = {}, state = { q: '', sort: 'newest', sel: {} };
  FACETS.forEach(function (f) { state.sel[f.key] = []; });

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function fmtDate(iso) {
    var p = String(iso).split('-');
    return p.length === 3 ? (+p[2]) + ' ' + MONTHS[+p[1] - 1] + ' ' + p[0] : iso;
  }
  function safeHref(slug) { return /^[a-z0-9-]+$/.test(slug) ? slug + '/' : '#'; }
  function safeImg(url, slug) {
    // Feed covers are absolute site URLs; serve them relative so the page works on any host.
    var m = /\/Research\/([a-z0-9-]+)\/([a-z0-9._/-]+\.(?:webp|png|jpe?g|svg))$/.exec(url || '');
    return m && m[1] === slug ? m[1] + '/' + m[2] : null;
  }
  function label(kind, id) { return (labels[kind] && labels[kind][id]) || String(id); }

  /* URL state */
  function readUrl() {
    var p = new URLSearchParams(location.search);
    state.q = p.get('q') || '';
    state.sort = SORTS.indexOf(p.get('sort')) !== -1 ? p.get('sort') : 'newest';
    // Drop ids no briefing carries, so a typo in a shared link cannot hide every result behind an invisible filter.
    FACETS.forEach(function (f) {
      state.sel[f.key] = (p.get(f.key) || '').split(',').filter(function (v, i, a) {
        return v && a.indexOf(v) === i && items.some(function (it) { return it[f.field].indexOf(v) !== -1; });
      });
    });
  }
  function writeUrl() {
    var p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.sort !== 'newest') p.set('sort', state.sort);
    FACETS.forEach(function (f) { if (state.sel[f.key].length) p.set(f.key, state.sel[f.key].join(',')); });
    var s = p.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
  }

  /* Filtering */
  function haystack(it) {
    return [it.title, it.headline, it.summary].concat(it.tags, it.vendors,
      it.themes.map(function (x) { return label('themes', x); }),
      it.frameworks.map(function (x) { return label('frameworks', x); }), it._techNames).join(' ').toLowerCase();
  }
  function matches(it, skipKey) {
    if (state.q) {
      var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < words.length; i++) if (it._hay.indexOf(words[i]) === -1) return false;
    }
    for (var k = 0; k < FACETS.length; k++) {
      var f = FACETS[k], sel = state.sel[f.key];
      if (f.key === skipKey || !sel.length) continue;
      if (!sel.some(function (v) { return it[f.field].indexOf(v) !== -1; })) return false;
    }
    return true;
  }
  function sorted(list) {
    var by = {
      newest: function (a, b) { return a.published < b.published ? 1 : a.published > b.published ? -1 : 0; },
      oldest: function (a, b) { return a.published > b.published ? 1 : a.published < b.published ? -1 : 0; },
      short: function (a, b) { return a.reading_minutes - b.reading_minutes; }
    };
    return list.slice().sort(by[state.sort] || by.newest);
  }

  /* Rendering */
  function renderFacets() {
    facetsEl.textContent = '';
    FACETS.forEach(function (f) {
      // Counts reflect every other active filter, so a chip shows what clicking it would give.
      var pool = items.filter(function (it) { return matches(it, f.key); });
      var counts = {};
      items.forEach(function (it) { it[f.field].forEach(function (v) { if (!(v in counts)) counts[v] = 0; }); });
      pool.forEach(function (it) { it[f.field].forEach(function (v) { counts[v] += 1; }); });
      var sel = state.sel[f.key];
      var ids = Object.keys(counts).sort(function (a, b) { return (sel.indexOf(b) !== -1) - (sel.indexOf(a) !== -1) || counts[b] - counts[a] || label(f.field, a).localeCompare(label(f.field, b)); });
      if (!ids.length) return;
      var group = el('div', 'facet');
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', f.label);
      group.appendChild(el('span', 'facet-label', f.label));
      ids.forEach(function (id) {
        var on = state.sel[f.key].indexOf(id) !== -1;
        var b = el('button', 'chip' + (on ? ' on' : ''));
        b.type = 'button';
        b.dataset.facet = f.key;
        b.dataset.id = id;
        b.setAttribute('aria-pressed', String(on));
        b.disabled = !on && counts[id] === 0;
        b.appendChild(el('span', null, label(f.field, id)));
        b.appendChild(el('span', 'chip-n', String(counts[id])));
        b.addEventListener('click', function () {
          var s = state.sel[f.key], i = s.indexOf(id);
          if (i === -1) s.push(id); else s.splice(i, 1);
          update();
          // The chips are rebuilt, so put keyboard focus back on the one just pressed.
          var again = facetsEl.querySelector('[data-facet="' + f.key + '"][data-id="' + CSS.escape(id) + '"]');
          if (again) again.focus();
        });
        group.appendChild(b);
      });
      facetsEl.appendChild(group);
    });
  }

  function card(it) {
    var a = el('a', 'lib-card');
    a.href = safeHref(it.slug);
    var art = el('div', 'lib-art');
    art.setAttribute('aria-hidden', 'true');
    var img = safeImg(it.cover, it.slug);
    if (img) {
      var im = el('img');
      im.src = img; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
      art.appendChild(im);
    } else {
      art.classList.add('lib-art-trace');
      art.appendChild(el('span', 'lib-art-mark', label('themes', it.themes[0])));
    }
    a.appendChild(art);
    var body = el('div', 'lib-body');
    body.appendChild(el('p', 'kicker', it.themes.map(function (x) { return label('themes', x); }).join(' · ')));
    body.appendChild(el('h2', 'lib-title', it.title));
    body.appendChild(el('p', 'lib-summary', it.summary));
    var meta = el('p', 'lib-meta');
    meta.appendChild(el('span', null, fmtDate(it.published)));
    meta.appendChild(el('span', null, it.reading_minutes + ' min'));
    meta.appendChild(el('span', null, it.regions.map(function (x) { return label('regions', x); }).join(', ')));
    if (it.caveats && it.caveats.ai_assisted) meta.appendChild(el('span', 'lib-flag', 'AI-assisted'));
    body.appendChild(meta);
    if (it.tags.length) {
      var tags = el('ul', 'lib-tags');
      it.tags.slice(0, 5).forEach(function (t) { tags.appendChild(el('li', null, t)); });
      body.appendChild(tags);
    }
    a.appendChild(body);
    return a;
  }

  function update() {
    writeUrl();
    var list = sorted(items.filter(function (it) { return matches(it); }));
    grid.textContent = '';
    list.forEach(function (it) { grid.appendChild(card(it)); });
    var active = state.q || FACETS.some(function (f) { return state.sel[f.key].length; });
    countEl.textContent = active ? list.length + ' of ' + items.length + ' briefings' : items.length + ' briefings';
    emptyEl.hidden = list.length !== 0;
    clearBtn.hidden = !active;
    renderFacets();
  }

  function reset() {
    state.q = ''; q.value = '';
    FACETS.forEach(function (f) { state.sel[f.key] = []; });
    update();
    q.focus();
  }

  function init(feed, tax) {
    ['themes', 'frameworks', 'regions'].forEach(function (k) {
      labels[k] = {};
      (tax[k] || []).forEach(function (x) { labels[k][x.id] = x.label; });
    });
    var catOf = {}, nameOf = {};
    labels.techCategories = {};
    (tax.techDomains || []).forEach(function (d) { catOf[d.id] = d.category; nameOf[d.id] = d.name; labels.techCategories[d.category] = d.category; });

    items = (feed.items || []).map(function (it) {
      it.tags = it.tags || []; it.vendors = it.vendors || []; it.frameworks = it.frameworks || [];
      it.techCategories = it.tech.map(function (t) { return catOf[t]; }).filter(function (c, i, a) { return c && a.indexOf(c) === i; });
      it._techNames = it.tech.map(function (t) { return nameOf[t] || ''; }).concat(it.techCategories);
      it._hay = haystack(it);
      return it;
    });

    $('statCount').textContent = items.length;
    $('statThemes').textContent = Object.keys(items.reduce(function (s, it) { it.themes.forEach(function (t) { s[t] = 1; }); return s; }, {})).length;
    var latest = items.reduce(function (m, it) { return it.published > m ? it.published : m; }, '');
    $('statLatest').textContent = latest ? fmtDate(latest).toUpperCase() : '—';

    readUrl();
    q.value = state.q;
    sortEl.value = state.sort;
    var t;
    q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { state.q = q.value.trim(); update(); }, 120); });
    $('libForm').addEventListener('submit', function (e) { e.preventDefault(); });
    sortEl.addEventListener('change', function () { state.sort = sortEl.value; update(); });
    clearBtn.addEventListener('click', reset);
    $('libReset').addEventListener('click', reset);
    update();
  }

  function fail(msg, err) {
    if (window.console) console.error('research library:', err);
    countEl.textContent = msg;
    emptyEl.hidden = true;
  }
  Promise.all([FEED, TAXONOMY].map(function (u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }); }))
    .then(function (r) {
      try { init(r[0], r[1]); } catch (err) { fail('The research list could not be displayed.', err); }
    }, function (err) { fail('The research list could not be loaded.', err); });
})();
