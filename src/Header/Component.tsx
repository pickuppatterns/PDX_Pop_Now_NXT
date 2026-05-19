import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getPayload } from 'payload'
import config from '@/payload.config'
import React from 'react'

export async function Header() {
  const headerData = await getCachedGlobal('header', 1)()

  const payload = await getPayload({ config })
  const siteSettings = await payload
    .findGlobal({
      slug: 'site-settings',
      depth: 1,
    })
    .catch(() => null)

  const logo =
    siteSettings?.logo && typeof siteSettings.logo === 'object' && 'url' in siteSettings.logo
      ? { url: siteSettings.logo.url as string, alt: siteSettings.siteTitle ?? 'Site Logo' }
      : null

  return <HeaderClient data={headerData} logo={logo} />
}
