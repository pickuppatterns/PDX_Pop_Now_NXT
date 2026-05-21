import Image from 'next/image'
import Link from 'next/link'
import type { Page } from '@/payload-types'

type CompilationBlockProps = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'compilation' }
>

const platformLabels: Record<string, string> = {
  bandcamp: 'Bandcamp',
  spotify: 'Spotify',
  apple: 'Apple Music',
  soundcloud: 'SoundCloud',
  youtube: 'YouTube Music',
  other: 'Listen',
}

export function CompilationBlockComponent({
  title,
  volume,
  year,
  artwork,
  tracks,
  streamingLinks,
}: CompilationBlockProps) {
  const artworkImage = artwork && typeof artwork === 'object' && 'url' in artwork ? artwork : null

  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 relative rounded-lg overflow-hidden">
          {artworkImage ? (
            <Image src={artworkImage.url as string} alt={title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No artwork
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
            {volume ? `Vol. ${volume}` : ''}
            {volume && year ? ' · ' : ''}
            {year ?? ''}
          </p>
          <h2 className="text-3xl font-medium mb-6">{title}</h2>

          {streamingLinks && streamingLinks.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8">
              {streamingLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border rounded-full text-sm font-medium hover:bg-black hover:text-white transition-colors"
                >
                  {link.label || platformLabels[link.platform ?? 'other'] || 'Listen'}
                </Link>
              ))}
            </div>
          )}

          {tracks && tracks.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Track Listing</p>
              {['1', '2', '3'].map((disc) => {
                const discTracks = tracks.filter((t: any) => (t.disc ?? '1') === disc)
                if (!discTracks.length) return null
                return (
                  <div key={disc} className="mb-4">
                    {tracks.some((t: any) => t.disc === '2') && (
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                        Disc {disc}
                      </p>
                    )}
                    <ol className="flex flex-col gap-2">
                      {discTracks.map((track: any, i: number) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <span className="text-gray-400 w-6 text-right flex-shrink-0">
                            {track.number ?? i + 1}
                          </span>
                          <span className="flex-1">
                            <span className="font-medium">{track.artist}</span>
                            {' — '}
                            <span className="text-gray-600">{track.title}</span>
                          </span>
                          {track.duration && (
                            <span className="text-gray-400 flex-shrink-0">{track.duration}</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
