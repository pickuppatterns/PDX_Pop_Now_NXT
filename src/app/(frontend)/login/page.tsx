'use client'
import { useState } from 'react'
import { signIn } from '@/lib/auth-client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn.email({
      email,
      password,
      callbackURL: '/account',
    })

    if (error) {
      setError(error.message ?? 'Login failed')
      setLoading(false)
      return
    }

    window.location.href = '/auth-redirect'
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setForgotLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      })
      if (!res.ok) throw new Error('Failed to send reset email.')
      setForgotSent(true)
    } catch {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  if (forgotMode) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-medium mb-2">Reset Password</h1>
          <p className="text-sm text-gray-600 mb-6">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          {forgotSent ? (
            <div className="p-4 bg-green-50 text-green-700 rounded-md text-sm mb-4">
              Check your email for a password reset link.
            </div>
          ) : (
            <form onSubmit={handleForgot} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="you@example.com"
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
              )}
              <button
                type="submit"
                disabled={forgotLoading}
                className="bg-[var(--color-brand)] text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-50"
              >
                {forgotLoading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="mt-4 text-sm text-center text-gray-600">
            <button
              onClick={() => {
                setForgotMode(false)
                setForgotSent(false)
                setError('')
              }}
              className="underline"
            >
              Back to sign in
            </button>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-medium mb-6">Sign in</h1>

        {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="you@example.com"
              data-testid="email"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="text-xs text-gray-500 underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
              data-testid="password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit"
            className="bg-[var(--color-brand)] text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
