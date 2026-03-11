'use client'

import { useState, useMemo, useCallback } from 'react'
import useSWR from 'swr'
import { 
  BookOpen, Calendar, Sparkles, ChevronLeft, ChevronRight, 
  Save, Zap, Sun, Moon, Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getJournalEntries, saveJournalEntry } from '@/lib/actions/journal'
import type { JournalEntry } from '@/lib/types'
import { cn } from '@/lib/utils'

interface JournalSectionProps {
  entries: JournalEntry[]
  onSaveEntry: (entry: JournalEntry) => void
}

const moodOptions = [
  { value: 'great', emoji: '😊', label: 'Great' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'low', emoji: '😔', label: 'Low' },
  { value: 'bad', emoji: '😢', label: 'Bad' },
] as const

const energyLevels = [1, 2, 3, 4, 5]

const aiInsights = [
  "I noticed you've been more energetic on days when you journal in the morning. Consider making it a consistent morning ritual.",
  "Your mood tends to improve when you complete your workout habit. Great job maintaining that connection!",
  "You've journaled 5 days this week - that's your best streak yet! Keep up the excellent reflection practice.",
  "Looking at your entries, gratitude seems to boost your energy levels. Try adding one thing you're grateful for each day.",
]

export function JournalSection({ onSaveEntry }: JournalSectionProps) {
  // Fetch entries from Supabase
  const { data: entries = [], mutate: mutateEntries } = useSWR<JournalEntry[]>(
    'journal-entries',
    getJournalEntries,
    { fallbackData: [] }
  )
  const [view, setView] = useState<'write' | 'calendar'>('write')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  
  // Form state
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<JournalEntry['mood'] | null>(null)
  const [energyLevel, setEnergyLevel] = useState<number | null>(null)
  const [morningIntention, setMorningIntention] = useState('')
  const [eveningReflection, setEveningReflection] = useState('')
  
  const [showSavedAnimation, setShowSavedAnimation] = useState(false)
  const [showAIInsight, setShowAIInsight] = useState(false)

  const isToday = selectedDate === new Date().toISOString().split('T')[0]
  const isMorning = new Date().getHours() < 12
  
  const existingEntry = entries.find(e => e.date === selectedDate)
  
  // Load existing entry when date changes
  useMemo(() => {
    if (existingEntry) {
      setContent(existingEntry.content)
      setMood(existingEntry.mood)
      setEnergyLevel(existingEntry.energyLevel)
      setMorningIntention(existingEntry.morningIntention || '')
      setEveningReflection(existingEntry.eveningReflection || '')
    } else {
      setContent('')
      setMood(null)
      setEnergyLevel(null)
      setMorningIntention('')
      setEveningReflection('')
    }
  }, [existingEntry])

  const handleSave = useCallback(async () => {
    if (!mood || !energyLevel) return
    
    try {
      await saveJournalEntry({
        date: selectedDate,
        content,
        mood,
        energyLevel,
        morningIntention: morningIntention || undefined,
        eveningReflection: eveningReflection || undefined,
      })
      
      mutateEntries()
      
      setShowSavedAnimation(true)
      setTimeout(() => {
        setShowSavedAnimation(false)
        setShowAIInsight(true)
      }, 1500)
    } catch (error) {
      console.error('Failed to save journal entry:', error)
    }
  }, [mood, energyLevel, selectedDate, content, morningIntention, eveningReflection, mutateEntries])

  // Calendar logic
  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0
  ).getDate()
  
  const firstDayOfMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1
  ).getDay()

  const journaledDates = new Set(entries.map(e => e.date))

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCalendarMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const selectCalendarDate = (day: number) => {
    const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setView('write')
  }

  const weekStreak = entries.filter(e => {
    const entryDate = new Date(e.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return entryDate >= weekAgo
  }).length

  const canSave = mood && energyLevel && (content || morningIntention || eveningReflection)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Journal</h1>
          <p className="text-muted-foreground">
            Reflect on your day and track your mood
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'write' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('write')}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Write
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('calendar')}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-xl font-bold text-foreground">{entries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Trophy className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-xl font-bold text-foreground">{weekStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Zap className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">XP Earned</p>
                <p className="text-xl font-bold text-foreground">+{entries.length * 5}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {view === 'write' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Writing Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {isMorning ? (
                      <Sun className="h-5 w-5 text-warning" />
                    ) : (
                      <Moon className="h-5 w-5 text-primary" />
                    )}
                    {isToday ? (isMorning ? 'Good Morning' : 'Good Evening') : 
                      new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    }
                  </CardTitle>
                  {existingEntry && (
                    <span className="text-xs text-accent font-medium">Entry saved</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Morning Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Sun className="h-4 w-4 text-warning" />
                    What&apos;s one thing you want to feel proud of today?
                  </label>
                  <Textarea
                    value={morningIntention}
                    onChange={(e) => setMorningIntention(e.target.value)}
                    placeholder="Set your intention for the day..."
                    className="min-h-[80px] resize-none bg-secondary/30"
                  />
                </div>

                {/* Free Writing */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Free Writing
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write whatever's on your mind..."
                    className="min-h-[160px] resize-none bg-secondary/30"
                  />
                </div>

                {/* Evening Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Moon className="h-4 w-4 text-primary" />
                    What went well today?
                  </label>
                  <Textarea
                    value={eveningReflection}
                    onChange={(e) => setEveningReflection(e.target.value)}
                    placeholder="Reflect on your wins, big or small..."
                    className="min-h-[80px] resize-none bg-secondary/30"
                  />
                </div>

                {/* Mood Selector */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    How are you feeling?
                  </label>
                  <div className="flex gap-2">
                    {moodOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setMood(option.value)}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-xl px-4 py-3 transition-all',
                          mood === option.value
                            ? 'bg-primary/10 ring-2 ring-primary'
                            : 'bg-secondary/30 hover:bg-secondary'
                        )}
                      >
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="text-xs text-muted-foreground">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Level */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Energy Level
                  </label>
                  <div className="flex gap-2">
                    {energyLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() => setEnergyLevel(level)}
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-xl font-semibold transition-all',
                          energyLevel === level
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-secondary/30 text-muted-foreground hover:bg-secondary'
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    1 = Very low energy, 5 = Very high energy
                  </p>
                </div>

                {/* Save Button */}
                <div className="relative pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={!canSave}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Save className="h-4 w-4" />
                    Save Entry
                    <span className="text-xs opacity-70">(+5 XP)</span>
                  </Button>
                  
                  {showSavedAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center bg-card rounded-lg">
                      <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                          <Zap className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <span className="text-lg font-bold text-accent">+5 XP</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insight */}
            {showAIInsight && (
              <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-2 duration-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">AI Insight</p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {aiInsights[entries.length % aiInsights.length]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weekly Streak */}
            {weekStreak >= 7 && (
              <Card className="border-accent/20 bg-accent/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                      <Trophy className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Weekly Bonus!</p>
                      <p className="text-xs text-muted-foreground">7-day streak earned +20 XP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Calendar Preview */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-[10px] text-muted-foreground py-1">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const hasEntry = journaledDates.has(dateStr)
                    const isSelected = dateStr === selectedDate
                    
                    return (
                      <button
                        key={day}
                        onClick={() => selectCalendarDate(day)}
                        className={cn(
                          'aspect-square rounded-md text-[10px] font-medium transition-all relative',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : hasEntry
                              ? 'bg-accent/20 text-foreground hover:bg-accent/30'
                              : 'text-muted-foreground hover:bg-secondary'
                        )}
                      >
                        {day}
                        {hasEntry && !isSelected && (
                          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-accent" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Journal Tips */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Journaling Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Write without judgment - this is your private space to reflect.
                </p>
                <p className="text-xs text-muted-foreground">
                  Even a few sentences count. Consistency matters more than length.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Calendar View */
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>
                {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const entry = entries.find(e => e.date === dateStr)
                const isSelected = dateStr === selectedDate
                const todayStr = new Date().toISOString().split('T')[0]
                const isToday = dateStr === todayStr
                
                return (
                  <button
                    key={day}
                    onClick={() => selectCalendarDate(day)}
                    className={cn(
                      'aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : entry
                          ? 'bg-accent/10 hover:bg-accent/20'
                          : isToday
                            ? 'ring-2 ring-primary/50 hover:bg-secondary'
                            : 'hover:bg-secondary'
                    )}
                  >
                    <span className={cn(
                      'text-sm font-medium',
                      !isSelected && !entry && 'text-muted-foreground'
                    )}>
                      {day}
                    </span>
                    {entry && (
                      <span className="text-lg">
                        {moodOptions.find(m => m.value === entry.mood)?.emoji}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
