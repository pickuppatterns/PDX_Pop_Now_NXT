import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

export const metadata: Metadata = {
  title: 'Festival Graphic Artists',
  description: 'PDX Pop Now! annual festival graphic artists.',
}

export default async function GFXArtistsPage() {
  const payload = await getPayload({ config })

  const { docs: artists } = await payload.find({
    collection: 'festival-gfx-artists',
    sort: '-year',
    limit: 100,
    depth: 1,
    overrideAccess: false,
  })

  return (
    <div className="container py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-medium mb-4" style={{ fontFamily: 'var(--font-title)' }}>
          Festival Graphic Artists
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Each year PDX Pop Now! selects a local artist to create the visual identity for the
          festival and compilation album artwork.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {artists.map((artist) => {
          const image =
            artist.featuredImage &&
            typeof artist.featuredImage === 'object' &&
            'url' in artist.featuredImage
              ? artist.featuredImage
              : null

          return (
            <Link
              key={artist.id}
              href={`/festival-gfx-artists/${artist.slug}`}
              className="group flex flex-col gap-3"
            >
              <div className="aspect-square bg-[var(--color-content-bg)] rounded-lg overflow-hidden relative">
                {image ? (
                  <Image
                    src={image.url as string}
                    alt={artist.artistName}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-text-secondary)] text-sm">
                    {artist.year}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium group-hover:text-[color:var(--color-brand)] transition-colors">
                  {artist.artistName}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">{artist.year} Festival</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
