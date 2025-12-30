// YENİ MODÜLER İMPORTLAR
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, query, orderBy, where, writeBatch, serverTimestamp } from 'firebase/firestore';

const ITEMS_PER_PAGE = 10; 

// Tarih parse fonksiyonu (Aynı kalır)
const parseDateString = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('.');
    if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
    }
    return new Date(dateStr); 
};

// Oyuncu ortalamalarını hesaplayan yardımcı fonksiyon (toFixed(3) olarak güncellendi)
const calculatePlayerAverages = (records, playerList, setPlayerAverages) => {
    const stats = {};
    playerList.forEach(p => stats[p] = { score: 0, shots: 0 });

    records.forEach(r => {
        if (stats[r.player1]) {
            stats[r.player1].score += r.score1;
            stats[r.player1].shots += r.shots;
        }
        if (stats[r.player2]) {
            stats[r.player2].score += r.score2;
            stats[r.player2].shots += r.shots;
        }
    });

    const averages = {};
    for (const p in stats) {
        averages[p] = stats[p].shots > 0 ? (stats[p].score / stats[p].shots).toFixed(3) : "0.000";
    }
    setPlayerAverages(averages);
};

// 1. Oyuncu Listesini Yükleme (Aynı kalır)
const loadPlayers = async (firestore, setPlayers, returnNames = false) => {
    if (!firestore) return [];
    try {
        const docRef = doc(firestore, "players", "playersList"); // doc()
        const snapshot = await getDoc(docRef); // getDoc()
        const names = snapshot.exists() ? (snapshot.data().names || []) : []; // .exists() metodu
        
        setPlayers(names);
        return names;
    } catch (err) {
        console.error("Oyuncu yukleme hatasi:", err);
        return [];
    }
};

// 2. Tüm Veriyi Yükleme ve Ortalamaları Hesaplama (Aynı kalır)
const loadDataAndAverages = async (db, setRecords, setAllRecords, setPlayers, setPlayerAverages, setLoading) => {
    if (!db) return;

    setLoading(true);
    try {
        const playerList = await loadPlayers(db, setPlayers, true);
        
        // Sorguyu oluşturma: collection, query ve orderBy kullanıldı
        const q = query(collection(db, "records"), orderBy("timestamp", "desc"));
        const allRecordsSnapshot = await getDocs(q); // getDocs()
        
        const allRecordsData = allRecordsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllRecords(allRecordsData);
        setRecords(allRecordsData); 
        
        calculatePlayerAverages(allRecordsData, playerList, setPlayerAverages);
        
    } catch (err) {
         console.error("Veri yükleme hatası:", err);
    } finally {
         setLoading(false);
    }
};

// 3. Admin İçin Tüm Kullanıcıları Yükleme (Aynı kalır)
const loadAllUsers = async (db, isAdmin, setUsersList) => {
    if (!isAdmin || !db) return;
    try {
        const snapshot = await getDocs(collection(db, "users")); // getDocs(collection())
        const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        setUsersList(users);
    } catch (err) {
        console.error("Admin kullanıcı listesini yükleme hatası:", err);
    }
};

// 4. Kullanıcının Kendi Oyunlarını Yükleme (Aynı kalır)
const loadUserGames = (profileUsername, allRecords, setUserGames, setCurrentPage) => {
    if (!profileUsername || allRecords.length === 0) {
        setUserGames([]);
        return;
    }
    const games = allRecords.filter(r => r.player1 === profileUsername || r.player2 === profileUsername);
    setUserGames(games);
    setCurrentPage(1); 
};

// 5. Kayıt Ekleme (CRUD) (Aynı kalır)
const addRecord = async (db, player1, score1, player2, score2, shots, setError, setScore1, setScore2, setShots, loadRecords, setLoading) => {
    const s1 = parseInt(score1), s2 = parseInt(score2), sh = parseInt(shots);
    if (isNaN(s1) || isNaN(s2) || isNaN(sh) || s1 < 0 || s2 < 0 || sh <= 0) return setError("Lutfen gecerli pozitif sayilar girin!");
    if (player1 === player2) return setError("Ayni oyuncu iki kez secilemez!");
    if (!player1 || !player2) return setError("Lutfen her iki oyuncuyu da secin!");
    setLoading(true);
    setError("");
    const date = new Date().toLocaleDateString("tr-TR"); 
    try {
        // addDoc yerine setDoc kullanılarak Firestore'un otomatik ID üretmesi sağlanır.
        // setDoc(doc(collection(db, "records")), { ... }) kullanılır.
        await setDoc(doc(collection(db, "records")), { 
            date, player1, score1: s1, player2, score2: s2, shots: sh, 
            timestamp: serverTimestamp() // serverTimestamp() kullanıldı
        });
        setScore1("");
        setScore2("");
        setShots("");
        await loadRecords(); 
    } catch (err) {
        console.error("Kayit ekleme hatasi:", err);
        setError("Kayit eklenemedi: " + err.message);
    } finally {
        setLoading(false);
    }
};

