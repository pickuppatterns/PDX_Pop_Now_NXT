'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SlideShow from '@/components/SlideShow'

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

const AFFILIATIONS = [
  { id: 'songwriter', label: 'Songwriter' },
  { id: 'band_member', label: 'Band Member' },
  { id: 'manager', label: "Artist's Manager" },
  { id: 'label_rep', label: 'Label Representative' },
  { id: 'other', label: 'Other' },
]
type IpEntry = { name: string; split: number | string }

type FormData = {
  // Agreements
  agreePortland: boolean
  agreeAllVersions: boolean
  agreeNoWithdrawal: boolean
  agreeNotFestival: boolean
  agreeTerms: boolean
  // Artist & Track
  artistName: string
  songTitle: string
  isPortlandArtist: boolean
  genre: string
  releaseStatus: string
  labelName: string
  radioAppropriate: string
  // IP
  songwritingCreditMusic: IpEntry[]
  songwritingCreditLyrics: IpEntry[]
  publishers: IpEntry[]
  soundRecordingOwners: IpEntry[]
  // Links
  promoLink: string
  bandcamp: string
  instagram: string
  website: string
  // Contact
  firstName: string
  lastName: string
  affiliation: string
  email: string
  phone: string
}

const initialForm: FormData = {
  agreePortland: false,
  agreeAllVersions: false,
  agreeNoWithdrawal: false,
  agreeNotFestival: false,
  agreeTerms: false,
  artistName: '',
  songTitle: '',
  isPortlandArtist: false,
  genre: '',
  releaseStatus: '',
  labelName: '',
  radioAppropriate: '',
  songwritingCreditMusic: [{ name: '', split: 100 }],
  songwritingCreditLyrics: [{ name: '', split: 100 }],
  publishers: [{ name: '', split: 100 }],
  soundRecordingOwners: [{ name: '', split: 100 }],
  promoLink: '',
  bandcamp: '',
  instagram: '',
  website: '',
  firstName: '',
  lastName: '',
  affiliation: '',
  email: '',
  phone: '',
}

const AGREEMENT_TEXT = `This submission Agreement ("the Agreement") is entered into as of the application submission date by and between PDX POP NOW!, an Oregon nonprofit corporation ("PPN") and the proprietor of the recordings as documented in the application, professionally known as recording artist as documented in the application, (collectively, "Artist").

Artist grants PPN the non-exclusive right and ability to use, manufacture, publish, advertise, market, distribute, perform and sell Artist's master sound recording and underlying original song composition that was submitted through pdxpopnow.com (collectively, the "Song"), in conjunction with PPN's sound recording compilation (the "Comp") in both physical and digital formats.

Artist, and/or their label or publishing company, retains all rights to the Song not provided to PPN. PPN's rights to use the master sound recording and song composition shall be limited to the above uses in conjunction with the Comp and shall be perpetual throughout the universe. Artist represents and warrants that the master sound recording and the underlying composition is an original work by Artist, and that no additional permissions of any kind are required to reproduce or distribute the Song, or any part of it, as contemplated in this Agreement, including clearing any sound samples or beats.

PPN cannot accept non-original works, including cover songs or unlicensed sampling of any kind.

Artist grants PPN the right to include the Song, as well as the names of Artist, and any band trademarks or service marks in the Comp packaging and any advertising or promotional materials related to the sale, distribution, or marketing of the Comp.

Upon completing the Song submission process, Artist hereby indemnifies, and agrees to hold PPN and their sales or marketing affiliates, harmless, from any loss, damage and expense (including reasonable attorney's fees) that PPN may suffer by reason of any claim which is inconsistent with any promise, representation or warranty made by Artist in this Agreement.

Artist grants PPN a non-exclusive worldwide and perpetual license to incorporate the Song in the Comp to be distributed on a promotional basis or sold by PPN.

As consideration for the limited rights granted to PPN, Artist may receive promotional consideration. Other than this valuable promotional consideration, there will be no payment or royalties, including mechanical royalties, to Artist with respect to the use of the Song from PPN.`

