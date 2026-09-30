/* ============================================================
   Havana Plus — signature dishes carousel
   The track is a plain scroll-snap row, so phones swipe it natively.
   This only marks the dish nearest the middle as active, moves one
   dish per arrow / arrow key, and brings a peeking neighbour to the
   middle when it is tapped (instead of opening the menu).
   ============================================================ */
(() => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-carousel]').forEach(root => {
    const track = root.querySelector('.sig-track');
    const prev = root.querySelector('.sig-prev');
    const next = root.querySelector('.sig-next');
    const rtl = getComputedStyle(root).direction === 'rtl';
    if (!track) return;

    // Tafriti may hide a sold-out dish after load
    const slides = () => Array.from(track.children).filter(li => !li.hidden);
    const centre = el => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; };
    let active = null;

    const pick = () => {
      const list = slides();
      const mid = centre(track);
      let best = null, dist = Infinity;
      list.forEach(s => { const d = Math.abs(centre(s) - mid); if (d < dist) { dist = d; best = s; } });
      list.forEach(s => s.classList.toggle('is-active', s === best));
      active = best;
      const i = list.indexOf(best);
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = i >= list.length - 1;
    };

    const show = slide => {
      if (!slide) return;
      track.scrollBy({ left: centre(slide) - centre(track), behavior: still.matches ? 'auto' : 'smooth' });
    };
    const go = step => {
      const list = slides();
      show(list[Math.min(list.length - 1, Math.max(0, list.indexOf(active) + step))]);
    };

    let frame = 0;
    track.addEventListener('scroll', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(pick); }, { passive: true });
    window.addEventListener('resize', pick);
    if (prev) prev.addEventListener('click', () => go(-1));
    if (next) next.addEventListener('click', () => go(1));
    root.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      go((e.key === 'ArrowRight') !== rtl ? 1 : -1);
    });
    track.addEventListener('click', e => {
      const li = e.target.closest('.sig-slide');
      if (li && li !== active) { e.preventDefault(); show(li); }
    });
    new MutationObserver(pick).observe(track, { subtree: true, attributes: true, attributeFilter: ['hidden'] });

    // open on the second dish so a neighbour peeks in on both sides
    const start = slides()[1];
    if (start) track.scrollLeft += centre(start) - centre(track);
    pick();

    /* ── the row moves on its own ─────────────────────────────
       A step every few seconds, walking back and forth rather than
       jumping home at the end. It waits while the section is out of
       sight, while the page is in another tab and while a guest is
       hovering or tabbing through it, and it gives up for good the
       moment someone drives the row themselves. A reader who asked
       for less motion never sees it move. */
    const DELAY = 3000;
    let timer = 0, dir = 1, held = 0, taken = false;

    const tick = () => {
      const list = slides();
      /* read the middle dish here and now: pick() runs in an animation
         frame, which a background tab never gives us */
      const mid = centre(track);
      let here = active, gap = Infinity;
      list.forEach(s => { const d = Math.abs(centre(s) - mid); if (d < gap) { gap = d; here = s; } });
      const i = list.indexOf(here);
      if (i < 0 || list.length < 2) return;
      if (i >= list.length - 1) dir = -1;
      if (i <= 0) dir = 1;
      show(list[i + dir]);
    };
    const stop = () => { clearInterval(timer); timer = 0; };
    const play = () => { if (taken || still.matches || held || timer) return; timer = setInterval(tick, DELAY); };
    const hold = () => { held += 1; stop(); };
    const release = () => { held = Math.max(0, held - 1); play(); };
    const take = () => { taken = true; stop(); };

    root.addEventListener('mouseenter', hold);
    root.addEventListener('mouseleave', release);
    root.addEventListener('focusin', hold);
    root.addEventListener('focusout', release);
    track.addEventListener('pointerdown', take, { passive: true });
    track.addEventListener('touchstart', take, { passive: true });
    track.addEventListener('click', e => { if (e.target.closest('.sig-slide')) take(); });
    if (prev) prev.addEventListener('click', take);
    if (next) next.addEventListener('click', take);
    root.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') take(); });
    document.addEventListener('visibilitychange', () => (document.hidden ? hold() : release()));

    /* a page opened in a background tab waits for its turn */
    if (document.hidden) hold();
    if ('IntersectionObserver' in window) {
      let seen = true; /* playing until the observer says the row is away */
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting === seen) return;
          seen = e.isIntersecting;
          seen ? release() : hold();
        });
      }, { threshold: 0.35 }).observe(root);
    }
    play();
  });
})();
