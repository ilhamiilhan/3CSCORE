// src/components/ranking/RankingSubNavigation.jsx

import React from 'react';

/**
 * İstatistikler sekmesindeki 5 farklı sıralama listesi arasında geçişi sağlar.
 */
function RankingSubNavigation({ activeSubTab, setRankingSubTab }) {
    
    // Kullanıcının istediği sıralama:
    const TABS = [
        { key: 'average', label: 'Genel Ort.' },
        { key: 'totalScore', label: 'En Çok Skor' },
        { key: 'win', label: 'En Çok Maç Kazan.' },
        { key: 'highAvgGames', label: 'En Yük. Ort. Maç' },
        { key: 'highSeries', label: 'En Yük. Seriler' },
    ];

    return (
        // Yatay taşmayı yönetmek için 'overflow-x-auto' ve mobil cihazlarda tek satırda kalması için 'flex-nowrap' kullanıldı.
        <div className="flex overflow-x-auto whitespace-nowrap gap-2 pb-2 mb-4 scrollbar-hide">
            {TABS.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => setRankingSubTab(tab.key)}
                    className={`py-2 px-3 rounded-lg font-semibold text-sm transition-colors flex-shrink-0 ${
                        activeSubTab === tab.key 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

export default RankingSubNavigation;