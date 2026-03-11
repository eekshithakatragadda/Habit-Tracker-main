export interface Habit {
  id: string
  name: string
  icon: string
  category: string
  frequency: 'daily' | 'weekly'
  preferredTime: 'morning' | 'afternoon' | 'evening'
  targetDays: string[]
  completedToday: boolean
  streak: number
  completionRate: number
  bestTime?: string
}

export interface UserStats {
  xp: number
  level: number
  levelTitle: string
  nextLevelXp: number
  weeklyXp: number
  totalHabitsCompleted: number
  currentStreak: number
  badges: Badge[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
  unlocked: boolean
}

export interface Goal {
  id: string
  type: 'consistency' | 'improvement' | 'reflection' | 'challenge'
  title: string
  description: string
  progress: number
  target: number
  xpReward: number
  deadline?: Date
  completed: boolean
}

export interface MissedHabitReason {
  id: string
  label: string
  icon: string
}

export interface AIInsight {
  id: string
  type: 'encouragement' | 'suggestion' | 'pattern' | 'challenge'
  message: string
  habitId?: string
}

export interface WeeklyReport {
  weekStart: Date
  weekEnd: Date
  completionRate: number
  bestDay: string
  worstDay: string
  mostConsistentHabit: string
  mostMissedHabit: string
  xpEarned: number
  insights: string[]
}

export interface Todo {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  completed: boolean
  completedAt?: Date
  createdAt: Date
}

export interface JournalEntry {
  id: string
  date: string // YYYY-MM-DD format
  content: string
  mood: 'great' | 'good' | 'okay' | 'low' | 'bad'
  energyLevel: number // 1-5
  morningIntention?: string
  eveningReflection?: string
  createdAt: Date
  updatedAt: Date
}
