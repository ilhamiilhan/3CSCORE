// YENİ MODÜLER İMPORTLAR
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, sendEmailVerification, setPersistence, browserLocalPersistence, browserSessionPersistence, updatePassword } from 'firebase/auth'; 
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, writeBatch, serverTimestamp } from 'firebase/firestore'; 
// Not: setPersistence, browserLocalPersistence, browserSessionPersistence, 
// getAuth ve app nesnesinin dışarıdan sağlanması gerekecek. 

const ADMIN_EMAIL = "agharta55@hotmail.com";

// 1. Kullanıcı Profili Yükleme (Basitleştirildi)
// setIsUsernameMissing parametresi kaldırıldı.
const loadUserProfile = async (firestore, uid, setProfileUsername, setProfileFullName) => {
    try {
        const userDocRef = doc(firestore, "users", uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) { 
            const data = userDoc.data();
            
            // Eğer username yoksa, boş bırakılır. Artık uygulamayı engellemez.
            setProfileUsername(data.username || null);
            setProfileFullName(data.fullName || null);
        } else {
            setProfileUsername(null);
            setProfileFullName(null);
        }
    } catch (err) {
        console.error("Kullanıcı profili yüklenemedi:", err);
        setProfileUsername(null);
        setProfileFullName(null);
    }
};

// 2. Admin Kullanıcı Güncelleme (Aynı kalır)
const updateUserByAdmin = async (db, isAdmin, uid, currentUsername, newUsername, newFullName, editingUser, setError, setLoading, setEditingUser, loadAllUsers, loadDataAndAverages) => {
    if (!isAdmin) return; 
    
    setLoading(true);
    setError("");

    const finalUsername = newUsername.trim();
    const finalFullName = newFullName.trim();

    if (finalUsername.length < 3) {
        setLoading(false);
        return setError("Kullanıcı adı en az 3 karakter olmalıdır.");
    }
    if (finalFullName.length < 3) {
        setLoading(false);
        return setError("İsim Soyisim bilgisi zorunludur.");
    }
    
    try {
        const batch = writeBatch(db); 
        const userRef = doc(db, "users", uid);
        const playersRef = doc(db, "players", "playersList");
        
        if (finalUsername !== currentUsername) {
            const usernameCheckRef = doc(db, "usernames", finalUsername.toLowerCase());
            const usernameCheck = await getDoc(usernameCheckRef);
            if (usernameCheck.exists()) {
                setError("Bu kullanıcı adı zaten kullanılıyor.");
                setLoading(false);
                return;
            }
            
            batch.delete(doc(db, "usernames", currentUsername.toLowerCase()));
            batch.set(doc(db, "usernames", finalUsername.toLowerCase()), { uid, email: editingUser.email });
            
            const playersDoc = await getDoc(playersRef);
            let currentPlayers = playersDoc.exists() ? (playersDoc.data().names || []) : [];
            currentPlayers = currentPlayers.filter(p => p !== currentUsername);
            currentPlayers.push(finalUsername);
            batch.set(playersRef, { names: currentPlayers });
        }
        
        batch.update(userRef, {
            username: finalUsername,
            fullName: finalFullName
        });
        
        await batch.commit();

        setError(`Kullanıcı (${finalUsername}) bilgileri başarıyla güncellendi.`);
        setEditingUser(null);
        if (loadAllUsers) loadAllUsers(); 
        if (loadDataAndAverages) loadDataAndAverages(); 

    } catch (err) {
        console.error("Admin güncelleme hatası:", err);
        setError("Kullanıcı bilgileri güncellenemedi: " + err.message);
    } finally {
        setLoading(false);
    }
};

// 3. Admin Düzenleme Butonu Tıklaması (Aynı kalır)
const handleEditUserClick = (user, setEditingUser, setEditUsername, setEditFullName, setError) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditFullName(user.fullName || '');
    setError('');
};

