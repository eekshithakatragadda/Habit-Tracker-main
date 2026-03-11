'use client'

import { Zap, Lock, Check, Trophy, Star, Award, Crown, Gem } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import type { UserStats } from '@/lib/types'
import { cn } from '@/lib/utils'

interface LevelsSectionProps {
  stats: UserStats
}

const levels = [
  { level: 1, title: 'Habit Beginner', xpRequired: 0, icon: Star },
  { level: 2, title: 'Habit Starter', xpRequired: 100, icon: Star },
  { level: 3, title: 'Habit Explorer', xpRequired: 250, icon: Star },
  { level: 4, title: 'Habit Learner', xpRequired: 450, icon: Award },
  { level: 5, title: 'Consistency Builder', xpRequired: 700, icon: Award },
  { level: 6, title: 'Habit Practitioner', xpRequired: 1000, icon: Award },
  { level: 7, title: 'Habit Enthusiast', xpRequired: 1350, icon: Trophy },
  { level: 8, title: 'Focused Achiever', xpRequired: 1750, icon: Trophy },
  { level: 9, title: 'Habit Expert', xpRequired: 2200, icon: Trophy },
  { level: 10, title: 'Habit Champion', xpRequired: 2700, icon: Crown },
  { level: 15, title: 'Habit Master', xpRequired: 5000, icon: Crown },
  { level: 20, title: 'Life Optimizer', xpRequired: 8500, icon: Gem },
]

export function LevelsSection({ stats }: LevelsSectionProps) {
  const currentLevelIndex = levels.findIndex(l => l.level === stats.level)
  const nextLevel = levels[currentLevelIndex + 1]
  const progressToNext = nextLevel 
    ? ((stats.xp - levels[currentLevelIndex].xpRequired) / (nextLevel.xpRequired - levels[currentLevelIndex].xpRequired)) * 100
    : 100

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Levels & Progress</h2>
        <p className="text-muted-foreground mt-1">Track your journey and unlock new titles</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Current Level</p>
            <h3 className="text-2xl font-bold text-foreground">Level {stats.level}</h3>
            <p className="text-lg font-medium text-primary">{stats.levelTitle}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">{stats.xp.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total XP</p>
          </div>
        </div>

        {nextLevel && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to Level {nextLevel.level}</span>
              <span className="font-medium text-foreground">{Math.round(progressToNext)}%</span>
            </div>
            <Progress value={progressToNext} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {nextLevel.xpRequired - stats.xp} XP to <span className="text-primary font-medium">{nextLevel.title}</span>
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {levels.map((level, index) => {
          const isUnlocked = stats.xp >= level.xpRequired
          const isCurrent = stats.level === level.level
          const Icon = level.icon

          return (
            <div
              key={level.level}
              className={cn(
                'flex items-center gap-4 rounded-xl border p-4 transition-all',
                isCurrent 
                  ? 'border-primary bg-primary/5' 
                  : isUnlocked 
                    ? 'border-accent/30 bg-accent/5' 
                    : 'border-border bg-card opacity-60'
              )}
            >
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl',
                isCurrent 
                  ? 'bg-primary text-primary-foreground' 
                  : isUnlocked 
                    ? 'bg-accent/20 text-accent' 
                    : 'bg-secondary text-muted-foreground'
              )}>
                {isUnlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    'font-semibold',
                    isCurrent ? 'text-primary' : isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    Level {level.level}
                  </h4>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                      Current
                    </span>
                  )}
                </div>
                <p className={cn(
                  'text-sm',
                  isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/60'
                )}>
                  {level.title}
                </p>
              </div>
              
              <div className="text-right">
                <p className={cn(
                  'text-sm font-medium',
                  isUnlocked ? 'text-accent' : 'text-muted-foreground'
                )}>
                  {level.xpRequired.toLocaleString()} XP
                </p>
                {isUnlocked && !isCurrent && (
                  <div className="flex items-center gap-1 text-xs text-accent mt-1">
                    <Check className="h-3 w-3" />
                    Unlocked
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
