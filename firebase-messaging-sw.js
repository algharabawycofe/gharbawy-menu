/* الغرباوي — Service Worker لإشعارات Push (Firebase Cloud Messaging)
   بيشتغل في الخلفية عشان الإشعار يوصل والموقع مقفول. مفيش فيه أسرار (إعدادات Firebase العامة بس). */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
firebase.initializeApp({
  "apiKey": "AIzaSyDyZRowpsfHFIJJM0hr101zW0znRu4IgL4",
  "authDomain": "gharbawy-menu.firebaseapp.com",
  "projectId": "gharbawy-menu",
  "storageBucket": "gharbawy-menu.firebasestorage.app",
  "messagingSenderId": "1004643676156",
  "appId": "1:1004643676156:web:18d8d5dbb2d422d5590c79"
});
const messaging=firebase.messaging();
const BASE=self.registration.scope.replace(/fcm-scope\/$/,'');
/* لو الرسالة data-only نعرضها إحنا. رسائل notification بيعرضها Firebase تلقائي */
messaging.onBackgroundMessage(p=>{
  if(p.notification)return;
  const d=p.data||{};
  return self.registration.showNotification(d.title||'الغرباوي ☕',{body:d.body||'',icon:BASE+'logo-01.png',lang:'ar',dir:'rtl',data:{url:d.url||BASE+'loyalty.html'}});
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=(e.notification.data&&e.notification.data.url)||BASE+'loyalty.html';
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
    for(const c of l){if(c.url.startsWith(url)&&'focus' in c)return c.focus()}
    return clients.openWindow(url);
  }));
});
