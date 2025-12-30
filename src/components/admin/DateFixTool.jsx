// src/components/admin/DateFixTool.jsx - TAM VE SON HAL

import React from 'react';

/**
 * Eski Tarih Formatlarını Düzeltme Aracı Bileşeni (Admin Paneli).
 */
function DateFixTool({ 
    dateFixStatus, 
    isFixingDates, 
    wrapperFixAllDates 
}) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-700 mb-2">🚨 ADMIN: Araçlar ve Bakım</h3>
            <div className="p-4 border border-orange-300 rounded-lg bg-orange-50 space-y-2">
                <h4 className="font-bold text-orange-700 mb-2">🔧 Tarih Formatı Düzeltme Aracı</h4>
                <p className="text-sm text-gray-600 mb-2">
                    Eski kayıtlardaki GG.AA.YYYY string formatındaki tarihleri,
                    raporlamanın düzgün çalışması için Firestore Timestamp formatına dönüştürür.
                </p>
                
                {/* Düzeltme Durumunu Göster */}
                {dateFixStatus && (
                    <div className={`p-2 rounded text-sm mb-2 font-mono ${dateFixStatus.includes('Hata') || dateFixStatus.includes('Yetkisiz') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {dateFixStatus}
                    </div>
                )}
                
                {/* Düzeltme Butonu */}
                <button
                    onClick={wrapperFixAllDates}
                    disabled={isFixingDates}
                    className="w-full py-2 bg-orange-600 text-white rounded font-bold disabled:opacity-50 hover:bg-orange-700 transition"
                >
                    {isFixingDates ? "Düzeltiliyor... Lütfen Bekleyin" : "Tarihleri Düzeltmeyi Başlat"}
                </button>
            </div>
        </div>
    );
}

export default DateFixTool;