/* Source: tools/diagram-builder/index.html — TEMPLATES id falcon-core.
   Update this copy if that template changes. */
const CORE_STACK = {
    name: "Falcon Core Stack",
    noFlowArrows: true,
    canvas: { w: 1440, h: 613 },
    layout: { tracks: [{ w: 1400, rows: [["endpoints", "identity", "cloud", "data", "aisec", "exposure", "secops"], ["pipeline"], ["siem-bar"], ["services"]] }] },
    zones: [
        { id: "endpoints", label: "Endpoint", x: 20, y: 15, w: 191, h: 350, color: "rgba(0,191,207,0.06)", bc: "#00BFCF" },
        { id: "identity", label: "Identity", x: 221, y: 15, w: 191, h: 350, color: "rgba(0,191,207,0.08)", bc: "#00BFCF" },
        { id: "cloud", label: "Cloud & SaaS", x: 422, y: 15, w: 191, h: 350, color: "rgba(124,58,237,0.06)", bc: "#7C3AED" },
        { id: "data", label: "Data Security", x: 623, y: 15, w: 191, h: 350, color: "rgba(255,45,120,0.06)", bc: "#FF2D78" },
        { id: "aisec", label: "AI Security", x: 824, y: 15, w: 191, h: 350, color: "rgba(124,58,237,0.08)", bc: "#7C3AED" },
        { id: "exposure", label: "Exposure Mgmt", x: 1025, y: 15, w: 191, h: 350, color: "rgba(255,139,0,0.06)", bc: "#FF8B00" },
        { id: "secops", label: "Security Operations", x: 1226, y: 15, w: 194, h: 350, color: "rgba(23,43,77,0.05)", bc: "#0D1F3C" },
        { id: "pipeline", label: "Telemetry Pipeline", x: 20, y: 373, w: 1400, h: 68, color: "rgba(0,191,207,0.05)", bc: "#00BFCF", dir: "h" },
        { id: "siem-bar", label: "NG-SIEM", x: 20, y: 449, w: 1400, h: 48, color: "rgba(23,43,77,0.06)", bc: "#0D1F3C", isSiemBar: true },
        { id: "services", label: "Services & Managed", x: 20, y: 505, w: 1400, h: 78, color: "rgba(23,43,77,0.03)", bc: "#6B778C", isServices: true, dir: "h" }
    ],
    blocks: [
        { id: "epp", label: "Falcon Prevent", sub: "NGAV", zone: "endpoints", cov: "NATIVE" },
        { id: "edr", label: "Falcon Insight XDR", sub: "EDR / XDR", zone: "endpoints", cov: "NATIVE" },
        { id: "fw", label: "Falcon Firewall Management", sub: "Host firewall", zone: "endpoints", cov: "NATIVE" },
        { id: "devctl", label: "Falcon Device Control", sub: "USB / peripheral", zone: "endpoints", cov: "NATIVE" },
        { id: "mobile", label: "Falcon for Mobile", sub: "MTD", zone: "endpoints", cov: "NATIVE" },
        { id: "forensics", label: "Falcon Forensics", sub: "IR data collection", zone: "endpoints", cov: "NATIVE", span: ["secops"] },
        { id: "itdr", label: "Falcon Identity Protection", sub: "ITDR — AD / Entra ID", zone: "identity", cov: "NATIVE" },
        { id: "fid", label: "Falcon ID", sub: "MFA / passwordless", zone: "identity", cov: "HYBRID" },
        { id: "privacc", label: "Falcon Privileged Access", sub: "PAM / standing privilege", zone: "identity", cov: "NATIVE" },
        { id: "cnapp", label: "Falcon Cloud Security", sub: "CNAPP — CSPM/CIEM/CWPP/ASPM", zone: "cloud", cov: "NATIVE", span: ["exposure"] },
        { id: "shield", label: "Falcon Shield", sub: "SSPM — SaaS posture", zone: "cloud", cov: "NATIVE", span: ["aisec"] },
        { id: "cdr", label: "Cloud Detection & Response", sub: "CDR", zone: "cloud", cov: "NATIVE" },
        { id: "dlp", label: "Falcon Data Security for Endpoint", sub: "DLP — data in motion", zone: "data", cov: "NATIVE", span: ["endpoints"] },
        { id: "ds-cloud", label: "Falcon Data Security for Cloud", sub: "Runtime DSPM", zone: "data", cov: "NATIVE", span: ["cloud"] },
        { id: "seb", label: "Falcon Secure Access", sub: "Secure enterprise browser", zone: "data", cov: "NATIVE", span: ["endpoints"] },
        { id: "aidr-wf", label: "Falcon Guardian", sub: "AI traffic — endpoints", zone: "aisec", cov: "NATIVE", span: ["endpoints"] },
        { id: "aidr-ag", label: "Falcon AIDR for Agents", sub: "AI workloads — cloud", zone: "aisec", cov: "NATIVE", span: ["cloud"] },
        { id: "ctem", label: "Falcon Exposure Management", sub: "RBVM / ExPRT.AI — unified exposure", zone: "exposure", cov: "NATIVE" },
        { id: "surface", label: "Falcon Surface", sub: "EASM — external attack surface", zone: "exposure", cov: "NATIVE" },
        { id: "spotlight", label: "Falcon Spotlight", sub: "Vulnerability management", zone: "exposure", cov: "NATIVE" },
        { id: "discover", label: "Falcon Discover", sub: "Asset inventory / IT hygiene", zone: "exposure", cov: "NATIVE" },
        { id: "filevantage", label: "Falcon FileVantage", sub: "File integrity monitoring", zone: "exposure", cov: "NATIVE" },
        { id: "forit", label: "Falcon for IT", sub: "IT ops / hygiene", zone: "exposure", cov: "NATIVE" },
        { id: "drp", label: "Falcon Intelligence Recon", sub: "DRP — digital risk protection", zone: "exposure", cov: "NATIVE" },
        { id: "soar", label: "Falcon Fusion SOAR", sub: "Automation & playbooks", zone: "secops", cov: "NATIVE" },
        { id: "charlotte", label: "Charlotte AI", sub: "Agentic SOC", zone: "secops", cov: "NATIVE" },
        { id: "agentworks", label: "Charlotte AI AgentWorks", sub: "Custom agent builder", zone: "secops", cov: "NATIVE" },
        { id: "cti", label: "Falcon Adversary Intelligence", sub: "Threat intel · Sandbox analysis", zone: "secops", cov: "NATIVE" },
        { id: "foundry", label: "Falcon Foundry", sub: "Low-code custom apps", zone: "secops", cov: "NATIVE" },
        { id: "onum", label: "Falcon Onum", sub: "Real-time data control plane — parse · enrich · filter · route", zone: "pipeline", cov: "NATIVE" },
        { id: "logcoll", label: "Falcon LogScale Collector", sub: "Log collection & shipping", zone: "pipeline", cov: "NATIVE" },
        { id: "siem", label: "Falcon Next-Gen SIEM", sub: "LogScale — unified data platform", zone: "siem-bar", cov: "NATIVE" },
        { id: "complete", label: "Falcon Complete", sub: "Agentic MDR", zone: "services", cov: "SERVICES" },
        { id: "overwatch", label: "Falcon Adversary OverWatch", sub: "Managed threat hunting", zone: "services", cov: "SERVICES" },
        { id: "ir", label: "CrowdStrike IR Services", sub: "IR retainer", zone: "services", cov: "SERVICES" },
        { id: "ps", label: "CrowdStrike Pro Services", sub: "Deployment & architecture", zone: "services", cov: "SERVICES" },
        { id: "mssp-svc", label: "MSSP Managed Service", sub: "Partner-delivered SOC", zone: "services", cov: "PARTNER" },
        { id: "gsi", label: "Professional Services Delivery", sub: "SI / integrator delivery", zone: "services", cov: "PARTNER" }
    ],
    connections: [
        { from: "onum", to: "siem", type: "data" },
        { from: "logcoll", to: "siem", type: "data" },
        { from: "siem", to: "soar", type: "ops" },
        { from: "soar", to: "charlotte", type: "ops" },
        { from: "charlotte", to: "agentworks", type: "ops" }
    ]
};

