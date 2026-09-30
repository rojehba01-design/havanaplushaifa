/* ============================================================
   Havana Plus — stand the street sign on the bottom of the page

   The sign's column sits beside the location card. Its post has to run
   from there down to the very bottom of the page (through the footer),
   on every screen size, and that distance depends on the language, the
   width and when the fonts and map finish loading — so measure it and
   hand it to the CSS as --drop.
   ============================================================ */
(() => {
  const cell = document.querySelector('.visit-pole');
  const foot = document.querySelector('.site-foot');
  if (!cell || !foot) return;

  // phones: the post stands ON the dark footer (its foot plate on the
  // footer's top edge) instead of running through it
  const phone = window.matchMedia('(max-width: 900px)');
  let last = null;
  const place = () => {
    const bottomOfCell = cell.getBoundingClientRect().bottom + window.scrollY;
    const r = foot.getBoundingClientRect();
    const target = (phone.matches ? r.top : r.bottom) + window.scrollY;
    const drop = Math.max(0, Math.round(target - bottomOfCell));
    if (drop !== last) { cell.style.setProperty('--drop', `${drop}px`); last = drop; }
  };

  place();
  window.addEventListener('resize', place);
  window.addEventListener('load', place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  if ('ResizeObserver' in window) new ResizeObserver(place).observe(document.querySelector('main') || document.body);
})();
