// src/components/ranking/HighSeriesRecordsList.jsx

import React from 'react';
import { formatPlayerName } from '../../utils/playerUtils';

/**
 * En Yüksek Seri
 * TASARIM: Kompakt & Yoğun
 */
function HighSeriesRecordsList({ rankings, players, onUsernameClick }) {
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
                
                const gameIdentifier = r.gameId || idx; 
                const uniqueId = `${r.player}-${r.series}-${gameIdentifier}`;
                const formattedName = formatPlayerName(r.player, players);

                return (
                    <div 
                        key={uniqueId} 
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                    >
                        {/* --- ÜST KISIM --- */}
                        <div className="flex items-center justify-between px-3 py-1.5 bg-white">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-6 text-center flex-shrink-0">{rankDisplay}</div>
                                <button
                                    onClick={() => handleClick(r.player)}
                                    className="text-gray-800 hover:text-blue-600 font-bold text-sm truncate text-left"
                                >
                                    {formattedName}
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">SERİ</span>
                                <span className="bg-red-600 text-white text-sm font-bold px-2 py-0.5 rounded-md shadow-sm min-w-[50px] text-center">
                                    {r.series}
                                </span>
                            </div>
                        </div>

                        {/* --- ALT KISIM (TARİH) --- */}
                        <div className="bg-gray-50 border-t border-gray-200 px-3 py-1 flex justify-between items-center">
                            <span className="text-[9px] font-bold text-gray-400 uppercase">Maç Tarihi</span>
                            <span className="text-[10px] font-medium text-gray-500">{r.date ? r.date : '-'}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default HighSeriesRecordsList;