const CORE_MODULE_MAP = {
    epp: { pillar: "endpoint", match: "Falcon Prevent" },
    edr: { pillar: "endpoint", match: "Falcon Insight" },
    fw: { pillar: "endpoint", match: "Falcon Firewall" },
    devctl: { pillar: "endpoint", match: "Falcon Device Control" },
    mobile: { pillar: "endpoint", match: "Falcon for Mobile" },
    filevantage: { pillar: "endpoint", match: "FileVantage" },
    forensics: { pillar: "endpoint", match: "Forensics" },
    itdr: { pillar: "identity", match: "Identity Threat" },
    fid: { pillar: "identity", match: "Falcon ID" },
    privacc: { pillar: "identity", match: "Next-Gen Identity" },
    cnapp: { pillar: "cloud", match: "Falcon Cloud Security" },
    shield: { pillar: "cloud", match: "Falcon Shield" },
    cdr: { pillar: "cloud", match: "CDR" },
    dlp: { pillar: "data", match: "Data Security for Endpoint" },
    "ds-cloud": { pillar: "data", match: "Data Security for Cloud" },
    seb: { pillar: "network", match: "Falcon Secure Access" },
    "aidr-wf": { pillar: "ai", match: "Guardian" },
    "aidr-ag": { pillar: "ai", match: "Guardian" },
    ctem: { pillar: "grc", match: "Exposure Management" },
    surface: { pillar: "grc", match: "Falcon Surface" },
    spotlight: { pillar: "grc", match: "Falcon Spotlight" },
    discover: { pillar: "grc", match: "Falcon Discover" },
    forit: { pillar: "infra", match: "Falcon for IT" },
    drp: { pillar: "intel", match: "Adversary Intelligence" },
    soar: { pillar: "secops", match: "Charlotte" },
    charlotte: { pillar: "secops", match: "Charlotte AI" },
    agentworks: { pillar: "secops", match: "Charlotte" },
    cti: { pillar: "intel", match: "Adversary Intelligence" },
    foundry: { pillar: "secops", match: "Foundry" },
    onum: { pillar: "infra", match: "Onum" },
    logcoll: { pillar: "secops", match: "Next-Gen SIEM" },
    siem: { pillar: "secops", match: "Next-Gen SIEM" },
    complete: { pillar: "services", match: "Falcon Complete" },
    overwatch: { pillar: "services", match: "OverWatch" },
    ir: { pillar: "services", match: "Falcon Complete" },
    ps: { pillar: "services", match: "Falcon Complete" },
    "mssp-svc": { pillar: "services", match: "" },
    gsi: { pillar: "services", match: "" }
};

