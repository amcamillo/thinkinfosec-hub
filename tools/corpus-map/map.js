(function () {
  const data = window.THINKINFOSEC_CATALOG;
  const tax = data.taxonomy;
  const allItems = data.corpus.items;
  const domainById = Object.fromEntries(tax.techDomains.map((d) => [d.id, d]));

  const COLORS = { people: "#FF2D78", process: "#00BFCF", technology: "#0D1F3C", core: "#0D1F3C" };

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
    last: null
  };

  const svg = document.getElementById("map");
  const wrap = document.getElementById("canvasWrap");
  const filtersEl = document.getElementById("filters");
  const detailEl = document.getElementById("detail");

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

  function peopleFor(items, id) {
    return items.filter((i) => (i.people || []).includes(id));
  }
  function processesFor(items, id) {
    return items.filter((i) => (i.processes || []).includes(id));
  }
  function techFor(items, domainId) {
    return items.filter((i) => (i.tech || []).includes(domainId));
  }

  function chip(group, value, label, cls) {
    const pressed = state[group].has(value);
    return `<button type="button" class="chip ${cls || ""}" data-group="${group}" data-value="${value}" aria-pressed="${pressed}">${label}</button>`;
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
    filtersEl.querySelector("#q").addEventListener("input", (e) => {
      state.search = e.target.value;
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

  function fan(cx, cy, r, start, end, n, i) {
    const a = n === 1 ? (start + end) / 2 : start + ((end - start) * i) / Math.max(n - 1, 1);
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, a };
  }

  function buildNodes(items) {
    const W = wrap.clientWidth || 900;
    const H = wrap.clientHeight || 640;
    const cx = W / 2;
    const cy = H / 2;
    const nodes = [];
    const links = [];

    nodes.push({
      id: "core",
      type: "core",
      label: "ThinkInfoSec",
      sub: "Andre Camillo",
      x: cx,
      y: cy,
      r: 52,
      color: COLORS.core,
      count: items.length
    });

    const pillars = [
      { id: "people", label: "People", start: Math.PI * 0.72, end: Math.PI * 1.28, r: 170, color: COLORS.people },
      { id: "process", label: "Processes", start: -Math.PI * 0.55, end: -Math.PI * 0.08, r: 170, color: COLORS.process },
      { id: "technology", label: "Technology", start: Math.PI * 0.08, end: Math.PI * 0.55, r: 170, color: COLORS.tech }
    ];

    pillars.forEach((p) => {
      const mid = (p.start + p.end) / 2;
      const pos = { x: cx + Math.cos(mid) * p.r, y: cy + Math.sin(mid) * p.r, a: mid };
      let childItems = items;
      if (p.id === "people") childItems = items.filter((i) => (i.people || []).length);
      if (p.id === "process") childItems = items.filter((i) => (i.processes || []).length);
      if (p.id === "technology") childItems = items.filter((i) => (i.tech || []).length);
      nodes.push({
        id: p.id,
        type: "pillar",
        pillar: p.id,
        label: p.label,
        x: pos.x,
        y: pos.y,
        r: 36,
        color: p.color,
        count: childItems.length,
        start: p.start,
        end: p.end
      });
      links.push({ from: "core", to: p.id, color: p.color });

      if (!state.expanded.has(p.id)) return;

      if (p.id === "people") {
        const themes = tax.people.map((t) => ({ ...t, list: peopleFor(items, t.id) })).filter((t) => t.list.length);
        themes.forEach((t, i) => {
          const tp = fan(pos.x, pos.y, 130, p.start - 0.15, p.end + 0.15, themes.length, i);
          const nid = "people:" + t.id;
          nodes.push({ id: nid, type: "theme", pillar: "people", themeId: t.id, label: t.label, x: tp.x, y: tp.y, r: 26, color: p.color, count: t.list.length, items: t.list });
          links.push({ from: p.id, to: nid, color: p.color });
          if (state.expanded.has(nid)) addArtefacts(nodes, links, tp, t.list, nid, p.color, tp.a);
        });
      }

      if (p.id === "process") {
        const themes = tax.processes.map((t) => ({ ...t, list: processesFor(items, t.id) })).filter((t) => t.list.length);
        themes.forEach((t, i) => {
          const tp = fan(pos.x, pos.y, 140, p.start - 0.2, p.end + 0.25, themes.length, i);
          const nid = "process:" + t.id;
          nodes.push({ id: nid, type: "theme", pillar: "process", themeId: t.id, label: t.label, x: tp.x, y: tp.y, r: 24, color: p.color, count: t.list.length, items: t.list });
          links.push({ from: p.id, to: nid, color: p.color });
          if (state.expanded.has(nid)) addArtefacts(nodes, links, tp, t.list, nid, p.color, tp.a);
        });
      }

      if (p.id === "technology") {
        const cats = tax.techCategories.map((cat) => {
          const domains = tax.techDomains.filter((d) => d.category === cat).sort((a, b) => a.sort - b.sort);
          const list = items.filter((i) => (i.tech || []).some((id) => domainById[id]?.category === cat));
          return { cat, domains, list };
        }).filter((c) => c.list.length);
        cats.forEach((c, i) => {
          const tp = fan(pos.x, pos.y, 150, p.start - 0.15, p.end + 0.35, cats.length, i);
          const nid = "techcat:" + c.cat;
          nodes.push({ id: nid, type: "theme", pillar: "technology", themeId: c.cat, label: c.cat, x: tp.x, y: tp.y, r: 24, color: p.color, count: c.list.length, items: c.list, domains: c.domains });
          links.push({ from: p.id, to: nid, color: p.color });
          if (state.expanded.has(nid)) {
            const taggedDomains = c.domains.filter((d) => techFor(items, d.id).length);
            taggedDomains.forEach((d, di) => {
              const dp = fan(tp.x, tp.y, 110, tp.a - 0.45, tp.a + 0.45, taggedDomains.length, di);
              const did = "tech:" + d.id;
              const dlist = techFor(items, d.id);
              nodes.push({ id: did, type: "domain", pillar: "technology", domainId: d.id, label: d.acronym, sub: d.name, x: dp.x, y: dp.y, r: 20, color: p.color, count: dlist.length, items: dlist });
              links.push({ from: nid, to: did, color: p.color });
              if (state.expanded.has(did)) addArtefacts(nodes, links, dp, dlist, did, p.color, dp.a);
            });
          }
        });
      }
    });

    return { nodes, links, cx, cy, W, H };
  }

  function addArtefacts(nodes, links, origin, list, parentId, color, baseAngle) {
    const unique = [];
    const seen = new Set();
    list.forEach((item) => {
      if (seen.has(item.id)) return;
      seen.add(item.id);
      unique.push(item);
    });
    unique.forEach((item, i) => {
      const ap = fan(origin.x, origin.y, 95, baseAngle - 0.55, baseAngle + 0.55, unique.length, i);
      const aid = parentId + ":item:" + item.id;
      nodes.push({
        id: aid,
        type: "item",
        label: item.title,
        item,
        x: ap.x,
        y: ap.y,
        r: 16,
        color,
        count: 0
      });
      links.push({ from: parentId, to: aid, color });
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

  function draw() {
    const items = visibleItems();
    const graph = buildNodes(items);
    const byId = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));

    const k = state.pan.k;
    const tx = state.pan.x;
    const ty = state.pan.y;

    const linkMarkup = graph.links.map((l) => {
      const a = byId[l.from];
      const b = byId[l.to];
      if (!a || !b) return "";
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${l.color}" stroke-opacity="0.35" stroke-width="2"/>`;
    }).join("");

    const nodeMarkup = graph.nodes.map((n) => {
      const lines = wrapLabel(n.label, n.type === "item" ? 16 : 14);
      const text = lines.map((line, i) => {
        const y = (i - (lines.length - 1) / 2) * 11 + (n.type === "core" ? 8 : 0);
        return `<text text-anchor="middle" y="${y}" fill="${n.type === "core" || n.pillar === "technology" && n.type !== "item" ? "#fff" : n.type === "item" ? "#172B4D" : "#0D1F3C"}" font-size="${n.type === "core" ? 11 : 10}" font-weight="650">${escapeXml(line)}</text>`;
      }).join("");
      const count = n.count ? `<text text-anchor="middle" y="${n.r - 8}" fill="${n.type === "item" ? "#6B778C" : n.color === COLORS.tech || n.type === "core" ? "rgba(255,255,255,.85)" : "#172B4D"}" font-size="9">${n.count}</text>` : "";
      let inner = `<circle r="${n.r}" fill="${n.type === "item" ? "#fff" : n.color}" stroke="${n.color}" stroke-width="${n.type === "item" ? 2 : 0}"/>`;
      if (n.type === "core") {
        inner = `
          <defs>
            <clipPath id="coreClip"><circle r="46"/></clipPath>
          </defs>
          <circle r="${n.r}" fill="${n.color}"/>
          <image href="../../assets/your-photo.png" x="-46" y="-52" width="92" height="92" clip-path="url(#coreClip)" preserveAspectRatio="xMidYMid slice"/>
          <circle r="46" fill="none" stroke="#00BFCF" stroke-width="3"/>
        `;
      }
      return `<g class="node" data-id="${escapeXml(n.id)}" data-type="${n.type}" transform="translate(${n.x},${n.y})" style="cursor:pointer">
        ${inner}${n.type === "core" ? `<text text-anchor="middle" y="68" fill="#0D1F3C" font-size="12" font-weight="700">ThinkInfoSec</text>` : text}${n.type === "core" ? "" : count}
      </g>`;
    }).join("");

    svg.setAttribute("viewBox", `0 0 ${graph.W} ${graph.H}`);
    svg.innerHTML = `<g id="viewport" transform="translate(${tx},${ty}) scale(${k})">${linkMarkup}${nodeMarkup}</g>`;

    svg.querySelectorAll("g.node").forEach((g) => {
      g.addEventListener("click", (e) => {
        e.stopPropagation();
        onNodeClick(g.getAttribute("data-id"), graph.nodes);
      });
    });

    renderDetail(items, graph.nodes);
  }

  function escapeXml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function onNodeClick(id, nodes) {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    state.selected = node;
    if (node.type === "pillar" || node.type === "theme" || node.type === "domain") {
      if (state.expanded.has(id)) state.expanded.delete(id);
      else state.expanded.add(id);
      draw();
      return;
    }
    if (node.type === "item" && node.item) {
      renderDetail(visibleItems(), nodes);
    }
  }

  function renderDetail(items, nodes) {
    const sel = state.selected;
    let title = "Andre Camillo";
    let meta = `${items.length} artefacts in the current filter. Click People, Processes, or a theme bubble to expand.`;
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
    } else if (sel && sel.type === "pillar") {
      title = sel.label;
      meta = `${sel.count} tagged artefacts`;
      if (sel.id === "people") list = items.filter((i) => (i.people || []).length);
      if (sel.id === "process") list = items.filter((i) => (i.processes || []).length);
      if (sel.id === "technology") list = items.filter((i) => (i.tech || []).length);
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

    detailEl.innerHTML = `<h2>${escapeXml(title)}</h2><p class="meta">${escapeXml(meta)}</p>${body}<div class="list">${listHtml || "<p class='meta'>Nothing matches these tags.</p>"}</div>`;
  }

  function setupPanZoom() {
    wrap.addEventListener("wheel", (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      state.pan.k = Math.min(2.4, Math.max(0.45, state.pan.k * factor));
      draw();
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

  window.addEventListener("resize", () => draw());
  renderFilters();
  setupPanZoom();
  draw();
})();
