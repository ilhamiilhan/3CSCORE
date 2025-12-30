// src/App.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- BİLEŞEN IMPORTLARI ---
import LoginForm from './components/auth/LoginForm.jsx';
import RegisterForm from './components/auth/RegisterForm.jsx';
import LandingPage from './components/layout/LandingPage.jsx';
import Header from './components/layout/Header.jsx';
import Navbar from './components/layout/Navbar.jsx';

import ScoreForm from './components/score/ScoreForm.jsx';
import RecordList from './components/score/RecordList.jsx';
import StatisticsFilters from './components/ranking/StatisticsFilters.jsx';
import RankingList from './components/ranking/RankingList.jsx';
import WinRankingsList from './components/ranking/WinRankingsList.jsx';
import HighAvgGamesList from './components/ranking/HighAvgGamesList.jsx';
import HighSeriesRecordsList from './components/ranking/HighSeriesRecordsList.jsx';
import TotalScoreRankingsList from './components/ranking/TotalScoreRankingsList.jsx';

import Rewards from './components/rewards/Rewards.jsx';
import TournamentDashboard from './components/tournaments/TournamentDashboard.jsx';

import Pagination from './components/common/Pagination.jsx';
import EditGameModal from './components/common/EditGameModal.jsx';
import PlayerCard from './components/profile/PlayerCard.jsx';
import ProfileSettings from './components/profile/ProfileSettings.jsx';
import LegalPage from './components/layout/LegalPage.jsx';

// --- CONTEXTS & HOOKS ---
import { useAuth } from './contexts/AuthContext.jsx';
import useOnlineStatus from './hooks/useOnlineStatus.jsx';
import usePagination from './hooks/usePagination.jsx';

// --- SERVİSLER ---
import { login, register, logout, resetPassword } from './services/auth.service.jsx';
import {
    loadDataAndAverages, addRecord, deleteRecord,
    calculateStatistics,
    loadUserGames,
    updateRecord
} from './services/game.service.jsx';
import {
    loadUserProfile, loadAllUsers,
    getProfileByUsername,
    loadPlayersBasic,
    toggleUserRole
} from './services/user.service.jsx';
import { getNextMemberId } from './services/firebase.service.jsx';

// --- UTILS & CONSTANTS ---
import { ADMIN_EMAIL, CITIES_OF_TURKEY, TOURNAMENT_MANAGERS, SUPER_ADMINS } from './utils/constants.jsx';

