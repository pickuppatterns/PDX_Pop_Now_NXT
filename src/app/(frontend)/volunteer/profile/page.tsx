'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from '@/lib/auth-client'
import Link from 'next/link'

type VolunteerProfile = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  emergencyContact: string
  shirtSize: string
  positions: string[]
  assignedShift: string | null
  assignedPosition: string | null
  experience: string
  accommodations: string
  additionalNotes: string
  status: 'active' | 'inactive'
}

const SHIFT_LABELS: Record<string, string> = {
  fri_setup: 'Friday 12:00–5:00 PM (Set-Up)',
  fri_evening: 'Friday 4:30–10:00 PM',
  sat_afternoon: 'Saturday 12:30–5:30 PM',
  sat_evening: 'Saturday 5:00–10:00 PM',
  sun_afternoon: 'Sunday 12:30–5:30 PM',
  sun_evening: 'Sunday 5:00–10:00 PM',
}

const POSITION_LABELS: Record<string, string> = {
  setup: 'Set-Up Volunteer',
  merch: 'Merch Booth Volunteer',
  green_room: 'Green Room Volunteer',
  wristband: '21+ Wristband Station',
  videographer: 'Videographer',
  donation: 'Donation Taker',
  crowd_counter: 'Crowd Counter',
  floater: 'Floater',
  ice_cream: 'Ice Cream & Popcorn Attendant',
  kids_craft: 'Kids Craft Table Attendant',
}

export default function VolunteerProfilePage() {
  const { data: session, isPending } = useSession()
  const [profile, setProfile] = useState<VolunteerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    emergencyContact: '',
    status: 'active' as 'active' | 'inactive',
  })

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/volunteer-profile')
      if (!res.ok) throw new Error('Failed to load profile')
      const data = await res.json()
      setProfile(data)
      setForm({
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phone: data.phone ?? '',
        emergencyContact: data.emergencyContact ?? '',
        status: data.status ?? 'active',
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session?.user) return
    fetchProfile()
  }, [session, fetchProfile])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/volunteer-profile', {
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

  if (!session?.user) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <p style={{ color: '#fff', marginBottom: '1rem' }}>Please log in to view your profile.</p>
          <Link href="/login" style={buttonStyle}>
            Log In →
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        <div
          style={{
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
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
              PDX Pop Now! 2025
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
              Volunteer Profile
            </h1>
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
            }}
          >
            Sign out
          </button>
        </div>

        {/* Assigned shift — read only */}
        <div
          style={{
            ...cardStyle,
            marginBottom: '1rem',
            background: profile?.assignedShift ? 'rgba(255,140,66,0.08)' : '#1a1a2e',
            border: profile?.assignedShift
              ? '1px solid rgba(255,140,66,0.3)'
              : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p
            style={{
              color: '#ff8c42',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              margin: '0 0 8px',
              fontFamily: "'Courier New', monospace",
            }}
          >
            Assigned Shift
          </p>
          <p style={{ color: '#fff', fontSize: '1rem', margin: 0, fontFamily: 'Georgia, serif' }}>
            {profile?.assignedShift
              ? (SHIFT_LABELS[profile.assignedShift] ?? profile.assignedShift)
              : 'Not yet assigned — check back closer to the festival!'}
          </p>
        </div>

        <div
          style={{
            ...cardStyle,
            marginBottom: '1rem',
            background: profile?.assignedPosition ? 'rgba(255,140,66,0.08)' : '#1a1a2e',
            border: profile?.assignedPosition
              ? '1px solid rgba(255,140,66,0.3)'
              : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p
            style={{
              color: '#ff8c42',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              margin: '0 0 8px',
              fontFamily: "'Courier New', monospace",
            }}
          >
            Assigned Position
          </p>
          <p style={{ color: '#fff', fontSize: '1rem', margin: 0, fontFamily: 'Georgia, serif' }}>
            {profile?.assignedPosition
              ? (POSITION_LABELS[profile.assignedPosition] ?? profile.assignedPosition)
              : 'Not yet assigned'}
          </p>
        </div>

        {/* Editable contact info */}
        <div style={cardStyle}>
          <p
            style={{
              color: '#ff8c42',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              margin: '0 0 1.5rem',
              fontFamily: "'Courier New', monospace",
            }}
          >
            Contact Info
          </p>

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
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Emergency Contact</label>
            <input
              value={form.emergencyContact}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>My Status</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {(['active', 'inactive'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, status: s })}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    border: `1px solid ${form.status === s ? '#ff8c42' : 'rgba(255,255,255,0.15)'}`,
                    background: form.status === s ? 'rgba(255,140,66,0.15)' : 'transparent',
                    color: form.status === s ? '#ff8c42' : '#aaa',
                    cursor: 'pointer',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.85rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
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

          {success && (
            <p
              style={{
                background: '#0a2a0a',
                border: '1px solid #2e7d32',
                borderRadius: 8,
                padding: '10px 12px',
                color: '#a5d6a7',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              Changes saved!
            </p>
          )}

          <button onClick={handleSave} disabled={saving} style={buttonStyle}>
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
  justifyContent: 'center',
  padding: '3rem 1.5rem',
}

const cardStyle: React.CSSProperties = {
  background: '#1a1a2e',
  borderRadius: 12,
  padding: '1.5rem',
  border: '1px solid rgba(255,255,255,0.08)',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#aaa',
  fontSize: '0.75rem',
  marginBottom: 6,
  letterSpacing: '0.1em',
  fontFamily: "'Courier New', monospace",
  textTransform: 'uppercase',
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
  textDecoration: 'none',
  display: 'inline-block',
}
