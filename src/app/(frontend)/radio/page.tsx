'use client'

import { useState, useRef } from 'react'

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
  { id: 'rock_alt_punk', label: 'Rock / Alt / Punk' },
  { id: 'indie_rock_pop', label: 'Indie Rock / Pop' },
  { id: 'goth_darkwave', label: 'Goth / Darkwave' },
]

type RadioFormData = {
  name: string
  artistName: string
  songTitle: string
  email: string
  phone: string
  zipCode: string
  portlandBased: string
  genre: string[]
  radioAppropriate: string
  downloadLink: string
  website: string
  agreeLibrary: boolean
  agreeNotCompilation: boolean
  comments: string
}

const initial: RadioFormData = {
  name: '',
  artistName: '',
  songTitle: '',
  email: '',
  phone: '',
  zipCode: '',
  portlandBased: '',
  genre: [] as string[],
  radioAppropriate: '',
  downloadLink: '',
  website: '',
  agreeLibrary: false,
  agreeNotCompilation: false,
  comments: '',
}

const steps = [
  { emoji: '📡', title: 'Tell Us About You' },
  { emoji: '🎵', title: 'Your Music' },
  { emoji: '📻', title: 'Final Details' },
]

export default function RadioSubmissionPage() {
  const [submitted, setSubmitted] = useState('idle' as 'idle' | 'uploading' | 'success' | 'error')
  const [serverError, setServerError] = useState<string | null>(null)
  const [form, setForm] = useState<RadioFormData>(initial)
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [mp3File, setMp3File] = useState<File | null>(null)
  const [mp3Error, setMp3Error] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isUploading = submitted === 'uploading'

  function setField<K extends keyof RadioFormData>(key: K, value: RadioFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleMp3Change(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setMp3Error(null)
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMp3Error('File must be under 5MB.')
        setMp3File(null)
        return
      }
      if (!file.type.includes('audio/mpeg') && !file.name.endsWith('.mp3')) {
        setMp3Error('Only MP3 files are accepted.')
        setMp3File(null)
        return
      }
    }
    setMp3File(file)
  }

  function validate(): string | null {
    if (step === 0) {
      if (!form.name.trim()) return 'Your name is required.'
      if (!form.artistName.trim()) return 'Artist/Band name is required.'
      if (!form.email.trim()) return 'Email is required.'
      if (!form.phone.trim()) return 'Phone number is required.'
      if (!form.portlandBased) return 'Please indicate if you are Portland-based.'
      if (!form.zipCode.trim()) return 'Zip code is required.'
    }
    if (step === 1) {
      if (!form.genre.length) return 'Please select at least one genre, no more than two.'
      if (!form.radioAppropriate) return 'Please indicate if your music is Radio Appropriate.'
      if (!form.songTitle.trim()) return 'Song title is required.'
      if (!mp3File && !form.downloadLink.trim())
        return 'Please upload an MP3 or provide a download link.'
      if (!form.website.trim()) return 'Artist website/Bandcamp/Instagram is required.'
    }
    if (step === 2) {
      if (!form.agreeLibrary) return 'You must agree to the Portland Radio Project library terms.'
      if (!form.agreeNotCompilation)
        return 'You must acknowledge this is not a compilation submission.'
    }
    return null
  }

  function next() {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  function back() {
    setError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  async function submit() {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setSubmitted('uploading')
    try {
      const fd = new FormData()
      fd.append('data', JSON.stringify(form))
      if (mp3File) fd.append('mp3', mp3File)
      const res = await fetch('/api/radio-submissions', { method: 'POST', body: fd })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d?.message ?? 'Submission failed. Please try again.')
      }
      setSubmitted('success')
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : 'Something went wrong.')
      setSubmitted('error')
    }
  }

  if (submitted === 'uploading') {
    return (
      <main className="radio-page">
        <div className="radio-modal-overlay">
          <div className="radio-modal">
            <div className="radio-modal-spinner" />
            <p className="radio-modal-title">Submitting…</p>
            <p className="radio-modal-sub">
              {mp3File
                ? 'Uploading your track, this may take a moment.'
                : 'Sending your submission…'}
            </p>
          </div>
        </div>
        <style>{`
          .radio-page { min-height: 100vh; background: #faf7f2; }
          .radio-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
          .radio-modal { background: #fff; border-radius: 16px; padding: 2.5rem 2rem; text-align: center; max-width: 360px; width: 90%; }
          .radio-modal-spinner { width: 48px; height: 48px; border: 4px solid #f0ebe0; border-top-color: #e63946; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1.25rem; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .radio-modal-title { font-size: 1.25rem; font-weight: 700; font-style: italic; color: #1a1a2e; font-family: 'Georgia', serif; margin-bottom: 0.5rem; }
          .radio-modal-sub { font-size: 0.875rem; color: #666; font-family: 'Courier New', monospace; line-height: 1.5; }
        `}</style>
      </main>
    )
  }

  if (submitted === 'success') {
    return (
      <main className="radio-page">
        <div className="radio-modal-overlay">
          <div className="radio-modal">
            <div className="radio-modal-icon">{'📻'}</div>
            <p className="radio-modal-title">Submission Received!</p>
            <p className="radio-modal-sub">
              Thanks for submitting to the Portland Radio Project. We'll be in touch if your track
              is added to the library.
            </p>
          </div>
        </div>
        <style>{`
          .radio-page { min-height: 100vh; background: #faf7f2; }
          .radio-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
          .radio-modal { background: #fff; border-radius: 16px; padding: 2.5rem 2rem; text-align: center; max-width: 360px; width: 90%; }
          .radio-modal-icon { font-size: 3rem; margin-bottom: 1rem; }
          .radio-modal-title { font-size: 1.25rem; font-weight: 700; font-style: italic; color: #2d6a4f; font-family: 'Georgia', serif; margin-bottom: 0.5rem; }
          .radio-modal-sub { font-size: 0.875rem; color: #666; font-family: 'Courier New', monospace; line-height: 1.5; }
        `}</style>
      </main>
    )
  }

  if (submitted === 'error') {
    return (
      <main className="radio-page">
        <div className="radio-modal-overlay">
          <div className="radio-modal">
            <div className="radio-modal-icon">{'⚠️'}</div>
            <p className="radio-modal-title">Something went wrong</p>
            <p className="radio-modal-sub">
              {serverError ?? 'Please try again or contact us directly.'}
            </p>
            <button className="radio-modal-retry" onClick={() => setSubmitted('idle')}>
              {'← Try Again'}
            </button>
          </div>
        </div>
        <style>{`
          .radio-page { min-height: 100vh; background: #faf7f2; }
          .radio-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
          .radio-modal { background: #fff; border-radius: 16px; padding: 2.5rem 2rem; text-align: center; max-width: 360px; width: 90%; }
          .radio-modal-icon { font-size: 3rem; margin-bottom: 1rem; }
          .radio-modal-title { font-size: 1.25rem; font-weight: 700; font-style: italic; color: #e63946; font-family: 'Georgia', serif; margin-bottom: 0.5rem; }
          .radio-modal-sub { font-size: 0.875rem; color: #666; font-family: 'Courier New', monospace; line-height: 1.5; margin-bottom: 1.25rem; }
          .radio-modal-retry { background: #1a1a2e; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-family: 'Courier New', monospace; font-size: 0.875rem; font-weight: 700; cursor: pointer; }
          .radio-modal-retry:hover { opacity: 0.85; }
        `}</style>
      </main>
    )
  }

  return (
    <main className="radio-page">
      <div className="radio-hero">
        <div className="radio-hero-inner">
          <p className="radio-preheader">Portland Radio Project</p>
          <h1 className="radio-title">
            Radio
            <br />
            Submission
          </h1>
          <p className="radio-subtitle">
            Submit your music for consideration in the Portland Radio Project music library and
            possible inclusion on local radio programs.
          </p>
        </div>
      </div>

      <div className="radio-form-wrap">
        <div className="radio-progress">
          {steps.map((s, i) => (
            <div key={i} className={`radio-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <span className="radio-step-num">{i < step ? '✓' : i + 1}</span>
              <span className="radio-step-label">{s.title}</span>
            </div>
          ))}
        </div>

        <div className="radio-card">
          <div className="radio-card-header">
            <span className="radio-card-emoji">{steps[step].emoji}</span>
            <h2 className="radio-card-title">{steps[step].title}</h2>
          </div>

          {/* Step 0: About You */}
          {step === 0 && (
            <div className="radio-fields">
              <div className="radio-row">
                <div className="radio-field">
                  <label>
                    Your Name <span className="req">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="radio-field">
                  <label>
                    Artist / Band Name <span className="req">*</span>
                  </label>
                  <input
                    value={form.artistName}
                    onChange={(e) => setField('artistName', e.target.value)}
                    placeholder="Stage or band name"
                  />
                </div>
              </div>
              <div className="radio-field">
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
              <div className="radio-field">
                <label>
                  Phone Number <span className="req">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                    let f = digits
                    if (digits.length >= 7)
                      f = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
                    else if (digits.length >= 4) f = `(${digits.slice(0, 3)}) ${digits.slice(3)}`
                    else if (digits.length >= 1) f = `(${digits}`
                    setField('phone', f)
                  }}
                  placeholder="(503) 555-1234"
                  maxLength={14}
                />
              </div>
              <div className="radio-field">
                <label>
                  Based/active in the Portland, Oregon area? <span className="req">*</span>
                </label>
                <div className="radio-yesno">
                  {['YES', 'NO'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`radio-yn-btn ${form.portlandBased === v ? 'selected' : ''}`}
                      onClick={() => setField('portlandBased', v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="radio-field">
                <label>
                  Zip Code <span className="req">*</span>
                </label>
                <input
                  value={form.zipCode}
                  onChange={(e) => setField('zipCode', e.target.value)}
                  placeholder="97201"
                  maxLength={10}
                />
              </div>
            </div>
          )}

          {/* Step 1: Your Music */}
          {step === 1 && (
            <div className="radio-fields">
              <div className="radio-field">
                <label>
                  Music Genre <span className="optional">(select up to 2)</span>{' '}
                  <span className="req">*</span>
                </label>
                <div className="vol-size-grid">
                  {MUSIC_GENRES.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`vol-size-btn ${form.genre.includes(g.id) ? 'selected' : ''}`}
                      onClick={() => {
                        const current = form.genre
                        if (current.includes(g.id)) {
                          setField(
                            'genre',
                            current.filter((v) => v !== g.id),
                          )
                        } else if (current.length < 2) {
                          setField('genre', [...current, g.id])
                        }
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="radio-field">
                <label>
                  Radio Appropriate <span className="req">*</span>
                </label>
                <div className="radio-yesno">
                  {[
                    { label: 'Radio Friendly', value: 'radio_friendly' },
                    { label: 'Parental Advisory', value: 'parental_advisory' },
                  ].map((v) => (
                    <button
                      key={v.value}
                      type="button"
                      className={`radio-yn-btn ${form.radioAppropriate === v.value ? 'selected' : ''}`}
                      onClick={() => setField('radioAppropriate', v.value)}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="radio-field">
                <label>
                  Song Title <span className="req">*</span>
                </label>
                <input
                  value={form.songTitle}
                  onChange={(e) => setField('songTitle', e.target.value)}
                  placeholder="Name of the track you're submitting"
                />
              </div>

              <div className="radio-field">
                <label>
                  Upload MP3 <span className="optional">(max 5MB)</span>
                </label>
                <div
                  className={`radio-upload-zone ${mp3File ? 'has-file' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,audio/mpeg"
                    onChange={handleMp3Change}
                    style={{ display: 'none' }}
                  />
                  {mp3File ? (
                    <div className="radio-upload-file">
                      <span>
                        {'🎵'} {mp3File.name}
                      </span>
                      <button
                        type="button"
                        className="radio-upload-remove"
                        onClick={(e) => {
                          e.stopPropagation()
                          setMp3File(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
                        {'✕'}
                      </button>
                    </div>
                  ) : (
                    <div className="radio-upload-prompt">
                      <span className="radio-upload-icon">{'📁'}</span>
                      <span>Click to upload MP3</span>
                      <span className="radio-upload-sub">or drag and drop</span>
                    </div>
                  )}
                </div>
                {mp3Error && <p className="radio-field-error">{mp3Error}</p>}
              </div>

              <div className="radio-divider">
                <span>OR</span>
              </div>

              <div className="radio-field">
                <label>Download Link (Google Drive) / Code (Bandcamp)</label>
                <input
                  value={form.downloadLink}
                  onChange={(e) => setField('downloadLink', e.target.value)}
                  placeholder="https://drive.google.com/... or Bandcamp code"
                />
              </div>

              <div className="radio-field">
                <label>
                  Artist Website / Bandcamp / Instagram <span className="req">*</span>
                </label>
                <input
                  value={form.website}
                  onChange={(e) => setField('website', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Final Details */}
          {step === 2 && (
            <div className="radio-fields">
              <div className="radio-field">
                <label>
                  Comments <span className="optional">(optional)</span>
                </label>
                <textarea
                  value={form.comments}
                  onChange={(e) => setField('comments', e.target.value)}
                  placeholder="Anything else you'd like us to know..."
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="radio-field">
                <div
                  className={`radio-agree-box ${form.agreeLibrary ? 'checked' : ''}`}
                  onClick={() => setField('agreeLibrary', !form.agreeLibrary)}
                >
                  <input
                    type="checkbox"
                    checked={form.agreeLibrary}
                    onChange={() => setField('agreeLibrary', !form.agreeLibrary)}
                  />
                  <span>
                    I understand the songs I'm submitting may be added into the Portland Radio
                    Project (PRP) Music Library for possible inclusion on other radio programs.{' '}
                    <span className="req">*</span>
                  </span>
                </div>
              </div>
              <div className="radio-field">
                <div
                  className={`radio-agree-box ${form.agreeNotCompilation ? 'checked' : ''}`}
                  onClick={() => setField('agreeNotCompilation', !form.agreeNotCompilation)}
                >
                  <input
                    type="checkbox"
                    checked={form.agreeNotCompilation}
                    onChange={() => setField('agreeNotCompilation', !form.agreeNotCompilation)}
                  />
                  <span>
                    I understand this radio submission does NOT count as a submission for the PDX
                    Pop Now! local music compilation or playing at the festival.{' '}
                    <span className="req">*</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && <p className="radio-error">{error}</p>}

          <div className="radio-actions">
            {step > 0 && (
              <button type="button" className="radio-btn radio-btn--back" onClick={back}>
                {'← Back'}
              </button>
            )}
            {step < steps.length - 1 ? (
              <button type="button" className="radio-btn radio-btn--next" onClick={next}>
                {'Next →'}
              </button>
            ) : (
              <button
                type="button"
                className="radio-btn radio-btn--submit"
                onClick={submit}
                disabled={isUploading}
              >
                {'Submit 📻'}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .radio-page { min-height: 100vh; background: #faf7f2; font-family: 'Georgia', serif; }
        .radio-hero {
          background: #1a1a2e;
          background-image: repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 80px);
          padding: 4rem 1.5rem 3rem; text-align: center; position: relative; overflow: hidden;
        }
        .radio-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 20% 60%, rgba(230,57,70,0.2) 0%, transparent 55%),
                      radial-gradient(ellipse at 80% 30%, rgba(255,140,0,0.12) 0%, transparent 55%);
        }
        .radio-hero-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .radio-preheader { font-family: 'Courier New', monospace; font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: #ff8c42; margin-bottom: 1rem; }
        .radio-title { font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 900; color: #fff; line-height: 0.95; letter-spacing: -0.02em; margin-bottom: 1.25rem; font-style: italic; }
        .radio-subtitle { font-size: 1rem; color: rgba(255,255,255,0.7); line-height: 1.6; max-width: 480px; margin: 0 auto; }
        .radio-form-wrap { max-width: 680px; margin: 0 auto; padding: 2rem 1rem 4rem; }
        .radio-progress { display: flex; gap: 4px; margin-bottom: 1.5rem; }
        .radio-step { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border-radius: 8px; opacity: 0.4; transition: opacity 0.2s; }
        .radio-step.active { opacity: 1; }
        .radio-step.done { opacity: 0.7; }
        .radio-step-num { width: 28px; height: 28px; border-radius: 50%; background: #1a1a2e; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-family: 'Courier New', monospace; font-weight: bold; }
        .radio-step.active .radio-step-num { background: #e63946; }
        .radio-step.done .radio-step-num { background: #2d6a4f; }
        .radio-step-label { font-size: 10px; text-align: center; color: #333; font-family: 'Courier New', monospace; line-height: 1.3; }
        .radio-card { background: #fff; border-radius: 16px; padding: 2rem; box-shadow: 0 2px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04); }
        .radio-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 1.75rem; padding-bottom: 1.25rem; border-bottom: 2px solid #f0ebe0; }
        .radio-card-emoji { font-size: 1.75rem; }
        .radio-card-title { font-size: 1.35rem; font-weight: 700; color: #1a1a2e; font-style: italic; }
        .radio-fields { display: flex; flex-direction: column; gap: 1.25rem; }
        .radio-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 500px) { .radio-row { grid-template-columns: 1fr; } }
        .radio-field { display: flex; flex-direction: column; gap: 6px; }
        .radio-field label { font-size: 0.875rem; font-weight: 600; color: #333; font-family: 'Courier New', monospace; }
        .req { color: #e63946; }
        .optional { font-weight: 400; color: #888; font-style: italic; }
        .radio-field input, .radio-field textarea { border: 1.5px solid #ddd; border-radius: 8px; padding: 10px 12px; font-size: 0.95rem; font-family: 'Georgia', serif; color: #222; background: #fafafa; transition: border-color 0.15s, background 0.15s; outline: none; resize: vertical; }
        .radio-field input:focus, .radio-field textarea:focus { border-color: #e63946; background: #fff; }
        .radio-yesno { display: flex; gap: 8px; }
        .radio-yn-btn { flex: 1; padding: 10px; border-radius: 8px; border: 1.5px solid #e8e3d8; background: #fafaf7; font-family: 'Courier New', monospace; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.15s; color: #333; }
        .radio-yn-btn:hover { background: #f5f0e8; border-color: #ccc; }
        .radio-yn-btn.selected { background: #e63946; border-color: #e63946; color: #fff; }
        .radio-upload-zone { border: 2px dashed #ddd; border-radius: 8px; padding: 1.5rem; cursor: pointer; transition: all 0.15s; background: #fafafa; text-align: center; }
        .radio-upload-zone:hover { border-color: #e63946; background: #fff5f5; }
        .radio-upload-zone.has-file { border-color: #2d6a4f; background: #f0fff4; border-style: solid; }
        .radio-upload-prompt { display: flex; flex-direction: column; align-items: center; gap: 4px; color: #666; font-family: 'Courier New', monospace; font-size: 0.85rem; }
        .radio-upload-icon { font-size: 1.5rem; }
        .radio-upload-sub { font-size: 0.75rem; color: #aaa; }
        .radio-upload-file { display: flex; align-items: center; justify-content: space-between; font-family: 'Courier New', monospace; font-size: 0.85rem; color: #2d6a4f; }
        .radio-upload-remove { background: none; border: none; color: #e63946; cursor: pointer; font-size: 1rem; padding: 0 4px; }
        .radio-field-error { font-size: 0.8rem; color: #e63946; font-family: 'Courier New', monospace; margin-top: 2px; }
        .radio-divider { display: flex; align-items: center; gap: 12px; color: #aaa; font-family: 'Courier New', monospace; font-size: 0.75rem; letter-spacing: 0.1em; }
        .radio-divider::before, .radio-divider::after { content: ''; flex: 1; height: 1px; background: #e8e3d8; }
        .radio-agree-box { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 8px; border: 1.5px solid #e8e3d8; background: #fafaf7; cursor: pointer; transition: all 0.15s; font-size: 0.875rem; color: #333; line-height: 1.5; }
        .radio-agree-box:hover { background: #f5f0e8; border-color: #ccc; }
        .radio-agree-box.checked { background: #fff5f5; border-color: #e63946; }
        .radio-agree-box input { margin-top: 2px; accent-color: #e63946; flex-shrink: 0; }
        .radio-error { margin-top: 1rem; padding: 10px 14px; background: #fff0f0; border: 1px solid #ffcdd2; border-radius: 8px; font-size: 0.875rem; color: #c62828; font-family: 'Courier New', monospace; }
        .radio-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid #f0ebe0; }
        .radio-btn { padding: 11px 24px; border-radius: 8px; font-size: 0.9rem; font-weight: 700; font-family: 'Courier New', monospace; cursor: pointer; border: none; transition: opacity 0.15s, transform 0.1s; }
        .radio-btn:active { transform: scale(0.98); }
        .radio-btn--back { background: transparent; color: #666; border: 1.5px solid #ddd; }
        .radio-btn--back:hover { background: #f5f5f5; }
        .radio-btn--next { background: #1a1a2e; color: #fff; margin-left: auto; }
        .radio-btn--next:hover { opacity: 0.85; }
        .radio-btn--submit { background: #e63946; color: #fff; margin-left: auto; }
        .radio-btn--submit:hover { opacity: 0.85; }
        .radio-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .vol-size-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .vol-size-btn { padding: 8px 16px; border-radius: 8px; border: 1.5px solid #e8e3d8; background: #fafaf7; font-family: 'Courier New', monospace; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background 0.15s, border-color 0.15s, color 0.15s; color: #333; }
        .vol-size-btn:hover { background: #f5f0e8; border-color: #ccc; }
        .vol-size-btn.selected { background: #e63946; border-color: #e63946; color: #fff; }
        .radio-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .radio-modal { background: #fff; border-radius: 16px; padding: 2.5rem 2rem; text-align: center; max-width: 360px; width: 90%; }
        .radio-modal-spinner { width: 48px; height: 48px; border: 4px solid #f0ebe0; border-top-color: #e63946; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1.25rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .radio-modal-icon { font-size: 3rem; margin-bottom: 1rem; }
        .radio-modal-title { font-size: 1.25rem; font-weight: 700; font-style: italic; color: #1a1a2e; font-family: 'Georgia', serif; margin-bottom: 0.5rem; }
        .radio-modal-sub { font-size: 0.875rem; color: #666; font-family: 'Courier New', monospace; line-height: 1.5; }
        .radio-modal-retry { background: #1a1a2e; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-family: 'Courier New', monospace; font-size: 0.875rem; font-weight: 700; cursor: pointer; }
        .radio-modal-retry:hover { opacity: 0.85; }
      `}</style>
    </main>
  )
}
