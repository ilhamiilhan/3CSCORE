/**
 * LiveScoreboardButton.js
 * 
 * 3cscore.com → live.3cscore.com Yönlendirme Butonu
 * 
 * Bu component, kullanıcıyı Canlı Skorboard uygulamasına yönlendirir.
 * Firebase ID Token ve userId parametreleri ile güvenli erişim sağlar.
 * 
 * Kullanım:
 *   import LiveScoreboardButton from './components/LiveScoreboardButton';
 *   <LiveScoreboardButton />
 * 
 * Tarih: 23 Aralık 2025
 */

import { auth } from '../services/firebase/config.jsx';

function LiveScoreboardButton({ text = '🎱 Canlı Skorboard', style = {}, className = '' }) {

  const handleClick = async () => {
    try {
      const currentUser = auth.currentUser;

      // Kullanıcı giriş yapmış mı kontrol et
      if (!currentUser) {
        alert('Lütfen önce giriş yapın!');
        return;
      }

      // Firebase ID Token al (her seferinde taze token)
      const idToken = await currentUser.getIdToken(true);

      // URL parametrelerini oluştur
      const params = new URLSearchParams({
        token: idToken,      // Zorunlu - Kimlik doğrulama için
        userId: currentUser.uid  // Zorunlu - Kullanıcı bilgilerini çekmek için
      });

      // live.3cscore.com'a yönlendir
      window.location.href = `https://live.3cscore.com?${params.toString()}`;

    } catch (error) {
      console.error('Yönlendirme hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const defaultStyle = {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)'
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      style={{ ...defaultStyle, ...style }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#219a52';
        e.target.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = style.backgroundColor || '#27ae60';
        e.target.style.transform = 'scale(1)';
      }}
    >
      {text}
    </button>
  );
}

export default LiveScoreboardButton;

/**
 * ============================================
 * ÖNEMLİ NOTLAR:
 * ============================================
 * 
 * 1. Firebase Import:
 *    - `auth` import yolunu kendi projenize göre düzenleyin
 *    - Örnek: import { auth } from '../config/firebase';
 * 
 * 2. Token Bilgisi:
 *    - Firebase ID Token 1 saat geçerlidir
 *    - Her tıklamada getIdToken(true) ile taze token alınır
 * 
 * 3. Güvenlik:
 *    - Token olmadan live.3cscore.com'a erişim ENGELLENİR
 *    - Token URL'de HTTPS ile şifrelenir
 * 
 * 4. Test:
 *    - Giriş yapmadan butona tıkla → "Lütfen giriş yapın" uyarısı
 *    - Giriş yapıp tıkla → live.3cscore.com açılır
 * 
 * ============================================
 */
