
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserData, UserStats, DailyQuest } from '../types';
import { useAuth } from './AuthContext';

interface UserDataContextType {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  updateUserData: (data: Partial<UserData>) => void;
  loading: boolean;
  completeQuest: (questId: 'read_quotes' | 'like_quote' | 'share_quote') => { leveledUp: boolean; newLevel: number } | null;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const INITIAL_QUESTS: DailyQuest[] = [
    { id: 'read_quotes', title: 'Leitor Voraz', description: 'Leia 5 citações', target: 5, current: 0, xpReward: 50, completed: false, icon: 'auto_stories' },
    { id: 'like_quote', title: 'Curadoria', description: 'Curta 1 citação', target: 1, current: 0, xpReward: 30, completed: false, icon: 'favorite' },
    { id: 'share_quote', title: 'Mensageiro', description: 'Compartilhe sabedoria', target: 1, current: 0, xpReward: 100, completed: false, icon: 'ios_share' },
];

const initialUserData: UserData = {
    onboardingComplete: false,
    isPremium: false, 
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
        currentStreak: 0,
        lastLoginDate: '',
        quests: INITIAL_QUESTS,
        totalQuotesRead: 0,
        totalLikes: 0,
        totalShares: 0,
    }
};

// Moved outside component to be stable
const calculateLevel = (xp: number) => {
    // Simple scaling: Level = 1 + sqrt(XP / 100)
    return Math.floor(1 + Math.sqrt((xp || 0) / 100));
};

export const UserDataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { isAuthenticated, userEmail } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const storageKey = userEmail ? `inspiraUserData-${userEmail}` : null;

  useEffect(() => {
    if (!isAuthenticated || !storageKey) {
      setUserData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Subscription Check Logic
        let isPremium = parsedData.isPremium || false;
        
        // If premium, check expiry date
        if (isPremium && parsedData.subscriptionExpiry) {
            const expiry = new Date(parsedData.subscriptionExpiry);
            const now = new Date();
            // If expiry date is in the past, revoke premium
            if (now > expiry) {
                isPremium = false; 
            }
        }

        // Merge with initialUserData to ensure new fields (like stats) are present for existing users
        const mergedData = { 
            ...initialUserData, 
            ...parsedData,
            isPremium: isPremium,
            stats: { ...initialUserData.stats, ...(parsedData.stats || {}) } 
        };
        
        // SMART QUEST MERGE: 
        const existingQuests = Array.isArray(mergedData.stats.quests) ? mergedData.stats.quests : [];
        
        mergedData.stats.quests = INITIAL_QUESTS.map(initialQuest => {
            const existingQuest = existingQuests.find((q: DailyQuest) => q.id === initialQuest.id);
            if (existingQuest) {
                return {
                    ...initialQuest, // Use new definition (New Icon, Title, XP)
                    current: existingQuest.current || 0, // Keep Progress
                    completed: !!existingQuest.completed // Keep Completion status
                };
            }
            return { ...initialQuest }; // Return a copy
        });

        // Check Daily Reset Logic
        const today = new Date().toISOString().split('T')[0];
        if (mergedData.stats.lastLoginDate !== today) {
             // Reset Quests if it's a new day
             mergedData.stats.quests = INITIAL_QUESTS.map(q => ({...q}));
             
             // Handle Streak
             if (mergedData.stats.lastLoginDate) {
                 const lastLogin = new Date(mergedData.stats.lastLoginDate);
                 const yesterday = new Date();
                 yesterday.setDate(yesterday.getDate() - 1);
                 const yesterdayStr = yesterday.toISOString().split('T')[0];

                 if (mergedData.stats.lastLoginDate === yesterdayStr) {
                     mergedData.stats.currentStreak = (mergedData.stats.currentStreak || 0) + 1;
                 } else {
                     // Missed a day
                     mergedData.stats.currentStreak = 1; 
                 }
             } else {
                 // First login ever recorded
                 mergedData.stats.currentStreak = 1;
             }
             
             mergedData.stats.lastLoginDate = today;
        }

        setUserData(mergedData);
      } else {
        const today = new Date().toISOString().split('T')[0];
        const newUser = {
            ...initialUserData,
            isPremium: false,
            stats: { 
                ...initialUserData.stats, 
                lastLoginDate: today, 
                currentStreak: 1,
                quests: INITIAL_QUESTS.map(q => ({...q})) // Ensure copy
            }
        };
        setUserData(newUser);
      }
    } catch (error) {
      console.error("Failed to load user data from localStorage", error);
      // Fallback safe init
      const today = new Date().toISOString().split('T')[0];
      setUserData({
          ...initialUserData,
          stats: { ...initialUserData.stats, lastLoginDate: today, quests: INITIAL_QUESTS.map(q => ({...q})) }
      });
    } finally {
        setLoading(false);
    }
  }, [isAuthenticated, storageKey]);

  useEffect(() => {
    if (userData && !loading && isAuthenticated && storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(userData));
      } catch (error) {
        console.error("Failed to save user data to localStorage", error);
      }
    }
  }, [userData, loading, isAuthenticated, storageKey]);

  const updateUserData = useCallback((data: Partial<UserData>) => {
    setUserData(prev => prev ? { ...prev, ...data } : (data as UserData));
  }, []);

  const completeQuest = useCallback((questId: 'read_quotes' | 'like_quote' | 'share_quote') => {
      if (!userData || !userData.stats) return null;

      // 1. Calculate new state SYNCHRONOUSLY based on current userData
      const currentStats = userData.stats;
      
      // Deep clone quests array to avoid mutation
      const newQuests = currentStats.quests ? currentStats.quests.map(q => ({ ...q })) : [];
      
      const newStats: UserStats = {
          ...currentStats,
          quests: newQuests,
          totalQuotesRead: currentStats.totalQuotesRead || 0,
          totalLikes: currentStats.totalLikes || 0,
          totalShares: currentStats.totalShares || 0,
          xp: currentStats.xp || 0,
          level: currentStats.level || 1
      };

      // Update Totals
      if (questId === 'read_quotes') newStats.totalQuotesRead += 1;
      if (questId === 'like_quote') newStats.totalLikes += 1;
      if (questId === 'share_quote') newStats.totalShares += 1;

      let leveledUp = false;
      let newLevelVal = newStats.level;

      // Update Quest Progress
      const questIndex = newStats.quests.findIndex(q => q.id === questId);
      if (questIndex !== -1) {
          const quest = newStats.quests[questIndex];
          
          if (!quest.completed) {
              quest.current = (quest.current || 0) + 1;
              if (quest.current >= quest.target) {
                  quest.completed = true;
                  // Award XP
                  newStats.xp += quest.xpReward;
                  
                  // Check Level Up
                  const calculatedLevel = calculateLevel(newStats.xp);
                  if (calculatedLevel > newStats.level) {
                      newStats.level = calculatedLevel;
                      leveledUp = true;
                      newLevelVal = calculatedLevel;
                  }
              }
          }
      }

      // 2. Update Context State
      updateUserData({ stats: newStats });

      // 3. Return result immediately to the caller
      return leveledUp ? { leveledUp: true, newLevel: newLevelVal } : null;
  }, [userData, updateUserData]);


  return (
    <UserDataContext.Provider value={{ userData, setUserData, updateUserData, loading, completeQuest }}>
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