export default function SubmissionPage() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/compilation-settings')
      .then((r) => r.json())
      .then((d) => setIsOpen(d.isOpen ?? false))
      .catch(() => setIsOpen(false))
  }, [])
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreementOpen, setAgreementOpen] = useState(false)
  const [mp3File, setMp3File] = useState<File | null>(null)
  const [bandPhotoFile, setBandPhotoFile] = useState<File | null>(null)
  const mp3Ref = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function addIpField(
    field:
      | 'songwritingCreditMusic'
      | 'songwritingCreditLyrics'
      | 'publishers'
      | 'soundRecordingOwners',
  ) {
    const current = form[field]
    if (current.length >= 5) return
    if (current[current.length - 1].name.trim() === '') return
    const remaining = 100 - current.reduce((sum, e) => sum + (Number(e.split) || 0), 0)
    setField(field, [...current, { name: '', split: remaining }])
  }

  function updateIpField(
    field:
      | 'songwritingCreditMusic'
      | 'songwritingCreditLyrics'
      | 'publishers'
      | 'soundRecordingOwners',
    index: number,
    key: 'name' | 'split',
    value: string | number,
  ) {
    const updated = [...form[field]]
    updated[index] = { ...updated[index], [key]: value }
    setField(field, updated)
  }
  function removeIpField(
    field:
      | 'songwritingCreditMusic'
      | 'songwritingCreditLyrics'
      | 'publishers'
      | 'soundRecordingOwners',
    index: number,
  ) {
    const updated = form[field].filter((_, i) => i !== index)
    setField(field, updated)
  }

  function validate(): string | null {
    if (step === 0) {
      if (!form.agreePortland) return 'Please confirm you are a Portland-based artist.'
      if (!form.agreeAllVersions) return 'Please confirm you understand distribution terms.'
      if (!form.agreeNoWithdrawal)
        return 'Please confirm you cannot withdraw your track once selected.'
      if (!form.agreeNotFestival)
        return 'Please confirm you understand compilation selection is separate from festival booking.'
      if (!form.agreeTerms) return 'Please accept the terms of the agreement.'
    }
    if (step === 1) {
      if (!form.artistName.trim()) return 'Artist name is required.'
      if (!form.songTitle.trim()) return 'Song title is required.'
      if (!form.isPortlandArtist) return 'Please confirm you are a local Portland artist.'
      if (!form.genre) return 'Please select a genre.'
      if (!form.releaseStatus) return 'Please select a release status.'
      if (!form.radioAppropriate) return 'Please indicate if your song is radio appropriate.'
    }
    if (step === 2) {
      const ipFields = [
        { field: form.songwritingCreditMusic, label: 'Songwriting Credit — Music' },
        { field: form.songwritingCreditLyrics, label: 'Songwriting Credit — Lyrics' },
        { field: form.publishers, label: 'Publishers' },
        { field: form.soundRecordingOwners, label: 'Sound Recording Copyright Owners' },
      ]
      for (const { field, label } of ipFields) {
        const hasEntries = field.some((e) => e.name.trim() !== '')
        if (!hasEntries) continue
        const total = field.reduce((sum, e) => sum + (Number(e.split) || 0), 0)
        const rounded = Math.round(total * 100) / 100
        if (rounded < 99.5 || rounded > 100.5)
          return `${label} splits must total 100%. Currently: ${rounded}%.`
      }
    }
    if (step === 4) {
      if (!form.firstName.trim()) return 'First name is required.'
      if (!form.lastName.trim()) return 'Last name is required.'
      if (!form.affiliation) return 'Please select your affiliation.'
      if (!form.email.trim()) return 'Email is required.'
      const phoneDigits = form.phone.replace(/\D/g, '')
      if (phoneDigits.length !== 10) return 'Please enter a valid 10-digit phone number.'
      if (!mp3File) return 'Please upload your MP3 track.'
      if (!mp3File.name.endsWith('.mp3')) return 'File must be an MP3.'
      if (mp3File.size > 5 * 1024 * 1024) return 'MP3 file must be under 5MB.'
      if (bandPhotoFile && bandPhotoFile.size > 5 * 1024 * 1024)
        return 'Band photo must be under 5MB.'
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
      const formData = new FormData()
      formData.append(
        'data',
        JSON.stringify({
          ...form,
          songwritingCreditMusic: form.songwritingCreditMusic.filter((v) => v.name.trim()),
          songwritingCreditLyrics: form.songwritingCreditLyrics.filter((v) => v.name.trim()),
          publishers: form.publishers.filter((v) => v.name.trim()),
          soundRecordingOwners: form.soundRecordingOwners.filter((v) => v.name.trim()),
          agreementTimestamp: new Date().toISOString(),
          agreementVersion: '2026-v1',
        }),
      )
      if (mp3File) formData.append('mp3', mp3File)
      if (bandPhotoFile) formData.append('bandPhoto', bandPhotoFile)

      const res = await fetch('/api/submission', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Submission failed.')
      router.push('/submission/thank-you')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = [
    { title: 'Agreements', emoji: '📋' },
    { title: 'Artist & Track', emoji: '🎸' },
    { title: 'Intellectual Property', emoji: '©️' },
    { title: 'Links & Social', emoji: '🔗' },
    { title: 'Contact & Upload', emoji: '📤' },
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
          style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}
        >
          <SlideShow
            accentColor="#e63946"
            slides={[
              {
                content: (
                  <div style={{ fontFamily: 'Georgia, serif', color: '#e8e8e8', lineHeight: 1.8 }}>
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
                      Submission
                    </h3>
                    <p>
                      Submissions for the 2026 PDX Pop Now vol.23 Compilation are{' '}
                      <strong>CLOSED</strong> for 2026! Thank you to all the amazing artists,
                      musicians, and talent that applied this year to be on the comp! If you are not
                      familiar, PDX Pop Now! curates some of the best and amazing musical talent in
                      the city. Each year we hold a submission for a yearly Various Artists
                      compilation. To participate you do have to be a local Portland
                      Musician/Artist.
                    </p>
                  </div>
                ),
              },
              {
                content: (
                  <div style={{ fontFamily: 'Georgia, serif', color: '#e8e8e8', lineHeight: 1.8 }}>
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
                      So what&apos;s next?
                    </h3>
                    <p>
                      After receiving all of the submissions, songs are anonymously evaluated by the
                      100+ volunteers on the PDX Pop Now! Listening Committee, as well as the PDX
                      Pop Now! Board of Directors. We will send you an email in mid-March letting
                      you know whether or not your song has been selected. At that time, if
                      you&apos;ve been selected, we&apos;ll be in touch about paperwork,
                      high-quality audio files for mastering, and other info we may need.
                    </p>
                  </div>
                ),
              },
              {
                content: (
                  <div style={{ fontFamily: 'Georgia, serif', color: '#e8e8e8', lineHeight: 1.8 }}>
                    <h4
                      style={{
                        fontFamily: "'Courier New', monospace",
                        color: '#ff8c42',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontSize: '0.8rem',
                        marginBottom: '1rem',
                      }}
                    >
                      Other ways to Get Involved
                    </h4>
                    <p style={{ marginBottom: '0.25rem', color: '#ff8c42', fontSize: '0.9rem' }}>
                      Festival Graphic Artist in Residency
                    </p>
                    <p style={{ marginBottom: '1.5rem' }}>
                      Know someone who wants to design an album cover? Each year PDX Pop Now!
                      selects a local artist to do the visual for the Compilation CD album artwork.
                      To find out more &amp; learn about the submission process:{' '}
                      <a href="https://pdxpopnow.com/graphic-artist/" style={{ color: '#e63946' }}>
                        go here
                      </a>
                      .
                    </p>
                    <p style={{ marginBottom: '0.25rem', color: '#ff8c42', fontSize: '0.9rem' }}>
                      The Selection Process &amp; Listening Committee
                    </p>
                    <p>
                      Following the submission process, tracks are reviewed anonymously and voted on
                      by our all-volunteer Listening Committee. If you would like to be on the
                      Listening Committee:{' '}
                      <a
                        href="https://pdxpopnow.com/listening-committee"
                        style={{ color: '#e63946' }}
                      >
                        go here
                      </a>
                      .
                    </p>
                  </div>
                ),
              },
              {
                content: (
                  <div style={{ fontFamily: 'Georgia, serif', color: '#e8e8e8', lineHeight: 1.8 }}>
                    <p style={{ marginBottom: '0.25rem', color: '#ff8c42', fontSize: '0.9rem' }}>
                      Portland Radio Project | PDX Pop Now! Radio Show
                    </p>
                    <p style={{ marginBottom: '1.5rem' }}>
                      You can always submit your music year round to our radio show on{' '}
                      <a href="https://prp.fm/show/pdx-pop-now-radio/" style={{ color: '#e63946' }}>
                        PRP.fm
                      </a>
                      . All you need to do is upload your music:{' '}
                      <a href="https://pdxpopnow.com/radio-show/" style={{ color: '#e63946' }}>
                        go here
                      </a>
                      .
                    </p>
                    <p style={{ marginBottom: '0.25rem', color: '#ff8c42', fontSize: '0.9rem' }}>
                      Sign Up for the Volunteer Mailing List
                    </p>
                    <p>
                      Each year in addition to the festival &amp; compilation CD we put on yearly
                      programming throughout the community. Get involved:{' '}
                      <a href="https://pdxpopnow.com/volunteer/" style={{ color: '#e63946' }}>
                        go here
                      </a>
                      .
                    </p>
                  </div>
                ),
              },
              {
                content: (
                  <div
                    style={{
                      fontFamily: 'Georgia, serif',
                      color: '#e8e8e8',
                      lineHeight: 1.8,
                      textAlign: 'center',
                      padding: '2rem 0',
                    }}
                  >
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Any questions?</p>
                    <a
                      href="mailto:compilation@pdxpopnow.com"
                      style={{
                        color: '#e63946',
                        fontFamily: "'Courier New', monospace",
                        fontSize: '0.9rem',
                      }}
                    >
                      compilation@pdxpopnow.com
                    </a>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </main>
    )
  }
  return (
    <main className="vol-page">
      <div className="vol-container">
        <div className="vol-header">
          <p className="vol-eyebrow">PDX Pop Now!</p>
          <h1 className="vol-title">Compilation Submission</h1>
          <p className="vol-subtitle">
            Submission Deadline: <strong>January 19th, 2026</strong>
          </p>
          <p className="vol-subtitle" style={{ fontSize: '0.85rem' }}>
            Questions? Contact <strong>Compilations</strong>:{' '}
            <a href="mailto:compilations@pdxpopnow.com" style={{ color: '#e63946' }}>
              compilations@pdxpopnow.com
            </a>
          </p>
        </div>

        {/* Step indicators */}
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

          {/* Step 0 — Agreements */}
          {step === 0 && (
            <div className="vol-fields">
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#101010',
                  lineHeight: 1.6,
                  marginBottom: '1rem',
                }}
              >
                Please read and confirm each of the following before submitting.
              </p>

              {[
                { key: 'agreePortland', text: 'I confirm that I am a Portland-based artist.' },
                {
                  key: 'agreeAllVersions',
                  text: 'I understand that if selected, my song will be included on all versions of the Compilation.',
                },
                {
                  key: 'agreeNoWithdrawal',
                  text: 'I understand that if selected, I cannot ask to remove or alter my track at a later date.',
                },
                {
                  key: 'agreeNotFestival',
                  text: 'I have read these submission instructions and understand that compilation selection is separate from festival booking.',
                },
              ].map(({ key, text }) => (
                <label
                  key={key}
                  className={`vol-radio-label ${form[key as keyof FormData] ? 'checked' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={form[key as keyof FormData] as boolean}
                    onChange={(e) => setField(key as keyof FormData, e.target.checked as never)}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{text}</span>
                </label>
              ))}

              {/* Legal Agreement Accordion */}
              <div style={{ border: '1.5px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setAgreementOpen(!agreementOpen)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    background: '#f9f9f9',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#1a1a2e',
                  }}
                >
                  PDX Pop Now! Compilation Submission Agreement
                  <span>{agreementOpen ? '▲' : '▼'}</span>
                </button>
                {agreementOpen && (
                  <div
                    style={{
                      padding: '1rem',
                      background: '#fff',
                      fontSize: '0.8rem',
                      color: '#444',
                      lineHeight: 1.7,
                      maxHeight: 300,
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    {AGREEMENT_TEXT}
                  </div>
                )}
              </div>

              <label
                className={`vol-radio-label ${form.agreeTerms ? 'checked' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={(e) => setField('agreeTerms', e.target.checked)}
                />
                <span style={{ fontSize: '0.9rem' }}>I accept the terms of the Agreement.</span>
              </label>
            </div>
          )}

          {/* Step 1 — Artist & Track */}
          {step === 1 && (
            <div className="vol-fields">
              <div className="vol-field">
                <label>
                  Artist Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  value={form.artistName}
                  onChange={(e) => setField('artistName', e.target.value)}
                  placeholder="Your artist or band name"
                />
              </div>

              <div className="vol-field">
                <label>
                  Song Title <span className="req">*</span>
                </label>
                <input
                  type="text"
                  value={form.songTitle}
                  onChange={(e) => setField('songTitle', e.target.value)}
                  placeholder="Title of your track"
                />
              </div>

              <div className="vol-field">
                <label
                  className={`vol-radio-label ${form.isPortlandArtist ? 'checked' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={form.isPortlandArtist}
                    onChange={(e) => setField('isPortlandArtist', e.target.checked)}
                  />
                  <span>
                    Yes, I am a local artist currently performing / making music in the Portland
                    Metro area.
                  </span>
                </label>
              </div>

              <div className="vol-field">
                <label>
                  Primary Genre <span className="req">*</span>
                </label>
                <div className="vol-size-grid">
                  {GENRES.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`vol-size-btn ${form.genre === g.id ? 'selected' : ''}`}
                      onClick={() => setField('genre', g.id)}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="vol-field">
                <label>
                  Has this track been released? <span className="req">*</span>
                </label>
                <div className="vol-radios">
                  {[
                    { value: 'unreleased', label: 'Unreleased Track' },
                    { value: 'self_released', label: 'Self-Released Track' },
                    { value: 'on_label', label: 'Released on Label' },
                    { value: 'soundcloud', label: 'Already hosted on Soundcloud' },
                  ].map((o) => (
                    <label
                      key={o.value}
                      className={`vol-radio-label ${form.releaseStatus === o.value ? 'checked' : ''}`}
                    >
                      <input
                        type="radio"
                        name="releaseStatus"
                        value={o.value}
                        checked={form.releaseStatus === o.value}
                        onChange={() => setField('releaseStatus', o.value)}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {form.releaseStatus === 'on_label' && (
                <div className="vol-field">
                  <label>Label Name</label>
                  <input
                    type="text"
                    value={form.labelName}
                    onChange={(e) => setField('labelName', e.target.value)}
                    placeholder="Label name"
                  />
                </div>
              )}

              <div className="vol-field">
                <label>
                  Is your song Radio Appropriate? <span className="req">*</span>
                </label>
                <div className="vol-radios">
                  {[
                    {
                      value: 'radio_friendly',
                      label: 'Radio Friendly — Contains no explicit language',
                    },
                    {
                      value: 'parental_advisory',
                      label: 'Parental Advisory — Contains explicit language',
                    },
                  ].map((o) => (
                    <label
                      key={o.value}
                      className={`vol-radio-label ${form.radioAppropriate === o.value ? 'checked' : ''}`}
                    >
                      <input
                        type="radio"
                        name="radioAppropriate"
                        value={o.value}
                        checked={form.radioAppropriate === o.value}
                        onChange={() => setField('radioAppropriate', o.value)}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Intellectual Property */}
          {step === 2 && (
            <div className="vol-fields">
              <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6 }}>
                Please use full legal names. For multiple contributors include percentage splits —
                e.g. <em>Robert Zimmerman: 75%, Bob Dylan: 25%</em>
              </p>
              <p
                style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.5, marginTop: '0.4rem' }}
              >
                If a percentage has a decimal, round up to the nearest whole number.
              </p>

              {(
                [
                  {
                    key: 'songwritingCreditMusic',
                    label: 'Songwriting Credit — Music',
                    placeholder: 'Full legal name',
                  },
                  {
                    key: 'songwritingCreditLyrics',
                    label: 'Songwriting Credit — Lyrics (write INSTRUMENTAL if no lyrics)',
                    placeholder: 'Full legal name or INSTRUMENTAL',
                  },
                  { key: 'publishers', label: 'Publisher(s)', placeholder: 'Full legal name' },
                  {
                    key: 'soundRecordingOwners',
                    label: 'Sound Recording Copyright Owner(s)',
                    placeholder: 'Who owns the master recording?',
                  },
                ] as const
              ).map(({ key, label, placeholder }) => {
                const total = form[key].reduce((sum, e) => sum + (Number(e.split) || 0), 0)
                return (
                  <div key={key} className="vol-field">
                    <label>{label}</label>
                    {form[key].map((entry, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 80px 32px',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          type="text"
                          value={entry.name}
                          onChange={(e) => updateIpField(key, i, 'name', e.target.value)}
                          placeholder={i === 0 ? placeholder : 'Additional contributor'}
                        />
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={entry.split === 0 ? '' : entry.split}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9.]/g, '')
                              updateIpField(
                                key,
                                i,
                                'split',
                                val === '' ? 0 : Math.min(100, Number(val)),
                              )
                            }}
                            onFocus={(e) => e.target.select()}
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                            style={{
                              width: '100%',
                              paddingRight: '1.5rem',
                              border: '1.5px solid #ddd',
                              borderRadius: 8,
                              padding: '10px 8px',
                              fontSize: '0.95rem',
                              fontFamily: 'Georgia, serif',
                              color: '#1a1a2e',
                              outline: 'none',
                              boxSizing: 'border-box' as const,
                              background: '#fff',
                            }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              fontSize: '0.8rem',
                              color: '#888',
                              pointerEvents: 'none',
                            }}
                          >
                            %
                          </span>
                        </div>
                        {form[key].length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeIpField(key, i)}
                            style={{
                              background: 'none',
                              border: '1.5px solid #ffcccc',
                              borderRadius: 8,
                              color: '#e63946',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              width: 32,
                              height: 40,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            −
                          </button>
                        ) : (
                          <div style={{ width: 32 }} />
                        )}
                      </div>
                    ))}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.25rem',
                      }}
                    >
                      {form[key].length < 5 && (
                        <button
                          type="button"
                          onClick={() => addIpField(key)}
                          style={{
                            background: 'none',
                            border: '1.5px dashed #ccc',
                            borderRadius: 8,
                            padding: '6px 14px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            color: '#888',
                            fontFamily: "'Courier New', monospace",
                          }}
                        >
                          + Add another
                        </button>
                      )}
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontFamily: "'Courier New', monospace",
                          color: total === 100 ? '#2d6a4f' : total > 0 ? '#e63946' : '#888',
                          marginLeft: 'auto',
                        }}
                      >
                        {total > 0 ? `Total: ${Math.round(total * 100) / 100}%` : ''}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Step 3 — Links & Social */}
          {step === 3 && (
            <div className="vol-fields">
              <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6 }}>
                Optional — helps us promote your band if your song is selected. This will not affect
                the voting process.
              </p>
              {[
                {
                  key: 'promoLink',
                  label: 'Preferred Site / Link for Promotion',
                  placeholder: 'https://',
                },
                {
                  key: 'bandcamp',
                  label: 'Bandcamp',
                  placeholder: 'https://yourband.bandcamp.com',
                },
                { key: 'instagram', label: 'Instagram', placeholder: '@yourband' },
                { key: 'website', label: 'Website', placeholder: 'https://yourband.com' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="vol-field">
                  <label>{label}</label>
                  <input
                    type="text"
                    value={form[key as keyof FormData] as string}
                    onChange={(e) => setField(key as keyof FormData, e.target.value as never)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 4 — Contact & Upload */}
          {step === 4 && (
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
                  Affiliation <span className="req">*</span>
                </label>
                <div className="vol-radios">
                  {AFFILIATIONS.map((a) => (
                    <label
                      key={a.id}
                      className={`vol-radio-label ${form.affiliation === a.id ? 'checked' : ''}`}
                    >
                      <input
                        type="radio"
                        name="affiliation"
                        value={a.id}
                        checked={form.affiliation === a.id}
                        onChange={() => setField('affiliation', a.id)}
                      />
                      <span>{a.label}</span>
                    </label>
                  ))}
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
                    if (digits.length >= 7)
                      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
                    else if (digits.length >= 4)
                      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`
                    else if (digits.length >= 1) formatted = `(${digits}`
                    setField('phone', formatted)
                  }}
                  placeholder="(503) 555-1234"
                />
              </div>

              {/* MP3 Upload */}
              <div className="vol-field">
                <label>
                  Upload Your Track (MP3, max 5MB) <span className="req">*</span>
                </label>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#666',
                    marginBottom: '0.5rem',
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  File will be saved as:{' '}
                  <strong>
                    {new Date().getFullYear()}_{form.artistName || 'ArtistName'}_
                    {form.songTitle || 'SongTitle'}.mp3
                  </strong>
                </p>
                <input
                  ref={mp3Ref}
                  type="file"
                  accept=".mp3,audio/mpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    if (file && !file.name.endsWith('.mp3')) {
                      setError('File must be an MP3.')
                      e.target.value = ''
                      return
                    }
                    if (file && file.size > 5 * 1024 * 1024) {
                      setError('MP3 file must be under 5MB.')
                      e.target.value = ''
                      return
                    }
                    setError('')
                    setMp3File(file)
                  }}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => mp3Ref.current?.click()}
                  className="vol-size-btn"
                  style={{ padding: '10px 20px' }}
                >
                  {mp3File ? `✓ ${mp3File.name}` : 'Choose MP3 File'}
                </button>
              </div>

              {/* Band Photo Upload */}
              <div className="vol-field">
                <label>Band Photo (optional, max 5MB)</label>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#666',
                    marginBottom: '0.5rem',
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  Stored in the {new Date().getFullYear()} BAND PHOTOS folder.
                </p>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    if (file && file.size > 5 * 1024 * 1024) {
                      setError('Band photo must be under 5MB.')
                      e.target.value = ''
                      return
                    }
                    setError('')
                    setBandPhotoFile(file)
                  }}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  className="vol-size-btn"
                  style={{ padding: '10px 20px' }}
                >
                  {bandPhotoFile ? `✓ ${bandPhotoFile.name}` : 'Choose Band Photo'}
                </button>
              </div>

              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#e63946',
                  fontFamily: "'Courier New', monospace",
                  lineHeight: 1.6,
                }}
              >
                IMPORTANT: After you click submit, your song will upload. Please do not exit this
                page until your upload has finished.
              </p>
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
              {loading ? 'Submitting… Please wait' : 'Submit Application →'}
            </button>
          )}
        </div>
        {loading && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '2rem 2.5rem',
                textAlign: 'center',
                maxWidth: 340,
                width: '90%',
              }}
            >
              <p
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  color: '#1a1a2e',
                }}
              >
                Uploading your submission…
              </p>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#888',
                  marginBottom: '1.5rem',
                  fontFamily: 'Courier New, monospace',
                }}
              >
                Please do not close this window.
              </p>
              <div
                style={{
                  height: 6,
                  background: '#eee',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: '100%',
                    background: '#ec2680',
                    borderRadius: 99,
                    animation: 'pulse-bar 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-bar {
        0% { opacity: 1; transform: scaleX(0.3); transform-origin: left; }
        50% { opacity: 1; transform: scaleX(1); transform-origin: left; }
        100% { opacity: 1; transform: scaleX(0.3); transform-origin: left; }
        }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        .vol-page { min-height: 100vh; background: #f5f0e8; padding: 2rem 1rem 4rem; font-family: Georgia, serif; }
        .vol-container { max-width: 640px; margin: 0 auto; }
        .vol-header { text-align: center; margin-bottom: 2rem; }
        .vol-eyebrow { color: #e63946; font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 0.5rem; font-family: 'Courier New', monospace; }
        .vol-title { font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 900; font-style: italic; color: #1a1a2e; line-height: 1; margin: 0 0 1rem; }
        .vol-subtitle { color: #444; line-height: 1.7; margin: 0 0 0.5rem; }
        .vol-steps { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
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
        .vol-field input[type="text"], .vol-field input[type="email"], .vol-field input[type="tel"] { width: 100%; border: 1.5px solid #ddd; border-radius: 8px; padding: 10px 12px; font-size: 0.95rem; font-family: Georgia, serif; color: #1a1a2e; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .vol-field input:focus { border-color: #1a1a2e; }
        .req { color: #e63946; }
        .vol-size-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .vol-size-btn { padding: 6px 14px; border-radius: 20px; border: 1.5px solid #ddd; background: #fff; color: #444; font-size: 0.85rem; font-family: 'Courier New', monospace; cursor: pointer; transition: all 0.15s; }
        .vol-size-btn.selected { border-color: #e63946; background: #fff5f5; color: #e63946; font-weight: 700; }
        .vol-radios { display: flex; flex-direction: column; gap: 0.5rem; }
        .vol-radio-label { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 1rem; border-radius: 8px; border: 1.5px solid #ddd; cursor: pointer; font-size: 0.9rem; transition: all 0.15s; color: #1a1a2e; }
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
