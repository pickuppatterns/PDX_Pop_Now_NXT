'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import md5 from 'md5'

function gravatarUrl(email: string, size = 80) {
  return `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?d=retro&s=${size}`
}

type SubmissionProfile = {
  id: string
  artistName: string
  songTitle: string
  bandPhotoUrl?: string | null
  avatarUrl?: string | null
  status: string
  resultMessage?: string | null
  selectedForCompilation?: boolean
}

export default function SubmissionProfilePage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<SubmissionProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [compilationStatus, setCompilationStatus] = useState<{
    submissionsOpen: boolean
    listeningActive: boolean
  } | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      const [profileRes, settingsRes] = await Promise.all([
        fetch('/api/submission-profile'),
        fetch('/api/compilation-settings'),
      ])
      if (!profileRes.ok) throw new Error('Failed to load profile')
      const data = await profileRes.json()
      const settings = await settingsRes.json()
      setProfile(data)
      setCompilationStatus({
        submissionsOpen: settings.isOpen ?? false,
        listeningActive: false,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isPending) return
    if (!session?.user) {
      router.push('/login')
      return
    }
    fetchProfile()
  }, [session, isPending, router, fetchProfile])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', `${profile?.artistName} band photo`)
      const res = await fetch('/api/avatar', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      const url = data.doc?.url ?? data.url
      await fetch('/api/submission-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: url }),
      })
      await fetchProfile()
      await new Promise((resolve) => setTimeout(resolve, 500))
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (isPending || loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: '#666', fontFamily: "'Courier New', monospace" }}>Loading…</p>
      </main>
    )
  }

  if (!session?.user) return null

  const avatarSrc =
    (session.user as any).image ?? profile?.bandPhotoUrl ?? gravatarUrl(session.user.email, 80)

  const hour = new Date().getHours()
  const greeting =
    hour >= 6 && hour < 12
      ? '☀️ Good Morning'
      : hour >= 12 && hour < 18
        ? '🌤️ Good Afternoon'
        : '🌙 Good Evening'

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={avatarSrc}
              alt="Artist photo"
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: '2px solid rgba(230,57,70,0.4)',
                display: 'block',
                objectFit: 'cover',
                opacity: uploading ? 0.4 : 1,
                transition: 'opacity 0.2s',
              }}
            />
            <label
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: uploading ? '#666' : '#e63946',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '0.7rem',
              }}
            >
              {uploading ? '…' : '✎'}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                color: '#e63946',
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                margin: '0 0 6px',
                fontFamily: "'Courier New', monospace",
              }}
            >
              PDX Pop Now! 2026
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
              Submission Profile
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem',
                margin: '6px 0 0',
                fontFamily: 'Georgia, serif',
              }}
            >
              {greeting}, {profile?.artistName ?? session.user.name ?? session.user.email}
            </p>
          </div>
          <button
            onClick={() => {
              signOut()
              window.location.href = '/'
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontFamily: "'Courier New', monospace",
              alignSelf: 'flex-start',
            }}
          >
            Sign out
          </button>
        </div>

        {/* Submission Info */}
        <div style={{ ...cardStyle, marginBottom: '1rem' }}>
          <p style={sectionLabelStyle}>Your Submission</p>
          <div style={{ marginBottom: '1rem' }}>
            <p style={labelStyle}>Artist Name</p>
            <p style={valueStyle}>{profile?.artistName ?? '—'}</p>
          </div>
          <div>
            <p style={labelStyle}>Song Title</p>
            <p style={valueStyle}>{profile?.songTitle ?? '—'}</p>
          </div>
        </div>

        {/* Process Status */}
        <div style={{ ...cardStyle, marginBottom: '1rem' }}>
          <p style={sectionLabelStyle}>Compilation Status</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <StatusRow
              label="Submissions Open"
              color={compilationStatus?.submissionsOpen ? 'green' : 'red'}
            />
            <StatusRow
              label="Listening Selection Process"
              color={compilationStatus?.listeningActive ? 'green' : 'gray'}
            />
            <StatusRow label="Album Selection Process" color="gray" />
          </div>
        </div>

        {/* Result */}
        {profile?.resultMessage && (
          <div
            style={{
              ...cardStyle,
              background:
                profile.resultMessage === 'selected'
                  ? 'rgba(45,106,79,0.15)'
                  : 'rgba(198,40,40,0.1)',
              border: `1px solid ${profile.resultMessage === 'selected' ? '#2d6a4f' : '#c62828'}`,
            }}
          >
            <p style={sectionLabelStyle}>Your Result</p>
            <p
              style={{
                color: '#fff',
                fontFamily: 'Georgia, serif',
                fontSize: '1rem',
                margin: 0,
                fontStyle: 'italic',
              }}
            >
              {profile.resultMessage === 'selected'
                ? '🎉 You made it! Welcome to the PDX Pop Now! 2026 Compilation.'
                : '🙏 Thank you for submitting. Try again next year.'}
            </p>
          </div>
        )}

        {error && (
          <p
            style={{
              background: '#2a0a0a',
              border: '1px solid #c62828',
              borderRadius: 8,
              padding: '10px 12px',
              color: '#ef9a9a',
              fontSize: '0.85rem',
              marginTop: '1rem',
            }}
          >
            {error}
          </p>
        )}
      </div>
    </main>
  )
}

function StatusRow({
  label,
  color,
}: {
  label: string
  color: 'green' | 'yellow' | 'red' | 'gray'
}) {
  const colors: Record<string, string> = {
    green: '#4caf50',
    yellow: '#ffb300',
    red: '#e53935',
    gray: '#555',
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: colors[color],
          flexShrink: 0,
        }}
      />
      <p
        style={{
          color: color === 'gray' ? '#555' : '#fff',
          fontFamily: "'Courier New', monospace",
          fontSize: '0.85rem',
          margin: 0,
        }}
      >
        {label}
      </p>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0f0f1a',
  display: 'flex',
  justifyContent: 'center',
  padding: '3rem 1.5rem',
}

const cardStyle: React.CSSProperties = {
  background: '#1a1a2e',
  borderRadius: 12,
  padding: '1.5rem',
  border: '1px solid rgba(255,255,255,0.08)',
}

const sectionLabelStyle: React.CSSProperties = {
  color: '#e63946',
  fontSize: '0.7rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  fontFamily: "'Courier New', monospace",
  marginBottom: '1rem',
  margin: '0 0 1rem',
}

const labelStyle: React.CSSProperties = {
  color: '#555',
  fontSize: '0.75rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontFamily: "'Courier New', monospace",
  margin: '0 0 4px',
}

const valueStyle: React.CSSProperties = {
  color: '#fff',
  fontFamily: 'Georgia, serif',
  fontSize: '1rem',
  margin: 0,
}
