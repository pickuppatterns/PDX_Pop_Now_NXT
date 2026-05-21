import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import { Pool } from 'pg'
import { decode } from 'html-entities'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const WP_BASE = 'https://pdxpopnow.com/wp-json/wp/v2'

function clean(text: string): string {
  return decode(text).trim()
}

// Extract artist name from content
function extractArtistName(html: string): string | null {
  // Pattern: "Layout & Design ArtistName" or just prominent name
  const stripped = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const decoded = decode(stripped)

  // Try "Layout & Design Name" pattern
  const layoutMatch = decoded.match(
    /Layout\s*(?:&|and)\s*Design\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  )
  if (layoutMatch) return clean(layoutMatch[1])

  // Try "Artwork: Name" pattern
  const artworkMatch = decoded.match(/Artwork:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i)
  if (artworkMatch) return clean(artworkMatch[1])

  return null
}

// Extract bio text — paragraphs after artist name
function extractBio(html: string): string | null {
  const stripped = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')

  const decoded = decode(stripped)
  const lines = decoded
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  // Find lines that look like biography text (longer sentences)
  const bioLines = lines.filter(
    (line) =>
      line.length > 60 &&
      !line.match(/^(Layout|Design|Artwork|Festival|Graphic|Artist|\d{4})/i) &&
      !line.match(/^@/),
  )

  return bioLines.length > 0 ? bioLines.join(' ') : null
}

// Extract social handles
function extractSocialHandle(
  html: string,
): { platform: string; handle: string; url: string } | null {
  const stripped = decode(html.replace(/<[^>]+>/g, ' '))

  // Instagram handle
  const igMatch = stripped.match(/@([\w.]+)/)
  if (igMatch) {
    return {
      platform: 'instagram',
      handle: `@${igMatch[1]}`,
      url: `https://www.instagram.com/${igMatch[1]}`,
    }
  }
  return null
}

// Fetch WP media URL
async function getMediaUrl(mediaId: number): Promise<{ url: string; filename: string } | null> {
  if (!mediaId) return null
  try {
    const res = await fetch(`${WP_BASE}/media/${mediaId}?_fields=source_url`)
    if (!res.ok) return null
    const data = await res.json()
    const url = data.source_url
    if (!url) return null
    const filename =
      url
        .split('/')
        .pop()
        ?.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1') ?? ''
    return { url, filename }
  } catch {
    return null
  }
}

async function migrate() {
  const payload = await getPayload({ config })

  console.log('Fetching festival graphic artist posts from WordPress...\n')

  const res = await fetch(
    `${WP_BASE}/posts?categories=96&per_page=100&orderby=date&order=asc&_fields=id,slug,title,content,date_gmt,featured_media`,
  )
  const posts = await res.json()
  console.log(`Found ${posts.length} festival graphic artist posts\n`)

  // Build Payload media map
  const { docs: mediaRecords } = await payload.find({
    collection: 'media',
    limit: 10000,
    depth: 0,
    overrideAccess: true,
  })
  const mediaMap = new Map<string, any>()
  for (const record of mediaRecords) {
    if (record.filename) mediaMap.set(record.filename as string, record)
  }

  // Build compilations map by year for relationship linking
  const { docs: compilations } = await payload.find({
    collection: 'compilations',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  const compilationsByYear = new Map<number, any>()
  for (const comp of compilations) {
    if (comp.year) compilationsByYear.set(comp.year as number, comp)
  }

  const results = { success: 0, skipped: 0, failed: 0 }

  for (const post of posts) {
    const slug = post.slug
    const title = clean(post.title.rendered)
    const html = post.content.rendered

    // Check if already migrated
    const existing = await payload.find({
      collection: 'festival-gfx-artists',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length) {
      console.log(`↺ Skipping (exists): ${slug}`)
      results.skipped++
      continue
    }

    console.log(`Processing: ${slug}`)

    try {
      // Extract year from slug
      const yearMatch = slug.match(/(\d{4})/)
      const year = yearMatch ? parseInt(yearMatch[1]) : null

      // Extract data
      const artistName = extractArtistName(html) ?? title
      const bio = extractBio(html)
      const socialHandle = extractSocialHandle(html)

      // Find featured image in Payload
      let featuredImageId: number | null = null
      if (post.featured_media) {
        const mediaInfo = await getMediaUrl(post.featured_media)
        if (mediaInfo?.filename) {
          const record = mediaMap.get(mediaInfo.filename)
          if (record) featuredImageId = record.id
        }
      }

      // Find associated compilation
      const compilation = year ? compilationsByYear.get(year) : null

      console.log(
        `  Year: ${year}, Artist: ${artistName}, Bio: ${bio ? '✓' : '✗'}, Image: ${featuredImageId ? '✓' : '✗'}, Compilation: ${compilation ? '✓' : '✗'}`,
      )

      const created = await payload.create({
        collection: 'festival-gfx-artists',
        data: {
          artistName,
          year: year ?? 0,
          slug,
          featuredImage: featuredImageId ?? undefined,
          compilationVolume: compilation?.id ?? undefined,
          bio: bio
            ? {
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
                          text: bio,
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
              }
            : undefined,
          socialLinks: socialHandle
            ? [
                {
                  platform: socialHandle.platform,
                  url: socialHandle.url,
                  handle: socialHandle.handle,
                },
              ]
            : [],
        } as any,
        overrideAccess: true,
        context: { disableRevalidate: true },
      })

      // Backfill original WP date
      if (post.date_gmt) {
        const originalDate = new Date(post.date_gmt + 'Z').toISOString()
        await pool.query(
          'UPDATE festival_gfx_artists SET created_at = $1, updated_at = $2 WHERE id = $3',
          [originalDate, originalDate, created.id],
        )
      }

      console.log(`  ✓ Created: ${artistName}`)
      results.success++
    } catch (err: any) {
      console.error(`  ✗ Failed: ${slug} — ${err.message}`)
      results.failed++
    }

    await new Promise((r) => setTimeout(r, 200))
  }

  await pool.end()

  console.log('\n--- Summary ---')
  console.log(`✓ Success: ${results.success}`)
  console.log(`↺ Skipped: ${results.skipped}`)
  console.log(`✗ Failed:  ${results.failed}`)

  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
