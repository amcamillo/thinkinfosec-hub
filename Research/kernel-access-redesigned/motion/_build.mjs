import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dir = join(root, "compositions");

const INK = "#F4F7F6";
const MUTE = "#D5E4E6";
const TEAL = "#00BFCF";
const MAG = "#FF2D78";
const MAG_INK = "#FFB4C8";
const CARD = "#16304C";
const CANVAS = "#0D1F3C";

function css(id, p) {
  return `
    @font-face {
      font-family: "Newsreader";
      src: url("../assets/fonts/newsreader-latin.woff2") format("woff2");
      font-weight: 500 700;
      font-style: normal;
      font-display: block;
    }
    #root { position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; }
    [data-composition-id="${id}"] {
      background: ${CANVAS};
      color: ${INK};
      font-family: "Newsreader", serif;
    }
    [data-composition-id="${id}"] .${p}-scene {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 52px 72px 44px;
      display: flex;
      flex-direction: column;
      gap: 22px;
      box-sizing: border-box;
      overflow: hidden;
    }
    [data-composition-id="${id}"] .${p}-glow,
    [data-composition-id="${id}"] .${p}-ghost,
    [data-composition-id="${id}"] .${p}-grid {
      position: absolute;
      pointer-events: none;
    }
    [data-composition-id="${id}"] .${p}-glow-a {
      width: 880px; height: 880px; left: -220px; top: -280px;
      background: radial-gradient(circle, rgba(0,191,207,0.20), transparent 68%);
    }
    [data-composition-id="${id}"] .${p}-glow-b {
      width: 760px; height: 760px; right: -200px; bottom: -300px;
      background: radial-gradient(circle, rgba(255,45,120,0.14), transparent 70%);
    }
    [data-composition-id="${id}"] .${p}-grid {
      inset: -48px;
      background-image:
        linear-gradient(rgba(0,191,207,0.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,191,207,0.045) 1px, transparent 1px);
      background-size: 88px 88px;
    }
    [data-composition-id="${id}"] .${p}-ghost {
      right: -20px; bottom: -46px;
      font-family: "Newsreader", serif;
      font-weight: 700;
      font-size: 220px;
      letter-spacing: -0.04em;
      line-height: 0.8;
      color: ${TEAL};
      opacity: 0.07;
      white-space: nowrap;
    }
    [data-composition-id="${id}"] .${p}-head { display: flex; flex-direction: column; gap: 8px; z-index: 1; }
    [data-composition-id="${id}"] .${p}-meta {
      display: flex; justify-content: space-between; align-items: baseline;
      font-family: "IBM Plex Mono", monospace;
      font-size: 18px; letter-spacing: 0.08em; color: ${TEAL};
    }
    [data-composition-id="${id}"] .${p}-kicker {
      font-family: "IBM Plex Mono", monospace;
      font-size: 20px; color: ${MUTE}; letter-spacing: 0.02em;
    }
    [data-composition-id="${id}"] .${p}-title {
      font-size: 64px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.02;
      max-width: 1600px;
    }
    [data-composition-id="${id}"] .${p}-rule {
      height: 2px; width: 280px; background: ${TEAL}; transform-origin: left center; margin-top: 6px;
    }
    [data-composition-id="${id}"] .${p}-board {
      flex: 1; min-height: 0; z-index: 1;
      display: flex; flex-direction: column; justify-content: center; gap: 18px;
    }
    [data-composition-id="${id}"] .${p}-row { display: flex; align-items: stretch; gap: 16px; min-height: 0; }
    [data-composition-id="${id}"] .${p}-card {
      flex: 1; min-width: 0;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
      padding: 20px 22px;
      min-height: 168px;
      background: ${CARD};
      border: 1px solid rgba(213,228,230,0.24);
      border-radius: 10px;
    }
    [data-composition-id="${id}"] .${p}-teal { border: 2px solid ${TEAL}; }
    [data-composition-id="${id}"] .${p}-magenta { border: 2px solid ${MAG}; }
    [data-composition-id="${id}"] .${p}-dashed {
      background: transparent;
      border-style: dashed;
    }
    [data-composition-id="${id}"] .${p}-tag {
      font-family: "IBM Plex Mono", monospace;
      font-size: 16px; letter-spacing: 0.04em; color: ${MUTE};
      font-variant-numeric: tabular-nums;
    }
    [data-composition-id="${id}"] .${p}-teal > .${p}-tag,
    [data-composition-id="${id}"] .${p}-tag.${p}-teal { color: ${TEAL}; }
    [data-composition-id="${id}"] .${p}-magenta > .${p}-tag,
    [data-composition-id="${id}"] .${p}-tag.${p}-magenta { color: ${MAG_INK}; }
    [data-composition-id="${id}"] .${p}-card h2 {
      font-size: 34px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.08; color: ${INK};
    }
    [data-composition-id="${id}"] .${p}-sub {
      font-family: "IBM Plex Mono", monospace;
      font-size: 20px; line-height: 1.3; color: ${MUTE};
    }
    [data-composition-id="${id}"] .${p}-arrow, [data-composition-id="${id}"] .${p}-pill {
      flex: 0 0 auto; align-self: center;
      font-family: "IBM Plex Mono", monospace;
      font-size: 22px; color: ${TEAL}; letter-spacing: 0.02em;
      transform-origin: left center;
    }
    [data-composition-id="${id}"] .${p}-pill {
      border: 1px solid ${TEAL}; border-radius: 999px; padding: 8px 14px; font-size: 18px;
    }
    [data-composition-id="${id}"] .${p}-pill.${p}-magenta {
      color: ${MAG_INK}; border-color: ${MAG}; border-style: dashed;
    }
    [data-composition-id="${id}"] .${p}-group {
      flex: 1; min-width: 0;
      display: flex; flex-direction: column; gap: 12px;
      padding: 16px 18px 18px;
      border: 1px solid rgba(213,228,230,0.28);
      border-radius: 14px;
    }
    [data-composition-id="${id}"] .${p}-group.${p}-teal { border-color: rgba(0,191,207,0.75); }
    [data-composition-id="${id}"] .${p}-group.${p}-magenta { border-color: rgba(255,45,120,0.8); }
    [data-composition-id="${id}"] .${p}-glabel {
      font-family: "IBM Plex Mono", monospace;
      font-size: 18px; letter-spacing: 0.06em; color: ${MUTE};
    }
    [data-composition-id="${id}"] .${p}-teal > .${p}-glabel { color: ${TEAL}; }
    [data-composition-id="${id}"] .${p}-magenta > .${p}-glabel { color: ${MAG_INK}; }
    [data-composition-id="${id}"] .${p}-gnote {
      font-family: "IBM Plex Mono", monospace;
      font-size: 18px; color: ${MUTE};
    }
    [data-composition-id="${id}"] .${p}-caption {
      z-index: 1;
      font-size: 26px; line-height: 1.32; color: ${INK}; max-width: 1680px;
    }
    [data-composition-id="${id}"] .${p}-join {
      height: 2px; background: ${TEAL}; transform-origin: left center;
    }
    [data-composition-id="${id}"] .${p}-split { display: flex; gap: 28px; align-items: center; }
    [data-composition-id="${id}"] .${p}-grid2 {
      display: grid; grid-template-columns: 1fr 1fr; gap: 22px; min-height: 0; flex: 1;
    }
    [data-composition-id="${id}"] .${p}-verdict, [data-composition-id="${id}"] .${p}-rice {
      border-radius: 12px; padding: 18px 28px;
      display: flex; flex-direction: column; gap: 6px; justify-content: center;
    }
    [data-composition-id="${id}"] .${p}-verdict { border: 2px solid ${MAG}; background: ${CARD}; }
    [data-composition-id="${id}"] .${p}-verdict h2 { font-size: 48px; font-weight: 700; letter-spacing: -0.03em; }
    [data-composition-id="${id}"] .${p}-rice {
      border: 2px dashed rgba(213,228,230,0.45); background: transparent;
    }
    [data-composition-id="${id}"] .${p}-rice h2 { font-size: 40px; font-weight: 700; letter-spacing: -0.02em; }
    [data-composition-id="${id}"] .${p}-attach { display: flex; justify-content: flex-end; padding-right: 6%; }
  `;
}