// --- FIREBASE ---
import { auth, db } from './services/firebase/config.jsx';
import {
    GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider,
    signInWithPopup, getAdditionalUserInfo, updateProfile
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";

// Resim sıkıştırma kütüphanesi
import imageCompression from 'browser-image-compression';


function BilardoApp() {
    const { currentUser, loading: isAuthLoading } = useAuth();
    const user = currentUser;
    const isOnline = useOnlineStatus();

    // --- STATE TANIMLARI ---
    const [activeTab, setActiveTab] = useState(user ? "score" : "landing");
    const [legalPageType, setLegalPageType] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State

    const [records, setRecords] = useState([]);
    const [allRecords, setAllRecords] = useState([]);
    const [players, setPlayers] = useState([]);

    // Form State'leri
    const [player1, setPlayer1] = useState("");
    const [player2, setPlayer2] = useState("");
    const [score1, setScore1] = useState("");
    const [score2, setScore2] = useState("");
    const [shots, setShots] = useState("");
    const [eys1, setEYS1] = useState("");
    const [eys2, setEYS2] = useState("");

    // Auth State'leri
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState("");
    const [registerSuccessMessage, setRegisterSuccessMessage] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [city, setCity] = useState("");

    // İstatistik State'leri
    const [statsPeriod, setStatsPeriod] = useState("1w");
    const [activeStatTab, setActiveStatTab] = useState("average");
    const [averageRankings, setAverageRankings] = useState([]);
    const [winRankings, setWinRankings] = useState([]);
    const [highAvgGames, setHighAvgGames] = useState([]);
    const [highSeriesRecords, setHighSeriesRecords] = useState([]);
    const [totalScoreRankings, setTotalScoreRankings] = useState([]);
    const [playerAverages, setPlayerAverages] = useState({});

    // Profil Tamamlama State'leri
    const [editProfileUsername, setEditProfileUsername] = useState("");
    const [editProfileFullName, setEditProfileFullName] = useState("");
    const [editProfileCity, setEditProfileCity] = useState("");
    const [editProfileEmail, setEditProfileEmail] = useState("");
    const [completeProfileLoading, setCompleteProfileLoading] = useState(false);
    const [completeProfileError, setCompleteProfileError] = useState("");

    // Profil Görüntüleme State'leri
    const [profileUsername, setProfileUsername] = useState("");
    const [profileFullName, setProfileFullName] = useState("");
    const [profileCity, setProfileCity] = useState("");
    const [profileMemberId, setProfileMemberId] = useState(null);

    const [profileIsPrivate, setProfileIsPrivate] = useState(false);
    const [profileRole, setProfileRole] = useState("oyuncu");

    const [viewingUsername, setViewingUsername] = useState(null);
    const [viewedProfileData, setViewedProfileData] = useState(null);







    // Sync State changes to History (Push)


    const [viewedProfileError, setViewedProfileError] = useState("");
    const [viewedProfileLoading, setViewedProfileLoading] = useState(false);
    const [userGames, setUserGames] = useState([]);

    // Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [modalError, setModalError] = useState("");

    // Admin state
    const isAdmin = useMemo(() => user && user.email === ADMIN_EMAIL, [user]);
    const isSuperAdmin = useMemo(() => user && SUPER_ADMINS.includes(user.email), [user]);
    const isTournamentManager = useMemo(() => {
        if (!user) return false;
        if (isSuperAdmin) return true;
        if (TOURNAMENT_MANAGERS.includes(user.email)) return true;
        if (profileRole === 'moderator') return true;
        return false;
    }, [user, isSuperAdmin, profileRole]);

    // Pagination Hooks
    const { currentPage: recordsCurrentPage, setCurrentPage: setRecordsCurrentPage, totalPages: recordsTotalPages, paginatedData: paginatedRecords } = usePagination(records || []);
    const { currentPage: profileGamesCurrentPage, setCurrentPage: setProfileGamesCurrentPage, totalPages: profileGamesTotalPages, paginatedData: paginatedUserGames } = usePagination(userGames || []);

    // Auth Providers
    const googleProvider = useMemo(() => { const p = new GoogleAuthProvider(); p.addScope('email'); p.addScope('profile'); return p; }, []);
    const facebookProvider = useMemo(() => { const p = new FacebookAuthProvider(); p.addScope('email'); return p; }, []);
    const twitterProvider = useMemo(() => new TwitterAuthProvider(), []);


    // --- WRAPPER FUNCTIONS ---
    const wrapperLoadDataAndAverages = useCallback(() => { loadDataAndAverages(setRecords, setAllRecords, () => { }, setPlayerAverages, setLoading); }, []);
    const wrapperLoadPlayers = useCallback(async () => { try { const playersData = await loadPlayersBasic(); setPlayers(playersData); } catch (err) { console.error("Oyuncular yüklenemedi:", err); setPlayers([]); } }, []);
    const wrapperLogin = useCallback(async (e) => { e.preventDefault(); setLoginLoading(true); setError(""); try { await login(email, password, rememberMe); } catch (err) { setError(err.message || "Giriş başarısız."); } finally { setLoginLoading(false); } }, [email, password, rememberMe]);
    const wrapperRegister = useCallback(async (e) => { e.preventDefault(); setRegisterLoading(true); setError(null); setRegisterSuccessMessage(null); try { const response = await register(email, password, username, fullName, city, wrapperLoadDataAndAverages); if (response && response.success) { setRegisterSuccessMessage(response.message); setActiveTab("login"); setEmail(""); setPassword(""); setUsername(""); setFullName(""); setCity(""); } } catch (err) { setError(err.message); } finally { setRegisterLoading(false); } }, [email, password, username, fullName, city, wrapperLoadDataAndAverages]);
    const wrapperResetPassword = useCallback((e) => { e.preventDefault(); resetPassword(email, setResetPasswordLoading, setError, setResetPasswordSuccess); }, [email]);
    const wrapperLoadUserProfile = useCallback((uid) => { loadUserProfile(uid, setProfileUsername, setProfileFullName, setProfileCity, setProfileIsPrivate, setEditProfileUsername, setEditProfileFullName, setEditProfileCity, setEditProfileEmail, setProfileMemberId, setProfileRole); }, []);
    const wrapperAddRecord = useCallback((e) => { e.preventDefault(); const isUserInMatch = player1 === profileUsername || player2 === profileUsername; if (!isUserInMatch) { setError("⛔ Size ait olmayan bir maçı kaydedemezsiniz."); return; } addRecord(player1, score1, player2, score2, shots, eys1, eys2, setError, setScore1, setScore2, setShots, setEYS1, setEYS2, wrapperLoadDataAndAverages, setLoading); }, [player1, score1, player2, score2, shots, eys1, eys2, profileUsername, wrapperLoadDataAndAverages]);
    const wrapperDeleteRecord = useCallback((recordId) => { deleteRecord(recordId, wrapperLoadDataAndAverages); }, [wrapperLoadDataAndAverages]);
    const wrapperCompleteProfile = async (e) => { e.preventDefault(); setCompleteProfileLoading(true); setCompleteProfileError(""); if (!editProfileUsername || !editProfileCity) { setCompleteProfileError("Zorunlu alanlar eksik."); setCompleteProfileLoading(false); return; } try { const userRef = doc(db, "users", user.uid); const newUsernameLower = editProfileUsername.toLowerCase().trim(); await updateDoc(userRef, { username: newUsernameLower, city: editProfileCity, role: "oyuncu" }); wrapperLoadPlayers(); setProfileUsername(newUsernameLower); setProfileCity(editProfileCity); setEditProfileUsername(""); setEditProfileCity(""); } catch (err) { setCompleteProfileError("Hata: " + err.message); } finally { setCompleteProfileLoading(false); } };
    const wrapperCalculateStatistics = useCallback(() => { calculateStatistics(allRecords, players, statsPeriod, setAverageRankings, setWinRankings, setHighAvgGames, setHighSeriesRecords, setTotalScoreRankings); }, [allRecords, players, statsPeriod]);
    const wrapperLogout = useCallback(async () => { try { await logout(); setRecords([]); setAllRecords([]); setPlayers([]); setProfileUsername(""); setProfileFullName(""); setProfileCity(""); setActiveTab("landing"); } catch (err) { console.error(err); } }, []);
    const wrapperLoadUserGames = useCallback((username) => { loadUserGames(username, allRecords, setUserGames, setProfileGamesCurrentPage); }, [allRecords, setProfileGamesCurrentPage]);
    const wrapperLoadAllUsers = useCallback(() => { loadAllUsers(isAdmin, () => { }); }, [isAdmin]);
    const handleEditRecordClick = (record) => { setEditingRecord(record); setIsEditModalOpen(true); setModalError(""); };
    const handleCloseEditModal = () => { setIsEditModalOpen(false); setEditingRecord(null); };
    const wrapperUpdateRecord = async (updatedData) => { if (!editingRecord || !editingRecord.id) { setModalError("Hata."); return; } setModalError(""); try { await updateRecord(editingRecord.id, updatedData); handleCloseEditModal(); wrapperLoadDataAndAverages(); } catch (err) { setModalError("Hata: " + err.message); } };
    const handleProfileUpdateSuccessCallback = () => { wrapperLoadUserProfile(user.uid); };

    // ROL DEĞİŞTİRME WRAPPER
    const wrapperToggleUserRole = async (targetUid, targetEmail, currentRole) => {
        console.log("WRAPPER CALLED", { isSuperAdmin, targetUid, targetEmail, currentRole, currentUserUid: user?.uid });
        const newRole = await toggleUserRole(isSuperAdmin, targetUid, targetEmail, currentRole, (state) => { });
        // Eğer başarılıysa ve şu an görüntülenen profil o kişiyse, UI'ı güncelle
        if (newRole && viewedProfileData && viewedProfileData.uid === targetUid) {
            setViewedProfileData(prev => ({ ...prev, role: newRole }));
        }
    };

    const handleViewProfile = useCallback((usernameToView) => { if (!usernameToView) return; setViewingUsername(usernameToView.toLocaleLowerCase('tr-TR')); setActiveTab("profile"); }, []);
    const createUserProfileForSocialUser = async (user) => { const userRef = doc(db, "users", user.uid); let userEmail = user.email; if (!userEmail && user.providerData && user.providerData.length > 0) { userEmail = user.providerData[0].email; } const newMemberId = await getNextMemberId(userEmail); const userData = { uid: user.uid, email: userEmail || "E-posta Yok", memberId: newMemberId, displayName: user.displayName || "Yeni Oyuncu", username: "", fullName: user.displayName || "Yeni Oyuncu", city: "", role: "oyuncu", createdAt: serverTimestamp(), photoURL: user.photoURL || null, isProfilePrivate: false }; try { await setDoc(userRef, userData); wrapperLoadPlayers(); } catch (error) { console.error(error); } };
    const handleSocialSignIn = async (provider) => { setLoginLoading(true); setError(""); setRegisterSuccessMessage(""); setResetPasswordSuccess(""); try { const result = await signInWithPopup(auth, provider); const user = result.user; const additionalInfo = getAdditionalUserInfo(result); if (additionalInfo.isNewUser) { await createUserProfileForSocialUser(user); } } catch (error) { setError(error.message); } finally { setLoginLoading(false); } };

    // --- PROFİL FOTOĞRAFI YÜKLEME (GÜNCELLENMİŞ VERSİYON) ---
    const handleProfilePhotoUpload = async (file) => {
        if (!user) return;
        try {
            console.log("Fotoğraf işleniyor ve sıkıştırılıyor...");
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true, fileType: "image/jpeg" };
            const compressedFile = await imageCompression(file, options);
            let oldPhotoURL = null;
            if (viewedProfileData && viewedProfileData.photoURL) { oldPhotoURL = viewedProfileData.photoURL; }
            else if (user.photoURL) { oldPhotoURL = user.photoURL; }
            const formData = new FormData();
            formData.append('file', compressedFile, "profile.jpg");
            if (oldPhotoURL) { formData.append('oldImageUrl', oldPhotoURL); }
            const uploadUrl = 'https://www.3cscore.com/upload.php';
            const response = await fetch(uploadUrl, { method: 'POST', body: formData });
            const data = await response.json();
            if (!data.success) { throw new Error(data.message || "Yükleme başarısız"); }
            const newPhotoURL = data.url;
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, { photoURL: newPhotoURL });
            await updateProfile(user, { photoURL: newPhotoURL });
            await user.reload();
            if (viewedProfileData && viewedProfileData.uid === user.uid) { setViewedProfileData(prev => ({ ...prev, photoURL: newPhotoURL })); }
            alert("Profil fotoğrafınız başarıyla güncellendi!");
        } catch (error) {
            console.error("Fotoğraf yükleme hatası:", error);
            alert("Hata: " + error.message);
        }
    };


    // --- EFFECTS ---

    // --- HISTORY / BACK BUTTON HANDLING ---
    const isPoppingHistory = React.useRef(false);

    useEffect(() => {
        // Initial state replacement
        window.history.replaceState({ tab: activeTab, menuOpen: isMobileMenuOpen, modalOpen: isEditModalOpen }, "");

        const handlePopState = (event) => {
            isPoppingHistory.current = true;
            const state = event.state;

            console.log("POPSTATE Detected:", state);

            if (state) {
                // Restore Tab
                if (state.tab && state.tab !== activeTab) {
                    setActiveTab(state.tab);
                }

                // Restore Mobile Menu State
                // !!state.menuOpen converts undefined/null to false, which is what we want on back
                setIsMobileMenuOpen(!!state.menuOpen);

                // Restore Modal State
                setIsEditModalOpen(!!state.modalOpen);
                if (!state.modalOpen) {
                    setEditingRecord(null); // Clean up if closing
                }

                // Close Legal Page if open and not in state (assuming legal page is transient)
                setLegalPageType(null);
            } else {
                // Default fallback if state is lost
                setIsMobileMenuOpen(false);
                setIsEditModalOpen(false);
                // setActiveTab("landing"); // Optional: forceful reset
            }

            // Reset flag after render cycle
            setTimeout(() => {
                isPoppingHistory.current = false;
            }, 50);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []); // Run once on mount to bind listener

    // Sync State changes to History (Push)
    useEffect(() => {
        if (isPoppingHistory.current) return;

        // Debounce or just push? 
        // React batches updates, so this should run once per "action".
        // We push state representing the CURRENT UI.
        const currentState = {
            tab: activeTab,
            menuOpen: isMobileMenuOpen,
            modalOpen: isEditModalOpen
        };

        console.log("Pushing History State:", currentState);
        window.history.pushState(currentState, "");

    }, [activeTab, isMobileMenuOpen, isEditModalOpen]);

    useEffect(() => { if (user) { wrapperLoadUserProfile(user.uid); wrapperLoadDataAndAverages(); wrapperLoadPlayers(); if (isAdmin) wrapperLoadAllUsers(); if (registerSuccessMessage) setRegisterSuccessMessage(""); } else { setProfileUsername(""); setProfileFullName(""); setProfileCity(""); setProfileMemberId(null); setRecords([]); setAllRecords([]); setPlayers([]); setPlayerAverages({}); setProfileIsPrivate(false); setViewedProfileData(null); setViewingUsername(null); setViewedProfileError(""); setEditProfileEmail(""); if (!["login", "register", "reset", "landing"].includes(activeTab)) setActiveTab("landing"); } }, [user, isAdmin, wrapperLoadDataAndAverages, wrapperLoadUserProfile, wrapperLoadAllUsers, registerSuccessMessage, wrapperLoadPlayers]);
    useEffect(() => { if (!user || !profileFullName) { if (!user && !["login", "register", "reset", "landing"].includes(activeTab)) setActiveTab("landing"); return; } if (isAdmin) { if (["login", "register", "reset", "landing", "completeProfile"].includes(activeTab)) setActiveTab("score"); return; } const isProfileIncomplete = (profileFullName === "Yeni Oyuncu" || profileFullName === "" || profileCity === "" || profileUsername === ""); if (isProfileIncomplete) { setActiveTab("completeProfile"); } else { if (["login", "register", "reset", "landing", "completeProfile"].includes(activeTab)) setActiveTab("score"); } }, [user, isAdmin, profileUsername, profileFullName, profileCity, activeTab]);
    useEffect(() => { if (allRecords.length > 0 && players.length > 0) { wrapperCalculateStatistics(); } }, [allRecords, players, statsPeriod, wrapperCalculateStatistics]);
    useEffect(() => { if (activeTab === "profile" && !viewingUsername && profileUsername) handleViewProfile(profileUsername); }, [activeTab, viewingUsername, profileUsername, handleViewProfile]);
    useEffect(() => { if (!viewingUsername || !user) { if (isAdmin) { setViewedProfileData(null); setUserGames([]); setViewedProfileError(""); } return; } const loadProfile = async () => { setViewedProfileLoading(true); setViewedProfileError(""); setUserGames([]); setProfileGamesCurrentPage(1); try { let profileData; const ownUsernameLower = profileUsername.toLocaleLowerCase('tr-TR'); if (viewingUsername === ownUsernameLower) { profileData = { username: profileUsername, fullName: profileFullName, city: profileCity, email: user.email, uid: user.uid, isProfilePrivate: profileIsPrivate, memberId: profileMemberId, photoURL: user.photoURL }; setViewedProfileData(profileData); wrapperLoadUserGames(profileUsername); } else { profileData = await getProfileByUsername(viewingUsername); setViewedProfileData(profileData); if (profileData.isProfilePrivate) setViewedProfileError("Bu kullanıcının profili gizlidir."); else wrapperLoadUserGames(viewingUsername); } } catch (err) { console.error(err); setViewedProfileError("Hata."); setViewedProfileData(null); } finally { setViewedProfileLoading(false); } }; if (activeTab === "profile") loadProfile(); }, [viewingUsername, activeTab, user, profileUsername, profileFullName, profileCity, profileIsPrivate, wrapperLoadUserGames, profileMemberId, setProfileGamesCurrentPage, isAdmin]);


    // --- RENDER STRATEJİSİ ---

    if (isAuthLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4"><div className="text-2xl font-bold text-gray-700">Yükleniyor...</div></div>;

    // 1. Yasal Sayfalar
    if (legalPageType) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header isOnline={isOnline} username={null} onLoginClick={() => { setLegalPageType(null); setActiveTab("login"); }} setActiveTab={setActiveTab} containerClasses="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />
                <LegalPage type={legalPageType} onBack={() => setLegalPageType(null)} />
            </div>
        );
    }

    // Ana İçerik Seçimi
    const renderMainContent = () => {
        if (!user) {
            // Landing Page
            if (activeTab === "landing") {
                return (
                    <LandingPage
                        setActiveTab={setActiveTab}
                        onGoogleSignIn={() => handleSocialSignIn(googleProvider)}
                        onFacebookSignIn={() => handleSocialSignIn(facebookProvider)}
                        onTwitterSignIn={() => handleSocialSignIn(twitterProvider)}
                        onOpenLegal={(type) => setLegalPageType(type)}
                    />
                );
            }
            // Giriş Formları
            return (
                <div className="flex items-center justify-center p-4 mt-10">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md space-y-4 border border-gray-100">
                        <h1 className="text-4xl font-extrabold text-center tracking-wider mb-6">
                            <span className="text-red-600 mr-2">3C</span><span className="text-blue-600">SCORE</span>
                        </h1>

                        <div className="flex gap-2 mb-4">
                            <button onClick={() => { setActiveTab("login"); setError(""); setRegisterSuccessMessage(""); setResetPasswordSuccess(""); }} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === "login" || activeTab === "reset" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Giriş Yap</button>
                            <button onClick={() => { setActiveTab("register"); setError(""); setRegisterSuccessMessage(""); setResetPasswordSuccess(""); setUsername(""); setFullName(""); setCity(""); setEmail(""); setPassword(""); }} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === "register" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Kayıt Ol</button>
                        </div>

                        {activeTab === "login" && registerSuccessMessage && <div className="p-3 bg-green-100 text-green-800 rounded text-sm font-medium">{registerSuccessMessage}</div>}
                        {activeTab === "reset" && (
                            <div className="space-y-4 pt-2">
                                <h2 className="text-xl font-semibold text-center text-gray-700">Şifremi Unuttum</h2>
                                {resetPasswordSuccess ? <div className="p-3 bg-green-100 text-green-800 rounded text-sm">{resetPasswordSuccess}</div> : <form onSubmit={wrapperResetPassword} className="space-y-4"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required />{error && <div className="p-3 bg-red-100 text-red-800 rounded text-sm">{error}</div>}<button type="submit" disabled={resetPasswordLoading} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">{resetPasswordLoading ? "..." : "Gönder"}</button></form>}
                                <button onClick={() => { setActiveTab("login"); setResetPasswordSuccess(""); setError(""); setEmail(""); }} className="w-full text-sm text-gray-500 hover:text-blue-600 text-center pt-2">Geri dön</button>
                            </div>
                        )}
                        {activeTab === "login" && <LoginForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} rememberMe={rememberMe} setRememberMe={setRememberMe} error={error} loading={loginLoading} onSubmit={wrapperLogin} onForgotPasswordClick={() => { setActiveTab("reset"); setError(""); setRegisterSuccessMessage(""); setResetPasswordSuccess(""); }} />}
                        {activeTab === "register" && <RegisterForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} username={username} setUsername={setUsername} fullName={fullName} setFullName={setFullName} city={city} setCity={setCity} cities={CITIES_OF_TURKEY} error={error} loading={registerLoading} onSubmit={wrapperRegister} />}
                    </div>
                </div>
            );
        }

        // Profil Tamamlama
        if (activeTab === "completeProfile") {
            return (
                <div className="flex items-center justify-center p-4 mt-10">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md space-y-4">
                        <h1 className="text-2xl font-bold text-center text-gray-800">Profilinizi Tamamlayın</h1>
                        <form onSubmit={wrapperCompleteProfile} className="space-y-4">
                            <input type="email" value={editProfileEmail} disabled className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-100" />
                            <input type="text" value={editProfileFullName} onChange={(e) => setEditProfileFullName(e.target.value)} placeholder="Ad Soyad" disabled className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-100" required />
                            <input type="text" value={editProfileUsername} onChange={(e) => setEditProfileUsername(e.target.value)} placeholder="Kullanıcı Adı" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" required />
                            <select value={editProfileCity} onChange={(e) => setEditProfileCity(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl" required><option value="">Şehir Seçin</option>{CITIES_OF_TURKEY.map(c => <option key={c} value={c}>{c}</option>)}</select>
                            {completeProfileError && <div className="p-3 bg-red-100 text-red-800 rounded text-sm">{completeProfileError}</div>}
                            <button type="submit" disabled={completeProfileLoading} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">{completeProfileLoading ? "Kaydediliyor..." : "Kaydet"}</button>
                        </form>
                    </div>
                </div>
            );
        }

        // DASHBOARD İÇERİĞİ
        return (
            <div className="w-full max-w-6xl mx-auto shadow-xl bg-white mt-0 sm:mt-4 rounded-none sm:rounded-xl overflow-hidden">
                {/* MENÜ - Navbar global olarak yukarıda render ediliyor */}

                <div className="w-full pb-4 px-3 sm:px-6">

                    {/* 1. SKOR KAYDET */}
                    {activeTab === "score" && (
                        <div className="w-full space-y-4 pt-4">
                            <ScoreForm players={players} player1={player1} setPlayer1={setPlayer1} player2={player2} setPlayer2={setPlayer2} score1={score1} setScore1={setScore1} score2={score2} setScore2={setScore2} shots={shots} setShots={setShots} eys1={eys1} setEYS1={setEYS1} eys2={eys2} setEYS2={setEYS2} error={error} loading={loading} onSubmit={wrapperAddRecord} />
                            <RecordList records={paginatedRecords} onUsernameClick={handleViewProfile} onDelete={wrapperDeleteRecord} onEditClick={handleEditRecordClick} isAdmin={isAdmin} currentUserUsername={profileUsername} players={players} />
                            <div className="px-2 sm:px-4"><Pagination currentPage={recordsCurrentPage} totalPages={recordsTotalPages} onPageChange={setRecordsCurrentPage} /></div>
                        </div>
                    )}

                    {/* 2. İSTATİSTİKLER */}
                    {activeTab === "statistics" && (
                        <div className="w-full bg-white shadow-lg space-y-4 py-6 px-3 sm:px-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">📊 İstatistikler</h2>
                            <StatisticsFilters statsPeriod={statsPeriod} setStatsPeriod={setStatsPeriod} activeStatTab={activeStatTab} setActiveStatTab={setActiveStatTab} />
                            {activeStatTab === "average" && (<RankingList rankings={averageRankings} onUsernameClick={handleViewProfile} players={players} />)}
                            {activeStatTab === "totalScore" && (<TotalScoreRankingsList rankings={totalScoreRankings} onUsernameClick={handleViewProfile} players={players} />)}
                            {activeStatTab === "wins" && (<WinRankingsList rankings={winRankings} onUsernameClick={handleViewProfile} players={players} />)}
                            {activeStatTab === "highAvg" && (<HighAvgGamesList rankings={highAvgGames} onUsernameClick={handleViewProfile} players={players} />)}
                            {activeStatTab === "highSeries" && (<HighSeriesRecordsList rankings={highSeriesRecords} onUsernameClick={handleViewProfile} players={players} />)}
                        </div>
                    )}

                    {/* 3. ÖDÜLLER */}
                    {activeTab === "rewards" && (
                        <div className="w-full space-y-4 pt-4">
                            <Rewards matches={allRecords} onProfileClick={handleViewProfile} players={players} />
                        </div>
                    )}

                    {/* 4. TURNUVALAR */}
                    {activeTab === "tournaments" && (
                        <div className="w-full space-y-4 pt-4">
                            <TournamentDashboard user={user} isManager={isTournamentManager} />
                        </div>
                    )}

                    {/* 4. OYUNCU KARTI */}
                    {activeTab === "profile" && (
                        <div className="w-full py-6 px-3 sm:px-6">
                            {viewedProfileLoading && <div className="text-center p-10"><p className="text-lg font-semibold text-gray-600">Profil yükleniyor...</p></div>}
                            {!viewedProfileLoading && viewedProfileError && <div className="text-center p-10"><p className="text-lg font-semibold text-red-600">⚠️ {viewedProfileError}</p></div>}
                            {!viewedProfileLoading && !viewedProfileError && viewedProfileData && (
                                <>
                                    <PlayerCard
                                        profileData={viewedProfileData}
                                        games={paginatedUserGames}
                                        allMatchesContext={allRecords}
                                        players={players}
                                        onUsernameClick={handleViewProfile}
                                        isOwnProfile={viewedProfileData.uid === user.uid}
                                        onPhotoUpload={handleProfilePhotoUpload}
                                        stats={{
                                            generalAvg: (userGames.length > 0 && userGames.reduce((acc, g) => acc + parseInt(g.shots), 0) > 0) ? (userGames.reduce((acc, g) => acc + (g.player1 === viewedProfileData.username ? parseInt(g.score1) : parseInt(g.score2)), 0) / userGames.reduce((acc, g) => acc + parseInt(g.shots), 0)).toFixed(3) : "0.000",
                                            eys: Math.max(...userGames.map(g => g.player1 === viewedProfileData.username ? parseInt(g.eys1 || 0) : parseInt(g.eys2 || 0)), 0),
                                            totalGames: userGames.length,
                                            winRate: userGames.length > 0 ? Math.round((userGames.filter(g => (g.player1 === viewedProfileData.username && g.score1 > g.score2) || (g.player2 === viewedProfileData.username && g.score2 > g.score1)).length / userGames.length) * 100) : 0
                                        }}
                                        isSuperAdmin={isSuperAdmin}
                                        onGenericAction={wrapperToggleUserRole}
                                    />

                                    <div className="mt-4"><Pagination currentPage={profileGamesCurrentPage} totalPages={profileGamesTotalPages} onPageChange={setProfileGamesCurrentPage} /></div>
                                </>
                            )}
                        </div>
                    )}

                    {/* AYARLAR */}
                    {activeTab === "settings" && (
                        <div className="w-full py-6 px-3 sm:px-6">
                            <ProfileSettings user={user} profileData={{ username: profileUsername, isProfilePrivate: profileIsPrivate }} onUpdateSuccess={handleProfileUpdateSuccessCallback} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <EditGameModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} record={editingRecord} onSubmit={wrapperUpdateRecord} />

            <Header
                isOnline={isOnline}
                username={profileUsername}
                fullName={profileFullName}
                city={profileCity}
                memberId={profileMemberId}
                wrapperLogout={wrapperLogout}
                setActiveTab={setActiveTab}
                onLoginClick={() => { setLegalPageType(null); setActiveTab("login"); }}
                onProfileClick={() => { if (profileUsername) handleViewProfile(profileUsername); }}
                containerClasses="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* YENİ NAVBAR - Header'ın hemen altında */}
            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                username={profileUsername}
                onLoginClick={() => { setLegalPageType(null); setActiveTab("login"); }}
                onProfileClick={() => { if (profileUsername) handleViewProfile(profileUsername); }}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {renderMainContent()}
        </div>
    );
}

export default BilardoApp;