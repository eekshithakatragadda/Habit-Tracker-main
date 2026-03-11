'use client'

import { LayoutDashboard, ListTodo, Target, Trophy, BarChart3, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'habits', label: 'Habits', icon: <ListTodo className="h-5 w-5" /> },
  { id: 'goals', label: 'Goals', icon: <Target className="h-5 w-5" /> },
  { id: 'achievements', label: 'Achievements', icon: <Trophy className="h-5 w-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'reports', label: 'Reports', icon: <Mail className="h-5 w-5" /> },
]

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm md:relative md:border-t-0 md:bg-transparent md:backdrop-blur-none">
      <div className="flex items-center justify-around px-2 py-2 md:justify-start md:gap-1 md:px-0">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 md:flex-row md:gap-2 md:px-4',
              activeTab === item.id
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            )}
          >
            {item.icon}
            <span className="text-xs md:text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
