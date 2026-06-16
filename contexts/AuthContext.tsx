'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { apiRegister, apiLogin, apiLogout, apiMe, type ApiUser } from '@/lib/api'

export type User = ApiUser

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<string | null>
  signup: (name: string, email: string, password: string) => Promise<string | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('watch_token')
    const cached = localStorage.getItem('watch_current_user')

    if (!token) {
      setIsLoading(false)
      return
    }

    // Optimistically restore from cache, then verify with backend
    if (cached) setUser(JSON.parse(cached))

    apiMe()
      .then(u => {
        setUser(u)
        localStorage.setItem('watch_current_user', JSON.stringify(u))
      })
      .catch(() => {
        // Backend down — keep cached user so UI stays functional
        if (!cached) {
          localStorage.removeItem('watch_token')
          setUser(null)
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const { token, user } = await apiLogin(email, password)
      localStorage.setItem('watch_token', token)
      localStorage.setItem('watch_current_user', JSON.stringify(user))
      setUser(user)
      return null
    } catch (err: any) {
      return err.message || 'Login failed.'
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      const { token, user } = await apiRegister(name, email, password)
      localStorage.setItem('watch_token', token)
      localStorage.setItem('watch_current_user', JSON.stringify(user))
      setUser(user)
      return null
    } catch (err: any) {
      return err.message || 'Sign up failed.'
    }
  }

  const logout = () => {
    apiLogout()
    localStorage.removeItem('watch_token')
    localStorage.removeItem('watch_current_user')
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
