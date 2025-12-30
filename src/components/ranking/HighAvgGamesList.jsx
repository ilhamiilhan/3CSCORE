// src/components/ranking/HighAvgGamesList.jsx

import React from 'react';
import { formatPlayerName } from '../../utils/playerUtils';

/**
 * En Yüksek Ortalamalı Maçlar
 * TASARIM: Kompakt & Yoğun
 */
function HighAvgGamesList({ rankings, players, onUsernameClick }) {
    if (rankings.length === 0) {
        return <p className="text-gray-500 text-center py-8 text-sm">Veri yok</p>;
    }

    const handleClick = onUsernameClick || (() => {});

    const goldIcon = "🥇";
    const silverIcon = "🥈";
    const bronzeIcon = "🥉";

    return (
        <div className="space-y-2">
            {rankings.map((r, idx) => {
                let rankDisplay = <span className="text-gray-400 font-bold text-sm">#{idx + 1}</span>;
                
                if (idx === 0) rankDisplay = <span className="text-lg">{goldIcon}</span>;
                else if (idx === 1) rankDisplay = <span className="text-lg">{silverIcon}</span>;
                else if (idx === 2) rankDisplay = <span className="text-lg">{bronzeIcon}</span>;

                // Hesaplamalar
                const avg1 = r.shots > 0 ? (r.score1 / r.shots) : 0;
                const avg2 = r.shots > 0 ? (r.score2 / r.shots) : 0;
                let maxAvgPlayer;
                if (Math.abs(r.rawMaxAverage - avg1) < 0.000001) maxAvgPlayer = r.player1;
                else if (Math.abs(r.rawMaxAverage - avg2) < 0.000001) maxAvgPlayer = r.player2;
                else maxAvgPlayer = (avg1 >= avg2) ? r.player1 : r.player2;

                // İsimler
                const p1Name = formatPlayerName(r.player1, players);
                const p2Name = formatPlayerName(r.player2, players);
                const maxAvgName = formatPlayerName(maxAvgPlayer, players);

                return (
                    <div 
                        key={r.gameId} 
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                    >
                        {/* --- ÜST KISIM --- */}
                        <div className="flex items-center justify-between px-3 py-1.5 bg-white">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-6 text-center flex-shrink-0">{rankDisplay}</div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-gray-800 text-sm truncate">
                                        {maxAvgName}
                                    </span>
                                    <span className="text-[10px] text-gray-500 truncate">
                                        {p1Name} vs {p2Name}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">MAX ORT</span>
                                <span className="bg-blue-600 text-white text-sm font-bold px-2 py-0.5 rounded-md shadow-sm min-w-[50px] text-center">
                                    {r.maxAverage}
                                </span>
                            </div>
                        </div>

                        {/* --- ALT KISIM (ÖZET DETAY) --- */}
                        <div className="bg-gray-50 border-t border-gray-200 grid grid-cols-3 divide-x divide-gray-200 py-1">
                            <div className="flex flex-col items-center justify-center px-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Skorlar</span>
                                <span className="text-xs font-bold text-gray-700 leading-tight">{r.score1} - {r.score2}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center px-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Inn</span>
                                <span className="text-xs font-bold text-yellow-600 leading-tight">{r.shots}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center px-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Tarih</span>
                                <span className="text-[10px] font-medium text-gray-500 leading-tight truncate px-1">{r.date}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default HighAvgGamesList;