// src/components/admin/PlayerManagement.jsx - Yapısal olarak doğru

import React from 'react';

/**
 * Oyuncu ekleme ve silme işlemlerini yöneten admin bileşeni.
 * @param {object} props - App.jsx'ten gelen props'lar
 * @param {string} newPlayerName - Yeni oyuncu adı input değeri
 * @param {function} setNewPlayerName - Yeni oyuncu adı state'ini güncelleyen fonksiyon
 * @param {function} wrapperAddPlayer - Oyuncu ekleme işlevi
 * @param {function} wrapperDeletePlayer - Oyuncu silme işlevi
 * @param {Array<string>} players - Mevcut oyuncu listesi
 */
function PlayerManagement({ 
    newPlayerName, 
    setNewPlayerName, 
    wrapperAddPlayer, 
    wrapperDeletePlayer, 
    players 
}) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ Oyuncu Yönetimi</h2>

            {/* Yeni Oyuncu Ekleme Alanı */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Yeni oyuncu adı"
                />
                <button
                    onClick={wrapperAddPlayer}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                    + Ekle
                </button>
            </div>

            {/* Oyuncu Listesi */}
            <div className="space-y-2">
                {players.map((p) => (
                    <div key={p} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="font-semibold text-gray-800 uppercase tracking-wider">{p}</span>
                        <button
                            // Oyuncuyu silmek için wrapperDeletePlayer fonksiyonunu çağırır ve oyuncu adını (p) iletir.
                            onClick={() => wrapperDeletePlayer(p)} 
                            className="bg-red-500 text-white px-3 py-1 rounded font-medium hover:bg-red-600 transition text-sm"
                        >
                            Sil
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PlayerManagement;