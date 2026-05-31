'use client'

import { useState } from 'react'

type Props = {
  heading?: string
  subheading?: string
  buttonLabel?: string
  theme?: 'dark' | 'light'
}

export function NewsletterSignupBlock({
  heading = 'Stay in the loop',
  subheading = 'Get PDX Pop Now! news, festival updates, and announcements delivered to your inbox.',
  buttonLabel = 'Subscribe',
  theme = 'dark',
}: Props) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const isDark = theme === 'dark'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/mailchimp/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName }),
      })
      const data = await res.json()

      if (data.success) {
        setStatus('success')
        setMessage("You're subscribed! Thanks for signing up.")
        setEmail('')
        setFirstName('')
      } else {
        setStatus('error')
        setMessage(data.message ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section
      style={{
        background: isDark ? '#0f0f1a' : '#faf7f2',
        padding: '4rem 2rem',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        {heading && (
          <h2
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 700,
              color: isDark ? '#e8e8e8' : '#1a1a2e',
              margin: '0 0 0.75rem',
              fontStyle: 'italic',
            }}
          >
            {heading}
          </h2>
        )}
        {subheading && (
          <p
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '1rem',
              color: isDark ? '#888' : '#555',
              margin: '0 0 2rem',
              lineHeight: 1.6,
            }}
          >
            {subheading}
          </p>
        )}

        {status === 'success' ? (
          <div
            style={{
              background: isDark ? 'rgba(76,175,80,0.1)' : 'rgba(76,175,80,0.08)',
              border: '1px solid rgba(76,175,80,0.3)',
              borderRadius: 8,
              padding: '1rem 1.5rem',
            }}
          >
            <p
              style={{
                color: '#4caf50',
                fontFamily: "'Courier New', monospace",
                fontSize: '0.9rem',
                margin: 0,
              }}
            >
              ✓ {message}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <input
              type="text"
              placeholder="First name (optional)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.15)',
                borderRadius: 8,
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                color: isDark ? '#e8e8e8' : '#1a1a2e',
                fontFamily: 'Georgia, serif',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box' as const,
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  flex: 1,
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.12)'
                    : '1px solid rgba(0,0,0,0.15)',
                  borderRadius: 8,
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  color: isDark ? '#e8e8e8' : '#1a1a2e',
                  fontFamily: 'Georgia, serif',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  background: '#e63946',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 700,
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  opacity: status === 'loading' ? 0.7 : 1,
                }}
              >
                {status === 'loading' ? 'Subscribing…' : buttonLabel}
              </button>
            </div>
            {status === 'error' && (
              <p
                style={{
                  color: '#e63946',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.8rem',
                  margin: 0,
                  textAlign: 'left',
                }}
              >
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
