'use client'

import React from "react"

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface AddHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (habit: { name: string; frequency: string; preferredTime: string }) => void
}

const frequencies = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
]

const times = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
]

export function AddHabitModal({ isOpen, onClose, onAdd }: AddHabitModalProps) {
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [preferredTime, setPreferredTime] = useState('morning')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onAdd({ name: name.trim(), frequency, preferredTime })
      setName('')
      setFrequency('daily')
      setPreferredTime('morning')
      onClose()
    }
  }

  const handleClose = () => {
    setName('')
    setFrequency('daily')
    setPreferredTime('morning')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Add New Habit</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create a habit to track and build consistency
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="habit-name" className="text-sm font-medium text-foreground">
              Habit Name
            </Label>
            <Input
              id="habit-name"
              placeholder="e.g., Morning Meditation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/50 border-border"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Frequency</Label>
            <div className="flex gap-2">
              {frequencies.map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setFrequency(freq.id)}
                  className={cn(
                    'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 border',
                    frequency === freq.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary/50 text-foreground border-border hover:border-primary/50'
                  )}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Preferred Time</Label>
            <div className="flex gap-2">
              {times.map((time) => (
                <button
                  key={time.id}
                  type="button"
                  onClick={() => setPreferredTime(time.id)}
                  className={cn(
                    'flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 border',
                    preferredTime === time.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary/50 text-foreground border-border hover:border-primary/50'
                  )}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!name.trim()}
            >
              Save Habit
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
