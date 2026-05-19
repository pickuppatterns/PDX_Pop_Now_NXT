import Image from 'next/image'
import Link from 'next/link'
import type { Page } from '@/payload-types'

type EventListBlockProps = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'eventList' }
>

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function EventListBlockComponent({
  heading,
  events,
  layout,
}: EventListBlockProps) {
  if (!events?.length) return null

  const isGrid = layout === 'grid' || layout === 'cards'

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16">
      {heading && (
        <h2 className="text-2xl font-medium mb-8">{heading}</h2>
      )}
      <div className={isGrid ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-6'}>
        {events.map((event, i) => {
          const image =
            event.image && typeof event.image === 'object' && 'url' in event.image
              ? event.image
              : null

          return (
            <div
              key={i}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {image && (
                <div className="relative aspect-video">
                  <Image
                    src={image.url as string}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {event.free && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      Free
                    </span>
                  )}
                  {event.allAges && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      All Ages
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-lg mb-1">{event.title}</h3>
                {event.date && (
                  <p className="text-sm text-gray-500 mb-1">
                    {formatDate(event.date)}
                  </p>
                )}
                {event.venue && (
                  <p className="text-sm text-gray-600 mb-1">{event.venue}</p>
                )}
                {event.address && (
                  <p className="text-xs text-gray-400 mb-2">{event.address}</p>
                )}
                {event.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {event.description}
                  </p>
                )}
                {event.url && (
                  <Link
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm font-medium underline hover:opacity-70"
                  >
                    More info →
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
