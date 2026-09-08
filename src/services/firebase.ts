import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// 1. Ambil config dari Environment Variables (Cloudflare Pages / Local .env.local)
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// 2. Fallback ke konfigurasi project pribadi kamu (sorside-frequency) jika env belum di-set
const defaultUserConfig = {
  apiKey: "AIzaSyC_ayEpMHmY2FTqa322GxSrwi8e-gzarig",
  authDomain: "sorside-frequency.firebaseapp.com",
  projectId: "sorside-frequency",
  storageBucket: "sorside-frequency.firebasestorage.app",
  messagingSenderId: "701816372598",
  appId: "1:701816372598:web:a904a51b6f639e04cf0e57",
  measurementId: "G-3JJSLDR21Q"
};

const activeConfig = envConfig.apiKey && envConfig.projectId ? envConfig : defaultUserConfig;

// Inisialisasi Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(activeConfig);

// Inisialisasi Firestore Database (default)
export const db = getFirestore(app);

// Inisialisasi Auth
export const auth = getAuth(app);

// Helper silent anonymous sign-in
export const ensureAnonymousAuth = async () => {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    return auth.currentUser;
  } catch (error) {
    // Di Firestore Web, anonymous auth opsional jika rule diset test mode / publik
    console.warn('[Frequency] Auth note:', error);
    return null;
  }
};
