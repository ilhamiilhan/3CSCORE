// src/components/report/ReportGameList.jsx

import React from 'react';
import { formatPlayerName } from '../../utils/playerUtils';
import { Calendar } from 'lucide-react';

function ReportGameList({ 
    games, 
    reportPlayer, 
    onUsernameClick,
    players 
}) {
    if (!reportPlayer) {
        return (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-100">
                <p className="text-gray-400 text-sm">Raporu görüntülemek için yukarıdan bir oyuncu seçiniz.</p>
            </div>
        );
    }

    if (!games || games.length === 0) {
        return (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-100">
                <p className="text-gray-400 text-sm">Bu kriterlere uygun maç bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {games.map((game) => {
                // Renk Mantığı
                let p1ColorClass = "bg-blue-600";
                let p2ColorClass = "bg-blue-600";

                if (game.score1 > game.score2) {
                    p1ColorClass = "bg-green-600";
                    p2ColorClass = "bg-red-600";
                } else if (game.score2 > game.score1) {
                    p1ColorClass = "bg-red-600";
                    p2ColorClass = "bg-green-600";
                }

                // İsimleri Formatla (İlkay KAYA formatı)
                const p1Name = formatPlayerName(game.player1, players);
                const p2Name = formatPlayerName(game.player2, players);

                return (
                    <div 
                        key={game.id} 
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                        {/* --- ANA GÖRÜNÜM (RecordList ile Birebir Aynı İnce Yapı) --- */}
                        <div className="p-2 flex flex-col gap-2">
                            <div className="flex items-center justify-between w-full">
                                
                                {/* SOL OYUNCU */}
                                <div 
                                    onClick={() => onUsernameClick(game.player1)}
                                    className={`flex-1 text-white py-1 px-2 rounded-l-md text-center text-sm font-bold truncate leading-tight cursor-pointer hover:opacity-90 transition-opacity ${p1ColorClass}`}
                                    title={p1Name}
                                >
                                    {p1Name}
                                </div>

                                {/* ORTA: SKOR ve INN (Sıkı ve İnce) */}
                                <div className="bg-gray-800 text-white py-1 px-2 min-w-[70px] flex flex-col items-center justify-center z-10 shadow-md h-full mx-[-1px]">
                                    <div className="text-base font-bold leading-none tracking-widest mb-0.5">
                                        {game.score1}-{game.score2}
                                    </div>
                                    <div className="text-[9px] font-mono text-yellow-400 leading-none">
                                        INN: {game.shots}
                                    </div>
                                </div>

                                {/* SAĞ OYUNCU */}
                                <div 
                                    onClick={() => onUsernameClick(game.player2)}
                                    className={`flex-1 text-white py-1 px-2 rounded-r-md text-center text-sm font-bold truncate leading-tight cursor-pointer hover:opacity-90 transition-opacity ${p2ColorClass}`}
                                    title={p2Name}
                                >
                                    {p2Name}
                                </div>
                            </div>

                            {/* ALT KISIM: TARİH VE ORTALAMA */}
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                    {game.date}
                                </span>
                                
                                <div className="text-[10px] font-bold text-gray-500">
                                    Genel Ort: {((game.score1 + game.score2) / (game.shots * 2)).toFixed(3)}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default ReportGameList;