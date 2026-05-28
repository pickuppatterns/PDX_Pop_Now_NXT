import { getCachedGlobal } from '@/utilities/getGlobals'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import {
  FacebookLogo,
  InstagramLogo,
  TwitterLogo,
  YoutubeLogo,
  LinkedinLogo,
  TiktokLogo,
} from '@phosphor-icons/react/dist/ssr'

const VimeoFallback = () => (
  <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
    <path d="M228,81.1C216.9,129.7,160,177.6,143.1,187.1s-32.7,3.6-38.9-13.6C97.4,151.7,88,112,72.3,122.5c-15.3,10.2-24.4,40.5-24.4,40.5L32,151.3S51.1,95,90.3,95c34.4,0,37.5,52.5,46.6,85.5,8.7,32,29.3,24.4,50.5-2.9,21.5-27.6,24.7-67.1,6.9-72.3-18.9-5.5-47.6,28.7-47.6,28.7S160.1,34,228,81.1z" />
  </svg>
)

const BandcampFallback = () => (
  <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
    <path d="M0,170.4L94.9,32h161.1l-94.9,138.4z" />
  </svg>
)

const SoundcloudFallback = () => (
  <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
    <path d="M11.6,148.9c-0.2,0-0.4-0.2-0.5-0.4l-2.8-18.2l2.8-17.6c0.1-0.2,0.3-0.4,0.5-0.4s0.4,0.2,0.5,0.4l3.2,17.6l-3.2,18.2C12,148.7,11.8,148.9,11.6,148.9z M18.6,154.4c-0.3,0-0.5-0.2-0.6-0.5l-3.3-23.6l3.3-22.6c0.1-0.3,0.3-0.5,0.6-0.5s0.5,0.2,0.6,0.5l3.7,22.6l-3.7,23.6C19.1,154.2,18.9,154.4,18.6,154.4z M26,157.8c-0.3,0-0.6-0.3-0.7-0.6l-3-27l3-25.6c0.1-0.3,0.4-0.6,0.7-0.6s0.6,0.3,0.7,0.6l3.4,25.6l-3.4,27C26.6,157.5,26.3,157.8,26,157.8z M192,99.7c-1.4,0-2.8,0.1-4.2,0.4c-2.8-32.1-29.6-57.1-62.4-57.1c-8.5,0-16.6,1.7-23.5,4.7c-2.6,1.1-3.3,2.2-3.3,3.2v105.5c0,1,0.8,1.9,1.9,2h91.5c17.7,0,32-14.3,32-32S209.7,99.7,192,99.7z" />
  </svg>
)

const BlueSkyFallback = () => (
  <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
    <path d="M128,96.5c-13.4-34.1-49.7-56.5-87.2-37.5C4.2,77.4,0.3,117.2,22.8,140c17.4,17.8,79.5,53.5,96.4,64.2c2.8,1.8,6.8,1.8,9.6,0c16.9-10.7,79-46.4,96.4-64.2c22.5-22.8,18.6-62.6-18-81C169.7,40,141.4,62.4,128,96.5z" />
  </svg>
)

const XFallback = () => (
  <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
    <path d="M214.75,211.71l-62.6-98.36,61.77-67.95a8,8,0,0,0-11.84-10.76l-58.63,64.89L99.43,36.29A8,8,0,0,0,93,32H48a8,8,0,0,0-6.75,12.29l62.6,98.36L41.08,210.6a8,8,0,1,0,11.84,10.76l58.05-63.88,56.66,88.99A8,8,0,0,0,174,250h44a8,8,0,0,0,6.75-12.29Z" />
  </svg>
)

const YoutubeFallback = () => (
  <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
    <path d="M234.33,69.52a24,24,0,0,0-14.49-16.4C185.56,40,128,40,128,40S70.44,40,36.16,53.12a24,24,0,0,0-14.49,16.4C16,87.37,16,128,16,128s0,40.63,5.67,58.48a24,24,0,0,0,14.49,16.4C70.44,216,128,216,128,216s57.56,0,91.84-13.12a24,24,0,0,0,14.49-16.4C240,168.63,240,128,240,128S240,87.37,234.33,69.52Zm-92.06,73.75L108,166.83a8,8,0,0,1-12-6.95V96.12a8,8,0,0,1,12-6.95l34.27,23.56a8,8,0,0,1,0,13.54Z" />
  </svg>
)

const TiktokFallback = () => (
  <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224,72a48.05,48.05,0,0,1-48-48,8,8,0,0,0-8-8H120a8,8,0,0,0-8,8V156a20,20,0,1,1-28.57-18.08A8,8,0,0,0,88,130V88a8,8,0,0,0-8.94-7.94C36.52,86.16,8,117.71,8,156a100,100,0,0,0,200,0V80A8,8,0,0,0,224,72Z" />
  </svg>
)

