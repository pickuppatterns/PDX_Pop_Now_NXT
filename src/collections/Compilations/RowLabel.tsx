'use client'

import React from 'react'

export function TrackRowLabel({ data }: { data: any }) {
  if (!data?.artist && !data?.title) return <span>New Track</span>
  const disc = data.disc && data.disc !== '1' ? `Disc ${data.disc} · ` : ''
  const num = data.number ? `${data.number}. ` : ''
  const artist = data.artist ?? ''
  const title = data.title ? ` — ${data.title}` : ''
  return (
    <span>
      {disc}
      {num}
      {artist}
      {title}
    </span>
  )
}
