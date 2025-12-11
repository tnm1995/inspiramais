
import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { UserDataProvider, useUserData } from './context/UserDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OnboardingFlow, OnboardingStep } from './components/onboarding/OnboardingFlow'; // Import Enum
import { Quote, DailyMotivation, UserStats } from './types';
import { UserCircleIcon, CheckIcon, WarningIcon, FilterIcon, SunnyIcon, TrophyIcon, FlameIcon, CrownIcon, LogoutIcon } from './components/Icons';
import { SharePage } from './components/main/SharePage';
import { QuotaExceededError, generateQuotesFromAI, generateDailyMotivation, fallbackQuotes } from './services/aiService';
import { MoodCheckinScreen } from './components/main/MoodCheckinScreen';
import { QuoteFeed } from './components/main/QuoteFeed';
import { LoginScreen } from './components/auth/screens/LoginScreen';
import { LoginFormData, SignupFormData } from './types';
import { TermsScreen } from './components/legal/TermsScreen';
import { PrivacyScreen } from './components/legal/PrivacyScreen';
import { AdminPanel } from './components/admin/AdminPanel';
import { SubscriptionExpiredScreen } from './components/main/SubscriptionExpiredScreen';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import firebase from 'firebase/compat/app';
import { GoogleCpfScreen } from './components/auth/screens/GoogleCpfScreen';


// Lazy load components
const FilterModal = lazy(() => import('./components/main/FilterModal').then(module => ({ default: module.FilterModal })));
const ExploreModal = lazy(() => import('./components/main/ExploreModal').then(module => ({ default: module.ExploreModal })));
const DailyMotivationScreen = lazy(() => import('./components/main/DailyMotivationScreen').then(module => ({ default: module.DailyMotivationScreen })));
const ProfileScreen = lazy(() => import('./components/main/ProfileScreen').then(module => ({ default: module.ProfileScreen })));
const PremiumCheckoutScreen = lazy(() => import('./components/main/PremiumCheckoutScreen').then(module => ({ default: module.PremiumCheckoutScreen })));
const ShareModal = lazy(() => import('./components/main/ShareModal').then(module => ({ default: module.ShareModal })));
const GamificationModal = lazy(() => import('./components/gamification/GamificationModal').then(module => ({ default: module.GamificationModal })));
const LevelUpModal = lazy(() => import('./components/gamification/LevelUpModal').then(module => ({ default: module.LevelUpModal })));

type ToastMessage = {
    message: string;
    type: 'success' | 'error';
}

const triggerHapticFeedback = (pattern: number | number[] = 30) => {
    if (typeof window !== 'undefined' && window.navigator && 'vibrate' in window.navigator) {
        try {
            window.navigator.vibrate(pattern);
        } catch (error) {
            console.warn("Haptic feedback is not supported or failed.", error);
        }
    }
};

// Route Constants
const ROUTES = {
    HOME: '/home',
    PROFILE: '/profile',
    DAILY_MOTIVATION: '/daily-motivation',
    GAMIFICATION: '/gamification',
    PREMIUM: '/premium',
    FILTER: '/filter',
    LANDING: '/ladingpage',
    LOGIN: '/login',
    SIGNUP: '/cadastro',
    EXPLORE: '/explore',
    SHARE: '/share',
    ADMIN: '/admin',
    MOOD_CHECKIN: '/mood-checkin'
};

