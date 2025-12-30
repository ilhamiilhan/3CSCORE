// src/components/layout/WhatIs3CScore.jsx

import React from 'react';
import { UserCheck, BarChart2, LayoutGrid, Smartphone } from 'lucide-react';

function WhatIs3CScore() {
  return (
    <section className="py-12 bg-slate-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
                3C SCORE Nedir?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                Bilardo performansınızı takip etmenin en akıllı yolu. Hem oyuncular hem de salon işletmecileri için geliştirilmiş, veri odaklı bir ekosistem.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Kart 1: Oyuncular İçin */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 group hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    <UserCheck className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Dijital Oyuncu Kimliği</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Her oyuncunun kendine ait bir profili bulunur. Oynadığınız tüm maçlar buraya kaydedilir, genel ortalamanız ve seviyeniz otomatik güncellenir.
                    </p>
                </div>
            </div>

            {/* Kart 2: Analiz */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 group hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-100 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                    <BarChart2 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Detaylı Performans Analizi</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Sadece galibiyet değil; En Yüksek Seri (EYS), Istaka Sayısı ve Maç Başına Puan gibi detaylı verilerle oyununuzu analiz edin.
                    </p>
                </div>
            </div>

            {/* Kart 3: Canlı Takip (GÜNCELLENDİ) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 group hover:shadow-md transition-shadow">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                    <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Canlı Salon & Masa Takibi</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Hangi salonda, hangi masada kim oynuyor? Hangi masalar boş, hangileri dolu? Canlı skorlar nedir? Hepsini anlık olarak cebinizden görüntüleyin.
                    </p>
                </div>
            </div>

            {/* Kart 4: Çoklu Cihaz (GÜNCELLENDİ) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 group hover:shadow-md transition-shadow">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Smartphone className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Esnek Skorboard Yönetimi</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Tablet, TV veya Cep Telefonu... Oyunu dilediğiniz cihazdan yönetin. Maç bitiminde skoru ister sisteme kaydedip profilinize işleyin, ister kaydetmeden çıkın.
                    </p>
                </div>
            </div>

        </div>

      </div>
    </section>
  );
}

export default WhatIs3CScore;