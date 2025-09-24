'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, User as UserProfile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  profileLoading: boolean
  signInWithGitHub: () => Promise<{ data: any; error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  isOwner: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // Initialize auth state
  useEffect(() => {
    console.log('🔐 Initializing auth system...')
    
    const initializeAuth = async () => {
      try {
        // Try to get real session
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('📋 Session check:', session ? 'Found' : 'None')
        
        if (session?.user) {
          console.log('✅ User found:', session.user.email)
          setUser(session.user)
          // Load profile without blocking loading state
          loadUserProfile(session.user.id)
        } else {
          console.log('ℹ️ No session found')
          setUser(null)
          setUserProfile(null)
        }
        
        // Set loading to false immediately after checking session
        setLoading(false)
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session ? 'Session exists' : 'No session')
        
        if (session?.user) {
          setUser(session.user)
          // Load profile without blocking
          loadUserProfile(session.user.id)
        } else {
          console.log('🚪 No session - clearing auth state')
          setUser(null)
          setUserProfile(null)
          
          // If this is a sign out event, clear cookies
          if (event === 'SIGNED_OUT') {
            if (typeof window !== 'undefined') {
              // Clear all cookies
              document.cookie.split(";").forEach((c) => {
                const eqPos = c.indexOf("=")
                const name = eqPos > -1 ? c.substr(0, eqPos) : c
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
              })
            }
          }
        }
        
        // Don't set loading to false here, it's already handled in initialization
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    setProfileLoading(true)
    try {
      console.log('👤 Loading profile for user:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Profile load error:', error.message || error)
        // Create profile if it doesn't exist
        try {
          const newProfile = await createUserProfile(userId)
          if (newProfile) {
            setUserProfile(newProfile)
          }
        } catch (createError) {
          console.error('❌ Profile creation error:', createError)
        }
        return
      }

      console.log('✅ Profile loaded:', data)
      setUserProfile(data)
    } catch (error) {
      console.error('❌ Profile load exception:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  // Create user profile if it doesn't exist
  const createUserProfile = async (userId: string) => {
    try {
      console.log('🆕 Creating profile for user:', userId)
      
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        console.error('❌ No authenticated user found - redirecting to home')
        // Clear all auth state and redirect to home
        setUser(null)
        setUserProfile(null)
        setLoading(false)
        
        // Clear cookies and redirect
        if (typeof window !== 'undefined') {
          // Clear all cookies
          document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("=")
            const name = eqPos > -1 ? c.substr(0, eqPos) : c
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
          })
          
          // Redirect to home
          window.location.href = '/'
        }
        return
      }

      const githubUsername = user.user.user_metadata?.user_name || 
                            user.user.user_metadata?.preferred_username ||
                            user.user.email?.split('@')[0] ||
                            'github-user'

      // Save email from GitHub as personal email
      const githubEmail = user.user.email || user.user.user_metadata?.email

      console.log('📝 Creating profile with username:', githubUsername)
      console.log('📧 GitHub email for personal email:', githubEmail)

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          github_username: githubUsername,
          personal_email: githubEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Profile creation error:', error)
        console.error('❌ Error details:', error.message, error.details, error.hint)
        return null
      }

      console.log('✅ Profile created successfully:', data)
      setUserProfile(data)
      return data
    } catch (error) {
      console.error('❌ Profile creation exception:', error)
      return null
    }
  }

  // Sign in with GitHub
  const signInWithGitHub = async () => {
    try {
      console.log('🚀 Starting GitHub sign in...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      console.log('📤 GitHub sign in result:', { data, error })
      return { data, error }
    } catch (error) {
      console.error('❌ GitHub sign in exception:', error)
      return { data: null, error }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      console.log('🚪 Signing out...')
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
      
      // Clear all cookies
      if (typeof window !== 'undefined') {
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=")
          const name = eqPos > -1 ? c.substr(0, eqPos) : c
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
        })
        
        // Redirect to home
        window.location.href = '/'
      }
    } catch (error) {
      console.error('❌ Sign out error:', error)
    }
  }

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile for user:', user.id)
      await loadUserProfile(user.id)
      console.log('✅ Profile refresh completed')
    }
  }

  const isOwner = () => {
    return userProfile?.is_owner === true
  }

  const value = {
    user,
    userProfile,
    profileLoading,
    loading,
    signInWithGitHub,
    signOut,
    refreshProfile,
    isOwner
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}