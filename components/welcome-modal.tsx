'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Zap, Target, Trophy, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
}

const features = [
  {
    icon: <Target className="h-5 w-5" />,
    title: 'Track Daily Habits',
    description: 'Build consistency with daily habit tracking'
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Earn XP & Level Up',
    description: 'Complete habits to gain XP and unlock levels'
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'AI-Powered Insights',
    description: 'Get personalized suggestions to improve'
  },
  {
    icon: <Trophy className="h-5 w-5" />,
    title: 'Achieve Goals',
    description: 'Set goals and celebrate your progress'
  }
]

export function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Stagger feature animations
      const timer = setTimeout(() => setShowFeatures(true), 500)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
      setShowFeatures(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className={cn(
          "relative w-full max-w-lg mx-4 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden transition-all duration-500",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Confetti/celebration background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative p-6 sm:p-8">
          {/* Welcome icon */}
          <div className="flex justify-center mb-6">
            <div className={cn(
              "flex h-20 w-20 items-center justify-center rounded-2xl bg-primary transition-all duration-700",
              isVisible ? "scale-100 rotate-0" : "scale-0 rotate-180"
            )}>
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8">
            <h2 className={cn(
              "text-2xl sm:text-3xl font-bold text-foreground mb-2 transition-all duration-500 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              Welcome to HabitFlow, {userName}!
            </h2>
            <p className={cn(
              "text-muted-foreground transition-all duration-500 delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              {"Your journey to better habits starts now. Here's what you can do:"}
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={cn(
                  "p-4 rounded-xl bg-secondary/30 border border-border transition-all duration-500",
                  showFeatures ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
                style={{ transitionDelay: `${400 + index * 100}ms` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Starting stats */}
          <div className={cn(
            "flex items-center justify-center gap-6 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6 transition-all duration-500",
            showFeatures ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: '800ms' }}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">1</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-lg font-semibold text-accent">Newcomer</p>
              <p className="text-xs text-muted-foreground">Title</p>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={onClose} 
            className={cn(
              "w-full h-12 text-base font-semibold gap-2 transition-all duration-500",
              showFeatures ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: '900ms' }}
          >
            {"Let's Get Started"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
