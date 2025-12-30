// src/components/layout/Header.jsx

import React, { useState, useEffect, useRef } from 'react';
import Notifications from './Notifications.jsx';
import { LogOut, UserCircle, ChevronDown, Settings, User, Menu, X } from 'lucide-react';

function Header({
    isOnline,
    wrapperLogout,
    setActiveTab,
    username,
    fullName,
    city,
    containerClasses,
    memberId,
    onLoginClick,
    onProfileClick,
    isMobileMenuOpen, // App.jsx'ten gelen prop
    setIsMobileMenuOpen
}) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef(null);

    const handleLogoClick = () => {
        if (setActiveTab) {
            setActiveTab(username ? 'score' : 'landing');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);

    return (
        <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md sticky top-0 z-50">
            <div className={`py-3 px-4 sm:px-6 flex justify-between items-center w-full ${containerClasses}`}>

                {/* SOL: LOGO */}
                <div onClick={handleLogoClick} className="cursor-pointer group flex flex-col select-none relative z-50" role="button">
                    <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2 tracking-tight">
                        <div className="flex -space-x-1 transition-transform group-hover:scale-110 duration-300">
                            <span className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-yellow-400 shadow-sm ring-2 ring-blue-700"></span>
                            <span className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-600 shadow-sm ring-2 ring-blue-700 z-10"></span>
                            <span className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-white shadow-sm ring-2 ring-blue-700"></span>
                        </div>
                        <span className="font-['Bebas_Neue'] tracking-wide drop-shadow-md">3C SCORE</span>
                    </h1>
                    {!isOnline && (
                        <span className="text-[10px] bg-red-500/20 text-red-100 px-2 py-0.5 rounded-full w-fit mt-1 animate-pulse">
                            ⚠️ Bağlantı Yok
                        </span>
                    )}
                </div>

                {/* SAĞ: KULLANICI PANELİ + MOBİL MENÜ BUTONU */}
                <div className="flex items-center gap-2 sm:gap-4 relative z-50">

                    {/* Kullanıcı Giriş Yapmışsa */}
                    {username ? (
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="pt-1"><Notifications username={username} /></div>
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => {
                                        const newState = !showProfileMenu;
                                        setShowProfileMenu(newState);
                                        if (newState && setIsMobileMenuOpen) setIsMobileMenuOpen(false); // Profil açılırsa mobil menüyü kapat
                                    }}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full pl-2 pr-3 py-1.5 transition-all duration-200 border border-transparent hover:border-white/10 min-w-[44px] min-h-[44px]"
                                >
                                    <div className="h-8 w-8 rounded-full bg-blue-800/40 flex items-center justify-center border border-blue-400/30 shrink-0">
                                        <UserCircle className="w-5 h-5 text-blue-100" />
                                    </div>
                                    <span className="text-sm font-semibold truncate max-w-[80px] sm:max-w-[150px] hidden sm:block">{username}</span>
                                    <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-blue-200 transition-transform duration-200 hidden sm:block ${showProfileMenu ? 'rotate-180' : 'rotate-0'}`} />
                                </button>
                                {showProfileMenu && (
                                    <div className="fixed top-[60px] right-0 z-[100] w-72 bg-white rounded-bl-xl shadow-2xl border-l border-b border-gray-100 overflow-hidden transform origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 sm:absolute sm:top-auto sm:right-0 sm:mt-2 sm:rounded-xl sm:border">
                                        <div
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                if (onProfileClick) onProfileClick();
                                                else if (setActiveTab) setActiveTab('profile');
                                            }}
                                            className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 cursor-pointer hover:bg-blue-800 transition-colors group relative"
                                        >
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><User className="w-4 h-4 text-blue-200" /></div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 shrink-0"><UserCircle className="w-8 h-8" /></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-lg truncate" title={username}>{username}</div>
                                                    {memberId && (<div className="flex items-center gap-1.5 mt-1"><span className="bg-black/20 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider text-blue-50">ID: {memberId}</span></div>)}
                                                </div>
                                            </div>
                                            <div className="text-sm text-blue-50 border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
                                                <div><div className="truncate font-medium">{fullName}</div>{city && <div className="text-xs opacity-80 mt-0.5 flex items-center gap-1">📍 {city}</div>}</div>
                                                <span className="text-sm bg-white/10 px-2 py-1 rounded text-blue-100 group-hover:bg-white/20">Kartı Gör &rarr;</span>
                                            </div>
                                        </div>

                                        <div className="py-1">
                                            <button onClick={() => { setShowProfileMenu(false); if (setActiveTab) setActiveTab('settings'); }} className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-3 transition-colors group">
                                                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all"><Settings className="w-4 h-4 text-gray-500 group-hover:text-blue-600" /></div>
                                                <span className="font-medium text-sm">Profil Ayarları</span>
                                            </button>
                                            <div className="h-px bg-gray-100 mx-4"></div>
                                            <button onClick={() => { setShowProfileMenu(false); wrapperLogout(); }} className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 flex items-center gap-3 transition-colors group">
                                                <div className="p-2 bg-red-50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all"><LogOut className="w-4 h-4 text-red-500" /></div>
                                                <span className="font-medium text-sm">Çıkış Yap</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Misafir Kullanıcı (Giriş Yap Butonu)
                        <button
                            onClick={onLoginClick}
                            className="text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2 rounded-lg transition-all shadow-sm"
                        >
                            Giriş Yap
                        </button>
                    )}

                    {/* YENİ: MOBİL MENÜ BUTONU (Hamburger) - Sağ tarafta */}
                    <button
                        onClick={() => {
                            if (setIsMobileMenuOpen) {
                                setIsMobileMenuOpen(prev => {
                                    const newState = !prev;
                                    if (newState) setShowProfileMenu(false); // Mobil menü açılırsa profili kapat
                                    return newState;
                                });
                            }
                        }}
                        className="md:hidden p-2 ml-1 rounded-lg hover:bg-white/10 text-white transition-colors border border-transparent hover:border-white/10 active:bg-white/20"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;