/* ============================================================
   Havana Plus — keep the hero video rolling

   The video autoplays, muted and looping, straight from the HTML — no
   pause button, by the owner's choice. Some phones still hold it back
   (iPhone Low Power Mode, a data saver) or stop it when the tab is put
   away; this starts it again on the first touch, tap, scroll or key, and
   whenever the page comes back into view. Chrome/Android take the VP9
   file (smaller); Safari/iPhone skip it and take the H.264 one.
   ============================================================ */
(() => {
  const video = document.querySelector('.hero-video');
  if (!video) return;

  const roll = () => {
    if (!video.paused || document.hidden) return;
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  };

  ['touchstart', 'pointerdown', 'scroll', 'keydown'].forEach(type =>
    window.addEventListener(type, roll, { passive: true }));
  document.addEventListener('visibilitychange', roll);
  video.addEventListener('pause', roll);

  roll();
})();
