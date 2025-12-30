// src/components/auth/RegisterForm.jsx - ÇALIŞAN VERSİYON

import React from 'react';
import { CITIES_OF_TURKEY } from '../../utils/constants'; 

function RegisterForm({ 
    email, 
    setEmail, 
    password, 
    setPassword, 
    username, 
    setUsername, 
    fullName, 
    setFullName,
    city, 
    setCity,
    error,
    loading,
    onSubmit
}) {
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("=== FORM SUBMIT ===");
        console.log("Veriler:", { email, username, fullName, city, passwordLength: password.length });
        
        if (onSubmit) {
            onSubmit(e);
        } else {
            console.error("onSubmit yok!");
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 pt-2 text-center">Üye Ol</h2>
            
            {/* Email */}
            <div>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                />
            </div>
            
            {/* Kullanıcı Adı */}
            <div>
                <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Kullanıcı Adı"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                />
            </div>
            
            {/* İsim Soyisim */}
            <div>
                <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="İsim Soyisim"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                />
            </div>
            
            {/* Şehir - DÜZELTİLDİ */}
            <div>
                <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                    disabled={loading}
                >
                    <option value="">Şehir Seçiniz</option>
                    {CITIES_OF_TURKEY.map((cityName) => (
                        <option key={cityName} value={cityName}>
                            {cityName}
                        </option>
                    ))}
                </select>
            </div>
            
            {/* Şifre */}
            <div>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Şifre (Min 6 Karakter)"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    minLength={6}
                    required
                    disabled={loading}
                />
            </div>
            
            {/* Hata Mesajı */}
            {error && (
                <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}
            
            {/* Kayıt Butonu */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {loading ? "Kaydediliyor..." : "Kayıt Ol"}
            </button>
        </form>
    );
}

export default RegisterForm;