'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
// import { useToast } from '@/components/ui/use-toast'
import { auth, User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
//   const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      auth.getUser(token)
        .then(user => {
          setUser(user)
        })
        .catch(error => {
          console.error('Failed to get user:', error)
          localStorage.removeItem('token')
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { token, user } = await auth.login(email, password)
      localStorage.setItem('token', token)
      setUser(user)
    //   toast({
    //     title: "Logged in successfully",
    //     description: "Welcome back!",
    //   })
    } catch (error) {
      console.error('Login failed:', error)
    //   toast({
    //     title: "Login failed",
    //     description: "Please check your credentials and try again.",
    //     variant: "destructive",
    //   })
      throw error
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const { token, user } = await auth.signup(name, email, password)
      localStorage.setItem('token', token)
      setUser(user)
    //   toast({
    //     title: "Signed up successfully",
    //     description: "Welcome to the Project Management Tool!",
    //   })
    } catch (error) {
      console.error('Signup failed:', error)
    //   toast({
    //     title: "Signup failed",
    //     description: "Please try again later.",
    //     variant: "destructive",
    //   })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    // toast({
    //   title: "Logged out successfully",
    //   description: "See you next time!",
    // })
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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

