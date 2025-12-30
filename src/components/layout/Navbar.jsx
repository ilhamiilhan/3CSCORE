// src/components/layout/Navbar.jsx

import React from 'react';
import { LayoutDashboard, ChartBar, Trophy, User, MonitorPlay, Lock, Medal } from 'lucide-react';
import { auth } from '../../services/firebase/config.jsx';

const MENU_ITEMS = [
    { key: 'score', label: 'Skor Kaydet', icon: LayoutDashboard },
    { key: 'statistics', label: 'İstatistik', icon: ChartBar },
    { key: 'tournaments', label: 'Turnuvalar', icon: Trophy }, // Reusing Trophy or maybe Swords/Medal? Trophy was rewards. Let's use Medal/Crown/Award?
    // Rewards uses Trophy. Let's start with Trophy for both or change Rewards to something else? 
    // Lucide has 'Swords' for competition? 'Crown'? 'Award'?
    // Let's keep Trophy for Rewards and use 'Swords' (Crossed Swords) for Tournaments if available. 
    // Or 'Users' for players? 
    // Let's stick to 'Trophy' for Tournaments and maybe 'Gift' for Rewards?
    // Current: Rewards=Trophy.
    // Let's use 'Swords' for Tournaments if logic allows import. 
    // If not sure, verify imports. Lucide-react content.
    // 'Trophy' is widely used for Tournaments. 
    // Let's use 'Swords' and import it.
    { key: 'rewards', label: 'Ödüller', icon: Medal }, // Changed Trophy to Medal for rewards maybe? 
    { key: 'profile', label: 'Profil', icon: User },
    { key: 'scoreboard', label: 'Scoreboard', icon: MonitorPlay },
];

function Navbar({
    activeTab,
    setActiveTab,
    username,
    onLoginClick,
    onProfileClick,
    isMobileMenuOpen,
    setIsMobileMenuOpen
}) {

    // Scoreboard yönlendirmesi
    const handleScoreboardClick = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const idToken = await currentUser.getIdToken(true);
            const params = new URLSearchParams({
                token: idToken,
                userId: currentUser.uid
            });

            window.location.href = `https://live.3cscore.com?${params.toString()}`;
        } catch (error) {
            console.error('Scoreboard redirect error:', error);
        }
    };

    const handleItemClick = (key) => {
        if (!username) {
            if (onLoginClick) onLoginClick();
            if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
            return;
        }

        if (key === 'scoreboard') {
            handleScoreboardClick();
        } else if (key === 'profile') {
            if (onProfileClick) onProfileClick();
            else if (setActiveTab) setActiveTab('profile');
        } else {
            if (setActiveTab) setActiveTab(key);
        }

        if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    return (
        // Masaüstünde: Sticky navbar görünümü
        // Mobilde: Navbar konteyneri relatif olarak davranır, menü absolutedur.
        <nav className={`transition-all z-40 relative md:sticky md:top-[60px]
            ${isMobileMenuOpen ? 'z-50' : ''}
        `}>
            {/* Masaüstü Arkaplanı (Sadece masaüstünde beyaz şerit var) */}
            <div className="hidden md:block absolute inset-0 bg-white shadow-sm border-b border-gray-200"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

                {/* --- MASAÜSTÜ MENÜ (MD ve Üzeri) --- */}
                <div className="hidden md:flex items-center justify-center space-x-1 py-1 relative z-10">
                    {MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.key;

                        return (
                            <button
                                key={item.key}
                                onClick={() => handleItemClick(item.key)}
                                className={`
                                    relative flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300
                                    ${isActive
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                    }
                                    ${!username ? 'opacity-60 cursor-not-allowed hover:bg-transparent hover:text-gray-600' : ''}
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                {item.label}
                                {!username && <Lock className="w-3 h-3 ml-1 opacity-50" />}

                                {isActive && (
                                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-blue-600 rounded-full mb-1"></span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* --- MOBİL POP-OVER MENÜ (MD Altı) --- */}
                {/* Header'ın hemen altında, sağa yaslı, overlay şeklinde */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-0 right-0 w-64 bg-white rounded-bl-2xl shadow-2xl border-l border-b border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-[100]">
                        <div className="py-2">
                            {MENU_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.key;

                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => handleItemClick(item.key)}
                                        className={`
                                            w-full flex items-center gap-3 px-5 py-3.5 text-left font-medium transition-all
                                            ${isActive
                                                ? 'bg-blue-50/50 text-blue-700 border-l-4 border-blue-600'
                                                : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            p-1.5 rounded-lg 
                                            ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}
                                        `}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm">{item.label}</span>
                                        {!username && <Lock className="w-3.5 h-3.5 ml-auto opacity-40 text-gray-400" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Arkaplan Overlay (Menü açıkken dışarı tıklayınca kapatmak veya odaklanmak için) - İsteğe bağlı, şimdilik temiz görüntü için eklemiyorum ama UX için iyi olabilir. 
                Kullanıcı "minimal" dediği için sadece menüyü gösteriyorum.
            */}
        </nav>
    );
}

export default Navbar;
