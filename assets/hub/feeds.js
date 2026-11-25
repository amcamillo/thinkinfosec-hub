(function (root) {
  const BASE = 'https://thinkinfosec.github.io/Signal/';
  async function load(name) {
    const key = 'hub-feed:' + name;
    try {
      const res = await fetch(BASE + name, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data || !Array.isArray(data.items)) throw new Error('bad feed shape');
      try { localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data })); } catch (e) {}
      return { data, cached: false };
    } catch (err) {
      try {
        const hit = JSON.parse(localStorage.getItem(key) || 'null');
        if (hit && hit.data) return { data: hit.data, cached: true };
      } catch (e) {}
      return { data: null, cached: false };
    }
  }
  root.HubFeeds = { load };
})(window);