function card(p, id, tone, tag, title, sub, extra = "") {
  const toneClass = tone === "neutral" ? "" : ` ${p}-${tone}`;
  const tagHtml = tag ? `<p class="${p}-tag">${tag}</p>` : "";
  return `<article class="${p}-card${toneClass}${extra}" id="${p}-${id}">${tagHtml}<h2>${title}</h2><p class="${p}-sub">${sub}</p></article>`;
}

function arrow(p, id) {
  return `<span class="${p}-arrow" id="${p}-${id}">→</span>`;
}

function pill(p, id, label, tone = "teal") {
  const extra = tone === "magenta" ? ` ${p}-magenta` : "";
  return `<span class="${p}-pill${extra}" id="${p}-${id}">${label}</span>`;
}

function decor(p, ghost) {
  return `
    <div class="${p}-grid" id="${p}-grid" data-layout-ignore="true"></div>
    <div class="${p}-glow ${p}-glow-a" id="${p}-glow-a" data-layout-ignore="true"></div>
    <div class="${p}-glow ${p}-glow-b" id="${p}-glow-b" data-layout-ignore="true"></div>
    <div class="${p}-ghost" id="${p}-ghost" data-layout-ignore="true">${ghost}</div>`;
}

function head(p, kicker, title, index) {
  return `
    <header class="${p}-head">
      <div class="${p}-meta">
        <span id="${p}-series">Kernel-Access Redesigned</span>
        <span id="${p}-index">${index}</span>
      </div>
      <p class="${p}-kicker" id="${p}-kicker">${kicker}</p>
      <h1 class="${p}-title" id="${p}-title">${title}</h1>
      <div class="${p}-rule" id="${p}-rule"></div>
    </header>`;
}

