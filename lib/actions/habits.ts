'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getHabits() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const today = new Date().toISOString().split('T')[0]
  
 const { data: habits } = await supabase
  .from('habits')
  .select(`
    *,
    habit_logs!left (
      id,
      date,
      completed,
      completed_at,
      missed_reason,
      reflection
    )
  `)
  .eq('user_id', user.id)
  .eq('is_active', true)
  .order('created_at', { ascending: false })

  // Transform to include today's completion status
  return habits?.map(habit => {
    const todayLog = habit.habit_logs?.find((log: { date: string }) => log.date === today)
    return {
      ...habit,
      completedToday: todayLog?.completed || false,
      completionRate: calculateCompletionRate(habit.habit_logs || [])
    }
  }) || []
}

function calculateCompletionRate(logs: { completed: boolean }[]) {
  if (logs.length === 0) return 0
  const completed = logs.filter(l => l.completed).length
  return Math.round((completed / logs.length) * 100)
}

export async function createHabit(data: {
  name: string
  icon?: string
  category?: string
  frequency: string
  preferredTime: string
  targetDays?: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data: habit, error } = await supabase
    .from('habits')
    .insert({
      user_id: user.id,
      name: data.name,
      icon: data.icon || 'circle',
      category: data.category,
      frequency: data.frequency,
      preferred_time: data.preferredTime,
      target_days: data.targetDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/')
  return habit
}

export async function completeHabit(habitId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const today = new Date().toISOString().split('T')[0]

  // Upsert the habit log for today
  const { error: logError } = await supabase
    .from('habit_logs')
    .upsert({
      habit_id: habitId,
      user_id: user.id,
      date: today,
      completed: true,
      completed_at: new Date().toISOString()
    }, {
      onConflict: 'habit_id,date'
    })

  if (logError) throw logError

  // Update streak
  const { data: habit } = await supabase
    .from('habits')
    .select('streak, best_streak')
    .eq('id', habitId)
    .single()

  if (habit) {
    const newStreak = (habit.streak || 0) + 1
    const newBestStreak = Math.max(newStreak, habit.best_streak || 0)
    
    await supabase
      .from('habits')
      .update({ 
        streak: newStreak, 
        best_streak: newBestStreak,
        updated_at: new Date().toISOString()
      })
      .eq('id', habitId)
  }

  // Award XP
  await awardXP(user.id, 10, 'habit_completion', 'habit', habitId)

  revalidatePath('/')
}

export async function logMissedHabit(habitId: string, reasonId: string, reflection?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const today = new Date().toISOString().split('T')[0]
  
  const reasonMap: Record<string, string> = {
    '1': 'No time',
    '2': 'Low energy',
    '3': 'Forgot',
    '4': 'Felt unmotivated',
    '5': 'Was traveling',
    '6': 'Other'
  }

  const { error } = await supabase
    .from('habit_logs')
    .upsert({
      habit_id: habitId,
      user_id: user.id,
      date: today,
      completed: false,
      missed_reason: reasonMap[reasonId] || 'Other',
      reflection: reflection
    }, {
      onConflict: 'habit_id,date'
    })

  if (error) throw error

  // Reset streak
  await supabase
    .from('habits')
    .update({ streak: 0, updated_at: new Date().toISOString() })
    .eq('id', habitId)

  // Award XP for reflection (learning from mistakes)
  if (reflection) {
    await awardXP(user.id, 5, 'habit_reflection', 'habit', habitId)
  }

  revalidatePath('/')
}

export async function deleteHabit(habitId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('habits')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', habitId)
    .eq('user_id', user.id)

  if (error) throw error
  
  revalidatePath('/')
}

async function awardXP(userId: string, amount: number, reason: string, refType?: string, refId?: string) {
  const supabase = await createClient()
  
  // Record XP transaction
  await supabase
    .from('xp_transactions')
    .insert({
      user_id: userId,
      amount,
      reason,
      reference_type: refType,
      reference_id: refId
    })

  // Update profile XP
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
