// src/hooks/useOnlineStatus.js

import { useState, useEffect } from 'react';

/**
 * Tarayıcının çevrimiçi (online) durumunu izleyen özel hook.
 * @returns {boolean} true eğer cihaz çevrimiçi ise, aksi takdirde false.
 */
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Çevrimiçi olma olayını dinle
    const handleOnline = () => setIsOnline(true);
    // Çevrimdışı olma olayını dinle
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Temizleme işlevi
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export default useOnlineStatus;