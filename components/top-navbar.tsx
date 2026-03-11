'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Moon, Sun, Plus, User, Zap, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface TopNavbarProps {
  xp: number
  onAddHabit: () => void
  user?: SupabaseUser | null
}

export function TopNavbar({ xp, onAddHabit, user }: TopNavbarProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClient()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || user?.phone || ''
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="lg:hidden flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">HabitFlow</span>
        </div>
        
        <div className="hidden lg:block">
          <h2 className="text-lg font-medium text-foreground">
            Welcome back, {displayName}!
          </h2>
          <p className="text-sm text-muted-foreground">Track your progress and build better habits</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{xp.toLocaleString()} XP</span>
          </div>
          
          <Button 
            onClick={onAddHabit}
            size="sm" 
            className="gap-2 rounded-full shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Habit</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 rounded-full px-2">
                <Avatar className="h-8 w-8 border-2 border-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2 text-destructive focus:text-destructive"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'Logging out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
