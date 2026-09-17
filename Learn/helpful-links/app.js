(function () {
    const LIST_MOUNTS = {
        intro: "introMount",
        deploy: "deployMount",
        demos: "demosMount",
        howto: "howtoMount",
        tools: "toolsMount",
        more: "moreMount"
    };

    let activePillar = "all";
    let query = "";

    function coverageClass(kind) {
        if (kind === "native") return "coverage-native";
        if (kind === "hybrid") return "coverage-hybrid";
        return "coverage-partner";
    }

    function cardHTML(item) {
        const extra = item.url.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<article class="card">
            <div class="type">${item.domain || item.type || "Resource"}</div>
            <h3>${item.title}</h3>
            <p>${item.blurb}</p>
            <a class="btn" href="${item.url}"${extra}><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> Open</a>
        </article>`;
    }

    function matchesQuery(item) {
        if (!query) return true;
        return [item.title, item.domain, item.type, item.blurb].join(" ").toLowerCase().includes(query);
    }

    function filteredDatasheets() {
        return DATASHEETS.filter((item) => {
            const pillarOk = activePillar === "all" || item.pillar === activePillar;
            return pillarOk && matchesQuery(item);
        });
    }

    function renderChips() {
        const chips = document.getElementById("chips");
        const items = [{ id: "all", label: "All pillars" }, ...PILLARS];
        chips.innerHTML = items.map((pillar) =>
            `<button type="button" class="chip" data-pillar="${pillar.id}" aria-pressed="${pillar.id === activePillar}">${pillar.label}</button>`
        ).join("");
        chips.querySelectorAll(".chip").forEach((btn) => {
            btn.addEventListener("click", () => {
                activePillar = btn.getAttribute("data-pillar");
                renderChips();
                renderDatasheets();
                updateCounts();
            });
        });
    }

    function renderDatasheets() {
        const mount = document.getElementById("datasheetMount");
        const pillars = PILLARS.filter((pillar) => activePillar === "all" || pillar.id === activePillar);
        const html = pillars.map((pillar) => {
            const items = DATASHEETS.filter((item) => item.pillar === pillar.id && matchesQuery(item));
            if (!items.length) return "";
            return `<div class="pillar-block" id="pillar-${pillar.id}">
                <h3>${pillar.label} <span class="coverage ${coverageClass(pillar.coverage)}">${pillar.coverage}</span></h3>
                <p class="pillar-note">${pillar.note}</p>
                <div class="grid">${items.map(cardHTML).join("")}</div>
            </div>`;
        }).join("");
        mount.innerHTML = html || `<p class="empty">No datasheets match that filter.</p>`;
    }

    function renderList(id, items) {
        const filtered = items.filter(matchesQuery);
        const node = document.getElementById(id);
        node.innerHTML = filtered.length
            ? filtered.map(cardHTML).join("")
            : `<p class="empty">No items match that search.</p>`;
        return filtered.length;
    }

    function updateCounts() {
        const counts = {
            datasheets: filteredDatasheets().length,
            intro: OTHER.intro.filter(matchesQuery).length,
            deploy: OTHER.deploy.filter(matchesQuery).length,
            demos: OTHER.demos.filter(matchesQuery).length,
            howto: OTHER.howto.filter(matchesQuery).length,
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
        renderDatasheets();
        Object.entries(LIST_MOUNTS).forEach(([key, mountId]) => {
            renderList(mountId, OTHER[key]);
        });
        updateCounts();
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

    renderChips();
    renderAll();
    observeSections();
    syncStickyOffset();
    window.addEventListener("resize", syncStickyOffset);
})();
