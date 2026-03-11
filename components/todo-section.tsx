'use client'

import { useState, useMemo } from 'react'
import { Plus, CheckCircle2, Circle, Flag, Calendar, Sparkles, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AddTaskModal } from '@/components/add-task-modal'
import type { Todo } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TodoSectionProps {
  todos: Todo[]
  onAddTodo: (task: { title: string; priority: 'low' | 'medium' | 'high'; dueDate?: Date }) => void
  onToggleTodo: (id: string) => void
}

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
] as const

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/20 text-warning-foreground border-warning/30',
  high: 'bg-destructive/20 text-destructive border-destructive/30',
}

const priorityDotColors = {
  low: 'bg-muted-foreground',
  medium: 'bg-warning',
  high: 'bg-destructive',
}

export function TodoSection({ todos, onAddTodo, onToggleTodo }: TodoSectionProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null)

  const filteredTodos = useMemo(() => {
    let filtered = [...todos]
    
    if (activeFilter === 'pending') {
      filtered = filtered.filter(t => !t.completed)
    } else if (activeFilter === 'completed') {
      filtered = filtered.filter(t => t.completed)
    }

    // Sort: pending first (by priority), then completed at bottom
    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      if (!a.completed && !b.completed) {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return 0
    })
  }, [todos, activeFilter])

  const pendingCount = todos.filter(t => !t.completed).length
  const completedCount = todos.filter(t => t.completed).length
  const todayCompleted = todos.filter(t => {
    if (!t.completed || !t.completedAt) return false
    const today = new Date()
    const completedDate = new Date(t.completedAt)
    return completedDate.toDateString() === today.toDateString()
  }).length

  const handleToggle = (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (todo && !todo.completed) {
      setRecentlyCompleted(id)
      setTimeout(() => setRecentlyCompleted(null), 1500)
    }
    onToggleTodo(id)
  }

  const formatDueDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isOverdue = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">To-Do List</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pendingCount} pending, {completedCount} completed
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tasks Today</p>
            <p className="text-2xl font-bold text-foreground mt-1">{todayCompleted}</p>
            <p className="text-xs text-primary mt-1">+{todayCompleted * 5} XP earned</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-foreground mt-1">{pendingCount}</p>
            <p className="text-xs text-muted-foreground mt-1">tasks remaining</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%
            </p>
            <p className="text-xs text-accent mt-1">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* All tasks completed bonus */}
      {pendingCount === 0 && completedCount > 0 && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20">
                <Trophy className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">All Tasks Complete!</p>
                <p className="text-xs text-muted-foreground">You earned a +20 XP bonus for completing all your tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
              activeFilter === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
            {tab.id === 'pending' && pendingCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">
              {activeFilter === 'completed' ? 'No completed tasks yet' : 'No tasks yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {activeFilter === 'completed' 
                ? 'Complete some tasks to see them here'
                : 'Add a task to get started and earn XP'}
            </p>
            {activeFilter !== 'completed' && (
              <Button onClick={() => setShowAddModal(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Task
              </Button>
            )}
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                'group relative flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-300',
                todo.completed && 'bg-secondary/30 border-border/50',
                recentlyCompleted === todo.id && 'border-accent bg-accent/5'
              )}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(todo.id)}
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
                  todo.completed
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-muted-foreground/30 hover:border-primary'
                )}
              >
                {todo.completed && (
                  <CheckCircle2 className="h-4 w-4 animate-in zoom-in-50 duration-200" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      'text-sm font-medium text-foreground transition-all duration-300',
                      todo.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {todo.title}
                  </p>

                  {/* Priority Badge */}
                  <span
                    className={cn(
                      'shrink-0 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
                      priorityColors[todo.priority],
                      todo.completed && 'opacity-50'
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', priorityDotColors[todo.priority])} />
                    {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                  </span>
                </div>

                {/* Due Date */}
                {todo.dueDate && (
                  <div className={cn(
                    'flex items-center gap-1 mt-1.5 text-xs',
                    isOverdue(new Date(todo.dueDate)) && !todo.completed
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  )}>
                    <Calendar className="h-3 w-3" />
                    <span>
                      {isOverdue(new Date(todo.dueDate)) && !todo.completed && 'Overdue: '}
                      {formatDueDate(new Date(todo.dueDate))}
                    </span>
                  </div>
                )}
              </div>

              {/* XP Animation */}
              {recentlyCompleted === todo.id && (
                <div className="absolute -top-2 right-4 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-primary">+5 XP</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddTodo}
      />
    </div>
  )
}
