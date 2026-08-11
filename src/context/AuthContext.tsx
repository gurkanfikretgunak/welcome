'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getAppUrl } from '@/lib/mf/config'
import { logout, mfCorePublicAuth, refreshTokens } from '@/lib/mf/auth-api'
import { clearSession, MfUser, readSession, writeSession } from '@/lib/mf/session'
import { createUserProfile, getUserProfile, User as WelcomeProfile } from '@/lib/repositories/users'
import { captureException, setUser as setSentryUser } from '@/lib/sentry'

interface AuthContextType {
  user: MfUser|null; userProfile: WelcomeProfile|null; loading:boolean; profileLoading:boolean
  signInWithGitHub:()=>Promise<{data:any;error:any}>; signOut:()=>Promise<void>
  refreshProfile:()=>Promise<void>; isOwner:()=>boolean
}
const AuthContext=createContext<AuthContextType|undefined>(undefined)

export function AuthProvider({children}:{children:ReactNode}) {
  const [user,setUser]=useState<MfUser|null>(null)
  const [userProfile,setUserProfile]=useState<WelcomeProfile|null>(null)
  const [loading,setLoading]=useState(true)
  const [profileLoading,setProfileLoading]=useState(false)
  const owner=(candidate:MfUser|null=user)=>['owner','admin'].includes(candidate?.role?.toLowerCase()??'')

  const loadProfile=async(current:MfUser)=>{
    setProfileLoading(true)
    try {
      let response=await getUserProfile(current.id)
      if(!response.data) response=await createUserProfile({id:current.id,github_username:current.displayName||current.email.split('@')[0],
        personal_email:current.email,role:current.role})
      if(response.data){
        const profile={...response.data,is_owner:owner(current)}
        setUserProfile(profile)
        setSentryUser({id:current.id,email:current.email,username:profile.github_username})
      }
    } catch(error){captureException(error,{tags:{context:'auth',operation:'load_profile'}})}
    finally{setProfileLoading(false)}
  }

  useEffect(()=>{void(async()=>{
    try {
      let session=readSession()
      if(session){
        try {
          const renewed=await refreshTokens(session.user.id,session.refreshToken)
          writeSession(renewed);session=renewed
        } catch {/* Existing access token may still be valid. */}
        setUser(session.user)
        await loadProfile(session.user)
      }
    } catch(error){captureException(error,{tags:{context:'auth',operation:'initialization'}})}
    finally{setLoading(false)}
  })()},[])

  const signInWithGitHub=async()=>{
    try{
      const {githubClientId}=await mfCorePublicAuth()
      if(!githubClientId)throw new Error('GitHub OAuth is not configured in mf-go')
      const redirectUri=`${getAppUrl()}/auth/callback`
      const url=new URL('https://github.com/login/oauth/authorize')
      url.searchParams.set('client_id',githubClientId)
      url.searchParams.set('redirect_uri',redirectUri)
      url.searchParams.set('scope','read:user user:email')
      window.location.assign(url)
      return{data:{url:url.toString()},error:null}
    }catch(error){captureException(error,{tags:{context:'auth',operation:'github_signin'}});return{data:null,error}}
  }
  const signOut=async()=>{
    const session=readSession()
    try{if(session)await logout(session.user.id,session.accessToken,session.refreshToken)}catch(error){captureException(error,{tags:{context:'auth',operation:'signout'}})}
    clearSession();setUser(null);setUserProfile(null);setSentryUser(null);window.location.assign('/')
  }
  const refreshProfile=async()=>{if(user)await loadProfile(user)}
  return <AuthContext.Provider value={{user,userProfile,loading,profileLoading,signInWithGitHub,signOut,refreshProfile,isOwner:()=>owner()}}>{children}</AuthContext.Provider>
}
export function useAuth(){const context=useContext(AuthContext);if(!context)throw new Error('useAuth must be used within an AuthProvider');return context}