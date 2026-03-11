'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAnalyticsData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get weekly completion data
  const { data: weeklyLogs } = await supabase
    .from('habit_logs')
    .select('date, completed')
    .eq('user_id', user.id)
    .gte('date', weekAgo.toISOString().split('T')[0])

  // Calculate completion rate per day
  const weeklyData: Record<string, { total: number; completed: number }> = {}
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    weeklyData[dateStr] = { total: 0, completed: 0 }
  }

  weeklyLogs?.forEach(log => {
    if (weeklyData[log.date]) {
      weeklyData[log.date].total++
      if (log.completed) {
        weeklyData[log.date].completed++
      }
    }
  })

  const weeklyCompletionData = Object.entries(weeklyData).map(([date, data]) => {
    const dayIndex = new Date(date).getDay()
    return {
      day: days[dayIndex],
      date,
      rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      completed: data.completed,
      total: data.total
    }
  })

  // Get monthly trend
  const { data: monthlyLogs } = await supabase
    .from('habit_logs')
    .select('date, completed')
    .eq('user_id', user.id)
    .gte('date', monthAgo.toISOString().split('T')[0])

  // Group by week
  const weeklyTrend: { week: string; rate: number }[] = []
  for (let w = 0; w < 4; w++) {
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - (w + 1) * 7)
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() - w * 7)
    
    const weekLogs = monthlyLogs?.filter(log => {
      const logDate = new Date(log.date)
      return logDate >= weekStart && logDate < weekEnd
    })
    
    const completed = weekLogs?.filter(l => l.completed).length || 0
    const total = weekLogs?.length || 0
    
    weeklyTrend.unshift({
      week: `Week ${4 - w}`,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0
    })
  }

  // Get habit performance
  const { data: habits } = await supabase
    .from('habits')
    .select(`
      id,
      name,
      habit_logs (
        completed
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)

  const habitPerformance = habits?.map(habit => {
    const logs = habit.habit_logs || []
    const completed = logs.filter((l: { completed: boolean }) => l.completed).length
    const total = logs.length
    return {
      id: habit.id,
      name: habit.name,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }) || []

  // Get journal stats
  const { data: journalEntries } = await supabase
    .from('journal_entries')
    .select('date, mood, energy_level')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(30)

  const moodDistribution = {
    great: 0,
    good: 0,
    okay: 0,
    low: 0,
    bad: 0
  }

  let totalEnergy = 0
  let energyCount = 0

  journalEntries?.forEach(entry => {
    if (entry.mood && moodDistribution[entry.mood as keyof typeof moodDistribution] !== undefined) {
      moodDistribution[entry.mood as keyof typeof moodDistribution]++
    }
    if (entry.energy_level) {
      totalEnergy += entry.energy_level
      energyCount++
    }
  })

  // Get heatmap data (last 28 days)
  const heatmapData: { date: string; intensity: number }[] = []
  for (let i = 27; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayLogs = monthlyLogs?.filter(l => l.date === dateStr)
    const completed = dayLogs?.filter(l => l.completed).length || 0
    const total = dayLogs?.length || 1
    
    heatmapData.push({
      date: dateStr,
      intensity: completed / total
    })
  }

  // AI insights (mocked but based on real data)
  const insights: string[] = []
  
  const avgCompletionRate = weeklyCompletionData.reduce((sum, d) => sum + d.rate, 0) / 7
  if (avgCompletionRate >= 80) {
    insights.push("Excellent week! You're maintaining strong consistency across your habits.")
  } else if (avgCompletionRate >= 60) {
    insights.push("Good progress this week. Try to push for 80%+ completion for optimal results.")
  } else {
    insights.push("Room for improvement this week. Consider focusing on 2-3 core habits first.")
  }

  const bestDay = weeklyCompletionData.reduce((best, d) => d.rate > best.rate ? d : best)
  const worstDay = weeklyCompletionData.reduce((worst, d) => d.rate < worst.rate ? d : worst)
  
  if (bestDay.rate > 0) {
    insights.push(`${bestDay.day} is your strongest day with ${bestDay.rate}% completion.`)
  }

  if (habitPerformance.length > 0) {
    const bestHabit = habitPerformance.reduce((best, h) => h.completionRate > best.completionRate ? h : best)
    insights.push(`"${bestHabit.name}" is your most consistent habit at ${bestHabit.completionRate}%.`)
  }

  return {
    weeklyCompletionData,
    weeklyTrend,
    habitPerformance,
    heatmapData,
    journalStats: {
      totalEntries: journalEntries?.length || 0,
      moodDistribution,
      averageEnergy: energyCount > 0 ? Math.round(totalEnergy / energyCount * 10) / 10 : 0
    },
    insights,
    bestDay: bestDay.day,
    worstDay: worstDay.day
  }
}

export async function getWeeklyReport() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const todayStr = today.toISOString().split('T')[0]
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  // Get habit logs for the week
  const { data: logs } = await supabase
    .from('habit_logs')
    .select(`
      completed,
      habits (
        name
      )
    `)
    .eq('user_id', user.id)
    .gte('date', weekAgoStr)
    .lte('date', todayStr)

  const completed = logs?.filter(l => l.completed).length || 0
  const total = logs?.length || 1
  const completionRate = Math.round((completed / total) * 100)

  // Get XP earned this week
  const { data: xpData } = await supabase
    .from('xp_transactions')
    .select('amount')
    .eq('user_id', user.id)
    .gte('created_at', weekAgoStr)

  const xpEarned = xpData?.reduce((sum, t) => sum + t.amount, 0) || 0

  // Get most consistent habit
  const habitStats: Record<string, { completed: number; total: number }> = {}
  logs?.forEach(log => {
    const habitName = (log.habits as { name: string } | null)?.name || 'Unknown'
    if (!habitStats[habitName]) {
      habitStats[habitName] = { completed: 0, total: 0 }
    }
    habitStats[habitName].total++
    if (log.completed) {
      habitStats[habitName].completed++
    }
  })

  let mostConsistent = ''
  let mostMissed = ''
  let bestRate = 0
  let worstRate = 100

  Object.entries(habitStats).forEach(([name, stats]) => {
    const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
    if (rate > bestRate) {
      bestRate = rate
      mostConsistent = name
    }
    if (rate < worstRate) {
      worstRate = rate
      mostMissed = name
    }
  })

  // Get journal entries
  const { data: journalEntries } = await supabase
    .from('journal_entries')
    .select('date')
    .eq('user_id', user.id)
    .gte('date', weekAgoStr)
    .lte('date', todayStr)

  const journalDays = journalEntries?.length || 0

  // Generate insights
  const insights = [
    `You completed ${completed} out of ${total} habit instances this week (${completionRate}%)`,
    `You earned ${xpEarned} XP through habits, tasks, and journaling`,
    journalDays > 0 ? `You journaled ${journalDays} day${journalDays > 1 ? 's' : ''} this week` : 'Try adding journaling to your routine',
  ]

  if (mostConsistent) {
    insights.push(`Your most consistent habit was "${mostConsistent}" at ${Math.round(bestRate)}%`)
  }

  return {
    weekStart: weekAgo,
    weekEnd: today,
    completionRate,
    xpEarned,
    mostConsistentHabit: mostConsistent,
    mostMissedHabit: mostMissed,
    journalDays,
    insights,
    totalHabitsCompleted: completed
  }
}
