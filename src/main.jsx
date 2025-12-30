// src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' 
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { initializePWAInstallPrompt, registerServiceWorker } from './utils/pwaInstall.jsx'; 

// --- EKLENDİ ---
// Analytics'i tetiklemek için config dosyasından import et
import { analytics } from './services/firebase/config.jsx';
// --- EKLENDİ SONU ---


// Uygulama render edilmeden hemen önce Service Worker ve PWA prompt mekanizmasını başlat
initializePWAInstallPrompt(); 
registerServiceWorker(); 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)