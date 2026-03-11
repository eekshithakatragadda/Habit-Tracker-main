'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Sparkles, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const motivationalQuotes = [
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    quote: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma"
  },
  {
    quote: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar"
  },
  {
    quote: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Progress, not perfection, is what we should be asking of ourselves.",
    author: "Julia Cameron"
  },
  {
    quote: "Every accomplishment starts with the decision to try.",
    author: "John F. Kennedy"
  },
  {
    quote: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun"
  },
  {
    quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb"
  },
  {
    quote: "Your future is created by what you do today, not tomorrow.",
    author: "Robert Kiyosaki"
  },
  {
    quote: "Excellence is not a destination but a continuous journey that never ends.",
    author: "Brian Tracy"
  },
  {
    quote: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  }
]

interface DailyMotivationCardProps {
  onRefresh?: () => void
}

export function DailyMotivationCard({ onRefresh }: DailyMotivationCardProps) {
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0])
  const [canRefresh, setCanRefresh] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Get quote based on day of year for consistency
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const quoteIndex = dayOfYear % motivationalQuotes.length
    setCurrentQuote(motivationalQuotes[quoteIndex])
    
    // Check if refresh was used today
    const lastRefresh = localStorage.getItem('lastQuoteRefresh')
    const today = new Date().toDateString()
    if (lastRefresh === today) {
      setCanRefresh(false)
    }

    // Trigger load animation
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  const handleRefresh = () => {
    if (!canRefresh) return

    setIsAnimating(true)
    
    // Get a random different quote
    let newIndex = Math.floor(Math.random() * motivationalQuotes.length)
    while (motivationalQuotes[newIndex].quote === currentQuote.quote && motivationalQuotes.length > 1) {
      newIndex = Math.floor(Math.random() * motivationalQuotes.length)
    }

    setTimeout(() => {
      setCurrentQuote(motivationalQuotes[newIndex])
      setIsAnimating(false)
      setCanRefresh(false)
      localStorage.setItem('lastQuoteRefresh', new Date().toDateString())
      onRefresh?.()
    }, 500)
  }

  return (
    <Card className={cn(
      "border-border bg-card/50 overflow-hidden transition-all duration-700",
      isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/20">
              <Quote className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider text-warning">Daily Motivation</span>
                <Sparkles className="h-3 w-3 text-warning" />
              </div>
              <div className={cn(
                "transition-all duration-500",
                isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
              )}>
                <p className="text-foreground leading-relaxed italic">
                  &ldquo;{currentQuote.quote}&rdquo;
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  &mdash; {currentQuote.author}
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={!canRefresh}
            className={cn(
              "shrink-0 text-muted-foreground hover:text-foreground transition-all",
              isAnimating && "animate-spin"
            )}
            title={canRefresh ? "Get a new quote (once per day)" : "Come back tomorrow for a new quote"}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {!canRefresh && (
          <p className="text-xs text-muted-foreground text-center mt-3 pt-3 border-t border-border">
            New quote refresh available tomorrow
          </p>
        )}
      </CardContent>
    </Card>
  )
}
