// src/components/rewards/Rewards.jsx

import React, { useState, useEffect } from 'react';
import { calculateMonthlyRewards } from '../../utils/rewardUtils';
import { Trophy, Medal, Star, Target, Crown, Calendar, ChevronLeft, ChevronRight, Hash } from 'lucide-react';

// Küçük kartlar için bileşen
const RewardCard = ({ title, data, unit, icon: Icon, delay, onClick }) => (
  <div 
    // DÜZELTME 1: data.player yerine data.username gönderiyoruz
    onClick={() => data && onClick(data.username)}
    className={`bg-[#0A0E1A] border border-amber-500/20 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group transition-all duration-300
    ${data ? 'cursor-pointer hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:-translate-y-1' : 'opacity-80'}`} 
    style={{ animationDelay: delay }}
  >
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={64} />
    </div>

    <div className="bg-[#1a1f2e] p-3 rounded-full border border-amber-500/20 mb-3 group-hover:scale-110 transition-transform duration-300">
      <Icon size={24} className="text-amber-500" />
    </div>
    
    <h3 className="text-amber-500/60 text-[10px] uppercase tracking-widest font-bold mb-1">{title}</h3>
    
    {data ? (
      <>
        {/* Ekranda yine Ad Soyad (player) yazacak ama tıklayınca username gidecek */}
        <div className="text-lg font-bold text-gray-100 mb-1 truncate w-full px-2" title={data.player}>
          {data.player}
        </div>
        <div className="text-sm font-mono text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded border border-amber-500/20">
          <span className="font-bold">{data.value}</span> <span className="opacity-70 text-[10px] ml-1">{unit}</span>
        </div>
      </>
    ) : (
      <div className="text-gray-600 text-xs italic mt-1">Veri yok</div>
    )}
  </div>
);

const Rewards = ({ matches, onProfileClick, players }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [winners, setWinners] = useState(null);

  useEffect(() => {
    if (matches && matches.length > 0) {
      const result = calculateMonthlyRewards(matches, selectedDate.getMonth(), selectedDate.getFullYear(), players);
      setWinners(result);
    } else {
        setWinners(null);
    }
  }, [matches, selectedDate, players]); 

  const changeMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 space-y-6">
      
      {/* --- ÜST BAŞLIK ALANI --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-[#05070E] p-4 rounded-xl border border-amber-500/20 shadow-md">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-transparent rounded-lg border border-amber-500/20">
            <Trophy className="text-amber-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100 uppercase tracking-wide">
              Ayın Ödülleri
            </h1>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest">Performans Liderleri</p>
          </div>
        </div>
        
        {/* Tarih Seçici */}
        <div className="flex items-center gap-2 bg-[#0A0E1A] p-1 rounded-lg border border-gray-800">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 px-4 min-w-[140px] justify-center border-l border-r border-gray-800/50 h-8">
            <Calendar size={14} className="text-amber-600" />
            <span className="text-gray-200 font-bold text-sm">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </span>
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* --- GRID YAPISI --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* --- BÜYÜK KART: GENEL ORTALAMA ŞAMPİYONU --- */}
        <div className="md:col-span-2 lg:col-span-3">
          <div 
            // DÜZELTME 2: winners.generalAvg.player yerine winners.generalAvg.username gönderiyoruz
            onClick={() => winners?.generalAvg && onProfileClick(winners.generalAvg.username)}
            className={`relative bg-gradient-to-b from-[#0e1221] to-[#05070E] border border-amber-500/40 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden group transition-all
            ${winners?.generalAvg ? 'cursor-pointer hover:border-amber-500 hover:shadow-[0_0_50px_rgba(245,158,11,0.15)]' : ''}`}
          >
            {/* Arka Plan Süslemeleri */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 to-transparent pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
              
              {/* Üst Bilgi: Koşul ve Başlık */}
              <div className="flex flex-col items-center mb-6">
                <div className="text-[10px] text-amber-500/50 font-mono border border-amber-500/10 px-3 py-1 rounded-full mb-3 bg-[#0A0E1A]">
                  MİN. 100 SAYI KOŞULU
                </div>
                <div className="flex items-center gap-3">
                    <Crown size={32} className="text-amber-500 animate-pulse" />
                    <h2 className="text-amber-100 text-lg sm:text-xl font-black uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-600">
                        Ayın Genel Ortalama Şampiyonu
                    </h2>
                    <Crown size={32} className="text-amber-500 animate-pulse" />
                </div>
              </div>
              
              {winners?.generalAvg ? (
                <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-500">
                  
                  {/* OYUNCU ADI */}
                  <div className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-2xl group-hover:scale-105 transition-transform duration-300">
                    {winners.generalAvg.player}
                  </div>

                  {/* ORTALAMA DEĞERİ (BÜYÜK) */}
                  <div className="mb-6">
                      <div className="inline-flex items-end justify-center gap-2 bg-[#0A0E1A] px-8 py-3 rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                        <span className="text-5xl font-mono font-bold text-amber-500 leading-none">
                            {winners.generalAvg.value}
                        </span>
                        <span className="text-sm font-bold text-amber-500/60 pb-1">ORT</span>
                      </div>
                  </div>

                  {/* SAYI VE ISTAKA BİLGİLERİ */}
                  <div className="flex items-center justify-center gap-4 text-sm sm:text-base">
                    <div className="flex items-center gap-2 bg-amber-900/10 px-4 py-2 rounded-lg border border-amber-500/10 text-amber-200/80">
                        <Target size={16} className="text-amber-500" />
                        <span className="font-bold text-amber-100">{winners.generalAvg.points}</span> 
                        <span className="text-xs opacity-60 uppercase">Sayı</span>
                    </div>
                    <div className="w-px h-8 bg-amber-500/20"></div> {/* Ayırıcı Çizgi */}
                    <div className="flex items-center gap-2 bg-amber-900/10 px-4 py-2 rounded-lg border border-amber-500/10 text-amber-200/80">
                        <Hash size={16} className="text-amber-500" />
                        <span className="font-bold text-amber-100">{winners.generalAvg.innings}</span> 
                        <span className="text-xs opacity-60 uppercase">Istaka</span>
                    </div>
                  </div>

                </div>
              ) : (
                  <div className="flex flex-col items-center py-8 opacity-50">
                    <div className="text-gray-400 text-lg">Bu ay henüz şampiyon belirlenemedi.</div>
                    <div className="text-gray-600 text-sm mt-2">100 sayı barajını geçen oyuncu bulunmuyor.</div>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* --- DİĞER KARTLAR (Zaten RewardCard içindeki düzeltmeyi kullanacaklar) --- */}
        <RewardCard title="En Skorer Oyuncu" icon={Target} data={winners?.topScorer} unit="Sayı" delay="100ms" onClick={onProfileClick} />
        <RewardCard title="En Çok Maç Kazanan" icon={Medal} data={winners?.mostWins} unit="Galibiyet" delay="200ms" onClick={onProfileClick} />
        <RewardCard title="En Yüksek Maç Ort." icon={Star} data={winners?.bestMatch} unit="Ort" delay="300ms" onClick={onProfileClick} />
        <div className="md:col-span-2 lg:col-span-3 xl:col-span-1">
             <RewardCard title="En Yüksek Seri" icon={Trophy} data={winners?.highRun} unit="Sayı" delay="400ms" onClick={onProfileClick} />
        </div>

      </div>
    </div>
  );
};

export default Rewards;