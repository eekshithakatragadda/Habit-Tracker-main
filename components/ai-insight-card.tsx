'use client'

import { Sparkles, Lightbulb, TrendingUp, Target } from 'lucide-react'
import type { AIInsight } from '@/lib/types'

interface AIInsightCardProps {
  insight: AIInsight
}

export function AIInsightCard({ insight }: AIInsightCardProps) {
  const getIcon = () => {
    switch (insight.type) {
      case 'encouragement':
        return <Sparkles className="h-5 w-5" />
      case 'suggestion':
        return <Lightbulb className="h-5 w-5" />
      case 'pattern':
        return <TrendingUp className="h-5 w-5" />
      case 'challenge':
        return <Target className="h-5 w-5" />
      default:
        return <Sparkles className="h-5 w-5" />
    }
  }

  const getLabel = () => {
    switch (insight.type) {
      case 'encouragement':
        return 'Motivation'
      case 'suggestion':
        return 'AI Suggestion'
      case 'pattern':
        return 'Pattern Detected'
      case 'challenge':
        return 'New Challenge'
      default:
        return 'Insight'
    }
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              {getLabel()}
            </span>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground">AI Coach</span>
            </div>
          </div>
          <p className="text-foreground leading-relaxed">{insight.message}</p>
        </div>
      </div>
    </div>
  )
}
