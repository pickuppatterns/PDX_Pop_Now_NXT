import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const slugs = [
  'about',
  'contact',
  'events',
  'info',
  'lineup',
  'listening-committee',
  'open-positions',
  'outreach',
  'schedule',
  'sponsorship',
  'submission',
  'the-board',
  'the-cd',
  'volunteer',
]

async function remigrate() {
  const payload = await getPayload({ config })

  for (const slug of slugs) {
    const res = await fetch(
      `https://pdxpopnow.com/wp-json/wp/v2/pages?slug=${slug}&_fields=id,slug,title,content`,
    )
    const pages = await res.json()

    if (!pages.length) {
      console.log(`⚠ Not found in WP: ${slug}`)
      continue
    }

    const wp = pages[0]
    const html = wp.content?.rendered ?? ''

    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      overrideAccess: true,
      limit: 1,
    })

    if (!existing.docs.length) {
      console.log(`⚠ No Payload page for: ${slug}`)
      continue
    }

    const pageId = existing.docs[0].id

    await payload.update({
      collection: 'pages',
      id: pageId,
      data: {
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                size: 'full',
                richText: {
                  root: {
                    type: 'root',
                    format: '',
                    indent: 0,
                    version: 1,
                    direction: 'ltr',
                    children: [
                      {
                        type: 'paragraph',
                        version: 1,
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        textFormat: 0,
                        children: [
                          {
                            type: 'text',
                            text: html,
                            version: 1,
                            format: 0,
                            detail: 0,
                            mode: 'normal',
                            style: '',
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
          },
        ],
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    })

    console.log(`✓ Re-migrated: ${slug}`)
  }

  process.exit(0)
}

remigrate().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
