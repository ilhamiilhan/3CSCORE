// src/services/auth.service.jsx - GÜNCEL VE HATALARI KONTROL EDEN SÜRÜM

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; 
import { db as firebaseDb, auth as firebaseAuth } from './firebase/config.jsx'; 
import { getNextMemberId } from './firebase.service.jsx'; 

/**
 * Kullanıcı Girişi yapar (Email/Password).
 */
export const login = async (email, password, rememberMe) => {
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(firebaseAuth, persistenceType);

    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user; 

    if (!user.emailVerified) {
        await signOut(firebaseAuth); 
        
        const unverifiedError = new Error("Lütfen e-posta adresinizi doğrulayınız.");
        unverifiedError.code = "auth/email-not-verified";
        throw unverifiedError; 
    }
    
    const userDocRef = doc(firebaseDb, "users", user.uid);
    await updateDoc(userDocRef, { isEmailVerified: true }); 
    
    console.log("✅ Giriş başarılı:", user.email);
    return user;
};

/**
 * Yeni kullanıcı kaydı oluşturur.
 * ★ MEMBER ID SİSTEMİ EKLENDİ ★
 */
export const register = async (email, password, username, fullName, city, wrapperLoadDataAndAverages) => {
    try {
        // 1. Firebase Auth'a kullanıcıyı kaydet
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const user = userCredential.user;

        // 2. ★ YENİ: Sıralı Member ID al
        const memberId = await getNextMemberId(email);
        console.log(`🆔 Yeni Member ID alındı: ${memberId} (${email})`);

        // 3. Firestore'a kullanıcı bilgilerini kaydet
        const userDocRef = doc(firebaseDb, "users", user.uid);
        await setDoc(userDocRef, {
            uid: user.uid,
            email: email,
            username: username.toLocaleLowerCase('tr-TR'), 
            fullName: fullName,
            city: city,
            role: "oyuncu",
            createdAt: serverTimestamp(),
            isEmailVerified: false, 
            isProfilePrivate: false,
            memberId: memberId // ★ YENİ ALAN: Sıralı ID
        });

        // 4. Kullanıcının profil bilgilerini güncelle
        await updateProfile(user, {
            displayName: username,
        });

        // 5. E-posta doğrulama gönder
        await sendEmailVerification(user);
        
        // 6. Kayıt sonrası çıkış yap (e-posta doğrulanana kadar)
        await signOut(firebaseAuth);
        
        // 7. Verileri yenile
        if (wrapperLoadDataAndAverages) {
            wrapperLoadDataAndAverages(); 
        }

        console.log(`✅ Kayıt başarılı: ${username} (ID: ${memberId})`);
        
        return { 
            success: true, 
            message: "Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın ve Giriş Yap sekmesini kullanın." 
        };

    } catch (error) {
        let errorMessage = "Kayıt başarısız oldu. Lütfen tekrar deneyin.";
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "Bu e-posta adresi zaten kullanılıyor. Lütfen 'Giriş Yap' sekmesini kullanın.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "Şifre en az 6 karakter olmalıdır.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Geçersiz e-posta adresi.";
        } else if (error.message) {
            errorMessage = "Kayıt başarısız: " + error.message; 
        }
        
        console.error("❌ Kayıt hatası (auth.service):", error);
        throw new Error(errorMessage); 
    }
};

/**
 * Şifre sıfırlama
 */
export const resetPassword = async (email, setResetPasswordLoading, setError, setResetPasswordSuccess) => {
    setResetPasswordLoading(true);
    setError(null);
    setResetPasswordSuccess(null);

    try {
        if (!email) {
            throw new Error("Lütfen e-posta adresinizi giriniz.");
        }
        
        await sendPasswordResetEmail(firebaseAuth, email);
        
        setResetPasswordSuccess("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen spam kutunuzu da kontrol edin.");
        console.log("✅ Şifre sıfırlama e-postası gönderildi:", email);
        return true;

    } catch (error) {
        console.error("❌ Şifre sıfırlama hatası:", error);
        let errorMessage = "Şifre sıfırlama başarısız oldu.";
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = "Bu e-posta adresi sistemde kayıtlı değil.";
        } else if (error.code === 'auth/missing-email' || error.message === "Lütfen e-posta adresinizi giriniz.") {
            errorMessage = "Lütfen geçerli bir e-posta adresi giriniz.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Geçersiz e-posta adresi formatı.";
        }
        
        setError(errorMessage); 
    } finally {
        setResetPasswordLoading(false); 
    }
};

/**
 * Oturumu kapatır
 */
export const logout = async () => {
    try {
        await signOut(firebaseAuth);
        console.log("✅ Çıkış yapıldı");
    } catch (error) {
        console.error("❌ Çıkış hatası:", error);
        throw error;
    }
};