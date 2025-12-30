// src/services/firebase/config.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics'; // EKLENDİ

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyDFqmZg4khPVJron56Cyj0nfsupvBjuTAA",
  authDomain: "bilardo-skor.firebaseapp.com",
  projectId: "bilardo-skor",
  storageBucket: "bilardo-skor.firebasestorage.app",
  messagingSenderId: "413070873797",
  appId: "1:413070873797:web:9017509d95240516afccac",
  measurementId: "G-VZJ76K1SLM"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Servisleri başlat ve dışa aktar
const analytics = getAnalytics(app); // EKLENDİ

export const auth = getAuth(app);
export const db = getFirestore(app);
export { analytics }; // EKLENDİ (Analytics'i dışa aktarmak için)
export default app;