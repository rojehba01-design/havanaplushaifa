/* ============================================================
   Havana Plus — keep the hero video rolling

   The video autoplays, muted and looping, straight from the HTML — no
   pause button, by the owner's choice. Some phones still hold it back
   (iPhone Low Power Mode, a data saver) or stop it when the tab is put
   away; this starts it again on the first touch, tap, scroll or key, and
   whenever the page comes back into view. Chrome/Android take the VP9
   file (smaller); Safari/iPhone skip it and take the H.264 one.

   Once the hero is scrolled off screen the video is paused, so the phone
   is not decoding video while the visitor scrolls the rest of the page
   (that made scrolling lag, 2026-10-06); it rolls again on the way back.
   The same goes for the two endless photo rows (dishes, Instagram):
   they stand still while off screen.
   ============================================================ */
(() => {
  if ('IntersectionObserver' in window) {
    const rows = new IntersectionObserver(list => list.forEach(e =>
      e.target.classList.toggle('is-off', !e.isIntersecting)));
    document.querySelectorAll('.dish-track, .social-track').forEach(t => rows.observe(t));
  }

  const video = document.querySelector('.hero-video');
  if (!video) return;

  let onScreen = true;

  const roll = () => {
    if (!onScreen || !video.paused || document.hidden) return;
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) roll(); else video.pause();
    }).observe(video);
  }

  ['touchstart', 'pointerdown', 'scroll', 'keydown'].forEach(type =>
    window.addEventListener(type, roll, { passive: true }));
  document.addEventListener('visibilitychange', roll);
  video.addEventListener('pause', roll);

  roll();
})();
