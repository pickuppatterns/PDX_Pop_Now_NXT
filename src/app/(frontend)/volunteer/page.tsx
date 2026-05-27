'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const POSITIONS = [
  { id: 'no_preference', label: 'No Preference', emoji: '🎪' },
  { id: 'setup', label: 'Set-Up Volunteer', emoji: '🎪' },
  { id: 'merch', label: 'Merch Booth Volunteer', emoji: '🧢' },
  { id: 'green_room', label: 'Green Room Volunteer', emoji: '🍇' },
  { id: 'wristband', label: '21+ Wristband Station Volunteer', emoji: '🍻' },
  { id: 'videographer', label: 'Videographer', emoji: '🎥' },
  { id: 'donation', label: 'Donation Taker', emoji: '💸' },
  { id: 'crowd_counter', label: 'Crowd Counter', emoji: '👥' },
  { id: 'floater', label: 'Floater', emoji: '🔄' },
  { id: 'ice_cream', label: 'Ice Cream & Popcorn Attendant', emoji: '🍦' },
  { id: 'kids_craft', label: 'Kids Craft Table Attendant', emoji: '🎨' },
]

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

const MUSIC_GENRES = [
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
  { id: 'rock_alt_punk', label: 'Rock / Alternative / Punk' },
  { id: 'indie_rock_pop', label: 'Indie Rock / Pop' },
  { id: 'goth_darkwave', label: 'Goth / Dark-Wave' },
]

const HEARD_FROM_OPTIONS = [
  'Friend/Word of Mouth',
  'Social Media',
  'PDX Pop Now! Website',
  'PDX Pop Now! Outreach Email',
  'Other',
]

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  emergencyContact: string
  positions: string[]
  experience: string
  accommodations: string
  shirtSize: string
  musicGenres: string[]
  heardFrom: string
  heardFromOther: string
  additionalNotes: string
}

const initialForm: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  emergencyContact: '',
  positions: [],
  experience: '',
  accommodations: '',
  shirtSize: '',
  musicGenres: [],
  heardFrom: '',
  heardFromOther: '',
  additionalNotes: '',
}

