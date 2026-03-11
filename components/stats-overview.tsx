'use client'

import { Flame, Target, CheckCircle2, Calendar } from 'lucide-react'
import type { UserStats, Habit } from '@/lib/types'

interface StatsOverviewProps {
  stats: UserStats
  habits: Habit[]
}

export function StatsOverview({ stats, habits }: StatsOverviewProps) {
  const todayCompleted = habits.filter(h => h.completedToday).length
  const todayTotal = habits.length
  const completionPercent = Math.round((todayCompleted / todayTotal) * 100)

  const statCards = [
    {
      label: "Today's Progress",
      value: `${todayCompleted}/${todayTotal}`,
      subtext: `${completionPercent}% complete`,
      icon: <Target className="h-5 w-5" />,
      color: 'text-primary'
    },
    {
      label: 'Current Streak',
      value: `${stats.currentStreak}`,
      subtext: 'days in a row',
      icon: <Flame className="h-5 w-5" />,
      color: 'text-chart-4'
    },
    {
      label: 'Total Completed',
      value: stats.totalHabitsCompleted.toLocaleString(),
      subtext: 'all time',
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: 'text-accent'
    },
    {
      label: 'Best Day',
      value: 'Monday',
      subtext: '95% avg completion',
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-chart-3'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className={`${stat.color} mb-3`}>
            {stat.icon}
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          <p className="text-xs text-muted-foreground">{stat.subtext}</p>
        </div>
      ))}
    </div>
  )
}
