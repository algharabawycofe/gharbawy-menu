/* اطلب تاني: بيحفظ آخر طلب ويظهر زرار "🔁 كرر آخر طلب" في المنيو. بيشتغل فوق الصفحة من غير ما يغيّر تصميمها. */
(function () {
  const KEY = 'gh_last_order', $ = (id) => document.getElementById(id);
  const read = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || 'null'); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
  addEventListener('gh-order', (e) => {
    try {
      const keep = ((e.detail && e.detail.items) || []).filter((i) => !i.isBundle && !i.offerId && i.id != null)
        .map((i) => ({ id: i.id, qty: Number(i.qty) || 1, note: i.note || '', selections: i.selections || [] }));
      if (keep.length) { localStorage.setItem(KEY, JSON.stringify(keep)); setTimeout(draw, 300); }
    } catch (err) { /* تجاهل */ }
  });
  function repeat() {
    const lines = read(); if (!lines.length || typeof addToCart !== 'function') return;
    let n = 0;
    lines.forEach((l) => {
      const before = cart.length ? cart.reduce((s, c) => s + c.qty, 0) : 0;
      try { addToCart(l.id, l.qty, l.note, l.selections); } catch (e) { return; }
      if (cart.reduce((s, c) => s + c.qty, 0) > before) n++;
    });
    if (typeof toast === 'function') toast(n ? 'اتضاف آخر طلب للسلة 🔁' : 'الأصناف دي مش متاحة دلوقتي', n ? '✅' : '⚠️');
    if (n && typeof openCartModal === 'function') openCartModal();
  }
  function draw() {
    const old = $('ghReorder'), lines = read(), row = $('statusRow');
    if (!lines.length || !row || !row.parentNode) { old && old.remove(); return; }
    if (old) return;
    const b = document.createElement('button'); b.id = 'ghReorder'; b.type = 'button';
    b.style.cssText = 'display:block;width:calc(100% - 28px);margin:10px 14px;padding:12px;border-radius:14px;border:1.5px solid var(--coffee-gold,#C89B5E);background:none;color:inherit;font:inherit;font-weight:800;cursor:pointer';
    b.textContent = '🔁 كرر آخر طلب (' + lines.reduce((s, l) => s + l.qty, 0) + ' صنف)';
    b.onclick = repeat; row.parentNode.insertBefore(b, row);
  }
  let n = 0; const t = setInterval(() => { if ($('statusRow')) { draw(); clearInterval(t); } else if (++n > 40) clearInterval(t); }, 500);
})();
