
export interface UserData {
  onboardingComplete: boolean;
  isPremium: boolean;
  subscriptionExpiry?: string; // ISO Date string
  source?: string;
  age?: string;
  name?: string;
  gender?: string;
  relationshipStatus?: string;
  isReligious?: string;
  beliefs?: string;
  zodiac?: string;
  feeling?: string;
  feelingReason?: string;
  improvementAreas: string[];
  goals?: string;
  appGoals: string[];
  topics: string[];
  
  // Gamification Data
  stats: UserStats;
}

export interface UserStats {
  xp: number;
  level: number;
  currentStreak: number;
  lastLoginDate: string; // ISO Date string YYYY-MM-DD
  quests: DailyQuest[];
  totalQuotesRead: number;
  totalShares: number;
  totalLikes: number;
}

export interface DailyQuest {
  id: 'read_quotes' | 'like_quote' | 'share_quote';
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
  icon: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string | null;
  liked: boolean;
  imageUrl?: string;
  category?: string;
  backgroundImage: string;
}

export interface DailyMotivation {
  text: string;
  author: string | null;
  category: string;
  imageUrl: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignupFormData extends LoginFormData {
  name: string;
  phone?: string;
  cpf: string;
}