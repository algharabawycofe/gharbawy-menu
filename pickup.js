/* اطلب مسبقاً واستلم عند الوصول (كاش عند الاستلام). بيشتغل فوق صفحة المنيو من غير ما يغيّر تصميمها */
(function () {
  const $ = (id) => document.getElementById(id), LS = localStorage;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let pickup = null, place = null, wid = null, last = { t: 0, eta: null }, unsub = null, orderId = null;
  const dist = (a, b, c, d) => { const R = 6371000, r = (x) => x * Math.PI / 180, dl = r(c - a), dn = r(d - b), h = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
  const etaFrom = (m) => Math.max(1, Math.round(m / 1000 / 25 * 60) + 2); // سرعة تقديرية 25 كم/س + دقيقتين
  window.GH_ORDER_EXTRA = () => pickup ? Object.assign({ type: 'pickup', payment: 'cash', phone: pickup.phone, etaMin: pickup.eta, distanceM: pickup.dist || null, arrived: false,
    prepAt: Date.now() + Math.max(0, pickup.eta - 8) * 60000 }, pickup.car ? { mode: 'drive', car: pickup.car } : { mode: 'walk' }) : null;
  const css = 'position:fixed;left:0;right:0;z-index:9999;';
  function sheet(html) { let s = $('pkSheet'); if (!s) { s = document.createElement('div'); s.id = 'pkSheet'; document.body.appendChild(s); } s.style.cssText = css + 'inset:0;background:rgba(0,0,0,.45);display:flex;align-items:flex-end'; s.innerHTML = `<div style="background:var(--surface,#fff);color:var(--text,#1F1611);width:100%;max-width:560px;margin:0 auto;border-radius:20px 20px 0 0;padding:18px;direction:rtl;font-family:inherit;max-height:90vh;overflow:auto">${html}</div>`; s.onclick = (e) => { if (e.target === s) s.remove(); }; return s; }
  function bar(html, id) { let b = $(id); if (!b) { b = document.createElement('div'); b.id = id; document.body.appendChild(b); } b.style.cssText = css + 'bottom:0;background:#2B1D14;color:#FAF6F0;padding:12px 16px;direction:rtl;font-weight:800;font-size:14px;display:flex;gap:10px;align-items:center;justify-content:space-between'; b.innerHTML = html; return b; }
  const IN = 'width:100%;padding:11px;border:1.5px solid #E8DED2;border-radius:10px;font:inherit;margin:4px 0 10px';
  function openSheet() {
    const s = sheet(`<h3 style="margin:0 0 6px;font-weight:900">🚗 اطلب واستلم أول ما توصل</h3>
      <p style="margin:0 0 10px;font-size:13px;opacity:.8">ابعت طلبك دلوقتي وإنت في الطريق، وهنجهّزه على وقت وصولك. الدفع <b>كاش عند الاستلام</b>.</p>
      <label style="font-size:12px;font-weight:800">رقم موبايلك</label><input id="pkPhone" type="tel" inputmode="tel" dir="ltr" style="${IN}" value="${esc(LS.getItem('gh_pk_phone') || '')}" placeholder="01xxxxxxxxx">
      <button id="pkLoc" type="button" style="width:100%;padding:11px;border:0;border-radius:10px;background:#F5EEE5;font:inherit;font-weight:800;margin-bottom:6px">📍 حدد موقعي وأحسب وقت وصولي</button>
      <div id="pkInfo" style="font-size:13px;margin-bottom:6px;min-height:18px"></div>
      <div style="display:flex;gap:8px;margin:2px 0 10px"><button id="pkWalk" type="button" style="flex:1;padding:11px;border-radius:10px;border:2px solid #C89B5E;background:#C89B5E33;font:inherit;font-weight:900">🚶 هدخل أستلم</button><button id="pkDrive" type="button" style="flex:1;padding:11px;border-radius:10px;border:2px solid #E8DED2;background:none;font:inherit;font-weight:900;color:inherit">🚘 هستلم من العربية</button></div>
      <div id="pkCar" hidden><p style="margin:0 0 8px;font-size:12px;opacity:.8">مش لازم تنزل: هنطلعلك الطلب لحد العربية. عرّفنا بعربيتك عشان نلاقيك.</p>
        <input id="pkCType" maxlength="20" placeholder="نوع العربية (مثلاً: كيا سيراتو)" style="${IN}"><input id="pkCColor" maxlength="12" placeholder="اللون (مثلاً: أبيض)" style="${IN}"><input id="pkCPlate" maxlength="4" placeholder="آخر 3-4 من اللوحة (اختياري)" style="${IN}"></div>
      <label style="font-size:12px;font-weight:800">هوصل بعد (دقيقة)</label><select id="pkEta" style="${IN}">${[5, 10, 15, 20, 30, 45].map((m) => `<option value="${m}"${m === 15 ? ' selected' : ''}>${m}</option>`).join('')}</select>
      <button id="pkGo" type="button" style="width:100%;padding:13px;border:0;border-radius:12px;background:#2B1D14;color:#fff;font:inherit;font-weight:900">تفعيل الاستلام وإضافة الأصناف</button>`);
    let dm = null, drive = false;
    const setMode = (d) => { drive = d; $('pkCar').hidden = !d; $('pkDrive').style.cssText += ';border-color:' + (d ? '#C89B5E' : '#E8DED2') + ';background:' + (d ? '#C89B5E33' : 'none'); $('pkWalk').style.cssText += ';border-color:' + (d ? '#E8DED2' : '#C89B5E') + ';background:' + (d ? 'none' : '#C89B5E33'); };
    $('pkWalk').onclick = () => setMode(false); $('pkDrive').onclick = () => setMode(true);
    $('pkLoc').onclick = () => navigator.geolocation ? navigator.geolocation.getCurrentPosition((p) => {
      if (!place) { $('pkInfo').textContent = 'مفيش موقع مسجّل للفرع، اختار الوقت يدوي.'; return; }
      dm = dist(p.coords.latitude, p.coords.longitude, place.lat, place.lng); const e = etaFrom(dm);
      $('pkInfo').innerHTML = `إنت على بعد <b>${(dm / 1000).toFixed(1)} كم</b>، تقريباً <b>${e} دقيقة</b>.`;
      const opt = [5, 10, 15, 20, 30, 45].find((m) => m >= e) || 45; $('pkEta').value = opt;
    }, () => { $('pkInfo').textContent = 'مقدرتش أوصل للموقع، اختار الوقت يدوي.'; }, { enableHighAccuracy: true }) : 0;
    $('pkGo').onclick = () => {
      const ph = $('pkPhone').value.replace(/\D/g, ''); if (ph.length < 10) { $('pkPhone').style.borderColor = '#B33A3A'; return; }
      const car = drive ? { type: $('pkCType').value.trim().slice(0, 20), color: $('pkCColor').value.trim().slice(0, 12), plate: $('pkCPlate').value.trim().slice(0, 4) } : null;
      if (drive && !car.color && !car.type) { $('pkCColor').style.borderColor = '#B33A3A'; return; }
      LS.setItem('gh_pk_phone', ph); pickup = { phone: ph, eta: +$('pkEta').value, dist: dm ? Math.round(dm) : null, car };
      s.remove(); bar(`<span>${pickup.car ? '🚘 درايف ثرو' : '🚗 وضع الاستلام'} شغّال (كاش) · ضيف أصنافك وابعت الطلب</span><button id="pkOff" type="button" style="background:none;border:1px solid #fff5;color:#fff;border-radius:8px;padding:6px 10px;font:inherit">إلغاء</button>`, 'pkBar');
      $('pkOff').onclick = () => { pickup = null; $('pkBar').remove(); };
    };
  }
  /* بعد إرسال الطلب: متابعة الحالة + حساب الوصول لايف */
  function track(id) {
    orderId = id; LS.setItem('gh_pickup_order', id); const { db, doc, onSnapshot, updateDoc } = window.FB;
    const set = (o) => updateDoc(doc(db, 'orders', id), o).catch(() => {});
    unsub && unsub(); let arrived = false;
    unsub = onSnapshot(doc(db, 'orders', id), (s) => {
      const o = s.exists() ? s.data() : null; if (!o) return finish('', 0); arrived = !!o.arrived;
      if (o.status === 'cancelled') return finish('❌ الطلب اتلغى' + (o.cancelReason ? ': ' + esc(o.cancelReason) : ''));
      if (o.status === 'done') return finish('☕ بالهنا والشفا!');
      bar(`<span>${o.status === 'ready' ? (o.mode === 'drive' ? '🔔 طلبك جاهز — هنطلعهولك للعربية' : '🔔 طلبك جاهز، تعالى استلمه') : o.status === 'preparing' ? '👨‍🍳 بيتجهّز دلوقتي' : '✅ طلبك وصل للفرع'} · ${arrived ? 'وصلت ✓' : 'متوقع وصولك بعد ' + esc(o.etaMin ?? '؟') + ' د'}</span>${arrived ? '' : '<button id="pkArr" type="button" style="background:#C89B5E;color:#1F1611;border:0;border-radius:10px;padding:8px 12px;font:inherit;font-weight:900">🚗 وصلت</button>'}`, 'pkTrack');
      const b = $('pkArr'); if (b) b.onclick = () => { const bay = o.mode === 'drive' ? (prompt('إنت واقف فين؟ (رقم الركنة أو علامة، اختياري)', '') || '').trim().slice(0, 20) : ''; set(Object.assign({ arrived: true, arrivedAt: Date.now() }, bay ? { bay } : {})); };
    });
    if (place && navigator.geolocation && wid === null) wid = navigator.geolocation.watchPosition((p) => {
      const d = dist(p.coords.latitude, p.coords.longitude, place.lat, place.lng), e = etaFrom(d), now = Date.now();
      if (d <= 80 && !arrived) return set({ arrived: true, arrivedAt: now });
      if (!arrived && now - last.t > 30000 && e !== last.eta) { last = { t: now, eta: e }; set({ etaMin: e, distanceM: Math.round(d) }); }
    }, () => {}, { enableHighAccuracy: true, maximumAge: 15000 });
  }
  function finish(msg) { unsub && unsub(); unsub = null; if (wid !== null) { navigator.geolocation.clearWatch(wid); wid = null; } LS.removeItem('gh_pickup_order'); pickup = null; $('pkBar') && $('pkBar').remove(); if (msg) { bar(`<span>${msg}</span><button id="pkX" type="button" style="background:none;border:0;color:#fff;font-size:18px">✕</button>`, 'pkTrack'); $('pkX').onclick = () => $('pkTrack').remove(); setTimeout(() => $('pkTrack') && $('pkTrack').remove(), 12000); } else $('pkTrack') && $('pkTrack').remove(); }
  addEventListener('gh-order', (e) => { if (pickup && e.detail && e.detail.id) { $('pkBar') && $('pkBar').remove(); track(e.detail.id); } });
  function init() {
    const FB = window.FB; if (!FB || !FB.db || typeof currentBranch === 'undefined' || !currentBranch) return false;
    FB.getDoc(FB.doc(FB.db, 'settings', 'loyalty')).then((s) => { const ps = (s.exists() && s.data().places) || []; place = ps.find((p) => p.branchId === currentBranch.id) || null; }).catch(() => {});
    const saved = LS.getItem('gh_pickup_order'); if (saved) track(saved);
    if (typeof currentTable !== 'undefined' && currentTable) return true; // قاعد على طاولة: مش محتاج استلام
    const row = $('statusRow'); if (!row || !row.parentNode || $('pkStrip')) return true;
    const d = document.createElement('div'); d.id = 'pkStrip';
    d.style.cssText = 'display:flex;align-items:center;gap:10px;margin:10px 14px;padding:11px 14px;border-radius:16px;background:linear-gradient(135deg,#C89B5E,#E0BE85);color:#1F1611;font-weight:800;font-size:13px;cursor:pointer';
    d.innerHTML = '<span style="font-size:22px">🚗</span><span style="flex:1">جاي في الطريق؟ اطلب دلوقتي واستلم أول ما توصل (كاش)</span>'; d.onclick = openSheet; row.parentNode.insertBefore(d, row); return true;
  }
  let n = 0; const t = setInterval(() => { if (init() || ++n > 40) clearInterval(t); }, 500);
})();
