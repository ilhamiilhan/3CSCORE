// src/components/layout/LandingPage.jsx

import React, { useState } from "react";
import { 
    ArrowRight, CheckCircle2, BarChart3, ShieldCheck, Database, X, Wifi, Monitor, Tv 
} from "lucide-react";
import ImageSlider from "../common/ImageSlider.jsx";
import Footer from "./Footer.jsx"; 
import WhatIs3CScore from "./WhatIs3CScore.jsx"; 

function LandingPage({ setActiveTab, onGoogleSignIn, onFacebookSignIn, onTwitterSignIn, onOpenLegal }) {

  const [selectedImage, setSelectedImage] = useState(null);

  const rankingImages = [
    "/istatistikler-blur.png",
    "/istatistikler-blur-2.png",
    "/istatistikler-blur-3.png",
    "/istatistikler-blur-4.png",
  ];

  return (
    <>
      <title>3C SCORE | Profesyonel Bilardo İstatistikleri</title>
      <meta name="description" content="3 Bant bilardo performans takibi ve analizi." />

      {/* LIGHTBOX */}
      {selectedImage && (
        <div 
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
            onClick={() => setSelectedImage(null)}
        >
            <button 
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
                onClick={() => setSelectedImage(null)}
            >
                <X className="w-10 h-10" />
            </button>
            <img 
                src={selectedImage} 
                alt="Full View" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()} 
            />
        </div>
      )}

      <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">

        {/* ================= 1. HERO BÖLÜMÜ ================= */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center">
                {/* SOL: METİN ve BUTONLAR */}
                <div className="space-y-6 text-center lg:text-left order-1">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full mx-auto lg:mx-0 border border-blue-100">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        Yeni Nesil Skor Takibi
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                        Bilardo Performansını <br />
                        <span className="text-blue-600">Veriye Dönüştür</span>
                        </h1>
                        <p className="text-sm sm:text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                        Amatör ve profesyonel oyuncular için geliştirilmiş en kapsamlı istatistik ve analiz platformu.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-xs sm:text-sm font-medium text-gray-700">
                        <div className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Detaylı Analiz</div>
                        <div className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Gerçek Sıralama</div>
                        <div className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Güvenli Veri</div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-row gap-3 justify-center lg:justify-start w-full">
                        <button onClick={() => setActiveTab("register")} className="flex-1 lg:flex-none px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center gap-2">
                            Üye Ol <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => setActiveTab("login")} className="flex-1 lg:flex-none px-4 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-all transform active:scale-95">
                            Giriş Yap
                        </button>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 mb-2 font-medium">veya sosyal medya ile devam et</p>
                        <div className="flex gap-3 justify-center lg:justify-start">
                            <button onClick={onGoogleSignIn} className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" /></button>
                            <button onClick={onFacebookSignIn} className="p-2.5 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition shadow-sm"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg" alt="Facebook" className="w-4 h-4 filter brightness-0 invert" /></button>
                            <button onClick={onTwitterSignIn} className="p-2.5 bg-black text-white rounded-lg hover:opacity-80 transition shadow-sm"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></button>
                        </div>
                        </div>
                    </div>
                </div>
                {/* SAĞ: SLIDER */}
                <div className="order-2 w-full">
                    <div className="relative rounded-xl shadow-xl border-4 border-white bg-white overflow-hidden mx-auto max-w-2xl lg:max-w-none h-[250px] sm:h-[350px] lg:h-[400px]">
                        <div className="w-full h-full relative">
                            <ImageSlider images={rankingImages} interval={4000} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-6 max-w-2xl mx-auto lg:max-w-none">
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                            <BarChart3 className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                            <div className="text-[10px] font-bold text-gray-800 uppercase tracking-wide">Analitik</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                            <ShieldCheck className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                            <div className="text-[10px] font-bold text-gray-800 uppercase tracking-wide">Güvenli</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                            <Database className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                            <div className="text-[10px] font-bold text-gray-800 uppercase tracking-wide">Arşiv</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ================= 2. WHAT IS 3C SCORE ================= */}
        <div className="pb-0">
            <WhatIs3CScore />
        </div>

        {/* ================= 3. SCOREBOARD TANITIM (DÜZ VE NET) ================= */}
        {/* pt-4 -> pt-0: Üstteki boşluğu aldık */}
        <div className="mt-0 pt-0 bg-white border-t-0"> 
            <section className="bg-white overflow-hidden relative">
            
            {/* space-y-8 -> space-y-2 lg:space-y-4: Bölümler arası boşluğu aldık */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2 lg:space-y-4 relative z-10">
                
                {/* 1. BÖLÜM: YÖNETİM PANELİ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
                    <div className="order-2 lg:order-1 text-center lg:text-left z-10">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full mb-2 tracking-wider">Yönetim Paneli</div>
                        <h2 className="text-xl md:text-3xl font-black text-gray-900 mb-2 leading-tight">
                        Salon Kontrolü <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Artık Çok Kolay</span>
                        </h2>
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed max-w-lg mx-auto lg:mx-0">
                        Maçları başlatın, bitirin, oyuncu atayın. Canlı maçları anlık takip edin. Tüm masaların kontrolü tek bir ekranda.
                        </p>
                        <ul className="space-y-1 inline-block text-left">
                            <li className="flex items-center gap-2 text-gray-700 font-medium text-xs"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Tek tıkla maç başlatma</li>
                            <li className="flex items-center gap-2 text-gray-700 font-medium text-xs"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Anlık süre ve skor takibi</li>
                        </ul>
                    </div>
                    
                    {/* GÖRSEL: 1.png */}
                    <div className="order-1 lg:order-2 flex justify-center lg:justify-end relative">
                        <img 
                            src="/1.png" 
                            alt="Dashboard" 
                            onClick={() => setSelectedImage("/1.png")}
                            className="w-full max-w-md h-auto rounded-lg border border-gray-100 transition-transform duration-300 ease-out hover:scale-105 cursor-pointer"
                        />
                    </div>
                </div>

                {/* 2. BÖLÜM: MOBİL */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
                    <div className="relative flex justify-center order-1">
                        {/* GÖRSEL: 2.png - w-full ile geniş */}
                        <img 
                            src="/2.png" 
                            alt="Mobile App" 
                            onClick={() => setSelectedImage("/2.png")}
                            className="w-full max-w-lg h-auto object-contain rounded-lg transition-transform duration-300 ease-out hover:scale-105 cursor-pointer"
                        />
                    </div>

                    <div className="text-center lg:text-left order-2 z-10">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase rounded-full mb-2 tracking-wider">Mobil</div>
                        <h2 className="text-xl md:text-3xl font-black text-gray-900 mb-2 leading-tight">
                        Oyuncular Maçı <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Cepten Yönetsin</span>
                        </h2>
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed max-w-lg mx-auto lg:mx-0">
                        Her masaya tablet koymanıza gerek yok. Oyuncular QR kodu okutarak kendi telefonlarını skor kumandasına dönüştürür.
                        </p>
                    </div>
                </div>

                {/* 3. BÖLÜM: YAYIN EKRANLARI */}
                {/* pt-4 -> pt-2: Üst boşluk azaltıldı */}
                <div className="text-center pt-2 border-t border-gray-100">
                    <h2 className="text-lg md:text-2xl font-extrabold text-gray-900 mb-6 mt-2">Profesyonel Yayın Ekranları</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-2">
                        
                        {/* Kart 1 */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="mb-2 rounded-lg overflow-hidden border border-gray-200 p-1 cursor-pointer transition-transform duration-200 hover:-translate-y-2 hover:border-blue-200">
                                <img src="/3.png" onClick={() => setSelectedImage("/3.png")} className="w-full h-auto rounded" alt="Hızlı Kurulum" />
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 font-bold text-xs uppercase tracking-wide">
                                <Wifi className="w-3.5 h-3.5 text-blue-600" /> Hızlı Kurulum
                            </div>
                        </div>

                        {/* Kart 2 */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="mb-2 rounded-lg overflow-hidden border border-gray-200 p-1 cursor-pointer transition-transform duration-200 hover:-translate-y-2 hover:border-blue-200">
                                <img src="/4.png" onClick={() => setSelectedImage("/4.png")} className="w-full h-auto rounded" alt="VS Ekranı" />
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 font-bold text-xs uppercase tracking-wide">
                                <Tv className="w-3.5 h-3.5 text-blue-600" /> Yönetim Paneli
                            </div>
                        </div>

                        {/* Kart 3 */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="mb-2 rounded-lg overflow-hidden border border-gray-200 p-1 cursor-pointer transition-transform duration-200 hover:-translate-y-2 hover:border-blue-200">
                                <img src="/5.png" onClick={() => setSelectedImage("/5.png")} className="w-full h-auto rounded" alt="Maç Sonu" />
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 font-bold text-xs uppercase tracking-wide">
                                <Monitor className="w-3.5 h-3.5 text-blue-600" /> Detaylı İstatistik
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            </section>
        </div>

        {/* ================= 5. FOOTER ================= */}
        <Footer onOpenLegal={onOpenLegal} />

      </div>
    </>
  );
}

export default LandingPage;