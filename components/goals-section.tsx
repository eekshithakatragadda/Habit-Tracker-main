'use client'

import React from "react"

import { Target, TrendingUp, Brain, Flame, Zap, CheckCircle2, Sparkles, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Goal, UserStats } from '@/lib/types'
import { cn } from '@/lib/utils'

interface GoalsSectionProps {
  goals: Goal[]
  stats: UserStats
}

const goalIcons: Record<string, React.ReactNode> = {
  consistency: <Target className="h-5 w-5" />,
  improvement: <TrendingUp className="h-5 w-5" />,
  reflection: <Brain className="h-5 w-5" />,
  challenge: <Flame className="h-5 w-5" />,
}

const goalColors: Record<string, string> = {
  consistency: 'text-primary',
  improvement: 'text-chart-4',
  reflection: 'text-chart-2',
  challenge: 'text-accent',
}

export function GoalsSection({ goals, stats }: GoalsSectionProps) {
  const activeGoals = goals.filter(g => !g.completed)
  const completedGoals = goals.filter(g => g.completed)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Goals & Challenges</h2>
        <p className="text-muted-foreground mt-1">
          Smart goals that adapt to your progress
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Active Goals</h3>
          {activeGoals.map((goal) => {
            const progressPercent = (goal.progress / goal.target) * 100
            return (
              <div
                key={goal.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary',
                    goalColors[goal.type]
                  )}>
                    {goalIcons[goal.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-foreground">{goal.title}</h4>
                      <div className="flex items-center gap-1 text-primary">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm font-medium">+{goal.xpReward} XP</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">
                          {goal.progress}/{goal.target}
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Goal Types</h3>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">AI Suggested Goal</p>
                <p className="text-sm font-medium text-foreground mt-1">Morning Routine Mastery</p>
                <p className="text-xs text-muted-foreground mt-1">Complete all morning habits for 7 consecutive days</p>
              </div>
            </div>
            <Button size="sm" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </div>
          
          <div className="space-y-3">
            {[
              { type: 'consistency', label: 'Consistency Goals', desc: 'Maintain completion rates' },
              { type: 'improvement', label: 'Improvement Goals', desc: 'Reduce missed habits' },
              { type: 'reflection', label: 'Reflection Goals', desc: 'Learn from mistakes' },
              { type: 'challenge', label: 'Challenges', desc: 'Push your limits' },
            ].map((item) => (
              <div
                key={item.type}
                className="rounded-lg border border-border bg-secondary/30 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('shrink-0', goalColors[item.type])}>
                    {goalIcons[item.type]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {completedGoals.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-foreground mt-6">Completed</h3>
              {completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-lg border border-accent/30 bg-accent/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{goal.title}</p>
                      <p className="text-xs text-accent">+{goal.xpReward} XP earned</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
