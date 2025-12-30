// src/components/tournaments/TournamentDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Calendar, Users, ChevronRight, Trash2 } from 'lucide-react';
import { TOURNAMENT_MANAGERS } from '../../utils/constants.jsx';
import CreateTournamentModal from './CreateTournamentModal';
import TournamentDetails from './TournamentDetails';
import { collection, query, orderBy, onSnapshot, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config.jsx';

const TournamentDashboard = ({ user, isManager }) => {
    // Admin Yetki Kontrolü
    const isTournamentAdmin = isManager || (user && TOURNAMENT_MANAGERS.includes(user.email));

    const [activeTab, setActiveTab] = useState("active");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    // NAVIGATION STATE
    const [selectedTournament, setSelectedTournament] = useState(null);

    // Load Tournaments
    useEffect(() => {
        setLoading(true);
        // Query logic: Fetch all and filter client side or basic ordering
        const q = query(collection(db, "tournaments"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTournaments(list);
            setLoading(false);
        }, (error) => {
            console.error("Turnuva verisi hatası:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (e, tournamentId) => {
        e.stopPropagation(); // Card click eventini engelle
        if (!window.confirm("Bu turnuvayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;

        try {
            await deleteDoc(doc(db, "tournaments", tournamentId));
        } catch (error) {
            console.error("Silme hatası:", error);
            alert("Turnuva silinirken bir hata oluştu.");
        }
    };

    // Filter Logic
    const filteredTournaments = tournaments.filter(t => {
        if (activeTab === "active") return t.status === "active" || t.status === "draft";
        if (activeTab === "completed") return t.status === "completed";
        return true;
    });

    // --- RENDER DETAILS VIEW ---
    if (selectedTournament) {
        return (
            <TournamentDetails
                tournament={selectedTournament}
                onBack={() => setSelectedTournament(null)}
                user={user}
            />
        );
    }

    // --- RENDER DASHBOARD ---
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] p-6">

            <CreateTournamentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                user={user}
                onSuccess={() => {/* Toast or something? Snapshot handles update */ }}
            />

            {/* HEADLINE & ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Trophy className="text-blue-600" />
                        Turnuvalar
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Resmi ve özel turnuvaları buradan takip edebilirsiniz.
                    </p>
                </div>

                {/* CREATE BUTTON (ONLY ADMIN) */}
                {isTournamentAdmin && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus size={20} />
                        Turnuva Düzenle
                    </button>
                )}
            </div>

            {/* TABS */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === "active"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Devam Edenler
                </button>
                <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === "completed"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Tamamlananlar
                </button>
            </div>

            {/* CONTENT */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">Yükleniyor...</div>
            ) : filteredTournaments.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-12 text-center border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Henüz Turnuva Yok</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                        {activeTab === "active"
                            ? "Şu anda aktif bir turnuva bulunmamaktadır."
                            : "Geçmiş turnuva kaydı bulunamadı."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTournaments.map(tournament => (
                        <div
                            key={tournament.id}
                            onClick={() => setSelectedTournament(tournament)}
                            className="bg-white border hover:border-blue-300 transition-colors border-gray-200 rounded-xl p-5 shadow-sm group cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Trophy size={64} className="text-blue-600" />
                            </div>

                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <span className="bg-blue-100 text-blue-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                                    {tournament.type === 'grand_prix' ? "Grand Prix" : "Handikaplı"}
                                </span>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400">
                                        {tournament.createdAt?.toDate ? tournament.createdAt.toDate().toLocaleDateString("tr-TR") : "-"}
                                    </span>
                                    {/* DELETE BUTTON (ADMIN ONLY) */}
                                    {isTournamentAdmin && (
                                        <button
                                            onClick={(e) => handleDelete(e, tournament.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                            title="Turnuvayı Sil"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors line-clamp-1 relative z-10">
                                {tournament.title}
                            </h3>

                            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-4 relative z-10">
                                <span className="flex items-center gap-1">
                                    <Users size={14} /> {tournament.size || tournament.participants.length} Katılımcı
                                </span>
                                {/* Round info if available */}
                            </div>

                            <button className="w-full bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1 relative z-10">
                                Detayları Gör <ChevronRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default TournamentDashboard;
