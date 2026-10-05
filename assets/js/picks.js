/* ============================================================
   Havana Plus — house picks under the hero
   A mouse sees a dish's card on hover (CSS). A tap opens it, a second
   tap on the same dish, a tap anywhere else or Esc closes it; only one
   is open at a time. The open state also drives aria-expanded.
   ============================================================ */
(() => {
  const picks = Array.from(document.querySelectorAll('.pick'));
  if (!picks.length) return;

  const close = li => {
    li.classList.remove('is-open');
    li.querySelector('.pick-card').setAttribute('aria-expanded', 'false');
  };
  const open = li => {
    picks.forEach(p => p !== li && close(p));
    li.classList.add('is-open');
    li.querySelector('.pick-card').setAttribute('aria-expanded', 'true');
  };

  picks.forEach(li => {
    li.querySelector('.pick-card').addEventListener('click', () => {
      li.classList.contains('is-open') ? close(li) : open(li);
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.pick')) picks.forEach(close);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') picks.forEach(close);
  });
})();
