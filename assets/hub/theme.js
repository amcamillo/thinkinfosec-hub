(function () {
  const buttons = document.querySelectorAll('[data-theme-set]');
  function apply(theme, save) {
    document.documentElement.setAttribute('data-theme', theme);
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === theme)));
    if (save) { try { localStorage.setItem('hub-theme', theme); } catch (e) {} }
  }
  apply(document.documentElement.getAttribute('data-theme') || 'dark', false);
  buttons.forEach(b => b.addEventListener('click', () => apply(b.dataset.themeSet, true)));
})();