export default function VolunteerPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(0)

  const totalSteps = 3

  const [isOpen, setIsOpen] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/volunteer-settings')
      .then((r) => r.json())
      .then((d) => setIsOpen(d.isOpen ?? false))
      .catch(() => setIsOpen(false))
  }, [])

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleArray(key: 'positions', value: string) {
    setForm((prev) => {
      const arr = prev[key] as string[]
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!form.firstName.trim()) return 'First name is required.'
      if (!form.email.trim()) return 'Email is required.'
      if (!form.phone.trim()) return 'Phone number is required.'
      const phoneDigits = form.phone.replace(/\D/g, '')
      if (phoneDigits.length !== 10) return 'Please enter a valid 10-digit phone number.'
    }
    if (step === 1) {
      if (form.positions.length === 0) return 'Please select at least one position.'
    }
    if (step === 2) {
      if (!form.shirtSize) return 'Please select a shirt size.'
    }
    return null
  }

  function nextStep() {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setStep((s) => Math.min(s + 1, totalSteps - 1))
  }

  function prevStep() {
    setError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleSubmit() {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message ?? 'Submission failed. Please try again.')
      }

      router.push('/volunteer/thank-you')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const stepTitles = [
    { emoji: '🎤', title: 'Tell Us About You' },
    { emoji: '🎶', title: 'Where Do You Want to Shine?' },
    { emoji: '✨', title: 'A Few Final Notes' },
  ]
  if (isOpen === null) {
    return (
      <main className="volunteer-page">
        <div className="vol-hero">
          <div className="vol-hero-inner" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#888', fontFamily: "'Courier New', monospace" }}>Loading…</p>
          </div>
        </div>
      </main>
    )
  }

  if (!isOpen) {
    return (
      <main className="volunteer-page">
        <div className="vol-hero">
          <div className="vol-hero-inner">
            <p className="vol-preheader">PDX Pop Now! Festival</p>
            <h1 className="vol-title">
              Volunteer
              <br />
              Application
            </h1>
          </div>
        </div>
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '3rem 1.5rem',
            fontFamily: 'Georgia, serif',
            color: '#e8e8e8',
            lineHeight: 1.8,
          }}
        >
          <h3
            style={{
              fontFamily: "'Courier New', monospace",
              color: '#e63946',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              marginBottom: '0.5rem',
            }}
          >
            Volunteer Applications
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            We are currently at capacity with volunteers, check back to this page when the form is
            live.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            We are excited for you to join the PDX Pop Now! volunteer staff team and be part of the
            thriving Portland music scene. PDX Pop Now! is an entirely volunteer-run nonprofit
            organization. From the booking committee, to the board of directors, to the festival
            volunteers, everyone donates their time.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            We have open positions available — check here if you&apos;re interested:{' '}
            <a href="https://www.pdxpopnow.com/open-positions" style={{ color: '#e63946' }}>
              open positions
            </a>
          </p>
          <p>
            Any questions? Contact{' '}
            <a href="mailto:volunteers@pdxpopnow.com" style={{ color: '#e63946' }}>
              volunteers@pdxpopnow.com
            </a>
          </p>
          <p>
            Any questions? Contact{' '}
            <a href="mailto:volunteers@pdxpopnow.com" style={{ color: '#e63946' }}>
              volunteers@pdxpopnow.com
            </a>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="volunteer-page">
      <div className="vol-hero">
        <div className="vol-hero-inner">
          <p className="vol-preheader">PDX Pop Now! Festival</p>
          <h1 className="vol-title">
            Volunteer
            <br />
            Application
          </h1>
          <p className="vol-subtitle">
            Every volunteer gets a free t-shirt and a free meal for each shift. Help keep the music
            alive and support Portland's local scene!
          </p>
        </div>
      </div>

      <div className="vol-form-wrap">
        <div className="vol-progress">
          {stepTitles.map((s, i) => (
            <div
              key={i}
              className={`vol-step-indicator ${i === step ? 'active' : i < step ? 'done' : ''}`}
            >
              <span className="vol-step-num">{i < step ? '✓' : i + 1}</span>
              <span className="vol-step-label">{s.title}</span>
            </div>
          ))}
        </div>

        <div className="vol-card">
          <div className="vol-card-header">
            <span className="vol-card-emoji">{stepTitles[step].emoji}</span>
            <h2 className="vol-card-title">{stepTitles[step].title}</h2>
          </div>

          {/* Step 0: Contact */}
          {step === 0 && (
            <div className="vol-fields">
              <div className="vol-row">
                <div className="vol-field">
                  <label>
                    First Name <span className="req">*</span>
                  </label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setField('firstName', e.target.value)}
                    placeholder="Ada"
                  />
                </div>
                <div className="vol-field">
                  <label>Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setField('lastName', e.target.value)}
                    placeholder="Lovelace"
                  />
                </div>
              </div>
              <div className="vol-field">
                <label>
                  Email Address <span className="req">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="vol-field">
                <label>
                  Phone Number <span className="req">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                    let formatted = digits
                    if (digits.length >= 7) {
                      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
                    } else if (digits.length >= 4) {
                      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`
                    } else if (digits.length >= 1) {
                      formatted = `(${digits}`
                    }
                    setField('phone', formatted)
                  }}
                  maxLength={14}
                  placeholder="(503) 555-1234"
                />
              </div>
              <div className="vol-field">
                <label>
                  Emergency Contact Name &amp; Phone{' '}
                  <span className="optional">(optional but recommended)</span>
                </label>
                <input
                  value={form.emergencyContact}
                  onChange={(e) => setField('emergencyContact', e.target.value)}
                  placeholder="Jane Doe — (503) 555-0199"
                />
              </div>
            </div>
          )}

          {/* Step 1: Positions */}
          {step === 1 && (
            <div className="vol-fields">
              <div className="vol-field">
                <label>
                  Which volunteer position(s) are you most interested in?{' '}
                  <span className="req">*</span>
                </label>
                <div className="vol-checks vol-checks--grid">
                  {POSITIONS.map((p) => (
                    <label
                      key={p.id}
                      className={`vol-check-label ${form.positions.includes(p.id) ? 'checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={form.positions.includes(p.id)}
                        onChange={() => toggleArray('positions', p.id)}
                      />
                      <span>
                        {p.emoji} {p.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="vol-field">
                <label>Relevant experience or skills?</label>
                <textarea
                  maxLength={250}
                  value={form.experience}
                  onChange={(e) => setField('experience', e.target.value)}
                  placeholder="Tell us anything helpful for the positions you're interested in..."
                  rows={3}
                />
              </div>
              <div className="vol-field">
                <label>Do you need any accommodations?</label>
                <textarea
                  maxLength={250}
                  value={form.accommodations}
                  onChange={(e) => setField('accommodations', e.target.value)}
                  placeholder="Accessibility, modified duties, etc."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Step 2: Extra info */}
          {step === 2 && (
            <div className="vol-fields">
              <div className="vol-field">
                <label>
                  Shirt Size (unisex) <span className="req">*</span>
                </label>
                <div className="vol-size-grid">
                  {SHIRT_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      className={`vol-size-btn ${form.shirtSize === sz ? 'selected' : ''}`}
                      onClick={() => setField('shirtSize', sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                <div className="vol-field">
                  <label>Favorite Music Genres (select all that apply)</label>
                  <div className="vol-size-grid">
                    {MUSIC_GENRES.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        className={`vol-size-btn ${form.musicGenres.includes(g.id) ? 'selected' : ''}`}
                        onClick={() => {
                          const current = form.musicGenres
                          const updated = current.includes(g.id)
                            ? current.filter((v) => v !== g.id)
                            : [...current, g.id]
                          setField('musicGenres', updated)
                        }}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="vol-field">
                <label>How did you hear about volunteering with PDX Pop Now!?</label>
                <div className="vol-radios">
                  {HEARD_FROM_OPTIONS.map((o) => (
                    <label
                      key={o}
                      className={`vol-radio-label ${form.heardFrom === o ? 'checked' : ''}`}
                    >
                      <input
                        type="radio"
                        name="heardFrom"
                        value={o}
                        checked={form.heardFrom === o}
                        onChange={() => setField('heardFrom', o)}
                      />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
                {form.heardFrom === 'Other' && (
                  <input
                    className="vol-other-input"
                    value={form.heardFromOther}
                    onChange={(e) => setField('heardFromOther', e.target.value)}
                    placeholder="Please specify..."
                  />
                )}
              </div>
              <div className="vol-field">
                <label>Anything else you'd like us to know?</label>
                <textarea
                  maxLength={250}
                  value={form.additionalNotes}
                  onChange={(e) => setField('additionalNotes', e.target.value)}
                  placeholder="Any other thoughts, questions, or notes..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {error && <p className="vol-error">{error}</p>}

          <div className="vol-actions">
            {step > 0 && (
              <button type="button" className="vol-btn vol-btn--back" onClick={prevStep}>
                ← Back
              </button>
            )}
            {step < totalSteps - 1 ? (
              <button type="button" className="vol-btn vol-btn--next" onClick={nextStep}>
                Next →
              </button>
            ) : (
              <button
                type="button"
                className="vol-btn vol-btn--submit"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Application 🎉'}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .volunteer-page {
          min-height: 100vh;
          background: #faf7f2;
          font-family: 'Georgia', serif;
        }
        .vol-hero {
          background: #1a1a2e;
          background-image: repeating-linear-gradient(
            45deg, transparent, transparent 40px,
            rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 80px
          );
          padding: 4rem 1.5rem 3rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .vol-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 50%, rgba(255,80,80,0.15) 0%, transparent 60%),
                      radial-gradient(ellipse at 70% 40%, rgba(255,200,50,0.10) 0%, transparent 60%);
        }
        .vol-hero-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .vol-preheader {
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #ff8c42;
          margin-bottom: 1rem;
        }
        .vol-title {
          font-size: clamp(2.5rem, 8vw, 5rem);
          font-weight: 900;
          color: #fff;
          line-height: 0.95;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
          font-style: italic;
        }
        .vol-subtitle {
          font-size: 1rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.6;
          max-width: 480px;
          margin: 0 auto;
        }
        .vol-form-wrap {
          max-width: 680px;
          margin: 0 auto;
          padding: 2rem 1rem 4rem;
        }
        .vol-progress {
          display: flex;
          gap: 4px;
          margin-bottom: 1.5rem;
        }
        .vol-step-indicator {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 4px;
          border-radius: 8px;
          opacity: 0.4;
          transition: opacity 0.2s;
        }
        .vol-step-indicator.active { opacity: 1; }
        .vol-step-indicator.done { opacity: 0.7; }
        .vol-step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #1a1a2e;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
        }
        .vol-step-indicator.active .vol-step-num { background: #e63946; }
        .vol-step-indicator.done .vol-step-num { background: #2d6a4f; }
        .vol-step-label {
          font-size: 10px;
          text-align: center;
          color: #333;
          font-family: 'Courier New', monospace;
          line-height: 1.3;
        }
        .vol-card {
          background: #fff;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
        }
        .vol-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.75rem;
          padding-bottom: 1.25rem;
          border-bottom: 2px solid #f0ebe0;
        }
        .vol-card-emoji { font-size: 1.75rem; }
        .vol-card-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1a1a2e;
          font-style: italic;
        }
        .vol-fields { display: flex; flex-direction: column; gap: 1.25rem; }
        .vol-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 500px) { .vol-row { grid-template-columns: 1fr; } }
        .vol-field { display: flex; flex-direction: column; gap: 6px; }
        .vol-field label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #333;
          font-family: 'Courier New', monospace;
        }
        .req { color: #e63946; }
        .optional { font-weight: 400; color: #888; font-style: italic; }
        .vol-field input, .vol-field textarea {
          border: 1.5px solid #ddd;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 0.95rem;
          font-family: 'Georgia', serif;
          color: #222;
          background: #fafafa;
          transition: border-color 0.15s, background 0.15s;
          outline: none;
          resize: vertical;
        }
        .vol-field input:focus, .vol-field textarea:focus {
          border-color: #e63946;
          background: #fff;
        }
        .vol-checks { display: flex; flex-direction: column; gap: 6px; }
        .vol-checks--grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        @media (max-width: 500px) { .vol-checks--grid { grid-template-columns: 1fr; } }
        .vol-check-label {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1.5px solid #e8e3d8;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          font-size: 0.875rem;
          color: #333;
          background: #fafaf7;
        }
        .vol-check-label:hover { background: #f5f0e8; border-color: #ccc; }
        .vol-check-label.checked { background: #fff5f5; border-color: #e63946; color: #1a1a2e; }
        .vol-check-label input { margin-top: 2px; accent-color: #e63946; flex-shrink: 0; }
        .vol-radios { display: flex; flex-direction: column; gap: 6px; }
        .vol-radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1.5px solid #e8e3d8;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          font-size: 0.875rem;
          color: #333;
          background: #fafaf7;
        }
        .vol-radio-label:hover { background: #f5f0e8; border-color: #ccc; }
        .vol-radio-label.checked { background: #fff5f5; border-color: #e63946; }
        .vol-radio-label input { accent-color: #e63946; flex-shrink: 0; }
        .vol-other-input {
          margin-top: 8px;
          border: 1.5px solid #ddd;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 0.95rem;
          font-family: 'Georgia', serif;
          width: 100%;
          outline: none;
        }
        .vol-other-input:focus { border-color: #e63946; }
        .vol-size-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .vol-size-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1.5px solid #e8e3d8;
          background: #fafaf7;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          color: #333;
        }
        .vol-size-btn:hover { background: #f5f0e8; border-color: #ccc; }
        .vol-size-btn.selected { background: #e63946; border-color: #e63946; color: #fff; }
        .vol-error {
          margin-top: 1rem;
          padding: 10px 14px;
          background: #fff0f0;
          border: 1px solid #ffcdd2;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #c62828;
          font-family: 'Courier New', monospace;
        }
        .vol-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 1.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid #f0ebe0;
        }
        .vol-btn {
          padding: 11px 24px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          cursor: pointer;
          border: none;
          transition: opacity 0.15s, transform 0.1s;
        }
        .vol-btn:active { transform: scale(0.98); }
        .vol-btn--back { background: transparent; color: #666; border: 1.5px solid #ddd; }
        .vol-btn--back:hover { background: #f5f5f5; }
        .vol-btn--next { background: #1a1a2e; color: #fff; margin-left: auto; }
        .vol-btn--next:hover { opacity: 0.85; }
        .vol-btn--submit { background: #e63946; color: #fff; margin-left: auto; }
        .vol-btn--submit:hover { opacity: 0.85; }
        .vol-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </main>
  )
}
