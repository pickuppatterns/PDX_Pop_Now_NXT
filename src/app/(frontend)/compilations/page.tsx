import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

export const metadata: Metadata = {
  title: 'Compilations',
  description: 'PDX Pop Now! annual compilation albums featuring local Portland musicians.',
}

export default async function CompilationsPage() {
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
          Compilation Albums
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Annual compilations featuring the best of Portland&apos;s local music scene.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {compilations.map((comp) => {
          const artwork =
            comp.artwork && typeof comp.artwork === 'object' && 'url' in comp.artwork
              ? comp.artwork
              : null

          return (
            <Link
              key={comp.id}
              href={`/compilations/${comp.slug}`}
              className="group flex flex-col gap-2"
            >
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
              <div>
                <p className="font-medium text-sm group-hover:text-[color:var(--color-brand)] transition-colors">
                  {comp.title}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Vol. {comp.volume} · {comp.year}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