// 6. Kayıt Silme (CRUD) (Aynı kalır)
const deleteRecord = async (db, id, loadRecords) => {
    if (!confirm("Bu kaydi silmek istediginize emin misiniz?")) return;
    try {
        await deleteDoc(doc(db, "records", id)); // deleteDoc(doc())
        await loadRecords(); 
    } catch (err) {
        console.error("Silme hatasi:", err);
    }
};

// 7. Oyuncu Ekleme (CRUD) - BÜYÜK/KÜÇÜK HARFE DUYARSIZ KONTROL EKLENDİ
const addPlayer = async (db, newPlayerName, players, setError, setNewPlayerName, setPlayers, allRecords, setPlayerAverages) => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    
    // BÜYÜK/KÜÇÜK HARFE DUYARSIZ KONTROL
    const lowerTrimmed = trimmed.toLowerCase();
    const isPlayerExists = players.some(p => p.toLowerCase() === lowerTrimmed);

    if (isPlayerExists) {
        setError("Bu oyuncu zaten mevcut!");
        return;
    }
    
    const updatedPlayers = [...players, trimmed];
    setNewPlayerName("");
    
    try {
        await setDoc(doc(db, "players", "playersList"), { names: updatedPlayers }); // setDoc(doc())
        setPlayers(updatedPlayers); 
        calculatePlayerAverages(allRecords, updatedPlayers, setPlayerAverages); 
    } catch (err) {
        console.error("Oyuncu kaydetme hatasi:", err);
        setError("Oyuncu kaydedilemedi!");
    }
};

// 8. Oyuncu Silme (CRUD) (Aynı kalır)
const deletePlayer = async (db, name, players, setError, setPlayers, allRecords, setPlayerAverages) => {
    if (!confirm(name + " silinsin mi?")) return;
    
    const updatedPlayers = players.filter(p => p !== name);
    
    try {
        await setDoc(doc(db, "players", "playersList"), { names: updatedPlayers }); // setDoc(doc())
        setPlayers(updatedPlayers); 
        calculatePlayerAverages(allRecords, updatedPlayers, setPlayerAverages); 
    } catch (err) {
        console.error("Oyuncu silme hatasi:", err);
        setError("Oyuncu silinemedi!");
    }
};

// 9. Ortalama Hesaplama (Rapor Sayfası) (toFixed(3) olarak güncellendi)
const calculateAverage = (reportPlayer, allRecords, startDate, endDate, rangeType, setReportCurrentPage, setTotalScore, setTotalShots, setAverage, setFilteredGames) => {
    setReportCurrentPage(1); 
    // ... (Kalan mantık aynı kalır)
    let start, end = new Date();
    if (rangeType === "1m") {
        start = new Date();
        start.setMonth(start.getMonth() - 1);
    } else if (rangeType === "3m") {
        start = new Date();
        start.setMonth(start.getMonth() - 3);
    } else if (rangeType === "6m") {
        start = new Date();
        start.setMonth(start.getMonth() - 6);
    } else if (rangeType === "1y") {
        start = new Date();
        start.setFullYear(start.getFullYear() - 1);
    } else if (rangeType === "custom") {
        start = new Date(startDate);
        end = new Date(endDate);
    }
    
    if (!reportPlayer) {
         setTotalScore(0);
         setTotalShots(0);
         setAverage("0.000");
         setFilteredGames([]);
         return;
    }
    
    const filtered = allRecords.filter(r => {
        const recordDate = parseDateString(r.date);
        return (r.player1 === reportPlayer || r.player2 === reportPlayer) && recordDate >= start && recordDate <= end;
    });
    
    const tScore = filtered.reduce((sum, r) => sum + (r.player1 === reportPlayer ? r.score1 : r.score2), 0);
    const tShots = filtered.reduce((sum, r) => sum + r.shots, 0);
    setTotalScore(tScore);
    setTotalShots(tShots);
    setAverage(tShots > 0 ? (tScore / tShots).toFixed(3) : "0.000");
    setFilteredGames(filtered);
};