// 4. Admin Kullanıcı Şifre Güncelleme (Aynı kalır)
const updateUserPasswordByAdmin = async (adminUser, userToUpdate, newPassword, setError, setLoading, setEditingUser) => {
    if (!adminUser || adminUser.email !== ADMIN_EMAIL) return setError("Yetkiniz yok.");
    
    if (newPassword.length < 6) return setError("Şifre en az 6 karakter olmalıdır.");
    
    setLoading(true);
    setError("");

    try {
        setError("⚠️ Şifre güvenliği nedeniyle bu işlem client tarafından desteklenmemektedir. Lütfen Admin SDK (sunucu tarafı) kullanın veya kullanıcıdan şifresini unuttum/sıfırla akışını kullanmasını isteyin.");
        setEditingUser(null);

    } catch (err) {
        console.error("Admin şifre güncelleme hatası:", err);
        setError("Şifre güncellenemedi: " + err.message);
    } finally {
        setLoading(false);
    }
};


// 5. Admin Kullanıcı Silme (Aynı kalır)
const deleteUserByAdmin = async (db, isAdmin, userToDelete, setError, setLoading, loadAllUsers, loadDataAndAverages) => {
    if (!isAdmin || !confirm(`Kullanıcı (${userToDelete.username} - ${userToDelete.email}) KALICI olarak silinsin mi? Bu işlem geri alınamaz!`)) return;

    setLoading(true);
    setError("");

    try {
        const batch = writeBatch(db); 

        // 1. Kullanıcıyı 'users' koleksiyonundan sil
        const userRef = doc(db, "users", userToDelete.uid);
        batch.delete(userRef); 

        // 2. Kullanıcının kullanıcı adını 'usernames' koleksiyonundan sil
        if (userToDelete.username) {
            const usernameRef = doc(db, "usernames", userToDelete.username.toLowerCase());
            batch.delete(usernameRef);
        }

        // 3. Oyuncu listesinden çıkar
        const playersRef = doc(db, "players", "playersList");
        const playersDoc = await getDoc(playersRef);
        if (playersDoc.exists() && userToDelete.username) {
            let currentPlayers = playersDoc.data().names || [];
            currentPlayers = currentPlayers.filter(p => p !== userToDelete.username);
            batch.set(playersRef, { names: currentPlayers });
        }
        
        await batch.commit();

        setError(`Kullanıcı (${userToDelete.username}) bilgileri başarıyla SİLİNDİ. (Auth hesabı sunucu tarafından silinmelidir)`);
        
        if (loadAllUsers) await loadAllUsers(); 
        if (loadDataAndAverages) await loadDataAndAverages(); 

    } catch (err) {
        console.error("Admin silme hatası:", err);
        setError("Kullanıcı silinemedi: " + err.message);
    } finally {
        setLoading(false);
    }
};

// 6. Üye Ol (Register) (Aynı kalır)
const register = async (e, auth, db, email, password, username, fullName, setEmail, setPassword, setUsername, setFullName, setError, setRegisterLoading) => {
    if (e) e.preventDefault();
    if (!auth) return;
    
    const trimmedUsername = username.trim();
    const trimmedFullName = fullName.trim();
    
    if (trimmedUsername.length < 3) return setError("Kullanıcı adı en az 3 karakter olmalıdır.");
    if (trimmedFullName.length < 3) return setError("İsim Soyisim bilgisi zorunludur.");
    
    setRegisterLoading(true);
    setError("");
    
    try {
        const usernameCheckRef = doc(db, "usernames", trimmedUsername.toLowerCase());
        const usernameCheck = await getDoc(usernameCheckRef);
        if (usernameCheck.exists()) {
            setError("Bu kullanıcı adı zaten kullanılıyor.");
            setRegisterLoading(false);
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password); 
        const user = userCredential.user;
        const uid = user.uid;
        
        const batch = writeBatch(db);

        batch.set(doc(db, "users", uid), {
            email: email.trim(),
            username: trimmedUsername,
            fullName: trimmedFullName, 
            createdAt: serverTimestamp(),
        });
        
        batch.set(doc(db, "usernames", trimmedUsername.toLowerCase()), {
            uid: uid,
            email: email.trim()
        });

        const playersRef = doc(db, "players", "playersList");
        const playersDoc = await getDoc(playersRef);
        let currentPlayers = playersDoc.exists() ? (playersDoc.data().names || []) : [];
        if (!currentPlayers.includes(trimmedUsername)) {
            currentPlayers.push(trimmedUsername);
            batch.set(playersRef, { names: currentPlayers });
        }
        
        await batch.commit();

        await sendEmailVerification(user); 
        
        console.log("Kayit basarili:", user.email);
        setError("Kaydınız başarılı. Lütfen e-posta adresinizi kontrol edin ve gelen bağlantıya tıklayarak hesabınızı onaylayın.");
        setEmail("");
        setPassword("");
        setUsername("");
        setFullName("");
        
        await firebaseSignOut(auth); 
    } catch (err) {
        let friendlyMessage = "Kayit islemi basarisiz oldu.";
        if (err.code === "auth/email-already-in-use") friendlyMessage = "Bu e-posta adresi zaten kullaniliyor.";
        else if (err.code === "auth/weak-password") friendlyMessage = "Şifre çok zayif. Lütfen daha güçlü bir şifre seçin.";
        else if (err.code === "auth/invalid-email") friendlyMessage = "Geçersiz e-posta adresi formati.";
        setError(friendlyMessage);
    } finally {
        setRegisterLoading(false);
    }
};

