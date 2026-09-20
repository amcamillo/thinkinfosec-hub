(function () {
    const LIST_MOUNTS = {
        intro: "introMount",
        deploy: "deployMount",
        tools: "toolsMount",
        more: "moreMount"
    };
    const GROUPED = {
        demos: { mount: "demosMount", empty: "No public CrowdStrike demo for this pillar yet." },
        howto: { mount: "howtoMount", empty: "No public how-to for this pillar yet. Console steps often sit behind Falcon docs." }
    };

    let activePillar = "all";
    let query = "";
    let productFocus = "";
    let selectedModule = "";

    function coverageClass(kind) {
        if (kind === "native") return "coverage-native";
        if (kind === "hybrid") return "coverage-hybrid";
        return "coverage-partner";
    }

    function matchesProduct(item) {
        if (!productFocus) return true;
        return [item.title, item.domain].join(" ").toLowerCase().includes(productFocus.toLowerCase());
    }

    function matchesQuery(item) {
        if (!query) return true;
        return [item.title, item.domain, item.type, item.blurb, pillarLabel(item.pillar)]
            .join(" ")
            .toLowerCase()
            .includes(query);
    }

    function itemVisible(item) {
        if (!matchesQuery(item) || !matchesProduct(item)) return false;
        if (productFocus) return true;
        return activePillar === "all" || item.pillar === activePillar;
    }

    function cardHTML(item) {
        const extra = item.url.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : "";
        const focused = productFocus && matchesProduct(item);
        return `<article class="card${focused ? " is-focus" : ""}">
            <div class="type">${item.domain || item.type || "Resource"}</div>
            <h3>${item.title}</h3>
            <p>${item.blurb}</p>
            <a class="btn" href="${item.url}"${extra}><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> Open</a>
        </article>`;
    }

    function pillarLabel(id) {
        const pillar = PILLARS.find((item) => item.id === id);
        return pillar ? pillar.label : "";
    }

    function filteredDatasheets() {
        return DATASHEETS.filter(itemVisible);
    }

    function filteredGrouped(items) {
        return items.filter(itemVisible);
    }

    function visiblePillars(sourceItems) {
        if (productFocus) {
            const hits = PILLARS.filter((pillar) => sourceItems.some((item) => item.pillar === pillar.id && itemVisible(item)));
            if (hits.length) return hits;
            return PILLARS.filter((pillar) => pillar.id === activePillar);
        }
        return PILLARS.filter((pillar) => activePillar === "all" || pillar.id === activePillar);
    }

    function renderTiles() {
        const mount = document.getElementById("pillarTiles");
        const items = [{ id: "all", label: "All pillars", coverage: "native" }, ...PILLARS];
        mount.innerHTML = items.map((pillar) =>
            `<button type="button" class="pillar-tile" data-pillar="${pillar.id}" aria-pressed="${pillar.id === activePillar}">
                <span class="tile-label">${pillar.label}</span>
                ${pillar.id !== "all" ? `<span class="tile-cov coverage ${coverageClass(pillar.coverage)}">${pillar.coverage}</span>` : ""}
            </button>`
        ).join("");
        mount.querySelectorAll(".pillar-tile").forEach((btn) => {
            btn.addEventListener("click", () => {
                activePillar = btn.getAttribute("data-pillar");
                productFocus = "";
                selectedModule = "";
                renderTiles();
                renderCore();
                renderPillarSections();
                updateCounts();
            });
        });
    }

    function renderCore() {
        const svg = document.getElementById("coreStackSvg");
        if (!svg || typeof CoreStack === "undefined") return;
        CoreStack.render(svg, selectedModule);
    }

    function renderPillarBlock(prefix, pillar, items, emptyLine) {
        const matched = items.filter((item) => item.pillar === pillar.id && itemVisible(item));
        if (!matched.length && (query || productFocus)) return "";
        const body = matched.length
            ? `<div class="grid">${matched.map(cardHTML).join("")}</div>`
            : `<p class="empty">${emptyLine}</p>`;
        return `<div class="pillar-block" id="${prefix}-${pillar.id}">
            <h3>${pillar.label} <span class="coverage ${coverageClass(pillar.coverage)}">${pillar.coverage}</span></h3>
            <p class="pillar-note">${pillar.note}</p>
            ${body}
        </div>`;
    }

    function renderDatasheets() {
        const mount = document.getElementById("datasheetMount");
        const html = visiblePillars(DATASHEETS).map((pillar) => {
            const items = DATASHEETS.filter((item) => item.pillar === pillar.id && itemVisible(item));
            if (!items.length) return "";
            return `<div class="pillar-block" id="datasheet-${pillar.id}">
                <h3>${pillar.label} <span class="coverage ${coverageClass(pillar.coverage)}">${pillar.coverage}</span></h3>
                <p class="pillar-note">${pillar.note}</p>
                <div class="grid">${items.map(cardHTML).join("")}</div>
            </div>`;
        }).join("");
        mount.innerHTML = html || `<p class="empty">No datasheets match that filter.</p>`;
    }

    function renderGrouped(key) {
        const { mount, empty } = GROUPED[key];
        const html = visiblePillars(OTHER[key])
            .map((pillar) => renderPillarBlock(key, pillar, OTHER[key], empty))
            .join("");
        document.getElementById(mount).innerHTML = html || `<p class="empty">No items match that filter.</p>`;
    }

    function renderList(id, items) {
        const filtered = items.filter(matchesQuery);
        const node = document.getElementById(id);
        node.innerHTML = filtered.length
            ? filtered.map(cardHTML).join("")
            : `<p class="empty">No items match that search.</p>`;
        return filtered.length;
    }

    function renderPillarSections() {
        renderDatasheets();
        Object.keys(GROUPED).forEach(renderGrouped);
    }

    function updateCounts() {
        const counts = {
            datasheets: filteredDatasheets().length,
            intro: OTHER.intro.filter(matchesQuery).length,
            deploy: OTHER.deploy.filter(matchesQuery).length,
            demos: filteredGrouped(OTHER.demos).length,
            howto: filteredGrouped(OTHER.howto).length,
            tools: OTHER.tools.filter(matchesQuery).length,
            more: OTHER.more.filter(matchesQuery).length
        };
        Object.entries(counts).forEach(([id, count]) => {
            document.querySelectorAll(`[data-count-for="${id}"]`).forEach((el) => {
                el.textContent = String(count);
            });
            const section = document.getElementById(id);
            if (section) section.classList.toggle("is-empty", Boolean(query) && count === 0);
        });
    }

    function renderAll() {
        renderTiles();
        renderCore();
        renderPillarSections();
        Object.entries(LIST_MOUNTS).forEach(([key, mountId]) => {
            renderList(mountId, OTHER[key]);
        });
        updateCounts();
    }

    function selectModule(id) {
        const mapped = CoreStack.map[id];
        if (!mapped) return;
        selectedModule = id;
        activePillar = mapped.pillar;
        productFocus = mapped.match || "";
        const details = document.getElementById("coreStack");
        if (details) details.open = true;
        renderTiles();
        renderCore();
        renderPillarSections();
        updateCounts();
        document.getElementById("datasheets").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function setActiveNav(id) {
        document.querySelectorAll(".section-nav-link").forEach((link) => {
            const on = link.getAttribute("data-section") === id;
            link.classList.toggle("is-active", on);
            if (on) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        });
    }

    function observeSections() {
        const sections = document.querySelectorAll(".cs-section");
        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible) setActiveNav(visible.target.id);
        }, { rootMargin: "-20% 0px -60% 0px", threshold: [0.15, 0.35, 0.6] });
        sections.forEach((section) => observer.observe(section));
    }

    function syncStickyOffset() {
        const sticky = document.getElementById("csSticky");
        if (!sticky) return;
        document.documentElement.style.setProperty("--sticky-offset", `${sticky.offsetHeight + 16}px`);
    }

    document.getElementById("search").addEventListener("input", (event) => {
        query = event.target.value.trim().toLowerCase();
        renderAll();
    });

    const details = document.getElementById("coreStack");
    if (details) {
        details.addEventListener("toggle", () => {
            if (details.open) renderCore();
            syncStickyOffset();
        });
    }

    CoreStack.bind(document.getElementById("coreStackSvg"), selectModule);

    renderAll();
    observeSections();
    syncStickyOffset();
    window.addEventListener("resize", syncStickyOffset);
})();
