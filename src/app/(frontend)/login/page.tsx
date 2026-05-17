'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth-client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

    router.push('/account')
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
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
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
            className="bg-black text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-50"
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
