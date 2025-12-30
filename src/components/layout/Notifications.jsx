// src/components/layout/Notifications.jsx
// Mobil taşma sorunu çözüldü (Header.jsx'teki relative ve buradaki absolute right-0 sayesinde)
// Okunmamış bildirim sayısı ve okundu işaretleme işlevleri mevcuttur.

import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase/config.jsx';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

function Notifications({ username }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    // Bildirimleri dinle (Real-time)
    useEffect(() => {
        if (!username) return;

        const q = query(
            collection(db, "notifications"),
            where("targetUser", "==", username),
            orderBy("createdAt", "desc"),
            limit(20) // Son 20 bildirim
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifs);
            
            // Okunmamışları say
            const unread = notifs.filter(n => !n.isRead).length;
            setUnreadCount(unread);
        });

        return () => unsubscribe();
    }, [username]);

    // Dışarı tıklayınca kapat
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Bildirime tıklayınca okundu olarak işaretle
    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                const notifRef = doc(db, "notifications", notification.id);
                await updateDoc(notifRef, { isRead: true });
            } catch (error) {
                console.error("Bildirim güncelleme hatası:", error);
            }
        }
    };

    // Tümünü okundu işaretle
    const markAllAsRead = async () => {
        const unreadNotifs = notifications.filter(n => !n.isRead);
        unreadNotifs.forEach(async (notif) => {
             try {
                const notifRef = doc(db, "notifications", notif.id);
                await updateDoc(notifRef, { isRead: true });
            } catch (error) { console.error(error); }
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* ZİL BUTONU */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-blue-100 hover:text-white transition rounded-full hover:bg-white/10 focus:outline-none"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* AÇILIR PENCERE (DROPDOWN) - Mobil uyumluluk için güncellendi */}
            {isOpen && (
                <div 
                    className={`
                        absolute mt-3 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 origin-top-right
                        
                        /* Mobil (varsayılan) */
                        left-1/2 -translate-x-1/2 w-72 max-w-[calc(100vw-2rem)]

                        /* Tablet ve sonrası */
                        sm:right-0 sm:left-auto sm:translate-x-0 sm:w-80 
                        
                        /* Büyük ekran */
                        lg:w-96
                    `}
                >
                    {/* Başlık */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-800">Bildirimler</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Tümünü okundu yap
                            </button>
                        )}
                    </div>

                    {/* Liste */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                Henüz bildiriminiz yok.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notif) => (
                                    <div 
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`px-4 py-3 hover:bg-gray-50 transition cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-blue-50/60' : ''}`}
                                    >
                                        <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${!notif.isRead ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                                        <div className="flex-1">
                                            <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {notif.createdAt?.toDate ? format(notif.createdAt.toDate(), 'd MMM HH:mm', { locale: tr }) : 'Az önce'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notifications;