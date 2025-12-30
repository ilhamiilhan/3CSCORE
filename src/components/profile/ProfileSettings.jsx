// src/components/profile/ProfileSettings.jsx
import React, { useState } from 'react';
import { updateProfilePrivacy } from '../../services/user.service';

function ProfileSettings({ user, profileData, onUpdateSuccess }) {
    const [isPrivate, setIsPrivate] = useState(profileData?.isProfilePrivate || false);
    const [loading, setLoading] = useState(false);

    const handlePrivacyChange = async (e) => {
        const checked = e.target.checked;
        setIsPrivate(checked);
        setLoading(true);
        try {
            await updateProfilePrivacy(user.uid, checked);
            // App.jsx'teki state'i güncellemek için callback gerekebilir veya reload
            alert("Gizlilik ayarı güncellendi.");
        } catch (error) {
            console.error(error);
            alert("Hata oluştu.");
            setIsPrivate(!checked); // Geri al
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Profil Ayarları</h2>
            
            <div className="space-y-4">
                {/* Salt Okunur Bilgiler */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kullanıcı Adı</label>
                    <div className="text-gray-800 font-medium">@{profileData?.username}</div>
                    <div className="text-xs text-gray-400 mt-1">Kullanıcı adı değiştirilemez.</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-Posta</label>
                    <div className="text-gray-800 font-medium">{user.email}</div>
                </div>

                {/* Gizlilik Ayarı */}
                <div className="border border-blue-100 bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-blue-900">Profili Gizle</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            Aktif ederseniz, maç geçmişinizi sadece siz görebilirsiniz.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={isPrivate}
                            onChange={handlePrivacyChange}
                            disabled={loading}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {/* Buraya Şehir Güncelleme vb. formlar eklenebilir */}
            </div>
        </div>
    );
}

export default ProfileSettings;