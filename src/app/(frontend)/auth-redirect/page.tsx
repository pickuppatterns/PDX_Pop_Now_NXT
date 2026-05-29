'use client'

import { useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function AuthRedirectPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (isPending) return
    if (!session?.user) {
      router.push('/login')
      return
    }

    const role = (session.user as { role?: string }).role

    if (role === 'super-admin' || role === 'web_admin') {
      router.push('/dashboard')
    } else if (role === 'listener') {
      router.push('/listen')
    } else if (role === 'volunteer') {
      router.push('/volunteer/profile')
    } else {
      router.push('/my-account')
    }
  }, [session, isPending, router])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p style={{ color: '#666', fontFamily: "'Courier New', monospace", fontSize: '0.85rem' }}>
        Redirecting…
      </p>
    </div>
  )
}
