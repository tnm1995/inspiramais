
export interface UserData {
  onboardingComplete: boolean;
  isPremium: boolean;
  isAdmin?: boolean; // New field for admin privileges
  subscriptionExpiry?: string; // ISO Date string
  source?: string;
  age?: string;
  name?: string;
  email?: string; // Field for user email persistence
  phone?: string;
  cpf?: string;
  gender?: string;
  relationshipStatus?: string;
  hasChildren?: string; // Nova pergunta sobre filhos
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

export interface AppConfig {
    monthlyPrice: string;
    annualPrice: string; // Price per month in annual plan (e.g. "9,90")
    annualTotal: string; // Total annual price (e.g. "118,80")
    checkoutLinkMonthly: string;
    checkoutLinkAnnual: string;
    whatsappLink?: string; // Link para WhatsApp de suporte
}
