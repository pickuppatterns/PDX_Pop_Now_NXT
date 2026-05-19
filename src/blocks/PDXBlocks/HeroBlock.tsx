import Image from 'next/image'
import Link from 'next/link'
import type { Page } from '@/payload-types'

type HeroBlockProps = Extract
  NonNullable<Page['layout']>[number],
  { blockType: 'hero' }
>

export function HeroBlockComponent({
  heading,
  subheading,
  backgroundImage,
  overlay,
  ctas,
  textAlign,
}: HeroBlockProps) {
  const image = backgroundImage && typeof backgroundImage === 'object' ? backgroundImage : null

  const alignClass = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }[textAlign ?? 'center']

  const overlayClass = {
    none: '',
    dark: 'bg-black/60',
    light: 'bg-white/40',
  }[overlay ?? 'dark']

  const textColor = overlay === 'light' ? 'text-gray-900' : 'text-white'

  return (
    <section className="relative w-full min-h-[60vh] flex items-center overflow-hidden">
      {/* Background image */}
      {image && 'url' in image && (
        <Image
          src={image.url as string}
          alt={image.alt ?? heading}
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Overlay */}
      {overlay !== 'none' && (
        <div className={`absolute inset-0 ${overlayClass}`} />
      )}

      {/* Content */}
      <div className={`relative z-10 w-full max-w-5xl mx-auto px-6 py-20 flex flex-col gap-6 ${alignClass}`}>
        <h1 className={`text-4xl md:text-6xl font-medium leading-tight ${textColor}`}>
          {heading}
        </h1>

        {subheading && (
          <p className={`text-lg md:text-xl max-w-2xl ${overlay === 'light' ? 'text-gray-700' : 'text-white/90'}`}>
            {subheading}
          </p>
        )}

        {ctas && ctas.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-2">
            {ctas.map((cta, i) => {
              const styleClass = {
                primary: 'bg-white text-black hover:bg-gray-100',
                secondary: 'bg-black text-white hover:bg-gray-900',
                outline: 'border-2 border-white text-white hover:bg-white hover:text-black',
              }[cta.style ?? 'primary']

              return (
                <Link
                  key={i}
                  href={cta.url}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${styleClass}`}
                >
                  {cta.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}