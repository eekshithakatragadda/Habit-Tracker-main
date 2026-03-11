'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import { Sparkles, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Sidebar, MobileNav } from '@/components/sidebar'
import { TopNavbar } from '@/components/top-navbar'
import { CircularProgress } from '@/components/circular-progress'
import { AIInsightCard } from '@/components/ai-insight-card'
import { HabitCard } from '@/components/habit-card'
import { MissedHabitModal } from '@/components/missed-habit-modal'
import { AddHabitModal } from '@/components/add-habit-modal'
import { GoodMorningModal } from '@/components/good-morning-modal'
import { DailyMotivationCard } from '@/components/daily-motivation-card'
import { WelcomeModal } from '@/components/welcome-modal'
import { GoalsSection } from '@/components/goals-section'
import { LevelsSection } from '@/components/levels-section'
const AnalyticsSection = dynamic(() => import('@/components/analytics-section').then(mod => ({ default: mod.AnalyticsSection })), {
  loading: () => <div className="h-96 bg-muted rounded-lg animate-pulse" />,
  ssr: false,
})
import { ReportsSection } from '@/components/reports-section'
import { HabitsSection } from '@/components/habits-section'
import { TodoSection } from '@/components/todo-section'
import { JournalSection } from '@/components/journal-section'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { getHabits, createHabit, completeHabit, logMissedHabit } from '@/lib/actions/habits'
import { getTasks, createTask, toggleTask } from '@/lib/actions/tasks'
import { getUserStats, awardMorningXP } from '@/lib/actions/profile'
import { aiInsights, goals, weeklyReport } from '@/lib/data'
import type { Habit, UserStats, Todo } from '@/lib/types'

// Level titles mapping
const levelTitles: Record<number, string> = {
  1: 'Newcomer',
  2: 'Beginner',
  3: 'Apprentice',
  4: 'Practitioner',
  5: 'Achiever',
  6: 'Expert',
  7: 'Master',
  8: 'Champion',
  9: 'Legend',
  10: 'Transcendent'
}

// XP thresholds for levels
const levelThresholds = [0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600, 6000]

function getNextLevelXp(level: number): number {
  return levelThresholds[level] || levelThresholds[levelThresholds.length - 1]
}

