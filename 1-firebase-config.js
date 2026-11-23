import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, getDoc,
  onSnapshot, addDoc, query, orderBy, serverTimestamp, writeBatch, where, getDocs, increment, // ✅ ضفنا getDocs و increment (للولاء)
  connectFirestoreEmulator
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, setPersistence, inMemoryPersistence,
  signInAnonymously, connectAuthEmulator
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDyZRowpsfHFIJJM0hr101zW0znRu4IgL4",
  authDomain: "gharbawy-menu.firebaseapp.com",
  projectId: "gharbawy-menu",
  storageBucket: "gharbawy-menu.firebasestorage.app",
  messagingSenderId: "1004643676156",
  appId: "1:1004643676156:web:18d8d5dbb2d422d5590c79"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// التشغيل المحلي: لو الصفحة على localhost وصل بالإيميوليتور بدل الإنتاج (أمان للتجارب)
if (['localhost', '127.0.0.1'].includes(location.hostname)) {
  connectFirestoreEmulator(db, '127.0.0.1', 8899);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}

// هوية الضيف: تسجيل دخول مجهول (anonymous auth) — يتعمل مرة ويفضل محفوظ في المتصفح.
// الأوردرات والتقييمات ونداءات الويتر بتتربط بالـ uid ده (guestUid) حسب القواعد الجديدة.
// ملحوظة نشر: لازم تفعيل Anonymous من Firebase Console ← Authentication ← Sign-in method.
const guestReady = (async () => {
  if (auth.currentUser) return auth.currentUser.uid;
  try { const c = await signInAnonymously(auth); return c.user.uid; }
  catch (e) { console.warn('guest auth failed', e); return null; }
})();

window.FB = {
  firebaseConfig,
  db,
  auth,
  guestReady,
  // Firestore
  collection, doc, setDoc, updateDoc, deleteDoc, getDoc,
  onSnapshot, addDoc, query, orderBy, serverTimestamp, writeBatch, where, 
  getDocs, increment, // ✅ ضفنا getDocs هنا كمان عشان الكود يقدر يستخدمها
  // Auth
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, setPersistence, inMemoryPersistence,
  signInAnonymously,
  // App
  initializeApp, getAuth, deleteApp
};

window.FB_READY = true;
window.dispatchEvent(new Event('fb-ready'));
