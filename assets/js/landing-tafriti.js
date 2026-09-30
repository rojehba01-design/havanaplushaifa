/* ============================================================
   Havana Plus — prices on the home page, live from Tafriti

   Each signature dish price names its dish the way the dashboard does:
     data-cat  the category key       ("grill")
     data-he   the dish's Hebrew name ("פלטת בשרים")
   On load this reads the business once and rewrites those prices; a dish
   hidden or sold out in the dashboard drops out. If Tafriti cannot be
   reached, the prices written into the page stay.
   ============================================================ */
(() => {
  const TF = window.TAFRITI;
  const spans = Array.from(document.querySelectorAll('[data-cat][data-he]'));
  if (!TF || !spans.length) return;

  const western = s => s.replace(/[​-‏؜‪-‮⁦-⁩ ﻿]/g, '')
    .replace(/[٠-٩۰-۹]/g, d => { const c = d.charCodeAt(0); return String(c >= 0x06F0 ? c - 0x06F0 : c - 0x0660); })
    .trim();
  const firstPrice = raw => {
    const p = western(String(raw == null ? '' : raw)).split('/')[0].trim();
    return /^\d+(\.\d+)?$/.test(p) ? p : null;
  };
  const headers = { apikey: TF.key, Authorization: `Bearer ${TF.key}` };
  const select = 'active,menu_items(category,name_he,price,visible,sold_out)';

  fetch(`${TF.url}/rest/v1/businesses?slug=eq.${encodeURIComponent(TF.slug)}&select=${select}`, { headers })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(rows => {
      const biz = rows[0];
      if (!biz || !biz.active) throw new Error('business not available');
      const items = biz.menu_items || [];
      let updated = 0, hidden = 0;
      spans.forEach(span => {
        const it = items.find(i => i.category === span.dataset.cat && i.name_he === span.dataset.he);
        const card = span.closest('li');
        if (!it || it.visible === false || it.sold_out === true) {
          if (it && card) { card.hidden = true; hidden++; }
          return;
        }
        const p = firstPrice(it.price);
        if (!p) return;
        span.innerHTML = `${p}<span class="cur">₪</span>`;
        updated++;
      });
      document.documentElement.dataset.livePrices = String(updated);
      if (window.console) console.info(`[prices] ${updated} from Tafriti, ${hidden} hidden`);
    })
    .catch(ex => { if (window.console) console.info(`[prices] keeping the page's own prices — ${ex.message}`); });
})();
