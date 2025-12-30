// src/components/ranking/StatisticsFilters.jsx - MOBİL İÇİN DROPDOWN TASARIMI

import React from 'react';

/**
 * İstatistikler için zaman aralığı (statsPeriod) ve 
 * alt başlık (activeStatTab) filtrelerini sağlar.
 * YATAY SEKMELER, MOBİL UYUM İÇİN AÇILIR MENÜ (SELECT) İLE GÜNCELLENDİ.
 */
function StatisticsFilters({ statsPeriod, setStatsPeriod, activeStatTab, setActiveStatTab }) {
  
  // Alt başlıklar (Aynı kalır)
  const statTabs = [
    { key: 'average', label: 'Genel Ort.' },
    { key: 'totalScore', label: 'En Skorer' }, 
    { key: 'wins', label: 'Maç Kazananlar' },
    { key: 'highAvg', label: 'En Yük. Ort. Maç' },
    { key: 'highSeries', label: 'En Yük. Seri' },
  ];
  
  // Zaman aralıkları (Aynı kalır)
  const periods = [
    { key: '1w', label: '1 Hafta' },
    { key: '2w', label: '2 Hafta' },
    { key: '1m', label: '1 Ay' },
    { key: '3m', label: '3 Ay' },
    { key: 'all', label: 'Genel' },
  ];

  return (
    <div className="space-y-4">
      
      {/* 1. YENİ TASARIM: AÇILIR MENÜ (Dropdown) */}
      <div>
        <label 
          htmlFor="stat-select" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          İstatistik Türü
        </label>
        <select
          id="stat-select"
          value={activeStatTab}
          onChange={(e) => setActiveStatTab(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold bg-white"
        >
          {statTabs.map(tab => (
            <option key={tab.key} value={tab.key}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* 2. Zaman Aralığı Filtreleri (Aynı Kalır) */}
      <div className="grid grid-cols-5 gap-2"> 
        {periods.map(period => (
            <button
                key={period.key}
                onClick={() => setStatsPeriod(period.key)}
                className={`py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors ${
                    statsPeriod === period.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
            >
                {period.label}
            </button>
        ))}
      </div>
    </div>
  );
}

export default StatisticsFilters;