/* أدوات QR بدون أي مكتبة خارجية: توليد SVG + تحميل PNG + طباعة (يعتمد على loyalty-qr.js) */
(function () {
  const INK = '#2B1D14', GOLD = '#C89B5E', F = 'Cairo, Tahoma, "Segoe UI", sans-serif';
  function matrix(text) {
    for (let t = 2; t <= 40; t++) { try { const q = new QRCodeLib(t, QRLevel.H); q.addData(text); q.make(); return q; } catch (e) {} }
    throw new Error('الرابط طويل أوي على QR');
  }
  function svg(text) {
    const q = matrix(text), n = q.getModuleCount(); let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + 2} ${r + 2}h1v1h-1z`;
    return `<svg viewBox="0 0 ${n + 4} ${n + 4}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="${INK}"/></svg>`;
  }
  const loadImg = (src) => new Promise((res) => {
    const i = new Image(); try { if (/^https?:/i.test(src) && new URL(src).origin !== location.origin) i.crossOrigin = 'anonymous'; } catch (e) {}
    i.onload = () => res(i); i.onerror = () => res(null); i.src = src;
  });
  /* كارت QR كامل (لوجو + اسم + عنوان + QR + جملة) على canvas */
  async function card(o) {
    const W = 900, H = 1200, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const x = cv.getContext('2d'); try { await document.fonts.load('700 40px Cairo'); } catch (e) {}
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, GOLD); g.addColorStop(1, INK); x.fillStyle = g; x.fillRect(0, 0, W, 16);
    x.direction = 'rtl'; x.textAlign = 'center';
    const logo = await loadImg(o.logo || 'logo-01.png'); let y = 60;
    if (logo) { const h = 110, w = Math.min(300, logo.width * h / logo.height); x.drawImage(logo, (W - w) / 2, y, w, h); y += h + 20; }
    x.fillStyle = INK; x.font = `900 56px ${F}`; x.fillText(o.company || 'الغرباوي', W / 2, y + 50); y += 80;
    x.fillStyle = GOLD; x.font = `700 42px ${F}`; x.fillText(o.title || '', W / 2, y + 40); y += 80;
    const q = matrix(o.url), n = q.getModuleCount(), m = Math.floor(640 / (n + 4)), qs = m * (n + 4), ox = (W - qs) / 2, oy = y;
    x.fillStyle = '#fff'; x.fillRect(ox - 20, oy - 20, qs + 40, qs + 40);
    x.strokeStyle = '#E8DED2'; x.lineWidth = 4; x.setLineDash([14, 10]); x.strokeRect(ox - 20, oy - 20, qs + 40, qs + 40); x.setLineDash([]);
    x.fillStyle = INK; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) x.fillRect(ox + (c + 2) * m, oy + (r + 2) * m, m, m);
    if (logo) { const s = qs * 0.2; x.fillStyle = '#fff'; x.beginPath(); x.arc(W / 2, oy + qs / 2, s * 0.62, 0, 7); x.fill(); x.drawImage(logo, W / 2 - s / 2, oy + qs / 2 - s / 2 * logo.height / logo.width, s, s * logo.height / logo.width); }
    y = oy + qs + 90; x.fillStyle = INK; x.font = `700 38px ${F}`; x.fillText(o.foot || 'امسح الكود لفتح المنيو ☕', W / 2, y);
    return cv;
  }
  const toBlob = (c) => new Promise((r) => c.toBlob(r, 'image/png'));
  function save(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }
  async function download(o, name) { save(await toBlob(await card(o)), name || 'qr.png'); }
  /* طباعة كارت أو أكتر (4 في الصفحة) من غير نافذة منبثقة */
  async function print(list) {
    const imgs = []; for (const o of list) imgs.push((await card(o)).toDataURL('image/png'));
    const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'; document.body.appendChild(f);
    const d = f.contentDocument; d.open();
    d.write(`<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>QR</title><style>@page{size:A4;margin:8mm}body{margin:0}.p{display:grid;grid-template-columns:${list.length > 1 ? '1fr 1fr' : '1fr'};gap:6mm}.p img{width:100%;break-inside:avoid;page-break-inside:avoid;border:1px solid #E8DED2;border-radius:5mm}${list.length === 1 ? '.p img{max-width:140mm;margin:0 auto}' : ''}</style></head><body><div class="p">${imgs.map((s) => `<img src="${s}">`).join('')}</div></body></html>`);
    d.close(); await Promise.all([...d.images].map((i) => (i.decode ? i.decode().catch(() => {}) : 0)));
    f.contentWindow.focus(); f.contentWindow.print(); setTimeout(() => f.remove(), 120000);
  }
  window.QRT = { svg, card, download, print };
})();
