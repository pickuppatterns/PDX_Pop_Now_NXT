'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleReset() {
    setError(null)

    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      })

      if (result.error) {
        throw new Error(result.error.message ?? 'Failed to reset password.')
      }

      // Sign out so user goes through login and password manager can capture credentials
      await authClient.signOut()
      setSuccess(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }
  if (success) {
    return (
      <div style={cardStyle}>
        <p
          style={{
            color: '#a5d6a7',
            textAlign: 'center',
            fontFamily: 'Georgia, serif',
            marginBottom: '1.5rem',
          }}
        >
          ✓ Password set! You&apos;re ready to go.
        </p>
        <Link
          href="/login"
          style={{ ...buttonStyle, display: 'block', textAlign: 'center', textDecoration: 'none' }}
        >
          Log In to View Your Profile →
        </Link>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleReset()}
          placeholder="••••••••"
          style={inputStyle}
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
            fontFamily: 'Georgia, serif',
          }}
        >
          {error}
        </p>
      )}

      <button onClick={handleReset} disabled={loading} style={buttonStyle}>
        {loading ? 'Resetting…' : 'Set Your Password →'}
      </button>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <main style={pageStyle}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p
            style={{
              color: '#ff8c42',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              fontFamily: "'Courier New', monospace",
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
              fontFamily: 'Georgia, serif',
            }}
          >
            Set Your Password
          </h1>
        </div>
        <Suspense fallback={<div style={{ color: '#666' }}>Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0f0f1a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
  fontFamily: "'Courier New', monospace",
}

const cardStyle: React.CSSProperties = {
  background: '#1a1a2e',
  borderRadius: 12,
  padding: '2rem',
  border: '1px solid rgba(255,255,255,0.08)',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#aaa',
  fontSize: '0.75rem',
  marginBottom: 6,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  fontFamily: "'Courier New', monospace",
}

const inputStyle: React.CSSProperties = {
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
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  background: '#e63946',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '12px',
  fontSize: '0.9rem',
  fontWeight: 700,
  fontFamily: "'Courier New', monospace",
  cursor: 'pointer',
}