function page(id, p, duration, ghost, kicker, title, index, board, caption, tweens) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
</head>
<body>
  <template id="${id}-template">
    <style>${css(id, p)}</style>
    <div id="root" data-composition-id="${id}" data-width="1920" data-height="1080" data-duration="${duration}">
      <div class="${p}-scene" id="${p}-scene">
        ${decor(p, ghost)}
        ${head(p, kicker, title, index)}
        <div class="${p}-board" id="${p}-board">
          ${board}
        </div>
        <p class="${p}-caption" id="${p}-caption">${caption}</p>
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      ${tweens}
      window.__timelines["${id}"] = tl;
    </script>
  </template>
</body>
</html>
`;
}

function motion(id, p, firstCard, duration) {
  return JSON.stringify(
    {
      duration,
      assertions: [
        { kind: "appearsBy", selector: `#${p}-title`, bySec: 1.3 },
        { kind: "appearsBy", selector: `#${p}-${firstCard}`, bySec: 2.4 },
        { kind: "appearsBy", selector: `#${p}-caption`, bySec: 3.4 },
        { kind: "before", a: `#${p}-title`, b: `#${p}-${firstCard}` },
        { kind: "before", a: `#${p}-${firstCard}`, b: `#${p}-caption` },
        { kind: "staysInFrame", selector: `#${p}-title` },
        { kind: "keepsMoving", withinSelector: `#${p}-scene` },
      ],
    },
    null,
    2,
  );
}

const scenes = [];

function add(spec) {
  scenes.push(spec);
}

const baseIn = (p, ambient) => {
  const amb =
    ambient === "drift"
      ? `tl.fromTo("#${p}-grid", { x: 0 }, { x: -36, duration: 7.1, ease: "sine.inOut" }, 0.2);
      tl.fromTo("#${p}-glow-a", { scale: 1 }, { scale: 1.06, duration: 6.6, ease: "power1.inOut" }, 0.25);`
      : ambient === "rotate"
        ? `tl.fromTo("#${p}-glow-a", { rotation: 0, scale: 1 }, { rotation: 8, scale: 1.05, duration: 7.0, ease: "sine.inOut" }, 0.2);
      tl.fromTo("#${p}-glow-b", { y: 0 }, { y: -22, duration: 6.4, ease: "power1.inOut" }, 0.3);`
        : ambient === "rise"
          ? `tl.fromTo("#${p}-glow-b", { y: 20 }, { y: -16, duration: 7.0, ease: "sine.inOut" }, 0.2);
      tl.fromTo("#${p}-glow-a", { scale: 1.02 }, { scale: 1.08, duration: 6.2, ease: "power1.inOut" }, 0.35);`
          : `tl.fromTo("#${p}-glow-a", { scale: 1, x: 0 }, { scale: 1.07, x: -18, duration: 7.0, ease: "sine.inOut" }, 0.2);
      tl.fromTo("#${p}-glow-b", { scale: 1 }, { scale: 1.05, duration: 6.5, ease: "power1.inOut" }, 0.28);`;
  return amb;
};

add({
  id: "ebpf-pipeline",
  p: "ep",
  duration: 8,
  ghost: "eBPF",
  kicker: "Linux and eBPF",
  title: "The eBPF pipeline",
  index: "01 / 08",
  first: "bc",
  caption:
    "Instead of native machine code, you submit bytecode. A verifier checks it, a JIT turns the approved result into native instructions, and BPF-LSM attaches to the same hooks SELinux and AppArmor use.",
  board: `
    <div class="ep-row">
      ${card("ep", "bc", "neutral", "01 · submit", "Bytecode", "not native machine code")}
      ${arrow("ep", "a1")}
      ${card("ep", "ver", "teal", "02 · check", "Verifier", "checks it before it runs")}
      ${arrow("ep", "a2")}
      ${card("ep", "jit", "teal", "03 · compile", "JIT compiler", "approved result, native")}
      ${arrow("ep", "a3")}
      ${card("ep", "nat", "magenta", "04 · Ring 0", "Native code", "runs in the kernel")}
    </div>
    <div class="ep-attach">${pill("ep", "attach", "attach")}</div>
    <div class="ep-group ep-teal" id="ep-hooks">
      <p class="ep-glabel" id="ep-glabel">Same LSM hooks</p>
      <p class="ep-gnote" id="ep-gnote">no loadable kernel module</p>
      <div class="ep-row">
        ${card("ep", "sel", "neutral", "", "SELinux", "existing LSM hook")}
        ${card("ep", "app", "neutral", "", "AppArmor", "existing LSM hook")}
        ${card("ep", "lsm", "teal", "KRSI", "BPF-LSM", "programs attach here")}
      </div>
    </div>`,
  tweens: `
      ${baseIn("ep", "drift")}
      tl.fromTo("#ep-ghost", { x: 24, opacity: 0 }, { x: 0, opacity: 0.07, duration: 0.9, ease: "power1.out" }, 0.22);
      tl.fromTo("#ep-series", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: "circ.out" }, 0.18);
      tl.fromTo("#ep-index", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "sine.out" }, 0.26);
      tl.fromTo("#ep-kicker", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, ease: "expo.out" }, 0.24);
      tl.fromTo("#ep-title", { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.66, ease: "power4.out" }, 0.32);
      tl.fromTo("#ep-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.48, ease: "power3.inOut" }, 0.5);
      tl.fromTo("#ep-bc", { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "power3.out" }, 0.62);
      tl.fromTo("#ep-a1", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.28, ease: "power2.inOut" }, 0.78);
      tl.fromTo("#ep-ver", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, 0.86);
      tl.fromTo("#ep-a2", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.26, ease: "power2.inOut" }, 1.02);
      tl.fromTo("#ep-jit", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "circ.out" }, 1.08);
      tl.fromTo("#ep-a3", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.26, ease: "power3.inOut" }, 1.24);
      tl.fromTo("#ep-nat", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.44, ease: "expo.out" }, 1.28);
      tl.fromTo("#ep-attach", { scale: 0.86, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.36, ease: "back.out(1.4)" }, 1.5);
      tl.fromTo("#ep-hooks", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 1.62);
      tl.fromTo("#ep-caption", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "sine.out" }, 2.15);
  `,
});

