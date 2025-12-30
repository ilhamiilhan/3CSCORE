// src/components/tournaments/CreateTournamentModal.jsx

import React, { useState } from 'react';
import { X, Users, Trophy, ChevronRight, Wand2, Calculator, Target } from 'lucide-react';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/config.jsx';

const TOURNAMENT_SIZES = [16, 32, 48, 64];

const CreateTournamentModal = ({ isOpen, onClose, onSuccess, user }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form Data
    const [title, setTitle] = useState("");
    const [type, setType] = useState("grand_prix"); // grand_prix | handicap
    const [size, setSize] = useState(32);
    const [baseScore, setBaseScore] = useState(60); // NEW: Base score for Handicap (e.g. 60)

    // Participants
    const [rawParticipants, setRawParticipants] = useState("");
    const [participantList, setParticipantList] = useState([]);
    const [pairings, setPairings] = useState([]);

    if (!isOpen) return null;

    // --- LOGIC ---

    const handleParticipantValidation = () => {
        const lines = rawParticipants.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        if (lines.length !== parseInt(size)) {
            setError(`Hata: ${size} kişi seçildi ancak ${lines.length} isim girildi.`);
            return false;
        }

        const parsedList = [];

        if (type === 'handicap') {
            for (let line of lines) {
                const match = line.match(/^(.*)\s+(\d+)$/);
                if (!match) {
                    setError(`Hata: "${line}" satırında handikap sayısı bulunamadı. Lütfen "İsim Handikap" formatında (örn: Ahmet 30) giriniz.`);
                    return false;
                }
                parsedList.push({
                    name: match[1].trim(),
                    handicap: parseInt(match[2], 10)
                });
            }
        } else {
            parsedList.push(...lines.map(l => ({ name: l, handicap: null })));
        }

        setParticipantList(parsedList);
        setError("");
        return true;
    };

    const generatePairings = () => {
        if (!handleParticipantValidation()) return;

        const lines = rawParticipants.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        if (lines.length !== parseInt(size)) {
            setError(`Hata: ${size} kişi seçildi ancak ${lines.length} isim girildi.`);
            return;
        }

        let currentList = [];
        if (type === 'handicap') {
            for (let line of lines) {
                const match = line.match(/^(.*)\s+(\d+)$/);
                if (!match) {
                    setError(`Hata: "${line}" satırında handikap sayısı bulunamadı.`);
                    return;
                }
                currentList.push({ name: match[1].trim(), handicap: parseInt(match[2], 10) });
            }
        } else {
            currentList = lines.map(l => ({ name: l, handicap: null }));
        }

        const shuffled = [...currentList];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const newPairings = [];
        for (let i = 0; i < shuffled.length; i += 2) {
            newPairings.push({
                matchId: (i / 2) + 1,
                player1: shuffled[i].name,
                player1Handicap: shuffled[i].handicap,
                player2: shuffled[i + 1] ? shuffled[i + 1].name : "BAY",
                player2Handicap: shuffled[i + 1] ? shuffled[i + 1].handicap : null,
                score1: 0,
                score2: 0,
                winner: null
            });
        }

        setParticipantList(currentList);
        setPairings(newPairings);
        setStep(3);
    };

    const handleSave = async () => {
        setLoading(true);
        setError("");
        try {
            await addDoc(collection(db, "tournaments"), {
                title,
                type,
                size: parseInt(size),
                baseScore: type === 'handicap' ? parseInt(baseScore) : null,
                status: "active",
                participants: participantList,
                rounds: [
                    {
                        roundNumber: 1,
                        matches: pairings
                    }
                ],
                createdBy: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError("Turnuva oluşturulurken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER ---

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Turnuva Düzenle</h2>
                        <div className="flex gap-2 mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${step >= 1 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>1. Ayarlar</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${step >= 2 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>2. Katılımcılar</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${step >= 3 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>3. Kura</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><X size={18} /></button>
                </div>

                {/* CONTENT */}
                <div className="p-4 flex-1 overflow-y-auto">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold border border-red-100 animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {/* STEP 1: SETTINGS */}
                    {step === 1 && (
                        <div className="space-y-3 animate-in slide-in-from-right-4 duration-200">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Turnuva Adı</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Örn: Hafta Sonu 3 Bant Turnuvası"
                                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none font-bold text-gray-800 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Turnuva Tipi</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => setType("grand_prix")}
                                        className={`cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center gap-1 transition-all ${type === "grand_prix" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-200"}`}
                                    >
                                        <Trophy size={20} className={type === "grand_prix" ? "text-blue-600" : "text-gray-400"} />
                                        <div className="font-bold text-xs">Grand Prix</div>
                                        <div className="text-[10px] text-gray-500 text-center leading-tight">Eleme usulü, fixed fikstür</div>
                                    </div>

                                    <div
                                        onClick={() => setType("handicap")}
                                        className={`cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center gap-1 transition-all ${type === "handicap" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-200"}`}
                                    >
                                        <Calculator size={20} className={type === "handicap" ? "text-blue-600" : "text-gray-400"} />
                                        <div className="font-bold text-xs">Handikaplı</div>
                                        <div className="text-[10px] text-gray-500 text-center leading-tight">Özel handikap puanları ile</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Katılımcı Sayısı</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={size}
                                            onChange={(e) => setSize(e.target.value)}
                                            placeholder="Katılımcı sayısı"
                                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none font-bold text-gray-800 text-sm"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium text-sm">Kişi</div>
                                    </div>

                                    {/* Grand Prix Hızlı Seçim Butonları */}
                                    {type === "grand_prix" && (
                                        <div className="flex gap-2 mt-2">
                                            {TOURNAMENT_SIZES.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setSize(s)}
                                                    className={`flex-1 py-1.5 text-xs rounded-lg font-bold border transition-all ${parseInt(size) === s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {type === "handicap" && (
                                    <div className="w-1/3 animate-in fade-in slide-in-from-right">
                                        <label className="block text-xs font-bold text-gray-700 mb-2 truncate">Turnuva Sayısı</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={baseScore}
                                                onChange={(e) => setBaseScore(e.target.value)}
                                                className="w-full p-2 border-2 border-blue-200 bg-blue-50 rounded-lg focus:border-blue-500 outline-none font-bold text-blue-900 text-sm"
                                            />
                                            <Target size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}

                    {/* STEP 2: PARTICIPANTS */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="font-bold text-blue-900 flex items-center gap-2">
                                    <Users size={18} />
                                    Katılımcı Listesi {type === 'handicap' ? "(Handikaplı)" : ""}
                                </h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    {type === 'handicap'
                                        ? <>Lütfen her satıra <strong>İSİM</strong> ve <strong>HANDİKAP</strong> puanını giriniz.</>
                                        : <>Lütfen her satıra bir isim gelecek şekilde listeyi giriniz.</>
                                    }
                                </p>
                            </div>

                            <textarea
                                value={rawParticipants}
                                onChange={(e) => {
                                    setRawParticipants(e.target.value);
                                }}
                                className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl font-mono text-sm focus:border-blue-500 outline-none resize-none"
                                placeholder={type === 'handicap' ? "Ahmet Yılmaz 35\nMehmet Demir 40\nAli Veli 30" : "Ahmet Yılmaz\nMehmet Demir\nAli Veli"}
                            />
                            <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                <span>{type === 'handicap' ? "Format: 'İsim Handikap'" : "Format: 'İsim'"}</span>
                                <div>Girilen: {rawParticipants.split('\n').filter(l => l.trim().length > 0).length} / {size}</div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PREVIEW (PAIRINGS) */}
                    {step === 3 && (
                        <div className="space-y-4 h-full flex flex-col animate-in slide-in-from-right-4 duration-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-800">1. Tur Eşleşmeleri (Rastgele)</h3>
                                <button onClick={generatePairings} className="text-xs text-blue-600 font-bold hover:underline">Yeniden Karıştır ↻</button>
                            </div>

                            <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50 p-2 space-y-2">
                                {pairings.map((match) => (
                                    <div key={match.matchId} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                                        <div className="text-xs text-gray-400 font-bold w-6">#{match.matchId}</div>

                                        {/* Player 1 */}
                                        <div className="flex-1 text-right">
                                            <div className="font-bold text-gray-800">{match.player1}</div>
                                            {match.player1Handicap && <div className="text-xs text-gray-500">H: {match.player1Handicap}</div>}
                                        </div>

                                        <div className="px-3 text-xs font-bold text-red-500">VS</div>

                                        {/* Player 2 */}
                                        <div className="flex-1 text-left">
                                            <div className="font-bold text-gray-800">{match.player2}</div>
                                            {match.player2Handicap && <div className="text-xs text-gray-500">H: {match.player2Handicap}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-4 border-t border-gray-100 flex justify-between bg-gray-50 rounded-b-2xl">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                        >
                            Geri
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => {
                                if (step === 1) {
                                    if (!title) return setError("Lütfen bir turnuva adı giriniz.");
                                    if (!size || size <= 0) return setError("Geçerli bir katılımcı sayısı giriniz.");
                                    setStep(2);
                                    setError("");
                                } else if (step === 2) {
                                    generatePairings();
                                }
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all text-sm"
                        >
                            {step === 1 ? "Devam Et" : "Kura Çek"} <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 text-sm"
                        >
                            <Wand2 size={16} />
                            {loading ? "Oluşturuluyor..." : "Turnuvayı Başlat"}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CreateTournamentModal;
