'use client'

import { Zap, TrendingUp } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import type { UserStats } from '@/lib/types'

interface XPProgressProps {
  stats: UserStats
}

export function XPProgress({ stats }: XPProgressProps) {
  const progressPercent = (stats.xp / stats.nextLevelXp) * 100
  const xpToNext = stats.nextLevelXp - stats.xp

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Level {stats.level}</p>
            <h3 className="text-xl font-semibold text-foreground">{stats.levelTitle}</h3>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-accent">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">+{stats.weeklyXp} XP this week</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{stats.xp.toLocaleString()} XP</span>
          <span className="text-muted-foreground">{stats.nextLevelXp.toLocaleString()} XP</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        <p className="text-sm text-muted-foreground text-center">
          {xpToNext} XP to Level {stats.level + 1}
        </p>
      </div>
    </div>
  )
}
