import type { Metadata } from 'next'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'
import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  const payload = await getPayload({ config })

  const siteSettings = await payload
    .findGlobal({ slug: 'site-settings', depth: 1 })
    .catch(() => null)

  const customFonts = await payload
    .find({ collection: 'fonts', limit: 100, depth: 1 })
    .then((r) => r.docs as any[])
    .catch(() => [] as any[])

  const favicon =
    siteSettings?.favicon &&
    typeof siteSettings.favicon === 'object' &&
    'url' in siteSettings.favicon
      ? (siteSettings.favicon.url as string)
      : null

  const customCSS = siteSettings?.customCSS ?? null
  const fonts = siteSettings?.fonts as Record<string, string> | undefined
  const colors = siteSettings?.colors as Record<string, string> | undefined

  // Google Fonts URL
  const fontFamilies = fonts ? [...new Set(Object.values(fonts).filter(Boolean))] : ['Inter']

  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontFamilies
    .map((f) => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700`)
    .join('&')}&display=swap`

  // @font-face for custom uploaded fonts
  const fontFaceCSS = customFonts
    .map((font) => {
      const file =
        font.file && typeof font.file === 'object' && 'url' in font.file
          ? (font.file.url as string)
          : null
      if (!file) return ''
      return `@font-face {
  font-family: '${font.fontFamily}';
  src: url('${file}');
  font-weight: ${font.weight ?? '400'};
  font-style: ${font.style ?? 'normal'};
  font-display: swap;
}`
    })
    .join('\n')

  // CSS variables for fonts
  const fontVars = fonts
    ? `:root {
    --font-title: '${fonts.titleFont ?? 'Inter'}', sans-serif;
    --font-text: '${fonts.textFont ?? 'Inter'}', sans-serif;
    --font-footer-title: '${fonts.footerTitleFont ?? 'Inter'}', sans-serif;
    --font-footer-text: '${fonts.footerTextFont ?? 'Inter'}', sans-serif;
  }`
    : ''

  // CSS variables for colors
  const cssVars = colors
    ? `:root {
      ${colors.brandColor ? `--color-brand: ${colors.brandColor};` : ''}
      ${colors.gradientColor1 ? `--color-gradient-1: ${colors.gradientColor1};` : ''}
      ${colors.gradientColor2 ? `--color-gradient-2: ${colors.gradientColor2};` : ''}
      ${colors.titleColor ? `--color-title: ${colors.titleColor};` : ''}
      ${colors.primaryTextColor ? `--color-text-primary: ${colors.primaryTextColor};` : ''}
      ${colors.secondaryTextColor ? `--color-text-secondary: ${colors.secondaryTextColor};` : ''}
      ${colors.contentBackgroundColor ? `--color-content-bg: ${colors.contentBackgroundColor};` : ''}
    }`
    : ''

  const allStyles = [fontFaceCSS, cssVars, fontVars, customCSS ?? ''].filter(Boolean).join('\n')

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontsUrl} rel="stylesheet" />
        {favicon ? (
          <link href={favicon} rel="icon" />
        ) : (
          <>
            <link href="/favicon.ico" rel="icon" sizes="32x32" />
            <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
          </>
        )}
        {allStyles && <style dangerouslySetInnerHTML={{ __html: allStyles }} />}
      </head>
      <body>
        <Providers>
          <AdminBar adminBarProps={{ preview: isEnabled }} />
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config })
  const siteSettings = await payload
    .findGlobal({ slug: 'site-settings', depth: 0 })
    .catch(() => null)

  const siteTitle = siteSettings?.siteTitle ?? 'PDX Pop Now!'
  const tagline = siteSettings?.tagline ?? 'Free. All-ages. All-local. Portland music.'

  return {
    metadataBase: new URL(getServerSideURL()),
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description: tagline,
    openGraph: mergeOpenGraph({
      siteName: siteTitle,
      title: siteTitle,
      description: tagline,
    }),
    twitter: {
      card: 'summary_large_image',
      creator: '@pdxpopnow',
    },
  }
}
