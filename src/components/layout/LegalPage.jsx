// src/components/layout/LegalPage.jsx

import React, { useEffect } from 'react';
import { ArrowLeft, FileText, Shield, Users, Lock } from 'lucide-react';

const LegalPage = ({ type, onBack }) => {
    
    // Sayfa açıldığında en üste kaydır
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [type]);

    let content = null;
    let title = "";
    let icon = null;

    // İçerik Yönetimi
    switch (type) {
        case 'hakkimizda':
            title = "Hakkımızda";
            icon = <Users className="w-8 h-8 text-blue-600" />;
            content = (
                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p className="font-medium text-lg text-gray-800">
                        Bilardonun Dijital Dönüşümü: 3C SCORE
                    </p>
                    <p>
                        3C SCORE, Samsun merkezli olarak kurulan, Türk bilardosunu veri ve teknolojiyle buluşturmayı hedefleyen yeni nesil bir spor teknolojisi girişimidir.
                    </p>
                    <p>
                        Bilardo tutkunu 5 arkadaş olarak başlattığımız bu proje, sahadaki mücadelenin dijital dünyada da hak ettiği değeri görmesi gerektiği inancıyla doğmuştur. Amacımız; amatörden profesyonele tüm 3 Bant Bilardo oyuncularının performanslarını kayıt altına almak, gelişimlerini veri odaklı analizlerle desteklemek ve şeffaf bir sıralama sistemi oluşturmaktır.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-lg mt-4">
                        <h3 className="font-bold text-blue-900 mb-2">Vizyonumuz</h3>
                        <p className="text-blue-800 italic">
                            "Türkiye'deki her bilardo oyuncusunun cebinde, kendi kariyerini takip edebileceği dijital bir kimlik oluşturmak ve salonlarımızı akıllı skorboard sistemleriyle donatmak."
                        </p>
                    </div>
                </div>
            );
            break;

        case 'gizlilik':
            title = "Gizlilik Politikası";
            icon = <Lock className="w-8 h-8 text-blue-600" />;
            content = (
                <div className="space-y-4 text-gray-600">
                    <p>3C SCORE olarak gizliliğinize önem veriyoruz.</p>
                    <h3 className="font-bold text-gray-800">1. Toplanan Veriler</h3>
                    <p>Kayıt olurken ad, soyad, e-posta ve şehir bilgilerinizi topluyoruz. Ayrıca maç skorlarınız istatistiksel analiz için kaydedilmektedir.</p>
                    <h3 className="font-bold text-gray-800">2. Veri Güvenliği</h3>
                    <p>Verileriniz modern şifreleme yöntemleriyle (Google Firebase altyapısı) korunmaktadır. Şifreniz şifrelenmiş olarak saklanır.</p>
                </div>
            );
            break;

        case 'kvkk':
            title = "KVKK Aydınlatma Metni";
            icon = <Shield className="w-8 h-8 text-blue-600" />;
            content = (
                <div className="space-y-4 text-gray-600">
                    <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında haklarınız aşağıdadır.</p>
                    <h3 className="font-bold text-gray-800">Veri Sorumlusu</h3>
                    <p>3C SCORE Platformu (Samsun).</p>
                    <h3 className="font-bold text-gray-800">İşleme Amacı</h3>
                    <p>İstatistiksel analiz, sıralama hesaplaması ve platform güvenliği.</p>
                    <p>Verileriniz, yasal zorunluluklar dışında üçüncü kişilerle paylaşılmaz.</p>
                </div>
            );
            break;

        case 'kullanim-kosullari':
            title = "Kullanım Koşulları";
            icon = <FileText className="w-8 h-8 text-blue-600" />;
            content = (
                <div className="space-y-4 text-gray-600">
                    <p>Platformu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız:</p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>Doğru kimlik beyanı esastır.</li>
                        <li>Sahte veya manipüle edilmiş skor girişi yasaktır. Tespiti halinde hesap kapatılır.</li>
                        <li>Platformdaki veriler bilgilendirme amaçlıdır.</li>
                    </ul>
                </div>
            );
            break;

        case 'cerez-politikasi':
            title = "Çerez Politikası";
            icon = <FileText className="w-8 h-8 text-blue-600" />;
            content = (
                <div className="space-y-4 text-gray-600">
                    <p>Hizmetlerimizi daha iyi sunabilmek için çerezler kullanıyoruz.</p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>Zorunlu çerezler: Giriş yapabilmeniz için gereklidir.</li>
                        <li>Analiz çerezleri: Site trafiğini ölçmek için kullanılır.</li>
                    </ul>
                </div>
            );
            break;

        default:
            title = "Sayfa Bulunamadı";
            content = <p>Aradığınız sayfa mevcut değil.</p>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Geri Dön Butonu */}
                <button 
                    onClick={onBack} 
                    className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Ana Sayfaya Dön
                </button>

                {/* İçerik Kartı */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-8 sm:p-10">
                    <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            {icon}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    </div>
                    
                    <div className="prose prose-blue max-w-none">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LegalPage;