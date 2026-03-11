'use client'

import { BarChart3, TrendingUp, Calendar, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts'
import type { Habit, UserStats } from '@/lib/types'
import { weeklyHeatmapData, monthlyProgressData } from '@/lib/data'

interface AnalyticsSectionProps {
  habits: Habit[]
  stats: UserStats
}

export function AnalyticsSection({ habits, stats }: AnalyticsSectionProps) {
  const avgCompletion = Math.round(habits.reduce((acc, h) => acc + h.completionRate, 0) / habits.length)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Deep insights into your habit patterns
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Completion', value: `${avgCompletion}%`, icon: <BarChart3 className="h-5 w-5" />, color: 'text-primary' },
          { label: 'Best Day', value: 'Monday', icon: <Calendar className="h-5 w-5" />, color: 'text-accent' },
          { label: 'Best Time', value: '7:00 AM', icon: <Clock className="h-5 w-5" />, color: 'text-chart-3' },
          { label: 'Weekly Trend', value: '+12%', icon: <TrendingUp className="h-5 w-5" />, color: 'text-chart-4' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Completion</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHeatmapData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Bar 
                  dataKey="completed" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Progress</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyProgressData}>
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--accent))', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Habit Performance</h3>
        <div className="space-y-4">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center gap-4">
              <div className="w-32 truncate">
                <span className="text-sm font-medium text-foreground">{habit.name}</span>
              </div>
              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${habit.completionRate}%` }}
                />
              </div>
              <div className="w-12 text-right">
                <span className="text-sm font-semibold text-foreground">{habit.completionRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap-style consistency view */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Consistency Heatmap</h3>
        <p className="text-sm text-muted-foreground mb-4">Last 4 weeks of habit completion</p>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center text-xs text-muted-foreground font-medium pb-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 28 }).map((_, i) => {
            const intensity = Math.random()
            return (
              <div
                key={i}
                className="aspect-square rounded-sm transition-colors"
                style={{
                  backgroundColor: intensity > 0.8 
                    ? 'hsl(var(--accent))' 
                    : intensity > 0.5 
                      ? 'hsl(var(--accent) / 0.6)' 
                      : intensity > 0.2 
                        ? 'hsl(var(--accent) / 0.3)' 
                        : 'hsl(var(--secondary))'
                }}
                title={`${Math.round(intensity * 100)}% completion`}
              />
            )
          })}
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-secondary" />
            <div className="w-3 h-3 rounded-sm bg-accent/30" />
            <div className="w-3 h-3 rounded-sm bg-accent/60" />
            <div className="w-3 h-3 rounded-sm bg-accent" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <h3 className="text-lg font-semibold text-foreground mb-3">Pattern Detected</h3>
          <p className="text-foreground leading-relaxed">
            You&apos;re most consistent on <span className="font-semibold text-primary">Mondays and Thursdays</span>. 
            Evening habits are missed <span className="font-semibold text-destructive">40% more often</span> than morning ones.
          </p>
        </div>
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
          <h3 className="text-lg font-semibold text-foreground mb-3">AI Recommendation</h3>
          <p className="text-foreground leading-relaxed">
            Consider moving your <span className="font-semibold text-accent">Workout</span> to the morning. 
            Based on your data, morning habits have a <span className="font-semibold text-accent">30% higher</span> completion rate.
          </p>
        </div>
      </div>
    </div>
  )
}
