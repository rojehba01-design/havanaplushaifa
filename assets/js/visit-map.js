/* ============================================================
   Havana Plus — fit the drawn map to its box

   The streets are drawn well past the map's own frame (about
   1000 × 1000 units round the restaurant at 280,330). Rather than
   crop the middle of it, show a wide stretch round the pin, as much
   as the box's shape allows (owner, 2026-09-28: "zoom out so the
   restaurant and what is around it shows"), and keep the names, the
   lines and the pin the same size on screen whatever the zoom.
   ============================================================ */
(() => {
  const svg = document.querySelector('#map svg');
  if (!svg) return;

  const PIN = { x: 280, y: 330 };
  const DATA = { x0: -870, y0: -720, x1: 1430, y1: 1380 };     // where streets are drawn
  const WANT = { w: 700, h: 420 };                             // at least this much each side of the pin
  const pin = svg.querySelector('.map-pin');
  const labels = svg.querySelectorAll('.map-label');
  const clamp = (v, lo, hi) => (lo > hi ? (lo + hi) / 2 : Math.min(Math.max(v, lo), hi));

  let last = '';
  const fit = () => {
    const w = svg.clientWidth, h = svg.clientHeight;
    if (!w || !h) return;
    // screen px per map unit: small enough to take in the wanted stretch,
    // never so small that the box runs past the drawn streets
    let s = Math.min(w / (2 * WANT.w), h / (2 * WANT.h));
    s = Math.max(s, w / (DATA.x1 - DATA.x0), h / (DATA.y1 - DATA.y0));
    const vw = w / s, vh = h / s;
    const x = clamp(PIN.x - vw / 2, DATA.x0, DATA.x1 - vw);
    const y = clamp(PIN.y - vh / 2, DATA.y0, DATA.y1 - vh);
    const box = `${x.toFixed(1)} ${y.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`;
    if (box === last) return;
    last = box;
    svg.setAttribute('viewBox', box);

    // names ~13px and the pin ~44px across on screen, at any zoom
    const big = document.documentElement.lang === 'ar' ? 15 : 13;
    labels.forEach(t => { t.style.fontSize = `${big / s}px`; t.style.strokeWidth = `${5 / s}px`; });
    if (pin) {
      const k = Math.max(1, 22 / (24 * s));
      pin.setAttribute('transform', `translate(${PIN.x} ${PIN.y}) scale(${k.toFixed(3)}) translate(${-PIN.x} ${-PIN.y})`);
    }
  };

  fit();
  window.addEventListener('resize', fit);
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(svg);
})();

/* ── "open now" badge (phones; owner, 2026-09-28) ─────────────
   Every day 09:00–01:00, Haifa time — the hours the site states
   (still to confirm with the restaurant, see README). Placed under the
   address in the "הגעה" card and refreshed each minute. */
(() => {
  const card = document.querySelector('.visit-card');
  if (!card) return;

  const OPEN = 9 * 60, CLOSE = 1 * 60;             // minutes after midnight; closes after midnight
  const lang = (document.documentElement.lang || 'he').slice(0, 2);
  const T = {
    he: { open: 'פתוח עכשיו', closed: 'סגור עכשיו', until: 'עד 01:00', opens: 'נפתח ב־09:00' },
    ar: { open: 'مفتوح الآن', closed: 'مغلق الآن', until: 'حتى 01:00', opens: 'يفتح الساعة 09:00' },
    en: { open: 'Open now', closed: 'Closed now', until: 'until 01:00', opens: 'opens at 09:00' },
    ru: { open: 'Открыто', closed: 'Закрыто', until: 'до 01:00', opens: 'откроется в 09:00' }
  }[lang] || { open: 'Open now', closed: 'Closed now', until: 'until 01:00', opens: 'opens at 09:00' };

  const badge = document.createElement('p');
  badge.className = 'visit-open';
  badge.innerHTML = '<span class="visit-open-state"></span><span class="visit-open-until" dir="auto"></span>';
  const after = card.querySelector('.visit-rows') || card.querySelector('.section-title');
  (after || card.firstChild).after(badge);

  const minutesInHaifa = () => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date());
    const get = t => Number((parts.find(p => p.type === t) || {}).value || 0);
    return get('hour') * 60 + get('minute');
  };
  const update = () => {
    const m = minutesInHaifa();
    const open = m >= OPEN || m < CLOSE;
    badge.classList.toggle('is-closed', !open);
    badge.querySelector('.visit-open-state').textContent = open ? T.open : T.closed;
    badge.querySelector('.visit-open-until').textContent = open ? T.until : T.opens;
  };
  update();
  setInterval(update, 60 * 1000);
})();
