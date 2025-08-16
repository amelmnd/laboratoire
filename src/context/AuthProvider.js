'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

const AuthContext = createContext()

const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL || 'amelmnd.dev@gmail.com'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)
  const [accessChecked, setAccessChecked] = useState(false) // <- évite boucle
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user && !accessChecked) {
      if (user.email.trim().toLowerCase() !== ALLOWED_EMAIL.trim().toLowerCase()) {
        alert("Accès refusé : adresse email non autorisée")
        signOut()
        router.push('/')
      }
      setAccessChecked(true)
    }
    if (user === null) {
      setAccessChecked(true)
    }
  }, [user, accessChecked, router])

  const signInWithOAuth = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signInWithOAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
