'use client'

import React from "react"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Sparkles, Eye, EyeOff, Mail, Phone, CheckCircle2 } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState('email')
  
  // Email sign-up state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Magic link state
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  
  // Phone sign-up state
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+1')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [phoneDisplayName, setPhoneDisplayName] = useState('')
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate email format
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/?welcome=true`,
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      })

      if (error) {
        // Handle specific error messages
        if (error.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          setError('Network error. Please check your connection and try again.')
        } else {
          setError(error.message)
        }
        setLoading(false)
      } else if (data.user && !data.session) {
        // Email confirmation required
        router.push('/auth/sign-up-success')
      } else {
        // Auto-confirmed (dev mode or email confirmation disabled)
        router.push('/?welcome=true')
        router.refresh()
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred'
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.')
      } else {
        setError(errorMsg)
      }
      console.error('[v0] Sign up error:', err)
      setLoading(false)
    }
  }

  const handleMagicLinkSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!isValidEmail(magicLinkEmail)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/?welcome=true`,
          data: {
            display_name: magicLinkEmail.split('@')[0],
        },
      },
    })

      if (error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          setError('Network error. Please check your connection and try again.')
        } else {
          setError(error.message)
        }
      } else {
        setMagicLinkSent(true)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred'
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.')
      } else {
        setError(errorMsg)
      }
      console.error('[v0] Magic link error:', err)
    }
    setLoading(false)
  }

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number')
      setLoading(false)
      return
    }

    const fullPhone = `${countryCode}${cleanPhone}`

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
        options: {
          data: {
            display_name: phoneDisplayName || `User${cleanPhone.slice(-4)}`,
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setError('An account with this phone number already exists. Please sign in instead.')
        } else if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          setError('Network error. Please check your connection and try again.')
        } else {
          setError(error.message)
        }
      } else {
        setOtpSent(true)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred'
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.')
      } else {
        setError(errorMsg)
      }
      console.error('[v0] Phone OTP error:', err)
    }
    setLoading(false)
  }

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError(null)

  const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`

  try {
    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: otp,
      type: 'sms',
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/?welcome=true')
      router.refresh()
    }

  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : 'An unexpected error occurred'
    setError(errorMsg)
  }

  setLoading(false)
}
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">HabitFlow</span>
        </div>

        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Start your journey to better habits</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <p className="font-medium mb-1">{error}</p>
                {error.includes('Failed to fetch') || error.includes('Unable to connect') ? (
                  <p className="text-xs mt-2 text-destructive/80">
                    💡 Note: Authentication requires a deployed app. This is a v0 preview limitation. 
                    <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline ml-1">Deploy to Vercel</a> to test authentication features.
                  </p>
                ) : null}
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password (min 6 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                    {confirmPassword && password === confirmPassword && password.length >= 6 && (
                      <p className="text-xs text-accent flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Account
                  </Button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or sign up with magic link</span>
                  </div>
                </div>

                {magicLinkSent ? (
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 text-center">
                    <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Check your email!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {"We've sent a magic link to "}{magicLinkEmail}
                    </p>
                    <button 
                      onClick={() => setMagicLinkSent(false)} 
                      className="text-xs text-primary hover:underline mt-3"
                    >
                      Send to a different email
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleMagicLinkSignUp} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="magic-email">Email for Magic Link</Label>
                      <Input
                        id="magic-email"
                        type="email"
                        placeholder="you@example.com"
                        value={magicLinkEmail}
                        onChange={(e) => setMagicLinkEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" variant="outline" className="w-full bg-transparent" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Send Magic Link
                    </Button>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneDisplayName">Display Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Input
                        id="phoneDisplayName"
                        type="text"
                        placeholder="Your name"
                        value={phoneDisplayName}
                        onChange={(e) => setPhoneDisplayName(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                          disabled={loading}
                        >
                          <option value="+1">+1 (US)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+91">+91 (IN)</option>
                          <option value="+61">+61 (AU)</option>
                          <option value="+81">+81 (JP)</option>
                          <option value="+49">+49 (DE)</option>
                          <option value="+33">+33 (FR)</option>
                          <option value="+86">+86 (CN)</option>
                          <option value="+82">+82 (KR)</option>
                          <option value="+55">+55 (BR)</option>
                        </select>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="123 456 7890"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          disabled={loading}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Send Verification Code
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-center mb-4">
                      <p className="text-sm text-foreground">
                        Verification code sent to {countryCode} {phone}
                      </p>
                      <button 
                        type="button"
                        onClick={() => setOtpSent(false)} 
                        className="text-xs text-primary hover:underline mt-1"
                      >
                        Change number
                      </button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter Verification Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        disabled={loading}
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Verify & Create Account
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
