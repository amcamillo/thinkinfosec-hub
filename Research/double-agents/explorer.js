/* Double agents · interactive explorer, embedded in the article at <div class="dax" id="dax">.
 * A deterministic teaching model: stages and techniques are the FBI's, durations are illustrative.
 * Theme follows the article (research.js sets data-theme on <html>). Layout is driven by
 * container queries on .dax, so it fits whatever width the article column gives it. */
(function () {
  'use strict';
  var root = document.getElementById('dax');
  if (!root) return;

  // ---------- model ----------
  var CONTROLS = [
    { id: 'inv',  name: 'Inventory every edge', sub: 'Partner portals, mobile backends, legacy apps' },
    { id: 'sec',  name: 'Kill long-lived secrets', sub: 'No leaked keys, SAS tokens or hardcoded passwords' },
    { id: 'auth', name: 'Auth on every write endpoint', sub: 'Including dev, staging and reset flows' },
    { id: 'nhi',  name: 'Watch non-human identities', sub: 'Credential adds, consent grants, app-only sign-ins' },
    { id: 'cov',  name: 'Close sensor coverage gaps', sub: 'No unmanaged Windows hosts' },
    { id: 'hunt', name: 'Hunt behaviour, not indicators', sub: 'New-IP key use, Graph bursts, canary users' },
    { id: 'base', name: 'Baseline your own agents', sub: 'Know what normal looks like for each one' },
    { id: 'sig',  name: 'Framework signatures', sub: 'User agents like artex-selfupdate. Not one of the seven.', extra: true }
  ];
  var CNAME = {}; CONTROLS.forEach(function (c) { CNAME[c.id] = c.name; });
  var PRESETS = { none: [], typical: ['sig', 'sec', 'cov'], all: ['inv', 'sec', 'auth', 'nhi', 'cov', 'hunt', 'base'] };
  var LOOPS = [15, 30, 60, 120, 240, 480, 1440];
  var DOOR_COST = 8, LOW_TRIAGE = 90, LOOKALIKE_TRIAGE = 60, REFUSAL_COST = 6;

  var STAGES = [
    { id: 'recon', n: '01', name: 'Map the edges', short: 'Recon', dur: 35, ttp: ['T1595', 'T1580'],
      fbi: ['Directory fuzzing, 500+ requests', 'Partner and supplier portals', 'WHOIS asset mapping'],
      src: 'FBI FLASH-20261113-001: ARTEX "excels at identifying and exploiting peripheral systems".' },
    { id: 'access', n: '02', name: 'Front door first', short: 'Access', dur: 45, ttp: ['T1078', 'T1190', 'T1199', 'T1606.002'],
      fbi: ['Leaked keys and SAS tokens', 'Unsigned SAML assertions', 'SSRF, XXE, file upload', 'Cross-tenant trust abuse'],
      doors: [
        { n: 'Forgotten partner portal, valid account', by: 'inv', log: 'partner-portal sign-in, valid account, MFA not enforced' },
        { n: 'Leaked storage key from a JS bundle', by: 'sec', log: 'storage account key used from new IP' },
        { n: 'Unauthenticated reset and write API', by: 'auth', log: 'password-reset flow, account-existence check, then write' },
        { n: 'Cross-tenant trust, app consent', by: 'nhi', log: 'cross-tenant sign-in via consented guest app' }
      ],
      src: 'FBI table; Unit 42 saw cloud access through reset pages and exposed APIs "without a single CVE".' },
    { id: 'escalate', n: '03', name: 'Promote itself', short: 'Escalate', dur: 40, ttp: ['T1098.001', 'T1078.004', 'T1558.003'],
      fbi: ['Credentials added to OAuth apps', 'Cloud roles on new instances', 'Kerberoasting, DCSync'],
      src: 'FBI table: lateral movement to domain controllers was "blocked by endpoint protection" where sensors ran.' },
    { id: 'irecon', n: '04', name: 'Find the blind spots', short: 'Int. recon', dur: 30, ttp: ['T1087.002', 'T1518.001'],
      fbi: ['110,000+ AD objects enumerated', 'LAPS passwords read', 'Hosts without an EDR sensor'],
      src: 'FBI table: the agent "inventoried endpoint sensor coverage to identify Windows machines without CrowdStrike Falcon".' },
    { id: 'collect', n: '05', name: 'Stage the data', short: 'Collect', dur: 45, ttp: ['T1530', 'T1114.002', 'T1074.002'],
      fbi: ['Mass blob reads', 'Mailboxes read', '100 GB staging volumes'],
      src: 'FBI table. The objective in this model is data staged and ready to leave.' }
  ];
  var C2 = { id: 'c2', n: '06', name: 'Hide the traffic', short: 'C2', ttp: ['T1090.003', 'T1572', 'T1071.001'],
    fbi: ['Residential proxies, Tor', 'SOCKS proxies, compromised relays', 'Chisel, SoftEther tunnels'],
    src: 'FBI table. Runs underneath every other stage.' };

  var OWN = [
    [6, 'svc-backup-agent', 'storage key used, 2,400 blobs read'],
    [24, 'copilot-ops', 'Graph: list users and groups, 3,100 objects'],
    [52, 'svc-sync-reports', 'client-secret sign-in, app-only'],
    [78, 'finops-agent', 'role assignments read on subscription'],
    [112, 'svc-backup-agent', 'snapshot volume attached, 40 GB'],
    [141, 'copilot-ops', 'mailbox read via Graph, 12 messages'],
    [168, 'svc-sync-reports', 'credential rotated on OAuth app'],
    [201, 'finops-agent', 'Graph batch, 900 requests in 2 min']
  ];

  // ---------- markup (static template, no user data) ----------
  function seg(name, opts) {
    return '<fieldset class="d-seg"><legend>' + name[1] + '</legend>' + opts.map(function (o, i) {
      return '<label><input type="radio" name="dax-' + name[0] + '" value="' + o[0] + '"' + (i ? '' : ' checked') + '><span>' + o[1] + '<small>' + o[2] + '</small></span></label>';
    }).join('') + '</fieldset>';
  }
  root.innerHTML = '<div class="d-wrap">' +
    '<div class="d-panel d-deck">' +
      '<div class="d-grp d-kit"><div class="d-step"><span>1</span> The attacker\'s kit</div>' +
        seg(['harness', 'Harness'], [['stock', 'Stock ARTEX', 'default user agents'], ['fork', 'Forked ARTEX', 'one string changed'], ['mixed', 'Strix + Cairn + Hermes', 'mixed toolset (Gambit)']]) +
        seg(['model', 'Model behind it'], [['cheap', 'Low-cost model', 'no observable guardrails'], ['framed', 'Frontier, framed', 'told it\'s a pen test'], ['unframed', 'Frontier, plain', 'asked outright']]) +
      '</div>' +
      '<div class="d-grp d-ctrls"><div class="d-step"><span>2</span> Your controls' +
        '<div class="d-presets" role="group" aria-label="Presets"><button type="button" data-preset="none">None</button><button type="button" data-preset="typical">Typical estate</button><button type="button" data-preset="all">All seven</button></div></div>' +
        '<div class="d-controls"></div></div>' +
      '<div class="d-grp d-loopg"><div class="d-step"><span>3</span> Your response loop</div>' +
        '<label class="d-slider">Alert to containment action <output class="d-loopout">4 h</output><input type="range" class="d-loop" min="0" max="6" step="1" value="4" aria-label="Response loop"></label>' +
        '<small class="d-hint">Illustrative. Paging, approval and the change itself.</small>' +
        '<div class="d-clocks" aria-label="Your loop against the agent\'s clock"></div></div>' +
    '</div>' +
    '<div class="d-panel d-race"><div class="d-step"><span>4</span> The race <small class="d-tag">illustrative timings</small></div>' +
      '<div class="d-verdict" role="status" aria-live="polite"></div>' +
      '<div class="d-chartwrap"><svg class="d-chart" role="img" aria-label="Timeline of the intrusion against the defender\'s response"></svg></div>' +
      '<p class="d-hint">Hover a stage to trace it through the logs. Click it to open what the FBI saw there.</p></div>' +
    '<div class="d-panel d-detail"></div>' +
    '<div class="d-panel d-logs"><div class="d-step"><span>5</span> What reaches your logs</div>' +
      '<p class="d-hint">The framework runs on the attacker\'s side of the wire. This is what arrives. Some rows are your own agents. Can you tell which?</p>' +
      '<label class="d-reveal"><input type="checkbox" class="d-revealbox"> Reveal the handler</label>' +
      '<div class="d-logbox"><ol class="d-log"></ol></div></div>' +
    '</div><div class="d-tip" hidden></div>';
  var $ = function (s) { return root.querySelector(s); };

  // ---------- state ----------
  var st = { harness: 'stock', model: 'cheap', on: {}, loop: 4, sel: 'access' };

  function run() {
    var on = st.on, t = 0, out = { stages: [], alerts: [], rows: [], blocked: null, notes: [] };
    var ua = st.harness === 'stock' ? 'artex-selfupdate' : st.harness === 'fork' ? 'Mozilla/5.0 (Windows NT 10.0)' : 'python-httpx/0.27';
    function alert(at, stage, what, conf, lookalike, ctl) { out.alerts.push({ t: at, stage: stage, what: what, conf: conf, lookalike: !!lookalike && !on.base, ctl: ctl }); }
    function row(at, stage, who, what, flag, cls) { out.rows.push({ t: at, stage: stage, who: who, what: what, flag: flag || '', cls: cls || '', atk: true }); }

    STAGES.forEach(function (s) {
      if (out.blocked) return;
      var g = { s: s, start: t, doors: [], paths: [] }, d = s.dur;
      if (s.id === 'recon') {
        if (st.model === 'unframed') { d += REFUSAL_COST; out.notes.push('The frontier model refused the plain request. The harness retried on an older model and carried on (+' + REFUSAL_COST + ' min).'); row(t + 1, s.id, 'harness', 'model refusal, retried on fallback model', 'refused, then rerouted', 'b'); }
        var sigHit = on.sig && st.harness === 'stock';
        row(t + 2, s.id, '203.0.113.47', 'GET /partners/* 512 requests, ua: ' + ua, sigHit ? 'alert: framework user agent' : '', sigHit ? 'b' : '');
        if (on.sig) {
          if (sigHit) alert(t + 3, s.id, 'Signature hit: artex-selfupdate user agent', 'high', false, 'sig');
          else out.notes.push('Your signature looked for artex-selfupdate. The ' + (st.harness === 'fork' ? 'fork' : 'mixed toolset') + ' never sent it.');
        }
        row(t + 18, s.id, '203.0.113.47', on.inv ? 'portal map: 3 known apps, all owned' : 'portal map: 11 apps, 4 nobody owns', '');
        g.paths = [{ n: 'Directory fuzzing', st: sigHit ? 'seen' : 'open', by: sigHit ? 'sig' : '' },
                   { n: 'Forgotten apps found', st: on.inv ? 'closed' : 'open', by: on.inv ? 'inv' : '' }];
      }
      if (s.id === 'access') {
        var open = null, k = 0;
        s.doors.forEach(function (dr) {
          if (open) { g.paths.push({ n: dr.n, st: 'unused' }); return; }
          if (on[dr.by]) {
            g.doors.push({ t: t + k * DOOR_COST, n: dr.n });
            row(t + k * DOOR_COST + 2, s.id, 'app 7c1e…', dr.log + ': refused', 'closed by ' + CNAME[dr.by], 'blk');
            g.paths.push({ n: dr.n, st: 'closed', by: dr.by }); k++;
          } else { open = dr; g.paths.push({ n: dr.n, st: 'open' }); }
        });
        var tried = k * DOOR_COST;
        if (!open) { g.end = t + tried; g.blockedHere = true; out.blocked = s; out.stages.push(g); t = g.end; return; }
        d += tried;
        var at = t + tried + 4;
        row(at, s.id, 'app 7c1e…', open.log, on.hunt ? 'alert: first use from new IP' : 'alert: noisy auth burst (low confidence)', 'b');
        if (on.hunt) alert(at + 1, s.id, 'Behaviour hunt: key or account used from a new IP', 'high', true, 'hunt');
        else alert(at + 1, s.id, 'Noisy traffic alert, one of hundreds today', 'low', false, null);
        if (on.base) { row(t + d - 6, s.id, 'app 7c1e…', 'Graph token issued, app-only', 'deviates from every agent baseline', 'b'); alert(t + d - 5, s.id, 'Principal matches no known agent baseline', 'high', false, 'base'); }
      }
      if (s.id === 'escalate') {
        row(t + 5, s.id, 'svc-sync-reports', 'credential added to OAuth app', on.nhi ? 'alert: app credential added' : '', on.nhi ? 'b' : '');
        if (on.nhi) alert(t + 6, s.id, 'NHI monitor: credential added to OAuth app', 'high', true, 'nhi');
        row(t + 16, s.id, 'svc-sync-reports', 'role assigned to new VM instance', '');
        if (on.cov) { row(t + 24, s.id, 'WKS-114', 'Kerberos relay toward DC01', 'blocked by endpoint protection', 'blk'); alert(t + 25, s.id, 'Endpoint: lateral movement to DC blocked', 'high', false, 'cov'); }
        else row(t + 24, s.id, 'WKS-114', 'DCSync against DC01', '');
        g.paths = [{ n: 'Credential added to OAuth app', st: on.nhi ? 'seen' : 'open', by: on.nhi ? 'nhi' : '' },
                   { n: 'Cloud roles on new instances', st: 'open' },
                   { n: 'Kerberoasting, DCSync', st: on.cov ? 'closed' : 'open', by: on.cov ? 'cov' : '' }];
      }
      if (s.id === 'irecon') {
        row(t + 4, s.id, 'svc-sync-reports', 'Graph: list users and groups, 110,412 objects', on.hunt ? 'alert: Graph enumeration burst' : '', on.hunt ? 'b' : '');
        if (on.hunt) alert(t + 5, s.id, 'Behaviour hunt: Graph enumeration burst', 'high', true, 'hunt');
        row(t + 14, s.id, 'svc-sync-reports', 'LAPS passwords read, 37 hosts', '');
        row(t + 22, s.id, 'svc-sync-reports', on.cov ? 'sensor inventory: 0 unmanaged hosts' : 'sensor inventory: 23 hosts without EDR', on.cov ? 'no blind spot to land on' : '', on.cov ? 'blk' : '');
        g.paths = [{ n: '110,000+ AD objects enumerated', st: on.hunt ? 'seen' : 'open', by: on.hunt ? 'hunt' : '' },
                   { n: 'LAPS passwords read', st: 'open' },
                   { n: 'Hosts without an EDR sensor', st: on.cov ? 'closed' : 'open', by: on.cov ? 'cov' : '' }];
      }
      if (s.id === 'collect') {
        row(t + 6, s.id, 'svc-sync-reports', 'blob list and read, 18,000 objects', on.hunt ? 'alert: write-then-delete test, then mass read' : '', on.hunt ? 'b' : '');
        if (on.hunt) alert(t + 7, s.id, 'Behaviour hunt: write-then-delete, then mass read', 'high', false, 'hunt');
        row(t + 20, s.id, 'svc-sync-reports', 'mailboxes read via Graph, 64 users', '');
        row(t + 38, s.id, 'svc-sync-reports', '100 GB staging volume attached', '');
        g.paths = [{ n: 'Mass blob reads', st: on.hunt ? 'seen' : 'open', by: on.hunt ? 'hunt' : '' }, { n: 'Mailboxes read', st: 'open' }, { n: '100 GB staging volumes', st: 'open' }];
      }
      g.end = t + d; t = g.end; out.stages.push(g);
    });

    out.priv = out.stages[2] ? out.stages[2].end : null;
    out.objective = out.blocked ? null : t;
    out.alerts.forEach(function (a) {
      a.triage = (a.conf === 'low' ? LOW_TRIAGE : 0) + (a.lookalike ? LOOKALIKE_TRIAGE : 0);
      a.contain = a.t + a.triage + LOOPS[st.loop];
    });
    out.alerts.sort(function (a, b) { return a.contain - b.contain; });
    out.best = out.alerts[0] || null;
    OWN.forEach(function (o) { out.rows.push({ t: o[0], stage: null, who: o[1], what: o[2], flag: '', cls: '', atk: false }); });
    out.rows.sort(function (a, b) { return a.t - b.t; });
    if (out.blocked) out.rows = out.rows.filter(function (r) { return !r.atk || r.t <= t; });
    return out;
  }

  // ---------- helpers ----------
  function fmt(m) { m = Math.round(m); var h = Math.floor(m / 60), r = m % 60; return h ? h + ' h' + (r ? ' ' + r + ' min' : '') : r + ' min'; }
  function clock(m) { m = Math.round(m); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
  function el(tag, attrs, parent, text) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // ---------- controls ----------
  var ctlBox = $('.d-controls');
  CONTROLS.forEach(function (c) {
    var l = h('label', 'd-ctl' + (c.extra ? ' extra' : ''));
    var i = document.createElement('input'); i.type = 'checkbox'; i.value = c.id;
    l.appendChild(i); l.appendChild(h('span', null, c.name)); l.appendChild(h('small', null, c.sub));
    i.addEventListener('change', function () { st.on[c.id] = i.checked; l.classList.toggle('on', i.checked); render(); });
    ctlBox.appendChild(l);
  });
  root.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      st.on = {}; PRESETS[b.dataset.preset].forEach(function (id) { st.on[id] = true; });
      ctlBox.querySelectorAll('input').forEach(function (i) { i.checked = !!st.on[i.value]; i.parentNode.classList.toggle('on', i.checked); });
      render();
    });
  });
  root.querySelectorAll('input[name=dax-harness]').forEach(function (i) { i.addEventListener('change', function () { st.harness = i.value; render(); }); });
  root.querySelectorAll('input[name=dax-model]').forEach(function (i) { i.addEventListener('change', function () { st.model = i.value; render(); }); });
  var loop = $('.d-loop'), loopOut = $('.d-loopout');
  loop.addEventListener('input', function () { st.loop = +loop.value; render(); });
  $('.d-revealbox').addEventListener('change', function (e) { $('.d-log').classList.toggle('revealed', e.target.checked); });

  // ---------- render ----------
  var svg = $('.d-chart'), tip = $('.d-tip'), wrap = $('.d-chartwrap');
  var last = null, W = 760, X0 = 60, X1 = 745, narrow = false;

  function render() {
    var r = run(); last = r;
    loopOut.textContent = fmt(LOOPS[st.loop]);
    verdict(r); chart(r); logs(r); detail(r); clocks(r);
  }

  function verdict(r) {
    var v = $('.d-verdict'), b, s, cls, c = r.best ? r.best.contain : Infinity;
    if (r.blocked) { cls = 'win'; b = 'Blocked at the front door.'; s = 'Every way in was closed. The agent tried all ' + r.stages[1].doors.length + ' doors in ' + fmt(r.stages[1].end - r.stages[1].start) + ' and gave up on this target. It will try the next one.'; }
    else if (c < r.priv) { cls = 'win'; b = 'Contained at ' + fmt(c) + ', before it got admin.'; s = 'Privileged access would have landed at ' + fmt(r.priv) + '. ' + why(r); }
    else if (c < r.objective) { cls = 'part'; b = 'Contained at ' + fmt(c) + ', after admin, before the data was staged.'; s = 'It owned admin at ' + fmt(r.priv) + '. You stopped it ' + fmt(r.objective - c) + ' short of the objective. ' + why(r); }
    else { cls = 'lose'; b = 'Objective complete at ' + fmt(r.objective) + '. You acted ' + (isFinite(c) ? 'at ' + fmt(c) : 'never') + '.'; s = r.best ? why(r) : 'Nothing you run produced an alert anyone would act on.'; }
    v.className = 'd-verdict ' + cls;
    v.replaceChildren(h('b', null, b), h('span', null, s + (r.notes.length ? ' ' + r.notes.join(' ') : '')));
  }
  function why(r) {
    var a = r.best, parts = ['First actionable alert: ' + a.what.toLowerCase() + ' at ' + fmt(a.t) + '.'];
    if (a.conf === 'low') parts.push('Low confidence, so it sat in triage for ' + fmt(LOW_TRIAGE) + '.');
    if (a.lookalike) parts.push('It looked like one of your own agents, so another ' + fmt(LOOKALIKE_TRIAGE) + ' went on telling them apart.');
    parts.push('Then your ' + fmt(LOOPS[st.loop]) + ' response loop.');
    return parts.join(' ');
  }

  function chart(r) {
    // draw at the container's real pixel width so type stays legible at every size
    W = Math.max(220, Math.round(wrap.clientWidth || 760)); narrow = W < 600;
    X0 = narrow ? 38 : 60; X1 = W - 14;
    var endT = r.blocked ? r.stages[r.stages.length - 1].end : r.objective;
    var c = r.best ? r.best.contain : null;
    var dom = Math.min(600, Math.max(240, endT + 20, c != null && c <= 600 ? c + 20 : 0));
    var sx = function (m) { return X0 + (Math.min(m, dom) / dom) * (X1 - X0); };
    var H = 230; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.replaceChildren();
    var step = dom > 360 || narrow ? 60 : 30, ax = el('g', { class: 'axis' }, svg);
    for (var m = 0; m <= dom; m += step) {
      el('line', { x1: sx(m), x2: sx(m), y1: 22, y2: H - 22 }, ax);
      el('text', { x: sx(m), y: H - 6, 'text-anchor': 'middle' }, ax, m === 0 ? (narrow ? '0' : 'targeting') : fmt(m));
    }
    el('text', { x: 4, y: 74, class: 'lane' }, svg, narrow ? 'AGT' : 'AGENT');
    el('text', { x: 4, y: 116, class: 'lane' }, svg, 'C2');
    el('text', { x: 4, y: 170, class: 'lane' }, svg, 'YOU');
    el('line', { x1: sx(180), x2: sx(180), y1: 14, y2: H - 22, class: 'ref' }, svg);
    el('text', { x: sx(180) + 4, y: 20, class: 'ref-t' }, svg, narrow ? '3 h' : '3 h (Microsoft, FBI)');

    r.stages.forEach(function (g, i) {
      var gg = el('g', { class: 'stage' + (st.sel === g.s.id ? ' sel' : ''), 'data-stage': g.s.id, tabindex: 0, role: 'button', 'aria-label': g.s.n + ' ' + g.s.name + ', ' + fmt(g.start) + ' to ' + fmt(g.end) }, svg);
      g.doors.forEach(function (d) {
        el('rect', { x: sx(d.t) + 1, y: 56, width: Math.max(2, sx(d.t + DOOR_COST) - sx(d.t) - 2), height: 34, class: 'door' }, gg);
        el('line', { x1: sx(d.t + DOOR_COST) - 1, x2: sx(d.t + DOOR_COST) - 1, y1: 52, y2: 94, class: 'wall thin' }, gg);
      });
      var bx = sx(g.start + g.doors.length * DOOR_COST);
      if (!g.blockedHere) el('rect', { x: bx, y: 56, width: Math.max(2, sx(g.end) - bx), height: 34, class: 'blk s' + i }, gg);
      else { el('line', { x1: sx(g.end) + 2, x2: sx(g.end) + 2, y1: 46, y2: 100, class: 'wall' }, gg); el('rect', { x: sx(g.start), y: 56, width: sx(g.end) - sx(g.start), height: 34, class: 'blk ghost' }, gg); }
      el('text', { x: sx(g.start) + 3, y: 48 - (i % 2) * 12 }, gg, narrow ? g.s.n : g.s.n + ' ' + g.s.short);
      bind(gg, g.s, g);
    });
    if (!r.blocked) {
      var c2g = el('rect', { x: sx(0), y: 108, width: sx(r.objective) - sx(0), height: 10, class: 'c2bar', 'data-stage': 'c2' }, svg); bind(c2g, C2, null);
      el('line', { x1: sx(r.priv), x2: sx(r.priv), y1: 40, y2: 100, class: 'obj dash' }, svg);
      el('text', { x: sx(r.priv) - 4, y: 104, 'text-anchor': 'end', class: 'obj-t' }, svg, 'admin ' + fmt(r.priv));
      el('line', { x1: sx(r.objective), x2: sx(r.objective), y1: 30, y2: 122, class: 'obj' }, svg);
      el('text', { x: sx(r.objective) + 4, y: 34, class: 'obj-t' }, svg, 'data staged');
    }
    r.alerts.forEach(function (a) { if (a !== r.best) { var x = sx(a.t); el('path', { d: 'M' + x + ' 156 l5 6 l-5 6 l-5 -6 z', class: 'alert dimmed' }, svg); } });
    if (r.best) {
      var a = r.best, ax0 = sx(a.t), tx = sx(a.t + a.triage), cx = sx(a.contain);
      el('path', { d: 'M' + ax0 + ' 90 L ' + ax0 + ' 150', class: 'flow' }, svg);
      if (a.triage) el('rect', { x: ax0, y: 154, width: Math.max(1, tx - ax0), height: 16, class: 'triage' }, svg);
      el('rect', { x: tx, y: 154, width: Math.max(1, cx - tx), height: 16, class: 'resp' }, svg);
      el('path', { d: 'M' + ax0 + ' 150 l7 9 l-7 9 l-7 -9 z', class: 'alert' }, svg);
      if (a.triage) el('text', { x: ax0 + 4, y: 186 }, svg, 'triage ' + fmt(a.triage));
      el('text', { x: Math.min(tx + 4, X1 - 110), y: 200 }, svg, 'response ' + fmt(LOOPS[st.loop]));
      if (a.contain <= dom) {
        var far = cx > X1 - 110;
        el('line', { x1: cx, x2: cx, y1: 140, y2: 178, class: 'contain' }, svg);
        el('text', { x: far ? cx - 4 : cx + 4, y: 148, 'text-anchor': far ? 'end' : 'start', class: 'contain-t' }, svg, 'contained ' + fmt(a.contain));
      } else el('text', { x: X1, y: 148, 'text-anchor': 'end', class: 'contain-t' }, svg, 'contained ' + fmt(a.contain) + ' →');
    } else el('text', { x: sx(20), y: 166, class: 'lane' }, svg, 'no actionable alert');
  }

  function bind(node, s, g) {
    function show(e) {
      highlight(s.id); tip.hidden = false;
      tip.replaceChildren(h('b', null, s.n + ' · ' + s.name + (g ? '  ' + clock(g.start) + '–' + clock(g.end) : '')), h('div', null, s.fbi.join(' · ')), h('div', null, s.ttp.join('  ')));
      move(e);
    }
    function move(e) {
      if (!e || e.clientX == null) { var bb = node.getBoundingClientRect(); e = { clientX: bb.left + bb.width / 2, clientY: bb.top }; }
      tip.style.left = Math.max(8, Math.min(e.clientX + 14, innerWidth - 296)) + 'px'; tip.style.top = (e.clientY + 16) + 'px';
    }
    function hide() { tip.hidden = true; highlight(null); }
    node.addEventListener('mouseenter', show); node.addEventListener('mousemove', move); node.addEventListener('mouseleave', hide);
    node.addEventListener('focus', show); node.addEventListener('blur', hide);
    node.addEventListener('click', function () { st.sel = s.id; render(); });
    node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); st.sel = s.id; render(); } });
  }

  function highlight(id) {
    svg.querySelectorAll('.stage').forEach(function (g) { g.classList.toggle('dim', !!id && g.dataset.stage !== id); });
    root.querySelectorAll('.d-log li').forEach(function (li) {
      var hit = id && li.dataset.stage === id;
      li.classList.toggle('hl', !!hit); li.classList.toggle('fade', !!id && !hit);
    });
  }

  function logs(r) {
    var ol = $('.d-log'); ol.replaceChildren();
    var c = r.best ? r.best.contain : Infinity;
    r.rows.forEach(function (x) {
      var li = h('li', x.atk ? 'atk' : 'own');
      if (x.stage) li.dataset.stage = x.stage;
      if (x.atk && x.t > c) li.classList.add('after');
      li.appendChild(h('span', 't', clock(x.t)));
      li.appendChild(h('span', 'who', x.who));
      li.appendChild(h('span', 'what', x.what));
      if (x.flag) li.appendChild(h('span', 'flag ' + x.cls, '⚑ ' + x.flag));
      if (x.atk && x.t > c) li.appendChild(h('span', 'flag blk', 'would have happened, but you were already in'));
      if (x.stage) {
        li.addEventListener('mouseenter', function () { highlight(x.stage); });
        li.addEventListener('mouseleave', function () { highlight(null); });
      }
      ol.appendChild(li);
    });
  }

  function detail(r) {
    var box = $('.d-detail');
    var s = st.sel === 'c2' ? C2 : STAGES.filter(function (x) { return x.id === st.sel; })[0];
    var g = r.stages.filter(function (x) { return x.s.id === st.sel; })[0];
    box.replaceChildren();
    var hd = h('div', 'd-step'); hd.appendChild(h('span', null, s.n)); hd.appendChild(document.createTextNode(' ' + s.name));
    hd.appendChild(h('small', 'd-tag', g ? clock(g.start) + ' to ' + clock(g.end) : (s === C2 ? 'throughout' : 'never reached')));
    box.appendChild(hd);
    var grid = h('div', 'd-dgrid'), left = h('div'), right = h('div');
    left.appendChild(h('div', 'd-kicker', 'What the FBI saw'));
    var ul = h('ul'); s.fbi.forEach(function (f) { ul.appendChild(h('li', null, f)); }); left.appendChild(ul);
    s.ttp.forEach(function (t) { left.appendChild(h('span', 'd-ttp', t)); });
    right.appendChild(h('div', 'd-kicker', 'In this run'));
    var paths = g ? g.paths : [];
    if (!paths.length) right.appendChild(h('p', 'd-hint', s === C2 ? 'Proxies and tunnels rotate with every fork, so no control here closes it. Behaviour and identity controls catch what travels over it.' : 'The intrusion never got this far.'));
    paths.forEach(function (p) {
      var d = h('div', 'd-path'); d.appendChild(h('span', null, p.n));
      var lab = p.st === 'closed' ? 'closed · ' + CNAME[p.by] : p.st === 'seen' ? 'seen · ' + CNAME[p.by] : p.st === 'unused' ? 'not needed' : 'open';
      d.appendChild(h('em', p.st === 'unused' ? 'plain' : p.st, lab)); right.appendChild(d);
    });
    grid.appendChild(left); grid.appendChild(right); box.appendChild(grid);
    box.appendChild(h('p', 'd-src', s.src));
  }

  function clocks(r) {
    var box = $('.d-clocks'), loopM = LOOPS[st.loop];
    var you = r.best ? r.best.triage + loopM : null;
    var rows = r.blocked ? [['a', 'Agent: gave up after', r.stages[1].end]] : [['a', 'Agent: to admin', r.priv], ['b', 'Agent: to data staged', r.objective]];
    rows.push(['y' + (r.blocked || (r.best && r.best.contain < r.objective) ? ' win' : ''), 'You: alert to action', you]);
    var max = Math.max.apply(null, rows.map(function (x) { return x[2] || 0; }).concat([240]));
    box.replaceChildren();
    rows.forEach(function (x) {
      var d = h('div', 'd-clk ' + x[0]); d.appendChild(h('span', null, x[1])); d.appendChild(h('b', null, x[2] == null ? 'no alert' : fmt(x[2])));
      var bar = h('i'), fill = h('u'); fill.style.width = (x[2] == null ? 0 : Math.min(100, x[2] / max * 100)) + '%';
      bar.appendChild(fill); d.appendChild(bar); box.appendChild(d);
    });
  }

  var raf = 0;
  if ('ResizeObserver' in window) new ResizeObserver(function () {
    cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { if (last && Math.abs((wrap.clientWidth || 0) - W) > 2) chart(last); });
  }).observe(wrap);

  render();
})();