export default function Home() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [missedHabit, setMissedHabit] = useState<Habit | null>(null)
  const [showMissedModal, setShowMissedModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMorningModal, setShowMorningModal] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Fetch user on mount and check if new user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      
      // Check if this is a new user (show welcome modal)
      if (user) {
        const hasSeenWelcome = localStorage.getItem(`welcome_shown_${user.id}`)
        if (!hasSeenWelcome) {
          setShowWelcomeModal(true)
        }
      }
    })
  }, [supabase.auth])

  const handleCloseWelcome = () => {
    if (user) {
      localStorage.setItem(`welcome_shown_${user.id}`, 'true')
    }
    setShowWelcomeModal(false)
  }

  // Fetch habits from Supabase
  const { data: habits = [], mutate: mutateHabits } = useSWR<Habit[]>(
    user ? 'habits' : null,
    async () => {
      const data = await getHabits()
      return data.map((h: Record<string, unknown>) => ({
        id: h.id as string,
        name: h.name as string,
        icon: h.icon as string || 'circle',
        category: h.category as string || 'Custom',
        frequency: h.frequency as 'daily' | 'weekly',
        preferredTime: h.preferred_time as 'morning' | 'afternoon' | 'evening',
        targetDays: h.target_days as string[] || [],
        completedToday: h.completedToday as boolean || false,
        streak: h.streak as number || 0,
        completionRate: h.completionRate as number || 0
      }))
    },
    { fallbackData: [] }
  )

  // Fetch tasks from Supabase
  const { data: todos = [], mutate: mutateTodos } = useSWR<Todo[]>(
    user ? 'tasks' : null,
    getTasks,
    { fallbackData: [] }
  )

  // Fetch user stats from Supabase
  const { data: statsData, mutate: mutateStats } = useSWR(
    user ? 'stats' : null,
    getUserStats
  )

  // Convert stats to expected format
  const stats: UserStats = {
    xp: statsData?.xp || 0,
    level: statsData?.level || 1,
    levelTitle: levelTitles[statsData?.level || 1] || 'Newcomer',
    currentStreak: statsData?.currentStreak || 0,
    bestStreak: statsData?.bestStreak || 0,
    totalHabitsCompleted: 0,
    weeklyXp: statsData?.weeklyXp || 0,
    nextLevelXp: getNextLevelXp(statsData?.level || 1)
  }

  // Check if morning modal should show on first load
  useEffect(() => {
    if (!user) return
    const lastShown = localStorage.getItem('morningModalLastShown')
    const today = new Date().toDateString()
    if (lastShown !== today) {
      const timer = setTimeout(() => {
        setShowMorningModal(true)
        localStorage.setItem('morningModalLastShown', today)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [user])

  const handleClaimMorningXP = useCallback(async () => {
    try {
      await awardMorningXP()
      mutateStats()
    } catch (error) {
      console.error('Failed to claim morning XP:', error)
    }
  }, [mutateStats])

  const handleCompleteHabit = useCallback(async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (habit?.completedToday) return

    // Optimistic update
    mutateHabits(
      habits.map(h => h.id === habitId ? { ...h, completedToday: true, streak: h.streak + 1 } : h),
      false
    )

    try {
      await completeHabit(habitId)
      mutateHabits()
      mutateStats()
    } catch (error) {
      console.error('Failed to complete habit:', error)
      mutateHabits() // Revert on error
    }
  }, [habits, mutateHabits, mutateStats])

  const handleMissedHabit = useCallback((habit: Habit) => {
    setMissedHabit(habit)
    setShowMissedModal(true)
  }, [])

  const handleMissedSubmit = useCallback(async (habitId: string, reasonId: string, customReason?: string) => {
    try {
      await logMissedHabit(habitId, reasonId, customReason)
      mutateHabits()
      mutateStats()
    } catch (error) {
      console.error('Failed to log missed habit:', error)
    }
  }, [mutateHabits, mutateStats])

  const handleAddTodo = useCallback(async (task: { title: string; priority: 'low' | 'medium' | 'high'; dueDate?: Date }) => {
    try {
      await createTask(task)
      mutateTodos()
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }, [mutateTodos])

  const handleToggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id)
    
    // Optimistic update
    mutateTodos(
      todos.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date() : undefined } : t),
      false
    )

    try {
      await toggleTask(id)
      mutateTodos()
      if (!todo?.completed) {
        mutateStats()
      }
    } catch (error) {
      console.error('Failed to toggle task:', error)
      mutateTodos() // Revert on error
    }
  }, [todos, mutateTodos, mutateStats])

  const handleAddHabit = useCallback(async (newHabit: { name: string; frequency: string; preferredTime: string }) => {
    try {
      await createHabit({
        name: newHabit.name,
        frequency: newHabit.frequency,
        preferredTime: newHabit.preferredTime,
        targetDays: newHabit.frequency === 'daily' 
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          : ['Mon', 'Wed', 'Fri']
      })
      mutateHabits()
    } catch (error) {
      console.error('Failed to add habit:', error)
    }
  }, [mutateHabits])

  const todayCompleted = habits.filter(h => h.completedToday).length
  const todayTotal = habits.length
  const progressPercent = stats.nextLevelXp > 0 ? (stats.xp / stats.nextLevelXp) * 100 : 0

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Champion'

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        xp={stats.xp}
        level={stats.level}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <TopNavbar xp={stats.xp} onAddHabit={() => setShowAddModal(true)} user={user} />

        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-border bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Today&apos;s Progress</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{todayCompleted}/{todayTotal}</p>
                        </div>
                        <CircularProgress value={todayCompleted} max={todayTotal} size={56} strokeWidth={6} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card/50">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stats.currentStreak} days</p>
                      <p className="text-xs text-accent mt-1">Keep it going!</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card/50">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">This Week</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-bold text-foreground">+{stats.weeklyXp}</p>
                        <span className="text-sm text-primary">XP</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-accent mt-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Keep building momentum!</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card/50">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Level {stats.level}</p>
                      <p className="text-lg font-semibold text-primary mt-1">{stats.levelTitle}</p>
                      <Progress value={progressPercent} className="h-2 mt-2" />
                    </CardContent>
                  </Card>
                </div>

                {/* Daily Motivation */}
                <DailyMotivationCard />

                {/* AI Insight */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">AI Insight</p>
                        <p className="text-sm text-foreground leading-relaxed">{aiInsights[0].message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Today's Habits */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Today&apos;s Habits</h2>
                      <p className="text-sm text-muted-foreground">
                        {todayCompleted} of {todayTotal} completed
                        {todayCompleted === todayTotal && todayTotal > 0 && (
                          <span className="text-accent ml-2">All done! +25 XP bonus</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {habits.length === 0 ? (
                      <Card className="border-dashed border-border">
                        <CardContent className="p-6 text-center">
                          <p className="text-muted-foreground">No habits yet. Add your first habit to get started!</p>
                        </CardContent>
                      </Card>
                    ) : (
                      habits.map((habit) => (
                        <HabitCard
                          key={habit.id}
                          habit={habit}
                          onComplete={handleCompleteHabit}
                          onMissed={handleMissedHabit}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* More AI Insights */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <AIInsightCard insight={aiInsights[1]} />
                  <AIInsightCard insight={aiInsights[2]} />
                </div>
              </div>
            )}

            {activeTab === 'habits' && (
              <HabitsSection 
                habits={habits} 
                onComplete={handleCompleteHabit}
                onMissed={handleMissedHabit}
              />
            )}

            {activeTab === 'todos' && (
              <TodoSection
                todos={todos}
                onAddTodo={handleAddTodo}
                onToggleTodo={handleToggleTodo}
              />
            )}

            {activeTab === 'journal' && (
              <JournalSection />
            )}

            {activeTab === 'goals' && (
              <GoalsSection goals={goals} stats={stats} />
            )}

            {activeTab === 'levels' && (
              <LevelsSection stats={stats} />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsSection habits={habits} stats={stats} />
            )}

            {activeTab === 'reports' && (
              <ReportsSection report={weeklyReport} stats={stats} />
            )}
          </div>
        </main>
      </div>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      <MissedHabitModal
        habit={missedHabit}
        isOpen={showMissedModal}
        onClose={() => setShowMissedModal(false)}
        onSubmit={handleMissedSubmit}
      />

      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddHabit}
      />

      <GoodMorningModal
        isOpen={showMorningModal}
        onClose={() => setShowMorningModal(false)}
        userName={displayName}
        yesterdayStats={{
          habitsCompleted: todayCompleted,
          totalHabits: todayTotal,
          tasksCompleted: todos.filter(t => t.completed).length,
          currentStreak: stats.currentStreak
        }}
        onClaimXP={handleClaimMorningXP}
      />

      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleCloseWelcome}
        userName={displayName}
      />
    </div>
  )
}
