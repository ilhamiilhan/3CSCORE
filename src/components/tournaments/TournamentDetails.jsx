// src/components/tournaments/TournamentDetails.jsx

import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Users, Trophy, Edit2, Play, GitCommitHorizontal, BarChart2, Star, Download, ChevronDown } from 'lucide-react';
import { TOURNAMENT_MANAGERS } from '../../utils/constants.jsx';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config.jsx';
import * as XLSX from 'xlsx';

const TournamentDetails = ({ tournament, onBack, user, isManager }) => {
    const isTournamentAdmin = isManager || (user && TOURNAMENT_MANAGERS.includes(user.email));

    // State for Score Modal
    const [editingMatch, setEditingMatch] = useState(null);
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

    // Form States
    const [score1, setScore1] = useState("");
    const [score2, setScore2] = useState("");
    const [shots, setShots] = useState("");
    const [eys1, setEYS1] = useState("");
    const [eys2, setEYS2] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Stats Toggle State
    const [expandedRoundStats, setExpandedRoundStats] = useState({}); // { roundIndex: boolean }
    const [expandedMatches, setExpandedMatches] = useState({}); // { matchId: boolean }

    const toggleRoundStats = (idx) => {
        setExpandedRoundStats(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const toggleMatch = (matchId) => {
        setExpandedMatches(prev => ({ ...prev, [matchId]: !prev[matchId] }));
    };

    const handleEditClick = (match) => {
        setEditingMatch(match);
        setScore1(match.score1 || "");
        setScore2(match.score2 || "");
        setShots(match.shots || "");
        setEYS1(match.eys1 || "");
        setEYS2(match.eys2 || "");
        setError("");
        setIsScoreModalOpen(true);
    };

    const handleSaveScore = async () => {
        if (typeof score1 === "undefined" || typeof score2 === "undefined" || !shots) {
            setError("Lütfen skor ve ıstaka sayılarını giriniz.");
            return;
        }

        setLoading(true);
        try {
            const tourRef = doc(db, "tournaments", tournament.id);
            const tourSnap = await getDoc(tourRef);

            if (tourSnap.exists()) {
                const tourData = tourSnap.data();
                const updatedRounds = [...tourData.rounds];

                let found = false;
                for (let r of updatedRounds) {
                    const mIndex = r.matches.findIndex(m => m.matchId === editingMatch.matchId);
                    if (mIndex !== -1) {
                        const s1 = parseInt(score1);
                        const s2 = parseInt(score2);
                        let winner = null;
                        if (s1 > s2) winner = r.matches[mIndex].player1;
                        else if (s2 > s1) winner = r.matches[mIndex].player2;
                        else winner = "DRAW";

                        r.matches[mIndex] = {
                            ...r.matches[mIndex],
                            score1: s1,
                            score2: s2,
                            shots: parseInt(shots),
                            eys1: eys1 ? parseInt(eys1) : null,
                            eys2: eys2 ? parseInt(eys2) : null,
                            winner: winner
                        };
                        found = true;
                        break;
                    }
                }

                if (found) {
                    await updateDoc(tourRef, { rounds: updatedRounds });
                    setIsScoreModalOpen(false);
                } else {
                    setError("Maç bulunamadı.");
                }
            }
        } catch (err) {
            console.error(err);
            setError("Güncelleme hatası: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC: HELPER FUNCTIONS ---

    const getStartScore = (handicap) => {
        if (tournament.type !== 'handicap' || !tournament.baseScore || !handicap) return 0;
        return tournament.baseScore - handicap;
    };

    const getStats = (match, playerIdx) => {
        const score = playerIdx === 1 ? match.score1 : match.score2;
        const handicap = playerIdx === 1 ? match.player1Handicap : match.player2Handicap;
        const shots = match.shots;

        let realPoints = score;
        let avg = 0;

        if (tournament.type === 'handicap' && handicap && tournament.baseScore) {
            const start = tournament.baseScore - handicap;
            realPoints = score - start;
            if (realPoints < 0) realPoints = 0;
        }

        if (shots > 0) {
            avg = (realPoints / shots).toFixed(3);
        }

        return { realPoints, avg: parseFloat(avg) };
    };

    // --- LOGIC: STATS AGGREGATION ---

    const calculatePlayerAggregates = (matches, filterPlayerNames = null) => {
        const stats = {};

        matches.forEach(m => {
            if (!m.winner) return; // Only finished matches

            const p1Name = m.player1;
            const p2Name = m.player2;

            // Initialize if new
            if (!stats[p1Name]) stats[p1Name] = { name: p1Name, matches: 0, wins: 0, points: 0, innings: 0, hr: 0 };
            if (!stats[p2Name] && p2Name !== "BAY") stats[p2Name] = { name: p2Name, matches: 0, wins: 0, points: 0, innings: 0, hr: 0 };

            // P1 Stats
            if (p1Name !== "BAY") {
                const s1 = getStats(m, 1);
                stats[p1Name].matches += 1;
                if (m.winner === p1Name) stats[p1Name].wins += 1;
                stats[p1Name].points += s1.realPoints || 0; // Use real points logic
                stats[p1Name].innings += parseInt(m.shots || 0);
                if ((m.eys1 || 0) > stats[p1Name].hr) stats[p1Name].hr = parseInt(m.eys1 || 0);
            }

            // P2 Stats
            if (p2Name !== "BAY") {
                const s2 = getStats(m, 2);
                stats[p2Name].matches += 1;
                if (m.winner === p2Name) stats[p2Name].wins += 1;
                stats[p2Name].points += s2.realPoints || 0;
                stats[p2Name].innings += parseInt(m.shots || 0);
                if ((m.eys2 || 0) > stats[p2Name].hr) stats[p2Name].hr = parseInt(m.eys2 || 0);
            }
        });

        // Calculate Averages and Sort
        let list = Object.values(stats);
        if (filterPlayerNames) {
            list = list.filter(p => filterPlayerNames.includes(p.name));
        }

        list.forEach(p => {
            p.avg = p.innings > 0 ? (p.points / p.innings).toFixed(3) : "0.000";
        });

        // Sort: Wins Desc, Avg Desc
        list.sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            return parseFloat(b.avg) - parseFloat(a.avg);
        });

        return list;
    };


    const handleGenerateNextRound = async () => {
        const currentRound = tournament.rounds[tournament.rounds.length - 1];
        const isFinal = currentRound.matches.length === 1;
        const confirmMessage = isFinal
            ? "Turnuvayı sonlandırıp şampiyonu ilan etmek üzeresiniz. Onaylıyor musunuz? (Bu işlem geri alınamaz)"
            : "2. Tur eşleşmelerini oluşturmak üzeresiniz. Onaylıyor musunuz?";

        if (!window.confirm(confirmMessage)) return;

        setLoading(true);
        try {
            const allFinished = currentRound.matches.every(m => m.winner);
            if (!allFinished) {
                alert("Lütfen önce tüm maçların skorlarını giriniz ve kazananları belirleyiniz.");
                setLoading(false);
                return;
            }

            const winners = [];
            currentRound.matches.forEach(m => {
                if (m.winner) {
                    // Check if winner is BAY match, if so need to find player
                    // Logic: winner string is player name
                    // Find handicap
                    let hcp = null;
                    if (m.player1 === m.winner) hcp = m.player1Handicap;
                    else hcp = m.player2Handicap;

                    // Calculate stats just for this round used for sorting
                    const isP1 = m.winner === m.player1;
                    const statsResult = getStats(m, isP1 ? 1 : 2);

                    winners.push({
                        name: m.winner,
                        handicap: hcp,
                        avg: statsResult.avg
                    });
                }
            });

            // Sort by Avg (Desc)
            winners.sort((a, b) => b.avg - a.avg);

            const nextRoundMatches = [];
            const count = winners.length;

            // Check if only 1 winner -> Tournament Over
            if (count === 1) {
                const tourRef = doc(db, "tournaments", tournament.id);
                // Mark complete
                await updateDoc(tourRef, { status: 'completed', winner: winners[0].name });
                alert("Turnuva tamamlandı! Şampiyon: " + winners[0].name);
                setLoading(false);
                return;
            }

            const half = Math.floor(count / 2);

            for (let i = 0; i < half; i++) {
                const player1 = winners[i]; // Top
                const player2 = winners[count - 1 - i]; // Bottom

                nextRoundMatches.push({
                    matchId: `${tournament.rounds.length + 1}-${i + 1}`,
                    player1: player1.name,
                    player1Handicap: player1.handicap,
                    player2: player2.name,
                    player2Handicap: player2.handicap,
                    score1: 0,
                    score2: 0,
                    winner: null
                });
            }

            if (count % 2 !== 0) {
                const oddPlayer = winners[half];
                nextRoundMatches.push({
                    matchId: `${tournament.rounds.length + 1}-${half + 1}`,
                    player1: oddPlayer.name,
                    player1Handicap: oddPlayer.handicap,
                    player2: "BAY",
                    player2Handicap: null,
                    score1: 0,
                    score2: 0, // Should be auto win
                    winner: oddPlayer.name
                });
            }

            const tourRef = doc(db, "tournaments", tournament.id);
            const updatedRounds = [
                ...tournament.rounds,
                {
                    roundNumber: tournament.rounds.length + 1,
                    matches: nextRoundMatches
                }
            ];

            await updateDoc(tourRef, { rounds: updatedRounds });
            alert(`${updatedRounds.length}. Tur oluşturuldu!`);

        } catch (err) {
            console.error(err);
            alert("Hata oluştu: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- EXCEL EXPORT ---
    const handleExportExcel = (stats, filename) => {
        const data = stats.map((p, idx) => ({
            "Sıra": idx + 1,
            "Oyuncu": p.name,
            "Maç": p.matches,
            "Galibiyet": p.wins,
            "Sayı": p.points.toFixed(0),
            "Istaka": p.innings,
            "Ortalama": p.avg,
            "En Yüksek Seri": p.hr
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Istatistikler");
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };


    // --- RENDER HELPERS ---
    const StatsTable = ({ stats }) => (
        <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Oyuncu</th>
                        <th className="px-3 py-2 text-center">Maç</th>
                        <th className="px-3 py-2 text-center">Galibiyet</th>
                        <th className="px-3 py-2 text-center">Sayı</th>
                        <th className="px-3 py-2 text-center">Istaka</th>
                        <th className="px-3 py-2 text-center text-blue-600">Ort.</th>
                        <th className="px-3 py-2 text-center">EYS</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((p, idx) => (
                        <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-3 py-2 font-bold">{idx + 1}</td>
                            <td className="px-3 py-2 font-medium text-gray-900">{p.name}</td>
                            <td className="px-3 py-2 text-center">{p.matches}</td>
                            <td className="px-3 py-2 text-center font-bold text-green-600">{p.wins}</td>
                            <td className="px-3 py-2 text-center">{p.points.toFixed(0)}</td>
                            <td className="px-3 py-2 text-center">{p.innings}</td>
                            <td className="px-3 py-2 text-center font-bold text-blue-600">{p.avg}</td>
                            <td className="px-3 py-2 text-center">{p.hr}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const tournamentWinner = tournament.status === 'completed' ? tournament.winner : null;

    const containerStyle = "bg-slate-50 border text-slate-800 rounded-lg overflow-hidden border-slate-300 shadow-md";
    const boxStyle = "border border-slate-300 rounded p-3 relative mt-2";
    const labelStyle = "absolute -top-2.5 left-2 bg-slate-50 px-1 text-[10px] font-bold text-blue-600 uppercase tracking-tight flex items-center gap-0.5";
    const inputBase = "w-full bg-white border border-slate-300 rounded h-10 text-center font-bold text-lg text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-300 shadow-sm";


    return (
        <div className="animate-in slide-in-from-right-4 duration-300 pb-20">
            {/* NAVIGATION HEADER */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Turnuva Listesine Dön
            </button>

            {/* TOURNAMENT INFO CARD */}
            <div className={`rounded-xl shadow-sm border p-6 mb-6 ${tournament.status === 'completed' ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-800 text-xs uppercase font-bold px-2 py-0.5 rounded">
                                {tournament.type === 'grand_prix' ? "Grand Prix" : "Handikaplı"}
                            </span>
                            {tournament.baseScore && (
                                <span className="bg-amber-100 text-amber-800 text-xs uppercase font-bold px-2 py-0.5 rounded">
                                    Hedef: {tournament.baseScore}
                                </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${tournament.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                {tournament.status === 'active' ? "Devam Ediyor" : "Tamamlandı"}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tournament.title}</h1>
                        <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                            <span className="flex items-center gap-1"><Calendar size={16} /> {tournament.createdAt?.toDate ? tournament.createdAt.toDate().toLocaleDateString("tr-TR") : "-"}</span>
                            <span className="flex items-center gap-1"><Users size={16} /> {tournament.size || tournament.participants.length} Katılımcı</span>
                        </div>
                    </div>

                    {/* WINNER DISPLAY */}
                    {tournament.status === 'completed' && tournamentWinner && (
                        <div className="bg-gradient-to-tr from-amber-100 to-yellow-50 border border-amber-200 p-4 rounded-xl flex items-center gap-4 shadow-sm animate-in zoom-in spin-in-1">
                            <div className="bg-amber-500 text-white p-3 rounded-full shadow-lg">
                                <Trophy size={32} />
                            </div>
                            <div>
                                <div className="text-xs uppercase font-bold text-amber-700 tracking-wider">ŞAMPİYON</div>
                                <div className="text-2xl font-black text-gray-900">{tournamentWinner}</div>
                            </div>
                        </div>
                    )}

                    {/* NEXT ROUND ACTION */}
                    {isTournamentAdmin && tournament.status === 'active' && (
                        <button
                            onClick={handleGenerateNextRound}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                            disabled={loading}
                        >
                            <GitCommitHorizontal size={20} />
                            {(() => {
                                // Dynamic Text
                                const currentMatches = tournament.rounds[tournament.rounds.length - 1].matches;
                                const winnersCount = currentMatches.filter(m => m.winner).length;
                                if (winnersCount === 1 && currentMatches.length === 1) return "Turnuvayı Bitir";
                                return "Sonraki Turu Oluştur";
                            })()}
                        </button>
                    )}
                </div>
            </div>

            {/* MATCHES LIST */}
            <div className="space-y-8">
                {tournament.rounds && tournament.rounds.map((round, rIdx) => {
                    // Pre-calculate round stats
                    const roundPlayerNames = [];
                    round.matches.forEach(m => { roundPlayerNames.push(m.player1); roundPlayerNames.push(m.player2); });
                    const roundStats = calculatePlayerAggregates(round.matches); // Only matches in this round

                    return (
                        <div key={rIdx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                                <span className="font-bold text-gray-700">{round.roundNumber}. Tur</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 font-normal hidden sm:inline">{round.matches.length} Maç</span>

                                    {/* Excel Export Button */}
                                    <button
                                        onClick={() => handleExportExcel(roundStats, `${tournament.title}-Tur-${round.roundNumber}-Istatistikleri`)}
                                        className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 bg-white border border-green-200 hover:bg-green-50 px-2 py-1.5 rounded transition-colors"
                                        title={`${round.roundNumber}. Tur İstatistiklerini İndir`}
                                    >
                                        <Download size={14} />
                                        <span className="hidden md:inline">Excel'e İndir</span>
                                    </button>

                                    {/* Stats Toggle Button */}
                                    <button
                                        onClick={() => toggleRoundStats(rIdx)}
                                        className={`flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded transition-colors ${expandedRoundStats[rIdx] ? "bg-blue-100 text-blue-700" : "bg-white border text-gray-500 hover:bg-gray-50"}`}
                                    >
                                        <BarChart2 size={14} />
                                        <span className="hidden md:inline">İstatistik</span>
                                    </button>
                                </div>
                            </div>

                            {/* ROUND STATS PANEL */}
                            {expandedRoundStats[rIdx] && (
                                <div className="p-4 bg-blue-50/50 border-b border-gray-100 animate-in slide-in-from-top-2">
                                    <h4 className="text-xs font-bold text-blue-900 uppercase mb-2">Bu Turun İstatistikleri</h4>
                                    <StatsTable stats={roundStats} />
                                </div>
                            )}

                            <div className="space-y-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                                {round.matches.map((match, idx) => {
                                    const stats1 = getStats(match, 1);
                                    const stats2 = getStats(match, 2);
                                    const isWinner1 = match.winner === match.player1;
                                    const isWinner2 = match.winner === match.player2;

                                    return (
                                        <div
                                            key={match.matchId}
                                            className={`flex flex-col gap-1 px-3 py-2.5 hover:bg-blue-50/50 transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                                                }`}
                                        >

                                            {/* LINE 1: ID - PLAYERS - SCORE */}
                                            <div className="flex items-center justify-between">

                                                {/* Match ID */}
                                                <div className="text-[10px] font-bold text-gray-300 w-6 shrink-0 text-center">#{match.matchId}</div>

                                                {/* Player 1 Name & Handicap */}
                                                <div className="flex-1 flex flex-col items-end overflow-hidden">
                                                    <div className="flex items-baseline gap-1.5 truncate max-w-full">
                                                        {match.player1Handicap && <span className="text-[9px] text-gray-400 font-medium">({getStartScore(match.player1Handicap)})</span>}
                                                        <span className={`font-bold text-sm truncate uppercase ${isWinner1 ? "text-green-700" : "text-gray-900"}`}>
                                                            {match.player1}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Score */}
                                                <div className="flex items-center justify-center w-24 shrink-0 px-2 gap-1.5">
                                                    <span className={`text-xl font-black leading-none ${isWinner1 ? "text-green-600" : "text-gray-800"}`}>
                                                        {match.score1 ?? "-"}
                                                    </span>
                                                    <span className="text-gray-300 font-light">-</span>
                                                    <span className={`text-xl font-black leading-none ${isWinner2 ? "text-green-600" : "text-gray-800"}`}>
                                                        {match.score2 ?? "-"}
                                                    </span>
                                                </div>

                                                {/* Player 2 Name & Handicap */}
                                                <div className="flex-1 flex flex-col items-start overflow-hidden">
                                                    <div className="flex items-baseline gap-1.5 truncate max-w-full">
                                                        <span className={`font-bold text-sm truncate uppercase ${isWinner2 ? "text-green-700" : "text-gray-900"}`}>
                                                            {match.player2}
                                                        </span>
                                                        {match.player2Handicap && <span className="text-[9px] text-gray-400 font-medium">({getStartScore(match.player2Handicap)})</span>}
                                                    </div>
                                                </div>

                                                {/* Edit Button (Absolute Right or Flex) */}
                                                {isTournamentAdmin && (
                                                    <div className="w-6 shrink-0 flex justify-end ml-1">
                                                        <button
                                                            onClick={() => handleEditClick(match)}
                                                            className="text-gray-300 hover:text-blue-600 transition-colors"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* LINE 2: STATS (Only if match started) */}
                                            {match.shots > 0 && (
                                                <div className="flex items-center justify-between text-[10px] text-gray-400 px-6">

                                                    {/* P1 Stats */}
                                                    <div className="flex-1 flex justify-end gap-3">
                                                        <span>Ort: <b className="text-gray-600">{stats1.avg}</b></span>
                                                        <span>Seri: <b className="text-orange-600">{match.eys1 || 0}</b></span>
                                                    </div>

                                                    {/* Innings (Center) */}
                                                    <div className="w-24 shrink-0 text-center font-bold text-gray-300">
                                                        {match.shots} Istaka
                                                    </div>

                                                    {/* P2 Stats */}
                                                    <div className="flex-1 flex justify-start gap-3">
                                                        <span>Ort: <b className="text-gray-600">{stats2.avg}</b></span>
                                                        <span>Seri: <b className="text-orange-600">{match.eys2 || 0}</b></span>
                                                    </div>

                                                    {isTournamentAdmin && <div className="w-6 shrink-0"></div>} {/* Spacer for alignment */}
                                                </div>
                                            )}

                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* GENERAL STATS PANEL */}
            <div className="mt-12 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                        <Star className="text-yellow-400" />
                        <h3 className="tex-lg font-bold text-white uppercase tracking-wider">Turnuva Genel Klasmanı</h3>
                    </div>
                    <button
                        onClick={() => handleExportExcel(calculatePlayerAggregates(tournament.rounds.flatMap(r => r.matches)), `${tournament.title}-Genel-Klasman`)}
                        className="flex items-center gap-1 text-xs font-bold text-slate-900 bg-white hover:bg-gray-100 px-3 py-2 rounded transition-colors"
                        title="Genel Klasmanı İndir"
                    >
                        <Download size={14} />
                        <span className="hidden md:inline">Excel'e İndir</span>
                    </button>
                </div>
                <div className="p-6">
                    <StatsTable stats={calculatePlayerAggregates(tournament.rounds.flatMap(r => r.matches))} />
                </div>
            </div>


            {/* SCORE ENTRY MODAL */}
            {
                isScoreModalOpen && editingMatch && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            {/* HEADER */}
                            <div className="bg-slate-900 px-4 py-3 flex justify-between items-center">
                                <span className="text-white font-bold text-xs uppercase tracking-wider">MAÇ SKORU GİRİŞİ (TABELA)</span>
                                <button onClick={() => setIsScoreModalOpen(false)} className="text-white/50 hover:text-white"><Users size={16} /></button>
                            </div>

                            <div className="p-6 bg-slate-50">

                                <div className="flex justify-between items-center mb-6 text-sm font-bold text-gray-500">
                                    <span>Maç #{editingMatch.matchId}</span>
                                    {error && <span className="text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">{error}</span>}
                                </div>

                                {/* HANDICAP INFO ALERT */}
                                {tournament.type === 'handicap' && (
                                    <div className="mb-4 bg-blue-50 border border-blue-100 p-3 rounded text-xs text-blue-800">
                                        <strong>Not:</strong> Lütfen tabeladaki <strong>görünen skoru</strong> giriniz. Sistem başlangıç puanını düşerek gerçek ortalamayı arkaplanda hesaplar.
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {/* PLAYER 1 BOX */}
                                    <div className={boxStyle}>
                                        <div className={labelStyle}>OYUNCU 1</div>
                                        <div className="mt-2 mb-2 font-bold text-slate-800 truncate h-6">{editingMatch.player1}</div>
                                        {editingMatch.player1Handicap && (
                                            <div className="text-xs text-gray-500 mb-2">
                                                Start: <b>{getStartScore(editingMatch.player1Handicap)}</b> (H:{editingMatch.player1Handicap})
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <div className="relative">
                                                <label className="text-[9px] font-bold text-blue-600 uppercase mb-1 block">TABELA SKORU</label>
                                                <input type="number" value={score1} onChange={(e) => setScore1(e.target.value)} className={inputBase} placeholder="0" />
                                            </div>
                                            <div className="relative">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">EYS</label>
                                                <input type="number" value={eys1} onChange={(e) => setEYS1(e.target.value)} className={`${inputBase} text-sm h-8`} placeholder="-" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* PLAYER 2 BOX */}
                                    <div className={boxStyle}>
                                        <div className={labelStyle}>OYUNCU 2</div>
                                        <div className="mt-2 mb-2 font-bold text-slate-800 truncate h-6">{editingMatch.player2}</div>
                                        {editingMatch.player2Handicap && (
                                            <div className="text-xs text-gray-500 mb-2">
                                                Start: <b>{getStartScore(editingMatch.player2Handicap)}</b> (H:{editingMatch.player2Handicap})
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <div className="relative">
                                                <label className="text-[9px] font-bold text-blue-600 uppercase mb-1 block">TABELA SKORU</label>
                                                <input type="number" value={score2} onChange={(e) => setScore2(e.target.value)} className={inputBase} placeholder="0" />
                                            </div>
                                            <div className="relative">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">EYS</label>
                                                <input type="number" value={eys2} onChange={(e) => setEYS2(e.target.value)} className={`${inputBase} text-sm h-8`} placeholder="-" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ISTAKA (CENTERED) */}
                                <div className={`mt-4 ${boxStyle}`}>
                                    <div className={labelStyle}>İSTAKA</div>
                                    <input type="number" value={shots} onChange={(e) => setShots(e.target.value)} className={inputBase} placeholder="0" />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setIsScoreModalOpen(false)} className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors">İptal</button>
                                    <button onClick={handleSaveScore} disabled={loading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                                        {loading ? "..." : "KAYDET"}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                )
            }

        </div>
    );
};

export default TournamentDetails;
