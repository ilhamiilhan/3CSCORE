// src/components/report/ReportFilters.jsx

import React from 'react';
import { formatPlayerName } from '../../utils/playerUtils'; 

function ReportFilters({ 
    players, 
    setReportPlayer, 
    reportPlayer, 
    rangeType, 
    setRangeType, 
    startDate, 
    setStartDate, 
    endDate, 
    setEndDate 
}) {
    const safePlayers = players || [];

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* OYUNCU SEÇİMİ */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Oyuncu</label>
                    <select 
                        value={reportPlayer} 
                        onChange={(e) => setReportPlayer(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Seçiniz...</option>
                        {safePlayers.map((p, index) => {
                            const val = typeof p === 'object' ? p.username : p;
                            const label = formatPlayerName(p, safePlayers);
                            return <option key={val || index} value={val}>{label}</option>;
                        })}
                    </select>
                </div>

                {/* ZAMAN ARALIĞI */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Dönem</label>
                    <select 
                        value={rangeType} 
                        onChange={(e) => setRangeType(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="1w">Son 1 Hafta</option>
                        <option value="1m">Son 1 Ay</option>
                        <option value="3m">Son 3 Ay</option>
                        <option value="6m">Son 6 Ay</option>
                        <option value="1y">Son 1 Yıl</option>
                        <option value="all">Tüm Zamanlar</option>
                        <option value="custom">Özel Tarih</option>
                    </select>
                </div>
            </div>

            {/* ÖZEL TARİH */}
            {rangeType === 'custom' && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-100">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Başlangıç</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border rounded text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Bitiş</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 border rounded text-sm" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportFilters;