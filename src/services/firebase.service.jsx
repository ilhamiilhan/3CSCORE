// src/services/firebase.service.jsx
// ★ OTOMATİK ID SİSTEMİ ★

import { 
    doc, 
    runTransaction 
} from "firebase/firestore";
import { db } from './firebase/config.jsx'; 

// ---------------------------------------------------------------------------
// ▼▼▼▼▼ AYARLAR: ÖZEL ID LİSTESİ (REZERVASYON) ▼▼▼▼▼
// Yeni kayıt olan birinin e-postası buradaysa, listedeki numarayı alır.
// Buradaki numaralar otomatik dağıtımda başkasına verilmez (atlanır).
// ---------------------------------------------------------------------------
const OZEL_IDLER = {
    "agharta55@hotmail.com": 1,       // SEN (Admin)
    "error_3@hotmail.com": 2,    // Arkadaşın
    "hyolcu55@gmail.com": 3,     // Başka biri
    "oran_erol@hotmail.com": 4,        // Özel sayı isteyen biri
    "ilkay.kaya1984@gmail.com": 5,       // Başka bir özel sayı
    "ilhamiilhan55@gmail.com": 31,
    // Format: "e-posta": numara,
};
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

const COUNTER_DOC_REF = doc(db, "counters", "memberId");

/**
 * Yeni üye olurken sıradaki ID'yi verir.
 * Eğer sıra "Rezerve" edilmiş bir sayıya gelirse, onu atlar.
 */
export const getNextMemberId = async (email) => {
    // 1. Eğer yeni kayıt olan kişi ÖZEL LİSTEDE ise direkt o numarayı ver
    if (OZEL_IDLER[email]) {
        console.log(`⭐ Özel ID Tespit Edildi: ${email} -> ID: ${OZEL_IDLER[email]}`);
        return OZEL_IDLER[email];
    }

    try {
        const newId = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(COUNTER_DOC_REF);
            
            // Mevcut sayacı al (yoksa 0 kabul et)
            let currentLastId = 0;
            if (counterDoc.exists()) {
                currentLastId = counterDoc.data().currentId || 0;
            }

            // Bir sonraki aday numara
            let candidateId = currentLastId + 1;

            // --- ÇAKIŞMA KONTROLÜ ---
            // Eğer sıradaki numara (candidateId) özel listede birine verilmişse (rezerve ise),
            // bu numarayı atla ve bir sonrakine bak.
            const reservedNumbers = Object.values(OZEL_IDLER);
            
            while (reservedNumbers.includes(candidateId)) {
                console.log(`⚠️ ID ${candidateId} rezerve edilmiş, atlanıyor...`);
                candidateId++;
            }

            // Yeni numarayı sayaca kaydet
            transaction.set(COUNTER_DOC_REF, { currentId: candidateId });
            
            return candidateId;
        });
        
        console.log(`✅ Yeni Sıralı ID oluşturuldu: ${newId}`);
        return newId;

    } catch (error) {
        console.error("❌ getNextMemberId hatası:", error);
        // Hata olursa rastgele ver (Acil durum)
        return Math.floor(10000 + Math.random() * 90000);
    }
};