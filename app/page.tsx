'use client'

import { useAuth } from '@/components/auth-provider'
import LoginPage from '@/components/pages/login-page'
import DashboardPage from '@/components/pages/dashboard-page'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <DashboardPage /> : <LoginPage />
}
