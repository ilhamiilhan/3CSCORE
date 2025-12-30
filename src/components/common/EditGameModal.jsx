import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react'; // Kapatma ikonu için

/**
 * Skor Düzenleme Modal'ı
 * Props:
 * - isOpen: Modal açık mı? (boolean)
 * - onClose: Kapatma fonksiyonu (handler)
 * - record: Düzenlenen maçın verisi (object)
 * - onSubmit: Kaydet butonuna basılınca çalışan fonksiyon (handler)
 */
function EditGameModal({ isOpen, onClose, record, onSubmit }) {
    // Formun iç state'leri
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const [shots, setShots] = useState(0);
    const [eys1, setEYS1] = useState(0);
    const [eys2, setEYS2] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 'record' prop'u her değiştiğinde (yani modal her açıldığında)
    // iç state'leri o maçın verileriyle doldur.
    useEffect(() => {
        if (record) {
            setScore1(record.score1 || 0);
            setScore2(record.score2 || 0);
            setShots(record.shots || 0);
            setEYS1(record.eys1 || 0);
            setEYS2(record.eys2 || 0);
            setError("");
        }
    }, [record]);

    // Modal kapalıyken hiçbir şey render etme
    if (!isOpen) {
        return null;
    }

    // Kaydet butonuna basıldığında
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const updatedData = {
                score1: Number(score1),
                score2: Number(score2),
                shots: Number(shots),
                eys1: Number(eys1),
                eys2: Number(eys2),
            };
            
            // App.jsx'teki wrapperUpdateRecord fonksiyonunu çağır
            await onSubmit(updatedData);
            
            setLoading(false);
            onClose(); // Başarılı olursa modal'ı kapat
        } catch (err) {
            setError("Güncellenirken bir hata oluştu: " + err.message);
            setLoading(false);
        }
    };

    return (
        // Arka planı karartan overlay
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
            onClick={onClose} // Dışarı tıklayınca kapat
        >
            {/* Modal içeriği (içine tıklayınca kapanmasın) */}
            <div 
                className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg z-50"
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Skor Düzelt</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                    Oyuncular: 
                    <span className="font-medium text-blue-700"> {record.player1}</span> vs 
                    <span className="font-medium text-blue-700"> {record.player2}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Oyuncu 1 Satırı */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">Sayı (P1: {record.player1})</label>
                                <input 
                                    type="number" 
                                    value={score1} 
                                    onChange={(e) => setScore1(e.target.value)} 
                                    className="w-full p-3 mt-1 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">EYS (P1)</label>
                                <input 
                                    type="number" 
                                    value={eys1} 
                                    onChange={(e) => setEYS1(e.target.value)} 
                                    className="w-full p-3 mt-1 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                        </div>
                        {/* Oyuncu 2 Satırı */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">Sayı (P2: {record.player2})</label>
                                <input 
                                    type="number" 
                                    value={score2} 
                                    onChange={(e) => setScore2(e.target.value)} 
                                    className="w-full p-3 mt-1 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">EYS (P2)</label>
                                <input 
                                    type="number" 
                                    value={eys2} 
                                    onChange={(e) => setEYS2(e.target.value)} 
                                    className="w-full p-3 mt-1 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                        </div>
                        {/* Istaka Satırı */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Toplam Istaka</label>
                            <input 
                                type="number" 
                                value={shots} 
                                onChange={(e) => setShots(e.target.value)} 
                                className="w-full p-3 mt-1 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </div>
                    </div>

                    {error && <div className="p-3 my-4 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>}

                    <div className="flex justify-end gap-4 mt-6">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="text-gray-700 text-base font-semibold px-6 py-3 hover:text-blue-700 transition border border-gray-300 rounded-xl"
                        >
                            İptal
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white text-base font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                        >
                            {loading ? "Kaydediliyor..." : "Güncelle"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditGameModal;