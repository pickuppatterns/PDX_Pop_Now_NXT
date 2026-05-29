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

export default function ListenPage() {
  const router = useRouter()
  const waveformRef = useRef<HTMLDivElement>(null)
  const hiddenWaveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const regionStartRef = useRef<number>(0)
  const regionEndRef = useRef<number>(30)
  const totalDurRef = useRef<number>(0)
  const regionRef = useRef<Region | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [voteState, setVoteState] = useState<VoteState>('idle')
  const [loading, setLoading] = useState(true)
  const [audioLoading, setAudioLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [votes, setVotes] = useState<Record<number, 'like' | 'dislike'>>({})
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null)
  const touchStartX = useRef<number | null>(null)
  const previewDoneRef = useRef(false)
  const [waveformPng, setWaveformPng] = useState<string | null>(null)

  const currentSong = songs[currentIndex]
  const votedCount = Object.keys(votes).length

  // Fetch queue
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
      console.warn('[killAudio]', err)
      wavesurferRef.current = null
    }
  }

  const initWaveSurfer = useCallback(async (anonToken: string, autoplay = false) => {
    if (!hiddenWaveformRef.current) return

    // Inline kill
    if (wavesurferRef.current) {
      try {
        wavesurferRef.current.pause()
        wavesurferRef.current.destroy()
        wavesurferRef.current = null
      } catch (err) {
        console.warn('[killAudio]', err)
        wavesurferRef.current = null
      }
    }

    setAudioLoading(true)
    setVoteState('idle')
    setCurrentTime(0)
    setWaveformPng(null)
    previewDoneRef.current = false
    regionRef.current = null

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
      progressColor: '#e63946',
      cursorColor: 'transparent',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 80,
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

      // Export clean PNG first — no region, no progress state
      const png = await ws.exportImage('image/png', 1, 'dataURL')
      setWaveformPng(typeof png === 'string' ? png : png[0])

      // Then add region overlay
      regions.addRegion({
        start,
        end,
        color: 'rgba(230,57,70,0.2)',
        drag: false,
        resize: false,
      })

      // Seek to region start
      ws.seekTo(start / dur)
      setAudioLoading(false)

      if (autoplay) {
        try {
          await ws.play()
          setVoteState('playing')
        } catch {
          setVoteState('idle')
        }
      }
    }) // 👈 closes ws.on('ready')

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

    wavesurferRef.current = ws
    ws.load(url)
  }, [])

  useEffect(() => {
    if (!currentSong) return
    const isFirst = currentIndex === 0
    initWaveSurfer(currentSong.anonToken, !isFirst)
    return () => killAudio()
  }, [currentIndex, currentSong?.id])

  async function castVote(vote: 'like' | 'dislike') {
    if (!currentSong) return
    killAudio()
    setSwipeDir(vote === 'like' ? 'right' : 'left')
    setVoteState('voted')

    await fetch('/api/listen/vote', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId: currentSong.id, vote }),
    })

    setVotes((prev) => ({ ...prev, [currentSong.id]: vote }))

    setTimeout(() => {
      setSwipeDir(null)
      if (currentIndex < songs.length - 1) {
        setCurrentIndex((i) => i + 1)
      }
    }, 600)
  }

  function togglePlay() {
    if (!wavesurferRef.current) return
    if (wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.pause()
      setVoteState('idle')
    } else {
      wavesurferRef.current.seekTo(regionStartRef.current / totalDurRef.current)
      wavesurferRef.current.play()
      setVoteState('playing')
    }
  }

  function seek(seconds: number) {
    if (!wavesurferRef.current) return
    const dur = totalDurRef.current
    const regionStart = regionStartRef.current
    const regionEnd = regionEndRef.current
    const current = wavesurferRef.current.getCurrentTime()
    const next = Math.max(regionStart, Math.min(current + seconds, regionEnd))
    wavesurferRef.current.seekTo(next / dur)
  }

  // Click on the region overlay to seek
  function handleRegionClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!wavesurferRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickPct = (e.clientX - rect.left) / rect.width
    const dur = totalDurRef.current
    const regionStart = regionStartRef.current
    const seekTime = regionStart + clickPct * 30
    wavesurferRef.current.seekTo(Math.min(seekTime, regionEndRef.current) / dur)
    if (!wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.play()
      setVoteState('playing')
    }
  }

  // Touch swipe for voting
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 80 && (voteState === 'preview_done' || voteState === 'playing')) {
      castVote(diff > 0 ? 'like' : 'dislike')
    }
    touchStartX.current = null
  }

  // Keyboard
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
  const regionStart = regionStartRef.current
  const regionEnd = regionEndRef.current
  const regionLeftPct = dur > 0 ? (regionStart / dur) * 100 : 0
  const regionWidthPct = dur > 0 ? ((regionEnd - regionStart) / dur) * 100 : 100
  const progressPct = (currentTime / 30) * regionWidthPct

  if (loading)
    return (
      <div style={s.screen}>
        <div style={s.spinner} />
        <p style={s.sub}>Loading your playlist…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )

  if (error)
    return (
      <div style={s.screen}>
        <p style={{ color: '#e63946', fontFamily: 'Georgia, serif', fontSize: '1.1rem' }}>
          {error}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )

  if (songs.length === 0)
    return (
      <div style={s.screen}>
        <p style={s.sub}>No songs assigned to your group yet.</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )

  const allVoted = songs.every((sv) => votes[sv.id])

  if (allVoted)
    return (
      <div style={s.screen}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{'🎵'}</div>
        <h1
          style={{
            color: '#fff',
            fontFamily: 'Georgia, serif',
            fontSize: '1.75rem',
            fontStyle: 'italic',
            marginBottom: '0.5rem',
          }}
        >
          You're done!
        </h1>
        <p style={s.sub}>You voted on all {songs.length} songs in your group.</p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem' }}>
          <div style={s.statBox}>
            <span style={{ color: '#4caf50', fontSize: '2rem' }}>{'👍'}</span>
            <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
              {Object.values(votes).filter((v) => v === 'like').length}
            </span>
            <span style={s.sub}>liked</span>
          </div>
          <div style={s.statBox}>
            <span style={{ color: '#e63946', fontSize: '2rem' }}>{'👎'}</span>
            <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
              {Object.values(votes).filter((v) => v === 'dislike').length}
            </span>
            <span style={s.sub}>passed</span>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '2rem 1rem',
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 480, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p
            style={{
              color: '#ff8c42',
              fontFamily: "'Courier New', monospace",
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            {currentSong?.groupName}
          </p>
          <p
            style={{
              color: '#666',
              fontFamily: "'Courier New', monospace",
              fontSize: '0.75rem',
              margin: 0,
            }}
          >
            {votedCount} / {songs.length} voted
          </p>
        </div>
        <div
          style={{
            height: 3,
            background: '#222',
            borderRadius: 99,
            marginTop: '0.5rem',
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

      {/* Song card */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          transform:
            swipeDir === 'right'
              ? 'translateX(120%) rotate(15deg)'
              : swipeDir === 'left'
                ? 'translateX(-120%) rotate(-15deg)'
                : 'none',
          transition: swipeDir ? 'transform 0.5s ease' : 'none',
          opacity: swipeDir ? 0 : 1,
        }}
      >
        <div
          style={{
            background: '#1a1a2e',
            borderRadius: 16,
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Song number */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <p
              style={{
                color: '#666',
                fontFamily: "'Courier New', monospace",
                fontSize: '0.75rem',
                margin: '0 0 4px',
              }}
            >
              Song {currentIndex + 1} of {songs.length}
            </p>
            <p
              style={{
                color: 'rgba(255,255,255,0.1)',
                fontFamily: "'Courier New', monospace",
                fontSize: '0.65rem',
                margin: 0,
              }}
            >
              {currentSong?.anonToken.slice(0, 8)}
            </p>
          </div>

          {/* Hidden WaveSurfer for audio + PNG generation */}
          <div
            ref={hiddenWaveformRef}
            style={{
              position: 'absolute',
              visibility: 'hidden',
              width: 448,
              height: 80,
              pointerEvents: 'none',
            }}
          />

          {/* Waveform display */}
          <div
            style={{
              position: 'relative',
              marginBottom: '0.75rem',
              borderRadius: 8,
              overflow: 'hidden',
              height: 80,
              background: '#0a0a0a',
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
                  background: '#0a0a0a',
                  zIndex: 2,
                }}
              >
                <div style={s.spinner} />
              </div>
            )}

            {/* Full waveform PNG */}
            {waveformPng && (
              <img
                src={waveformPng}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'fill',
                  opacity: 0.3,
                  filter: 'grayscale(100%)', // 👈 fully desaturate
                }}
              />
            )}

            {/* Region highlight — clickable for seeking */}
            {waveformPng && (
              <div
                onClick={handleRegionClick}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${regionLeftPct}%`,
                  width: `${regionWidthPct}%`,
                  height: '100%',
                  background: 'rgba(230,57,70,0.15)',
                  borderLeft: '2px solid rgba(230,57,70,0.8)',
                  borderRight: '2px solid rgba(230,57,70,0.8)',
                  cursor: 'pointer',
                  zIndex: 1,
                }}
              >
                {/* Progress fill within region */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${progressPct}%`,
                    height: '100%',
                    background: 'rgba(230,57,70,0.3)',
                    transition: 'width 0.1s linear',
                  }}
                />

                {/* Bright waveform overlay in region */}
                {waveformPng && (
                  <img
                    src={waveformPng}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'fill',
                      opacity: 0.3,
                      filter: 'grayscale(100%)', // 👈 fully desaturate
                    }}
                  />
                )}
              </div>
            )}

            {/* Playhead cursor */}
            {waveformPng && voteState !== 'idle' && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${regionLeftPct + progressPct}%`,
                  width: 2,
                  height: '100%',
                  background: '#fff',
                  zIndex: 3,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>

          {/* Time */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span
              style={{ color: '#666', fontFamily: "'Courier New', monospace", fontSize: '0.7rem' }}
            >
              {Math.floor(currentTime)}s / 30s
            </span>
            <span
              style={{
                color: voteState === 'preview_done' ? '#4caf50' : '#666',
                fontFamily: "'Courier New', monospace",
                fontSize: '0.7rem',
              }}
            >
              {voteState === 'preview_done' ? '✓ Preview complete' : '30s preview'}
            </span>
          </div>

          {/* Transport */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => seek(-5)}
              disabled={audioLoading || !waveformPng}
              style={s.transport}
            >
              {'« 5s'}
            </button>
            <button
              onClick={togglePlay}
              disabled={audioLoading || !waveformPng}
              style={{ ...s.transport, flex: 2, background: 'rgba(255,255,255,0.08)' }}
            >
              {audioLoading ? 'Loading…' : voteState === 'playing' ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              onClick={() => seek(5)}
              disabled={audioLoading || !waveformPng}
              style={s.transport}
            >
              {'5s »'}
            </button>
          </div>

          {/* Vote buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => castVote('dislike')}
              disabled={!canVote}
              style={{
                flex: 1,
                padding: '1rem',
                background: canVote ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${canVote ? '#e63946' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12,
                color: canVote ? '#e63946' : '#444',
                fontSize: '1.5rem',
                cursor: canVote ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              {'👎'}
            </button>
            <button
              onClick={() => castVote('like')}
              disabled={!canVote}
              style={{
                flex: 1,
                padding: '1rem',
                background: canVote ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${canVote ? '#4caf50' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12,
                color: canVote ? '#4caf50' : '#444',
                fontSize: '1.5rem',
                cursor: canVote ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              {'👍'}
            </button>
          </div>

          {voteState === 'idle' && !audioLoading && waveformPng && (
            <p
              style={{
                textAlign: 'center',
                color: '#555',
                fontFamily: "'Courier New', monospace",
                fontSize: '0.7rem',
                marginTop: '0.75rem',
              }}
            >
              Click the highlighted region or press play
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
                marginTop: '1rem',
                padding: '6px',
                background: 'transparent',
                border: 'none',
                color: '#555',
                fontFamily: "'Courier New', monospace",
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              {'← previous song'}
            </button>
          )}
        </div>
      </div>

      <p
        style={{
          color: '#333',
          fontFamily: "'Courier New', monospace",
          fontSize: '0.65rem',
          marginTop: '1.5rem',
          letterSpacing: '0.1em',
        }}
      >
        {'← dislike · like →'}
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #222',
    borderTopColor: '#e63946',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  sub: {
    color: '#666',
    fontFamily: "'Courier New', monospace",
    fontSize: '0.85rem',
    margin: 0,
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  transport: {
    flex: 1,
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#fff',
    fontFamily: "'Courier New', monospace",
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
}
