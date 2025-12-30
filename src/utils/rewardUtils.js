// src/utils/rewardUtils.js

// --- İSİM FORMATLAYICI (Değişmedi) ---
const getOfficialName = (rawName, players = []) => {
  if (!rawName) return "Bilinmeyen Oyuncu";
  const cleanRawName = rawName.trim();
  const foundPlayer = players.find(p => 
      (p.username && p.username.toLowerCase() === cleanRawName.toLowerCase()) || 
      (p.fullName && p.fullName.toLowerCase() === cleanRawName.toLowerCase())
  );
  let nameToFormat = foundPlayer && foundPlayer.fullName ? foundPlayer.fullName : cleanRawName;
  const words = nameToFormat.trim().split(/\s+/);
  if (words.length < 2) return nameToFormat.toLocaleUpperCase('tr-TR');
  const surname = words.pop();
  const formattedSurname = surname.toLocaleUpperCase('tr-TR');
  const formattedNames = words.map(w => {
      return w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR');
  }).join(' ');
  return `${formattedNames} ${formattedSurname}`;
};

// --- TARİH AYRIŞTIRICI (Değişmedi) ---
const parseDate = (dateInput) => {
  if (!dateInput) return null;
  try {
    if (dateInput.seconds) return new Date(dateInput.seconds * 1000);
    if (typeof dateInput.toDate === 'function') return dateInput.toDate();
    if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
    if (typeof dateInput === 'string') {
      const s = dateInput.trim();
      if (s.includes('.')) { const p = s.split('.'); return new Date(p[2], p[1]-1, p[0]); }
      if (s.includes('-')) return new Date(s);
      if (s.includes('/')) { const p = s.split('/'); return new Date(p[2], p[1]-1, p[0]); }
    }
    return null;
  } catch (e) { return null; }
};

// --- AYLIK ÖDÜLLERİ HESAPLA (Değişmedi - Ana sayfada canlı takip için bu kalmalı) ---
export const calculateMonthlyRewards = (matches, targetMonth, targetYear, players = []) => {
  const monthlyMatches = matches.filter(match => {
    const d = parseDate(match.date);
    return d && d.getMonth() === targetMonth && d.getFullYear() === targetYear;
  });

  if (monthlyMatches.length === 0) return null;

  const playerStats = {};
  const getNum = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
  const normalizeKey = (name) => name ? name.trim().toLowerCase() : "unknown"; 

  monthlyMatches.forEach(match => {
    const s1 = getNum(match.score1);
    const s2 = getNum(match.score2);
    const inn = getNum(match.shots);
    const hr1 = getNum(match.eys1) || getNum(match.highRun1) || 0;
    const hr2 = getNum(match.eys2) || getNum(match.highRun2) || 0;

    const k1 = normalizeKey(match.player1);
    const k2 = normalizeKey(match.player2);

    const process = (key, rawName, score, oppScore, hr) => {
        if (!rawName) return;
        if (!playerStats[key]) {
            playerStats[key] = { 
                username: key, 
                rawName: rawName, 
                points: 0, innings: 0, wins: 0, bestGameAvg: 0, highRun: 0 
            };
        }
        const p = playerStats[key];
        p.points += score;
        p.innings += inn;
        if (score > oppScore) p.wins += 1;
        const ga = inn > 0 ? score / inn : 0;
        if (ga > p.bestGameAvg) p.bestGameAvg = ga;
        if (hr > p.highRun) p.highRun = hr;
    };

    process(k1, match.player1, s1, s2, hr1);
    process(k2, match.player2, s2, s1, hr2);
  });

  let allPlayers = Object.values(playerStats).map(p => ({
      ...p,
      officialName: getOfficialName(p.rawName, players),
      genAvg: p.innings > 0 ? (p.points / p.innings) : 0
  }));

  const winners = { generalAvg: null, topScorer: null, mostWins: null, bestMatch: null, highRun: null };

  if (allPlayers.length > 0) {
      const avgCandidates = allPlayers.filter(p => p.points >= 100);
      if (avgCandidates.length > 0) {
          const w = avgCandidates.sort((a, b) => (b.genAvg - a.genAvg) || (b.points - a.points))[0];
          winners.generalAvg = { ...w, player: w.officialName, value: w.genAvg.toFixed(3), type: "Genel Ortalama Şampiyonu" };
      }
      const top = [...allPlayers].sort((a, b) => (b.points - a.points) || (b.genAvg - a.genAvg))[0];
      if (top && top.points > 0) winners.topScorer = { ...top, player: top.officialName, value: top.points, type: "En Skorer Oyuncu" };
      
      const win = [...allPlayers].sort((a, b) => (b.wins - a.wins) || (b.genAvg - a.genAvg))[0];
      if (win && win.wins > 0) winners.mostWins = { ...win, player: win.officialName, value: win.wins, type: "En Çok Maç Kazanan" };

      const best = [...allPlayers].sort((a, b) => (b.bestGameAvg - a.bestGameAvg) || (b.genAvg - a.genAvg))[0];
      if (best && best.bestGameAvg > 0) winners.bestMatch = { ...best, player: best.officialName, value: best.bestGameAvg.toFixed(3), type: "En Yüksek Maç Ort." };

      const hr = [...allPlayers].sort((a, b) => (b.highRun - a.highRun) || (b.genAvg - a.genAvg))[0];
      if (hr && hr.highRun > 0) winners.highRun = { ...hr, player: hr.officialName, value: hr.highRun, type: "En Yüksek Seri" };
  }

  return winners;
};

