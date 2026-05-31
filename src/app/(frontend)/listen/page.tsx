'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js'
import type { Region } from 'wavesurfer.js/dist/plugins/regions.js'

type Song = {
  id: number
  anonToken: string
  groupName: string
  position: number
  total: number
  existingVote?: 'like' | 'dislike' | null
}

type VoteState = 'idle' | 'playing' | 'preview_done' | 'voted'

// Particles generated outside component but called lazily client-side only
function makeParticles() {
  return Array.from({ length: 12 }, () => {
    const angle = Math.random() * 360
    const distance = 60 + Math.random() * 100
    const x = Math.cos((angle * Math.PI) / 180) * distance
    const y = Math.sin((angle * Math.PI) / 180) * distance
    const delay = Math.random() * 0.2
    const scale = 0.8 + Math.random() * 0.8
    return { x, y, delay, scale }
  })
}

type Particle = ReturnType<typeof makeParticles>[number]

function EmojiBurst({ type, particles }: { type: 'like' | 'dislike'; particles: Particle[] }) {
  const emoji = type === 'like' ? '🤍' : '😢'
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999 }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `calc(50% + ${p.y}px)`,
            left: `calc(50% + ${p.x}px)`,
            fontSize: `${p.scale * 1.8}rem`,
            opacity: 0,
            animation: `fadeout 0.7s ease-out ${p.delay}s forwards`,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  )
}

