import { getCachedGlobal } from '@/utilities/getGlobals'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

const socialIcons: Record<string, string> = {
  facebook: 'f',
  instagram: '📷',
  twitter: '𝕏',
  youtube: '▶',
  vimeo: 'v',
  linkedin: 'in',
  bandcamp: 'bc',
  soundcloud: 'sc',
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
                // Skip empty, null, or placeholder-only URLs
                if (
                  !url ||
                  url === `http://${platform}.com/` ||
                  url.match(/^https?:\/\/[a-z]+\.com\/$/)
                )
                  return null
                return (
                  <Link
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm uppercase tracking-widest hover:opacity-70 transition-opacity"
                    style={titleColor ? { color: titleColor } : {}}
                  >
                    {platform}
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
          <div
            className="container text-xs text-white/60"
            dangerouslySetInnerHTML={{ __html: copyright }}
          />
        </div>
      )}
    </footer>
  )
}
