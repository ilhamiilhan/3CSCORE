// src/components/admin/UserManagement.jsx

import React from 'react';
// import { CITIES_OF_TURKEY } from '../../utils/constants'; // CITIES_OF_TURKEY App.jsx'ten gelmeli

// Bu bileşenin App.jsx'teki UserManagement çağrısına bağlı olduğunu unutmayın.

function UserManagement({ 
    // State'ler
    usersList, 
    editingUser, 
    editUsername, 
    editFullName, 
    editCity, // Şehir düzenleme değeri
    editPassword, 
    error,
    loading, 
    
    // Setter'lar
    setEditUsername, 
    setEditFullName, 
    setEditCity, // Şehir düzenleme setter'ı
    setEditPassword, 
    setEditingUser,
    
    // Fonksiyonlar
    setError, 
    handleEditUserClick, 
    wrapperUpdateUserPasswordByAdmin, 
    wrapperUpdateUserByAdmin, 
    wrapperDeleteUserByAdmin,
    cities // App.jsx'ten gelen şehir listesi
}) {

    return (
        <div className="bg-white rounded-lg shadow-xl p-6 space-y-4">
            
            <h3 className="text-2xl font-extrabold text-red-600 mb-4 tracking-tight">
                <span className="mr-2">🚨</span> ADMIN: Kayıtlı Kullanıcıları Yönet
            </h3>
            
            {/* Hata Mesajı */}
            {error && <div className="p-2 bg-red-100 text-red-800 rounded text-sm">{error}</div>}

            {/* Kullanıcı Düzenleme Formu */}
            {editingUser && (
                <div className="mb-4 p-4 border border-red-300 rounded-lg bg-red-50 space-y-2">
                    <h4 className="font-bold text-red-700">Kullanıcı Düzenleniyor: {editingUser.username}</h4>
                    
                    {/* Kullanıcı Adı */}
                    <input 
                        type="text" 
                        value={editUsername} 
                        onChange={e => setEditUsername(e.target.value)} 
                        placeholder="Kullanıcı Adı" 
                        className="w-full p-2 border rounded" 
                    />
                    
                    {/* İsim Soyisim */}
                    <input 
                        type="text" 
                        value={editFullName} 
                        onChange={e => setEditFullName(e.target.value)} 
                        placeholder="İsim Soyisim" 
                        className="w-full p-2 border rounded" 
                    />

                    {/* Şehir Düzenleme SELECT Alanı */}
                    <label className="block text-gray-700 text-sm font-bold mt-2 mb-1" htmlFor="edit-city-select">
                        Şehir
                    </label>
                    <select
                        id="edit-city-select"
                        value={editCity || ''}
                        onChange={(e) => setEditCity(e.target.value)} 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4 bg-white"
                    >
                        <option value="">-- Şehir Seçiniz --</option>
                        {cities.map((cityOption) => (
                            <option key={cityOption} value={cityOption}>
                                {cityOption}
                            </option>
                        ))}
                    </select>
                    
                    {/* Şifre Değiştirme Alanı */}
                    <div className="pt-2 border-t border-red-200">
                        <h5 className="text-sm font-bold text-red-700 mb-1">Şifre Değiştir</h5>
                        <input
                            type="password"
                            value={editPassword}
                            onChange={e => setEditPassword(e.target.value)}
                            placeholder="Yeni Şifre (Min 6 Karakter)"
                            className="w-full p-2 border rounded mb-2"
                        />
                        <button
                            onClick={wrapperUpdateUserPasswordByAdmin}
                            disabled={loading || editPassword.length < 6}
                            className="w-full py-2 bg-yellow-600 text-white rounded font-bold disabled:opacity-50 hover:bg-yellow-700 transition"
                        >
                            {loading ? "İşleniyor..." : "Şifreyi Güncelle"}
                        </button>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={wrapperUpdateUserByAdmin}
                            disabled={loading}
                            className="flex-1 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition"
                        >
                            {loading ? "Güncelleniyor..." : "Bilgileri Kaydet"}
                        </button>
                        <button
                            onClick={() => {setEditingUser(null); setEditPassword("");}}
                            className="py-2 px-4 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            )}
            
            {/* Kullanıcı Listesi */}
            <div className="space-y-0"> 
                <div className="text-left text-sm font-mono text-gray-600 space-y-1">
                    {usersList.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Kayıtlı kullanıcı bulunamadı.</p>
                    ) : (
                        usersList.map(u => (
                            // Stil Düzeltildi: Netlify stiline uygun border ve pading kullanıldı.
                            <div 
                                key={u.uid || u.id} 
                                className="flex justify-between items-center bg-white p-3 border-b-2 border-gray-100" 
                            > 
                                {/* Sol taraf (İsimler ve E-posta) */}
                                <div className="flex-1 min-w-0 pr-4"> 
                                    {/* Kullanıcı Adı */}
                                    <span className="font-bold text-base block text-gray-800 tracking-tight leading-tight">
                                        {u.username}
                                    </span>
                                    {/* Ad/Soyad */}
                                    <span className="block text-sm text-gray-700 leading-tight">
                                        {u.fullName || 'Ad Soyad Yok'}
                                    </span>
                                    {/* E-posta ve Şehir */}
                                    <span className="block text-xs text-red-600 mt-0.5 leading-tight">
                                        {u.email} ({u.city || 'Şehir Yok'})
                                    </span>
                                </div>
                                
                                {/* Sağ taraf (Butonlar) */}
                                <div className="flex space-x-1 flex-shrink-0"> 
                                    {/* DÜZENLE BUTONU (Kırmızı Arkaplan) */}
                                    <button 
                                        onClick={(e) => {e.stopPropagation(); handleEditUserClick(u, setEditingUser, setEditUsername, setEditFullName, setEditCity, setError);}} 
                                        className="text-xs font-bold px-3 py-1 bg-red-600 text-white border-2 border-red-600 rounded-lg hover:bg-red-700 transition" 
                                    >
                                        Düzenle
                                    </button>
                                    {/* SİL BUTONU (Gri Arkaplan) */}
                                    <button 
                                        onClick={(e) => {e.stopPropagation(); wrapperDeleteUserByAdmin(u);}} 
                                        disabled={loading}
                                        className="text-xs font-bold px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
        </div>
    );
}

export default UserManagement;