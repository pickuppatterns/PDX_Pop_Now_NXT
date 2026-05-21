import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

export const metadata: Metadata = {
  title: 'The CD — PDX Pop Now! Compilations',
  description:
    'PDX Pop Now! annual compilation albums featuring the best local Portland musicians since 2004.',
}

export default async function TheCDPage() {
  const payload = await getPayload({ config })

  const { docs: compilations } = await payload.find({
    collection: 'compilations',
    sort: '-year',
    limit: 100,
    depth: 1,
    overrideAccess: false,
  })

  return (
    <div className="container py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-medium mb-4" style={{ fontFamily: 'var(--font-title)' }}>
          The Compilation
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-2xl">
          Each year PDX Pop Now! releases a compilation album featuring local Portland musicians
          selected by our all-volunteer listening committee. Browse all {compilations.length}{' '}
          volumes below.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {compilations.map((comp) => {
          const artwork =
            comp.artwork && typeof comp.artwork === 'object' && 'url' in comp.artwork
              ? comp.artwork
              : null

          const streamingLinks = (comp.streamingLinks as any[]) ?? []
          const bandcamp = streamingLinks.find((l) => l.platform === 'bandcamp')

          return (
            <div key={comp.id} className="flex flex-col gap-2">
              <Link href={`/compilations/${comp.slug}`} className="group block">
                <div className="aspect-square bg-[var(--color-content-bg)] rounded-lg overflow-hidden relative">
                  {artwork ? (
                    <Image
                      src={artwork.url as string}
                      alt={comp.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-secondary)] text-sm">
                      Vol. {comp.volume}
                    </div>
                  )}
                </div>
              </Link>

              <div>
                <Link
                  href={`/compilations/${comp.slug}`}
                  className="font-medium text-sm hover:text-[color:var(--color-brand)] transition-colors"
                >
                  {comp.title}
                </Link>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Vol. {comp.volume} · {comp.year} · {(comp.tracks as any[])?.length ?? 0} tracks
                </p>
                {bandcamp && (
                  <Link
                    href={bandcamp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[color:var(--color-brand)] hover:underline mt-1 block"
                  >
                    Listen on Bandcamp →
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
