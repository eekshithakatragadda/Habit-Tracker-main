'use client'

import { useEffect, useState } from 'react'
import { X, Sun, Sparkles, Trophy, Flame, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GoodMorningModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  yesterdayStats: {
    habitsCompleted: number
    totalHabits: number
    tasksCompleted: number
    currentStreak: number
  }
  onClaimXP: () => void
}

const greetings = [
  "Rise and shine",
  "Good morning",
  "Welcome back",
  "Hello",
  "Great to see you"
]

const getPersonalizedMessage = (stats: GoodMorningModalProps['yesterdayStats']) => {
  const { habitsCompleted, totalHabits, currentStreak } = stats
  const completionRate = totalHabits > 0 ? (habitsCompleted / totalHabits) * 100 : 0

  if (completionRate === 100) {
    return "You crushed it yesterday! Every single habit completed. Keep that momentum going today!"
  } else if (completionRate >= 80) {
    return `Amazing work yesterday! You completed ${habitsCompleted} out of ${totalHabits} habits. You're building something great.`
  } else if (completionRate >= 50) {
    return `Good effort yesterday with ${habitsCompleted} habits done. Every step forward counts. Today is a fresh start!`
  } else if (currentStreak > 0) {
    return `You're on a ${currentStreak}-day streak! That's incredible dedication. Let's make today count.`
  } else {
    return "Today is a brand new opportunity. Small steps lead to big changes. You've got this!"
  }
}

export function GoodMorningModal({ 
  isOpen, 
  onClose, 
  userName = "there",
  yesterdayStats,
  onClaimXP
}: GoodMorningModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [claimed, setClaimed] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  const handleClaim = () => {
    setClaimed(true)
    onClaimXP()
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  if (!isOpen) return null

  const greeting = greetings[Math.floor(Math.random() * greetings.length)]
  const message = getPersonalizedMessage(yesterdayStats)
  const timeOfDay = new Date().getHours()
  const isMorning = timeOfDay >= 5 && timeOfDay < 12

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className={cn(
          "absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      <div 
        className={cn(
          "relative w-full max-w-md mx-4 rounded-2xl border border-border bg-card p-6 shadow-xl transition-all duration-500",
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          {/* Animated sun/sparkle icon */}
          <div className="relative mx-auto mb-6 h-20 w-20">
            <div className={cn(
              "absolute inset-0 rounded-full bg-warning/20 transition-transform duration-1000",
              isVisible && "animate-pulse"
            )} />
            <div className="absolute inset-2 flex items-center justify-center rounded-full bg-warning/30">
              {isMorning ? (
                <Sun className="h-10 w-10 text-warning animate-[spin_10s_linear_infinite]" />
              ) : (
                <Star className="h-10 w-10 text-warning" />
              )}
            </div>
          </div>

          {/* Greeting */}
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {greeting}, {userName}!
          </h2>

          {/* Personalized AI message */}
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-primary">AI Coach</span>
            </div>
            <p className="text-foreground leading-relaxed">{message}</p>
          </div>

          {/* Yesterday's highlights */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-lg bg-secondary/50 p-3">
              <Trophy className="h-5 w-5 text-warning mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{yesterdayStats.habitsCompleted}</p>
              <p className="text-xs text-muted-foreground">Habits Done</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3">
              <Flame className="h-5 w-5 text-destructive mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{yesterdayStats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3">
              <Star className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{yesterdayStats.tasksCompleted}</p>
              <p className="text-xs text-muted-foreground">Tasks Done</p>
            </div>
          </div>

          {/* Claim XP Button */}
          {!claimed ? (
            <Button 
              onClick={handleClaim}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Sparkles className="h-4 w-4" />
              Claim Morning Bonus (+10 XP)
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-accent font-semibold animate-bounce">
              <Star className="h-5 w-5 fill-accent" />
              +10 XP Claimed!
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            Open the app each morning to earn bonus XP
          </p>
        </div>
      </div>
    </div>
  )
}
