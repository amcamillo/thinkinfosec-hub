/* Load screen: runs in <head> before first paint. Hides the hub behind a signal loader until the
   app calls HubBoot.done() (feeds rendered) and web fonts are ready, then crossfades the page in.
   No JS = no loader. A 6 s cap reveals the page even if something stalls. */
(function () {
  var html = document.documentElement;
  html.classList.add('booting');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var started = Date.now(), MIN = reduce ? 0 : 700, CAP = 6000, OUT = reduce ? 250 : 1300; // covers the footer fade: 1 s plus a .24 s stagger
  var revealed = false;
  function reveal() {
    if (revealed) return;
    revealed = true;
    html.classList.add('booted');
    var cleaned = false;
    function cleanup() {
      if (cleaned) return;
      cleaned = true;
      html.classList.remove('booting', 'booted');
      var b = document.getElementById('boot');
      if (b) b.remove();
    }
    // The footer fades in last; tidy up when its fade really ends, with a timer in case it never fires.
    var foot = document.querySelector('.site-foot');
    if (foot) foot.addEventListener('transitionend', function (e) { if (e.target === foot && e.propertyName === 'opacity') cleanup(); });
    setTimeout(cleanup, OUT + 600);
  }
  function done() {
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fonts.then(function () {
      setTimeout(function () { requestAnimationFrame(reveal); }, Math.max(0, MIN - (Date.now() - started)));
    });
  }
  setTimeout(reveal, CAP);
  window.HubBoot = { done: done };
})();
