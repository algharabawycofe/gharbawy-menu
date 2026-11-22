/* منشئ المنيو السريع: الصق قايمتك كنص وتتحول لأقسام ومنتجات (بدل الإضافة واحد واحد) */
(function () {
  const $ = (id) => document.getElementById(id);
  const SAMPLE = '# قهوة ساخنة ☕\nقهوة تركي 45 | Turkish Coffee\nكابتشينو 65 | Cappuccino\n# مشروبات باردة 🧊\nآيس لاتيه 70 | Iced Latte\nعصير ليمون 40\n';
  const DIG = { '٠': 0, '١': 1, '٢': 2, '٣': 3, '٤': 4, '٥': 5, '٦': 6, '٧': 7, '٨': 8, '٩': 9 };
  const norm = (s) => s.replace(/[٠-٩]/g, (d) => DIG[d]).replace(/\t+/g, '  ').trim();
  function parse(text) {
    const cats = [], errors = []; let cur = null;
    norm(text).split(/\r?\n/).forEach((raw, i) => {
      const line = raw.trim(); if (!line) return;
      if (line[0] === '#') {
        let name = line.replace(/^#+/, '').trim(); const em = name.match(/\p{Extended_Pictographic}\uFE0F?/u);
        const icon = em ? em[0] : '🏷️'; if (em) name = name.replace(em[0], '').trim();
        if (!name) { errors.push(`سطر ${i + 1}: اسم القسم فاضي`); return; }
        cur = cats.find((c) => c.name === name) || (cats.push({ name, icon, items: [] }), cats[cats.length - 1]); return;
      }
      const m = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(?:ج|جنيه|جم|EGP|LE)?\s*(?:\|\s*(.+))?$/i);
      if (!m) { errors.push(`سطر ${i + 1}: "${line.slice(0, 30)}" مش فاهمه (الاسم ثم السعر)`); return; }
      if (!cur) { cur = { name: 'عام', icon: '🏷️', items: [] }; cats.push(cur); }
      cur.items.push({ nameAr: m[1].trim(), price: Number(m[2]), nameEn: (m[3] || '').trim() });
    });
    return { cats, errors };
  }
  function inject() {
    if ($('quickMenuModal')) return;
    const d = document.createElement('div'); d.id = 'quickMenuModal'; d.className = 'modal-overlay';
    d.innerHTML = `<div class="modal" style="width:560px;max-width:96vw;max-height:92vh;overflow:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="font-size:17px;font-weight:900;margin:0">⚡ إضافة منيو سريعة</h3><button class="btn btn-ghost btn-sm" onclick="closeModal('quickMenuModal')">✕</button></div>
      <details open style="background:var(--cream,#F5EEE5);border-radius:12px;padding:10px 14px;margin-bottom:12px;font-size:13px;line-height:1.9"><summary style="font-weight:800;cursor:pointer">📘 إزاي أعمل المنيو؟ (4 خطوات)</summary>
        <ol style="margin:6px 0 0;padding-inline-start:20px"><li>اختار <b>المجموعة</b> (المنيو) اللي هتتضاف عليها.</li><li>اكتب اسم القسم في سطر يبدأ بـ <b>#</b> (ولو عايز أيقونة حط إيموجي).</li><li>تحته كل صنف في سطر: <b>الاسم السعر</b> ، وممكن تضيف <b>| الاسم بالإنجليزي</b>.</li><li>دوس <b>معاينة</b> وراجع، وبعدين <b>إضافة الكل</b>.</li></ol>
        <div style="margin-top:6px;color:#6F4E37">تقدر تنسخ القايمة من واتساب أو إكسل (اسم ثم سعر) وتلصقها. الأصناف المتكررة بتتخطّى. الصور بتتحط بعدين من صفحة المنتجات.</div></details>
      <label>المجموعة</label><select id="qmMenu"></select>
      <label style="margin-top:10px">القايمة</label><textarea id="qmText" rows="9" dir="rtl" style="width:100%;font-family:inherit;padding:10px;border:1.5px solid var(--border,#E8DED2);border-radius:10px" placeholder="# قهوة ☕&#10;قهوة تركي 45"></textarea>
      <div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-ghost" id="qmSample" type="button">مثال</button><button class="btn btn-ghost" id="qmPrev" type="button" style="flex:1">👁️ معاينة</button><button class="btn btn-primary" id="qmGo" type="button" style="flex:1" disabled>إضافة الكل</button></div>
      <div id="qmOut" style="margin-top:12px;font-size:13px"></div></div>`;
    document.body.appendChild(d);
    $('qmSample').onclick = () => { $('qmText').value = SAMPLE; preview(); };
    $('qmPrev').onclick = preview; $('qmGo').onclick = apply;
  }
  let plan = null;
  function preview() {
    const menuId = $('qmMenu').value, { cats, errors } = parse($('qmText').value); plan = null; $('qmGo').disabled = true;
    if (!menuId) { $('qmOut').innerHTML = '<b style="color:#B33A3A">اختار المجموعة الأول.</b>'; return; }
    let nc = 0, ni = 0, sk = 0;
    const rows = cats.map((c) => {
      const ex = categories.find((x) => x.menuId === menuId && x.nameAr === c.name); if (!ex) nc++;
      const fresh = c.items.filter((it) => !(ex && items.some((i) => i.menuId === menuId && i.categoryId === ex.id && i.nameAr === it.nameAr))); ni += fresh.length; sk += c.items.length - fresh.length;
      return `<div style="padding:6px 0;border-top:1px solid #E8DED2"><b>${c.icon} ${c.name}</b> <small>${ex ? '(قسم موجود)' : '(قسم جديد)'}</small><div style="color:#6F4E37">${fresh.map((i) => i.nameAr + ' — ' + i.price).join(' · ') || 'مفيش جديد'}</div></div>`;
    }).join('');
    $('qmOut').innerHTML = `<div style="font-weight:800;margin-bottom:4px">هيتضاف: ${nc} قسم جديد، ${ni} منتج${sk ? `، وهيتخطّى ${sk} متكرر` : ''}</div>${rows}${errors.length ? `<div style="color:#B33A3A;margin-top:8px">${errors.join('<br>')}</div>` : ''}`;
    if (ni || nc) { plan = { menuId, cats }; $('qmGo').disabled = false; }
  }
  async function apply() {
    if (!plan) return; const { db, doc, writeBatch } = window.FB, { menuId, cats } = plan; $('qmGo').disabled = true;
    try {
      let maxId = items.reduce((m, i) => Math.max(m, Number(i.id) || 0), 0), ord = categories.filter((c) => c.menuId === menuId).reduce((m, c) => Math.max(m, c.order || 0), 0);
      const ops = [];
      cats.forEach((c, ci) => {
        let ex = categories.find((x) => x.menuId === menuId && x.nameAr === c.name), cid = ex ? ex.id : 'cat-' + Date.now() + '-' + ci;
        if (!ex) ops.push([doc(db, 'categories', cid), { nameAr: c.name, nameEn: c.name, menuId, icon: c.icon, order: ++ord, active: true }]);
        c.items.forEach((it) => {
          if (ex && items.some((i) => i.menuId === menuId && i.categoryId === cid && i.nameAr === it.nameAr)) return;
          ops.push([doc(db, 'menu', String(++maxId)), { nameAr: it.nameAr, nameEn: it.nameEn || it.nameAr, menuId, categoryId: cid, price: it.price, image: 'images/hot-coffee/01.jpg', descAr: '', descEn: '', inStock: true }]);
        });
      });
      for (let i = 0; i < ops.length; i += 400) { const b = writeBatch(db); ops.slice(i, i + 400).forEach(([r, d]) => b.set(r, d)); await b.commit(); }
      showToast('✅ اتضاف ' + ops.length + ' عنصر'); $('qmText').value = ''; $('qmOut').innerHTML = ''; plan = null; closeModal('quickMenuModal');
    } catch (e) { console.error(e); showToast('❌ ' + (e.message || 'فشل الحفظ')); $('qmGo').disabled = false; }
  }
  window.openQuickMenu = function () {
    inject(); $('qmMenu').innerHTML = '<option value="">— اختار —</option>' + menus.map((m) => `<option value="${m.id}">${m.nameAr || m.name || m.id}</option>`).join('');
    if (menus.length === 1) $('qmMenu').value = menus[0].id; $('qmOut').innerHTML = ''; $('qmGo').disabled = true; $('quickMenuModal').classList.add('open');
  };
  window.__quickMenuParse = parse;
})();