add({
  id: "linux-timeline",
  p: "lt",
  duration: 8,
  ghost: "5.7",
  kicker: "Linux and eBPF",
  title: "How Linux got to BPF-LSM",
  index: "02 / 08",
  first: "e318",
  caption:
    "eBPF landed in Linux 3.18 in 2014. bcc and bpftrace are tooling. KRSI was proposed in 2019, merged in March 2020, and shipped in Linux 5.7.",
  board: `
    <div class="lt-row">
      ${card("lt", "e318", "teal", "Dec 2014", "Linux 3.18", "eBPF lands")}
      ${arrow("lt", "a1")}
      ${card("lt", "bcc", "neutral", "2015", "bcc", "tooling, not authorship")}
      ${arrow("lt", "a2")}
      ${card("lt", "bpf", "neutral", "2018", "bpftrace", "tooling, not authorship")}
    </div>
    <div class="lt-join" id="lt-join"></div>
    <div class="lt-row">
      ${card("lt", "krsi", "magenta", "2019", "KRSI proposed", "KP Singh")}
      ${arrow("lt", "a3")}
      ${card("lt", "merge", "teal", "March 2020", "Merged", "BPF-LSM joins the kernel")}
      ${arrow("lt", "a4")}
      ${card("lt", "k57", "teal", "Linux 5.7", "Ships", "same hooks as the LSMs")}
    </div>`,
  tweens: `
      ${baseIn("lt", "rotate")}
      tl.fromTo("#lt-ghost", { y: 16, opacity: 0 }, { y: 0, opacity: 0.07, duration: 0.8, ease: "power1.out" }, 0.2);
      tl.fromTo("#lt-series", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "sine.out" }, 0.16);
      tl.fromTo("#lt-index", { x: 12, opacity: 0 }, { x: 0, opacity: 1, duration: 0.34, ease: "power2.out" }, 0.22);
      tl.fromTo("#lt-kicker", { opacity: 0 }, { opacity: 1, duration: 0.36, ease: "power1.out" }, 0.24);
      tl.fromTo("#lt-title", { x: -36, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "expo.out" }, 0.3);
      tl.fromTo("#lt-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.42, ease: "power3.inOut" }, 0.48);
      tl.fromTo("#lt-e318", { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.36, ease: "circ.out" }, 0.58);
      tl.fromTo("#lt-a1", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.22, ease: "power2.inOut" }, 0.72);
      tl.fromTo("#lt-bcc", { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.34, ease: "power4.out" }, 0.74);
      tl.fromTo("#lt-a2", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.22, ease: "power3.inOut" }, 0.88);
      tl.fromTo("#lt-bpf", { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.34, ease: "expo.out" }, 0.9);
      tl.fromTo("#lt-join", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power3.inOut" }, 1.08);
      tl.fromTo("#lt-krsi", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, 1.2);
      tl.fromTo("#lt-a3", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.22, ease: "power2.inOut" }, 1.36);
      tl.fromTo("#lt-merge", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, ease: "circ.out" }, 1.38);
      tl.fromTo("#lt-a4", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.22, ease: "sine.out" }, 1.52);
      tl.fromTo("#lt-k57", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "power4.out" }, 1.54);
      tl.fromTo("#lt-caption", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, 2.05);
  `,
});

