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

  // Fetch site settings
  const payload = await getPayload({ config })
  const siteSettings = await payload
    .findGlobal({
      slug: 'site-settings',
      depth: 1,
    })
    .catch(() => null)

  const favicon =
    siteSettings?.favicon &&
    typeof siteSettings.favicon === 'object' &&
    'url' in siteSettings.favicon
      ? (siteSettings.favicon.url as string)
      : null

  const customCSS = siteSettings?.customCSS ?? null
  const siteTitle = siteSettings?.siteTitle ?? 'PDX Pop Now!'

  const colors = siteSettings?.colors as Record<string, string> | undefined
  const cssVars = colors
    ? `
    :root {
      ${colors.brandColor ? `--color-brand: ${colors.brandColor};` : ''}
      ${colors.gradientColor1 ? `--color-gradient-1: ${colors.gradientColor1};` : ''}
      ${colors.gradientColor2 ? `--color-gradient-2: ${colors.gradientColor2};` : ''}
      ${colors.titleColor ? `--color-title: ${colors.titleColor};` : ''}
      ${colors.primaryTextColor ? `--color-text-primary: ${colors.primaryTextColor};` : ''}
      ${colors.secondaryTextColor ? `--color-text-secondary: ${colors.secondaryTextColor};` : ''}
      ${colors.contentBackgroundColor ? `--color-content-bg: ${colors.contentBackgroundColor};` : ''}
    }
  `
    : ''

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        {favicon ? (
          <link href={favicon} rel="icon" />
        ) : (
          <>
            <link href="/favicon.ico" rel="icon" sizes="32x32" />
            <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
          </>
        )}
        {(cssVars || customCSS) && (
          <style dangerouslySetInnerHTML={{ __html: `${cssVars}${customCSS ?? ''}` }} />
        )}
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
