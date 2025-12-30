// src/components/ranking/WinRankingsList.jsx

import React from 'react';
import { formatPlayerName } from '../../utils/playerUtils';

/**
 * En Çok Kazananlar
 * TASARIM: Kompakt & Yoğun
 */
function WinRankingsList({ rankings, players, onUsernameClick }) {
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
                
                const formattedName = formatPlayerName(r.player, players);

                return (
                    <div 
                        key={r.player} 
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                    >
                        {/* --- ÜST KISIM --- */}
                        <div className="flex items-center justify-between px-3 py-1.5 bg-white">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-6 text-center flex-shrink-0">{rankDisplay}</div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleClick(r.player); }}
                                    className="text-gray-800 hover:text-blue-600 font-bold text-sm truncate text-left"
                                >
                                    {formattedName}
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">GALİBİYET</span>
                                <span className="bg-indigo-600 text-white text-sm font-bold px-2 py-0.5 rounded-md shadow-sm min-w-[50px] text-center">
                                    {r.totalWins}
                                </span>
                            </div>
                        </div>
                        
                        {/* --- ALT KISIM --- */}
                        <div className="bg-gray-50 border-t border-gray-200 grid grid-cols-4 divide-x divide-gray-200 py-1">
                            <div className="flex flex-col items-center justify-center px-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Ort.</span>
                                <span className="text-xs font-bold text-blue-600 leading-tight">{r.average || '-'}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center px-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Inn</span>
                                <span className="text-xs font-bold text-yellow-600 leading-tight">{r.totalShots || 0}</span>
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

export default WinRankingsList;