add({
  id: "macos-before-after",
  p: "mb",
  duration: 8,
  ghost: "KEXT",
  kicker: "macOS and Endpoint Security",
  title: "Kernel extensions, then Endpoint Security",
  index: "03 / 08",
  first: "before",
  caption:
    "Third-party code leaves the kernel. An Endpoint Security client in user space receives events from the kernel.",
  board: `
    <div class="mb-split">
      <section class="mb-group mb-magenta" id="mb-before">
        <p class="mb-glabel" id="mb-before-label">Before</p>
        ${card("mb", "kext", "magenta", "Ring 0", "Kernel extension", "third-party code")}
      </section>
      <div class="mb-bridge" id="mb-bridge" style="display:flex;align-items:center;">
        ${pill("mb", "out", "get it out")}
      </div>
      <section class="mb-group mb-teal" id="mb-after">
        <p class="mb-glabel" id="mb-after-label">After</p>
        <div class="mb-row">
          ${card("mb", "kern", "neutral", "Kernel", "Kernel", "sends the events")}
          ${pill("mb", "events", "events")}
          ${card("mb", "client", "teal", "User space", "Endpoint Security", "client receives them")}
        </div>
      </section>
    </div>`,
  tweens: `
      ${baseIn("mb", "scale")}
      tl.fromTo("#mb-ghost", { x: -20, opacity: 0 }, { x: 0, opacity: 0.07, duration: 0.85, ease: "power2.out" }, 0.2);
      tl.fromTo("#mb-series", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "circ.out" }, 0.16);
      tl.fromTo("#mb-index", { opacity: 0 }, { opacity: 1, duration: 0.36, ease: "sine.out" }, 0.22);
      tl.fromTo("#mb-kicker", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: "power3.out" }, 0.26);
      tl.fromTo("#mb-title", { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power4.out" }, 0.32);
      tl.fromTo("#mb-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.46, ease: "power3.inOut" }, 0.52);
      tl.fromTo("#mb-before", { x: -48, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: "expo.out" }, 0.66);
      tl.fromTo("#mb-out", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.36, ease: "back.out(1.5)" }, 1.05);
      tl.fromTo("#mb-after", { x: 48, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, 1.15);
      tl.fromTo("#mb-events", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "sine.out" }, 1.55);
      tl.fromTo("#mb-caption", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power1.out" }, 1.9);
  `,
});

add({
  id: "macos-staging",
  p: "ms",
  duration: 8,
  ghost: "WWDC",
  kicker: "macOS and Endpoint Security",
  title: "How Apple staged the change",
  index: "04 / 08",
  first: "wwdc",
  caption:
    "Announced at WWDC 2019. The kernel interfaces were deprecated in Catalina 10.15. From Big Sur, extensions using them no longer load by default.",
  board: `
    <div class="ms-join" id="ms-track"></div>
    <div class="ms-row">
      ${card("ms", "wwdc", "neutral", "WWDC 2019", "Announced", "the move off kexts")}
      ${arrow("ms", "a1")}
      ${card("ms", "cat", "magenta", "Catalina 10.15", "Deprecated", "those kernel interfaces")}
      ${arrow("ms", "a2")}
      ${card("ms", "sur", "teal", "Big Sur onward", "Not loaded", "no longer by default")}
    </div>`,
  tweens: `
      ${baseIn("ms", "rise")}
      tl.fromTo("#ms-ghost", { opacity: 0 }, { opacity: 0.07, duration: 1.0, ease: "sine.out" }, 0.2);
      tl.fromTo("#ms-series", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: "power2.out" }, 0.18);
      tl.fromTo("#ms-index", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0.24);
      tl.fromTo("#ms-kicker", { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "expo.out" }, 0.28);
      tl.fromTo("#ms-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.36);
      tl.fromTo("#ms-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: "power3.inOut" }, 0.7);
      tl.fromTo("#ms-track", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, 0.85);
      tl.fromTo("#ms-wwdc", { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.48, ease: "power4.out" }, 1.05);
      tl.fromTo("#ms-a1", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.24, ease: "circ.out" }, 1.28);
      tl.fromTo("#ms-cat", { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, 1.36);
      tl.fromTo("#ms-a2", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.24, ease: "power2.inOut" }, 1.58);
      tl.fromTo("#ms-sur", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.62, ease: "power4.out" }, 1.66);
      tl.fromTo("#ms-caption", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "sine.inOut" }, 2.35);
  `,
});

