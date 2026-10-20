/* ============================================================
   tafriti-ads.js — scheduled popup ads from the Tafriti dashboard.

   Staff create an ad in tafriti.com (type, title, text, photo, a date
   range and an hour range). This shows the first one that is live right
   now, once per browsing session, as a dismissible popup.

   SHARED FILE. The same copy runs on every Tafriti site; only the
   config block differs. Fix bugs in all copies:
     b-laban-re/website/assets/js/tafriti-ads.js
     royal auto spa landing page/js/tafriti-ads.js
     alareesha/assets/tafriti-ads.js

   Config — set before this script loads:
     window.TAFRITI_ADS = {
       url:  'https://<project>.supabase.co',
       key:  '<public anon key>',
       businessId: '<uuid>',   // or slug: '<slug>' to look it up
       lang: 'ar',             // optional, defaults to <html lang>
       delay: 900              // optional ms before it appears
     };

   Reading ads needs no login: the "public read ads" RLS policy lets
   anyone read the ads of an active business, and nothing else.
   See menu-platform/supabase-business-onoff.sql.

   Translations live in ads.i18n — { "he": { "title": ..., "body": ... } }.
   A language with no entry falls back to the ad's own title/body.
   See menu-platform/supabase-ads-i18n.sql.
   ============================================================ */
