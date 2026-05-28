'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Slide = {
  content: React.ReactNode
}

type Props = {
  slides: Slide[]
  accentColor?: string
}

export default function SlideShow({ slides, accentColor = '#e63946' }: Props) {
  const [current, setCurrent] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const isLast = current === slides.length - 1
  const isFirst = current === 0

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const goNext = useCallback(() => {
    if (!isLast) setCurrent((c) => c + 1)
  }, [isLast])

  const goPrev = useCallback(() => {
    if (!isFirst) setCurrent((c) => c - 1)
  }, [isFirst])

  useEffect(() => {
    if (!isMobile) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev, isMobile])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 50) goNext()
    if (diff < -50) goPrev()
    touchStartX.current = null
  }

  // Desktop — render all slides stacked
  if (!isMobile) {
    return (
      <div style={{ width: '100%' }}>
        {slides.map((slide, i) => (
          <div key={i} style={{ marginBottom: i < slides.length - 1 ? '2.5rem' : 0 }}>
            {slide.content}
          </div>
        ))}
      </div>
    )
  }

  // Mobile — swipe slideshow
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', width: '100%', userSelect: 'none' }}
    >
      <div style={{ minHeight: 200 }}>{slides[current].content}</div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
        }}
      >
        <button
          onClick={goPrev}
          disabled={isFirst}
          style={{
            background: 'none',
            border: 'none',
            cursor: isFirst ? 'default' : 'pointer',
            color: isFirst ? 'rgba(255,255,255,0.15)' : accentColor,
            fontSize: '1.5rem',
            padding: '0.5rem',
            transition: 'color 0.2s',
          }}
        >
          ←
        </button>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {slides.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 20 : 8,
                height: 8,
                borderRadius: 99,
                background: i === current ? accentColor : 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={isLast}
          style={{
            background: 'none',
            border: 'none',
            cursor: isLast ? 'default' : 'pointer',
            color: isLast ? 'rgba(255,255,255,0.15)' : accentColor,
            fontSize: '1.5rem',
            padding: '0.5rem',
            transition: 'color 0.2s',
          }}
        >
          →
        </button>
      </div>

      {isLast && (
        <p
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.7rem',
            fontFamily: "'Courier New', monospace",
            marginTop: '0.5rem',
            letterSpacing: '0.1em',
          }}
        >
          — end —
        </p>
      )}
    </div>
  )
}