add({
  id: "windows-timeline",
  p: "wt",
  duration: 8,
  ghost: "2024",
  kicker: "Windows",
  title: "The long road off the Windows kernel",
  index: "05 / 08",
  first: "pg",
  caption:
    "PatchGuard, the EU commitment, the July 2024 outage, then WRI at Ignite, a WESP private preview, and Fal.Con still calling it a preview.",
  board: `
    <div class="wt-row">
      ${card("wt", "pg", "neutral", "Vista", "PatchGuard", "64-bit kernel locked")}
      ${arrow("wt", "a1")}
      ${card("wt", "eu", "neutral", "EU", "The complaint", "then the 2009 commitment")}
      ${arrow("wt", "a2")}
      ${card("wt", "out", "magenta", "19 Jul 2024", "The outage", "8.5 million devices")}
    </div>
    <div class="wt-join" id="wt-join"></div>
    <div class="wt-row">
      ${card("wt", "wri", "teal", "Ignite · Nov 2024", "WRI announced", "user mode, like apps")}
      ${arrow("wt", "a3")}
      ${card("wt", "wesp", "teal", "Jun 2025", "WESP preview", "first private preview")}
      ${arrow("wt", "a4")}
      ${card("wt", "fal", "magenta", "Fal.Con · Sep 2026", "Still preview", "not general availability")}
    </div>`,
  tweens: `
      ${baseIn("wt", "drift")}
      tl.fromTo("#wt-ghost", { scale: 1.04, opacity: 0 }, { scale: 1, opacity: 0.07, duration: 0.7, ease: "power2.out" }, 0.18);
      tl.fromTo("#wt-series", { opacity: 0 }, { opacity: 1, duration: 0.28, ease: "sine.out" }, 0.16);
      tl.fromTo("#wt-index", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "circ.out" }, 0.2);
      tl.fromTo("#wt-kicker", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" }, 0.22);
      tl.fromTo("#wt-title", { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.58, ease: "expo.out" }, 0.28);
      tl.fromTo("#wt-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power3.inOut" }, 0.46);
      tl.fromTo("#wt-pg", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.46, ease: "power3.out" }, 0.58);
      tl.fromTo("#wt-a1", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.2, ease: "power2.inOut" }, 0.74);
      tl.fromTo("#wt-eu", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.44, ease: "power4.out" }, 0.76);
      tl.fromTo("#wt-a2", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.18, ease: "sine.inOut" }, 0.92);
      tl.fromTo("#wt-out", { scale: 1.06, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: "power4.out" }, 0.96);
      tl.fromTo("#wt-join", { scaleX: 0 }, { scaleX: 1, duration: 0.36, ease: "power2.inOut" }, 1.2);
      tl.fromTo("#wt-wri", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "circ.out" }, 1.28);
      tl.fromTo("#wt-a3", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.2, ease: "sine.out" }, 1.44);
      tl.fromTo("#wt-wesp", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "expo.out" }, 1.46);
      tl.fromTo("#wt-a4", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.2, ease: "power3.inOut" }, 1.6);
      tl.fromTo("#wt-fal", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.48, ease: "power3.out" }, 1.62);
      tl.fromTo("#wt-caption", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power1.out" }, 2.15);
  `,
});

add({
  id: "windows-status",
  p: "ws",
  duration: 8,
  ghost: "WESP",
  kicker: "Windows",
  title: "Where the Windows package stands",
  index: "06 / 08",
  first: "wesp",
  caption:
    "WESP is a private preview. Native Sysmon is Insiders only and off by default. Memory integrity is a staged default from October 2026. Quick Machine Recovery ships, and it recovers boots.",
  board: `
    <p class="ws-glabel" id="ws-pack">The package</p>
    <div class="ws-grid2">
      ${card("ws", "wesp", "magenta", "Private preview", "WESP", "not general availability")}
      ${card("ws", "sys", "magenta", "Insiders only", "Native Sysmon", "off by default")}
      ${card("ws", "mem", "teal", "From Oct 2026", "Memory integrity", "staged default, not enforced")}
      ${card("ws", "qmr", "neutral", "Shipping", "Quick Machine Recovery", "recovers boots only")}
    </div>`,
  tweens: `
      ${baseIn("ws", "scale")}
      tl.fromTo("#ws-ghost", { x: 18, opacity: 0 }, { x: 0, opacity: 0.07, duration: 0.9, ease: "power1.inOut" }, 0.2);
      tl.fromTo("#ws-series", { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "sine.out" }, 0.2);
      tl.fromTo("#ws-index", { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.out" }, 0.28);
      tl.fromTo("#ws-kicker", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0.3);
      tl.fromTo("#ws-title", { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power3.out" }, 0.36);
      tl.fromTo("#ws-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, 0.6);
      tl.fromTo("#ws-pack", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "circ.out" }, 0.72);
      tl.fromTo("#ws-wesp", { x: -36, y: -16, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.48, ease: "expo.out" }, 0.84);
      tl.fromTo("#ws-sys", { x: 36, y: -16, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.48, ease: "power4.out" }, 0.98);
      tl.fromTo("#ws-mem", { x: -28, y: 18, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.5, ease: "circ.out" }, 1.12);
      tl.fromTo("#ws-qmr", { x: 28, y: 18, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 1.26);
      tl.fromTo("#ws-caption", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "sine.inOut" }, 1.85);
  `,
});

