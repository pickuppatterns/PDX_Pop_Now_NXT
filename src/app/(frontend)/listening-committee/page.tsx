'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  genreFirst: string
  genreSecond: string
  isReturning: string
  mailingList: boolean
}

const initialForm: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  genreFirst: '',
  genreSecond: '',
  isReturning: '',
  mailingList: false,
}

export default function ListeningCommitteePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/listening-committee-settings')
      .then((r) => r.json())
      .then((d) => setIsOpen(d.isOpen ?? false))
      .catch(() => setIsOpen(false))
  }, [])

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate(): string | null {
    if (step === 0) {
      if (!form.firstName.trim()) return 'First name is required.'
      if (!form.lastName.trim()) return 'Last name is required.'
      if (!form.email.trim()) return 'Email is required.'
      const phoneDigits = form.phone.replace(/\D/g, '')
      if (phoneDigits.length !== 10) return 'Please enter a valid 10-digit phone number.'
    }
    if (step === 1) {
      if (!form.genreFirst) return 'Please select your first choice genre.'
      if (!form.isReturning) return 'Please let us know if you have been on the committee before.'
    }
    return null
  }

  function nextStep() {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError('')
    setStep((s) => s + 1)
  }

  function prevStep() {
    setError('')
    setStep((s) => s - 1)
  }

  async function handleSubmit() {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/listening-committee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Submission failed.')
      router.push('/listening-committee/thank-you')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = [
    { title: 'Contact Info', emoji: '👤' },
    { title: 'Music Preferences', emoji: '🎵' },
  ]
  if (isOpen === null) {
    return (
      <main className="vol-page">
        <div className="vol-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: '#888', fontFamily: "'Courier New', monospace" }}>Loading…</p>
        </div>
      </main>
    )
  }

  if (!isOpen) {
    return (
      <main className="vol-page">
        <div
          className="vol-container"
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
            Listening Committee
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Applications to join the listening committee are now closed, check back when the form
            goes live.
          </p>
          <h3
            style={{
              fontFamily: "'Courier New', monospace",
              color: '#e63946',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              marginBottom: '0.5rem',
              marginTop: '2rem',
            }}
          >
            About the Listening Committee!
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Following the submission process, tracks are reviewed anonymously and voted on by our
            all-volunteer Listening Committee. This could be a chance to listen to unreleased
            material from your favorite bands &amp; artists, or, this could be a chance to find your
            new favorite local band! Join the crew and help select the songs that curate the vibe of
            the city! The tracks are then narrowed down with respect to genre diversity and
            popularity, making it a completely community-driven compilation. If you would like to be
            on the Listening Committee, we will be accepting submissions on January 20 – February
            15. Book mark this page for prompt return when the form drops here online.
          </p>
          <p>
            Any questions? Contact{' '}
            <a href="mailto:compilations@pdxpopnow.com" style={{ color: '#e63946' }}>
              compilations@pdxpopnow.com
            </a>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="vol-page">
      <div className="vol-container">
        <div className="vol-header">
          <p className="vol-eyebrow">PDX Pop Now! 2026</p>
          <h1 className="vol-title">Listening Committee</h1>
          <p className="vol-subtitle">
            Help us curate the best new Portland music. You&apos;ll be assigned a batch of anonymous
            tracks to rate — no meetings required.
          </p>
          <p className="vol-deadline">Deadline: February 15, 2026</p>
        </div>

        <div className="vol-steps">
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
          <span className="vol-card-emoji">{stepTitles[step].emoji}</span>
          <h2 className="vol-card-title">{stepTitles[step].title}</h2>

          {step === 0 && (
            <div className="vol-fields">
              <div className="vol-field-row">
                <div className="vol-field">
                  <label>
                    First Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setField('firstName', e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="vol-field">
                  <label>
                    Last Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setField('lastName', e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="vol-field">
                <label>
                  Email <span className="req">*</span>
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
                  placeholder="(503) 555-1234"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="vol-fields">
              <div className="vol-field">
                <label>
                  First Choice Genre <span className="req">*</span>
                </label>
                <div className="vol-size-grid">
                  {GENRES.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`vol-size-btn ${form.genreFirst === g.id ? 'selected' : ''}`}
                      onClick={() => setField('genreFirst', g.id)}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="vol-field">
                <label>Second Choice Genre</label>
                <div className="vol-size-grid">
                  {GENRES.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`vol-size-btn ${form.genreSecond === g.id ? 'selected' : ''}`}
                      onClick={() => setField('genreSecond', g.id)}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="vol-field">
                <label>
                  Have you been on the Listening Committee before? <span className="req">*</span>
                </label>
                <div className="vol-radios">
                  {[
                    { value: 'yes', label: 'Yes!' },
                    { value: 'no', label: 'No, this is my first time!' },
                  ].map((o) => (
                    <label
                      key={o.value}
                      className={`vol-radio-label ${form.isReturning === o.value ? 'checked' : ''}`}
                    >
                      <input
                        type="radio"
                        name="isReturning"
                        value={o.value}
                        checked={form.isReturning === o.value}
                        onChange={() => setField('isReturning', o.value)}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="vol-field">
                <label className={`vol-radio-label ${form.mailingList ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.mailingList}
                    onChange={(e) => setField('mailingList', e.target.checked)}
                  />
                  <span>Include me on the PDX Pop Now! mailing list</span>
                </label>
              </div>
            </div>
          )}

          {error && <p className="vol-error">{error}</p>}
        </div>

        <div className="vol-nav">
          {step > 0 && (
            <button type="button" className="vol-btn vol-btn--back" onClick={prevStep}>
              ← Back
            </button>
          )}
          {step < stepTitles.length - 1 ? (
            <button type="button" className="vol-btn vol-btn--next" onClick={nextStep}>
              Next →
            </button>
          ) : (
            <button
              type="button"
              className="vol-btn vol-btn--submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting…' : 'Submit Application →'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .vol-page { min-height: 100vh; background: #f5f0e8; padding: 2rem 1rem 4rem; font-family: Georgia, serif; }
        .vol-container { max-width: 640px; margin: 0 auto; }
        .vol-header { text-align: center; margin-bottom: 2rem; }
        .vol-eyebrow { color: #e63946; font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 0.5rem; font-family: 'Courier New', monospace; }
        .vol-title { font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 900; font-style: italic; color: #1a1a2e; line-height: 1; margin: 0 0 1rem; }
        .vol-subtitle { color: #444; line-height: 1.7; margin: 0 0 0.5rem; }
        .vol-deadline { color: #e63946; font-size: 0.85rem; font-family: 'Courier New', monospace; margin: 0; }
        .vol-steps { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
        .vol-step-indicator { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; border-radius: 20px; background: rgba(0,0,0,0.06); font-size: 0.8rem; font-family: 'Courier New', monospace; color: #666; }
        .vol-step-indicator.active { background: #1a1a2e; color: #fff; }
        .vol-step-indicator.done { background: #2d6a4f; color: #fff; }
        .vol-step-num { font-weight: 700; }
        .vol-card { background: #fff; border-radius: 12px; padding: 2rem; margin-bottom: 1.5rem; border: 1px solid rgba(0,0,0,0.08); }
        .vol-card-emoji { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
        .vol-card-title { font-size: 1.25rem; font-weight: 700; color: #1a1a2e; margin: 0 0 1.5rem; }
        .vol-fields { display: flex; flex-direction: column; gap: 1.25rem; }
        .vol-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .vol-field label { display: block; font-size: 0.8rem; font-weight: 600; color: #444; margin-bottom: 0.4rem; font-family: 'Courier New', monospace; text-transform: uppercase; letter-spacing: 0.05em; }
        .vol-field input, .vol-field textarea { width: 100%; border: 1.5px solid #ddd; border-radius: 8px; padding: 10px 12px; font-size: 0.95rem; font-family: Georgia, serif; color: #1a1a2e; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .vol-field input:focus, .vol-field textarea:focus { border-color: #1a1a2e; }
        .req { color: #e63946; }
        .vol-size-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .vol-size-btn { padding: 6px 14px; border-radius: 20px; border: 1.5px solid #ddd; background: #fff; color: #444; font-size: 0.85rem; font-family: 'Courier New', monospace; cursor: pointer; transition: all 0.15s; }
        .vol-size-btn.selected { border-color: #e63946; background: #fff5f5; color: #e63946; font-weight: 700; }
        .vol-radios { display: flex; flex-direction: column; gap: 0.5rem; }
        .vol-radio-label { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 1rem; border-radius: 8px; border: 1.5px solid #ddd; cursor: pointer; font-size: 0.9rem; transition: all 0.15s; }
        .vol-radio-label.checked { border-color: #e63946; background: #fff5f5; }
        .vol-radio-label input { accent-color: #e63946; }
        .vol-error { color: #e63946; font-size: 0.85rem; margin-top: 1rem; padding: 0.75rem 1rem; background: #fff5f5; border-radius: 8px; border: 1px solid #fcc; }
        .vol-nav { display: flex; justify-content: space-between; align-items: center; }
        .vol-btn { padding: 12px 28px; border-radius: 8px; font-size: 0.9rem; font-weight: 700; font-family: 'Courier New', monospace; cursor: pointer; border: none; transition: opacity 0.2s; }
        .vol-btn--back { background: transparent; border: 1.5px solid #ccc; color: #666; }
        .vol-btn--next, .vol-btn--submit { background: #e63946; color: #fff; margin-left: auto; }
        .vol-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </main>
  )
}
