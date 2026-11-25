(async function () {
  const L = window.HubLib, R = window.HubRender;
  const $ = id => document.getElementById(id);
  const now = Date.now();
  const cat = window.THINKINFOSEC_CATALOG;
  const corpus = cat && cat.corpus && Array.isArray(cat.corpus.items) ? cat.corpus.items : [];

  const tools = L.toolItems(corpus);
  const guides = L.guideItems(corpus);
  let research = L.researchItems(corpus, []);
  let videos = L.videoItems(corpus, []);
  let news = [];

  const all = (extra) => [{ value: 'all', label: 'All' }].concat(extra);
  const pairs = obj => Object.keys(obj).map(value => ({ value, label: obj[value] }));

  function renderTools(origin) {
    R.list($('toolGrid'), L.filterBy(tools.filter(t => !t.featured), 'origin', origin),
      t => R.card(t, L.ORIGINS[t.origin] || 'Tool'), 'No tools in this group yet.');
  }
  function renderGuides(group) {
    R.list($('guideGrid'), L.filterBy(guides, 'group', group),
      g => R.card(g, L.GUIDE_GROUPS[g.group], null, { trace: true }), 'Nothing in this group yet. New items land here as they are published.');
  }
  function renderResearch(source) {
    R.list($('researchList'), L.filterBy(research, 'source', source),
      r => R.card(r, r.source === 'medium' ? 'Medium' : 'Hub research', r.source === 'medium' ? 'mag' : null, { trace: true }), 'No research yet.');
  }
  function renderVideos() {
    R.list($('videoGrid'), videos, v => R.card(v, 'YouTube'), n => R.listening(n, 'videos appear when the feed is reachable'));
  }
  function renderNews(lane) {
    R.list($('newsList'), L.filterBy(news, 'cat', lane), (n, i) => R.headlineRow(n, i, now, { thumb: true }), n => R.listening(n, 'no headlines in this lane yet'));
  }
  function renderFront() {
    const front = L.frontPage(news, 4);
    R.lead($('leadStory'), front.lead, now);
    R.list($('liveWire'), front.wire, (n, i) => R.headlineRow(n, i + 1, now), n => R.listening(n, 'waiting for the wire'));
    const latest = [
      ['Research', research.find(r => r.source === 'hub'), null],
      ['Medium', research.find(r => r.source === 'medium'), 'mag'],
      ['YouTube', videos[0], null],
      ['Guide', guides[0], 'mag']
    ].filter(x => x[1]);
    R.list($('latestRail'), latest, x => R.card(Object.assign({}, x[1], { summary: '' }), x[0], x[2], { trace: true }), 'Nothing new yet.');
  }

  R.outcomes($('outcomesBand'), tools);
  R.outcomes($('toolsOutcomes'), tools);
  R.chips($('toolChips'), all(pairs(L.ORIGINS)), renderTools);
  R.chips($('guideChips'), [{ value: 'all', label: 'All', count: guides.length }].concat(
    pairs(L.GUIDE_GROUPS).map(o => Object.assign(o, { count: guides.filter(g => g.group === o.value).length }))), renderGuides);
  R.chips($('researchChips'), all([{ value: 'hub', label: 'Hub' }, { value: 'medium', label: 'Medium' }]), renderResearch);
  R.chips($('newsChips'), all(pairs(L.LANES)), renderNews);
  renderTools('all'); renderGuides('all'); renderResearch('all'); renderVideos(); renderNews('all'); renderFront();
  $('dateline').textContent = L.formatDay(now).toUpperCase();

  const search = window.HubSearch.init({
    form: $('searchForm'), input: $('q'), status: $('searchStatus'), results: $('searchResults'),
    entries: () => L.searchEntries({ news, research, videos, tools, guides })
  });

  const [newsRes, mediaRes] = await Promise.all([window.HubFeeds.load('news.json'), window.HubFeeds.load('media.json')]);
  try {
    news = L.newsItems(newsRes.data);
    const media = L.mediaItems(mediaRes.data);
    research = L.researchItems(corpus, media);
    videos = L.videoItems(corpus, media);
    renderNews(R.activeChip($('newsChips')));
    renderResearch(R.activeChip($('researchChips')));
    renderVideos();
    renderFront();

    R.pill($('signalPill'), L.signalPill(newsRes, now, news.length));
    const stamp = $('newsStamp');
    if (newsRes.data && L.isStale(newsRes.data.generated, now, 6)) {
      stamp.className = 'notice';
      stamp.textContent = 'These headlines are more than 6 hours old. Signal may be paused.';
    } else if (newsRes.data) {
      stamp.className = 'stamp';
      stamp.textContent = 'Snapshot built ' + L.formatTime(Date.parse(newsRes.data.generated));
    }
    if ($('q').value.trim()) search.run();
  } catch (err) {
    R.pill($('signalPill'), L.signalPill(null, now, 0));
  }
})();
