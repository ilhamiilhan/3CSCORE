// src/components/ranking/RankingList.jsx

import React from 'react';
import { formatPlayerName } from '../../utils/playerUtils';

/**
 * Genel Ortalama Sıralaması
 * GÜNCELLEME: Sadece gölge ve kenarlık güçlendirildi. Fontlar ve boyutlar AYNI.
 */
function RankingList({ rankings, onUsernameClick, players }) {
    if (rankings.length === 0) {
        return <p className="text-gray-500 text-center py-8 text-sm">Veri yok</p>;
    }

    const handleClick = onUsernameClick || (() => {});

    const goldIcon = "🥇";
    const silverIcon = "🥈";
    const bronzeIcon = "🥉";

    return (
        <div className="space-y-3"> {/* Kartlar arası boşluk hafif arttı (2->3) ki gölge belli olsun */}
            {rankings.map((r, idx) => {
                
                let rankDisplay = <span className="text-gray-400 font-bold text-sm">#{idx + 1}</span>;
                
                if (idx === 0) rankDisplay = <span className="text-lg">{goldIcon}</span>;
                else if (idx === 1) rankDisplay = <span className="text-lg">{silverIcon}</span>;
                else if (idx === 2) rankDisplay = <span className="text-lg">{bronzeIcon}</span>;
                
                const formattedName = formatPlayerName(r.player, players);
                
                return (
                    <div 
                        key={r.player} 
                        // DEĞİŞİKLİK BURADA: border-gray-300, shadow-md, hover:shadow-lg, hover:border-blue-400
                        className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden hover:shadow-lg hover:border-blue-400 transition-all duration-200"
                    >
                        {/* --- ÜST KISIM (BEYAZ) --- */}
                        <div className="flex items-center justify-between px-3 py-1.5 bg-white">
                            
                            {/* Sol: Sıra ve İsim */}
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-6 text-center flex-shrink-0">{rankDisplay}</div>
                                <button
                                    onClick={() => handleClick(r.player)}
                                    className="text-gray-800 hover:text-blue-600 font-bold text-sm truncate text-left"
                                    title={formattedName}
                                >
                                    {formattedName}
                                </button>
                            </div>

                            {/* Sağ: Ortalama Rozeti */}
                            <div className="flex items-center gap-2 ml-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">ORT</span>
                                <span className="bg-blue-600 text-white text-sm font-bold px-2 py-0.5 rounded-md shadow-sm min-w-[50px] text-center border border-blue-700">
                                    {r.average}
                                </span>
                            </div>
                        </div>
                        
                        {/* --- ALT KISIM (GRİ) --- */}
                        <div className="bg-gray-50 border-t border-gray-300 grid grid-cols-4 divide-x divide-gray-300 py-1">
                            
                            <div className="flex flex-col items-center justify-center px-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Skor</span>
                                <span className="text-xs font-bold text-gray-800 leading-tight">{r.totalScore}</span>
                            </div>

                            <div className="flex flex-col items-center justify-center px-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Inn</span>
                                <span className="text-xs font-bold text-yellow-600 leading-tight">{r.totalShots}</span>
                            </div>

                            <div className="flex flex-col items-center justify-center px-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase">EYS 1</span>
                                <span className="text-xs font-bold text-red-600 leading-tight">{r.topEYS1 || 0}</span>
                            </div>

                            <div className="flex flex-col items-center justify-center px-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase">EYS 2</span>
                                <span className="text-xs font-bold text-red-600 leading-tight">{r.topEYS2 || 0}</span>
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default RankingList;