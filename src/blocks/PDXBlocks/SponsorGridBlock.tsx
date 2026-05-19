import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import type { Page } from '@/payload-types'

type SponsorGridBlockProps = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'sponsorGrid' }
>

const columnClass: Record<string, string> = {
  '2': 'grid-cols-2',
  '3': 'grid-cols-2 sm:grid-cols-3',
  '4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  '6': 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6',
}

const tierOrder = ['presenting', 'gold', 'silver', 'supporter']

const tierLabel: Record<string, string> = {
  presenting: 'Presenting Sponsor',
  gold: 'Gold Sponsors',
  silver: 'Silver Sponsors',
  supporter: 'Supporters',
}

export function SponsorGridBlockComponent({
  heading,
  sponsors,
  columns,
}: SponsorGridBlockProps) {
  if (!sponsors?.length) return null

  const grouped = tierOrder.reduce<Record<string, typeof sponsors>>((acc, tier) => {
    const filtered = sponsors.filter(s => s.tier === tier)
    if (filtered.length) acc[tier] = filtered
    return acc
  }, {})

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16">
      {heading && (
        <h2 className="text-2xl font-medium text-center mb-12">{heading}</h2>
      )}
      {Object.entries(grouped).map(([tier, tierSponsors]) => (
        <div key={tier} className="mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 text-center mb-6">
            {tierLabel[tier]}
          </p>
          <div className={`grid gap-8 ${columnClass[columns ?? '4']}`}>
            {tierSponsors.map((sponsor, i) => {
              const logo =
                sponsor.logo && typeof sponsor.logo === 'object'
                  ? sponsor.logo
                  : null

              const filters = (sponsor as any).logoFilters as {
                invert?: boolean
                opacity?: number
                brightness?: number
                contrast?: number
              } | undefined

              const filterStyle: React.CSSProperties = {
                filter: [
                  filters?.invert ? 'invert(1)' : '',
                  filters?.brightness !== undefined && filters.brightness !== 100
                    ? `brightness(${filters.brightness / 100})`
                    : '',
                  filters?.contrast !== undefined && filters.contrast !== 100
                    ? `contrast(${filters.contrast / 100})`
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ') || undefined,
                opacity:
                  filters?.opacity !== undefined ? filters.opacity / 100 : undefined,
              }

              const inner = (
                <div className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-300">
                  {logo && 'url' in logo ? (
                    <div className="relative w-full h-16" style={filterStyle}>
                      <Image
                        src={logo.url as string}
                        alt={sponsor.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {sponsor.name}
                    </span>
                  )}
                </div>
              )

              return sponsor.url ? (
                <Link key={i} href={sponsor.url} target="_blank" rel="noopener noreferrer">
                  {inner}
                </Link>
              ) : (
                <div key={i}>{inner}</div>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}
