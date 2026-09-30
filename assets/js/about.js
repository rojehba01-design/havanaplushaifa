/* ============================================================
   Havana Plus — About Us "read more" (phones)
   On a phone the About Us card shows the lede and one sentence; the
   longer paragraph and the note wait behind this button. The CSS
   shows the button only on phones, so larger screens see it all.
   ============================================================ */
(() => {
  const card = document.querySelector('.about-card');
  const actions = card && card.querySelector('.about-actions');
  if (!actions) return;

  const lang = (document.documentElement.lang || 'he').slice(0, 2);
  const T = {
    he: ['קראו עוד', 'פחות'],
    ar: ['اقرأ المزيد', 'أقل'],
    en: ['Read more', 'Less'],
    ru: ['Читать дальше', 'Свернуть']
  }[lang] || ['Read more', 'Less'];

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'about-more';
  btn.setAttribute('aria-expanded', 'false');
  btn.textContent = T[0];
  actions.before(btn);

  btn.addEventListener('click', () => {
    const open = card.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = T[open ? 1 : 0];
  });
})();
