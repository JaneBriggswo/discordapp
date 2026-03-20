"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  discordId: string | null
  isLoading: boolean
  login: (discordId: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  validateSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [discordId, setDiscordId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Generate browser fingerprint
  const generateFingerprint = (): string => {
    if (typeof window === 'undefined') return 'server'
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx?.fillText('fingerprint', 10, 10)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')
    
    // Simple hash function for fingerprint
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  // Get CSRF token from cookie
  const getCSRFToken = (): string | null => {
    if (typeof document === 'undefined') return null
    const name = 'pink_remote_csrf='
    const decodedCookie = decodeURIComponent(document.cookie)
    const ca = decodedCookie.split(';')
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
    return null
  }

  // Validate session on mount
  const validateSession = async (): Promise<boolean> => {
    try {
      const fingerprint = generateFingerprint()
      const csrf = getCSRFToken()
      
      if (!csrf) {
        setIsLoading(false)
        return false
      }
      
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fingerprint, csrf }),
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success && data.user) {
        setIsAuthenticated(true)
        setDiscordId(data.user.id)
        setIsLoading(false)
        return true
      } else {
        setIsAuthenticated(false)
        setDiscordId(null)
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error('Session validation error:', error)
      setIsAuthenticated(false)
      setDiscordId(null)
      setIsLoading(false)
      return false
    }
  }

  // Login function - ULTRA SIMPLES
  const login = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setIsAuthenticated(true)
    setDiscordId(id)
    return { success: true }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsAuthenticated(false)
      setDiscordId(null)
      
      // Clear localStorage safely to reset all settings
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.clear()
        } catch (e) {
          // Fallback: clear items individually
          const keys = Object.keys(window.localStorage)
          keys.forEach(key => {
            try {
              window.localStorage.removeItem(key)
            } catch (err) {
              console.warn('Could not remove localStorage item:', key)
            }
          })
        }
      }
      
      // Clear sessionStorage safely
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          window.sessionStorage.clear()
        } catch (e) {
          // Fallback: clear items individually
          const keys = Object.keys(window.sessionStorage)
          keys.forEach(key => {
            try {
              window.sessionStorage.removeItem(key)
            } catch (err) {
              console.warn('Could not remove sessionStorage item:', key)
            }
          })
        }
      }
    }
  }

  // Validate session on mount
  useEffect(() => {
    validateSession()
  }, [])

  // Periodic session validation (every 5 minutes)
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        validateSession().then(valid => {
          if (!valid) {
            logout()
          }
        })
      }, 5 * 60 * 1000) // 5 minutes
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      discordId,
      isLoading,
      login,
      logout,
      validateSession
    }}>
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