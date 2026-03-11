'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return {
    id: profile.id,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    xp: profile.xp || 0,
    level: profile.level || 1,
    currentStreak: profile.current_streak || 0,
    bestStreak: profile.best_streak || 0,
    totalHabitsCompleted: profile.total_habits_completed || 0,
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at)
  }
}

export async function updateProfile(data: {
  displayName?: string
  avatarUrl?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: data.displayName,
      avatar_url: data.avatarUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) throw error
  
  revalidatePath('/')
}

export async function awardMorningXP() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const today = new Date().toISOString().split('T')[0]
  
  // Check if morning XP already claimed today
  const { data: existing } = await supabase
    .from('xp_transactions')
    .select('id')
    .eq('user_id', user.id)
    .eq('reason', 'morning_checkin')
    .gte('created_at', `${today}T00:00:00`)
    .single()

  if (existing) {
    return { alreadyClaimed: true }
  }

  // Award XP
  await supabase
    .from('xp_transactions')
    .insert({
      user_id: user.id,
      amount: 10,
      reason: 'morning_checkin'
    })

  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', user.id)
    .single()

  if (profile) {
    const newXp = (profile.xp || 0) + 10
    const newLevel = calculateLevel(newXp)
    
    await supabase
      .from('profiles')
      .update({ 
        xp: newXp, 
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
  }

  revalidatePath('/')
  return { alreadyClaimed: false, xpAwarded: 10 }
}

export async function getUserStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const todayStr = today.toISOString().split('T')[0]
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get weekly XP
  const { data: weeklyXpData } = await supabase
    .from('xp_transactions')
    .select('amount')
    .eq('user_id', user.id)
    .gte('created_at', weekAgoStr)

  const weeklyXp = weeklyXpData?.reduce((sum, t) => sum + t.amount, 0) || 0

  // Get today's completed habits
  const { data: todayLogs } = await supabase
    .from('habit_logs')
    .select('completed')
    .eq('user_id', user.id)
    .eq('date', todayStr)

  const habitsCompletedToday = todayLogs?.filter(l => l.completed).length || 0

  // Get total habits
  const { data: habits } = await supabase
    .from('habits')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const totalHabits = habits?.length || 0

  // Calculate streak from consecutive days with any habit completion
  let currentStreak = 0
  const { data: recentLogs } = await supabase
    .from('habit_logs')
    .select('date, completed')
    .eq('user_id', user.id)
    .eq('completed', true)
    .order('date', { ascending: false })
    .limit(30)

  if (recentLogs && recentLogs.length > 0) {
    const uniqueDates = [...new Set(recentLogs.map(l => l.date))].sort().reverse()
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      const expectedStr = expectedDate.toISOString().split('T')[0]
      
      if (uniqueDates[i] === expectedStr) {
        currentStreak++
      } else {
        break
      }
    }
  }

  return {
    xp: profile?.xp || 0,
    level: profile?.level || 1,
    currentStreak,
    bestStreak: Math.max(currentStreak, profile?.best_streak || 0),
    weeklyXp,
    habitsCompletedToday,
    totalHabits,
    displayName: profile?.display_name
  }
}

function calculateLevel(xp: number): number {
  const levels = [0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600, 6000]
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i]) return i + 1
  }
  return 1
}
