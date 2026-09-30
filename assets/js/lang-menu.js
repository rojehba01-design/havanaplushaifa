/* ============================================================
   Havana Plus — the globe language menu

   The menu is a <details>, so tapping the globe opens and closes it
   even without this file. This adds what a real menu needs: a tap
   anywhere else closes it, Escape closes it and returns to the globe,
   and the arrow keys move between the four languages.
   ============================================================ */
(() => {
  document.querySelectorAll('details.lang').forEach(menu => {
    const globe = menu.querySelector('summary');
    const links = Array.from(menu.querySelectorAll('.lang-menu a'));
    if (!globe || !links.length) return;

    const sync = () => globe.setAttribute('aria-expanded', String(menu.open));
    const close = () => { menu.open = false; };

    menu.addEventListener('toggle', sync);
    document.addEventListener('click', e => { if (menu.open && !menu.contains(e.target)) close(); });

    menu.addEventListener('keydown', e => {
      if (!menu.open) return;
      if (e.key === 'Escape') {
        close();
        globe.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const i = links.indexOf(document.activeElement);
        const step = e.key === 'ArrowDown' ? 1 : -1;
        links[(i + step + links.length) % links.length].focus();
      }
    });

    sync();
  });
})();
