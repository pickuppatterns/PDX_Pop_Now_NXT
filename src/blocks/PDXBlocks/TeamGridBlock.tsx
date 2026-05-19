import Image from 'next/image'
import type { Page } from '@/payload-types'

type TeamGridBlockProps = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'teamGrid' }
>

const columnClass: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function TeamGridBlockComponent({
  heading,
  subheading,
  members,
  columns,
  style,
}: TeamGridBlockProps) {
  if (!members?.length) return null

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16">
      {heading && (
        <h2 className="text-2xl font-medium text-center mb-2">{heading}</h2>
      )}
      {subheading && (
        <p className="text-gray-500 text-center mb-10">{subheading}</p>
      )}

      <div className={`grid gap-8 ${columnClass[columns ?? '3']}`}>
        {members.map((member, i) => {
          const photo =
            member.photo && typeof member.photo === 'object' && 'url' in member.photo
              ? member.photo
              : null

          if (style === 'list') {
            return (
              <div key={i} className="flex gap-4 items-start">
                {photo && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={photo.url as string}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.role}</p>
                  {member.bio && (
                    <p className="text-sm text-gray-600 mt-1">{member.bio}</p>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-xs text-gray-400 hover:underline mt-1 block"
                    >
                      {member.email}
                    </a>
                  )}
                </div>
              </div>
            )
          }

          if (style === 'minimal') {
            return (
              <div key={i} className="text-center">
                {photo && (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-3">
                    <Image
                      src={photo.url as string}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
            )
          }

          // Default: cards
          return (
            <div key={i} className="border rounded-lg overflow-hidden">
              {photo && (
                <div className="relative aspect-square">
                  <Image
                    src={photo.url as string}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-500 mb-2">{member.role}</p>
                {member.bio && (
                  <p className="text-sm text-gray-600 line-clamp-3">{member.bio}</p>
                )}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="text-xs text-gray-400 hover:underline mt-2 block"
                  >
                    {member.email}
                  </a>
                )}
                {member.socialUrls && member.socialUrls.length > 0 && (
                  <div className="flex gap-3 mt-3">
                    {member.socialUrls.map((social, j) => (
                      <a
                        key={j}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
                      >
                        {social.platform}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}