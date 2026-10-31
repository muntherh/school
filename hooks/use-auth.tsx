'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, ApiError } from '@/lib/api-client'

interface User {
  id: string
  name: string
  email: string
  role: string
  accountStatus: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const response = await api.getCurrentUser()
      if (response.success && response.data) {
        setUser(response.data as User)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password)
    if (response.success && response.data) {
      setUser(response.data as User)
    } else {
      throw new Error(response.error?.message || 'Login failed')
    }
  }

  const logout = async () => {
    await api.logout()
    setUser(null)
  }

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>
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
