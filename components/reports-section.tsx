'use client'

import { Mail, Calendar, TrendingUp, Award, Zap, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WeeklyReport, UserStats } from '@/lib/types'

interface ReportsSectionProps {
  report: WeeklyReport
  stats: UserStats
}

export function ReportsSection({ report, stats }: ReportsSectionProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Email Reports</h2>
          <p className="text-muted-foreground mt-1">
            Preview your weekly and monthly progress reports
          </p>
        </div>
        <Button className="gap-2">
          <Mail className="h-4 w-4" />
          Send Test Email
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-primary/10 border-b border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">HabitFlow</h3>
                  <p className="text-sm text-muted-foreground">Weekly Progress Report</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(report.weekStart)} - {formatDate(report.weekEnd)}</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center py-4">
                <p className="text-5xl font-bold text-primary mb-2">{report.completionRate}%</p>
                <p className="text-muted-foreground">Weekly Completion Rate</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-accent/10 p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">+{report.xpEarned}</p>
                  <p className="text-sm text-muted-foreground">XP Earned</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">Level {stats.level}</p>
                  <p className="text-sm text-muted-foreground">{stats.levelTitle}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Highlights</h4>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Best Day: {report.bestDay}</p>
                    <p className="text-xs text-muted-foreground">You crushed it!</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Most Consistent: {report.mostConsistentHabit}</p>
                    <p className="text-xs text-muted-foreground">Keep it up!</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Needs Work: {report.mostMissedHabit}</p>
                    <p className="text-xs text-muted-foreground">Try adjusting the time or duration</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">AI Insights</h4>
                    <ul className="space-y-2">
                      {report.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Report Settings</h3>
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Weekly Reports</p>
                <p className="text-xs text-muted-foreground">Every Sunday at 9 AM</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary p-1">
                <div className="h-4 w-4 rounded-full bg-primary-foreground translate-x-5" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Monthly Reports</p>
                <p className="text-xs text-muted-foreground">1st of each month</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary p-1">
                <div className="h-4 w-4 rounded-full bg-primary-foreground translate-x-5" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Include AI Insights</p>
                <p className="text-xs text-muted-foreground">Personalized suggestions</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary p-1">
                <div className="h-4 w-4 rounded-full bg-primary-foreground translate-x-5" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
            <h4 className="font-semibold text-foreground mb-2">Why Email Reports?</h4>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                Stay motivated even when not using the app
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                Track long-term progress over weeks and months
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                Get AI-powered suggestions delivered to you
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
