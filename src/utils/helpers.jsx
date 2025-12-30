// src/utils/helpers.jsx - RAPORLAMA VE İSTATİSTİK İÇİN DÜZELTİLMİŞ NİHAİ VERSİYON

// ----------------------------------------------------------------------
// 1. FORMATLAMA (GG.AA.YYYY formatında GÖRÜNTÜLEME)
// ----------------------------------------------------------------------

/**
 * Date nesnesini, Firebase Timestamp objesini veya saniyeli objeyi
 * GG.AA.YYYY string formatına dönüştürür.
 * @param {Date | {seconds: number} | {toDate: function} | string} dateInput
 */
export const formatDateToTurkish = (dateInput) => {
    let date;

    if (!dateInput) return 'N/A';

    // 1. Firebase Timestamp objesi kontrolü ({ toDate() metodu varsa })
    if (typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
    } 
    // 2. {seconds: number} objesi kontrolü
    else if (dateInput.seconds) {
        date = new Date(dateInput.seconds * 1000);
    } 
    // 3. Zaten bir Date nesnesi ise
    else if (dateInput instanceof Date) {
        date = dateInput;
    } 
    // 4. String ise (e.g. yyyy-mm-dd veya GG.AA.YYYY)
    else if (typeof dateInput === 'string') {
        date = parseDate(dateInput);
        if (!date) return dateInput; // parseDate başarısız olursa orijinal stringi döndür
    }
    else {
        return String(dateInput); // Diğer bilinmeyen tipler için
    }

    if (isNaN(date.getTime())) return 'Hatalı Tarih';

    // Tarihi GG.AA.YYYY formatına dönüştür
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ay 0'dan başlar
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
};


// ----------------------------------------------------------------------
// 2. AYRIŞTIRMA (Date Objesi Oluşturma)
// ----------------------------------------------------------------------

/**
 * String, Timestamp veya Date girdisinden güvenli bir Date objesi oluşturur.
 * (Bu fonksiyon, getTimestampRange tarafından 'custom' aralık için kullanılır)
 */
export const parseDate = (dateInput) => {
    if (!dateInput) return null;
    
    // 1. Zaten Date veya Timestamp ise doğru Date objesini döndür
    if (dateInput instanceof Date) return dateInput;
    
    // Firebase Timestamp objesi kontrolü
    if (dateInput.seconds || typeof dateInput.toDate === 'function') {
        try {
            return dateInput.toDate ? dateInput.toDate() : new Date(dateInput.seconds * 1000);
        } catch {
            return null;
        }
    } 

    const dateStr = String(dateInput);
    if (typeof dateStr !== 'string' || dateStr === "Invalid Date" || dateStr.length === 0) return null;


    // YYYY-MM-DD formatını kontrol et (Input type="date" ile gelen format)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-');
        // Saat dilimi sorunlarını önlemek için yerel saatle oluştur
        const fixedDate = new Date(year, month - 1, day); 
        return fixedDate;
    }
    
    // GG.AA.YYYY formatını ayrıştır (Firebase'e string olarak kaydedilen eski format)
    const parts = dateStr.split('.');
    if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        // Saat dilimi sorunlarını önlemek için yerel saatle oluştur
        const fixedDate = new Date(year, month - 1, day); 
        return fixedDate;
    }
    
    // Standart formatları dene (eğer farklı bir string gelirse)
    const standardDate = new Date(dateStr);
    if (!isNaN(standardDate.getTime())) return standardDate;

    return null;
};


// ----------------------------------------------------------------------
// 3. ZAMAN ARALIĞI HESAPLAMA (GÜNCELLENDİ)
// ----------------------------------------------------------------------

/**
 * Belirtilen aralığa göre başlangıç ve bitiş zamanını (Date objesi) hesaplar.
 * Raporlama ('custom' dahil) ve İstatistik sekmeleri için güncellendi.
 * @param {string} rangeType - '1m', '3m', '1y', 'custom', 'all'
 * @param {string} [startDateStr] - 'custom' için YYYY-MM-DD formatında başlangıç
 * @param {string} [endDateStr] - 'custom' için YYYY-MM-DD formatında bitiş
 * @returns {{start: Date, end: Date}}
 */
export const getTimestampRange = (rangeType, startDateStr, endDateStr) => {
    let start = new Date();
    let end = new Date(); // Bitiş tarihi varsayılan olarak bugündür

    // Bitiş tarihini her zaman günün sonuna ayarla (23:59:59)
    end.setHours(23, 59, 59, 999);

    // --- ÖZEL TARİH ARALIĞI (RAPORLAMA İÇİN) ---
    if (rangeType === 'custom') {
        
        const customStart = parseDate(startDateStr);
        const customEnd = parseDate(endDateStr);

        if (customStart) {
            customStart.setHours(0, 0, 0, 0); // Başlangıcı günün başına ayarla
            start = customStart;
        } else {
            // Başlangıç tarihi geçersizse, çok eski bir tarih kullan
            start = new Date(2000, 0, 1); 
        }

        if (customEnd) {
            customEnd.setHours(23, 59, 59, 999); // Bitişi günün sonuna ayarla
            end = customEnd;
        } else {
            // Bitiş tarihi geçersizse, bugünün sonunu kullan
            end = new Date();
            end.setHours(23, 59, 59, 999);
        }
        
        return { start, end };
    }

    // --- HIZLI ARALIKLAR (İSTATİSTİK & RAPORLAMA İÇİN) ---
    switch (rangeType) {
        case '1w': // Son 1 Hafta (Pazartesi 00:00'dan)
        case '2w': // Son 2 Hafta (2 hafta öncesinin Pazartesi 00:00'dan)
            {
                let offset = 0;
                if (rangeType === '2w') {
                    offset = -7; // 2 hafta için 7 gün daha geri git
                }
                
                // 0 = Pazar, 1 = Pazartesi
                const currentDay = start.getDay(); 
                const diff = (currentDay === 0 ? 6 : currentDay - 1); // Pazartesi'den ne kadar gün geri gidecek

                start.setDate(start.getDate() - diff + offset); 
                start.setHours(0, 0, 0, 0); // O günün başlangıcı
            }
            break;
        case '1m': // Son 1 Ay
            start.setMonth(start.getMonth() - 1);
            start.setDate(start.getDate() + 1); 
            start.setHours(0, 0, 0, 0);
            break;
        case '3m': // Son 3 Ay
            start.setMonth(start.getMonth() - 3);
            start.setDate(start.getDate() + 1); 
            start.setHours(0, 0, 0, 0);
            break;
        case '6m': // Son 6 Ay
            start.setMonth(start.getMonth() - 6);
            start.setDate(start.getDate() + 1); 
            start.setHours(0, 0, 0, 0);
            break;
        case '1y': // Son 1 Yıl
            start.setFullYear(start.getFullYear() - 1);
            start.setDate(start.getDate() + 1); 
            start.setHours(0, 0, 0, 0);
            break;
        case 'all': // Tüm zamanlar
        default:
            start = new Date(2000, 0, 1); // 1 Ocak 2000
            start.setHours(0, 0, 0, 0);
            break;
    }

    // Hızlı aralıklar için 'start' hesaplandı, 'end' zaten 'bugün' (en üstte ayarlanmıştı).
    return { start, end };
};