const FacebookFallback = () => (
  <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V156h16a8,8,0,0,0,0-16H136V120a20,20,0,0,1,20-20h12a8,8,0,0,0,0-16H156a36,36,0,0,0-36,36v20H104a8,8,0,0,0,0,16h16v59.63a88,88,0,1,1,16,0Z" />
  </svg>
)

const InstagramFallback = () => (
  <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
    <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z" />
  </svg>
)

const LinkedinFallback = () => (
  <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
    <path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.61A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z" />
  </svg>
)

const withFallback = (PhosphorIcon: React.ElementType, Fallback: React.ElementType) =>
  function IconWithFallback(props: any) {
    try {
      return <PhosphorIcon {...props} />
    } catch {
      return <Fallback />
    }
  }

const socialIcons: Record<string, React.ElementType> = {
  facebook: withFallback(FacebookLogo, FacebookFallback),
  twitter: withFallback(TwitterLogo, XFallback),
  x: withFallback(TwitterLogo, XFallback),
  instagram: withFallback(InstagramLogo, InstagramFallback),
  youtube: withFallback(YoutubeLogo, YoutubeFallback),
  linkedin: withFallback(LinkedinLogo, LinkedinFallback),
  tiktok: withFallback(TiktokLogo, TiktokFallback),
  bluesky: BlueSkyFallback,
  vimeo: VimeoFallback,
  bandcamp: BandcampFallback,
  soundcloud: SoundcloudFallback,
}

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const navItems = footerData?.navItems || []

  const payload = await getPayload({ config })
  const siteSettings = await payload
    .findGlobal({
      slug: 'site-settings',
      depth: 1,
    })
    .catch(() => null)

  const footerLogo =
    siteSettings?.footer &&
    typeof siteSettings.footer === 'object' &&
    'footerLogoImage' in siteSettings.footer &&
    siteSettings.footer.footerLogoImage &&
    typeof siteSettings.footer.footerLogoImage === 'object' &&
    'url' in siteSettings.footer.footerLogoImage
      ? (siteSettings.footer.footerLogoImage.url as string)
      : null

  const siteLogo =
    siteSettings?.logo && typeof siteSettings.logo === 'object' && 'url' in siteSettings.logo
      ? (siteSettings.logo.url as string)
      : null

  const logoUrl = footerLogo ?? siteLogo

  const social = siteSettings?.socialLinks as Record<string, string> | undefined
  const showSocialAtFooter = siteSettings?.socialAtFooter ?? true

  const footerOptions = siteSettings?.footer as Record<string, any> | undefined
  const bgColor = footerOptions?.footerBackgroundColor ?? null
  const textColor = footerOptions?.footerTextColor ?? null
  const titleColor = footerOptions?.footerTitleColor ?? null
  const copyright = footerOptions?.copyrightText ?? null
  const disabled = footerOptions?.disableFooter ?? false

  if (disabled) return null

  const footerStyle: React.CSSProperties = {
    ...(bgColor ? { backgroundColor: bgColor } : {}),
    ...(textColor ? { color: textColor } : {}),
  }

  return (
    <footer
      className="mt-auto border-t border-border bg-black dark:bg-card text-white"
      style={footerStyle}
    >
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        {/* Logo */}
        <Link className="flex items-center" href="/">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={siteSettings?.siteTitle ?? 'Site Logo'}
              width={160}
              height={50}
              style={{ width: 'auto', height: '50px' }}
              className="max-w-[10rem]"
            />
          ) : (
            <Logo />
          )}
        </Link>

        <div className="flex flex-col gap-6">
          {/* Nav items */}
          <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
            <ThemeSelector />
            <nav className="flex flex-col md:flex-row gap-4">
              {navItems.map(({ link }, i) => (
                <CMSLink className="text-white" key={i} {...link} />
              ))}
            </nav>
          </div>

          {/* Social links */}
          {showSocialAtFooter && social && (
            <div className="flex gap-4 flex-wrap">
              {Object.entries(social).map(([platform, url]) => {
                if (
                  !url ||
                  url === `http://${platform}.com/` ||
                  url.match(/^https?:\/\/[a-z]+\.com\/$/)
                )
                  return null

                const Icon = socialIcons[platform]

                return (
                  <Link
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition-opacity"
                    style={titleColor ? { color: titleColor } : {}}
                  >
                    {Icon ? (
                      <Icon size={24} weight="fill" />
                    ) : (
                      <span className="text-sm uppercase tracking-widest">{platform}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sub-footer / copyright */}
      {copyright && (
        <div className="border-t border-white/10 py-4">
          <div className="container text-xs text-white/60 text-right">
            {copyright.replace('{{year}}', new Date().getFullYear().toString())}
          </div>
        </div>
      )}
    </footer>
  )
}
