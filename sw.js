/* =========================================================
   الغرباوي — Service Worker (v2)
   ---------------------------------------------------------
   إصلاح مشاكل الكونسول:
     - كان بيحاول يعمل كاش لكل حاجة حتى طلبات Firebase
       (firebase.googleapis.com / securetoken) اللي مش ممكن
       تتكاش، ولما الشبكة تفشل كان بيرمي خطأ غير معالج.
     - كان cache-first لكل الصفحات، فالتحديثات (زي إصلاح
       سعر العروض) مش بتوصل للعميل.
   النسخة دي:
     - بتسيب طلبات Firebase وأي دومين تاني للمتصفح مباشرة.
     - الصفحات: network-first (التحديث يظهر فوراً) + fallback.
     - الأصول الثابتة: cache-first مع تحديث في الخلفية.
     - بتنضّف الكاش القديم وبتحل محل الـ SW القديم فوراً.
   ========================================================= */

const VERSION = "gharbawy-v2";
const STATIC_CACHE = VERSION + "-static";
const RUNTIME_CACHE = VERSION + "-runtime";

const PRECACHE = ["./", "./index.html", "./logo-01.png", "./manifest.json"];

/* ---------- install ---------- */
self.addEventListener("install", (event) => {
  self.skipWaiting(); // خلي النسخة الجديدة تاخد مكان القديمة على طول
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {
        /* لو أي ملف ناقص، منكسرش تثبيت الـ SW */
      })
  );
});

/* ---------- activate ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

/* ---------- fetch ---------- */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }

  // 1) أي طلب مش GET أو مش من نفس الدومين (Firebase / Google / خطوط)
  //    نسيبه للمتصفح — منتدخلش فيه خالص.
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // 2) ملفات لازم تفضل لايف دايمًا
  if (url.pathname.endsWith("/sw.js")) return;
  if (url.pathname.endsWith("/firebase-config.js")) return;

  // 3) صفحات HTML → network-first عشان أي تحديث يظهر
  const accept = req.headers.get("accept") || "";
  const isHtml = req.mode === "navigate" || accept.indexOf("text/html") !== -1;
  if (isHtml) {
    event.respondWith(networkFirst(req));
    return;
  }

  // 4) أصول ثابتة (صور/ستايل/سكريبت) → cache-first + تحديث خلفي
  event.respondWith(cacheFirst(req));
});

/* ---------- strategies ---------- */

async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      try {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(req, fresh.clone());
      } catch (e) {
        /* تجاهل */
      }
    }
    return fresh;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;

    const shell = await caches.match("./index.html");
    if (shell) return shell;

    return new Response(
      `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>غير متصل — الغرباوي</title>
</head>
<body style="font-family:system-ui,sans-serif;background:#FAF6F0;color:#2B1D14;display:grid;place-items:center;height:100vh;margin:0;text-align:center">
  <div>
    <div style="font-size:48px">☕</div>
    <h1>مفيش اتصال بالإنترنت</h1>
    <p style="color:#6F4E37">اتأكد من الشبكة وجرّب تحديث الصفحة.</p>
  </div>
</body>
</html>`,
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;

  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      try {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, fresh.clone());
      } catch (e) {
        /* تجاهل */
      }
    }
    return fresh;
  } catch (err) {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

/* ---------- أوامر يدوية (اختياري) ---------- */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
