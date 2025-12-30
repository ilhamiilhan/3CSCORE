// src/utils/pwaInstall.jsx - iOS DESTEĞİ EKLENDİ

let deferredPrompt;
const installPromptContainer = document.getElementById('install-prompt-container');
const installButton = document.getElementById('install-button');
const cancelButton = document.getElementById('cancel-button');

// YENİ ELEMANLAR
const iosInstallPrompt = document.getElementById('ios-install-prompt');
const iosCloseButton = document.getElementById('ios-close-button');

// iOS tespiti
const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
};
// Uygulamanın zaten ana ekrana eklenip eklenmediği (iOS için)
const isPWAInstalled = () => {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
};


export function initializePWAInstallPrompt() {
    // Eğer PWA zaten yüklüyse (Standalone modda çalışıyorsa), hiçbir şey yapma
    if (isPWAInstalled()) {
        console.log("PWA detected (standalone mode), install prompt suppressed.");
        return;
    }

    // 1. CHROME / ANDROID MEKANİZMASI
    if (!isIOS()) {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Çifte kontrol: Standalone mod
            if (isPWAInstalled()) return;

            e.preventDefault();
            deferredPrompt = e;

            // Android: Eğer PWA zaten yüklü değilse, kendi uyarı kutumuzu göster
            if (installPromptContainer && deferredPrompt) {
                installPromptContainer.style.display = 'flex';
                installPromptContainer.classList.remove('translate-y-full');
            }
        });
    }

    // 2. IOS / SAFARI MEKANİZMASI
    if (isIOS() && !isPWAInstalled()) {
        // iOS'ta otomatik uyarı tetiklenmez. Biz kendimiz gösteririz.
        if (iosInstallPrompt) {
            iosInstallPrompt.style.display = 'flex';
            iosInstallPrompt.classList.remove('translate-y-full');
        }
    }

    // ANDROID BUTON İŞLEMLERİ (Önceki kodunuz)
    if (installButton) {
        installButton.addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => {
                    installPromptContainer.style.display = 'none';
                    deferredPrompt = null;
                });
            }
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            if (installPromptContainer) {
                installPromptContainer.classList.add('translate-y-full');
                setTimeout(() => { installPromptContainer.style.display = 'none'; }, 500);
            }
        });
    }

    // IOS KAPAT BUTONU İŞLEMİ
    if (iosCloseButton) {
        iosCloseButton.addEventListener('click', () => {
            if (iosInstallPrompt) {
                iosInstallPrompt.classList.add('translate-y-full');
                setTimeout(() => { iosInstallPrompt.style.display = 'none'; }, 500);
            }
        });
    }
}

// registerServiceWorker kısmı aynı kalır...
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('SW registered: ', registration);
            }).catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
        });
    }
}