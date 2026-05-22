'use client'

import { useState } from 'react'
import { signIn } from '@/lib/auth-client'

export default function DashboardLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError(null)
    setLoading(true)

    try {
      const result = await signIn.email({
        email,
        password,
      })
      type AuthUser = {
        id: string
        email: string
        name?: string | null
        role?: string
      }
      const role = (result?.data?.user as AuthUser)?.role
      const roleDashboards: Record<string, string> = {
        'super-admin': '/dashboard',
        web_admin: '/dashboard',
        volunteer_director: '/dashboard/volunteers',
        compilation_director: '/dashboard/compilation',
        booking_director: '/dashboard/booking',
        sponsorship_director: '/dashboard/sponsorship',
        social_director: '/dashboard/social',
        radio_director: '/dashboard/radio',
        listening_director: '/dashboard/listening',
        orders_director: '/dashboard/orders',
        support_director: '/dashboard/support',
      }

      const destination = role ? (roleDashboards[role] ?? '/dashboard') : '/dashboard'
      window.location.href = destination
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0f0f1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p
            style={{
              color: '#ff8c42',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            PDX Pop Now!
          </p>
          <h1
            style={{
              color: '#fff',
              fontSize: '1.75rem',
              fontWeight: 900,
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            Director Dashboard
          </h1>
        </div>

        <div
          style={{
            background: '#1a1a2e',
            borderRadius: 12,
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                color: '#aaa',
                fontSize: '0.75rem',
                marginBottom: 6,
                letterSpacing: '0.1em',
              }}
            >
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="you@pdxpopnow.com"
              style={{
                width: '100%',
                background: '#0f0f1a',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: '10px 12px',
                color: '#fff',
                fontSize: '0.95rem',
                fontFamily: 'Georgia, serif',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                color: '#aaa',
                fontSize: '0.75rem',
                marginBottom: 6,
                letterSpacing: '0.1em',
              }}
            >
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{
                width: '100%',
                background: '#0f0f1a',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: '10px 12px',
                color: '#fff',
                fontSize: '0.95rem',
                fontFamily: 'Georgia, serif',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p
              style={{
                background: '#2a0a0a',
                border: '1px solid #c62828',
                borderRadius: 8,
                padding: '10px 12px',
                color: '#ef9a9a',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              background: '#e63946',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px',
              fontSize: '0.9rem',
              fontWeight: 700,
              fontFamily: "'Courier New', monospace",
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </div>
      </div>
    </main>
  )
}
