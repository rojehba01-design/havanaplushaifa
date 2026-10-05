/* ============================================================
   Havana Plus, the header
   The bar sits see-through over the dark hero and turns solid
   white once the page scrolls.

   MENU (the three lines, top corner) opens a side panel that leads
   round the site (owner, 2026-09-28): the menu, the home page's own
   parts (about, the kitchen, follow us, find us, the map) and the
   ways to reach Havana (call, WhatsApp, Waze). From a menu page the
   home-page parts open the home page of the same language.
   With no script the button stays a plain link to the menu page.
   ============================================================ */
(() => {
  const head = document.querySelector('[data-head]');
  if (!head) return;

  const solid = () => head.classList.toggle('is-solid', window.scrollY > 40);
  window.addEventListener('scroll', solid, { passive: true });
  solid();

  const btn = head.querySelector('.head-menu');
  if (!btn) return;

  const lang = (document.documentElement.lang || 'he').slice(0, 2);
  const menuPage = btn.getAttribute('href') || 'menu.html';
  const logo = head.querySelector('.head-logo');
  const homePage = (logo && logo.getAttribute('href')) || 'index.html';
  const onHome = !!document.getElementById('visit');
  const here = id => (onHome ? `#${id}` : `${homePage}#${id}`);

  const PHONE = { tel: 'tel:+97248511919', show: '04-851-1919' };
  const WHATSAPP = 'https://wa.me/972509669701';
  const WAZE = 'https://waze.com/ul?q=%D7%A9%D7%93%D7%A8%D7%95%D7%AA%20%D7%91%D7%9F%20%D7%92%D7%95%D7%A8%D7%99%D7%95%D7%9F%2012%20%D7%97%D7%99%D7%A4%D7%94&navigate=yes';

  const W = {
    he: { menu: 'התפריט', about: 'עלינו', kitchen: 'הטעמים של הוואנה', social: 'עקבו אחרינו', visit: 'הגעה ושעות', map: 'מפה', call: 'התקשרו', wa: 'וואטסאפ', waze: 'ניווט בוויז', close: 'סגירה' },
    ar: { menu: 'القائمة', about: 'من نحن', kitchen: 'نكهات هاڤانا', social: 'تابعونا', visit: 'الوصول والساعات', map: 'الخريطة', call: 'اتصلوا', wa: 'واتساب', waze: 'التنقل عبر Waze', close: 'إغلاق' },
    en: { menu: 'Menu', about: 'About us', kitchen: 'The flavours of Havana', social: 'Follow us', visit: 'Find us & hours', map: 'Map', call: 'Call', wa: 'WhatsApp', waze: 'Navigate with Waze', close: 'Close' },
    ru: { menu: 'Меню', about: 'О нас', kitchen: 'Вкусы Havana', social: 'Мы в соцсетях', visit: 'Адрес и часы', map: 'Карта', call: 'Позвонить', wa: 'WhatsApp', waze: 'Маршрут в Waze', close: 'Закрыть' }
  }[lang] || {};

  const links = [
    { name: W.menu, href: menuPage },
    { name: W.about, href: here('about') },
    { name: W.kitchen, href: here('kitchen') },
    { name: W.social, href: here('social') },
    { name: W.visit, href: here('visit') },
    { name: W.map, href: here('map') },
    { name: W.wa, href: WHATSAPP, out: true },
    { name: W.waze, href: WAZE, out: true }
  ];

  /* the panel */
  const title = btn.getAttribute('aria-label') || 'Menu';
  const shade = document.createElement('div');
  shade.className = 'cat-shade';
  shade.hidden = true;
  const panel = document.createElement('nav');
  panel.className = 'cat-panel';
  panel.id = 'cat-panel';
  panel.setAttribute('aria-label', title);
  panel.hidden = true;
  panel.innerHTML =
    `<div class="cat-panel-top"><p class="cat-panel-title"></p>` +
    `<button type="button" class="cat-panel-close"><span aria-hidden="true">&times;</span></button></div>` +
    `<ul class="cat-panel-list"></ul>` +
    `<a class="cat-panel-all"></a>`;
  panel.querySelector('.cat-panel-title').textContent = title;
  panel.querySelector('.cat-panel-close').setAttribute('aria-label', W.close || 'Close');
  panel.querySelector('.cat-panel-list').append(...links.map(l => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = l.href;
    a.textContent = l.name;
    if (l.out) { a.target = '_blank'; a.rel = 'noopener'; }
    li.append(a);
    return li;
  }));
  /* the phone number, as a big button at the foot of the panel */
  const call = panel.querySelector('.cat-panel-all');
  call.href = PHONE.tel;
  call.innerHTML = `<span></span> <bdi dir="ltr"></bdi>`;
  call.querySelector('span').textContent = W.call || '';
  call.querySelector('bdi').textContent = PHONE.show;
  document.body.append(shade, panel);

  btn.setAttribute('role', 'button');
  btn.setAttribute('aria-controls', 'cat-panel');
  btn.setAttribute('aria-expanded', 'false');

  /* open / close */
  let lastFocus = null;
  const open = () => {
    lastFocus = document.activeElement;
    shade.hidden = panel.hidden = false;
    requestAnimationFrame(() => document.documentElement.classList.add('cat-open'));
    btn.setAttribute('aria-expanded', 'true');
    panel.querySelector('.cat-panel-close').focus();
  };
  const close = () => {
    document.documentElement.classList.remove('cat-open');
    btn.setAttribute('aria-expanded', 'false');
    setTimeout(() => { shade.hidden = panel.hidden = true; }, 250);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };

  btn.addEventListener('click', e => { e.preventDefault(); open(); });
  shade.addEventListener('click', close);
  panel.querySelector('.cat-panel-close').addEventListener('click', close);
  panel.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.documentElement.classList.contains('cat-open')) close();
  });
})();
