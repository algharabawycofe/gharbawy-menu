/* بعد ما العميل يطلب وهو قاعد: كارت يعرّفه بالدرايف ثرو ويخليه يثبّت التطبيق ويشترك في الولاء/التنبيهات.
   + تسجيل الـ service worker (sw.js) عشان التثبيت يشتغل. */
(function () {
  'use strict';
  const D = document, LS = (() => { try { return localStorage; } catch (e) { return { getItem() { return null; }, setItem() {}, removeItem() {} }; } })();
  const KEY = 'gh_retain_dismiss', WEEK = 7 * 864e5;
  const IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const STANDALONE = (matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  let deferred = null;
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
  addEventListener('appinstalled', () => { deferred = null; close(); LS.setItem(KEY, String(Date.now() + 30 * 864e5 - WEEK)); });
  if ('serviceWorker' in navigator) addEventListener('load', () => { try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {} });

  const $ = (id) => D.getElementById(id);
  const close = () => { const c = $('ghRetain'); if (c) { c.style.transform = 'translateY(110%)'; setTimeout(() => c.remove(), 300); } };
  function show() {
    if ($('ghRetain') || Date.now() - (Number(LS.getItem(KEY)) || 0) < WEEK) return;
    const member = !!LS.getItem('gh_loyalty_id'), loy = 'loyalty.html' + location.search.replace(/[?&]table=[^&]*/g, '').replace(/^&/, '?');
    const c = D.createElement('div'); c.id = 'ghRetain';
    c.style.cssText = 'position:fixed;inset-inline:12px;bottom:calc(12px + env(safe-area-inset-bottom));max-width:480px;margin:0 auto;z-index:800;background:#2B1D14;color:#FAF6F0;border-radius:20px;padding:16px;box-shadow:0 18px 50px rgba(0,0,0,.4);direction:rtl;font-family:inherit;transform:translateY(110%);transition:transform .35s cubic-bezier(.32,.72,0,1)';
    const btn = 'border:0;border-radius:12px;padding:11px 12px;font:inherit;font-weight:900;font-size:13px;cursor:pointer;flex:1 1 140px';
    c.innerHTML = '<button id="ghRX" aria-label="إغلاق" style="position:absolute;top:8px;inset-inline-end:10px;background:none;border:0;color:inherit;opacity:.6;font-size:18px;cursor:pointer">✕</button>' +
      '<div style="font-weight:900;font-size:15px;margin-bottom:4px;padding-inline-end:26px">☕ بالهنا! المرة الجاية اطلب من عربيتك 🚗</div>' +
      '<div style="font-size:12.5px;opacity:.85;line-height:1.8;margin-bottom:12px">افتح المنيو قبل ما توصل، وهنجهّز طلبك ونطلعهولك لحد العربية من غير ما تنزل أو تستنى.</div>' +
      '<div id="ghRMsg" style="font-size:12px;line-height:1.8;margin-bottom:8px;display:none;background:#ffffff14;border-radius:10px;padding:8px 10px"></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      (STANDALONE ? '' : '<button id="ghRInst" style="' + btn + ';background:linear-gradient(135deg,#C89B5E,#E0BE85);color:#1F1611">📲 ثبّت التطبيق</button>') +
      '<button id="ghRLoy" style="' + btn + ';background:#ffffff1f;color:#FAF6F0">' + (member ? '🔔 فعّل التنبيهات' : '🎁 الولاء والتنبيهات') + '</button></div>';
    D.body.appendChild(c); requestAnimationFrame(() => requestAnimationFrame(() => { c.style.transform = 'none'; }));
    $('ghRX').onclick = () => { LS.setItem(KEY, String(Date.now())); close(); };
    $('ghRLoy').onclick = () => { LS.setItem(KEY, String(Date.now())); location.href = loy; };
    const inst = $('ghRInst');
    if (inst) inst.onclick = () => {
      const m = $('ghRMsg');
      if (deferred) { const d = deferred; deferred = null; d.prompt(); d.userChoice.finally(close); return; }
      m.style.display = 'block';
      m.innerHTML = IOS ? 'على الآيفون: دوس زرار المشاركة <b>⬆️</b> في سفاري، واختار <b>"إضافة إلى الشاشة الرئيسية"</b>.' : 'من قايمة المتصفح (⋮) اختار <b>"تثبيت التطبيق"</b> أو <b>"إضافة إلى الشاشة الرئيسية"</b>.';
    };
  }
  // شاشة "اعرضها على الويتر" بتغطي الصفحة بعد الطلب؛ نستنى العميل يقفلها وبعدين نظهر الكارت
  function whenFree(tries) {
    const ds = $('displayScreen');
    if (ds && ds.classList.contains('show') && tries < 150) return setTimeout(() => whenFree(tries + 1), 800);
    setTimeout(show, 1200);
  }
  addEventListener('gh-order', (e) => { if (e.detail && !e.detail.pickup) setTimeout(() => whenFree(0), 1500); });
})();
