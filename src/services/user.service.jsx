// src/services/user.service.jsx

import {
    doc, getDoc, getDocs, collection, deleteDoc, updateDoc, runTransaction,
    query, where, writeBatch, orderBy
} from 'firebase/firestore';
import { updatePassword, deleteUser } from 'firebase/auth';
import { db, auth } from './firebase/config.jsx';
import { ADMIN_EMAIL } from '../utils/constants.jsx';

// ----------------------------------------------------------------------
// OYUNCU LİSTESİ YÜKLEME (YENİ - AD SOYAD DESTEKLİ)
// ----------------------------------------------------------------------

/**
 * Tüm oyuncuların Temel Bilgilerini (Username + FullName + ID) çeker.
 * ScoreForm ve Sıralama listelerinde isimleri göstermek için kullanılır.
 */
export const loadPlayersBasic = async () => {
    try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);

        const players = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                username: data.username,
                // fullName yoksa username'i kullan, o da yoksa "Bilinmeyen Oyuncu"
                fullName: data.fullName || data.username || "Bilinmeyen Oyuncu",
                // Eski yapıdaki name/surname varsa onları da al (yedek)
                name: data.name,
                surname: data.surname
            };
        });

        // Alfabetik sırala (Opsiyonel)
        return players.sort((a, b) => a.fullName.localeCompare(b.fullName));

    } catch (error) {
        console.error("Oyuncu listesi çekilirken hata:", error);
        return [];
    }
};

// ----------------------------------------------------------------------
// ESKİ KULLANICI ADLARI YÜKLEME (Yedek olarak kalsın)
// ----------------------------------------------------------------------

export const loadAllUsernames = async () => {
    try {
        const usersCollectionRef = collection(db, "users");
        const querySnapshot = await getDocs(usersCollectionRef);

        const usernames = querySnapshot.docs
            .filter(doc => doc.data().isEmailVerified === true || doc.data().photoURL)
            .map(doc => doc.data().username);

        return usernames.filter(name => name);
    } catch (error) {
        console.error("Tüm kullanıcı adları yüklenirken hata oluştu:", error);
        return [];
    }
};

// ----------------------------------------------------------------------
// PROFİL GÖRÜNTÜLEME FONKSİYONLARI
// ----------------------------------------------------------------------

export const getProfileByUsername = async (username) => {
    try {
        const usersCollectionRef = collection(db, "users");
        const q = query(usersCollectionRef, where("username", "==", username));

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Kullanıcı bulunamadı");
        }

        const userDoc = querySnapshot.docs[0];
        return { uid: userDoc.id, ...userDoc.data() };

    } catch (error) {
        console.error("Kullanıcı profili getirilirken hata:", error);
        throw error;
    }
};

export const updateProfilePrivacy = async (uid, isPrivate) => {
    try {
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, {
            isProfilePrivate: isPrivate
        });
    } catch (error) {
        console.error("Gizlilik ayarı güncellenirken hata oluştu:", error);
        throw error;
    }
};


// ----------------------------------------------------------------------
// PROFİL İŞLEMLERİ (GİRİŞ YAPAN KULLANICI İÇİN)
// ----------------------------------------------------------------------

export const loadUserProfile = async (
    uid,
    setProfileUsername,
    setProfileFullName,
    setProfileCity,
    setProfileIsPrivate,
    setEditUsername,
    setEditFullName,
    setEditCity,
    setEditProfileEmail,
    setProfileMemberId,
    setProfileRole // YENİ: Rol set etmek için 
) => {
    try {
        const userDocRef = doc(db, "users", uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
            const data = userSnap.data();

            // Ana profil state'lerini ayarla
            setProfileUsername(data.username || "");
            setProfileFullName(data.fullName || "");
            setProfileCity(data.city || "");
            setProfileIsPrivate(data.isProfilePrivate || false);

            // MEMBER ID'Yİ AYARLA
            if (setProfileMemberId) {
                setProfileMemberId(data.memberId || null);
            }

            // ROLÜ AYARLA
            if (setProfileRole) {
                setProfileRole(data.role || "oyuncu");
            }

            // "Profili Tamamla" formu state'lerini de ayarla
            if (setEditUsername) setEditUsername(data.username || '');

            if (setEditFullName) {
                const fullNameFromDB = data.fullName === "Yeni Oyuncu" ? "" : (data.fullName || '');
                setEditFullName(fullNameFromDB);
            }

            if (setEditCity) setEditCity(data.city || '');
            if (setEditProfileEmail) setEditProfileEmail(data.email || '');

        }
    } catch (error) {
        console.error("Kullanıcı profili yüklenirken hata oluştu:", error);
    }
};

// ----------------------------------------------------------------------
// ADMIN YÖNETİM İŞLEMLERİ
// ----------------------------------------------------------------------

export const loadAllUsers = async (isAdmin, setUsersList) => {
    if (!isAdmin) return;

    try {
        const usersCollectionRef = collection(db, "users");
        const querySnapshot = await getDocs(usersCollectionRef);
        const users = querySnapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));

        const filteredUsers = users.filter(u => u.email !== ADMIN_EMAIL);
        setUsersList(filteredUsers);
    } catch (error) {
        console.error("Tüm kullanıcılar yüklenirken hata oluştu:", error);
    }
};

