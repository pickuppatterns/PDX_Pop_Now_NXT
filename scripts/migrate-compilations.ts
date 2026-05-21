import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import { Pool } from 'pg'
import { decode } from 'html-entities'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const WP_BASE = 'https://pdxpopnow.com/wp-json/wp/v2'

// Decode HTML entities and clean text
function clean(text: string): string {
  return decode(text).trim()
}

// Extract Bandcamp embed URL from iframe src
function extractBandcampUrl(html: string): string | null {
  const match = html.match(/bandcamp\.com\/EmbeddedPlayer\/album=(\d+)/)
  if (!match) return null
  return `https://bandcamp.com/album/${match[1]}`
}

// Extract Bandcamp album URL from anchor tag
function extractBandcampAlbumUrl(html: string): string | null {
  const match = html.match(/href="(https:\/\/[a-z]+\.bandcamp\.com\/album\/[^"]+)"/)
  return match ? match[1] : null
}

// Extract artwork credit from HTML
function extractArtworkCredit(html: string): string | null {
  const match = html.match(/Layout\s*(?:&#038;|&amp;|&)\s*Design\s*<br\s*\/?>\s*([^<]+)/i)
  if (match) return clean(match[1])
  const match2 = html.match(/Artwork:\s*([^<\n]+)/i)
  return match2 ? clean(match2[1]) : null
}

// Parse track listing from HTML
function parseTracks(
  html: string,
): { number: number; disc: string; artist: string; title: string }[] {
  const tracks: { number: number; disc: string; artist: string; title: string }[] = []

  // Strip HTML tags except keep disc markers
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')

  const decoded = decode(text)
  const lines = decoded
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  let currentDisc = '1'
  let trackNumber = 1

  for (const line of lines) {
    // Detect disc markers
    if (/^disc\s*one/i.test(line)) {
      currentDisc = '1'
      trackNumber = 1
      continue
    }
    if (/^disc\s*two/i.test(line)) {
      currentDisc = '2'
      trackNumber = 1
      continue
    }
    if (/^disc\s*three/i.test(line)) {
      currentDisc = '3'
      trackNumber = 1
      continue
    }
    if (/^disc\s*1/i.test(line)) {
      currentDisc = '1'
      trackNumber = 1
      continue
    }
    if (/^disc\s*2/i.test(line)) {
      currentDisc = '2'
      trackNumber = 1
      continue
    }

    // Match track: "Artist – Title" or "Artist - Title"
    const trackMatch = line.match(/^(.+?)\s*[–—-]\s*(.+)$/)
    if (trackMatch) {
      const artist = clean(trackMatch[1])
      const title = clean(trackMatch[2])

      // Skip obvious non-tracks
      if (
        artist.length < 2 ||
        title.length < 2 ||
        /^(layout|design|artwork|track|disc|buy|available|vol\.)/i.test(artist)
      )
        continue

      tracks.push({ number: trackNumber++, disc: currentDisc, artist, title })
    }
  }

  return tracks
}

// Fetch featured media URL from WP
async function getMediaUrl(mediaId: number): Promise<string | null> {
  if (!mediaId) return null
  try {
    const res = await fetch(`${WP_BASE}/media/${mediaId}?_fields=source_url`)
    if (!res.ok) return null
    const data = await res.json()
    return data.source_url ?? null
  } catch {
    return null
  }
}

async function migrate() {
  const payload = await getPayload({ config })

  // Fetch all compilation posts
  console.log('Fetching compilation posts from WordPress...\n')
  const res = await fetch(
    `${WP_BASE}/posts?categories=91&per_page=100&orderby=date&order=asc&_fields=id,slug,title,content,date_gmt,featured_media`,
  )
  const posts = await res.json()
  console.log(`Found ${posts.length} compilation posts\n`)

  // Fetch all Payload media for URL lookup
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

  // Get or create compilations category
  const catResult = await payload.find({
    collection: 'categories',
    where: { title: { equals: 'Compilations' } },
    limit: 1,
    overrideAccess: true,
  })
  let compilationsCategoryId: number | null = null
  if (catResult.docs.length) {
    compilationsCategoryId = catResult.docs[0].id as number
  } else {
    const newCat = await payload.create({
      collection: 'categories',
      data: { title: 'Compilations', slug: 'compilations' },
      draft: false,
      overrideAccess: true,
    })
    compilationsCategoryId = newCat.id as number
    console.log('Created Compilations category')
  }

  const results = { success: 0, skipped: 0, failed: 0 }

  for (const post of posts) {
    const slug = post.slug
    const title = clean(post.title.rendered)
    const html = post.content.rendered

    // Check if already migrated
    const existing = await payload.find({
      collection: 'posts',
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
      // Extract data
      const tracks = parseTracks(html)
      const bandcampUrl = extractBandcampAlbumUrl(html) ?? extractBandcampUrl(html)
      const artworkCredit = extractArtworkCredit(html)

      // Extract year and volume from slug/title
      const yearMatch = slug.match(/(\d{4})/)
      const year = yearMatch ? parseInt(yearMatch[1]) : null
      const volumeMap: Record<number, number> = {
        2004: 1,
        2005: 2,
        2006: 3,
        2007: 4,
        2008: 5,
        2009: 6,
        2010: 7,
        2011: 8,
        2012: 9,
        2013: 10,
        2014: 11,
        2015: 12,
        2016: 13,
        2017: 14,
        2018: 15,
        2019: 16,
        2020: 17,
        2021: 18,
        2022: 19,
        2023: 20,
        2024: 21,
      }
      const volume = year ? volumeMap[year] : null

      // Find artwork in Payload media
      let artworkId: number | null = null
      if (post.featured_media) {
        const wpMediaUrl = await getMediaUrl(post.featured_media)
        if (wpMediaUrl) {
          const filename = wpMediaUrl
            .split('/')
            .pop()
            ?.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1')
          if (filename) {
            const mediaRecord = mediaMap.get(filename)
            if (mediaRecord) artworkId = mediaRecord.id
          }
        }
      }

      // Build streaming links
      const streamingLinks = bandcampUrl
        ? [{ platform: 'bandcamp', url: bandcampUrl, label: 'Listen on Bandcamp' }]
        : []

      // Build album notes
      const notes = artworkCredit ? `Artwork: Layout & Design — ${artworkCredit}` : null

      console.log(
        `  Year: ${year}, Volume: ${volume}, Tracks: ${tracks.length}, Bandcamp: ${bandcampUrl ? '✓' : '✗'}`,
      )

      // Create the post with CompilationBlock in content
      const created = await payload.create({
        collection: 'posts',
        data: {
          title,
          slug,
          categories: compilationsCategoryId ? [compilationsCategoryId] : [],
          publishedAt: new Date(post.date_gmt + 'Z').toISOString(),
          _status: 'published',
          heroImage: artworkId ?? undefined,
          content: {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [
                {
                  type: 'block',
                  version: 1,
                  fields: {
                    blockType: 'compilation',
                    title,
                    volume,
                    year,
                    artwork: artworkId,
                    tracks,
                    streamingLinks,
                    description: notes
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
                                    text: notes,
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
                  },
                },
              ],
            },
          },
        } as any,
        overrideAccess: true,
        context: { disableRevalidate: true },
      })

      // Backfill original WP date
      if (post.date_gmt) {
        const originalDate = new Date(post.date_gmt + 'Z').toISOString()
        await pool.query('UPDATE posts SET created_at = $1, updated_at = $2 WHERE id = $3', [
          originalDate,
          originalDate,
          created.id,
        ])
      }

      console.log(`  ✓ Created: ${title} (${tracks.length} tracks)`)
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
