
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserData, UserStats, DailyQuest } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

interface UserDataContextType {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  loading: boolean;
  completeQuest: (questId: 'read_quotes' | 'like_quote' | 'share_quote') => { leveledUp: boolean; newLevel: number } | null;
  initializeUser: (initialData: Partial<UserData>, explicitUid?: string) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const INITIAL_QUESTS: DailyQuest[] = [
    { id: 'read_quotes', title: 'Leitor Voraz', description: 'Leia 5 citações', target: 5, current: 0, xpReward: 50, completed: false, icon: 'auto_stories' },
    { id: 'like_quote', title: 'Curadoria', description: 'Curta 1 citação', target: 1, current: 0, xpReward: 30, completed: false, icon: 'favorite' },
    { id: 'share_quote', title: 'Mensageiro', description: 'Compartilhe sabedoria', target: 1, current: 0, xpReward: 100, completed: false, icon: 'ios_share' },
];

const initialUserDataTemplate: UserData = {
    onboardingComplete: false,
    isPremium: false, 
    isAdmin: false,
    subscriptionExpiry: '',
    source: '',
    age: '',
    name: '',
    gender: '',
    relationshipStatus: '',
    isReligious: '',
    beliefs: '',
    zodiac: '',
    feeling: '',
    feelingReason: '',
    improvementAreas: [],
    goals: '',
    appGoals: [],
    topics: [],
    stats: {
        xp: 0,
        level: 1,
        currentStreak: 0, // Starts at 0, truly zeroed
        lastLoginDate: '', // No date set yet
        quests: INITIAL_QUESTS, // Default empty progress quests
        totalQuotesRead: 0,
        totalLikes: 0,
        totalShares: 0,
    }
};

const calculateLevel = (xp: number) => {
    return Math.floor(1 + Math.sqrt((xp || 0) / 100));
};

export const UserDataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Real-time Firestore updates
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      setUserData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, "users", currentUser.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const remoteData = docSnap.data() as UserData;
            
            // Check Daily Reset Logic logic locally and update if needed
            const today = new Date().toISOString().split('T')[0];
            let needsUpdate = false;
            let updatedStats = { ...remoteData.stats };

            // Initialize stats if missing (migration safety)
            if (!updatedStats.quests) {
                updatedStats = { ...initialUserDataTemplate.stats, lastLoginDate: today };
                needsUpdate = true;
            }

            if (updatedStats.lastLoginDate !== today) {
                // Reset Quests
                updatedStats.quests = INITIAL_QUESTS.map(q => ({...q}));
                
                // Handle Streak
                if (updatedStats.lastLoginDate) {
                    const lastLogin = new Date(updatedStats.lastLoginDate);
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (updatedStats.lastLoginDate === yesterdayStr) {
                        updatedStats.currentStreak = (updatedStats.currentStreak || 0) + 1;
                    } else {
                        // If logic dictates streak breaks, reset to 1 on login day
                        updatedStats.currentStreak = 1;
                    }
                } else {
                    updatedStats.currentStreak = 1;
                }
                updatedStats.lastLoginDate = today;
                needsUpdate = true;
            }

            // Subscription Check
            let isPremium = remoteData.isPremium || false;
            if (isPremium && remoteData.subscriptionExpiry) {
                const expiry = new Date(remoteData.subscriptionExpiry);
                const now = new Date();
                if (now > expiry) {
                    isPremium = false;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                // Update Firestore with the daily reset
                updateDoc(userDocRef, { stats: updatedStats, isPremium: isPremium }).catch(console.error);
                // The snapshot listener will fire again with the new data
            } else {
                setUserData({ ...remoteData, isPremium });
            }
        } else {
            // Document doesn't exist yet (handled by initializeUser explicitly usually, but good to handle empty state)
            setUserData(null);
        }
        setLoading(false);
    }, (error) => {
        console.error("Firestore sync error:", error);
        setLoading(false);
    }, () => {
        // Complete
    });

    return () => unsubscribe();
  }, [currentUser, isAuthenticated]);


  const initializeUser = async (signupData: Partial<UserData>, explicitUid?: string) => {
      const targetUid = explicitUid || currentUser?.uid;
      
      if (!targetUid) {
          console.error("Cannot initialize user: No UID available");
          return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const newUser: UserData = {
          ...initialUserDataTemplate,
          ...signupData,
          stats: {
              ...initialUserDataTemplate.stats,
              lastLoginDate: today,
              currentStreak: 1 // Start streak at 1 on first login
          }
      };

      try {
          await setDoc(doc(db, "users", targetUid), newUser);
          setUserData(newUser);
      } catch (e) {
          console.error("Error initializing user in Firestore", e);
      }
  };

  const updateUserData = useCallback(async (data: Partial<UserData>) => {
    if (!currentUser) return;
    
    // Optimistic update
    setUserData(prev => prev ? { ...prev, ...data } : null);

    try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, data, { merge: true });
    } catch (e) {
        console.error("Error updating user data:", e);
        // Could revert state here if critical
    }
  }, [currentUser]);

  const completeQuest = useCallback((questId: 'read_quotes' | 'like_quote' | 'share_quote') => {
      if (!userData || !userData.stats || !currentUser) return null;

      const currentStats = userData.stats;
      const newQuests = currentStats.quests ? currentStats.quests.map(q => ({ ...q })) : [];
      
      const newStats: UserStats = {
          ...currentStats,
          quests: newQuests,
          totalQuotesRead: currentStats.totalQuotesRead || 0,
          totalLikes: currentStats.totalLikes || 0,
          totalShares: currentStats.totalShares || 0,
      };

      if (questId === 'read_quotes') newStats.totalQuotesRead += 1;
      if (questId === 'like_quote') newStats.totalLikes += 1;
      if (questId === 'share_quote') newStats.totalShares += 1;

      let leveledUp = false;
      let newLevelVal = newStats.level;

      const questIndex = newStats.quests.findIndex(q => q.id === questId);
      if (questIndex !== -1) {
          const quest = newStats.quests[questIndex];
          if (!quest.completed) {
              quest.current = (quest.current || 0) + 1;
              if (quest.current >= quest.target) {
                  quest.completed = true;
                  newStats.xp += quest.xpReward;
                  
                  const calculatedLevel = calculateLevel(newStats.xp);
                  if (calculatedLevel > newStats.level) {
                      newStats.level = calculatedLevel;
                      leveledUp = true;
                      newLevelVal = calculatedLevel;
                  }
              }
          }
      }

      // Update Firestore
      updateUserData({ stats: newStats });

      return leveledUp ? { leveledUp: true, newLevel: newLevelVal } : null;
  }, [userData, currentUser, updateUserData]);

  return (
    <UserDataContext.Provider value={{ userData, setUserData, updateUserData, loading, completeQuest, initializeUser }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
