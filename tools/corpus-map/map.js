(function () {
  const data = window.THINKINFOSEC_CATALOG;
  const tax = data.taxonomy;
  const allItems = data.corpus.items;
  const domainById = Object.fromEntries(tax.techDomains.map((d) => [d.id, d]));
  const STROKE = { people: "#d97a9a", process: "#6bb8bf", technology: "#7a8ba0", core: "#9aa8b8" };
  const FILL = { people: "#fbe7ee", process: "#e4f6f7", technology: "#e7edf3", core: "#ffffff", item: "#ffffff" };
  const SIZE = {
    core: { w: 148, h: 104 },
    pillar: { w: 156, h: 52 },
    theme: { w: 168, h: 52 },
    domain: { w: 140, h: 48 },
    item: { w: 176, h: 50 }
  };
  const GAP_X = 12;
  const GAP_Y = 22;
  const PAD = 28;
  const LOGO = "../../assets/thinkinfosec-logo.png";
  const MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 380;

  const state = {
    search: "",
    kinds: new Set(),
    origins: new Set(),
    people: new Set(),
    processes: new Set(),
    techCats: new Set(),
    expanded: new Set(["people", "process", "technology"]),
    selected: { type: "core" },
    filtersOpen: false
  };

  const prevPos = new Map();
  let anim = null;

  const svg = document.getElementById("map");
  const wrap = document.getElementById("canvasWrap");
  const detailEl = document.getElementById("detail");
  const filterToggle = document.getElementById("filterToggle");

  function hubHref(item) {
    return item.origin === "hub" ? "../../" + item.link : item.link;
  }

  function itemVisible(item) {
    const q = state.search.trim().toLowerCase();
    if (q) {
      const blob = [item.title, item.description, item.kind, item.origin, item.note].join(" ").toLowerCase();
      if (!blob.includes(q)) return false;
    }
    if (state.kinds.size && !state.kinds.has(item.kind)) return false;
    if (state.origins.size && !state.origins.has(item.origin)) return false;
    if (state.people.size && !(item.people || []).some((id) => state.people.has(id))) return false;
    if (state.processes.size && !(item.processes || []).some((id) => state.processes.has(id))) return false;
    if (state.techCats.size) {
      const cats = (item.tech || []).map((id) => domainById[id] && domainById[id].category);
      if (!cats.some((c) => state.techCats.has(c))) return false;
    }
    return true;
  }

  function visibleItems() {
    return allItems.filter(itemVisible);
  }

  function uniqueItems(list) {
    const seen = new Set();
    return list.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  function peopleFor(items, id) {
    return items.filter((i) => (i.people || []).includes(id));
  }
  function processesFor(items, id) {
    return items.filter((i) => (i.processes || []).includes(id));
  }
  function techFor(items, domainId) {
    return items.filter((i) => (i.tech || []).includes(domainId));
  }

  function activeFilterCount() {
    return state.kinds.size + state.origins.size + state.people.size + state.processes.size + state.techCats.size + (state.search.trim() ? 1 : 0);
  }

  function chip(group, value, label, cls) {
    const pressed = state[group].has(value);
    return `<button type="button" class="chip ${cls || ""}" data-group="${group}" data-value="${value}" aria-pressed="${pressed}">${label}</button>`;
  }

  function bindChips(root) {
    root.querySelectorAll("button.chip[data-group]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = btn.getAttribute("data-group");
        const value = btn.getAttribute("data-value");
        if (state[group].has(value)) state[group].delete(value);
        else state[group].add(value);
        renderFilters();
        draw();
      });
    });
  }

  function updateFilterToggle() {
    const n = activeFilterCount();
    filterToggle.textContent = n ? `Filters (${n})` : "Filters";
    filterToggle.setAttribute("aria-expanded", state.filtersOpen ? "true" : "false");
    filterToggle.classList.toggle("has-filters", n > 0);
    document.getElementById("filters").classList.toggle("open", state.filtersOpen);
  }

  function renderFilters() {
    const usedCats = [...new Set(allItems.flatMap((i) => (i.tech || []).map((id) => domainById[id]?.category).filter(Boolean)))];
    document.getElementById("filter-kind").innerHTML = ["tool", "research", "learn", "writing"].map((k) => chip("kinds", k, k, "")).join("");
    document.getElementById("filter-origin").innerHTML = ["hub", "elsewhere", "source", "youtube", "medium"].map((k) => chip("origins", k, k, "")).join("");
    document.getElementById("filter-people").innerHTML = tax.people.map((t) => chip("people", t.id, t.label, "people")).join("");
    document.getElementById("filter-processes").innerHTML = tax.processes.map((t) => chip("processes", t.id, t.label, "process")).join("");
    document.getElementById("filter-tech").innerHTML = usedCats.map((c) => chip("techCats", c, c, "tech")).join("");
    const q = document.getElementById("q");
    q.value = state.search;
    updateFilterToggle();
    bindChips(document.getElementById("filters"));
  }

  function node(partial) {
    const size = SIZE[partial.type];
    return { children: [], w: size.w, h: size.h, ...partial };
  }

  function buildTree(items) {
    const root = node({
      id: "core",
      type: "core",
      label: "ThinkInfoSec",
      colorKey: "core",
      count: items.length
    });

    const pillars = [
      { id: "people", label: "People", colorKey: "people", list: items.filter((i) => (i.people || []).length) },
      { id: "process", label: "Processes", colorKey: "process", list: items.filter((i) => (i.processes || []).length) },
      { id: "technology", label: "Technology", colorKey: "technology", list: items.filter((i) => (i.tech || []).length) }
    ];

    pillars.forEach((p) => {
      const pillar = node({
        id: p.id,
        type: "pillar",
        pillar: p.id,
        label: p.label,
        colorKey: p.colorKey,
        count: p.list.length,
        items: p.list
      });
      root.children.push(pillar);
      if (!state.expanded.has(p.id)) return;

      if (p.id === "people") {
        tax.people.forEach((t) => {
          const list = peopleFor(items, t.id);
          if (!list.length) return;
          const theme = node({
            id: "people:" + t.id,
            type: "theme",
            pillar: "people",
            label: t.label,
            colorKey: p.colorKey,
            count: list.length,
            items: list
          });
          pillar.children.push(theme);
          if (state.expanded.has(theme.id)) addItemChildren(theme, list, p.colorKey);
        });
      }

      if (p.id === "process") {
        tax.processes.forEach((t) => {
          const list = processesFor(items, t.id);
          if (!list.length) return;
          const theme = node({
            id: "process:" + t.id,
            type: "theme",
            pillar: "process",
            label: t.label,
            colorKey: p.colorKey,
            count: list.length,
            items: list
          });
          pillar.children.push(theme);
          if (state.expanded.has(theme.id)) addItemChildren(theme, list, p.colorKey);
        });
      }

      if (p.id === "technology") {
        tax.techCategories.forEach((cat) => {
          const domains = tax.techDomains.filter((d) => d.category === cat).sort((a, b) => a.sort - b.sort);
          const list = items.filter((i) => (i.tech || []).some((id) => domainById[id]?.category === cat));
          if (!list.length) return;
          const theme = node({
            id: "techcat:" + cat,
            type: "theme",
            pillar: "technology",
            label: cat,
            colorKey: p.colorKey,
            count: list.length,
            items: list
          });
          pillar.children.push(theme);
          if (!state.expanded.has(theme.id)) return;
          domains.forEach((d) => {
            const dlist = techFor(items, d.id);
            if (!dlist.length) return;
            const domain = node({
              id: "tech:" + d.id,
              type: "domain",
              pillar: "technology",
              label: d.acronym,
              colorKey: p.colorKey,
              count: dlist.length,
              items: dlist
            });
            theme.children.push(domain);
            if (state.expanded.has(domain.id)) addItemChildren(domain, dlist, p.colorKey);
          });
        });
      }
    });

    return root;
  }

  function addItemChildren(parent, list, colorKey) {
    uniqueItems(list).forEach((item) => {
      parent.children.push(node({
        id: parent.id + ":item:" + item.id,
        type: "item",
        label: item.title,
        item,
        colorKey,
        count: 0
      }));
    });
  }

  function colCount(maxW, tileW) {
    return Math.max(1, Math.floor((maxW + GAP_X) / (tileW + GAP_X)));
  }

  function layout(n, x, y, maxW) {
    n.x = x + maxW / 2;
    n.y = y + n.h / 2;

    if (!n.children.length) {
      n.blockH = n.h;
      return n.blockH;
    }

    const tileW = Math.max(...n.children.map((c) => c.w));
    const cols = Math.min(n.children.length, colCount(maxW, tileW));
    const colW = cols === 1 ? maxW : (maxW - GAP_X * (cols - 1)) / cols;

    n.children.forEach((c) => layout(c, 0, 0, colW));

    let cursorY = y + n.h + GAP_Y;
    for (let i = 0; i < n.children.length; i += cols) {
      const row = n.children.slice(i, i + cols);
      const rowH = Math.max(...row.map((c) => c.blockH));
      const rowWidth = row.length * colW + GAP_X * (row.length - 1);
      const rowLeft = x + (maxW - rowWidth) / 2;
      row.forEach((c, j) => {
        const ox = rowLeft + j * (colW + GAP_X);
        walk(c, (node) => {
          node.x += ox;
          node.y += cursorY;
        });
      });
      cursorY += rowH + GAP_Y;
    }

    n.blockH = cursorY - GAP_Y - y;
    return n.blockH;
  }

  function walk(n, fn) {
    fn(n);
    n.children.forEach((c) => walk(c, fn));
  }

  function flatten(n, nodes, links) {
    nodes.push(n);
    n.children.forEach((c) => {
      links.push({ from: n, to: c });
      flatten(c, nodes, links);
    });
  }

  function wrapLabel(text, max) {
    if (text.length <= max) return [text];
    const words = text.split(/\s+/);
    const lines = [];
    let cur = "";
    words.forEach((w) => {
      const next = cur ? cur + " " + w : w;
      if (next.length > max && cur) {
        lines.push(cur);
        cur = w;
      } else cur = next;
    });
    if (cur) lines.push(cur);
    return lines.slice(0, 3);
  }

  function elbow(a, b) {
    const x1 = a.x;
    const y1 = a.y + a.h / 2;
    const x2 = b.x;
    const y2 = b.y - b.h / 2;
    const mid = (y1 + y2) / 2;
    return `M ${x1} ${y1} L ${x1} ${mid} L ${x2} ${mid} L ${x2} ${y2}`;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function paint(nodes, links, display, vbW, vbH) {
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const linkMarkup = links.map((l, i) => {
      const a = { x: display[l.from.id].x, y: display[l.from.id].y, h: l.from.h };
      const b = { x: display[l.to.id].x, y: display[l.to.id].y, h: l.to.h };
      return `<path class="link" data-i="${i}" d="${elbow(a, b)}" fill="none" stroke="${STROKE[l.to.colorKey]}" stroke-opacity="0.45" stroke-width="1.5"/>`;
    }).join("");

    const nodeMarkup = nodes.map((n) => {
      const p = display[n.id];
      const hw = n.w / 2;
      const hh = n.h / 2;
      const fill = n.type === "item" || n.type === "core" ? FILL.item : FILL[n.colorKey];
      const stroke = STROKE[n.colorKey];
      const shape = `<rect x="${-hw}" y="${-hh}" width="${n.w}" height="${n.h}" rx="10" ry="10" fill="${fill}" stroke="${stroke}" stroke-width="1.25"/>`;
      let inner = shape;
      if (n.type === "core") {
        inner = `${shape}
          <image href="${LOGO}" x="-28" y="-42" width="56" height="56" preserveAspectRatio="xMidYMid meet"/>
          <text text-anchor="middle" y="34" fill="#172B4D" font-size="12" font-weight="700">ThinkInfoSec</text>`;
      } else {
        const lines = wrapLabel(n.label, n.type === "item" ? 18 : 16);
        const text = lines.map((line, i) => {
          const y = (i - (lines.length - 1) / 2) * 12 - (n.count ? 5 : 0);
          return `<text text-anchor="middle" y="${y}" fill="#172B4D" font-size="11" font-weight="600">${escapeXml(line)}</text>`;
        }).join("");
        const count = n.count ? `<text text-anchor="middle" y="${hh - 10}" fill="#6B778C" font-size="10">${n.count}</text>` : "";
        inner = `${shape}${text}${count}`;
      }
      const opacity = p.opacity;
      return `<g class="node" data-id="${escapeXml(n.id)}" transform="translate(${p.x},${p.y})" opacity="${opacity}" style="cursor:pointer">${inner}</g>`;
    }).join("");

    svg.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);
    svg.setAttribute("width", String(vbW));
    svg.setAttribute("height", String(vbH));
    svg.innerHTML = `${linkMarkup}${nodeMarkup}`;

    svg.querySelectorAll("g.node").forEach((g) => {
      g.addEventListener("click", (e) => {
        e.stopPropagation();
        onNodeClick(g.getAttribute("data-id"), nodes);
      });
    });
  }

  function draw() {
    const items = visibleItems();
    const root = buildTree(items);
    const canvasW = Math.max(320, wrap.clientWidth || 800);
    const maxW = canvasW - PAD * 2;
    layout(root, PAD, PAD, maxW);
    const nodes = [];
    const links = [];
    flatten(root, nodes, links);
    const maxY = Math.max(...nodes.map((n) => n.y + n.h / 2));
    const vbW = canvasW;
    const vbH = Math.max(maxY + PAD, wrap.clientHeight || 480);

    const from = {};
    const to = {};
    nodes.forEach((n) => {
      to[n.id] = { x: n.x, y: n.y, opacity: 1 };
      const prev = prevPos.get(n.id);
      from[n.id] = prev ? { x: prev.x, y: prev.y, opacity: 1 } : { x: n.x, y: n.y - 18, opacity: 0 };
    });

    if (anim) cancelAnimationFrame(anim.frame);
    const start = performance.now();

    function frame(now) {
      const t = MOTION ? Math.min(1, (now - start) / MOTION) : 1;
      const u = easeOut(t);
      const display = {};
      nodes.forEach((n) => {
        const a = from[n.id];
        const b = to[n.id];
        display[n.id] = {
          x: a.x + (b.x - a.x) * u,
          y: a.y + (b.y - a.y) * u,
          opacity: a.opacity + (b.opacity - a.opacity) * u
        };
      });
      paint(nodes, links, display, vbW, vbH);
      if (t < 1) {
        anim = { frame: requestAnimationFrame(frame) };
      } else {
        anim = null;
        nodes.forEach((n) => prevPos.set(n.id, { x: n.x, y: n.y }));
        [...prevPos.keys()].forEach((id) => {
          if (!to[id]) prevPos.delete(id);
        });
      }
    }

    frame(performance.now());
    renderDetail(items);
  }

  function escapeXml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function onNodeClick(id, nodes) {
    const found = nodes.find((n) => n.id === id);
    if (!found) return;
    state.selected = found;
    if (found.type === "pillar" || found.type === "theme" || found.type === "domain") {
      if (state.expanded.has(id)) state.expanded.delete(id);
      else state.expanded.add(id);
      draw();
      return;
    }
    renderDetail(visibleItems());
  }

  function renderDetail(items) {
    const sel = state.selected;
    let title = "ThinkInfoSec";
    let meta = `${items.length} artefacts in the current filter. Expand a tile to open the layer beneath.`;
    let body = "";
    let list = items;

    if (sel && sel.type === "item" && sel.item) {
      const it = sel.item;
      title = it.title;
      meta = `${it.kind} · ${it.origin}${it.note ? " · " + it.note : ""}`;
      const extra = it.origin === "hub" ? "" : ` target="_blank" rel="noopener noreferrer"`;
      body = `<p>${escapeXml(it.description || "")}</p><p><a class="btn" href="${escapeXml(hubHref(it))}"${extra}>Open</a></p>`;
      list = [it];
    } else if (sel && sel.items) {
      title = sel.label;
      meta = `${sel.count} artefact${sel.count === 1 ? "" : "s"} on this branch`;
      list = sel.items;
    }

    const groups = {};
    list.forEach((it) => {
      groups[it.kind] = groups[it.kind] || [];
      if (!groups[it.kind].some((x) => x.id === it.id)) groups[it.kind].push(it);
    });

    const listHtml = Object.keys(groups).map((kind) => {
      const rows = groups[kind].map((it) => {
        const extra = it.origin === "hub" ? "" : ` target="_blank" rel="noopener noreferrer"`;
        return `<div><a href="${escapeXml(hubHref(it))}"${extra}>${escapeXml(it.title)}</a></div>`;
      }).join("");
      return `<details open><summary>${escapeXml(kind)} (${groups[kind].length})</summary>${rows}</details>`;
    }).join("");

    detailEl.innerHTML = `<h2>${escapeXml(title)}</h2><p class="meta">${escapeXml(meta)}</p>${body}<div class="list" id="list">${listHtml || "<p class='meta'>Nothing matches these tags.</p>"}</div>`;
  }

  filterToggle.addEventListener("click", () => {
    state.filtersOpen = !state.filtersOpen;
    updateFilterToggle();
  });

  document.getElementById("q").addEventListener("input", (e) => {
    state.search = e.target.value;
    updateFilterToggle();
    draw();
  });
  document.getElementById("clear").addEventListener("click", () => {
    state.kinds.clear();
    state.origins.clear();
    state.people.clear();
    state.processes.clear();
    state.techCats.clear();
    state.search = "";
    renderFilters();
    draw();
  });

  window.addEventListener("resize", () => draw());
  renderFilters();
  draw();
})();