const AppContent = () => {
    const { userData, updateUserData, loading: isUserDataLoading, completeQuest, initializeUser } = useUserData();
    const { login, signup, loginWithGoogle, resetPassword, logout, isAuthenticated, isLoading: isAuthLoading, authError } = useAuth();
    const [needsMoodCheckin, setNeedsMoodCheckin] = useState(false);
    
    // Login Flow State
    const [showLogin, setShowLogin] = useState(false);
    const [loginInitialTab, setLoginInitialTab] = useState<'login' | 'signup'>('login');
    const [authAction, setAuthAction] = useState<'login' | 'signup' | null>(null);
    const [tempSignupData, setTempSignupData] = useState<SignupFormData | null>(null);
    
    // Google Auth Pending State (waiting for CPF)
    const [pendingGoogleUser, setPendingGoogleUser] = useState<firebase.User | null>(null);
    
    // Legal Screens State
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    
    // Admin State
    const [showAdmin, setShowAdmin] = useState(false);

    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showProfile, setShowProfile] = useState(false);
    const [isProfileClosing, setIsProfileClosing] = useState(false);
    const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isFilterClosing, setIsFilterClosing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [likedQuoteId, setLikedQuoteId] = useState<string | null>(null);
    const [exploringQuote, setExploringQuote] = useState<Quote | null>(null);
    const [isExploreClosing, setIsExploreClosing] = useState(false);
    const [isApiRateLimited, setIsApiRateLimited] = useState(false);
    
    // Daily Motivation States
    const [dailyMotivation, setDailyMotivation] = useState<DailyMotivation | null>(null);
    const [isDailyMotivationLoading, setIsDailyMotivationLoading] = useState(true);
    const [showDailyMotivation, setShowDailyMotivation] = useState(false);
    const [isDailyMotivationClosing, setIsDailyMotivationClosing] = useState(false);
    
    const [showPremiumCheckout, setShowPremiumCheckout] = useState(false);
    const [isPremiumCheckoutClosing, setIsPremiumCheckoutClosing] = useState(false);

    const [showShareModal, setShowShareModal] = useState(false);
    const [isShareModalClosing, setIsShareModalClosing] = useState(false);
    const [quoteForShareModal, setQuoteForShareModal] = useState<Quote | null>(null);
    
    // Gamification States
    const [showGamification, setShowGamification] = useState(false);
    const [isGamificationClosing, setIsGamificationClosing] = useState(false);
    const [levelUpData, setLevelUpData] = useState<number | null>(null);
    const [isLevelUpClosing, setIsLevelUpClosing] = useState(false);

    // --- ROUTING HELPER FUNCTIONS ---

    const safePushRoute = useCallback((route: string) => {
        if (window.location.href.includes('blob:')) return;
        try {
            window.history.pushState({}, '', route);
        } catch (e) {
            // Silently ignore
        }
    }, []);

    const safeGoBack = useCallback(() => {
        if (window.location.href.includes('blob:')) {
            // In preview mode, we can't rely on history.back() working as expected or it might exit the app frame
            // Return false to indicate the caller should handle closing manually
            return false;
        }
        try {
            window.history.back();
            return true;
        } catch (e) {
            return false;
        }
    }, []);

    // --- NAVIGATION HANDLERS (Open Modals) ---

    const handleOpenProfile = () => {
        safePushRoute(ROUTES.PROFILE);
        setShowProfile(true);
    };

    const handleOpenDailyMotivation = () => {
        safePushRoute(ROUTES.DAILY_MOTIVATION);
        setShowDailyMotivation(true);
    };

    const handleOpenGamification = () => {
        safePushRoute(ROUTES.GAMIFICATION);
        setShowGamification(true);
    };

    const handleOpenFilter = () => {
        safePushRoute(ROUTES.FILTER);
        setShowFilterModal(true);
    };

    const handleTriggerPremium = () => {
        safePushRoute(ROUTES.PREMIUM);
        setShowPremiumCheckout(true);
    };

    const handleOpenAdmin = () => {
        safePushRoute(ROUTES.ADMIN);
        setShowAdmin(true);
    };

    // --- CLOSE HANDLERS (Triggered by UI Buttons) ---
    // Note: These mostly call safeGoBack(). The actual state change happens in the popstate listener
    // to ensure sync with browser back button. If safeGoBack returns false (preview mode), we close manually.

    const handleHideProfile = useCallback(() => {
        if (!safeGoBack()) {
            setIsProfileClosing(true);
            setTimeout(() => { setShowProfile(false); setIsProfileClosing(false); }, 500);
        }
    }, [safeGoBack]);

    const handleHideDailyMotivation = useCallback(() => {
        if (!safeGoBack()) {
            setIsDailyMotivationClosing(true);
            setTimeout(() => { setShowDailyMotivation(false); setIsDailyMotivationClosing(false); }, 500);
        }
    }, [safeGoBack]);

    const handleHideGamification = useCallback(() => {
        if (!safeGoBack()) {
            setIsGamificationClosing(true);
            setTimeout(() => { setShowGamification(false); setIsGamificationClosing(false); }, 500);
        }
    }, [safeGoBack]);

    const handleHideFilter = useCallback(() => {
        if (!safeGoBack()) {
            setIsFilterClosing(true);
            setTimeout(() => { setShowFilterModal(false); setIsFilterClosing(false); }, 500);
        }
    }, [safeGoBack]);

    const handleHidePremiumCheckout = useCallback(() => {
        if (!safeGoBack()) {
            setIsPremiumCheckoutClosing(true);
            setTimeout(() => { setShowPremiumCheckout(false); setIsPremiumCheckoutClosing(false); }, 500);
        }
    }, [safeGoBack]);

    const handleHideAdmin = useCallback(() => {
         if (!safeGoBack()) {
            setShowAdmin(false);
         }
    }, [safeGoBack]);

    // Initial Route Handling and Popstate Listener
    useEffect(() => {
        const handleRoute = () => {
            const path = window.location.pathname;
            
            // Login Logic
            if (path === ROUTES.LOGIN) {
                setLoginInitialTab('login');
                setShowLogin(true);
            } else if (path === ROUTES.SIGNUP) {
                setLoginInitialTab('signup');
                setShowLogin(true);
            } else if (path === ROUTES.LANDING) {
                setShowLogin(false);
            } 
            
            // Modal Logic - Close modals if not on their route
            // PROFILE
            if (path === ROUTES.PROFILE) {
                if (!showProfile) setShowProfile(true);
            } else if (showProfile) {
                setIsProfileClosing(true);
                setTimeout(() => { setShowProfile(false); setIsProfileClosing(false); }, 500);
            }

            // DAILY MOTIVATION
            if (path === ROUTES.DAILY_MOTIVATION) {
                if (!showDailyMotivation) setShowDailyMotivation(true);
            } else if (showDailyMotivation) {
                setIsDailyMotivationClosing(true);
                setTimeout(() => { setShowDailyMotivation(false); setIsDailyMotivationClosing(false); }, 500);
            }

            // GAMIFICATION
            if (path === ROUTES.GAMIFICATION) {
                if (!showGamification) setShowGamification(true);
            } else if (showGamification) {
                setIsGamificationClosing(true);
                setTimeout(() => { setShowGamification(false); setIsGamificationClosing(false); }, 500);
            }

             // FILTER
             if (path === ROUTES.FILTER) {
                if (!showFilterModal) setShowFilterModal(true);
            } else if (showFilterModal) {
                setIsFilterClosing(true);
                setTimeout(() => { setShowFilterModal(false); setIsFilterClosing(false); }, 500);
            }

            // PREMIUM
            if (path === ROUTES.PREMIUM) {
                if (!showPremiumCheckout) setShowPremiumCheckout(true);
            } else if (showPremiumCheckout) {
                setIsPremiumCheckoutClosing(true);
                setTimeout(() => { setShowPremiumCheckout(false); setIsPremiumCheckoutClosing(false); }, 500);
            }

            // ADMIN
            if (path === ROUTES.ADMIN) {
                if (!showAdmin) setShowAdmin(true);
            } else if (showAdmin) {
                setShowAdmin(false);
            }

            // MOOD CHECKIN
            if (path === ROUTES.MOOD_CHECKIN) {
                if (!needsMoodCheckin) setNeedsMoodCheckin(true);
            }
        };

        // Initial check
        // We only check modal routes if user is authenticated to avoid popping up stuff on landing
        if (isAuthenticated && userData) {
             handleRoute();
        } else if (!isAuthenticated) {
            // Handle Login/Signup/Landing routes
            handleRoute();
        }

        window.addEventListener('popstate', handleRoute);
        return () => window.removeEventListener('popstate', handleRoute);
    }, [
        isAuthenticated, 
        userData, 
        showProfile, 
        showDailyMotivation, 
        showGamification, 
        showFilterModal, 
        showPremiumCheckout,
        showLogin,
        showAdmin,
        needsMoodCheckin
    ]);

    // Derived State
    const isOnboarded = !!userData?.onboardingComplete;
    const isAdmin = !!userData?.isAdmin;
    
    // Strict Access Control Check
    const hasActiveAccess = useMemo(() => {
        // Admins always have access
        if (isAdmin) return true;
        
        if (!userData) return false;
        
        // 1. Must be marked as Premium
        if (!userData.isPremium) return false;

        // 2. If there is an expiry date, it must be in the future
        if (userData.subscriptionExpiry) {
            const expiryDate = new Date(userData.subscriptionExpiry);
            const now = new Date();
            if (now > expiryDate) return false;
        }

        return true;
    }, [userData, isAdmin]);

    const isSharePage = useMemo(() => new URLSearchParams(window.location.search).get('share') === 'true', []);

    // Handle Authentication Errors and Feedback
    useEffect(() => {
        if (authError) {
             setToastMessage({ message: authError, type: 'error' });
        }
    }, [authError]);

    // Handle Post-Auth Data Initialization (Specific for Signup flow that needs initialization)
    useEffect(() => {
        if (authAction === 'signup' && isAuthenticated && tempSignupData && !isUserDataLoading) {
            initializeUser({
                name: tempSignupData.name,
                onboardingComplete: false,
                cpf: tempSignupData.cpf,
            }).then(() => {
                setToastMessage({ message: `Conta criada!`, type: 'success' });
                setAuthAction(null);
                setTempSignupData(null);
                setShowLogin(false);
            });
        }
    }, [authAction, isAuthenticated, isUserDataLoading, tempSignupData, initializeUser]);

    // CENTRALIZED AUTH STATE SYNCHRONIZATION
    // This effect ensures that if the user is authenticated and data is ready,
    // they are NOT stuck on the login screen or landing page route.
    useEffect(() => {
        const isFullyAuthorized = isAuthenticated && userData && !isUserDataLoading && !pendingGoogleUser;

        if (isFullyAuthorized) {
            // 1. Force close login modal if open
            if (showLogin) {
                setShowLogin(false);
                
                // Show welcome message if coming from login action
                if (authAction === 'login') {
                    setToastMessage({ message: `Bem-vinda de volta!`, type: 'success' });
                    setAuthAction(null);
                }
            }

            // 2. Fix Route if stuck on guest pages
            const path = window.location.pathname;
            if (path === ROUTES.LOGIN || path === ROUTES.SIGNUP || path === ROUTES.LANDING) {
                safePushRoute(ROUTES.HOME);
            }
        }
    }, [isAuthenticated, userData, isUserDataLoading, pendingGoogleUser, showLogin, authAction, safePushRoute]);

    // Fetch Daily Motivation (Restored)
    useEffect(() => {
        const fetchMotivation = async () => {
            const todayStr = new Date().toISOString().split('T')[0];
            const cacheKey = `dailyMotivation-${todayStr}`;
            try {
                const cachedData = localStorage.getItem(cacheKey);
                if (cachedData) {
                    setDailyMotivation(JSON.parse(cachedData));
                } else {
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('dailyMotivation-')) {
                            localStorage.removeItem(key);
                        }
                    });
                    const result = await generateDailyMotivation();
                    if (result) {
                        setDailyMotivation(result);
                        localStorage.setItem(cacheKey, JSON.stringify(result));
                    }
                }
            } catch (error) {
                console.error("Error generating daily motivation:", error);
                const fallbackMotivation = {
                    text: "A persistência realiza o impossível.",
                    author: "Provérbio Chinês",
                    category: "Persistência",
                    imageUrl: ""
                };

                if (error instanceof QuotaExceededError) {
                    setToastMessage({ message: 'Cota de geração diária excedida.', type: 'error' });
                } else {
                    setToastMessage({ message: 'Falha ao carregar motivação diária. Exibindo uma alternativa.', type: 'error' });
                }
                setDailyMotivation(fallbackMotivation);
            } finally {
                setIsDailyMotivationLoading(false);
            }
        };
        fetchMotivation();
    }, []);

    const checkLevelUp = (result: { leveledUp: boolean; newLevel: number } | null) => {
        if (result && result.leveledUp) {
            setLevelUpData(result.newLevel);
            triggerHapticFeedback([50, 50, 50]);
        }
    };

    const fetchQuotes = useCallback(async () => {
        if (!userData || isApiRateLimited) return;
        
        const isInitial = quotes.length === 0;
        if (isInitial) setIsLoading(true);
        
        try {
            const newQuotes = await generateQuotesFromAI(userData, quotes, isInitial, activeFilter);
            setQuotes(prev => {
                const existingTexts = new Set(prev.map(q => q.text));
                const newUniqueQuotes = newQuotes.filter(q => !existingTexts.has(q.text));
                return [...prev, ...newUniqueQuotes];
            });
            
            if (isInitial) {
                setTimeout(async () => {
                    const moreQuotes = await generateQuotesFromAI(userData, newQuotes, false, activeFilter);
                     setQuotes(prev => {
                        const existingTexts = new Set(prev.map(q => q.text));
                        const unique = moreQuotes.filter(q => !existingTexts.has(q.text));
                        return [...prev, ...unique];
                    });
                }, 1000);
            }

        } catch (error) {
            console.error("Error generating quotes:", error);
            if (error instanceof QuotaExceededError) {
                setIsApiRateLimited(true);
                setToastMessage({ message: 'Limite de uso diário da IA atingido. Tente novamente amanhã.', type: 'error' });
                if (isInitial) {
                    setQuotes(fallbackQuotes);
                }
                setTimeout(() => setIsApiRateLimited(false), 60000);
            } else {
                setToastMessage({ message: 'Falha ao buscar citações. Tente novamente.', type: 'error' });
                 if (isInitial) {
                    setQuotes(fallbackQuotes);
                }
            }
        } finally {
            setIsLoading(false);
        }
    }, [userData, quotes, activeFilter, isApiRateLimited]);

    const refreshQuotes = useCallback(async () => {
        if (!userData || isApiRateLimited) return;
        setIsLoading(true);
        try {
            const newQuotes = await generateQuotesFromAI(userData, [], true, activeFilter);
            setQuotes(newQuotes);
            setToastMessage({ message: 'Citações atualizadas!', type: 'success' });
        } catch (error) {
            console.error("Error refreshing quotes:", error);
            if (error instanceof QuotaExceededError) {
                setIsApiRateLimited(true);
                setToastMessage({ message: 'Limite de uso diário da IA atingido. Tente novamente amanhã.', type: 'error' });
                setQuotes(fallbackQuotes);
                setTimeout(() => setIsApiRateLimited(false), 60000);
            } else {
                setToastMessage({ message: 'Falha ao atualizar. Tente novamente.', type: 'error' });
            }
        } finally {
            setIsLoading(false);
        }
    }, [userData, activeFilter, isApiRateLimited]);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    useEffect(() => {
        if (userData && quotes.length === 0 && !isDailyMotivationLoading) {
            fetchQuotes();
        }
    }, [userData, fetchQuotes, isDailyMotivationLoading]);

    const handleLike = useCallback((id: string, isLiked: boolean) => {
        triggerHapticFeedback();
        if (!isLiked) {
             setToastMessage({ message: 'Adicionada aos favoritos!', type: 'success' });
             setLikedQuoteId(id);
             setTimeout(() => setLikedQuoteId(null), 1000);
             // Gamification Trigger
             const result = completeQuest('like_quote');
             checkLevelUp(result);
        }
        setQuotes(q => q.map(quote => quote.id === id ? { ...quote, liked: !quote.liked } : quote));
    }, [completeQuest]);

    const handleShare = useCallback((quote: Quote) => {
        setQuoteForShareModal(quote);
        setShowShareModal(true);
        triggerHapticFeedback();
        
        // Gamification Trigger (Award when modal opens as intent to share)
        const result = completeQuest('share_quote');
        checkLevelUp(result);
    }, [completeQuest]);
    
    // Gamification: Track reads on scroll (Called from QuoteFeed)
    const handleQuoteRead = useCallback(() => {
        const result = completeQuest('read_quotes');
        checkLevelUp(result);
    }, [completeQuest]);

    const handleCloseLevelUp = () => {
        setIsLevelUpClosing(true);
        setTimeout(() => {
            setLevelUpData(null);
            setIsLevelUpClosing(false);
        }, 500);
    };

    const handlePurchaseComplete = () => {
        // Calculate 1 month expiry from now
        const now = new Date();
        now.setMonth(now.getMonth() + 1);
        
        updateUserData({ 
            isPremium: true,
            subscriptionExpiry: now.toISOString()
        });
        
        // Navigate back from checkout
        handleHidePremiumCheckout();
        setToastMessage({ message: 'Bem-vindo(a) ao Premium! Obrigado pelo seu apoio.', type: 'success' });
    };


    const handleSelectFilter = (topic: string | null) => {
        if (activeFilter !== topic) {
            setActiveFilter(topic);
            setQuotes([]);
        }
        handleHideFilter();
    };

    const handleExplore = (quote: Quote) => {
        setExploringQuote(quote);
    };

    const handleCloseExplore = () => {
        setIsExploreClosing(true);
        setTimeout(() => {
            setExploringQuote(null);
            setIsExploreClosing(false);
        }, 500);
    };
    
    // Daily Motivation Logic (Restored)
    const dailyQuoteId = useMemo(() => `daily-${new Date().toISOString().split('T')[0]}`, []);

    const dailyQuote = useMemo((): Quote | null => {
        if (!dailyMotivation) return null;
        const existing = quotes.find(q => q.id === dailyQuoteId);
        return {
            id: dailyQuoteId,
            text: dailyMotivation.text,
            author: dailyMotivation.author,
            category: dailyMotivation.category,
            liked: existing ? existing.liked : false,
            imageUrl: dailyMotivation.imageUrl,
            backgroundImage: ''
        };
    }, [dailyMotivation, dailyQuoteId, quotes]);

    const handleLikeDailyMotivation = useCallback(() => {
        if (!dailyQuote) return;
        
        triggerHapticFeedback();
        
        const isCurrentlyLiked = dailyQuote.liked;
        const isInQuotesArray = quotes.some(q => q.id === dailyQuote.id);

        if (!isCurrentlyLiked) {
            setToastMessage({ message: 'Adicionada aos favoritos!', type: 'success' });
            setLikedQuoteId(dailyQuote.id);
            setTimeout(() => setLikedQuoteId(null), 1000);
            
             // Gamification Trigger
             const result = completeQuest('like_quote');
             checkLevelUp(result);
        }

        if (isInQuotesArray) {
            setQuotes(prev => prev.map(q => q.id === dailyQuote.id ? { ...q, liked: !isCurrentlyLiked } : q));
        } else {
            setQuotes(prev => [...prev, { ...dailyQuote, liked: true }]);
        }
    }, [dailyQuote, quotes, completeQuest]);

    const handleCloseShareModal = () => {
        setIsShareModalClosing(true);
        setTimeout(() => {
            setShowShareModal(false);
            setQuoteForShareModal(null);
            setIsShareModalClosing(false);
        }, 500);
    };
    
    // Login Handling - Connecting to Auth Context
    const handleLoginSubmit = async (data: LoginFormData) => {
        setAuthAction('login');
        try {
            await login(data);
        } catch (e) {
            setAuthAction(null);
        }
    };

    const handleSignupSubmit = async (data: SignupFormData) => {
        setTempSignupData(data); // Store data to apply after context switch
        setAuthAction('signup');
        try {
            await signup(data);
        } catch (e) {
            setAuthAction(null);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await loginWithGoogle();
            const user = result.user;
            
            // Check if user doc exists in Firestore
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);

            if (!docSnap.exists()) {
                // New user via Google - INTERCEPT HERE
                setPendingGoogleUser(user);
            } else {
                 setToastMessage({ message: `Bem-vinda de volta!`, type: 'success' });
                 setShowLogin(false);
            }
        } catch (error) {
            console.error("Google Login Handled Error:", error);
        }
    };

    const handleFinalizeGoogleSignup = async (cpf: string) => {
        if (!pendingGoogleUser) return;

        await initializeUser({
            name: pendingGoogleUser.displayName || 'Usuária',
            email: pendingGoogleUser.email || undefined,
            onboardingComplete: false,
            cpf: cpf
        }, pendingGoogleUser.uid);

        setToastMessage({ message: `Conta criada com sucesso!`, type: 'success' });
        setPendingGoogleUser(null);
        setShowLogin(false);
    };

    const handleCancelGoogleSignup = () => {
        setPendingGoogleUser(null);
        logout(); 
        setToastMessage({ message: `Cadastro cancelado.`, type: 'error' });
    };

    const handleResetPassword = async (email: string) => {
        try {
            await resetPassword(email);
            setToastMessage({ message: `E-mail de recuperação enviado para ${email}`, type: 'success' });
        } catch (error) {
            // Error handling done in context
        }
    };

    const handleLogout = useCallback(() => {
        // Clear UI states
        setShowProfile(false);
        setIsProfileClosing(false);
        setShowAdmin(false);
        setPendingGoogleUser(null);
        setAuthAction(null); // Clear auth action to avoid zombie states
        
        // Ensure Login modal is OPEN so we see the Login Screen
        setLoginInitialTab('login'); // Ensure tab is correct
        setShowLogin(true); 
        
        safePushRoute(ROUTES.LOGIN); // Navigate to /login
        logout();
    }, [logout, safePushRoute]);


    if (isSharePage) return <SharePage />;
    
    // Mood Checkin Logic
    useEffect(() => {
        if (isOnboarded) {
             const lastCheckin = localStorage.getItem('inspiraMoodCheckin');
             const twentyFourHours = 24 * 60 * 60 * 1000;
             const now = new Date().getTime();
             if (!lastCheckin || (now - parseInt(lastCheckin, 10)) > twentyFourHours) {
                 setNeedsMoodCheckin(true);
                 if (window.location.pathname !== ROUTES.MOOD_CHECKIN) {
                     safePushRoute(ROUTES.MOOD_CHECKIN);
                 }
             }
        }
    }, [isOnboarded, safePushRoute]);
    
    // Loading State
    if (isUserDataLoading || isAuthLoading) {
        return <div className="h-full w-full flex items-center justify-center bg-black text-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div></div>;
    }

    const handleMoodCheckinComplete = (feeling: string) => {
        updateUserData({ feeling });
        localStorage.setItem('inspiraMoodCheckin', new Date().getTime().toString());
        setNeedsMoodCheckin(false);
        // Navigate back to home or previous state logic
        if (!safeGoBack()) {
             // Fallback if no history
             window.history.pushState({}, '', ROUTES.HOME);
        }
    };

    // Routing Logic
    if (showAdmin) {
        return <AdminPanel onClose={handleHideAdmin} setToastMessage={setToastMessage} />;
    }

    if (pendingGoogleUser) {
        return (
            <GoogleCpfScreen 
                onConfirm={handleFinalizeGoogleSignup}
                onCancel={handleCancelGoogleSignup}
            />
        );
    }

    if (showLogin) {
        return (
            <LoginScreen 
                initialTab={loginInitialTab}
                onLogin={handleLoginSubmit} 
                onSignup={handleSignupSubmit}
                onGoogleLogin={handleGoogleLogin}
                onResetPassword={handleResetPassword}
                onBack={() => {
                    setShowLogin(false);
                    // Return to landing page route
                    safePushRoute(ROUTES.LANDING);
                }}
            />
        );
    }

    // If not authenticated, start onboarding (Landing Page)
    if (!isAuthenticated) return (
        <>
            <OnboardingFlow 
                onLoginClick={() => {
                    setLoginInitialTab('login');
                    setShowLogin(true);
                    safePushRoute(ROUTES.LOGIN);
                }} 
                onShowTerms={() => setShowTerms(true)}
                onShowPrivacy={() => setShowPrivacy(true)}
            />
            {showTerms && <TermsScreen onClose={() => setShowTerms(false)} />}
            {showPrivacy && <PrivacyScreen onClose={() => setShowPrivacy(false)} />}
        </>
    );
    
    // Fallback: Authenticated but no user data? (Race condition or failed creation)
    if (!userData) {
        return (
            <div className="h-full w-full bg-black flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-6"></div>
                <h2 className="text-xl font-bold mb-2">Preparando seu perfil...</h2>
                <p className="text-gray-400 mb-8">Isso pode levar alguns segundos na primeira vez.</p>
                
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm font-bold"
                >
                    <LogoutIcon className="text-red-400" />
                    Tentar Novamente (Sair)
                </button>
            </div>
        );
    }

    // AUTHENTICATED BUT NOT ONBOARDED: Force Onboarding Flow starting from Welcome
    if (userData && !userData.onboardingComplete) {
        return (
            <OnboardingFlow 
                initialStep={OnboardingStep.Welcome}
                onLoginClick={() => {}} // Should not happen since logged in
                onShowTerms={() => setShowTerms(true)}
                onShowPrivacy={() => setShowPrivacy(true)}
            />
        );
    }


    // 1. BLOCKING EXPIRED SCREEN - The Gatekeeper
    if (!hasActiveAccess && !showPremiumCheckout) {
        return (
            <SubscriptionExpiredScreen 
                onRenew={() => {
                    setShowPremiumCheckout(true);
                    safePushRoute(ROUTES.PREMIUM);
                }} 
                onLogout={handleLogout} 
            />
        );
    }

    // 2. CHECKOUT SCREEN
    if (showPremiumCheckout) {
        return (
            <Suspense fallback={<div className="fixed inset-0 bg-black z-50"></div>}>
                <PremiumCheckoutScreen 
                    onBack={handleHidePremiumCheckout} 
                    onPurchaseComplete={handlePurchaseComplete} 
                    isClosing={isPremiumCheckoutClosing} 
                />
            </Suspense>
        );
    }

    // 3. Mood Checkin
    if (needsMoodCheckin) {
        return (
            <MoodCheckinScreen onComplete={handleMoodCheckinComplete} />
        );
    }

    return (
        <main className="relative h-full w-full bg-black text-gray-50 font-sans overflow-hidden" role="main">
             <div className={`w-full h-full transition-all duration-500 ease-in-out ${showProfile || showFilterModal || exploringQuote || showDailyMotivation || showShareModal || showGamification ? 'scale-95 brightness-75' : 'scale-100 brightness-100'}`}>
                <QuoteFeed 
                    quotes={quotes}
                    isLoading={isLoading}
                    onLike={handleLike}
                    onShare={handleShare}
                    onExplore={handleExplore}
                    onRead={handleQuoteRead}
                    loadMore={fetchQuotes}
                    sharingQuoteId={null}
                    likedQuoteId={likedQuoteId}
                    onRefresh={refreshQuotes}
                />
                <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-20 pointer-events-none">
                     <div className="pointer-events-auto flex items-center space-x-2">
                        {isDailyMotivationLoading ? (
                            <div className="h-10 w-10 bg-white/50 rounded-full animate-pulse shadow-md" aria-hidden="true"></div>
                        ) : (
                            <button 
                                onClick={handleOpenDailyMotivation}
                                className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 transition-colors ring-1 ring-white/20 flex items-center justify-center transform active:scale-95"
                                aria-label="Ver Motivação do Dia"
                            >
                                <SunnyIcon className="text-amber-500 text-[24px]" />
                            </button>
                        )}
                         {/* Gamification Entry Point */}
                         <button 
                             onClick={handleOpenGamification}
                             className="h-10 px-4 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 transition-colors ring-1 ring-white/20 flex items-center justify-center gap-3 transform active:scale-95"
                             aria-label="Ver Jornada"
                         >
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                                <TrophyIcon className="text-[20px] text-white" />
                            </div>
                            <span className="text-white font-bold text-base leading-none">{userData?.stats?.level || 1}</span>
                             {userData?.stats?.currentStreak ? (
                                 <div className="flex items-center text-orange-400 text-xs gap-1 ml-1 border-l border-white/10 pl-2 leading-none" title="Sequência de dias">
                                     <FlameIcon className="text-lg" />
                                     <span className="font-bold">{userData.stats.currentStreak}</span>
                                 </div>
                             ) : null}
                         </button>
                    </div>
                    
                    <div role="navigation" aria-label="Navegação Principal" className="pointer-events-auto flex items-center space-x-2">
                        <button aria-label="Filtrar tópicos" onClick={handleOpenFilter} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 transition-colors ring-1 ring-white/20 flex items-center justify-center transform active:scale-95">
                            <FilterIcon className="text-white text-[24px]"/>
                        </button>
                        <button aria-label="Ver perfil" onClick={handleOpenProfile} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 transition-colors ring-1 ring-white/20 flex items-center justify-center transform active:scale-95">
                            <UserCircleIcon className="text-white text-[24px]"/>
                        </button>
                    </div>
                </header>
            </div>

            <Suspense fallback={<div className="fixed inset-0 z-50 pointer-events-none"></div>}>
                {showDailyMotivation && (
                    <DailyMotivationScreen
                        isClosing={isDailyMotivationClosing}
                        quote={dailyQuote}
                        isLoading={isDailyMotivationLoading}
                        onBack={handleHideDailyMotivation}
                        onNavigateToProfile={() => {
                            if (!safeGoBack()) {
                                handleHideDailyMotivation();
                            }
                            setTimeout(() => handleOpenProfile(), 100);
                        }}
                        onLike={handleLikeDailyMotivation}
                        onShare={handleShare}
                        onExplore={handleExplore}
                        sharingQuoteId={null}
                        likedQuoteId={likedQuoteId}
                    />
                )}
                
                {showGamification && (
                    <GamificationModal 
                        stats={userData?.stats || ({} as UserStats)} 
                        onClose={handleHideGamification} 
                        isClosing={isGamificationClosing} 
                    />
                )}
                
                {levelUpData && (
                    <LevelUpModal 
                        newLevel={levelUpData} 
                        onClose={handleCloseLevelUp} 
                        isClosing={isLevelUpClosing}
                    />
                )}

                {exploringQuote && <ExploreModal quote={exploringQuote} onClose={handleCloseExplore} isClosing={isExploreClosing} />}
                
                {showFilterModal && (
                    <FilterModal 
                        activeFilter={activeFilter} 
                        onSelectFilter={handleSelectFilter} 
                        onClose={handleHideFilter} 
                        isClosing={isFilterClosing} 
                        isPremium={true} // Always allow filtering inside the app
                        onTriggerPremium={handleTriggerPremium}
                    />
                )}

                {showProfile && (
                    <ProfileScreen 
                        onBack={handleHideProfile} 
                        quotes={quotes} 
                        onLike={handleLike} 
                        setToastMessage={setToastMessage} 
                        isClosing={isProfileClosing} 
                        onGoToPremium={() => { 
                             if (!safeGoBack()) {
                                 handleHideProfile();
                             }
                             setTimeout(() => handleTriggerPremium(), 100);
                        }} 
                        onLogout={handleLogout}
                        onShowTerms={() => setShowTerms(true)}
                        onShowPrivacy={() => setShowPrivacy(true)}
                        isAdmin={isAdmin}
                        onOpenAdmin={handleOpenAdmin}
                    />
                )}

                {showShareModal && quoteForShareModal && (
                    <ShareModal
                        quote={quoteForShareModal}
                        onClose={handleCloseShareModal}
                        isClosing={isShareModalClosing}
                    />
                )}
            </Suspense>

            {/* Global Legal Screens */}
            {showTerms && <TermsScreen onClose={() => setShowTerms(false)} />}
            {showPrivacy && <PrivacyScreen onClose={() => setShowPrivacy(false)} />}

            {/* Modern Glass Toast Notification - Fixed Centering Container - Positioned higher */}
            {toastMessage && (
                <div className="fixed bottom-36 left-0 w-full z-[100] flex justify-center pointer-events-none">
                    <div 
                        role="status" 
                        aria-live="polite" 
                        className="animate-slide-in-up flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all max-w-[90vw] pointer-events-auto"
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${toastMessage.type === 'success' ? 'bg-violet-500/20 text-violet-300' : 'bg-orange-500/20 text-orange-300'}`}>
                            {toastMessage.type === 'success' ? <CheckIcon className="text-sm" /> : <WarningIcon className="text-sm" />}
                        </div>
                        <span className="text-sm font-medium text-white/90 font-sans tracking-wide">{toastMessage.message}</span>
                    </div>
                </div>
            )}
        </main>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UserDataProvider>
        <AppContent />
      </UserDataProvider>
    </AuthProvider>
  );
};

export default App;
