'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getJournalEntries() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .order('date', { ascending: false })

  return entries?.map(entry => ({
    id: entry.id,
    date: entry.date,
    content: entry.content,
    mood: entry.mood as 'great' | 'good' | 'okay' | 'low' | 'bad',
    energyLevel: entry.energy_level,
    morningIntention: entry.morning_intention,
    eveningReflection: entry.evening_reflection,
    createdAt: new Date(entry.created_at),
    updatedAt: new Date(entry.updated_at)
  })) || []
}

export async function getJournalEntry(date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: entry } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('date', date)
    .single()

  if (!entry) return null

  return {
    id: entry.id,
    date: entry.date,
    content: entry.content,
    mood: entry.mood as 'great' | 'good' | 'okay' | 'low' | 'bad',
    energyLevel: entry.energy_level,
    morningIntention: entry.morning_intention,
    eveningReflection: entry.evening_reflection,
    createdAt: new Date(entry.created_at),
    updatedAt: new Date(entry.updated_at)
  }
}

export async function saveJournalEntry(data: {
  date: string
  content?: string
  mood?: string
  energyLevel?: number
  morningIntention?: string
  eveningReflection?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Check if entry exists for this date
  const { data: existing } = await supabase
    .from('journal_entries')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', data.date)
    .single()

  let entry
  let isNewEntry = false

  if (existing) {
    // Update existing entry
    const { data: updated, error } = await supabase
      .from('journal_entries')
      .update({
        content: data.content,
        mood: data.mood,
        energy_level: data.energyLevel,
        morning_intention: data.morningIntention,
        evening_reflection: data.eveningReflection,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    entry = updated
  } else {
    // Create new entry
    const { data: created, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        date: data.date,
        content: data.content,
        mood: data.mood,
        energy_level: data.energyLevel,
        morning_intention: data.morningIntention,
        evening_reflection: data.eveningReflection
      })
      .select()
      .single()

    if (error) throw error
    entry = created
    isNewEntry = true
  }

  // Award XP for new journal entry
  if (isNewEntry) {
    await awardXP(user.id, 5, 'journal_entry', 'journal', entry.id)
    
    // Check for weekly bonus (7 consecutive days)
    const { data: recentEntries } = await supabase
      .from('journal_entries')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(7)
    
    if (recentEntries && recentEntries.length >= 7) {
      const dates = recentEntries.map(e => new Date(e.date).getTime())
      const isConsecutive = dates.every((date, i) => {
        if (i === 0) return true
        const diff = dates[i - 1] - date
        return diff === 86400000 // 1 day in ms
      })
      
      if (isConsecutive) {
        await awardXP(user.id, 25, 'weekly_journal_streak', 'journal', entry.id)
      }
    }
  }

  revalidatePath('/')
  return entry
}

export async function getJournalCalendarData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data: entries } = await supabase
    .from('journal_entries')
    .select('date, mood')
    .order('date', { ascending: false })

  return entries?.map(e => ({
    date: e.date,
    mood: e.mood
  })) || []
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
