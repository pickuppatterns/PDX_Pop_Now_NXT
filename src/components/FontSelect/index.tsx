'use client'

import React, { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Nunito', 'Raleway', 'Oswald', 'Ubuntu', 'Noto Sans', 'Source Sans 3',
  'Barlow', 'Mulish', 'Outfit', 'DM Sans', 'Figtree', 'Plus Jakarta Sans',
  'Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Libre Baskerville',
  'Crimson Text', 'EB Garamond', 'Cormorant Garamond', 'Source Serif 4', 'Noto Serif',
  'Bebas Neue', 'Anton', 'Righteous', 'Abril Fatface', 'Fredoka',
  'Pacifico', 'Lobster', 'Titan One',
  'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Space Mono',
]

interface CustomFont {
  id: string
  name: string
  fontFamily: string
}

export function FontSelectComponent(props: any) {
  const { path, field } = props
  console.log("FontSelect path:", path)
  const { value, setValue } = useField<string>({ path })
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/fonts?limit=100&depth=0')
      .then(res => res.json())
      .then(data => setCustomFonts(data.docs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const displayLabel = field?.label

  return (
    <div style={{ marginBottom: '1rem' }}>
      {displayLabel && (
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>
          {displayLabel}
        </label>
      )}
      <select
        value={value ?? ''}
        onChange={e => setValue(e.target.value)}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--theme-elevation-150)', backgroundColor: 'var(--theme-elevation-0)', color: 'var(--theme-text)', fontSize: '14px' }}
      >
        <option value="">— Select a font —</option>
        {!loading && customFonts.length > 0 && (
          <optgroup label="Custom Uploaded Fonts">
            {customFonts.map(font => (
              <option key={font.id} value={font.fontFamily}>{font.name}</option>
            ))}
          </optgroup>
        )}
        <optgroup label="Google Fonts — Sans-serif">
          {GOOGLE_FONTS.slice(0, 18).map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </optgroup>
        <optgroup label="Google Fonts — Serif">
          {GOOGLE_FONTS.slice(18, 28).map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </optgroup>
        <optgroup label="Google Fonts — Display">
          {GOOGLE_FONTS.slice(28, 36).map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </optgroup>
        <optgroup label="Google Fonts — Monospace">
          {GOOGLE_FONTS.slice(36).map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </optgroup>
      </select>
      {loading && (
        <p style={{ fontSize: '12px', color: 'var(--theme-elevation-400)', marginTop: '4px' }}>
          Loading custom fonts...
        </p>
      )}
    </div>
  )
}