const CoreStack = (function () {
    const NS = "http://www.w3.org/2000/svg";
    const FONT_SANS = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
    const FONT_MONO = "'Space Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
    const COV = {
        NATIVE: { stroke: "#00BFCF", accent: "#00BFCF", text: "#0a7c86" },
        HYBRID: { stroke: "#FF8B00", accent: "#FF8B00", text: "#b3651a" },
        PARTNER: { stroke: "#7C3AED", accent: "#7C3AED", text: "#5a3fcc" },
        SERVICES: { stroke: "#FF2D78", accent: "#FF2D78", text: "#c42858" }
    };
    const CONN = {
        ops: { stroke: "#00BFCF", width: 1.5, dash: "none" },
        data: { stroke: "#7C3AED", width: 1, dash: "3 2" }
    };
    const BH = 36, BGAP = 4, ZPAD = 6, ZHDR = 20;
    const HEADER_H = 46, FOOTER_H = 26, DIAG_M = 20, ROW_GAP = 10;
    const SELECT = "#E01F2B";

    function el(tag, attrs) {
        const node = document.createElementNS(NS, tag);
        Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
        return node;
    }
    function txt(text, x, y, attrs) {
        const node = el("text", { x, y, ...attrs });
        node.textContent = text;
        return node;
    }

    function render(svg, selectedId) {
        const t = CORE_STACK;
        svg.innerHTML = "";
        const zById = (id) => t.zones.find((zone) => zone.id === id);
        const contentH = (zone) => {
            if (zone.isSiemBar) return BH + 12;
            if (zone.dir === "h") return ZHDR + ZPAD * 2 + BH;
            const n = t.blocks.filter((b) => b.zone === zone.id || (b.span || []).includes(zone.id)).length;
            return Math.max(ZHDR + ZPAD * 2 + BH, ZHDR + ZPAD * 2 + n * BH + Math.max(0, n - 1) * BGAP);
        };
        const W = t.canvas.w;
        const tracks = t.layout.tracks.map((tr) => ({
            w: tr.w,
            rows: tr.rows.map((row) => row.filter((id) => zById(id))).filter((row) => row.length)
        })).filter((tr) => tr.rows.length);
        const availW = W - DIAG_M * 2 - (tracks.length - 1) * ROW_GAP;
        const totW = tracks.reduce((sum, tr) => sum + tr.w, 0) || 1;
        const geom = {};
        const bottoms = [];
        let tx = DIAG_M;
        tracks.forEach((tr) => {
            const tw = Math.round(availW * tr.w / totW);
            let ty = HEADER_H;
            tr.rows.forEach((row) => {
                const rh = Math.max(...row.map((id) => contentH(zById(id))));
                const zw = (tw - (row.length - 1) * ROW_GAP) / row.length;
                row.forEach((id, ci) => {
                    geom[id] = { x: Math.round(tx + ci * (zw + ROW_GAP)), y: ty, w: Math.round(zw), h: rh };
                });
                ty += rh + ROW_GAP;
            });
            bottoms.push(ty - ROW_GAP);
            tx += tw + ROW_GAP;
        });
        const maxB = bottoms.length ? Math.max(...bottoms) : HEADER_H;
        tracks.forEach((tr, ti) => {
            tr.rows[tr.rows.length - 1].forEach((id) => { geom[id].h += maxB - bottoms[ti]; });
        });
        const H = maxB + FOOTER_H;

        svg.setAttribute("width", W);
        svg.setAttribute("height", H);
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.appendChild(Object.assign(el("style"), {
            textContent: "[data-block]{cursor:pointer}[data-block]:focus{outline:none}"
        }));
        const defs = el("defs");
        const bsf = el("filter", { id: "csbs", x: "-3%", y: "-3%", width: "106%", height: "110%" });
        bsf.appendChild(el("feDropShadow", { dx: "0", dy: "1", stdDeviation: "1.2", "flood-color": "rgba(13,31,60,0.06)" }));
        defs.appendChild(bsf);
        Object.entries(CONN).forEach(([key, ct]) => {
            const marker = el("marker", { id: `csah-${key}`, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "5", markerHeight: "5", orient: "auto" });
            marker.appendChild(el("path", { d: "M0 1.5 L10 5 L0 8.5 z", fill: ct.stroke }));
            defs.appendChild(marker);
        });
        svg.appendChild(defs);
        svg.appendChild(el("rect", { x: 0, y: 0, width: W, height: H, fill: "#ffffff", rx: 8 }));
        svg.appendChild(txt(t.name, DIAG_M, 22, { "font-family": FONT_SANS, "font-size": "14", "font-weight": "700", fill: "#172B4D" }));
        svg.appendChild(txt("CrowdStrike architecture reference — thinkinfosec.org", DIAG_M, 34, {
            "font-family": FONT_MONO, "font-size": "6.5", fill: "#6B778C", "letter-spacing": "0.04em"
        }));
        svg.appendChild(txt("thinkinfosec.org", W - 14, H - 8, {
            "text-anchor": "end", "font-family": FONT_MONO, "font-size": "7", fill: "#c3ccd6", "letter-spacing": "0.04em"
        }));
        svg.appendChild(txt("Click a module to jump to its public library cards.", 20, H - 8, {
            "font-family": FONT_SANS, "font-size": "6.5", fill: "#b6bfca"
        }));

        t.zones.forEach((zone) => {
            const zg = geom[zone.id];
            if (!zg) return;
            const g = el("g", { "data-zone": zone.id });
            const fc = zone.isServices ? "rgba(23,43,77,0.03)" : zone.isSiemBar ? "rgba(23,43,77,0.06)" : zone.color;
            g.appendChild(el("rect", {
                x: zg.x, y: zg.y, width: zg.w, height: zg.h, rx: 6, fill: fc, stroke: zone.bc,
                "stroke-width": zone.isSiemBar ? 1.5 : 0.7,
                "stroke-dasharray": zone.isServices ? "3 2" : "none"
            }));
            if (!zone.isSiemBar) {
                g.appendChild(txt(zone.label.toUpperCase(), zg.x + 8, zg.y + 13, {
                    "font-family": FONT_MONO, "font-size": "8", "font-weight": "700", fill: zone.bc, "letter-spacing": "0.05em", opacity: "0.85"
                }));
            }
            svg.appendChild(g);
        });

        const blockPos = {};
        const drawItems = [];
        t.zones.forEach((zone) => {
            const zg = geom[zone.id];
            if (!zg) return;
            const prim = t.blocks.filter((b) => b.zone === zone.id);
            const echo = t.blocks.filter((b) => b.zone !== zone.id && (b.span || []).includes(zone.id));
            if (zone.isSiemBar) {
                prim.forEach((b) => {
                    const pos = { x: zg.x + ZPAD, y: zg.y + 6, w: zg.w - ZPAD * 2, h: zg.h - 12 };
                    blockPos[b.id] = pos;
                    drawItems.push({ b, pos, zone, echo: false });
                });
                return;
            }
            const items = [...prim.map((b) => ({ b, echo: false })), ...echo.map((b) => ({ b, echo: true }))];
            if (!items.length) return;
            if (zone.dir === "h") {
                const maxBW = items.length === 1 ? 420 : 180;
                const avW = zg.w - ZPAD * 2;
                const bW = Math.min(maxBW, (avW - (items.length - 1) * BGAP) / items.length);
                const tot = items.length * bW + (items.length - 1) * BGAP;
                const cx = zg.x + (zg.w - tot) / 2;
                const cy = zg.y + ZHDR + ZPAD;
                items.forEach((it, i) => {
                    const pos = { x: cx + i * (bW + BGAP), y: cy, w: bW, h: BH };
                    if (!it.echo) blockPos[it.b.id] = pos;
                    drawItems.push({ b: it.b, pos, zone, echo: it.echo });
                });
            } else {
                const bW = zg.w - ZPAD * 2;
                const availH = zg.h - ZHDR - ZPAD * 2;
                const fitH = Math.min(BH, (availH - (items.length - 1) * BGAP) / items.length);
                const bH = Math.max(20, fitH);
                let cy = zg.y + ZHDR + ZPAD;
                items.forEach((it) => {
                    const pos = { x: zg.x + ZPAD, y: cy, w: bW, h: bH };
                    cy += bH + BGAP;
                    if (!it.echo) blockPos[it.b.id] = pos;
                    drawItems.push({ b: it.b, pos, zone, echo: it.echo });
                });
            }
        });

        function ortho(pts, r) {
            r = r || 7;
            let d = `M${pts[0][0]},${pts[0][1]}`;
            for (let i = 1; i < pts.length - 1; i += 1) {
                const [px, py] = pts[i - 1];
                const [cx, cy] = pts[i];
                const [nx, ny] = pts[i + 1];
                const inLen = Math.hypot(cx - px, cy - py);
                const outLen = Math.hypot(nx - cx, ny - cy);
                if (inLen < 0.01 || outLen < 0.01) { d += ` L${cx},${cy}`; continue; }
                const rr = Math.min(r, inLen / 2, outLen / 2);
                const ix = (cx - (cx - px) / inLen * rr).toFixed(1);
                const iy = (cy - (cy - py) / inLen * rr).toFixed(1);
                const ox = (cx + (nx - cx) / outLen * rr).toFixed(1);
                const oy = (cy + (ny - cy) / outLen * rr).toFixed(1);
                d += ` L${ix},${iy} Q${cx},${cy} ${ox},${oy}`;
            }
            return `${d} L${pts[pts.length - 1][0]},${pts[pts.length - 1][1]}`;
        }

        const connLayer = el("g", { opacity: "0.65" });
        t.connections.forEach((conn) => {
            const fp = blockPos[conn.from];
            const tp = blockPos[conn.to];
            if (!fp || !tp) return;
            const ct = CONN[conn.type] || CONN.ops;
            const x1 = fp.x + fp.w / 2;
            const y1 = fp.y + fp.h + 2;
            const x2 = tp.x + tp.w / 2;
            const y2 = tp.y - 2;
            const path = Math.abs(x1 - x2) < 8
                ? `M${x1},${y1} L${x1},${y2}`
                : ortho([[x1, y1], [x1, (y1 + y2) / 2], [x2, (y1 + y2) / 2], [x2, y2]]);
            connLayer.appendChild(el("path", {
                d: path, fill: "none", stroke: ct.stroke, "stroke-width": ct.width,
                "stroke-dasharray": ct.dash, "stroke-linecap": "round",
                "marker-end": `url(#csah-${conn.type || "ops"})`
            }));
        });
        svg.appendChild(connLayer);

        drawItems.forEach(({ b, pos, zone, echo }) => {
            const c = COV[b.cov] || COV.NATIVE;
            const selected = b.id === selectedId;
            const isSB = !!zone.isSiemBar;
            const g = el("g", { "data-block": b.id, tabindex: "0", role: "button" });
            g.setAttribute("aria-label", b.label);
            g.setAttribute("aria-pressed", selected ? "true" : "false");
            if (echo) g.setAttribute("data-echo", "1");
            if (!echo) g.setAttribute("filter", "url(#csbs)");
            const stroke = selected ? SELECT : (echo ? zone.bc : c.stroke);
            if (echo) {
                g.appendChild(el("rect", {
                    x: pos.x, y: pos.y, width: pos.w, height: pos.h, rx: 5,
                    fill: "none", stroke, "stroke-width": selected ? 1.6 : 0.8, "stroke-dasharray": "3 2"
                }));
                g.appendChild(txt(b.label, pos.x + 8, pos.y + 14, {
                    "font-family": FONT_SANS, "font-size": "8", "font-weight": "500", "font-style": "italic", fill: "#44546a"
                }));
                g.appendChild(txt(`⇄ ${zone.label}`, pos.x + 8, pos.y + 25, {
                    "font-family": FONT_MONO, "font-size": "5.5", fill: zone.bc, "letter-spacing": "0.02em"
                }));
            } else {
                g.appendChild(el("rect", {
                    x: pos.x, y: pos.y, width: pos.w, height: pos.h, rx: isSB ? 6 : 5,
                    fill: "#fff", stroke, "stroke-width": selected ? (isSB ? 2 : 1.6) : (isSB ? 1.4 : 0.8)
                }));
                g.appendChild(el("rect", {
                    x: pos.x, y: pos.y, width: isSB ? 4 : 3, height: pos.h, rx: 1.5, fill: selected ? SELECT : c.accent
                }));
                g.appendChild(txt(b.label, pos.x + (isSB ? 12 : 9), pos.y + (isSB ? 16 : 14), {
                    "font-family": FONT_SANS, "font-size": isSB ? "10" : "8.5", "font-weight": isSB ? "700" : "600", fill: "#172B4D"
                }));
                if (b.sub) {
                    g.appendChild(txt(b.sub, pos.x + (isSB ? 12 : 9), pos.y + (isSB ? 28 : 25), {
                        "font-family": FONT_MONO, "font-size": isSB ? "7" : "6.5", fill: c.text, "letter-spacing": "0.01em"
                    }));
                }
                g.appendChild(el("circle", { cx: pos.x + pos.w - 10, cy: pos.y + 10, r: 3.5, fill: selected ? SELECT : c.accent, opacity: "0.85" }));
            }
            svg.appendChild(g);
        });
    }

    function bind(svg, onSelect) {
        svg.addEventListener("click", (event) => {
            const group = event.target.closest("[data-block]");
            if (!group) return;
            onSelect(group.getAttribute("data-block"));
        });
        svg.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            const group = event.target.closest("[data-block]");
            if (!group) return;
            event.preventDefault();
            onSelect(group.getAttribute("data-block"));
        });
    }

    return { render, bind, map: CORE_MODULE_MAP };
})();
