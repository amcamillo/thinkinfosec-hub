(function () {
  const data = window.THINKINFOSEC_CATALOG;
  const tax = data.taxonomy;
  const allItems = data.corpus.items;
  const domainById = Object.fromEntries(tax.techDomains.map((d) => [d.id, d]));
  const COLORS = { people: "#FF2D78", process: "#00BFCF", technology: "#0D1F3C", core: "#0D1F3C" };
  const SIZE = {
    core: { w: 140, h: 100 },
    pillar: { w: 150, h: 50 },
    theme: { w: 158, h: 48 },
    domain: { w: 128, h: 44 },
    item: { w: 170, h: 46 }
  };
  const GAP_X = 18;
  const ROW_H = 112;
  const TOP = 36;
  const LOGO = "../../assets/thinkinfosec-logo.png";

  const state = {
    search: "",
    kinds: new Set(),
    origins: new Set(),
    people: new Set(),
    processes: new Set(),
    techCats: new Set(),
    expanded: new Set(["people", "process", "technology"]),
    selected: { type: "core" },
    pan: { x: 0, y: 0, k: 1 },
    dragging: false,
    last: null,
    filtersOpen: false
  };

  const svg = document.getElementById("map");
  const wrap = document.getElementById("canvasWrap");
  const filtersEl = document.getElementById("filters");
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

  function updateFilterToggle() {
    const n = activeFilterCount();
    filterToggle.textContent = n ? `Filters (${n})` : "Filters";
    filterToggle.setAttribute("aria-expanded", state.filtersOpen ? "true" : "false");
    filterToggle.classList.toggle("has-filters", n > 0);
    filtersEl.classList.toggle("open", state.filtersOpen);
  }

  function renderFilters() {
    const usedCats = [...new Set(allItems.flatMap((i) => (i.tech || []).map((id) => domainById[id]?.category).filter(Boolean)))];
    filtersEl.innerHTML = `
      <input type="search" id="q" placeholder="Search artefacts" value="${state.search.replace(/"/g, "&quot;")}" aria-label="Search artefacts">
      ${["tool", "research", "learn", "writing"].map((k) => chip("kinds", k, k, "")).join("")}
      ${["hub", "elsewhere", "source", "youtube", "medium"].map((k) => chip("origins", k, k, "")).join("")}
      ${tax.people.map((t) => chip("people", t.id, t.label, "people")).join("")}
      ${tax.processes.map((t) => chip("processes", t.id, t.label, "process")).join("")}
      ${usedCats.map((c) => chip("techCats", c, c, "tech")).join("")}
      <button type="button" class="chip" id="clear">Clear filters</button>
      <div class="legend">
        <span><i class="swatch" style="background:var(--people)"></i>People</span>
        <span><i class="swatch" style="background:var(--process)"></i>Processes</span>
        <span><i class="swatch" style="background:var(--tech)"></i>Technology</span>
      </div>
    `;
    updateFilterToggle();
    filtersEl.querySelector("#q").addEventListener("input", (e) => {
      state.search = e.target.value;
      updateFilterToggle();
      draw();
    });
    filtersEl.querySelector("#clear").addEventListener("click", () => {
      state.kinds.clear();
      state.origins.clear();
      state.people.clear();
      state.processes.clear();
      state.techCats.clear();
      state.search = "";
      renderFilters();
      draw();
    });
    filtersEl.querySelectorAll("button.chip[data-group]").forEach((btn) => {
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

  function node(partial) {
    const size = SIZE[partial.type];
    return { children: [], w: size.w, h: size.h, ...partial };
  }

  function buildTree(items) {
    const root = node({
      id: "core",
      type: "core",
      label: "ThinkInfoSec",
      color: COLORS.core,
      count: items.length
    });

    const pillars = [
      { id: "people", label: "People", color: COLORS.people, list: items.filter((i) => (i.people || []).length) },
      { id: "process", label: "Processes", color: COLORS.process, list: items.filter((i) => (i.processes || []).length) },
      { id: "technology", label: "Technology", color: COLORS.tech, list: items.filter((i) => (i.tech || []).length) }
    ];

    pillars.forEach((p) => {
      const pillar = node({
        id: p.id,
        type: "pillar",
        pillar: p.id,
        label: p.label,
        color: p.color,
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
            color: p.color,
            count: list.length,
            items: list
          });
          pillar.children.push(theme);
          if (state.expanded.has(theme.id)) addItemChildren(theme, list, p.color);
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
            color: p.color,
            count: list.length,
            items: list
          });
          pillar.children.push(theme);
          if (state.expanded.has(theme.id)) addItemChildren(theme, list, p.color);
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
            color: p.color,
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
              sub: d.name,
              color: p.color,
              count: dlist.length,
              items: dlist
            });
            theme.children.push(domain);
            if (state.expanded.has(domain.id)) addItemChildren(domain, dlist, p.color);
          });
        });
      }
    });

    return root;
  }

  function addItemChildren(parent, list, color) {
    uniqueItems(list).forEach((item) => {
      parent.children.push(node({
        id: parent.id + ":item:" + item.id,
        type: "item",
        label: item.title,
        item,
        color,
        count: 0
      }));
    });
  }

  function measure(n) {
    if (!n.children.length) {
      n.subtreeW = n.w;
      return;
    }
    n.children.forEach(measure);
    const kids = n.children.reduce((s, c) => s + c.subtreeW, 0) + GAP_X * (n.children.length - 1);
    n.subtreeW = Math.max(n.w, kids);
  }

  function childrenSpan(n) {
    return n.children.reduce((s, c) => s + c.subtreeW, 0) + GAP_X * (n.children.length - 1);
  }

  function place(n, left, depth) {
    n.y = TOP + depth * ROW_H;
    if (!n.children.length) {
      n.x = left + n.subtreeW / 2;
      return;
    }
    let childLeft = left + (n.subtreeW - childrenSpan(n)) / 2;
    n.children.forEach((c) => {
      place(c, childLeft, depth + 1);
      childLeft += c.subtreeW + GAP_X;
    });
    n.x = (n.children[0].x + n.children[n.children.length - 1].x) / 2;
  }

  function flatten(n, nodes, links) {
    nodes.push(n);
    n.children.forEach((c) => {
      links.push({ from: n, to: c, color: c.color || n.color });
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

  function textFill(n) {
    if (n.type === "item") return "#172B4D";
    if (n.type === "core") return "#0D1F3C";
    if (n.pillar === "technology" || n.type === "pillar" && n.id === "technology") return "#fff";
    if (n.pillar === "process" || n.id === "process") return "#0D1F3C";
    if (n.pillar === "people" || n.id === "people") return "#fff";
    return "#0D1F3C";
  }

  function draw() {
    const items = visibleItems();
    const root = buildTree(items);
    measure(root);
    place(root, 0, 0);
    const nodes = [];
    const links = [];
    flatten(root, nodes, links);

    const pad = 48;
    const minX = Math.min(...nodes.map((n) => n.x - n.w / 2));
    const maxX = Math.max(...nodes.map((n) => n.x + n.w / 2));
    const minY = Math.min(...nodes.map((n) => n.y - n.h / 2));
    const maxY = Math.max(...nodes.map((n) => n.y + n.h / 2));
    const vbW = Math.max(maxX - minX + pad * 2, wrap.clientWidth || 800);
    const vbH = Math.max(maxY - minY + pad * 2, wrap.clientHeight || 600);
    const ox = pad - minX + (vbW - (maxX - minX + pad * 2)) / 2;
    nodes.forEach((n) => {
      n.x += ox;
      n.y += pad - minY;
    });

    const linkMarkup = links.map((l) =>
      `<path d="${elbow(l.from, l.to)}" fill="none" stroke="${l.color}" stroke-opacity="0.4" stroke-width="2"/>`
    ).join("");

    const nodeMarkup = nodes.map((n) => {
      const hw = n.w / 2;
      const hh = n.h / 2;
      const rx = 10;
      const fill = n.type === "item" || n.type === "core" ? "#fff" : n.color;
      const stroke = n.color;
      const shape = `<rect x="${-hw}" y="${-hh}" width="${n.w}" height="${n.h}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
      let inner = shape;
      if (n.type === "core") {
        inner = `${shape}
          <image href="${LOGO}" x="${-28}" y="${-42}" width="56" height="56" preserveAspectRatio="xMidYMid meet"/>
          <text text-anchor="middle" y="32" fill="#0D1F3C" font-size="12" font-weight="700">ThinkInfoSec</text>`;
      } else {
        const lines = wrapLabel(n.label, n.type === "item" ? 18 : 16);
        const text = lines.map((line, i) => {
          const y = (i - (lines.length - 1) / 2) * 12 - (n.count ? 4 : 0);
          return `<text text-anchor="middle" y="${y}" fill="${textFill(n)}" font-size="11" font-weight="650">${escapeXml(line)}</text>`;
        }).join("");
        const count = n.count ? `<text text-anchor="middle" y="${hh - 10}" fill="${textFill(n)}" font-size="10" opacity="0.8">${n.count}</text>` : "";
        inner = `${shape}${text}${count}`;
      }
      return `<g class="node" data-id="${escapeXml(n.id)}" data-type="${n.type}" transform="translate(${n.x},${n.y})" style="cursor:pointer">${inner}</g>`;
    }).join("");

    svg.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);
    svg.innerHTML = `<g id="viewport" transform="translate(${state.pan.x},${state.pan.y}) scale(${state.pan.k})">${linkMarkup}${nodeMarkup}</g>`;

    svg.querySelectorAll("g.node").forEach((g) => {
      g.addEventListener("click", (e) => {
        e.stopPropagation();
        onNodeClick(g.getAttribute("data-id"), nodes);
      });
    });

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
    let meta = `${items.length} artefacts in the current filter. Expand a row to open the layer beneath.`;
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

  function setupPanZoom() {
    wrap.addEventListener("wheel", (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      state.pan.k = Math.min(2.4, Math.max(0.45, state.pan.k * factor));
      const vp = svg.querySelector("#viewport");
      if (vp) vp.setAttribute("transform", `translate(${state.pan.x},${state.pan.y}) scale(${state.pan.k})`);
    }, { passive: false });

    wrap.addEventListener("pointerdown", (e) => {
      if (e.target.closest("g.node")) return;
      state.dragging = true;
      wrap.classList.add("dragging");
      state.last = { x: e.clientX, y: e.clientY };
      wrap.setPointerCapture(e.pointerId);
    });
    wrap.addEventListener("pointermove", (e) => {
      if (!state.dragging || !state.last) return;
      state.pan.x += e.clientX - state.last.x;
      state.pan.y += e.clientY - state.last.y;
      state.last = { x: e.clientX, y: e.clientY };
      const vp = svg.querySelector("#viewport");
      if (vp) vp.setAttribute("transform", `translate(${state.pan.x},${state.pan.y}) scale(${state.pan.k})`);
    });
    wrap.addEventListener("pointerup", () => {
      state.dragging = false;
      state.last = null;
      wrap.classList.remove("dragging");
    });
  }

  filterToggle.addEventListener("click", () => {
    state.filtersOpen = !state.filtersOpen;
    updateFilterToggle();
  });

  window.addEventListener("resize", () => draw());
  renderFilters();
  setupPanZoom();
  draw();
})();
