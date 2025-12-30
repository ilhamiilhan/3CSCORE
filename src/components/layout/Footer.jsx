// src/components/layout/Footer.jsx

import React from 'react';
import { Instagram, Youtube, Facebook, Mail, MapPin } from 'lucide-react';

function Footer({ onOpenLegal }) {
    const currentYear = new Date().getFullYear();

    // ★ GÜNCELLENDİ: Yeni Facebook Sayfa Linkin
    const facebookLink = "https://www.facebook.com/profile.php?id=61584129001666"; 

    return (
        <footer className="bg-gray-900 text-gray-400 text-sm border-t border-gray-800 mt-auto">
            {/* --- ÜST KISIM (Ana İçerik) --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    
                    {/* 1. KOLON: MARKA & HAKKINDA */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-red-600 -ml-1"></div>
                            <div className="w-3 h-3 rounded-full bg-white -ml-1"></div>
                            <span className="ml-2">3C SCORE</span>
                        </h2>
                        <p className="leading-relaxed text-gray-500">
                            Türk bilardosunun dijital dönüşüm platformu. Oyuncu istatistikleri, turnuva analizleri ve performans takibi tek bir noktada.
                        </p>
                        <div className="flex items-center gap-2 text-gray-500 pt-2">
                            <MapPin className="w-4 h-4" />
                            <span>Samsun, Türkiye</span>
                        </div>
                    </div>

                    {/* 2. KOLON: PLATFORM */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-xs">Platform</h3>
                        <ul className="space-y-3">
                            <li><button className="hover:text-white transition-colors text-left">Canlı Skor (Yakında)</button></li>
                            <li><button className="hover:text-white transition-colors text-left">İstatistikler</button></li>
                            <li><button className="hover:text-white transition-colors text-left">Sıralamalar</button></li>
                            <li><button className="hover:text-white transition-colors text-left">Salonlar</button></li>
                        </ul>
                    </div>

                    {/* 3. KOLON: KURUMSAL & YASAL */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-xs">Kurumsal</h3>
                        <ul className="space-y-3">
                            <li>
                                <button onClick={() => onOpenLegal('hakkimizda')} className="hover:text-white transition-colors text-left">
                                    Hakkımızda
                                </button>
                            </li>
                            <li>
                                <button onClick={() => onOpenLegal('kullanim-kosullari')} className="hover:text-white transition-colors text-left">
                                    Kullanım Koşulları
                                </button>
                            </li>
                            <li>
                                <button onClick={() => onOpenLegal('gizlilik')} className="hover:text-white transition-colors text-left">
                                    Gizlilik Politikası
                                </button>
                            </li>
                            <li>
                                <button onClick={() => onOpenLegal('kvkk')} className="hover:text-white transition-colors text-left">
                                    KVKK Aydınlatma Metni
                                </button>
                            </li>
                            <li>
                                <button onClick={() => onOpenLegal('cerez-politikasi')} className="hover:text-white transition-colors text-left">
                                    Çerez Politikası
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* 4. KOLON: İLETİŞİM */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-xs">İletişim</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 group cursor-pointer">
                                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-blue-600 transition-colors text-white">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="group-hover:text-white transition-colors">iletisim@3cscore.com</span>
                            </li>
                        </ul>

                        {/* Sosyal Medya (Sıralama: Facebook -> Instagram -> Youtube) */}
                        <div className="mt-6">
                            <span className="text-xs font-bold text-gray-600 uppercase mb-2 block">Bizi Takip Edin</span>
                            <div className="flex gap-3">
                                
                                {/* 1. FACEBOOK */}
                                <a 
                                    href={facebookLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 hover:text-white transition-all"
                                    title="Facebook"
                                >
                                    <Facebook className="w-4 h-4" />
                                </a>

                                {/* 2. INSTAGRAM (Şimdilik Facebook'a gider) */}
                                <a 
                                    href={facebookLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-pink-600 hover:text-white transition-all"
                                    title="Instagram (Yakında)"
                                >
                                    <Instagram className="w-4 h-4" />
                                </a>

                                {/* 3. YOUTUBE (Şimdilik Facebook'a gider) */}
                                <a 
                                    href={facebookLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-600 hover:text-white transition-all"
                                    title="Youtube (Yakında)"
                                >
                                    <Youtube className="w-4 h-4" />
                                </a>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ALT ŞERİT (COPYRIGHT) --- */}
            <div className="border-t border-gray-800 bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-600 text-center md:text-left">
                        &copy; {currentYear} 3C SCORE. Tüm hakları saklıdır. Bu sitedeki veriler bilgilendirme amaçlıdır.
                    </p>
                    
                    <div className="flex items-center gap-6 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-default">
                            Made with ❤️ in Samsun
                        </span>
                        <span className="bg-gray-800 px-2 py-1 rounded text-gray-400">
                            v1.0.0 Beta
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;