// 10. Sıralama Hesaplama (toFixed(3) olarak güncellendi)
const calculateRankings = (allRecords, players, rankingPeriod, setRankings) => {
    // ... (Kalan mantık aynı kalır)
    let start, end = new Date();
    if (rankingPeriod === "3m") {
        start = new Date();
        start.setMonth(start.getMonth() - 3);
    } else if (rankingPeriod === "6m") {
        start = new Date();
        start.setMonth(start.getMonth() - 6);
    } else if (rankingPeriod === "1y") {
        start = new Date();
        start.setFullYear(start.getFullYear() - 1);
    }

    const filtered = allRecords.filter(r => {
        const recordDate = parseDateString(r.date);
        return recordDate >= start && recordDate <= end;
    });
    
    const playerStats = {};
    players.forEach(p => {
        playerStats[p] = { player: p, score: 0, shots: 0 };
    });

    filtered.forEach(r => {
        if (playerStats[r.player1]) {
            playerStats[r.player1].score += r.score1;
            playerStats[r.player1].shots += r.shots;
        }
        if (playerStats[r.player2]) {
            playerStats[r.player2].score += r.score2;
            playerStats[r.player2].shots += r.shots;
        }
    });

    const rankArray = Object.values(playerStats)
        .filter(p => p.shots > 0)
        .map(p => ({
            ...p,
            average: (p.score / p.shots).toFixed(3)
        }))
        .sort((a, b) => parseFloat(b.average) - parseFloat(a.average));

    setRankings(rankArray);
};

// 11. Tarih Düzeltme Aracı (Admin) (Aynı kalır)
const fixAllDates = async (db, isAdmin, setDateFixStatus, setIsFixingDates, loadRecords) => {
    if (!isAdmin || !db) return;
    if (!confirm("TÜM kayıtların tarih formatını düzeltmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) return;
    
    setIsFixingDates(true);
    setDateFixStatus("Kayıtlar yükleniyor...");
    
    try {
        const snapshot = await getDocs(collection(db, "records")); // getDocs(collection())
        const batch = writeBatch(db); // writeBatch(db)
        let fixedCount = 0;
        let skippedCount = 0;
        
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const oldDate = data.date;
            
            if (oldDate && !oldDate.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
                let newDate;
                
                const parsedDate = new Date(oldDate);
                
                if (!isNaN(parsedDate.getTime())) {
                    const day = String(parsedDate.getDate()).padStart(2, '0');
                    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                    const year = parsedDate.getFullYear();
                    newDate = `${day}.${month}.${year}`;
                    
                    batch.update(doc.ref, { date: newDate }); // doc.ref yine çalışır
                    fixedCount++;
                } else {
                    skippedCount++;
                }
            } else if (oldDate && oldDate.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
                skippedCount++;
            }
        });
        
        if (fixedCount > 0) {
            setDateFixStatus(`${fixedCount} kayıt güncelleniyor...`);
            await batch.commit();
            setDateFixStatus(`✅ ${fixedCount} kayıt başarıyla düzeltildi! ${skippedCount} kayıt zaten doğru formattaydı.`);
            await loadRecords();
        } else {
            setDateFixStatus(`ℹ️ Düzeltilecek kayıt bulunamadı. Tüm kayıtlar zaten doğru formatta (${skippedCount} kayıt).`);
        }
        
    } catch (err) {
        console.error("Tarih düzeltme hatası:", err);
        setDateFixStatus("❌ Hata: " + err.message);
    } finally {
        setIsFixingDates(false);
    }
};

// Dışa Aktarma
export { 
    ITEMS_PER_PAGE,
    parseDateString,
    calculatePlayerAverages,
    loadPlayers,
    loadDataAndAverages,
    loadAllUsers,
    loadUserGames,
    addRecord,
    deleteRecord,
    addPlayer,
    deletePlayer,
    calculateAverage,
    calculateRankings,
    fixAllDates
};