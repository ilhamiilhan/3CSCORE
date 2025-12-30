// src/components/ranking/RankingFilters.jsx - "SON 1 AY" EKLENDİ

import React from 'react';

function RankingFilters({ rankingPeriod, setRankingPeriod }) {
  return (
    // grid-cols-4 ile mobil dahil 4 eşit sütuna bölündü
    <div className="grid grid-cols-4 gap-2 mb-4"> 
      
      {/* YENİ EKLENTİ: Son 1 Ay */}
      <button
        onClick={() => setRankingPeriod('1m')}
        className={`py-2 rounded-lg font-semibold text-sm transition-colors ${
          rankingPeriod === '1m' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
        }`}
      >
        Son 1 Ay
      </button>

      <button
        onClick={() => setRankingPeriod('3m')}
        className={`py-2 rounded-lg font-semibold text-sm transition-colors ${
          rankingPeriod === '3m' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
        }`}
      >
        Son 3 Ay
      </button>
      <button
        onClick={() => setRankingPeriod('6m')}
        className={`py-2 rounded-lg font-semibold text-sm transition-colors ${
          rankingPeriod === '6m' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
        }`}
      >
        Son 6 Ay
      </button>
      <button
        onClick={() => setRankingPeriod('1y')}
        className={`py-2 rounded-lg font-semibold text-sm transition-colors ${
          rankingPeriod === '1y' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
        }`}
      >
        Son 1 Yıl
      </button>
    </div>
  );
}

export default RankingFilters;