// src/components/profile/PlayerCard.jsx

import React, { useState, useMemo } from 'react';
import ProfileGames from './ProfileGames';
// Camera ve Loader2 ikonlarını ekledik
import { User, Activity, Calendar, Trophy, Medal, Star, Crown, Camera, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { calculatePlayerRewardsHistory } from '../../utils/rewardUtils';

function PlayerCard({
    profileData,
    stats,
    games,
    allMatchesContext,
    players,
    onUsernameClick,
    isOwnProfile,
    onPhotoUpload,
    isSuperAdmin, // YENİ: Super admin mi?
    onGenericAction // YENİ: Rol değiştirme fonksiyonu
}) {
    const [imageError, setImageError] = useState(false);
    const [chartFilter, setChartFilter] = useState('last10');
    const [isUploading, setIsUploading] = useState(false); // Yükleme durumu

    // --- ÖDÜLLERI HESAPLA ---
    const myRewards = useMemo(() => {
        if (!allMatchesContext || !profileData.username) return [];
        return calculatePlayerRewardsHistory(allMatchesContext, profileData.username, players);
    }, [allMatchesContext, profileData.username, players]);

    // Kategori Renkleri
    const getCategoryStyle = (avg) => {
        const average = parseFloat(avg) || 0;
        if (average >= 1.200) return { label: "💎 ELİT", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" };
        if (average >= 0.850) return { label: "🅰 KLASMAN", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" };
        if (average >= 0.600) return { label: "🅱 KLASMAN", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" };
        return { label: "C KLASMAN", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" };
    };

    const cat = getCategoryStyle(stats?.generalAvg);

    // Son 5 Maç Form Durumu
    const last5Games = games.slice(0, 5).map(g => {
        const isP1 = g.player1 === profileData.username;
        const myScore = isP1 ? parseInt(g.score1) : parseInt(g.score2);
        const oppScore = isP1 ? parseInt(g.score2) : parseInt(g.score1);
        return myScore > oppScore ? 'bg-green-500' : (myScore < oppScore ? 'bg-red-500' : 'bg-gray-400');
    });

    // YENİ FONKSİYON: Dosya seçildiğinde çalışır
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basit validasyon (opsiyonel: max 5MB, sadece resim)
        if (!file.type.startsWith('image/')) {
            alert("Lütfen geçerli bir resim dosyası seçin.");
            return;
        }

        if (onPhotoUpload) {
            setIsUploading(true);
            try {
                await onPhotoUpload(file);
            } catch (error) {
                console.error("Yükleme hatası:", error);
                alert("Fotoğraf yüklenirken bir hata oluştu.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    // Grafik Verileri (Değişmedi)
    const chartData = useMemo(() => {
        const parseDate = (dateStr) => {
            if (!dateStr) return new Date(0);
            const cleanDateStr = dateStr.trim();
            try {
                if (cleanDateStr.includes('.')) {
                    const parts = cleanDateStr.split('.');
                    if (parts.length === 3) return new Date(parts[2], parseInt(parts[1]) - 1, parts[0]);
                }
                if (cleanDateStr.includes('-')) return new Date(cleanDateStr);
                return new Date(cleanDateStr);
            } catch (e) { return new Date(0); }
        };

        const now = new Date();
        now.setHours(23, 59, 59, 999);

        let processedGames = [];

        if (chartFilter === 'last10') {
            processedGames = games.slice(0, 10);
        } else {
            let cutoffDate = new Date(now);
            if (chartFilter === '1m') cutoffDate.setMonth(now.getMonth() - 1);
            else if (chartFilter === '3m') cutoffDate.setMonth(now.getMonth() - 3);
            else if (chartFilter === '6m') cutoffDate.setMonth(now.getMonth() - 6);
            else if (chartFilter === '1y') cutoffDate.setFullYear(now.getFullYear() - 1);
            cutoffDate.setHours(0, 0, 0, 0);

            processedGames = games.filter(g => {
                const gDate = parseDate(g.date);
                return !isNaN(gDate.getTime()) && gDate >= cutoffDate;
            });
        }

        return processedGames.slice().reverse().map((g, index) => {
            const isP1 = g.player1 === profileData.username;
            const myScore = isP1 ? parseFloat(g.score1) : parseFloat(g.score2);
            const myShots = parseInt(g.shots);
            return {
                name: index + 1,
                avg: myShots > 0 ? parseFloat((myScore / myShots).toFixed(3)) : 0,
                opponent: isP1 ? g.player2 : g.player1,
                date: g.date,
                score: `${isP1 ? g.score1 : g.score2} - ${isP1 ? g.score2 : g.score1}`
            };
        });
    }, [games, profileData.username, chartFilter]);

    // ... (Tooltip ve FilterBtn kısımları aynı kaldı)
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg border border-slate-700">
                    <p className="font-bold text-gray-200 mb-0.5">{payload[0].payload.date}</p>
                    <p className="mb-1 text-gray-400">vs {payload[0].payload.opponent}</p>
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-600">
                        <span className="text-gray-400">Ort:</span>
                        <span className="text-blue-400 font-bold text-xs">{payload[0].value.toFixed(3)}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const FilterBtn = ({ id, label }) => (
        <button
            onClick={() => setChartFilter(id)}
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all border ${chartFilter === id
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-gray-600'
                }`}
        >
            {label}
        </button>
    );

    const getRewardIcon = (category) => {
        if (category === 'generalAvg') return <Crown className="w-5 h-5 text-amber-500" />;
        if (category === 'topScorer') return <Trophy className="w-5 h-5 text-blue-500" />;
        if (category === 'mostWins') return <Medal className="w-5 h-5 text-purple-500" />;
        if (category === 'highRun') return <Star className="w-5 h-5 text-red-500" />;
        return <Trophy className="w-5 h-5 text-gray-400" />;
    };

    return (
        <div className="w-full max-w-6xl mx-auto">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

                {/* --- SOL PANEL --- */}
                <div className="lg:col-span-5 flex flex-col gap-4">

                    {/* 1. KİMLİK KARTI */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4">

                        {/* --- PROFİL FOTOĞRAFI ALANI (GÜNCELLENDİ) --- */}
                        <div className={`relative w-16 h-16 shrink-0 rounded-full border-2 ${cat.border} flex items-center justify-center bg-gray-50 overflow-hidden group`}>
                            {!imageError && profileData.photoURL ? (
                                <img
                                    src={profileData.photoURL}
                                    alt={profileData.username}
                                    className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : ''}`}
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <User className="w-8 h-8 text-gray-300" />
                            )}

                            {/* Yükleme Spinner'ı */}
                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                </div>
                            )}

                            {/* Fotoğraf Yükleme Overlay'i (Sadece kendi profili ise) */}
                            {isOwnProfile && !isUploading && (
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-6 h-6 text-white" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold text-gray-900 truncate leading-tight">
                                {profileData.fullName}
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span className="font-mono text-gray-400">@{profileData.username}</span>
                                <span>•</span>
                                <span>{profileData.city}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${cat.bg} ${cat.color} ${cat.border}`}>
                                    {cat.label}
                                </span>
                                {profileData.memberId && (
                                    <span className="text-[10px] px-2 py-0.5 rounded border border-gray-100 bg-gray-50 text-gray-500 font-mono">
                                        ID:{profileData.memberId}
                                    </span>
                                )}

                                {profileData.role === 'moderator' && (
                                    <span className="text-[10px] px-2 py-0.5 rounded border border-purple-200 bg-purple-50 text-purple-700 font-bold uppercase">
                                        MODERATÖR
                                    </span>
                                )}
                            </div>

                            {/* SUPER ADMIN ACTIONS */}
                            {isSuperAdmin && onGenericAction && (
                                <div className="mt-2">
                                    <button
                                        onClick={() => onGenericAction(profileData.uid, profileData.email, profileData.role)}
                                        className={`text-[10px] px-2 py-1 rounded border font-bold transition-colors ${profileData.role === 'moderator'
                                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                            : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                            }`}
                                    >
                                        {profileData.role === 'moderator' ? 'Moderatörlüğünü Al' : 'Moderatör Yap'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ... (DASHBOARD, GRAFİK ve ÖDÜLLER kısımları aynı kaldı) ... */}
                    {/* (Kodu kısaltmak için buraları atlıyorum, orijinal koddaki gibi kalacak) */}

                    {/* 2. DASHBOARD İSTATİSTİKLERİ */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-gray-50 border-b border-gray-100 p-3 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">Genel Ortalama</span>
                            <span className={`text-3xl font-black tracking-tighter ${parseFloat(stats?.generalAvg) >= 1.0 ? 'text-green-600' : 'text-blue-900'}`}>
                                {stats?.generalAvg || "0.000"}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
                            {/* ... Dashboard içerikleri aynı ... */}
                            <div className="p-2 flex flex-col justify-center items-center text-center">
                                <span className="text-lg font-bold text-gray-800 leading-none">{stats?.eys || 0}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">En Yük. Seri</span>
                            </div>
                            <div className="p-2 flex flex-col justify-center items-center text-center">
                                <span className="text-lg font-bold text-gray-800 leading-none">%{stats?.winRate || 0}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Kazanma</span>
                            </div>
                            <div className="p-2 flex flex-col justify-center items-center text-center">
                                <span className="text-lg font-bold text-gray-800 leading-none">{stats?.totalGames || 0}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Toplam Maç</span>
                            </div>
                            <div className="p-2 flex flex-col justify-center items-center text-center">
                                <div className="flex gap-1 h-4 items-center">
                                    {last5Games.length > 0 ? last5Games.map((color, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full ${color}`}></div>
                                    )) : <span className="text-[10px] text-gray-300">-</span>}
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Form</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. PERFORMANS GRAFİĞİ */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex flex-col">
                        <div className="flex justify-between items-center mb-2 pl-1">
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <Activity className="w-3.5 h-3.5" />
                                <h3 className="text-[10px] font-bold uppercase tracking-wider">Performans</h3>
                            </div>
                            <div className="flex gap-1">
                                <FilterBtn id="last10" label="Son 10" />
                                <FilterBtn id="1m" label="1 Ay" />
                                <FilterBtn id="3m" label="3 Ay" />
                            </div>
                        </div>

                        <div className="w-full" style={{ height: '256px' }}>
                            {chartData.length > 1 ? (
                                <ResponsiveContainer width="100%" height={256}>
                                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" hide />
                                        <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} hide />
                                        <Tooltip content={<CustomTooltip />} />
                                        <ReferenceLine y={parseFloat(stats?.generalAvg)} stroke="#cbd5e1" strokeDasharray="3 3" />
                                        <Area type="monotone" dataKey="avg" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorAvg)" dot={{ r: 3, fill: "#2563eb", stroke: "#fff", strokeWidth: 1 }} activeDot={{ r: 5, strokeWidth: 0, fill: "#1e40af" }} animationDuration={1500} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-1 border border-dashed border-gray-100 rounded-lg">
                                    <Activity className="w-5 h-5 opacity-20" />
                                    <span className="text-[10px]">
                                        {games.length === 0 ? "Veri Yok" : "Filtreye uygun maç yok"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. ÖDÜL MÜZESİ (En Altta) */}
                    {myRewards.length > 0 && (
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg border border-slate-700 shadow-sm p-3">
                            <div className="flex items-center gap-2 mb-3 border-b border-slate-700/50 pb-2">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <h3 className="text-xs font-bold text-amber-100 uppercase tracking-wider">Kazanılan Ödüller</h3>
                                <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-400 px-2 rounded-full border border-amber-500/20">{myRewards.length}</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                                {myRewards.map((reward, idx) => (
                                    <div key={idx} className="shrink-0 flex flex-col items-center bg-slate-800/50 border border-slate-700 rounded-lg p-2 min-w-[100px] hover:border-amber-500/50 transition-colors">
                                        <div className="mb-1 p-1.5 rounded-full bg-slate-800 border border-slate-600 shadow-inner">
                                            {getRewardIcon(reward.category)}
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight text-center whitespace-nowrap">{reward.dateLabel}</span>
                                        <span className="text-[10px] font-bold text-slate-200 text-center leading-tight mt-1 line-clamp-2 h-7 flex items-center">{reward.rewardType}</span>
                                        <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-1.5 rounded mt-1">{reward.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- SAĞ PANEL (LİSTE) --- */}
                <div className="lg:col-span-7 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
                    <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Maç Geçmişi</h3>
                        </div>
                        <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{games.length} Kayıt</span>
                    </div>

                    <div className="p-2">
                        <ProfileGames
                            games={games}
                            username={profileData.username}
                            onUsernameClick={onUsernameClick}
                            players={players}
                        />
                    </div>
                </div>

            </div>
        </div >
    );
}

export default PlayerCard;