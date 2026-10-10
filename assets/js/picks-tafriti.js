/* ============================================================
   Havana Plus — "מה שכדאי לטעום אצלנו" on the home page, from Tafriti

   The owner picks the home page's dishes in Tafriti (menu screen,
   "מה שכדאי לטעום"). On load this reads that list once and redraws the
   card's dishes in that order, in the page's language. A dish the site
   has a cut-out plate for shows that plate; any other shows its Tafriti
   photo, framed. A picked dish that is hidden or sold out is left out.
   With nothing picked, or Tafriti out of reach, the dishes written into
   the page stay as they are.
   ============================================================ */
(() => {
  const TF = window.TAFRITI;
  const grid = document.querySelector('#picks .picks-grid');
  if (!TF || !grid) return;

  const LANG = (document.documentElement.lang || 'he').slice(0, 2);
  /* the cut-out plates the site has, by the dish's Hebrew name in Tafriti */
  const CUTOUT = {
    'סלט רוקפור': 'picks/sal-roquefort', 'פטרושרימפס': 'picks/petro-shrimps',
    'פלטת סלמון מעושן': 'picks/plate-salmon', 'טרס לצ׳ס': 'picks/dessert-tres-leches',
    'קרפצ׳יו פילה בקר': 'signature/carpaccio', 'סלט קיסר': 'signature/sal-caesar',
    'סלט פרגית': 'signature/sal-pargit', 'לברק': 'signature/lavrak', 'ברבוניה': 'signature/barbounia',
    'שרימפס בגריל': 'signature/shrimp-grilled', 'רוזה': 'signature/pasta-rosa', 'פונגי': 'signature/pasta-fungi',
    'פסטו שמנת': 'signature/pasta-pesto', 'בולונז': 'signature/pasta-bolognese',
    'עוגת ביסקוויטים': 'signature/dessert-biscuit', 'פאי פקאן': 'signature/dessert-pecan'
  };
  const nameOf = it => it[`name_${LANG}`] || it.name_he || '';
  const headers = { apikey: TF.key, Authorization: `Bearer ${TF.key}` };
  const select = 'active,site_picks,menu_items(id,name_he,name_ar,name_en,name_ru,photo_url,visible,sold_out)';

  fetch(`${TF.url}/rest/v1/businesses?slug=eq.${encodeURIComponent(TF.slug)}&select=${select}`, { headers })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(rows => {
      const biz = rows[0];
      if (!biz || !biz.active) throw new Error('business not available');
      const ids = (biz.site_picks && biz.site_picks.home) || [];
      const byId = {};
      (biz.menu_items || []).forEach(it => { byId[it.id] = it; });
      const picks = ids.map(id => byId[id]).filter(it => it && it.visible !== false && it.sold_out !== true);
      if (!picks.length) throw new Error('nothing picked in Tafriti');

      grid.textContent = '';
      picks.forEach(it => {
        const li = document.createElement('li');
        li.className = 'pick';
        const cut = CUTOUT[it.name_he];
        const src = cut ? `assets/img/${cut}.webp` : it.photo_url;
        if (src) {
          const img = document.createElement('img');
          img.src = src; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
          img.width = 1200; img.height = 900;
          if (!cut) li.classList.add('is-photo');
          img.addEventListener('error', () => img.remove());
          li.appendChild(img);
        }
        const name = document.createElement('span');
        name.className = 'pick-name';
        name.textContent = nameOf(it);
        li.appendChild(name);
        grid.appendChild(li);
      });
      grid.dataset.count = String(picks.length);
      if (window.console) console.info(`[picks] ${picks.length} dishes from Tafriti`);
    })
    .catch(ex => { if (window.console) console.info(`[picks] keeping the page's own dishes — ${ex.message}`); });
})();
