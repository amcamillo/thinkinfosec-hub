(function (root) {
  const L = root.HubLib;

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function link(href, text, cls) {
    const a = el('a', cls, text);
    const safe = L.safeUrl(href);
    if (safe) {
      a.href = safe;
      if (L.isExternal(safe)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; a.classList.add('ext'); }
    }
    return a;
  }
  function titleNode(item) { return L.safeUrl(item.url) ? link(item.url, item.title) : el('span', null, item.title); }
  function setEmpty(node, message) { node.replaceChildren(el('p', 'empty', message)); }
  function list(node, items, make, empty) {
    if (!items.length) return typeof empty === 'function' ? empty(node) : setEmpty(node, empty);
    node.replaceChildren(...items.map(make));
  }

  function chips(container, options, onPick) {
    container.replaceChildren();
    options.forEach((o, i) => {
      const b = el('button', 'chip', o.count == null ? o.label : o.label + ' (' + o.count + ')');
      b.type = 'button';
      b.dataset.value = o.value;
      b.setAttribute('aria-pressed', String(i === 0));
      b.addEventListener('click', () => {
        container.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        onPick(o.value);
      });
      container.append(b);
    });
  }
  function activeChip(container) {
    const on = container.querySelector('.chip[aria-pressed="true"]');
    return on ? on.dataset.value : 'all';
  }

  function pic(src, cls, lazy) {
    const img = el('img', cls);
    img.alt = ''; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
    if (lazy) img.loading = 'lazy';
    img.addEventListener('error', () => img.remove());
    img.src = src;
    return img;
  }

  const SVG = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) { const n = document.createElementNS(SVG, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; }
  function traceSvg(spec, w, h, marker) {
    const svg = svgEl('svg', { viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' });
    const path = svgEl('path', { d: spec.d, fill: 'none', stroke: spec.color, 'stroke-width': w > 300 ? '2.6' : '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'trace-line' });
    path.style.setProperty('--trace-glow', spec.glow);
    svg.append(path);
    if (marker) svg.append(svgEl('circle', { cx: spec.peak.x, cy: spec.peak.y, r: '5', fill: '#fff', class: 'trace-line' }));
    return svg;
  }
  function orbLayer(spec) {
    const layer = el('div', 'trace-orbs');
    spec.orbs.forEach(o => {
      const i = el('i', 'trace-orb');
      i.style.left = o.x + '%'; i.style.top = o.y + '%'; i.style.width = o.size + '%'; i.style.setProperty('--c', o.color);
      layer.append(i);
    });
    return layer;
  }
  function traceBanner(item) {
    const spec = L.traceSpec(item, 640, 240);
    const box = el('div', 'trace-banner');
    box.setAttribute('aria-hidden', 'true');
    const mark = el('span', 'trace-mark');
    mark.append('Think', el('b', null, 'InfoSec'), ' Signal');
    const readout = el('span', 'trace-readout');
    readout.append(el('b', 'lane-' + spec.cat, L.LANES[spec.cat].toUpperCase()), ' · ' + L.channel(1) + ' · ' + L.utcTime(item.ts));
    box.append(orbLayer(spec), traceSvg(spec, 640, 240, true), mark, readout);
    if (item.source) box.append(el('span', 'trace-src', item.source));
    return box;
  }
  function listening(node, message) {
    const box = el('div', 'listening');
    const svg = svgEl('svg', { viewBox: '0 0 120 22', 'aria-hidden': 'true', focusable: 'false' });
    svg.append(svgEl('path', { d: 'M0 11 C20 11 30 11 46 11 C52 11 54 6 60 6 C66 6 68 16 74 16 C80 16 84 11 92 11 C104 11 112 11 120 11', fill: 'none', stroke: '#00BFCF', 'stroke-width': '2', 'stroke-linecap': 'round' }));
    box.append(svg, el('span', 'mono', 'LISTENING FOR SIGNAL… ' + message));
    node.replaceChildren(box);
  }
  function traceThumb(item, cls) {
    const spec = L.traceSpec(item, 200, 60);
    const box = el('div', 'trace-thumb ' + (cls || ''));
    box.setAttribute('aria-hidden', 'true');
    box.append(orbLayer(spec), traceSvg(spec, 200, 60, false));
    return box;
  }

  function pill(node, p) {
    node.dataset.state = p.state;
    node.querySelector('#pillText').textContent = p.detail ? p.label + ' · ' + p.detail : p.label;
  }

  function headlineRow(item, index, now, opts) {
    const li = el('li');
    const body = el('div');
    const h = el('h4', 'headline');
    h.append(titleNode(item));
    body.append(el('span', 'kicker lane-' + item.cat, L.LANES[item.cat]), h, el('span', 'meta', item.source + ' · ' + L.timeAgo(item.ts, now)));
    li.append(el('span', 'num', L.channel(index + 1)), body);
    if (opts && opts.thumb) {
      li.classList.add('has-thumb');
      li.append(item.image ? pic(item.image, 'row-thumb', true) : traceThumb(item, 'row-thumb'));
    }
    return li;
  }

  function card(item, kicker, accent, opts) {
    const c = el('article', 'card' + (accent === 'mag' ? ' accent-mag' : ''));
    const thumb = L.safeUrl(item.thumb);
    if (thumb) c.append(pic(thumb, 'thumb', true));
    else if (opts && opts.trace) c.append(traceThumb({ title: item.title, cat: accent === 'mag' ? 'ai' : 'cyber' }, 'thumb'));
    const h = el('h4');
    h.append(titleNode(item));
    c.append(el('span', 'kicker', kicker), h);
    if (item.summary) c.append(el('p', null, item.summary));
    const meta = [];
    if (item.ts) meta.push(L.formatDate(item.ts));
    if (item.minutes) meta.push(item.minutes + ' min read');
    if (meta.length) c.append(el('span', 'meta', meta.join(' · ')));
    return c;
  }

  function lead(node, item, now) {
    if (!item) return listening(node, 'headlines appear here when Signal is reachable');
    const art = el('div', 'lead-art');
    art.setAttribute('aria-hidden', 'true');
    art.append(traceBanner(item));
    if (item.image) art.append(pic(item.image, 'lead-img', false));
    const h = el('h3');
    h.append(titleNode(item));
    node.replaceChildren(art, el('span', 'kicker lane-' + item.cat, L.LANES[item.cat] + ' · lead story'), h,
      el('p', null, L.clip(item.summary, 260)), el('span', 'meta', item.source + ' · ' + L.timeAgo(item.ts, now)));
  }

  function outcomes(node, tools) {
    node.replaceChildren(...tools.filter(t => t.featured).map(t => {
      const band = el('section', 'band');
      band.setAttribute('aria-label', 'Outcomes');
      const mid = el('div');
      mid.append(el('h3', null, t.title), el('p', 'meta', t.summary));
      if (t.points.length) {
        const ul = el('ul');
        t.points.forEach(p => ul.append(el('li', null, p)));
        mid.append(ul);
      }
      band.append(el('span', 'kicker', 'Outcomes'), mid, link(t.url, 'Open ' + t.title, 'band-cta'));
      return band;
    }));
  }

  root.HubRender = { el, link, titleNode, setEmpty, list, chips, activeChip, headlineRow, pill, card, lead, outcomes, traceBanner, traceThumb, listening };
})(window);
