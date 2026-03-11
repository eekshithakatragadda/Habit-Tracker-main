'use client'

import React from "react"

import { useState } from 'react'
import { X, Flag, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (task: { title: string; priority: 'low' | 'medium' | 'high'; dueDate?: Date }) => void
}

const priorities = [
  { id: 'low', label: 'Low', color: 'bg-muted text-muted-foreground' },
  { id: 'medium', label: 'Medium', color: 'bg-warning/20 text-warning-foreground' },
  { id: 'high', label: 'High', color: 'bg-destructive/20 text-destructive' },
] as const

export function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onAdd({
      title: title.trim(),
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined
    })

    setTitle('')
    setPriority('medium')
    setDueDate('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Add New Task</h2>
          <p className="text-sm text-muted-foreground mt-1">Create a task and earn XP when you complete it</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              className="h-11"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Priority</Label>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                    priority === p.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50'
                  )}
                >
                  <Flag className={cn(
                    'h-4 w-4',
                    p.id === 'low' && 'text-muted-foreground',
                    p.id === 'medium' && 'text-warning',
                    p.id === 'high' && 'text-destructive'
                  )} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-medium text-foreground">
              Due Date <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-11 pl-10"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()} className="flex-1">
              Add Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
