import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

type Args = {
  params: Promise<{ slug: string }>
}

export default async function CompilationPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'compilations',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })

  if (!docs.length) return notFound()

  const comp = docs[0]

  const artwork =
    comp.artwork && typeof comp.artwork === 'object' && 'url' in comp.artwork ? comp.artwork : null

  const tracks = (comp.tracks as any[]) ?? []
  const streamingLinks = (comp.streamingLinks as any[]) ?? []

  // Group tracks by disc
  const discs = ['1', '2', '3'].reduce<Record<string, any[]>>((acc, disc) => {
    const discTracks = tracks.filter((t) => (t.disc ?? '1') === disc)
    if (discTracks.length) acc[disc] = discTracks
    return acc
  }, {})

  const isMultiDisc = Object.keys(discs).length > 1

  return (
    <article className="container py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Artwork */}
        <div className="aspect-square bg-[var(--color-content-bg)] rounded-lg overflow-hidden relative max-w-md mx-auto w-full">
          {artwork ? (
            <Image
              src={artwork.url as string}
              alt={comp.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-secondary)]">
              Vol. {comp.volume}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">
            Vol. {comp.volume} · {comp.year}
          </p>
          <h1 className="text-4xl font-medium mb-4" style={{ fontFamily: 'var(--font-title)' }}>
            {comp.title}
          </h1>

          {comp.artworkCredit && (
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              Artwork: {comp.artworkCredit}
            </p>
          )}

          {/* Streaming links */}
          {streamingLinks.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8">
              {streamingLinks.map((link: any, i: number) => (
                <Link
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-[var(--color-brand)] rounded-full text-sm font-medium hover:bg-[var(--color-brand)] hover:text-white transition-colors"
                >
                  {link.label || link.platform || 'Listen'}
                </Link>
              ))}
            </div>
          )}

          {/* Track count */}
          <p className="text-sm text-[var(--color-text-secondary)]">{tracks.length} tracks</p>
        </div>
      </div>

      {/* Track listing */}
      {tracks.length > 0 && (
        <div className="max-w-2xl">
          <h2 className="text-xl font-medium mb-6 border-t pt-6">Track Listing</h2>
          {Object.entries(discs).map(([disc, discTracks]) => (
            <div key={disc} className="mb-8">
              {isMultiDisc && (
                <p className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-4">
                  Disc {disc}
                </p>
              )}
              <ol className="flex flex-col gap-2">
                {discTracks.map((track: any, i: number) => (
                  <li
                    key={i}
                    className="flex gap-4 text-sm py-1 border-b border-[var(--color-content-bg)]"
                  >
                    <span className="text-[var(--color-text-secondary)] w-6 text-right flex-shrink-0">
                      {track.number ?? i + 1}
                    </span>
                    <span className="flex-1">
                      <span className="font-medium">{track.artist}</span>
                      <span className="text-[var(--color-text-secondary)]"> — {track.title}</span>
                    </span>
                    {track.duration && (
                      <span className="text-[var(--color-text-secondary)] flex-shrink-0">
                        {track.duration}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      {/* Back link */}
      <div className="mt-12">
        <Link
          href="/compilations"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[color:var(--color-brand)] transition-colors"
        >
          ← All Compilations
        </Link>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'compilations',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })

  if (!docs.length) return { title: 'Compilation Not Found' }

  const comp = docs[0]
  const artwork =
    comp.artwork && typeof comp.artwork === 'object' && 'url' in comp.artwork ? comp.artwork : null

  return {
    title: comp.title,
    description: `PDX Pop Now! Vol. ${comp.volume} — ${comp.year} compilation featuring ${comp.tracks?.length ?? 0} local Portland artists.`,
    openGraph: {
      images: artwork ? [{ url: artwork.url as string }] : [],
    },
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'compilations',
    limit: 100,
    select: { slug: true },
    overrideAccess: false,
  })
  return docs.map((doc) => ({ slug: doc.slug }))
}