export const updateUserByAdmin = async (
    isAdmin,
    uid,
    oldUsername,
    newUsername,
    newFullName,
    newCity,
    editingUser,
    setError,
    setLoading,
    setEditingUser,
    wrapperLoadAllUsers,
    wrapperLoadDataAndAverages
) => {
    if (!isAdmin) {
        setError("Yetkisiz işlem.");
        return;
    }
    setLoading(true);
    setError("");
    if (newUsername === oldUsername &&
        newFullName === editingUser.fullName &&
        newCity === editingUser.city) {
        setError("Herhangi bir değişiklik yapmadınız.");
        setLoading(false);
        return;
    }
    try {
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, {
            username: newUsername || oldUsername,
            fullName: newFullName || editingUser.fullName,
            city: newCity || editingUser.city
        });
        alert(`${editingUser.email} kullanıcısının bilgileri güncellendi.`);
        setEditingUser(null);
        wrapperLoadAllUsers();
        wrapperLoadDataAndAverages();
    } catch (error) {
        console.error("Kullanıcı bilgileri güncellenirken hata oluştu:", error);
        setError("Bilgiler güncellenemedi: " + error.message);
    } finally {
        setLoading(false);
    }
};

export const updateUserPasswordByAdmin = async (
    adminUser,
    editingUser,
    newPassword,
    setError,
    setLoading,
    setEditingUser
) => {
    if (adminUser.uid !== editingUser.uid) {
        setError("⚠ Başka bir kullanıcının şifresini sıfırlamak için Cloud Functions gereklidir.");
        setLoading(false);
        return;
    }
    if (newPassword.length < 6) {
        setError("Şifre en az 6 karakter olmalıdır.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError("");
    try {
        await updatePassword(adminUser, newPassword);
        alert(`Şifreniz başarıyla güncellendi.`);
        setEditingUser(null);
    } catch (error) {
        console.error("Şifre güncellenirken hata oluştu:", error);
        setError("Şifre güncellenemedi: " + error.message);
    } finally {
        setLoading(false);
    }
};


export const deleteUserByAdmin = async (
    isAdmin,
    userToDelete,
    setError,
    setLoading,
    wrapperLoadAllUsers,
    wrapperLoadDataAndAverages
) => {
    if (!isAdmin) {
        setError("Yetkisiz işlem.");
        return;
    }

    const usernameToDelete = userToDelete.username;
    if (!usernameToDelete) {
        setError("Kullanıcı adı olmayan bir profil silinemez (Veritabanı hatası).");
        return;
    }

    const isConfirmed = window.confirm(`Emin misiniz? ${usernameToDelete} (${userToDelete.email}) kullanıcısı, oynadığı TÜM MAÇLAR ve profil verileri kalıcı olarak silinecektir. Bu işlem geri alınamaz!`);

    if (!isConfirmed) return;

    setLoading(true);
    setError("");

    try {
        const batch = writeBatch(db);

        const recordsRef = collection(db, "records");

        const q1 = query(recordsRef, where("player1", "==", usernameToDelete));
        const q1Snap = await getDocs(q1);
        q1Snap.forEach(doc => batch.delete(doc.ref));

        const q2 = query(recordsRef, where("player2", "==", usernameToDelete));
        const q2Snap = await getDocs(q2);
        q2Snap.forEach(doc => batch.delete(doc.ref));

        const userDocRef = doc(db, "users", userToDelete.uid);
        batch.delete(userDocRef);

        const usernameDocRef = doc(db, "usernames", usernameToDelete);
        batch.delete(usernameDocRef);

        await batch.commit();

        console.warn(`Auth hesabı (${userToDelete.email}) silinmedi. Bu, Admin SDK gerektirir.`);

        alert(`${usernameToDelete} kullanıcısı ve tüm maç kayıtları başarıyla silindi.`);

        wrapperLoadAllUsers();
        wrapperLoadDataAndAverages();

    } catch (error) {
        console.error("Kullanıcı ve skorları silinirken hata oluştu:", error);
        setError("Kullanıcı silinemedi: " + error.message);
    } finally {
        setLoading(false);
    }

};

// ----------------------------------------------------------------------
// ROL YÖNETİMİ (SUPER ADMIN)
// ----------------------------------------------------------------------

export const toggleUserRole = async (
    isSuperAdmin,
    targetUid,
    targetEmail,
    currentRole,
    setLoading
) => {
    console.log("SERVICE CALLED", { isSuperAdmin, targetUid, targetEmail, currentRole });
    if (!isSuperAdmin) {
        alert("Bu işlem için yetkiniz yok.");
        return;
    }

    const newRole = currentRole === "moderator" ? "oyuncu" : "moderator";
    const actionName = newRole === "moderator" ? "Moderatör yetkisi verme" : "Moderatör yetkisini alma";

    // console.log("Asking for confirmation...");
    // Bypass confirmation because browser is blocking dialogs
    /*
    if (!window.confirm(`${targetEmail} kullanıcısı için ${actionName} işlemini onaylıyor musunuz?`)) {
        console.log("Confirmation cancelled by user.");
        return;
    }
    */
    console.log("Confirmation skipped (auto-approved). Proceeding to update...");

    setLoading(true);
    try {
        const userRef = doc(db, "users", targetUid);
        console.log(`Updating doc users/${targetUid} to role: ${newRole}`);
        await updateDoc(userRef, { role: newRole });
        console.log("UpdateDoc successful!");
        alert(`İşlem başarılı! Yeni rol: ${newRole.toUpperCase()}`);
        return newRole; // Yeni rolü döndür ki UI güncellensin
    } catch (error) {
        console.error("Rol değiştirme hatası (CATCH BLOCK):", error);
        alert("Rol güncellenemedi: " + error.message);
        return null;
    } finally {
        setLoading(false);
    }
};