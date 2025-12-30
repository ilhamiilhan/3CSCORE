// src/components/auth/LoginForm.jsx - ŞİFREMİ UNUTTUM BUTONU EKLENDİ

import React from 'react';

function LoginForm({ 
    email, 
    setEmail, 
    password, 
    setPassword, 
    rememberMe, 
    setRememberMe, 
    error,
    loading,
    onSubmit,
    onForgotPasswordClick // YENİ PROP
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 pt-2 text-center">Giriş Yap</h2>
            
            <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Şifre"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            
            <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                    />
                    <span>Beni Hatırla</span>
                </label>
                
                {/* ŞİFREMİ UNUTTUM BUTONU */}
                <button
                    type="button"
                    onClick={onForgotPasswordClick}
                    className="text-gray-500 hover:text-blue-600 transition duration-200"
                >
                    Şifremi Unuttum?
                </button>
            </div>
            
            {error && (
                <div className="p-2 bg-red-100 text-red-800 rounded text-sm">
                    {error}
                </div>
            )}
            
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50"
            >
                {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
        </form>
    );
}

export default LoginForm;