export default function ListenPage() {
  const router = useRouter()
  const hiddenWaveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const regionStartRef = useRef<number>(0)
  const regionEndRef = useRef<number>(30)
  const totalDurRef = useRef<number>(0)
  const regionRef = useRef<Region | null>(null)
  const phoneRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const previewDoneRef = useRef(false)
  const waveformCacheRef = useRef<Record<string, string>>({})
  const particlesRef = useRef<Particle[] | null>(null)
  if (particlesRef.current === null) particlesRef.current = makeParticles()

  const [songs, setSongs] = useState<Song[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [voteState, setVoteState] = useState<VoteState>('idle')
  const [loading, setLoading] = useState(true)
  const [audioLoading, setAudioLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [votes, setVotes] = useState<Record<number, 'like' | 'dislike'>>({})
  const [waveformPng, setWaveformPng] = useState<string | null>(null)
  const [bgPosition, setBgPosition] = useState('50% 50%')
  const [burst, setBurst] = useState<{ type: 'like' | 'dislike' } | null>(null)
  const [debugLog, setDebugLog] = useState<string[]>([])

  function dlog(msg: string) {
    setDebugLog((prev) => [...prev.slice(-4), msg])
  }

  const currentSong = songs[currentIndex]
  const votedCount = Object.keys(votes).length

  useEffect(() => {
    fetch('/api/listen/queue', { credentials: 'include' })
      .then((r) => {
        if (r.status === 401) {
          router.push('/listening-committee')
          return null
        }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        if (data.error) {
          setError(data.error)
          setLoading(false)
          return
        }
        setSongs(data.songs)
        const existingVotes: Record<number, 'like' | 'dislike'> = {}
        data.songs.forEach((s: Song) => {
          if (s.existingVote) existingVotes[s.id] = s.existingVote
        })
        setVotes(existingVotes)
        const firstUnvoted = data.songs.findIndex((s: Song) => !s.existingVote)
        setCurrentIndex(firstUnvoted >= 0 ? firstUnvoted : 0)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load your playlist.')
        setLoading(false)
      })
  }, [router])

  function killAudio() {
    if (!wavesurferRef.current) return
    try {
      wavesurferRef.current.pause()
      wavesurferRef.current.destroy()
      wavesurferRef.current = null
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') console.warn('[killAudio]', err)
      wavesurferRef.current = null
    }
  }

  const initWaveSurfer = useCallback(async (anonToken: string, autoplay = false) => {
    if (!hiddenWaveformRef.current) return
    if (wavesurferRef.current) {
      try {
        wavesurferRef.current.pause()
        wavesurferRef.current.destroy()
        wavesurferRef.current = null
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') console.warn('[killAudio]', err)
        wavesurferRef.current = null
      }
    }

    const storageKey = `waveform_png_${anonToken}`
    const storedPng = sessionStorage.getItem(storageKey)
    if (storedPng) waveformCacheRef.current[anonToken] = storedPng
    if (waveformCacheRef.current[anonToken]) setWaveformPng(waveformCacheRef.current[anonToken])

    setAudioLoading(true)
    setVoteState('idle')
    setCurrentTime(0)
    previewDoneRef.current = false
    regionRef.current = null
    setBgPosition(`${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}%`)

    const res = await fetch(`/api/listen/stream?token=${anonToken}`, { credentials: 'include' })
    const { url } = await res.json()
    if (!url) {
      setAudioLoading(false)
      return
    }

    const regions = RegionsPlugin.create()
    const ws = WaveSurfer.create({
      container: hiddenWaveformRef.current,
      waveColor: 'rgba(255,255,255,0.3)',
      progressColor: 'rgba(255,255,255,0.3)',
      cursorColor: 'transparent',
      cursorWidth: 0,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 144,
      normalize: true,
      interact: false,
      plugins: [regions],
    })

    ws.on('ready', async () => {
      const dur = ws.getDuration()
      totalDurRef.current = dur
      const maxStart = Math.max(0, dur - 30)
      const start = Math.random() * maxStart
      const end = Math.min(start + 30, dur)
      regionStartRef.current = start
      regionEndRef.current = end

      dlog(`dur:${dur.toFixed(1)} s:${start.toFixed(1)} e:${end.toFixed(1)}`)

      if (!waveformCacheRef.current[anonToken]) {
        const png = await ws.exportImage('image/png', 1, 'dataURL')
        const pngData = typeof png === 'string' ? png : png[0]
        waveformCacheRef.current[anonToken] = pngData
        sessionStorage.setItem(storageKey, pngData)
        setWaveformPng(pngData)
      }

      regions.addRegion({ start, end, drag: false, resize: false })
      // Set time before marking ready
      ws.getMediaElement().currentTime = start
      dlog(`ct:${ws.getMediaElement().currentTime.toFixed(1)} target:${start.toFixed(1)}`)
      setAudioLoading(false)

      if (autoplay) {
        try {
          await ws.play()
          ws.getMediaElement().currentTime = start
          dlog(`played ct:${ws.getMediaElement().currentTime.toFixed(1)}`)
          setVoteState('playing')
        } catch {
          setVoteState('idle')
        }
      }
    })

    ws.on('timeupdate', (time) => {
      const elapsed = time - regionStartRef.current
      setCurrentTime(Math.max(0, Math.min(elapsed, 30)))
      if (elapsed >= 30 && !previewDoneRef.current) {
        previewDoneRef.current = true
        ws.pause()
        setVoteState('preview_done')
      }
    })

    ws.on('finish', () => {
      if (!previewDoneRef.current) {
        previewDoneRef.current = true
        setVoteState('preview_done')
      }
    })

    ws.on('play', () => setVoteState('playing'))
    ws.on('pause', () => {
      if (!previewDoneRef.current) setVoteState('idle')
    })

    wavesurferRef.current = ws
    ws.load(url)
  }, [])

  useEffect(() => {
    if (!currentSong) return
    initWaveSurfer(currentSong.anonToken, currentIndex > 0)
    return () => killAudio()
  }, [currentIndex, currentSong?.id])

  async function castVote(vote: 'like' | 'dislike') {
    if (!currentSong) return
    killAudio()
    setVoteState('voted')
    setBurst({ type: vote })
    setTimeout(() => setBurst(null), 900)
    const res = await fetch('/api/listen/vote', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId: currentSong.id, vote }),
    })
    const data = await res.json()
    dlog(`vote:${res.status} ${JSON.stringify(data).slice(0, 30)}`)
    setVotes((prev) => ({ ...prev, [currentSong.id]: vote }))
    setTimeout(() => {
      if (currentIndex < songs.length - 1) setCurrentIndex((i) => i + 1)
    }, 600)
  }

  function togglePlay() {
    if (!wavesurferRef.current) return
    if (wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.pause()
    } else {
      const media = wavesurferRef.current.getMediaElement()
      const target = regionStartRef.current
      media.currentTime = target
      const playPromise = wavesurferRef.current.play()
      if (playPromise !== undefined) {
        playPromise.then(() => {
          media.currentTime = target
          dlog(`played ct:${media.currentTime.toFixed(1)}`)
        })
      }
    }
  }

  function seek(seconds: number) {
    if (!wavesurferRef.current) return
    const current = wavesurferRef.current.getCurrentTime()
    const next = Math.max(regionStartRef.current, Math.min(current + seconds, regionEndRef.current))
    dlog(
      `seek ${seconds > 0 ? '+' : ''}${seconds} cur:${current.toFixed(1)} next:${next.toFixed(1)}`,
    )
    wavesurferRef.current.setTime(next)
  }

  function handleRegionClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!wavesurferRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickPct = (e.clientX - rect.left) / rect.width
    const target = regionStartRef.current + clickPct * 30
    const clamped = Math.min(target, regionEndRef.current)
    if (!wavesurferRef.current.isPlaying()) {
      wavesurferRef.current
        .play()
        .then(() => {
          wavesurferRef.current?.setTime(clamped)
        })
        .catch(() => {})
    } else {
      wavesurferRef.current.setTime(clamped)
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('[data-interactive]')) return
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(diff) > 80 && (voteState === 'preview_done' || voteState === 'playing')) {
      castVote(diff > 0 ? 'like' : 'dislike')
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (voteState !== 'preview_done' && voteState !== 'playing') return
      if (e.key === 'ArrowRight') castVote('like')
      if (e.key === 'ArrowLeft') castVote('dislike')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [voteState, currentSong])

  const canVote = voteState === 'preview_done' || voteState === 'playing'
  const dur = totalDurRef.current
  const regionLeftPct = dur > 0 ? (regionStartRef.current / dur) * 100 : 0
  const regionWidthPct =
    dur > 0 ? ((regionEndRef.current - regionStartRef.current) / dur) * 100 : 100
  const progressPct = (currentTime / 30) * regionWidthPct

  const phoneShell: React.CSSProperties = {
    width: '100%',
    maxWidth: 390,
    minHeight: 780,
    borderRadius: 44,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 32px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.08)',
    background: '#050508',
    backgroundImage: `url(/api/media/file/BLUECRANES.jpg)`,
    backgroundSize: '300%',
    backgroundPosition: bgPosition,
    transition: 'background-position 1.5s ease',
  }

  const phoneInner: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(160deg, rgba(5,5,12,0.92) 0%, rgba(5,5,12,0.85) 100%)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 0 1rem 0',
  }

  if (loading)
    return (
      <div style={s.outer}>
        <div style={phoneShell}>
          <div style={{ ...phoneInner, alignItems: 'center', justifyContent: 'center' }}>
            <div style={s.spinner} />
            <p style={{ ...s.sub, marginTop: '1rem' }}>Loading your playlist…</p>
          </div>
        </div>
        <style>{css}</style>
      </div>
    )
  if (error)
    return (
      <div style={s.outer}>
        <div style={phoneShell}>
          <div style={{ ...phoneInner, alignItems: 'center', justifyContent: 'center' }}>
            <p
              style={{
                color: '#e63946',
                fontFamily: 'Georgia, serif',
                fontSize: '1.1rem',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '0 2rem',
              }}
            >
              {error}
            </p>
          </div>
        </div>
        <style>{css}</style>
      </div>
    )
  if (songs.length === 0)
    return (
      <div style={s.outer}>
        <div style={phoneShell}>
          <div style={{ ...phoneInner, alignItems: 'center', justifyContent: 'center' }}>
            <p style={s.sub}>No songs assigned yet.</p>
          </div>
        </div>
        <style>{css}</style>
      </div>
    )

  const allVoted = songs.every((sv) => votes[sv.id])
  if (allVoted)
    return (
      <div style={s.outer}>
        <div style={phoneShell}>
          <div style={{ ...phoneInner, alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>🎵</div>
            <h1
              style={{
                color: '#fff',
                fontFamily: 'Georgia, serif',
                fontSize: '1.6rem',
                fontStyle: 'italic',
                marginBottom: '0.5rem',
                textAlign: 'center',
              }}
            >
              You&apos;re done!
            </h1>
            <p style={{ ...s.sub, textAlign: 'center', padding: '0 2rem' }}>
              You voted on all {songs.length} songs.
            </p>
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '2rem' }}>
              <div style={s.statBox}>
                <span style={{ color: '#4caf50', fontSize: '2rem' }}>👍</span>
                <span
                  style={{
                    color: '#fff',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {Object.values(votes).filter((v) => v === 'like').length}
                </span>
                <span style={s.sub}>liked</span>
              </div>
              <div style={s.statBox}>
                <span style={{ color: '#e63946', fontSize: '2rem' }}>👎</span>
                <span
                  style={{
                    color: '#fff',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {Object.values(votes).filter((v) => v === 'dislike').length}
                </span>
                <span style={s.sub}>passed</span>
              </div>
            </div>
          </div>
        </div>
        <style>{css}</style>
      </div>
    )

  return (
    <div style={s.outer}>
      {burst && particlesRef.current && (
        <EmojiBurst type={burst.type} particles={particlesRef.current} />
      )}
      <div
        ref={hiddenWaveformRef}
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 390,
          height: 144,
          pointerEvents: 'none',
          visibility: 'hidden',
        }}
      />

      <div style={phoneShell} ref={phoneRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div style={phoneInner}>
          {/* Debug overlay */}
          {debugLog.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 60,
                left: 0,
                right: 0,
                zIndex: 999,
                padding: '0 1rem',
              }}
            >
              {debugLog.map((line, i) => (
                <p
                  key={i}
                  style={{
                    color: '#0f0',
                    fontFamily: 'monospace',
                    fontSize: '0.6rem',
                    margin: 0,
                    background: 'rgba(0,0,0,0.8)',
                    padding: '2px 4px',
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          )}

          {/* Status bar */}
          <div
            style={{
              flexShrink: 0,
              height: 52,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: 8,
            }}
          >
            <div
              style={{
                width: 120,
                height: 4,
                borderRadius: 99,
                background: 'rgba(255,255,255,0.8)',
              }}
            />
          </div>

          {/* Group header */}
          <div style={{ flexShrink: 0, padding: '0.5rem 1.5rem 0.75rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.4rem',
              }}
            >
              <p
                style={{
                  color: '#ff8c42',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.85rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  margin: 0,
                  userSelect: 'none',
                }}
              >
                {currentSong?.groupName}
              </p>
              <p
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.85rem',
                  margin: 0,
                  userSelect: 'none',
                }}
              >
                {votedCount} / {songs.length}
              </p>
            </div>
            <div
              style={{
                height: 1,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 99,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(votedCount / songs.length) * 100}%`,
                  background: '#e63946',
                  borderRadius: 99,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Song number */}
          <div
            style={{
              flex: 1,
              padding: '1rem 1.5rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            <p
              style={{
                color: 'rgba(255,255,255,0.66)',
                fontFamily: 'Georgia, serif',
                fontSize: '5rem',
                fontStyle: 'italic',
                fontWeight: 700,
                margin: '0 0 -1rem',
                lineHeight: 1,
              }}
            >
              {String(currentIndex + 1).padStart(2, '0')}
            </p>
            <p
              style={{
                color: 'rgba(255,255,255,0.99)',
                fontFamily: "'Courier New', monospace",
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                margin: 0,
              }}
            >
              {currentSong?.anonToken.slice(0, 8)}
            </p>
            {canVote && (
              <p
                style={{
                  color: 'rgba(255,255,255,0.15)',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  margin: '0.5rem 0 0',
                  textAlign: 'center',
                }}
              >
                ← swipe to vote →
              </p>
            )}
          </div>

          {/* Controls */}
          <div style={{ flexShrink: 0, padding: '0 1.5rem' }}>
            {/* Waveform */}
            <div
              data-interactive="true"
              style={{
                position: 'relative',
                marginBottom: 4,
                borderRadius: 6,
                overflow: 'hidden',
                height: 144,
                background: 'rgba(0,0,0,0.2)',
              }}
            >
              {audioLoading && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}
                >
                  <div style={s.spinner} />
                </div>
              )}
              {waveformPng && (
                <img
                  src={waveformPng}
                  alt="waveform"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill',
                    opacity: 0.66,
                    filter: 'grayscale(100%)',
                  }}
                />
              )}
              {waveformPng && (
                <div
                  onClick={handleRegionClick}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: `${regionLeftPct}%`,
                    width: `${regionWidthPct}%`,
                    height: '100%',
                    background: 'rgba(230,57,70,0.08)',
                    borderLeft: '1px solid rgba(230,57,70,0.8)',
                    borderRight: '1px solid rgba(230,57,70,0.8)',
                    cursor: 'pointer',
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: `${progressPct}%`,
                      height: '100%',
                      background: 'rgba(230,57,70,0.2)',
                      transition: 'width 0.1s linear',
                    }}
                  />
                  <img
                    src={waveformPng}
                    alt=""
                    style={{
                      position: 'absolute',
                      top: 0,
                      height: '100%',
                      objectFit: 'fill',
                      width: `${100 / (regionWidthPct / 100)}%`,
                      left: `${-(regionLeftPct / regionWidthPct) * 100}%`,
                      opacity: 0,
                      filter: 'brightness(2) saturate(0)',
                      mixBlendMode: 'screen',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              )}
              {waveformPng && voteState !== 'idle' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: `${regionLeftPct + progressPct}%`,
                    width: 1,
                    height: '100%',
                    background: 'rgba(255,255,255,0.8)',
                    zIndex: 3,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>

            {/* Time row */}
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}
            >
              <span
                style={{
                  color: 'rgba(255,255,255,0.66)',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.65rem',
                }}
              >
                {Math.floor(currentTime)}s / 30s
              </span>
              <span
                style={{
                  color: voteState === 'preview_done' ? '#4caf50' : 'rgba(255,255,255,0.66)',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.65rem',
                }}
              >
                {voteState === 'preview_done' ? '✓ done' : '30s preview'}
              </span>
            </div>

            {/* Transport */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                onClick={() => seek(-5)}
                disabled={audioLoading || !waveformPng}
                style={s.transport}
              >
                «
              </button>
              <button
                onClick={togglePlay}
                disabled={audioLoading || !waveformPng}
                style={{ ...s.transport, flex: 2 }}
              >
                {audioLoading ? '…' : voteState === 'playing' ? '⏸' : '▶'}
              </button>
              <button
                onClick={() => seek(5)}
                disabled={audioLoading || !waveformPng}
                style={s.transport}
              >
                »
              </button>
            </div>

            {/* Swipe hints */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 0.25rem',
                marginBottom: '0.4rem',
                opacity: canVote ? 0.6 : 0.15,
              }}
            >
              <span
                style={{
                  color: '#e63946',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.65rem',
                }}
              >
                ← dislike
              </span>
              <span
                style={{
                  color: '#4caf50',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.65rem',
                }}
              >
                like →
              </span>
            </div>

            {/* Vote buttons */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.35rem' }}>
              <button
                onClick={() => castVote('dislike')}
                disabled={!canVote}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: canVote ? 'rgba(230,57,70,0.5)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${canVote ? 'rgba(230,57,70,0.4)' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: 6,
                  color: canVote ? '#fff' : '#333',
                  fontSize: '1.1rem',
                  cursor: canVote ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                👎
              </button>
              <button
                onClick={() => castVote('like')}
                disabled={!canVote}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: canVote ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${canVote ? 'rgba(76,175,80,0.4)' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: 6,
                  color: canVote ? '#4caf50' : '#333',
                  fontSize: '1.1rem',
                  cursor: canVote ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                👍
              </button>
            </div>

            {voteState === 'idle' && !audioLoading && waveformPng && (
              <p
                style={{
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.3)',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.6rem',
                  margin: '0 0 0.2rem',
                }}
              >
                tap waveform or ▶ to start
              </p>
            )}

            {currentIndex > 0 && (
              <button
                onClick={() => {
                  killAudio()
                  setCurrentIndex((i) => i - 1)
                }}
                style={{
                  width: '100%',
                  padding: '3px',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.6rem',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                }}
              >
                ← prev | change a vote?
              </button>
            )}
          </div>

          <p
            style={{
              flexShrink: 0,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: "'Courier New', monospace",
              fontSize: '0.55rem',
              letterSpacing: '0.15em',
              margin: '0.2rem 0 0',
            }}
          >
            ← dislike · like →
          </p>
        </div>
      </div>

      <style>{css}</style>
    </div>
  )
}

const css = `
  @keyframes fadeout { 0% { opacity: 1; transform: scale(0.5); } 100% { opacity: 0; transform: scale(1.3); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  html, body { overflow: hidden; overscroll-behavior: none; }
  header, footer, nav { display: none !important; }
`

const s: Record<string, React.CSSProperties> = {
  outer: {
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    background: '#030305',
  },
  spinner: {
    width: 28,
    height: 28,
    border: '2px solid rgba(255,255,255,0.08)',
    borderTopColor: '#e63946',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  sub: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: "'Courier New', monospace",
    fontSize: '0.8rem',
    margin: 0,
  },
  statBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  transport: {
    flex: 1,
    padding: '10px 6px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: "'Courier New', monospace",
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
}
