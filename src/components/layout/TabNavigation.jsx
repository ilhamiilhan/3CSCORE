// src/components/layout/TabNavigation.jsx

import React from 'react';
import LiveScoreboardButton from '../LiveScoreboardButton';

// İstenilen sıralama: Skor Kaydet -> İstatistikler -> Ödüller -> Oyuncu Kartı
const TABS = [
    { key: 'score', label: 'Skor Kaydet' },
    { key: 'statistics', label: 'İstatistikler' },
    { key: 'rewards', label: 'Ödüller' },
    { key: 'profile', label: 'Oyuncu Kartı' },
];

function TabNavigation({ activeTab, setActiveTab }) {
    return (
        <div className="grid grid-cols-5 gap-2 p-4 bg-white shadow-sm">
            {TABS.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${activeTab === tab.key
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                >
                    {tab.label}
                </button>
            ))}
            <LiveScoreboardButton
                text="ScoreBoard"
                style={{
                    width: '100%',
                    padding: '0',
                    height: '100%',
                    justifyContent: 'center',
                    fontSize: '14px',
                    borderRadius: '0.5rem', // rounded-lg matches 0.5rem
                    boxShadow: 'none' // reset shadow to match navigation bar style generally, unless active
                }}
            />
        </div>
    );
}

export default TabNavigation;