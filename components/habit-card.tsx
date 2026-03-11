'use client'

import React from 'react'
import { useState } from 'react'
import { Check, Brain, Dumbbell, BookOpen, Droplet, Pen, Flame, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Habit } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface HabitCardProps {
  habit: Habit
  onComplete: (habitId: string) => void
  onMissed: (habit: Habit) => void
}

const iconMap: Record<string, React.ReactNode> = {
  brain: <Brain className="h-5 w-5" />,
  dumbbell: <Dumbbell className="h-5 w-5" />,
  book: <BookOpen className="h-5 w-5" />,
  droplet: <Droplet className="h-5 w-5" />,
  pen: <Pen className="h-5 w-5" />,
}

export function HabitCard({ habit, onComplete, onMissed }: HabitCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [showXP, setShowXP] = useState(false)

  const handleComplete = () => {
    if (habit.completedToday) return
    setIsCompleting(true)
    setShowXP(true)
    setTimeout(() => {
      onComplete(habit.id)
      setIsCompleting(false)
    }, 300)
    setTimeout(() => setShowXP(false), 1500)
  }

  return (
    <div
      className={cn(
        'group relative rounded-xl border p-4 transition-all duration-300',
        habit.completedToday
          ? 'border-accent/30 bg-accent/5'
          : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Checkbox
            checked={habit.completedToday}
            onCheckedChange={handleComplete}
            className={cn(
              'h-6 w-6 rounded-md border-2 transition-all duration-200',
              habit.completedToday 
                ? 'border-accent bg-accent data-[state=checked]:bg-accent' 
                : 'border-muted-foreground/30',
              isCompleting && 'scale-110'
            )}
          />
          {showXP && (
            <span className="absolute -top-2 -right-2 flex items-center gap-0.5 text-xs font-bold text-primary animate-in fade-in-0 zoom-in-50 slide-in-from-bottom-2 duration-300">
              <Sparkles className="h-3 w-3" />
              +10
            </span>
          )}
        </div>
        
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
          habit.completedToday
            ? 'bg-accent/20 text-accent'
            : 'bg-secondary text-muted-foreground'
        )}>
          {iconMap[habit.icon] || <Check className="h-5 w-5" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            'font-medium truncate transition-colors',
            habit.completedToday ? 'text-accent line-through opacity-70' : 'text-foreground'
          )}>
            {habit.name}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground capitalize">{habit.preferredTime}</span>
            {habit.streak > 0 && (
              <div className="flex items-center gap-1 text-xs text-chart-4">
                <Flame className="h-3 w-3" />
                <span>{habit.streak} day streak</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!habit.completedToday && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onMissed(habit)}
            >
              Missed
            </Button>
          )}
          
          {habit.completedToday && (
            <div className="flex items-center gap-1 text-xs font-medium text-accent">
              <Check className="h-4 w-4" />
              Done
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
