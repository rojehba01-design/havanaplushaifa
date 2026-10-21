/* ============================================================
   Havana Plus — "מה שכדאי לטעום אצלנו" on the home page, from Tafriti

   The owner picks the home page's dishes in Tafriti (menu screen,
   "מה שכדאי לטעום"). On load this reads that list once and redraws the
   card's dishes in that order, in the page's language. A dish shows a
   plate with no background: one cut by hand here, or the one Tafriti
   makes on its own within the hour of the pick; until then its photo,
   framed. A picked dish that is hidden or sold out is left out.
   With nothing picked, or Tafriti out of reach, the dishes written into
   the page stay as they are.
   ============================================================ */
(() => {
  const TF = window.TAFRITI;
  const grid = document.querySelector('#picks .picks-grid');
  if (!TF || !grid) return;

  const LANG = (document.documentElement.lang || 'he').slice(0, 2);
  /* the cut-out plates the site has, by the dish's Hebrew name in Tafriti.
     The first ones were cut by hand; cut/ has one for every other dish
     with a photo (cut from the Tafriti photo where the owner uploaded one). */
  const CUTOUT = {
    'סלט רוקפור': 'picks/sal-roquefort', 'פטרושרימפס': 'picks/petro-shrimps',
    'פלטת סלמון מעושן': 'picks/plate-salmon', 'טרס לצ׳ס': 'picks/dessert-tres-leches',
    'קרפצ׳יו פילה בקר': 'signature/carpaccio', 'סלט קיסר': 'signature/sal-caesar',
    'סלט פרגית': 'signature/sal-pargit', 'לברק': 'signature/lavrak', 'ברבוניה': 'signature/barbounia',
    'שרימפס בגריל': 'signature/shrimp-grilled', 'רוזה': 'signature/pasta-rosa', 'פונגי': 'signature/pasta-fungi',
    'פסטו שמנת': 'signature/pasta-pesto', 'בולונז': 'signature/pasta-bolognese',
    'עוגת ביסקוויטים': 'signature/dessert-biscuit', 'פאי פקאן': 'signature/dessert-pecan',
    'כנפי עוף מוקפצים': 'cut/wings', 'שניצלונים בציפוי פריך': 'cut/nuggets', 'תפוחי אדמה מוקרמים': 'cut/creamed-potatoes',
    'פטריות ממולאות בגבינות': 'cut/stuffed-mushrooms', 'מרק שמנת פטריות': 'cut/mushroom-soup', 'מזה משופרת': 'cut/mezze',
    'צ׳יפס': 'cut/fries', 'פלטת גבינות': 'cut/plate-cheese', 'פלטת מטוגנים': 'cut/plate-fried',
    'סלט פטוש': 'cut/sal-fattoush', 'סלט טאבולה': 'cut/sal-tabbouleh', 'סלט חלומי': 'cut/sal-halloumi',
    'סלט ג׳רג׳יר': 'cut/sal-rocket', 'סלט קצוץ': 'cut/sal-chopped', 'סלט יווני': 'cut/sal-greek',
    'סלט חזה עוף': 'cut/sal-chicken', 'סלט טונה': 'cut/sal-tuna', 'סלט טוסט': 'cut/sal-toast',
    'סלט עוף מוקפץ': 'cut/sal-stirfry-chicken', 'חומוס': 'cut/hummus', 'חומוס עם טחינה': 'cut/hummus-tahini',
    'חומוס עם פטריות': 'cut/hummus-mushrooms', 'חומוס בשר': 'cut/hummus-meat', 'טחינה': 'cut/tahini',
    'פלטת בשרים': 'cut/meat-platter', 'מדליוני פילה עגל': 'cut/fillet', 'סטייק אנטריקוט': 'cut/entrecote',
    'צלעות טלה': 'cut/lamb-ribs', 'קבב הוואנה': 'cut/kebab', 'שיפודי פרגיות': 'cut/pargit-skewers',
    'חזה עוף בגריל': 'cut/chicken-grill', 'חזה עוף ברוטב': 'cut/chicken-sauce', 'כבד עוף': 'cut/chicken-liver',
    'שניצל וצ׳יפס': 'cut/schnitzel', 'טורטיית קבב': 'cut/tortilla-kebab', 'טורטיית עוף מוקפץ': 'cut/tortilla-chicken',
    'אוניית פירות ים לזוג': 'cut/boat-two', 'אוניית פירות ים משפחתית': 'cut/boat-family', 'דאבל הוואנה ברוטב': 'cut/double-sauce',
    'דאבל הוואנה מטוגן': 'cut/double-fried', 'דניס': 'cut/denis', 'מושט': 'cut/musht',
    'סטייק סלמון': 'cut/salmon-steak', 'שרימפס ברוטב': 'cut/shrimp-sauce', 'קלמרי ברוטב': 'cut/calamari-sauce',
    'קלמרי לימון': 'cut/calamari-lemon', 'צדפות ברוטב': 'cut/mussels', 'רביולי גבינה': 'cut/ravioli-cheese',
    'רביולי בטטה': 'cut/ravioli-sweet-potato', 'קוואטרו': 'cut/pasta-cuatro', 'טוסט מוקרם': 'cut/toast-creamed',
    'טוסט גבינות': 'cut/toast-cheese', 'טוסט איטלקי': 'cut/toast-italian', 'טוסט סלמון': 'cut/toast-salmon',
    'כריך רוסטביף עם צ׳יפס': 'cut/sand-roastbeef', 'שניצל': 'cut/kids-schnitzel', 'קבב': 'cut/kids-kebab',
    'חזה עוף': 'cut/kids-chicken', 'קרם ברולה': 'cut/dessert-brulee', 'סושי אוראו': 'cut/dessert-oreo-sushi',
    'שריפמס ברוטב שום לימון': 'cut/shrimp-sauce', 'שרימפס מטוגן': 'cut/shrimp-fried', 'קלמרי מטוגן': 'cut/calamari-fried',
    'סלט בקר מוקפץ': 'cut/sal-stirfry-beef'
  };
  const nameOf = it => it[`name_${LANG}`] || it.name_he || '';
  const headers = { apikey: TF.key, Authorization: `Bearer ${TF.key}` };
  const select = 'active,site_picks,menu_items(id,name_he,name_ar,name_en,name_ru,photo_url,cutout_url,cutout_of,visible,sold_out)';

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
        /* a plate cut by hand first; then the one Tafriti made on its own
           for this very photo (cutout_url, tools/pick-plates in Tafriti);
           then the site's own cut/; then the photo, framed */
        const hand = CUTOUT[it.name_he];
        const auto = it.cutout_url && it.cutout_of === it.photo_url ? it.cutout_url : '';
        const src = hand && !hand.startsWith('cut/') ? `assets/img/${hand}.webp`
          : auto || (hand ? `assets/img/${hand}.webp` : it.photo_url);
        if (src) {
          const img = document.createElement('img');
          img.src = src; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
          img.width = 1200; img.height = 900;
          if (!hand && !auto) li.classList.add('is-photo');
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
