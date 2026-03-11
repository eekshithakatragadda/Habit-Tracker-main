'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTasks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  return tasks?.map(task => ({
    id: task.id,
    title: task.title,
    priority: task.priority as 'low' | 'medium' | 'high',
    dueDate: task.due_date ? new Date(task.due_date) : undefined,
    completed: task.completed,
    completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
    createdAt: new Date(task.created_at)
  })) || []
}

export async function createTask(data: {
  title: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: data.title,
      priority: data.priority,
      due_date: data.dueDate?.toISOString().split('T')[0]
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/')
  return task
}

export async function toggleTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Get current task state
  const { data: task } = await supabase
    .from('tasks')
    .select('completed')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()

  if (!task) throw new Error('Task not found')

  const wasCompleted = task.completed
  const nowCompleted = !wasCompleted

  // Update task
  const { error } = await supabase
    .from('tasks')
    .update({
      completed: nowCompleted,
      completed_at: nowCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) throw error

  // Award XP for completing a task
  if (nowCompleted) {
    await awardXP(user.id, 5, 'task_completion', 'task', taskId)
    
    // Check if all tasks for today are completed for bonus
    const today = new Date().toISOString().split('T')[0]
    const { data: todayTasks } = await supabase
      .from('tasks')
      .select('completed')
      .eq('user_id', user.id)
      .or(`due_date.eq.${today},due_date.is.null`)
    
    const allCompleted = todayTasks?.every(t => t.completed || t.completed)
    if (allCompleted && todayTasks && todayTasks.length > 1) {
      await awardXP(user.id, 20, 'all_tasks_completed', 'task', taskId)
    }
  }

  revalidatePath('/')
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) throw error
  
  revalidatePath('/')
}

async function awardXP(userId: string, amount: number, reason: string, refType?: string, refId?: string) {
  const supabase = await createClient()
  
  await supabase
    .from('xp_transactions')
    .insert({
      user_id: userId,
      amount,
      reason,
      reference_type: refType,
      reference_id: refId
    })

  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', userId)
    .single()

  if (profile) {
    const newXp = (profile.xp || 0) + amount
    const newLevel = calculateLevel(newXp)
    
    await supabase
      .from('profiles')
      .update({ 
        xp: newXp, 
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
  }
}

function calculateLevel(xp: number): number {
  const levels = [0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600, 6000]
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i]) return i + 1
  }
  return 1
}
