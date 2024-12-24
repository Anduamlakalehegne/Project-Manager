'use client';

import { Dashboard } from '@/components/dashboard'
import { LoginForm } from '@/components/login-form'
import { useAuth } from '@/components/auth-provider'

export default function Home() {
  const { user } = useAuth()

  return (
    <main className="container mx-auto p-4">
      {user ? <Dashboard /> : <LoginForm />}
    </main>
  )
}
