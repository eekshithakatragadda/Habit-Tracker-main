'use client'

import { Plus, Filter } from 'lucide-react'
import { HabitCard } from '@/components/habit-card'
import { Button } from '@/components/ui/button'
import type { Habit } from '@/lib/types'

interface HabitsSectionProps {
  habits: Habit[]
  onComplete: (habitId: string) => void
  onMissed: (habit: Habit) => void
}

export function HabitsSection({ habits, onComplete, onMissed }: HabitsSectionProps) {
  const categories = [...new Set(habits.map(h => h.category))]
  const completedCount = habits.filter(h => h.completedToday).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Habits</h2>
          <p className="text-muted-foreground mt-1">
            {completedCount} of {habits.length} completed today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Habit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {categories.map((category) => {
            const categoryHabits = habits.filter(h => h.category === category)
            return (
              <div key={category}>
                <h3 className="text-lg font-semibold text-foreground mb-3">{category}</h3>
                <div className="space-y-3">
                  {categoryHabits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onComplete={onComplete}
                      onMissed={onMissed}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Habits</span>
              <span className="font-semibold text-foreground">{habits.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Categories</span>
              <span className="font-semibold text-foreground">{categories.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Completion</span>
              <span className="font-semibold text-foreground">
                {Math.round(habits.reduce((acc, h) => acc + h.completionRate, 0) / habits.length)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Longest Streak</span>
              <span className="font-semibold text-foreground">
                {Math.max(...habits.map(h => h.streak))} days
              </span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-foreground mt-6">Tips</h3>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm text-foreground leading-relaxed">
              Stack new habits with existing ones. For example, do your meditation right after brushing your teeth in the morning.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
