'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from '@/lib/auth-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type AccountCard = {
  title: string
  description: string
  href: string
  emoji: string
}

export default function MyAccountPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [cards, setCards] = useState<AccountCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isPending) return
    if (!session?.user) {
      router.push('/login')
      return
    }

    async function checkRecords() {
      const found: AccountCard[] = []

      // Check volunteer record
      try {
        const res = await fetch('/api/volunteer-profile')
        if (res.ok) {
          found.push({
            title: 'Volunteer Profile',
            description: 'View your assigned shift, position, and update your preferences.',
            href: '/volunteer/profile',
            emoji: '🎪',
          })
        }
      } catch {
        // volunteer record not found
      }

      // Check listening committee record
      try {
        const res = await fetch('/api/listening-committee-profile')
        if (res.ok) {
          found.push({
            title: 'Listening Committee',
            description: 'Rate your assigned tracks and view your listening progress.',
            href: '/listening-committee/profile',
            emoji: '🎧',
          })
        }
      } catch {
        // listening committee record not found
      }
      // Check submission record
      try {
        const res = await fetch('/api/submission-profile')
        if (res.ok) {
          found.push({
            title: 'Submission Profile',
            description: 'View your compilation submission status and result.',
            href: '/submission/profile',
            emoji: '🎵',
          })
        }
      } catch {
        // submission record not found
      }

      // Orders check — coming soon

      setCards(found)
      setLoading(false)
    }
    checkRecords()
  }, [session, isPending, router])

  if (isPending || loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: '#666', fontFamily: "'Courier New', monospace" }}>Loading…</p>
      </main>
    )
  }

  if (!session?.user) return null

  const hour = new Date().getHours()
  const greeting =
    hour >= 6 && hour < 12
      ? '☀️ Good Morning'
      : hour >= 12 && hour < 18
        ? '🌤️ Good Afternoon'
        : '🌙 Good Evening'

  return (
    <main style={pageStyle}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <div style={{ marginBottom: '2rem' }}>
          <p
            style={{
              color: '#ff8c42',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              margin: '0 0 6px',
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
              margin: '0 0 6px',
              fontFamily: 'Georgia, serif',
            }}
          >
            My Account
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.9rem',
              margin: 0,
              fontFamily: 'Georgia, serif',
            }}
          >
            {greeting}, {session.user.name ?? session.user.email}
          </p>
        </div>

        {cards.length === 0 ? (
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: 12,
              padding: '2rem',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Georgia, serif' }}>
              No active records found for your account.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                style={{
                  display: 'block',
                  background: '#1a1a2e',
                  borderRadius: 12,
                  padding: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{card.emoji}</span>
                  <div>
                    <h2
                      style={{
                        color: '#fff',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        margin: '0 0 4px',
                        fontFamily: 'Georgia, serif',
                        fontStyle: 'italic',
                      }}
                    >
                      {card.title}
                    </h2>
                    <p
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.85rem',
                        margin: 0,
                        fontFamily: 'Georgia, serif',
                      }}
                    >
                      {card.description}
                    </p>
                  </div>
                  <span style={{ marginLeft: 'auto', color: '#ff8c42', fontSize: '1.2rem' }}>
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <button
          onClick={() => {
            signOut()
            window.location.href = '/'
          }}
          style={{
            marginTop: '2rem',
            background: 'none',
            border: 'none',
            color: '#666',
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontFamily: "'Courier New', monospace",
          }}
        >
          Sign out
        </button>
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
}