add({
  id: "ebpf-windows",
  p: "ew",
  duration: 8,
  ghost: "HVCI",
  kicker: "Windows",
  title: "eBPF for Windows",
  index: "07 / 08",
  first: "prog",
  caption:
    "The verifier runs in a secure user-mode environment. Verified programs then load into a kernel-mode execution context. Verified, yes. Out of the kernel, no.",
  board: `
    <div class="ew-row">
      ${card("ew", "prog", "neutral", "Submit", "eBPF program", "bytecode in")}
      ${arrow("ew", "submit")}
      <section class="ew-group ew-teal" id="ew-user">
        <p class="ew-glabel" id="ew-user-label">User mode</p>
        ${card("ew", "ver", "teal", "User mode", "Verifier", "secure user-mode env")}
      </section>
      ${pill("ew", "load", "then load")}
      <section class="ew-group ew-magenta" id="ew-kern">
        <p class="ew-glabel" id="ew-kern-label">Still in the kernel</p>
        <div class="ew-row">
          ${card("ew", "ctx", "magenta", "Kernel mode", "Execution context", "programs load here")}
          ${pill("ew", "nojit", "no JIT", "magenta")}
          ${card("ew", "hvci", "magenta", "HVCI enabled", "Native mode", "a regular Windows driver", " ew-dashed")}
        </div>
      </section>
    </div>
    <div class="ew-verdict" id="ew-no">
      <h2 id="ew-yes">Verified, yes</h2>
      <p class="ew-sub" id="ew-out">Out of the kernel, no</p>
    </div>`,
  tweens: `
      ${baseIn("ew", "rise")}
      tl.fromTo("#ew-ghost", { opacity: 0, y: 12 }, { opacity: 0.07, y: 0, duration: 0.8, ease: "power1.out" }, 0.2);
      tl.fromTo("#ew-series", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "sine.out" }, 0.16);
      tl.fromTo("#ew-index", { x: 10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.32, ease: "power2.out" }, 0.22);
      tl.fromTo("#ew-kicker", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: "circ.out" }, 0.24);
      tl.fromTo("#ew-title", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power4.out" }, 0.3);
      tl.fromTo("#ew-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.44, ease: "power3.inOut" }, 0.48);
      tl.fromTo("#ew-prog", { x: -28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "expo.out" }, 0.62);
      tl.fromTo("#ew-submit", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.26, ease: "power2.inOut" }, 0.82);
      tl.fromTo("#ew-user", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.46, ease: "power3.out" }, 0.9);
      tl.fromTo("#ew-load", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.3)" }, 1.15);
      tl.fromTo("#ew-kern", { x: 32, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, 1.22);
      tl.fromTo("#ew-nojit", { opacity: 0 }, { opacity: 1, duration: 0.28, ease: "sine.out" }, 1.55);
      tl.fromTo("#ew-no", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power4.out" }, 1.7);
      tl.fromTo("#ew-caption", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power1.inOut" }, 2.25);
  `,
});

add({
  id: "two-philosophies",
  p: "tp",
  duration: 8.2,
  ghost: "RICE",
  kicker: "Two philosophies",
  title: "Two philosophies, one axiom",
  index: "08 / 08",
  first: "spatial",
  caption:
    "Apple and Microsoft pay in context switches and platform dependence. Linux pays in expressiveness. Rice's theorem is why the verifier has to be conservative.",
  board: `
    <div class="tp-split">
      <section class="tp-group tp-magenta" id="tp-spatial">
        <p class="tp-glabel" id="tp-spatial-label">Spatial isolation</p>
        <p class="tp-gnote" id="tp-spatial-note">Apple and Microsoft</p>
        ${card("tp", "move", "magenta", "", "Move the observer", "isolated fault domain")}
        ${card("tp", "payS", "neutral", "", "Paid in", "context switches and platform dependence")}
      </section>
      <section class="tp-group tp-teal" id="tp-lang">
        <p class="tp-glabel" id="tp-lang-label">Language-level constraint</p>
        <p class="tp-gnote" id="tp-lang-note">Linux</p>
        ${card("tp", "keep", "teal", "", "Keep the observer", "restrict what it expresses")}
        ${card("tp", "payL", "neutral", "", "Paid in", "expressiveness")}
      </section>
    </div>
    <article class="tp-rice" id="tp-rice">
      <p class="tp-tag tp-magenta" id="tp-axiom">Same axiom</p>
      <h2>Rice's theorem</h2>
      <p class="tp-sub">a verifier has to be conservative, and turns some safe programs away</p>
    </article>`,
  tweens: `
      ${baseIn("tp", "rotate")}
      tl.fromTo("#tp-ghost", { opacity: 0 }, { opacity: 0.07, duration: 0.9, ease: "sine.out" }, 0.18);
      tl.fromTo("#tp-series", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.36, ease: "power2.out" }, 0.16);
      tl.fromTo("#tp-index", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0.24);
      tl.fromTo("#tp-kicker", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "circ.out" }, 0.28);
      tl.fromTo("#tp-title", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, ease: "power3.out" }, 0.34);
      tl.fromTo("#tp-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, 0.7);
      tl.fromTo("#tp-spatial", { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "expo.out" }, 0.9);
      tl.fromTo("#tp-lang", { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power4.out" }, 1.05);
      tl.fromTo("#tp-rice", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power2.out" }, 1.55);
      tl.fromTo("#tp-caption", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "sine.inOut" }, 2.15);
  `,
});

