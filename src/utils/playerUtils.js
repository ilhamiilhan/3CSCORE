// src/utils/playerUtils.js

/**
 * Bir oyuncu bilgisini (ID, Username veya Obje) alır,
 * Oyuncu listesinden eşleştirir ve formatlı ismini döndürür.
 * Format: "İsim SOYİSİM" (Örn: İlkay KAYA)
 */
export const formatPlayerName = (identifier, playersList = []) => {
    if (!identifier) return "";

    // 1. Ham İsim Verisini Bul (Raw Name)
    let rawFullName = "";

    // Eğer playersList boşsa ve elimizdeki veriden bir şeyler çıkarabiliyorsak
    if (!playersList || playersList.length === 0) {
        if (typeof identifier === 'object') {
            if (identifier.fullName) rawFullName = identifier.fullName;
            else if (identifier.name || identifier.surname) rawFullName = `${identifier.name || ""} ${identifier.surname || ""}`;
            else rawFullName = identifier.username || "";
        } else {
            rawFullName = identifier; // Sadece string geldiyse (örn: "ilhami")
        }
    } 
    else {
        // Listede Arama Yap
        const searchKey = typeof identifier === 'object' ? (identifier.id || identifier.username) : identifier;

        const playerObj = playersList.find(p => 
            (p.username && p.username === searchKey) || 
            (p.id && p.id.toString() === searchKey?.toString())
        );

        if (playerObj) {
            // Listede bulduk!
            if (playerObj.fullName) {
                rawFullName = playerObj.fullName;
            } else if (playerObj.name || playerObj.surname) {
                rawFullName = `${playerObj.name || ""} ${playerObj.surname || ""}`;
            } else {
                rawFullName = playerObj.username;
            }
        } else {
            // Listede yoksa elimizdeki veriyi kullan
            if (typeof identifier === 'object') {
                 if (identifier.fullName) rawFullName = identifier.fullName;
                 else rawFullName = identifier.username || "";
            } else {
                rawFullName = identifier;
            }
        }
    }

    // 2. Bulunan ham ismi standart formata (İsim SOYİSİM) çevir
    return applyNameStandard(rawFullName);
};

/**
 * YARDIMCI FONKSİYON: İsim Standartlaştırma Motoru
 * Girdi: "ilhami ilhan" -> Çıktı: "İlhami İLHAN"
 * Girdi: "İLKAY KAYA"   -> Çıktı: "İlkay KAYA"
 */
const applyNameStandard = (fullName) => {
    if (!fullName) return "";
    
    // Gereksiz boşlukları temizle
    const cleanName = fullName.trim();
    
    // Boşluklara göre parçala (Birden fazla isim olabilir)
    const parts = cleanName.split(/\s+/);

    // Tek kelimeyse (Sadece kullanıcı adı gibiyse)
    if (parts.length === 1) {
        return capitalize(parts[0]); // Sadece Baş harfi büyüt
    }

    // Son kelimeyi SOYAD olarak al
    const lastName = parts.pop();
    
    // Geri kalanlar İSİM'dir
    const firstNames = parts.map(name => capitalize(name)).join(" ");

    // Soyadı BÜYÜK HARF yap (Türkçe karakter destekli)
    const formattedLastName = lastName.toLocaleUpperCase('tr-TR');

    // Birleştir: "İlkay" + " " + "KAYA"
    const finalString = `${firstNames} ${formattedLastName}`;

    // 3. Uzunluk Kontrolü (Mobil uyum için kısaltma)
    // Eğer toplam uzunluk 18 karakteri geçiyorsa soyadını kısalt.
    // Örn: "Muhammed Mustafa KAHRAMANOĞLU" -> "Muhammed Mustafa KA."
    if (finalString.length > 18) {
        return `${firstNames} ${formattedLastName.substring(0, 2)}.`;
    }

    return finalString;
};

/**
 * YARDIMCI: Kelimenin sadece baş harfini büyütür
 * Örn: "ilhami" -> "İlhami", "İLKAY" -> "İlkay"
 */
const capitalize = (word) => {
    if (!word) return "";
    return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR');
};