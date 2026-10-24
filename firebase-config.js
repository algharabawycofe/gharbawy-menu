import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, getDoc,
  onSnapshot, addDoc, query, orderBy, serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, setPersistence, inMemoryPersistence
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

// تصدير كل دوال Firebase عشان صفحة العميل ولوحة التحكم يستخدموها
window.FB = {
  firebaseConfig,
  db: getFirestore(app),
  auth: getAuth(app),
  // Firestore
  collection, doc, setDoc, updateDoc, deleteDoc, getDoc,
  onSnapshot, addDoc, query, orderBy, serverTimestamp, writeBatch,
  // Auth
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, setPersistence, inMemoryPersistence,
  // App
  initializeApp, getAuth, deleteApp
};

window.FB_READY = true;
window.dispatchEvent(new Event('fb-ready'));
