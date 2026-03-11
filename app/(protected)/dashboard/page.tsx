'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Sparkles, TrendingUp } from 'lucide-react'
import { Sidebar, MobileNav } from '@/components/sidebar'
import { TopNavbar } from '@/components/top-navbar'
import { CircularProgress } from '@/components/circular-progress'
import { AIInsightCard } from '@/components/ai-insight-card'
import { HabitCard } from '@/components/habit-card'
import { MissedHabitModal } from '@/components/missed-habit-modal'
import { AddHabitModal } from '@/components/add-habit-modal'
import { GoodMorningModal } from '@/components/good-morning-modal'
import { DailyMotivationCard } from '@/components/daily-motivation-card'
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
import { aiInsights, goals, weeklyReport } from '@/lib/data'
import type { Habit, UserStats, Todo, JournalEntry } from '@/lib/types'
import { getHabits, createHabit, completeHabit, logMissedHabit } from '@/lib/actions/habits'
import { getTasks, createTask, toggleTask } from '@/lib/actions/tasks'
import { getJournalEntries, saveJournalEntry } from '@/lib/actions/journal'
import { getUserStats, awardMorningXP } from '@/lib/actions/profile'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [habits, setHabits] = useState<Habit[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    levelTitle: 'Beginner',
    nextLevelXp: 100,
    currentStreak: 0,
    bestStreak: 0,
    totalHabitsCompleted: 0,
    weeklyXp: 0
  })
  const [missedHabit, setMissedHabit] = useState<Habit | null>(null)
  const [showMissedModal, setShowMissedModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMorningModal, setShowMorningModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [displayName, setDisplayName] = useState('Champion')

  const levelTitles = ['Beginner', 'Learner', 'Achiever', 'Builder', 'Champion', 'Master', 'Expert', 'Legend', 'Hero', 'Icon', 'Mythic']
  const levelXpThresholds = [0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600, 6000]

  const loadData = useCallback(async () => {
    try {
      const [habitsData, tasksData, journalData, statsData] = await Promise.all([
        getHabits(),
        getTasks(),
        getJournalEntries(),
        getUserStats()
      ])

      setHabits(habitsData.map(h => ({
        id: h.id,
        name: h.name,
        icon: h.icon || 'circle',
        category: h.category || 'General',
        frequency: h.frequency as 'daily' | 'weekly',
        preferredTime: h.preferred_time as 'morning' | 'afternoon' | 'evening',
        targetDays: h.target_days || [],
        completedToday: h.completedToday || false,
        streak: h.streak || 0,
        completionRate: h.completionRate || 0
      })))

      setTodos(tasksData)
      setJournalEntries(journalData)

      if (statsData) {
        const level = statsData.level || 1
        const nextLevelXp = levelXpThresholds[Math.min(level, levelXpThresholds.length - 1)]
        setStats({
          xp: statsData.xp || 0,
          level,
          levelTitle: levelTitles[level - 1] || 'Beginner',
          nextLevelXp,
          currentStreak: statsData.currentStreak || 0,
          bestStreak: statsData.bestStreak || 0,
          totalHabitsCompleted: statsData.habitsCompletedToday || 0,
          weeklyXp: statsData.weeklyXp || 0
        })
        setDisplayName(statsData.displayName || 'Champion')
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const lastShown = localStorage.getItem('morningModalLastShown')
    const today = new Date().toDateString()
    if (lastShown !== today && !isLoading) {
      const timer = setTimeout(() => {
        setShowMorningModal(true)
        localStorage.setItem('morningModalLastShown', today)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  const handleClaimMorningXP = async () => {
    try {
      await awardMorningXP()
      await loadData()
    } catch (error) {
      console.error('Error claiming XP:', error)
    }
  }

  const handleCompleteHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (habit?.completedToday) return

    // Optimistic update
    setHabits(prev => prev.map(h => 
      h.id === habitId ? { ...h, completedToday: true, streak: h.streak + 1 } : h
    ))

    try {
      await completeHabit(habitId)
      await loadData()
    } catch (error) {
      console.error('Error completing habit:', error)
      // Revert on error
      await loadData()
    }
  }

  const handleMissedHabit = (habit: Habit) => {
    setMissedHabit(habit)
    setShowMissedModal(true)
  }

  const handleMissedSubmit = async (habitId: string, reasonId: string, customReason?: string) => {
    try {
      await logMissedHabit(habitId, reasonId, customReason)
      await loadData()
    } catch (error) {
      console.error('Error logging missed habit:', error)
    }
  }

  const handleAddHabit = async (newHabit: { name: string; frequency: string; preferredTime: string }) => {
    try {
      await createHabit({
        name: newHabit.name,
        frequency: newHabit.frequency,
        preferredTime: newHabit.preferredTime
      })
      await loadData()
    } catch (error) {
      console.error('Error creating habit:', error)
    }
  }

  const handleAddTodo = async (task: { title: string; priority: 'low' | 'medium' | 'high'; dueDate?: Date }) => {
    try {
      await createTask(task)
      await loadData()
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleToggleTodo = async (id: string) => {
    // Optimistic update
    setTodos(prev => prev.map(t => 
      t.id === id 
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date() : undefined }
        : t
    ))

    try {
      await toggleTask(id)
      await loadData()
    } catch (error) {
      console.error('Error toggling task:', error)
      await loadData()
    }
  }

  const handleSaveJournal = async (entry: Partial<JournalEntry>) => {
    try {
      await saveJournalEntry({
        date: entry.date || new Date().toISOString().split('T')[0],
        content: entry.content,
        mood: entry.mood,
        energyLevel: entry.energyLevel,
        morningIntention: entry.morningIntention,
        eveningReflection: entry.eveningReflection
      })
      await loadData()
    } catch (error) {
      console.error('Error saving journal:', error)
    }
  }

  const todayCompleted = habits.filter(h => h.completedToday).length
  const todayTotal = habits.length
  const progressPercent = stats.nextLevelXp > 0 ? (stats.xp / stats.nextLevelXp) * 100 : 0

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        xp={stats.xp}
        level={stats.level}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <TopNavbar xp={stats.xp} onAddHabit={() => setShowAddModal(true)} />

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
                        <CircularProgress value={todayCompleted} max={todayTotal || 1} size={56} strokeWidth={6} />
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
                        <span>Great progress!</span>
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

                <DailyMotivationCard />

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">AI Insight</p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {habits.length === 0 
                            ? "Welcome! Start by adding your first habit to begin your journey."
                            : aiInsights[0].message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                  {habits.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground mb-4">No habits yet. Add your first habit to get started!</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="text-primary hover:underline font-medium"
                        >
                          + Add your first habit
                        </button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {habits.map((habit) => (
                        <HabitCard
                          key={habit.id}
                          habit={habit}
                          onComplete={handleCompleteHabit}
                          onMissed={handleMissedHabit}
                        />
                      ))}
                    </div>
                  )}
                </div>

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
              <JournalSection
                entries={journalEntries}
                onSave={handleSaveJournal}
              />
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
    </div>
  )
}
