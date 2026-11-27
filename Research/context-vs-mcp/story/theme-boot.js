// Runs before first paint: the story is dark by default; a reader's explicit choice wins.
(function () {
  var t = null;
  try { t = localStorage.getItem('tih-story-theme'); } catch (e) {}
  document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
})();
