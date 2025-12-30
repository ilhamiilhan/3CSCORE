// src/components/report/ReportHeader.jsx

import React from 'react';
import { formatPlayerName } from '../../utils/playerUtils'; 
import { Activity, Target, Clock, Zap } from 'lucide-react'; // İkonlar eklendi

function ReportHeader({ 
    totalScore, 
    totalShots, 
    average, 
    reportPlayer, 
    reportTopEYS1, 
    reportTopEYS2,
    players 
}) {
    if (!reportPlayer) return null;

    // ★ İSİM FORMATLAMA (Başlıktaki sorunu çözer)
    const displayName = formatPlayerName(reportPlayer, players);
    const maxEYS = Math.max(Number(reportTopEYS1 || 0), Number(reportTopEYS2 || 0));

    return (
        <div className="px-1 mb-6">
            {/* Başlık Alanı */}
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {displayName}
                </span> 
                <span className="text-gray-400 text-base font-medium">Performans Özeti</span>
            </h2>
            
            {/* İstatistik Kartları - PASTEL TONLAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* ORTALAMA - Pastel Mavi */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
                    <div className="flex items-center gap-1 text-blue-600 mb-1">
                        <Activity size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Ortalama</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-blue-700">{average}</div>
                </div>

                {/* SKOR - Pastel Yeşil */}
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
                    <div className="flex items-center gap-1 text-emerald-600 mb-1">
                        <Target size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Toplam Skor</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-700">{totalScore}</div>
                </div>

                {/* INN - Pastel Sarı/Turuncu */}
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
                    <div className="flex items-center gap-1 text-amber-600 mb-1">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Istaka</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-700">{totalShots}</div>
                </div>

                {/* EYS - Pastel Kırmızı */}
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
                    <div className="flex items-center gap-1 text-rose-600 mb-1">
                        <Zap size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">En Yüksek Seri</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-rose-700">{maxEYS}</div>
                </div>
            </div>
        </div>
    );
}

export default ReportHeader;