'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/auth-client'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signUp.email({
      name,
      email,
      password,
      callbackURL: '/account',
    })

    if (error) {
      setError(error.message ?? 'Signup failed')
      setLoading(false)
      return
    }

    router.push('/account')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-medium mb-6">Create account</h1>

        {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Your name"
              data-testid="name"
            />
          </div>

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
              minLength={8}
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
              data-testid="password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="signup-submit"
            className="bg-black text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
