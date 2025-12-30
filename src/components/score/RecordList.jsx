// src/components/score/RecordList.jsx

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase/config';
import { toggleLikeRecord } from '../../services/game.service';
import { formatPlayerName } from '../../utils/playerUtils'; // ★ YENİ

function RecordList({ 
    records, 
    onUsernameClick, 
    onDelete, 
    onEditClick, 
    isAdmin, 
    currentUserUsername,
    players // ★ YENİ: Oyuncu listesi prop olarak alındı
}) {
    const { currentUser } = useAuth();
    const [expandedId, setExpandedId] = useState(null);
    const [localRecords, setLocalRecords] = useState([]);

    useEffect(() => {
        if (records) {
            setLocalRecords(records);
        }
    }, [records]);

    if (!localRecords || localRecords.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 mt-4 border border-gray-100 text-center">
                <p className="text-gray-400 text-sm">Henüz kayıtlı maç yok.</p>
            </div>
        );
    }

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleLike = async (e, record) => {
        e.stopPropagation(); 
        if (!currentUser) return alert("Beğenmek için giriş yapmalısınız.");

        const currentLikes = record.likes || [];
        const isLiked = currentLikes.includes(currentUser.uid);
        const userId = currentUser.uid;

        const updatedRecords = localRecords.map(r => {
            if (r.id === record.id) {
                let newLikes;
                if (isLiked) {
                    newLikes = r.likes.filter(uid => uid !== userId);
                } else {
                    newLikes = [...(r.likes || []), userId];
                }
                return { ...r, likes: newLikes };
            }
            return r;
        });

        setLocalRecords(updatedRecords); 

        try {
            await toggleLikeRecord(
                db, record.id, currentUser, currentLikes, 
                record.player1, record.player2
            );
        } catch (error) {
            console.error("Beğeni hatası:", error);
            setLocalRecords(records);
        }
    };

    return (
        <div className="mt-3 space-y-2">
            <h3 className="text-base font-bold text-gray-700 px-1">Son Maçlar</h3>
            
            {localRecords.map((record) => {
                const isExpanded = expandedId === record.id;
                const likes = record.likes || [];
                const isLiked = currentUser && likes.includes(currentUser.uid);
                const likeCount = likes.length;

                // ★ İSİM FORMATLAMA ★
                // Oyuncu isimlerini listeden bulup formatlıyoruz
                const p1Name = formatPlayerName(record.player1, players);
                const p2Name = formatPlayerName(record.player2, players);

                let p1ColorClass = "bg-blue-600";
                let p2ColorClass = "bg-blue-600";

                if (record.score1 > record.score2) {
                    p1ColorClass = "bg-green-600";
                    p2ColorClass = "bg-red-600";
                } else if (record.score2 > record.score1) {
                    p1ColorClass = "bg-red-600";
                    p2ColorClass = "bg-green-600";
                }

                return (
                    <div 
                        key={record.id} 
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                        <div 
                            onClick={() => toggleExpand(record.id)}
                            className="p-2 cursor-pointer flex flex-col gap-2"
                        >
                            <div className="flex items-center justify-between w-full">
                                {/* Sol Oyuncu */}
                                <div 
                                    onClick={(e) => { e.stopPropagation(); onUsernameClick(record.player1); }}
                                    className={`flex-1 text-white py-1 px-2 rounded-l-md text-center text-sm font-bold truncate leading-tight ${p1ColorClass}`}
                                    title={p1Name} // Tooltip olarak tam isim
                                >
                                    {p1Name} {/* Formatlı İsim */}
                                </div>

                                {/* SKOR */}
                                <div className="bg-gray-800 text-white py-1 px-2 min-w-[70px] flex flex-col items-center justify-center z-10 shadow-md h-full">
                                    <div className="text-base font-bold leading-none tracking-widest mb-0.5">
                                        {record.score1}-{record.score2}
                                    </div>
                                    <div className="text-[9px] font-mono text-yellow-400 leading-none">
                                        INN: {record.shots}
                                    </div>
                                </div>

                                {/* Sağ Oyuncu */}
                                <div 
                                    onClick={(e) => { e.stopPropagation(); onUsernameClick(record.player2); }}
                                    className={`flex-1 text-white py-1 px-2 rounded-r-md text-center text-sm font-bold truncate leading-tight ${p2ColorClass}`}
                                    title={p2Name} // Tooltip olarak tam isim
                                >
                                    {p2Name} {/* Formatlı İsim */}
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {record.date}
                                </span>
                                
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={(e) => handleLike(e, record)}
                                        className={`flex items-center gap-1 text-xs font-medium transition-all transform active:scale-90 ${
                                            isLiked ? "text-pink-600 scale-105" : "text-gray-400 hover:text-pink-500"
                                        }`}
                                    >
                                        <Heart className={`w-3 h-3 ${isLiked ? "fill-current" : ""}`} />
                                        <span>{likeCount > 0 ? likeCount : ""}</span>
                                    </button>

                                    <div className="text-gray-300">
                                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="bg-gray-50 p-2 border-t border-gray-100 text-xs animate-fadeIn">
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <div className="space-y-1 text-center border-r border-gray-200 pr-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Ort:</span>
                                            <span className="font-bold text-gray-800">
                                                {(record.shots > 0 ? (record.score1 / record.shots).toFixed(3) : "0.000")}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">EYS:</span>
                                            <span className="font-bold text-gray-800">{record.eys1 || 0}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-center pl-2">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-gray-800">
                                                {(record.shots > 0 ? (record.score2 / record.shots).toFixed(3) : "0.000")}
                                            </span>
                                            <span className="text-gray-500">:Ort</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-bold text-gray-800">{record.eys2 || 0}</span>
                                            <span className="text-gray-500">:EYS</span>
                                        </div>
                                    </div>
                                </div>

                                {(isAdmin || (currentUser && (currentUser.username === record.player1 || currentUser.username === record.player2))) && (
                                    <div className="flex justify-end gap-3 mt-2 pt-2 border-t border-gray-200/50">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onEditClick(record); }}
                                            className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                                        >
                                            <Edit2 className="w-3 h-3" /> Düzenle
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                                            className="flex items-center gap-1 text-[10px] text-red-600 hover:underline"
                                        >
                                            <Trash2 className="w-3 h-3" /> Sil
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default RecordList;