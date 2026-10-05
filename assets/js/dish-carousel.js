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

    /* ── the row rolls on its own ──────────────────────────────
       A slow, steady roll the opposite way to the Instagram strip
       below it (that strip runs left, so the dishes run right; owner,
       2026-10-05). The dishes are written twice, so when the roll
       reaches the end of one copy it jumps back by exactly one copy
       and the picture never changes. Snapping is off while it rolls.
       It waits while the section is out of sight, while the page is in
       another tab and while a guest hovers or tabs through it; when
       someone drives the row themselves it stops, and picks up again
       after a few quiet seconds. A reader who asked for less motion
       never sees it move. */
    const originals = Array.from(track.children);
    const twins = originals.map(li => {
      const c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));
      c.querySelectorAll('img').forEach(img => img.setAttribute('alt', ''));
      track.appendChild(c);
      return c;
    });
    /* a dish Tafriti hides takes its twin with it */
    originals.forEach((li, i) => new MutationObserver(() => { twins[i].hidden = li.hidden; })
      .observe(li, { attributes: true, attributeFilter: ['hidden'] }));

    const SPEED = 38;          // px per second
    const QUIET = 5000;        // ms after the last touch before it rolls again
    let raf = 0, last = 0, pos = 0, held = 0, taken = false, resume = 0;

    const max = () => track.scrollWidth - track.clientWidth;
    /* distance from the far left, the same in both directions */
    const getX = () => (rtl ? track.scrollLeft + max() : track.scrollLeft);
    const setX = x => { track.scrollLeft = rtl ? x - max() : x; };
    const copyWidth = () => {
      const i = originals.findIndex(li => !li.hidden);
      return i < 0 ? 0 : Math.abs(twins[i].offsetLeft - originals[i].offsetLeft);
    };

    const frameStep = now => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const w = copyWidth();
      if (w > 0) {
        pos -= SPEED * dt / 1000;            // the view slides left, so the dishes run right
        if (pos < 1) pos += w;
        setX(pos);
      }
      raf = requestAnimationFrame(frameStep);
    };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; last = 0; track.style.scrollSnapType = ''; };
    const play = () => {
      if (taken || still.matches || held || raf) return;
      track.style.scrollSnapType = 'none';
      pos = getX();
      raf = requestAnimationFrame(frameStep);
    };
    const hold = () => { held += 1; stop(); };
    const release = () => { held = Math.max(0, held - 1); play(); };
    const take = () => {
      taken = true; stop();
      clearTimeout(resume);
      resume = setTimeout(() => { taken = false; play(); }, QUIET);
    };

    root.addEventListener('mouseenter', hold);
    root.addEventListener('mouseleave', release);
    root.addEventListener('focusin', hold);
    root.addEventListener('focusout', release);
    track.addEventListener('pointerdown', take, { passive: true });
    track.addEventListener('touchstart', take, { passive: true });
    track.addEventListener('wheel', take, { passive: true });
    track.addEventListener('click', e => { if (e.target.closest('.sig-slide')) take(); });
    if (prev) prev.addEventListener('click', take);
    if (next) next.addEventListener('click', take);
    root.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') take(); });
    document.addEventListener('visibilitychange', () => (document.hidden ? hold() : release()));

    /* a page opened in a background tab waits for its turn */
    if (document.hidden) hold();
    if ('IntersectionObserver' in window) {
      let seen = true; /* rolling until the observer says the row is away */
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting === seen) return;
          seen = e.isIntersecting;
          seen ? release() : hold();
        });
      }, { threshold: 0.2 }).observe(root);
    }
    pick();
    play();
  });
})();
