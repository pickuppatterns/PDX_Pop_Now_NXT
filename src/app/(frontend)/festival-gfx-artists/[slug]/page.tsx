import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import RichText from '@/components/RichText'

type Args = {
  params: Promise<{ slug: string }>
}

export default async function GFXArtistPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'festival-gfx-artists',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })

  if (!docs.length) return notFound()

  const artist = docs[0]

  const featuredImage =
    artist.featuredImage &&
    typeof artist.featuredImage === 'object' &&
    'url' in artist.featuredImage
      ? artist.featuredImage
      : null

  const portfolioImages = (artist.portfolioImages as any[]) ?? []
  const socialLinks = (artist.socialLinks as any[]) ?? []

  const compilation =
    artist.compilationVolume && typeof artist.compilationVolume === 'object'
      ? artist.compilationVolume
      : null

  return (
    <article className="container py-16">
      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="aspect-square bg-[var(--color-content-bg)] rounded-lg overflow-hidden relative max-w-md mx-auto w-full">
          {featuredImage ? (
            <Image
              src={featuredImage.url as string}
              alt={artist.artistName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-secondary)]">
              {artist.year}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">
            {artist.year} Festival Graphic Artist
          </p>
          <h1 className="text-4xl font-medium mb-6" style={{ fontFamily: 'var(--font-title)' }}>
            {artist.artistName}
          </h1>

          {artist.bio && (
            <div className="prose prose-sm dark:prose-invert mb-6">
              <RichText data={artist.bio} enableGutter={false} />
            </div>
          )}

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex gap-3 flex-wrap mb-6">
              {socialLinks.map((social: any, i: number) => (
                <Link
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-[var(--color-brand)] rounded-full text-sm font-medium hover:bg-[var(--color-brand)] hover:text-white transition-colors"
                >
                  {social.handle || social.platform}
                </Link>
              ))}
            </div>
          )}

          {/* Compilation link */}
          {compilation && (
            <Link
              href={`/compilations/${(compilation as any).slug}`}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[color:var(--color-brand)] transition-colors"
            >
              View {(compilation as any).year} Compilation →
            </Link>
          )}
        </div>
      </div>

      {/* Portfolio images */}
      {portfolioImages.length > 0 && (
        <div>
          <h2 className="text-xl font-medium mb-6 border-t pt-6">Portfolio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioImages.map((item: any, i: number) => {
              const img =
                item.image && typeof item.image === 'object' && 'url' in item.image
                  ? item.image
                  : null
              if (!img) return null
              return (
                <div key={i} className="flex flex-col gap-2">
                  <div className="aspect-square bg-[var(--color-content-bg)] rounded-lg overflow-hidden relative">
                    <Image
                      src={img.url as string}
                      alt={item.caption || artist.artistName}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  {item.caption && (
                    <p className="text-xs text-[var(--color-text-secondary)]">{item.caption}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="mt-12">
        <Link
          href="/festival-gfx-artists"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[color:var(--color-brand)] transition-colors"
        >
          ← All Festival Graphic Artists
        </Link>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'festival-gfx-artists',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })

  if (!docs.length) return { title: 'Artist Not Found' }

  const artist = docs[0]
  const image =
    artist.featuredImage &&
    typeof artist.featuredImage === 'object' &&
    'url' in artist.featuredImage
      ? artist.featuredImage
      : null

  return {
    title: `${artist.artistName} — ${artist.year} Festival Graphic Artist`,
    description: `${artist.artistName} designed the artwork for PDX Pop Now! ${artist.year}.`,
    openGraph: {
      images: image ? [{ url: image.url as string }] : [],
    },
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'festival-gfx-artists',
    limit: 100,
    select: { slug: true },
    overrideAccess: false,
  })
  return docs.map((doc) => ({ slug: doc.slug }))
}
