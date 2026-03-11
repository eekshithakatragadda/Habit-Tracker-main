'use client'

import { useState } from 'react'
import { X, Clock, BatteryLow, Brain, Cloud, Plane, Edit3, Sparkles, Lightbulb, CheckCircle2, ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Habit } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MissedHabitModalProps {
  habit: Habit | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (habitId: string, reasonId: string, customReason?: string) => void
}

const reasons = [
  { id: '1', label: 'No time', icon: <Clock className="h-5 w-5" /> },
  { id: '2', label: 'Low energy', icon: <BatteryLow className="h-5 w-5" /> },
  { id: '3', label: 'Forgot', icon: <Brain className="h-5 w-5" /> },
  { id: '4', label: 'Felt unmotivated', icon: <Cloud className="h-5 w-5" /> },
  { id: '5', label: 'Was traveling', icon: <Plane className="h-5 w-5" /> },
  { id: '6', label: 'Other', icon: <Edit3 className="h-5 w-5" /> },
]

// AI alternatives based on reason and habit type
const getAIAlternatives = (reasonId: string, habitName: string) => {
  const alternatives: Record<string, { title: string; suggestions: { text: string; action: string }[] }> = {
    '1': {
      title: "Short on time? Here are quick alternatives:",
      suggestions: [
        { text: `Do a 2-minute version of "${habitName}" right now`, action: "Start Mini Version" },
        { text: "Schedule it for your next break or commute time", action: "Schedule Later" },
        { text: "Combine it with another activity you're already doing", action: "Stack Habit" },
      ]
    },
    '2': {
      title: "Low energy? Try these lighter options:",
      suggestions: [
        { text: `Do a seated or relaxed version of "${habitName}"`, action: "Try Easy Mode" },
        { text: "Just prepare for tomorrow (lay out materials, set reminders)", action: "Prep for Tomorrow" },
        { text: "Do 25% of the habit - any progress counts!", action: "Do Quarter Version" },
      ]
    },
    '3': {
      title: "Forgot? Let's prevent this next time:",
      suggestions: [
        { text: "Set a reminder for the same time tomorrow", action: "Set Reminder" },
        { text: `Link "${habitName}" to an existing habit (after brushing teeth, etc.)`, action: "Create Habit Stack" },
        { text: "Place a visual cue where you'll see it", action: "Add Visual Trigger" },
      ]
    },
    '4': {
      title: "Feeling unmotivated? Start tiny:",
      suggestions: [
        { text: "Commit to just 1 minute - starting is the hardest part", action: "Start 1 Minute" },
        { text: `Remember why "${habitName}" matters to you`, action: "Review Your Why" },
        { text: "Do it with a friend or accountability partner", action: "Find Partner" },
      ]
    },
    '5': {
      title: "Traveling? Adapt your habit:",
      suggestions: [
        { text: `Create a travel-friendly version of "${habitName}"`, action: "Create Travel Mode" },
        { text: "Find a local alternative (hotel gym, park nearby)", action: "Find Alternative" },
        { text: "Use travel time productively for this habit", action: "Use Commute Time" },
      ]
    },
    '6': {
      title: "Let's find a solution together:",
      suggestions: [
        { text: "Break the habit into smaller, manageable steps", action: "Break Down Habit" },
        { text: "Identify and remove the specific blocker", action: "Remove Blocker" },
        { text: "Try a different time or environment", action: "Change Context" },
      ]
    }
  }
  return alternatives[reasonId] || alternatives['6']
}

export function MissedHabitModal({ habit, isOpen, onClose, onSubmit }: MissedHabitModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [customReason, setCustomReason] = useState('')
  const [showAISuggestion, setShowAISuggestion] = useState(false)

  if (!isOpen || !habit) return null

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId)
    setShowAISuggestion(true)
  }

  const handleSubmit = () => {
    if (selectedReason) {
      onSubmit(habit.id, selectedReason, selectedReason === '6' ? customReason : undefined)
      setSelectedReason(null)
      setCustomReason('')
      setShowAISuggestion(false)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedReason(null)
    setCustomReason('')
    setShowAISuggestion(false)
    onClose()
  }

  const aiSuggestions = getAIAlternatives(selectedReason || '6', habit.name)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-border bg-card p-6 shadow-xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Missed Habit Reflection</h2>
          <p className="text-muted-foreground mt-1">
            Why did you miss <span className="text-primary font-medium">{habit.name}</span>?
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {reasons.map((reason) => (
            <button
              key={reason.id}
              onClick={() => handleReasonSelect(reason.id)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border transition-all duration-200',
                selectedReason === reason.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-secondary/50 text-foreground hover:border-primary/50'
              )}
            >
              {reason.icon}
              <span className="text-sm font-medium">{reason.label}</span>
            </button>
          ))}
        </div>
        
        {selectedReason === '6' && (
          <div className="mb-6">
            <Textarea
              placeholder="Tell us more..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="bg-secondary/50 border-border resize-none"
              rows={3}
            />
          </div>
        )}
        
        {showAISuggestion && selectedReason && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{aiSuggestions.title}</span>
            </div>
            
            <div className="space-y-2">
              {aiSuggestions.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 p-3 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary mt-0.5">
                      <Zap className="h-3 w-3" />
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{suggestion.text}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {suggestion.action}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground text-center pt-2">
              Choose an alternative above, or log your reflection below
            </p>
          </div>
        )}
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={!selectedReason}
          >
            Log Reflection (+5 XP)
          </Button>
        </div>
      </div>
    </div>
  )
}
