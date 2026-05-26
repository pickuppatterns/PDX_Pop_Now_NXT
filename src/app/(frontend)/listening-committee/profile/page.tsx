'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import md5 from 'md5'

const GENRES = [
  { id: 'classical', label: 'Classical' },
  { id: 'country', label: 'Country' },
  { id: 'electronic', label: 'Electronic' },
  { id: 'experimental', label: 'Experimental' },
  { id: 'folk_americana', label: 'Folk / Americana' },
  { id: 'hip_hop', label: 'Hip Hop / Rap' },
  { id: 'international', label: 'International' },
  { id: 'rb_soul', label: 'R&B / Soul' },
  { id: 'jazz', label: 'Jazz' },
  { id: 'metal_hardcore', label: 'Metal / Hardcore' },
  { id: 'pop', label: 'Pop' },
  { id: 'post_punk', label: 'Post-Punk' },
  { id: 'rock_alt_punk', label: 'Rock / Alt / Punk' },
  { id: 'indie_rock_pop', label: 'Indie Rock / Pop' },
  { id: 'goth_darkwave', label: 'Goth / Dark-Wave' },
]

function gravatarUrl(email: string, size = 80) {
  return `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?d=retro&s=${size}`
}

type Profile = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  genreFirst: string
  genreSecond: string
  isReturning: string
  mailingList: boolean
  status: string
  assignedBatch?: string
}

export default function ListeningCommitteeProfilePage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    genreFirst: '',
    genreSecond: '',
    mailingList: false,
    status: 'active' as 'active' | 'inactive',
  })

  async function fetchProfile() {
    try {
      const res = await fetch('/api/listening-committee-profile')
      if (!res.ok) {
        setError('Failed to load profile')
        setLoading(false)
        return
      }
      const data = await res.json()
      setProfile(data)
      setForm({
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phone: data.phone ?? '',
        genreFirst: data.genreFirst ?? '',
        genreSecond: data.genreSecond ?? '',
        mailingList: data.mailingList ?? false,
        status: data.status ?? 'active',
      })
      setLoading(false)
    } catch {
      setError('Failed to load profile')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isPending) return
    if (!session?.user) {
      router.push('/login')
      return
    }
    fetchProfile()
  }, [session, isPending])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/listening-committee-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save changes')
      setSuccess(true)
      await fetchProfile()
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
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

  const hour = new Date().getHours()
  const name = form.firstName
    ? form.firstName + (form.lastName ? ' ' + form.lastName : '')
    : (session.user.name ?? session.user.email)
  const greeting =
    hour >= 6 && hour < 12
      ? `☀️ Good Morning, ${name}`
      : hour >= 12 && hour < 18
        ? `🌤️ Good Afternoon, ${name}`
        : `🌙 Good Evening, ${name}`

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <img
            src={(session.user as any).image ?? gravatarUrl(session.user.email, 80)}
            alt="Avatar"
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '2px solid rgba(255,140,66,0.4)',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
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
              Listener Profile
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem',
                margin: '6px 0 0',
                fontFamily: 'Georgia, serif',
              }}
            >
              {greeting}
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

        {/* Assigned Batch */}
        <div
          style={{
            ...cardStyle,
            marginBottom: '1rem',
            background: 'rgba(255,140,66,0.08)',
            border: '1px solid rgba(255,140,66,0.2)',
          }}
        >
          <p style={labelStyle}>Assigned Group</p>
          <p style={{ color: '#fff', fontFamily: 'Georgia, serif', margin: 0 }}>
            {profile?.assignedBatch ??
              'Not yet assigned — check back when the listening process begins!'}
          </p>
        </div>

        {/* Contact Info */}
        <div style={cardStyle}>
          <p style={sectionLabelStyle}>Contact Info</p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <label style={labelStyle}>First Name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              value={form.phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                let formatted = digits
                if (digits.length >= 7)
                  formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
                else if (digits.length >= 4)
                  formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`
                else if (digits.length >= 1) formatted = `(${digits}`
                setForm({ ...form, phone: formatted })
              }}
              style={inputStyle}
              placeholder="(503) 555-1234"
            />
          </div>

          {/* Genre Preferences */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>First Choice Genre</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setForm({ ...form, genreFirst: g.id })}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: `1px solid ${form.genreFirst === g.id ? '#ff8c42' : 'rgba(255,255,255,0.15)'}`,
                    background: form.genreFirst === g.id ? 'rgba(255,140,66,0.15)' : 'transparent',
                    color: form.genreFirst === g.id ? '#ff8c42' : '#aaa',
                    cursor: 'pointer',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.8rem',
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Second Choice Genre</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setForm({ ...form, genreSecond: g.id })}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: `1px solid ${form.genreSecond === g.id ? '#ff8c42' : 'rgba(255,255,255,0.15)'}`,
                    background: form.genreSecond === g.id ? 'rgba(255,140,66,0.15)' : 'transparent',
                    color: form.genreSecond === g.id ? '#ff8c42' : '#aaa',
                    cursor: 'pointer',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.8rem',
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mailing List */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={form.mailingList}
                onChange={(e) => setForm({ ...form, mailingList: e.target.checked })}
                style={{ accentColor: '#ff8c42' }}
              />
              <span
                style={{
                  color: '#aaa',
                  fontSize: '0.85rem',
                  fontFamily: "'Courier New', monospace",
                }}
              >
                Include me on the PDX Pop Now! mailing list
              </span>
            </label>
          </div>

          {/* Status */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>My Status</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['active', 'inactive'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, status: s })}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background:
                      form.status === s
                        ? s === 'active'
                          ? 'rgba(165,214,167,0.15)'
                          : 'rgba(239,154,154,0.15)'
                        : 'rgba(255,255,255,0.05)',
                    color: form.status === s ? (s === 'active' ? '#a5d6a7' : '#ef9a9a') : '#666',
                    outline:
                      form.status === s
                        ? `1px solid ${s === 'active' ? '#a5d6a7' : '#ef9a9a'}`
                        : '1px solid transparent',
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
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
            </div>
          )}

          {success && (
            <div
              style={{
                background: '#0a2a0a',
                border: '1px solid #2d6a4f',
                borderRadius: 8,
                padding: '10px 12px',
                color: '#a5d6a7',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              ✓ Changes saved!
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...buttonStyle, opacity: saving ? 0.5 : 1 }}
          >
            {saving ? 'Saving…' : 'Save Changes →'}
          </button>
        </div>
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
  marginBottom: '1rem',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#aaa',
  fontSize: '0.75rem',
  marginBottom: 6,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontFamily: "'Courier New', monospace",
}

const sectionLabelStyle: React.CSSProperties = {
  color: '#ff8c42',
  fontSize: '0.75rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  fontFamily: "'Courier New', monospace",
  marginBottom: '1.5rem',
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
  background: '#e63946',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '12px 24px',
  fontSize: '0.9rem',
  fontWeight: 700,
  fontFamily: "'Courier New', monospace",
  cursor: 'pointer',
}