// 7. Giriş Yap (Login) - GÜNCELLEMELER YAPILDI
const login = async (e, auth, db, email, password, rememberMe, setError, setEmail, setPassword, setLoginLoading, loadUserProfile) => {
    if (e) e.preventDefault();
    if (!auth) return;
    
    setLoginLoading(true);
    setError("");
    
    const loginInput = email.trim(); 

    // Basit email format kontrolü ekleyelim (Firebase bunu yapacak ama kullanıcıyı erken uyarabiliriz)
    if (loginInput.includes('@') && !loginInput.includes('.')) {
        setLoginLoading(false);
        return setError("Geçersiz e-posta adresi formatı.");
    }
    
    let authEmail = loginInput;
    
    try {
        if (!loginInput.includes('@') || !loginInput.includes('.')) {
            // Kullanıcı adı girişi yapıldıysa
            const usernameDocRef = doc(db, "usernames", loginInput.toLowerCase());
            const usernameDoc = await getDoc(usernameDocRef);
            if (!usernameDoc.exists()) {
                // Kullanıcı adı bulunamazsa hatayı fırlat
                const notFoundError = new Error("Kullanıcı adı veya şifre hatalı.");
                notFoundError.code = "auth/user-not-found";
                throw notFoundError; 
            }
            authEmail = usernameDoc.data().email;
        }
        
        const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        
        await setPersistence(auth, persistenceType);

        const userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            await firebaseSignOut(auth);
            setError("Giriş yapabilmek için lütfen e-posta adresinizi onaylayın. Onay e-postasını almadıysanız tekrar göndermek için 'Üye Ol' düğmesine basabilirsiniz.");
        } else {
            console.log("Giris basarili:", user.email);
            setEmail("");
            setPassword("");
            loadUserProfile(db, user.uid); // setIsUsernameMissing argümanı kaldırıldı
        }

    } catch (err) {
        // Hata yakalama bloğu. Firebase hatası veya kendi attığımız hata buraya düşer.
        let friendlyMessage = "Giriş başarısız oldu.";
        
        if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || 
            err.code === "auth/invalid-email" || err.code === "auth/invalid-credential") 
        {
            friendlyMessage = "Kullanıcı adı veya şifre hatalı.";
        } else if (err.code === "auth/network-request-failed") {
            friendlyMessage = "Internet bağlantısı sorunu.";
        } else if (err.message === "Kullanıcı adı veya şifre hatalı.") { 
             // Kendi fırlattığımız hatayı yakalarız
            friendlyMessage = err.message;
        } else {
            console.error("Beklenmeyen Giriş Hatası:", err);
            friendlyMessage = "Beklenmedik bir hata oluştu: " + (err.message || "Bilinmiyor.");
        }
        
        setError(friendlyMessage);
    } finally {
        setLoginLoading(false);
    }
};

// 8. Çıkış Yap (Logout) (Aynı kalır)
const logout = async (auth, setUser) => {
    try {
        await firebaseSignOut(auth); 
        setUser(null);
    } catch (err) {
        console.error("Cikis hatasi:", err);
    }
};

// Fonksiyonları Dışa Aktarma
export { 
    loadUserProfile, 
    updateUserByAdmin, 
    updateUserPasswordByAdmin, 
    deleteUserByAdmin,
    handleEditUserClick,
    register,
    login,
    logout,
    ADMIN_EMAIL
};