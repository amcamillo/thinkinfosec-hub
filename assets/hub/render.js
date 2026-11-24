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
  function list(node, items, make, emptyMessage) {
    if (!items.length) return setEmpty(node, emptyMessage);
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

  function headlineRow(item, index, now) {
    const li = el('li');
    const body = el('div');
    const h = el('h4', 'headline');
    h.append(titleNode(item));
    body.append(el('span', 'kicker lane-' + item.cat, L.LANES[item.cat]), h, el('span', 'meta', item.source + ' · ' + L.timeAgo(item.ts, now)));
    li.append(el('span', 'num', String(index + 1).padStart(2, '0')), body);
    return li;
  }

  function card(item, kicker, accent) {
    const c = el('article', 'card' + (accent === 'mag' ? ' accent-mag' : ''));
    const thumb = L.safeUrl(item.thumb);
    if (thumb) {
      const img = el('img', 'thumb');
      img.src = thumb; img.alt = ''; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
      c.append(img);
    }
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
    if (!item) return setEmpty(node, 'Headlines appear here when Signal is reachable.');
    const art = el('div', 'lead-art');
    art.setAttribute('aria-hidden', 'true');
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

  root.HubRender = { el, link, titleNode, setEmpty, list, chips, activeChip, headlineRow, card, lead, outcomes };
})(window);
