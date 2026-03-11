'use client'

import React from "react"

import { Trophy, Brain, Flame, BarChart3, Sunrise, Award, Lock, Zap } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import type { UserStats } from '@/lib/types'
import { cn } from '@/lib/utils'
import { levelTitles } from '@/lib/data'

interface AchievementsSectionProps {
  stats: UserStats
}

const badgeIcons: Record<string, React.ReactNode> = {
  brain: <Brain className="h-6 w-6" />,
  flame: <Flame className="h-6 w-6" />,
  chart: <BarChart3 className="h-6 w-6" />,
  sunrise: <Sunrise className="h-6 w-6" />,
  trophy: <Trophy className="h-6 w-6" />,
}

export function AchievementsSection({ stats }: AchievementsSectionProps) {
  const progressPercent = (stats.xp / stats.nextLevelXp) * 100
  const unlockedBadges = stats.badges.filter(b => b.unlocked)
  const lockedBadges = stats.badges.filter(b => !b.unlocked)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Levels & Badges</h2>
        <p className="text-muted-foreground mt-1">
          Your journey to becoming a Habit Master
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {stats.level}
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground">{stats.levelTitle}</h3>
              <p className="text-sm text-muted-foreground mt-1">Level {stats.level}</p>
              
              <div className="w-full mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{stats.xp.toLocaleString()} XP</span>
                  <span className="text-muted-foreground">{stats.nextLevelXp.toLocaleString()} XP</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {stats.nextLevelXp - stats.xp} XP to next level
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Level Progression</h3>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {Object.entries(levelTitles).slice(0, 10).map(([level, title]) => {
                  const levelNum = parseInt(level)
                  const isCurrentOrPast = levelNum <= stats.level
                  const isCurrent = levelNum === stats.level
                  return (
                    <div
                      key={level}
                      className={cn(
                        'rounded-lg p-3 text-center transition-all',
                        isCurrent
                          ? 'border-2 border-primary bg-primary/10'
                          : isCurrentOrPast
                          ? 'bg-accent/10 border border-accent/30'
                          : 'bg-secondary/50 border border-border'
                      )}
                    >
                      <p className={cn(
                        'text-lg font-bold',
                        isCurrent ? 'text-primary' : isCurrentOrPast ? 'text-accent' : 'text-muted-foreground'
                      )}>
                        {level}
                      </p>
                      <p className={cn(
                        'text-xs mt-1 truncate',
                        isCurrentOrPast ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {title}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Unlocked Badges ({unlockedBadges.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {unlockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-xl border border-accent/30 bg-accent/5 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
                      {badgeIcons[badge.icon] || <Award className="h-6 w-6" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                      {badge.unlockedAt && (
                        <p className="text-xs text-accent mt-1">
                          Unlocked {badge.unlockedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Locked Badges ({lockedBadges.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-xl border border-border bg-secondary/30 p-4 opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