function host() {
  const slots = [
    ["ebpf-pipeline", "s-ep", 0, 7.7, 0, ""],
    ["linux-timeline", "s-lt", 7.2, 7.7, 1, "enter-fade"],
    ["macos-before-after", "s-mb", 14.4, 7.7, 0, "enter-push"],
    ["macos-staging", "s-ms", 21.6, 7.7, 1, "enter-fade"],
    ["windows-timeline", "s-wt", 28.8, 7.7, 0, "enter-push"],
    ["windows-status", "s-ws", 36.0, 7.7, 1, "enter-fade"],
    ["ebpf-windows", "s-ew", 43.2, 7.7, 0, "enter-fade"],
    ["two-philosophies", "s-tp", 50.4, 8.2, 1, "enter-push"],
  ];
  const clips = slots
    .map(
      ([id, slot, start, dur, track, enter], i) => `      <div
        id="${slot}"
        class="clip ${enter}"
        data-composition-id="${id}"
        data-composition-src="compositions/${id}.html"
        data-start="${start}"
        data-duration="${dur}"
        data-track-index="${track}"
        data-width="1920"
        data-height="1080"
        style="z-index:${i + 1}"
      ></div>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Kernel-Access Redesigned</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,700&family=IBM+Plex+Mono:wght@400;500&display=swap" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #0D1F3C; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #0D1F3C; }
      .clip { position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; }
      .enter-fade { opacity: 0; }
      .enter-push { transform: translateX(1920px); }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="kernel-access"
      data-start="0"
      data-duration="58.6"
      data-width="1920"
      data-height="1080"
    >
${clips}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.to("#s-ep", { opacity: 0, duration: 0.5, ease: "power2.inOut" }, 7.2);
      tl.fromTo("#s-lt", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.inOut", immediateRender: false }, 7.2);
      tl.to("#s-lt", { x: -1920, duration: 0.5, ease: "power3.inOut" }, 14.4);
      tl.fromTo("#s-mb", { x: 1920 }, { x: 0, duration: 0.5, ease: "power3.inOut", immediateRender: false }, 14.4);
      tl.to("#s-mb", { opacity: 0, duration: 0.5, ease: "power2.inOut" }, 21.6);
      tl.fromTo("#s-ms", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.inOut", immediateRender: false }, 21.6);
      tl.to("#s-ms", { x: -1920, duration: 0.5, ease: "power3.inOut" }, 28.8);
      tl.fromTo("#s-wt", { x: 1920 }, { x: 0, duration: 0.5, ease: "power3.inOut", immediateRender: false }, 28.8);
      tl.to("#s-wt", { opacity: 0, duration: 0.5, ease: "power2.inOut" }, 36.0);
      tl.fromTo("#s-ws", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.inOut", immediateRender: false }, 36.0);
      tl.to("#s-ws", { opacity: 0, duration: 0.5, ease: "sine.inOut" }, 43.2);
      tl.fromTo("#s-ew", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "sine.inOut", immediateRender: false }, 43.2);
      tl.to("#s-ew", { x: -1920, duration: 0.5, ease: "power3.inOut" }, 50.4);
      tl.fromTo("#s-tp", { x: 1920 }, { x: 0, duration: 0.5, ease: "power3.inOut", immediateRender: false }, 50.4);
      tl.to("#s-tp", { opacity: 0, duration: 0.7, ease: "power2.in" }, 57.8);
      window.__timelines["kernel-access"] = tl;
    </script>
  </body>
</html>
`;
}

await mkdir(dir, { recursive: true });
for (const scene of scenes) {
  const html = page(
    scene.id,
    scene.p,
    scene.duration,
    scene.ghost,
    scene.kicker,
    scene.title,
    scene.index,
    scene.board,
    scene.caption,
    scene.tweens,
  );
  await writeFile(join(dir, `${scene.id}.html`), html);
  await writeFile(join(dir, `${scene.id}.motion.json`), motion(scene.id, scene.p, scene.first, scene.duration));
}
await writeFile(join(root, "index.html"), host());

const shotDir = join(root, "shots");
await mkdir(shotDir, { recursive: true });
for (const scene of scenes) {
  const shot = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1920px; height: 1080px; overflow: hidden; background: #0D1F3C; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #0D1F3C; }
      .clip { position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="${scene.id}-shot" data-start="0" data-duration="${scene.duration}" data-width="1920" data-height="1080">
      <div
        id="slot"
        class="clip"
        data-composition-id="${scene.id}"
        data-composition-src="compositions/${scene.id}.html"
        data-start="0"
        data-duration="${scene.duration}"
        data-track-index="0"
        data-width="1920"
        data-height="1080"
      ></div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      window.__timelines["${scene.id}-shot"] = tl;
    </script>
  </body>
</html>
`;
  await writeFile(join(shotDir, `${scene.id}.html`), shot);
}
console.log(`wrote ${scenes.length} compositions`);
