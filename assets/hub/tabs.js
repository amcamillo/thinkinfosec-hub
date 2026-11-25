(function (root) {
  const ALIASES = { outcomes: 'tools', projects: 'tools', learn: 'guides', connect: 'about' };
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const ids = tabs.map(t => t.dataset.tab);
  const tablist = document.querySelector('[role="tablist"]');
  const pulse = document.querySelector('.wave-pulse');
  function placePulse() {
    const on = tabs.find(t => t.getAttribute('aria-selected') === 'true');
    if (!pulse || !on) return;
    const x = on.offsetLeft - tablist.scrollLeft + on.offsetWidth / 2 - 120;
    pulse.style.transform = 'translateX(' + Math.round(x) + 'px)';
  }

  function resolve(hash) {
    const id = String(hash || '').replace(/^#/, '');
    const real = ALIASES[id] || id;
    return ids.includes(real) ? real : 'front';
  }
  function select(id, focus) {
    tabs.forEach(t => {
      const on = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById('panel-' + t.dataset.tab).hidden = !on;
      if (on && focus) t.focus();
    });
    document.title = (id === 'front' ? '' : tabs[ids.indexOf(id)].textContent + ' · ') + 'ThinkInfoSec Hub';
    placePulse();
  }
  function go(id, focus, replace) {
    if (location.hash !== '#' + id) history[replace ? 'replaceState' : 'pushState'](null, '', '#' + id);
    select(id, focus);
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => go(t.dataset.tab, false));
    t.addEventListener('keydown', e => {
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); go(ids[j], true, true); }
    });
  });
  function known(hash) {
    const id = String(hash || '').replace(/^#/, '');
    return ids.includes(ALIASES[id] || id);
  }
  // Non-tab hashes (e.g. #main from the skip link) must not switch tabs.
  function onNav() { if (!location.hash || known(location.hash)) {
      const id = resolve(location.hash);
      if (location.hash && location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
      select(id, false);
    }
  }
  window.addEventListener('popstate', onNav);
  window.addEventListener('hashchange', onNav);

  const initial = resolve(location.hash);
  if (location.hash && location.hash !== '#' + initial) history.replaceState(null, '', '#' + initial);
  select(initial, false);
  window.addEventListener('resize', placePulse);
  tablist.addEventListener('scroll', placePulse, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePulse);
  root.HubTabs = { go, placePulse };
})(window);