(function () {
  'use strict';

  var C = window.TAFRITI_ADS;
  if (!C || !C.url || !C.key) return;
  if (window.__tafritiAdsRan) return;   /* two script tags on one page */
  window.__tafritiAdsRan = true;

  var LANG = (C.lang || document.documentElement.lang || 'he').slice(0, 2).toLowerCase();
  var HEADERS = { apikey: C.key, Authorization: 'Bearer ' + C.key };

  var BADGE = {
    he: { special: 'מנה מיוחדת', happyhour: 'האפי אוור', discount: 'מבצע', event: 'אירוע', hiring: 'דרושים', newitem: 'חדש בתפריט' },
    ar: { special: 'طبق مميز', happyhour: 'هابي أور', discount: 'عرض', event: 'فعالية', hiring: 'مطلوب موظفين', newitem: 'جديد بالمنيو' },
    en: { special: 'Special', happyhour: 'Happy Hour', discount: 'Offer', event: 'Event', hiring: 'We are Hiring', newitem: 'New on the Menu' },
    ru: { special: 'Спецпредложение', happyhour: 'Счастливый час', discount: 'Скидка', event: 'Событие', hiring: 'Требуются сотрудники', newitem: 'Новинка' }
  };
  var CLOSE_LABEL = { he: 'סגירה', ar: 'إغلاق', en: 'Close', ru: 'Закрыть' };

  function esc(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function get(path) {
    return fetch(C.url + '/rest/v1/' + path, { headers: HEADERS }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  /* The ad's own title/body are in the shop's main language; i18n holds
     the rest. An empty translation falls back rather than showing blank. */
  function text(ad, field) {
    var t = ad.i18n && ad.i18n[LANG] && ad.i18n[LANG][field];
    return (t && String(t).trim()) || ad[field] || '';
  }

  /* Live right now? The dates and hours are what the staff typed, so they
     are read against the visitor's own clock rather than UTC. An end_time
     earlier than start_time means the ad runs through midnight. */
  function liveNow(ad) {
    var now = new Date();
    var d = now.toLocaleDateString('en-CA');
    if (ad.start_date && d < ad.start_date) return false;
    if (ad.end_date && d > ad.end_date) return false;
    var t = now.toTimeString().slice(0, 5);
    var s = (ad.start_time || '00:00').slice(0, 5);
    var e = (ad.end_time || '23:59').slice(0, 5);
    return s <= e ? (t >= s && t <= e) : (t >= s || t <= e);
  }

  function seen(id) {
    try { return !!sessionStorage.getItem('tf-ad-seen-' + id); } catch (err) { return false; }
  }
  function markSeen(id) {
    try { sessionStorage.setItem('tf-ad-seen-' + id, '1'); } catch (err) {}
  }

  /* Themed off whichever variable name the host site happens to use, so the
     popup matches each brand without any per-site CSS. */
  var CSS = [
    '.tfad-bg{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;',
    'padding:1.2rem;background:rgba(20,17,12,.58);opacity:0;transition:opacity .25s ease}',
    '.tfad-bg.on{opacity:1}',
    '.tfad{position:relative;width:100%;max-width:26rem;max-height:86vh;overflow-y:auto;border-radius:16px;',
    'background:var(--tfad-surface,var(--surface,var(--card,var(--paper,#fff))));',
    'color:var(--tfad-ink,var(--ink,#1a1a1a));',
    'box-shadow:0 18px 50px rgba(20,17,12,.38);transform:translateY(10px) scale(.98);transition:transform .25s ease}',
    '.tfad-bg.on .tfad{transform:none}',
    '.tfad-x{position:absolute;top:.5rem;inset-inline-end:.6rem;z-index:1;width:2.1rem;height:2.1rem;',
    'border:none;border-radius:50%;background:rgba(255,255,255,.92);color:#1a1a1a;',
    'font-size:1.35rem;line-height:1;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.18)}',
    '.tfad-img{display:block;width:100%;height:200px;object-fit:cover;border-radius:16px 16px 0 0}',
    '.tfad-body{padding:1.1rem 1.3rem 1.4rem;text-align:center}',
    '.tfad-badge{display:inline-block;margin-bottom:.6rem;padding:.2rem .8rem;border-radius:999px;',
    'font-size:.8rem;font-weight:700;letter-spacing:.06em;',
    'background:var(--tfad-badge-bg,var(--cream,var(--bg-alt,var(--gold-tint,rgba(0,0,0,.06)))));',
    'color:var(--tfad-badge-ink,var(--gold-ink,var(--caramel,var(--navy,inherit))))}',
    '.tfad-title{margin:0;font-size:1.45rem;line-height:1.25;font-weight:900;',
    'font-family:var(--tfad-display,var(--font-display,inherit))}',
    '.tfad-text{margin:.5rem 0 0;line-height:1.6;',
    'color:var(--tfad-muted,var(--muted,var(--ink-2,var(--stone,inherit))))}',
    '@media (prefers-reduced-motion:reduce){.tfad-bg,.tfad{transition:none}}'
  ].join('');

  function show(ad) {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var badge = (BADGE[LANG] || BADGE.he)[ad.type] || ad.type || '';
    var title = text(ad, 'title');
    var body = text(ad, 'body');
    var titleId = 'tfad-t-' + ad.id;

    var bg = document.createElement('div');
    bg.className = 'tfad-bg';
    bg.innerHTML =
      '<div class="tfad" role="dialog" aria-modal="true" aria-labelledby="' + titleId + '">' +
        '<button type="button" class="tfad-x" aria-label="' + esc(CLOSE_LABEL[LANG] || CLOSE_LABEL.he) + '">&times;</button>' +
        (ad.image_url ? '<img class="tfad-img" src="' + esc(ad.image_url) + '" alt="">' : '') +
        '<div class="tfad-body">' +
          (badge ? '<span class="tfad-badge">' + esc(badge) + '</span>' : '') +
          '<h2 class="tfad-title" id="' + titleId + '">' + esc(title) + '</h2>' +
          (body ? '<p class="tfad-text">' + esc(body) + '</p>' : '') +
        '</div>' +
      '</div>';

    /* a photo that 404s would otherwise leave a grey slab above the text */
    var img = bg.querySelector('.tfad-img');
    if (img) img.onerror = function () { img.remove(); };

    var opener = document.activeElement;
    var scrollLock = document.body.style.overflow;

    function close() {
      markSeen(ad.id);
      document.removeEventListener('keydown', onKey);
      bg.classList.remove('on');
      document.body.style.overflow = scrollLock;
      setTimeout(function () { bg.remove(); style.remove(); }, 250);
      if (opener && opener.focus) opener.focus();
    }
    function onKey(e) { if (e.key === 'Escape' || e.key === 'Esc') close(); }

    bg.querySelector('.tfad-x').onclick = close;
    bg.addEventListener('click', function (e) { if (e.target === bg) close(); });
    document.addEventListener('keydown', onKey);

    document.body.appendChild(bg);
    document.body.style.overflow = 'hidden';
    /* Flushing layout here, rather than waiting for requestAnimationFrame,
       is what makes the fade run from the right starting point. rAF does not
       fire at all in a background tab, and an ad that stayed transparent
       while the page sat scroll-locked behind it would be a trap. */
    void bg.offsetWidth;
    bg.classList.add('on');
    bg.querySelector('.tfad-x').focus();
  }

  function note(msg) { if (window.console) console.info('[ads] ' + msg); }

  function businessId() {
    if (C.businessId) return Promise.resolve(C.businessId);
    if (!C.slug) return Promise.reject(new Error('no businessId or slug in TAFRITI_ADS'));
    return get('businesses?slug=eq.' + encodeURIComponent(C.slug) + '&select=id,active')
      .then(function (rows) {
        if (!rows.length) throw new Error('business not found');
        if (!rows[0].active) throw new Error('business is switched off');
        return rows[0].id;
      });
  }

  function run() {
    businessId()
      .then(function (id) {
        return get('ads?business_id=eq.' + id + '&active=eq.true&select=*&order=created_at.desc');
      })
      .then(function (ads) {
        var ad = ads.filter(liveNow).filter(function (a) { return !seen(a.id); })[0];
        if (!ad) return;
        if (!text(ad, 'title')) return note('skipping an ad with no title');
        setTimeout(function () { show(ad); }, C.delay == null ? 900 : C.delay);
      })
      .catch(function (ex) { note('no ad shown — ' + ex.message); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