// --- YENİ: BİR OYUNCUNUN GEÇMİŞ (BİTMİŞ AY) ÖDÜLLERİNİ BUL ---
export const calculatePlayerRewardsHistory = (allMatches, targetUsername, players) => {
    if (!allMatches || allMatches.length === 0 || !targetUsername) return [];

    const rewardsHistory = [];
    const processedMonths = new Set();
    const cleanTarget = targetUsername.trim().toLowerCase();

    // ★ 1. ŞİMDİKİ ZAMANI AL
    const now = new Date();
    const currentMonth = now.getMonth();   // 0-11 arası (Örn: Aralık = 11)
    const currentYear = now.getFullYear(); // Örn: 2025

    allMatches.forEach(m => {
        const d = parseDate(m.date);
        if (d) {
            const matchMonth = d.getMonth();
            const matchYear = d.getFullYear();

            // ★ 2. GELECEK VEYA MEVCUT AY KONTROLÜ
            // Eğer maçın yılı şimdiki yıldan büyükse -> GÖSTERME
            if (matchYear > currentYear) return;
            
            // Eğer maçın yılı şimdiki yıla eşitse VE ay şimdiki ayla aynıysa veya büyükse -> GÖSTERME
            // (Yani sadece matchMonth < currentMonth olanları kabul et)
            if (matchYear === currentYear && matchMonth >= currentMonth) return;

            // Buraya geldiysek, bu maç "bitmiş" bir aya aittir.
            const key = `${matchMonth}-${matchYear}`;
            
            if (!processedMonths.has(key)) {
                processedMonths.add(key);
                
                // O ayın ödüllerini hesapla
                const winners = calculateMonthlyRewards(allMatches, matchMonth, matchYear, players);
                
                if (winners) {
                    const monthName = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"][matchMonth];
                    const dateLabel = `${monthName} ${matchYear}`;

                    Object.keys(winners).forEach(rewardKey => {
                        const rewardData = winners[rewardKey];
                        if (rewardData && rewardData.username === cleanTarget) {
                            rewardsHistory.push({
                                id: `${key}-${rewardKey}`,
                                dateLabel: dateLabel,
                                rewardType: rewardData.type,
                                value: rewardData.value,
                                category: rewardKey 
                            });
                        }
                    });
                }
            }
        }
    });

    return rewardsHistory.reverse(); 
};