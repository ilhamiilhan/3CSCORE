// src/components/score/RecordItem.jsx - ★ DÜZENLEME VE SİLME BUTONLARI EKLENDİ ★

import React from 'react';

// ★ YENİ: İkonları import ediyoruz
import { Trash2, Edit3 } from 'lucide-react';

/**
 * Tek Bir Maç Kaydı Satırı Bileşeni - Futbol Maç Skoru Stili.
 * YENİ PROPS'LAR:
 * - onEditClick: Düzenle butonu için handler
 * - isAdmin: Kullanıcı admin mi?
 * - currentUserUsername: Giriş yapan kullanıcının adı
 */
function RecordItem({ 
    record, 
    onDelete, 
    onUsernameClick, 
    onEditClick, 
    isAdmin, 
    currentUserUsername 
}) {
    
    // Tıklama fonksiyonu boşsa boş bir fonksiyon kullan
    const handleClick = onUsernameClick || (() => {});
    
    const p1Win = record.score1 >= record.score2;
    
    const gameAvg1 = record.shots > 0 ? (record.score1 / record.shots).toFixed(3) : "0.000";
    const gameAvg2 = record.shots > 0 ? (record.score2 / record.shots).toFixed(3) : "0.000";

    const eys1 = (record.eys1 && Number(record.eys1) > 0) ? Number(record.eys1).toFixed(0) : null;
    const eys2 = (record.eys2 && Number(record.eys2) > 0) ? Number(record.eys2).toFixed(0) : null;
    
    const avgTextColor = "text-gray-600";

    // ★★★ YENİ İZİN MANTIĞI ★★★
    // Giriş yapan kullanıcı bu maçta oynamış mı?
    const isPlayerInMatch = record.player1 === currentUserUsername || record.player2 === currentUserUsername;
    
    // Düzenleme İzni: Admin VEYA bu maçtaki oyunculardan biri
    const canEdit = onEditClick && (isAdmin || isPlayerInMatch);
    
    // Silme İzni: Sadece Admin
    const canDelete = onDelete && isAdmin;
    // ★★★ İZİN MANTIĞI SONU ★★★

    // STATİK İKİNCİ SATIR (Ortalama, EYS ve Tarihi içerir)
    const STAT_Row = (
        <div className="flex items-center gap-1 sm:gap-2 mt-1 pt-1 border-t border-gray-200 text-[10px] font-semibold">
            
            {/* 1. OYUNCU 1 STAT BLOK */}
            <div className="flex-1 px-1 py-1 rounded min-w-0 text-right">
                <span className={`${avgTextColor} whitespace-nowrap`}>Ort: {gameAvg1}</span>
                {eys1 && (
                    <span className="text-red-600 whitespace-nowrap ml-2">EYS: {eys1}</span>
                )}
            </div>
            
            {/* 2. SKOR ORTA ALAN */}
            <div className="flex items-center justify-center px-2 py-1 rounded min-w-0">
                <span className="text-gray-400 text-[9px]">vs</span>
            </div>
            
            {/* 3. OYUNCU 2 STAT BLOK */}
            <div className="flex-1 px-1 py-1 rounded min-w-0 text-left">
                <span className={`${avgTextColor} whitespace-nowrap`}>Ort: {gameAvg2}</span>
                {eys2 && (
                    <span className="text-red-600 whitespace-nowrap ml-2">EYS: {eys2}</span>
                )}
            </div>
            
            {/* 4. TARİH VE İŞLEM BUTONLARI BLOK (★ GÜNCELLENDİ ★) */}
            <div className="px-1 py-1 rounded flex items-center justify-end flex-shrink-0 gap-3 text-right whitespace-nowrap">
                <span className="text-gray-500">{record.date}</span>
                
                {/* ★ YENİ: DÜZENLE BUTONU (İzinli) */}
                {canEdit && (
                    <button 
                        onClick={() => onEditClick(record)} 
                        className="text-blue-600 hover:text-blue-900"
                        title="Bu skoru düzenle"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                )}

                {/* ★ YENİ: SİL BUTONU (İzinli) */}
                {canDelete && (
                    <button 
                        onClick={() => onDelete(record.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Bu skoru sil"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
            
            {/* ANA VERİ SATIRI - FUTBOL STİLİ */}
            <div className="flex items-center justify-between gap-1 sm:gap-2">
                
                {/* Oyuncu 1 İsim */}
                <div 
                    className={`flex-1 px-1 py-1 font-semibold text-white rounded text-xs truncate min-w-0 text-right ${p1Win ? "bg-green-500" : "bg-red-500"}`}
                    title={record.player1}
                >
                    <button onClick={() => handleClick(record.player1)} className="hover:underline font-semibold">
                        {record.player1}
                    </button>
                </div>
                
                {/* SKOR ORTADA */}
                <div className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-500 rounded font-bold text-white text-xs whitespace-nowrap flex-shrink-0">
                    <span>{record.score1}</span>
                    <span className="text-blue-200">-</span>
                    <span>{record.score2}</span>
                </div>
                
                {/* Oyuncu 2 İsim */}
                <div 
                    className={`flex-1 px-1 py-1 font-semibold text-white rounded text-xs truncate min-w-0 text-left ${!p1Win ? "bg-green-500" : "bg-red-500"}`}
                    title={record.player2}
                >
                    <button onClick={() => handleClick(record.player2)} className="hover:underline font-semibold">
                        {record.player2}
                    </button>
                </div>
                
                {/* Istaka Sayısı */}
                <div className="px-1 py-1 bg-yellow-200 rounded font-bold text-gray-800 text-xs whitespace-nowrap flex-shrink-0">
                    INN: {record.shots}
                </div>
            </div>
            
            {/* STATİK İKİNCİ SATIR */}
            {STAT_Row}
        </div>
    );
}

export default RecordItem;