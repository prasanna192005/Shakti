'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'

export default function LoginPage() {
  const [email, setEmail] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(email, password)
    if (!success) {
      setError('Invalid credentials. Try admin / demo123')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-lg">⚡</span>
            </div>
            <h1 className="text-2xl font-bold">Smart Grid</h1>
          </div>

          <h2 className="text-xl font-semibold text-center mb-2">Welcome Back</h2>
          <p className="text-center text-muted-foreground text-sm mb-8">Monitor your energy grid in real-time</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="demo123"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-primary-foreground font-semibold hover:shadow-lg transition-shadow duration-300 mt-6"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <p>Username: <code className="text-primary">admin</code></p>
            <p>Password: <code className="text-primary">demo123</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}
