import type { Habit, UserStats, Badge, Goal, MissedHabitReason, AIInsight, WeeklyReport } from './types'

export const habits: Habit[] = [
  {
    id: '1',
    name: 'Morning Meditation',
    icon: 'brain',
    category: 'Wellness',
    frequency: 'daily',
    preferredTime: 'morning',
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    completedToday: true,
    streak: 12,
    completionRate: 85,
    bestTime: '7:00 AM'
  },
  {
    id: '2',
    name: 'Workout',
    icon: 'dumbbell',
    category: 'Fitness',
    frequency: 'weekly',
    preferredTime: 'morning',
    targetDays: ['Mon', 'Wed', 'Fri'],
    completedToday: false,
    streak: 5,
    completionRate: 72,
    bestTime: '6:30 AM'
  },
  {
    id: '3',
    name: 'Read 30 mins',
    icon: 'book',
    category: 'Learning',
    frequency: 'daily',
    preferredTime: 'evening',
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    completedToday: true,
    streak: 8,
    completionRate: 78,
    bestTime: '9:00 PM'
  },
  {
    id: '4',
    name: 'Drink 8 glasses water',
    icon: 'droplet',
    category: 'Health',
    frequency: 'daily',
    preferredTime: 'morning',
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    completedToday: false,
    streak: 3,
    completionRate: 65,
  },
  {
    id: '5',
    name: 'Journal',
    icon: 'pen',
    category: 'Mindfulness',
    frequency: 'daily',
    preferredTime: 'evening',
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    completedToday: true,
    streak: 15,
    completionRate: 90,
    bestTime: '10:00 PM'
  }
]

export const userStats: UserStats = {
  xp: 1280,
  level: 8,
  levelTitle: 'Focused Achiever',
  nextLevelXp: 1500,
  weeklyXp: 320,
  totalHabitsCompleted: 156,
  currentStreak: 7,
  badges: [
    {
      id: '1',
      name: 'Self-Aware',
      description: 'Logged 10 missed-habit reflections',
      icon: 'brain',
      unlocked: true,
      unlockedAt: new Date('2025-01-15')
    },
    {
      id: '2',
      name: 'Consistency Champ',
      description: '7 days with 80%+ completion',
      icon: 'flame',
      unlocked: true,
      unlockedAt: new Date('2025-01-20')
    },
    {
      id: '3',
      name: 'Data Driven',
      description: 'Viewed analytics 5 times',
      icon: 'chart',
      unlocked: true,
      unlockedAt: new Date('2025-01-18')
    },
    {
      id: '4',
      name: 'Early Bird',
      description: 'Complete morning habits for 14 days',
      icon: 'sunrise',
      unlocked: false
    },
    {
      id: '5',
      name: 'Habit Master',
      description: 'Reach Level 20',
      icon: 'trophy',
      unlocked: false
    }
  ]
}

export const goals: Goal[] = [
  {
    id: '1',
    type: 'consistency',
    title: 'Weekly Warrior',
    description: 'Complete 80% of habits this week',
    progress: 75,
    target: 80,
    xpReward: 50,
    completed: false
  },
  {
    id: '2',
    type: 'improvement',
    title: 'Workout Boost',
    description: 'Reduce missed workouts by 30%',
    progress: 20,
    target: 30,
    xpReward: 75,
    completed: false
  },
  {
    id: '3',
    type: 'reflection',
    title: 'Self-Discovery',
    description: 'Log reasons for 5 missed habits',
    progress: 3,
    target: 5,
    xpReward: 30,
    completed: false
  },
  {
    id: '4',
    type: 'challenge',
    title: '5-Day Focus Sprint',
    description: 'Complete all habits for 5 consecutive days',
    progress: 3,
    target: 5,
    xpReward: 100,
    completed: false
  }
]

export const missedHabitReasons: MissedHabitReason[] = [
  { id: '1', label: 'No time', icon: 'clock' },
  { id: '2', label: 'Low energy', icon: 'battery-low' },
  { id: '3', label: 'Forgot', icon: 'brain' },
  { id: '4', label: 'Felt unmotivated', icon: 'cloud' },
  { id: '5', label: 'Was traveling', icon: 'plane' },
  { id: '6', label: 'Other', icon: 'edit' }
]

export const aiInsights: AIInsight[] = [
  {
    id: '1',
    type: 'encouragement',
    message: "You're 120 XP away from Level 9 - just 2 more strong days!"
  },
  {
    id: '2',
    type: 'pattern',
    message: "You're most consistent on Mondays and Thursdays. Evening habits are missed 40% more often.",
    habitId: '2'
  },
  {
    id: '3',
    type: 'suggestion',
    message: "Try moving your workout to morning - your completion rate is 30% higher before 9 AM.",
    habitId: '2'
  },
  {
    id: '4',
    type: 'challenge',
    message: "You've been consistent for 2 weeks. Want to try a 5-day focus challenge?"
  }
]

export const weeklyReport: WeeklyReport = {
  weekStart: new Date('2025-01-20'),
  weekEnd: new Date('2025-01-26'),
  completionRate: 78,
  bestDay: 'Monday',
  worstDay: 'Saturday',
  mostConsistentHabit: 'Journal',
  mostMissedHabit: 'Workout',
  xpEarned: 320,
  insights: [
    "You're most consistent on Mondays and Thursdays",
    "Evening habits are missed 40% more often",
    "Your meditation streak is your longest yet!",
    "Consider reducing workout duration on weekdays"
  ]
}

export const levelTitles: Record<number, string> = {
  1: 'Habit Beginner',
  2: 'Habit Starter',
  3: 'Habit Explorer',
  4: 'Habit Learner',
  5: 'Consistency Builder',
  6: 'Habit Practitioner',
  7: 'Habit Enthusiast',
  8: 'Focused Achiever',
  9: 'Habit Expert',
  10: 'Habit Champion',
  15: 'Habit Master',
  20: 'Life Optimizer',
  25: 'Habit Legend',
  30: 'Habit Sage'
}

export const weeklyHeatmapData = [
  { day: 'Mon', habits: 5, completed: 5 },
  { day: 'Tue', habits: 5, completed: 4 },
  { day: 'Wed', habits: 5, completed: 5 },
  { day: 'Thu', habits: 5, completed: 4 },
  { day: 'Fri', habits: 5, completed: 3 },
  { day: 'Sat', habits: 5, completed: 2 },
  { day: 'Sun', habits: 5, completed: 4 }
]

export const monthlyProgressData = [
  { week: 'Week 1', completion: 65 },
  { week: 'Week 2', completion: 72 },
  { week: 'Week 3', completion: 78 },
  { week: 'Week 4', completion: 82 }
]
