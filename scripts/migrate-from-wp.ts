import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const WP_BASE = 'https://pdxpopnow.com/wp-json/wp/v2'

// Pages to migrate — WP slug → Payload slug
const PAGES_TO_MIGRATE = [
  { wpSlug: 'about', title: 'About' },
  { wpSlug: 'contact', title: 'Contact' },
  { wpSlug: 'events', title: 'Events' },
  { wpSlug: 'festival-graphic-artist', title: 'Festival Graphic Artist' },
  { wpSlug: 'home', title: 'Home' },
  { wpSlug: 'info', title: 'Info' },
  { wpSlug: 'lineup', title: 'Lineup' },
  { wpSlug: 'listening-committee', title: 'Listening Committee' },
  { wpSlug: 'open-positions', title: 'Open Positions' },
  { wpSlug: 'outreach', title: 'Outreach' },
  { wpSlug: 'schedule', title: 'Schedule' },
  { wpSlug: 'sponsorship', title: 'Sponsorship' },
  { wpSlug: 'submission', title: 'Submission' },
  { wpSlug: 'the-board', title: 'The Board & Coordinators' },
  { wpSlug: 'the-cd', title: 'The Compilation CDs' },
  { wpSlug: 'volunteer', title: 'Volunteer' },
]

// Strip WP shortcodes and Visual Composer markup
function cleanContent(html: string): string {
  return (
    html
      // Remove Visual Composer shortcodes
      .replace(/\[vc_[^\]]*\]/g, '')
      .replace(/\[\/vc_[^\]]*\]/g, '')
      // Remove other shortcodes
      .replace(/\[[^\]]+\]/g, '')
      // Remove inline styles
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      // Remove WP block comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Clean up empty paragraphs
      .replace(/<p>\s*<\/p>/g, '')
      // Trim whitespace
      .trim()
  )
}

async function fetchWPPage(slug: string) {
  const res = await fetch(`${WP_BASE}/pages?slug=${slug}&_fields=id,title,content,slug,status`)
  if (!res.ok) throw new Error(`Failed to fetch WP page: ${slug}`)
  const pages = await res.json()
  return pages[0] ?? null
}

async function migrate() {
  const payload = await getPayload({ config })

  console.log('Starting WordPress → Payload migration...\n')

  const results = {
    success: [] as string[],
    skipped: [] as string[],
    failed: [] as string[],
  }

  for (const page of PAGES_TO_MIGRATE) {
    try {
      console.log(`Fetching: ${page.wpSlug}...`)
      const wpPage = await fetchWPPage(page.wpSlug)

      if (!wpPage) {
        console.log(`  ⚠ Not found in WordPress — skipping\n`)
        results.skipped.push(page.wpSlug)
        continue
      }

      if (wpPage.content?.protected) {
        console.log(`  ⚠ Content is password-protected — skipping\n`)
        results.skipped.push(page.wpSlug)
        continue
      }

      const rawContent = wpPage.content?.rendered ?? ''
      const cleanedContent = cleanContent(rawContent)

      // Check if page already exists in Payload
      const existing = await payload.find({
        collection: 'pages',
        where: { slug: { equals: page.wpSlug } },
        overrideAccess: true,
        limit: 1,
      })

      if (existing.docs.length > 0) {
        console.log(`  ↺ Already exists — updating\n`)
        await payload.update({
          collection: 'pages',
          id: existing.docs[0].id,
          data: {
            title: page.title,
            hero: {
              type: 'none',
            },
            layout: [
              {
                blockType: 'content',
                columns: [
                  {
                    size: 'full',
                    richText: {
                      root: {
                        type: 'root',
                        children: [
                          {
                            type: 'paragraph',
                            children: [{ text: cleanedContent, type: 'text' }],
                            version: 1,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        version: 1,
                      },
                    },
                  },
                ],
              },
            ],
          },
          context: { disableRevalidate: true },
          overrideAccess: true,
        })
        results.success.push(page.wpSlug)
        continue
      }

      // Create new page in Payload
      await payload.create({
        collection: 'pages',
        data: {
          title: page.title,
          slug: page.wpSlug,
          _status: 'published',
          hero: {
            type: 'none',
          },
          layout: [
            {
              blockType: 'content',
              columns: [
                {
                  size: 'full',
                  richText: {
                    root: {
                      type: 'root',
                      children: [
                        {
                          type: 'paragraph',
                          children: [{ text: cleanedContent, type: 'text' }],
                          version: 1,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      version: 1,
                    },
                  },
                },
              ],
            },
          ],
        },
        context: { disableRevalidate: true },
        overrideAccess: true,
      })

      console.log(`  ✓ Created: ${page.title}\n`)
      results.success.push(page.wpSlug)
    } catch (err) {
      console.error(`  ✗ Failed: ${page.wpSlug}`, err)
      results.failed.push(page.wpSlug)
    }
  }

  console.log('\n--- Migration Summary ---')
  console.log(`✓ Success: ${results.success.length} — ${results.success.join(', ')}`)
  console.log(`⚠ Skipped: ${results.skipped.length} — ${results.skipped.join(', ')}`)
  console.log(`✗ Failed:  ${results.failed.length} — ${results.failed.join(', ')}`)

  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
