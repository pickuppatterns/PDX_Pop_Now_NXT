import { getPayload } from 'payload'
import { Pool } from 'pg'
import config from '../src/payload.config.js'
import path from 'path'
import { createWriteStream, mkdirSync, unlinkSync, existsSync } from 'fs'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'

const WP_BASE = 'https://pdxpopnow.com/wp-json/wp/v2'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const TEMP_DIR = '/tmp/wp-media-migration'

// Skip WP-generated resized copies like image-300x219.jpg
function isWPResizedCopy(filename: string): boolean {
  return /-\d+x\d+\.[a-z]+$/i.test(filename)
}

// Fetch all WP media pages
async function fetchAllWPMedia() {
  const allMedia: any[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const res = await fetch(
      `${WP_BASE}/media?per_page=100&page=${page}&_fields=id,source_url,slug,title,mime_type,date`,
    )

    if (!res.ok) {
      console.error(`Failed to fetch page ${page}:`, res.status)
      break
    }

    const total = res.headers.get('X-WP-TotalPages')
    if (total) totalPages = parseInt(total)

    const items = await res.json()
    allMedia.push(...items)

    console.log(`  Fetched page ${page}/${totalPages} (${items.length} items)`)
    page++

    // Small delay to be respectful to WP server
    await new Promise((r) => setTimeout(r, 200))
  }

  return allMedia
}

// Download file to temp directory
async function downloadFile(url: string, filename: string): Promise<string> {
  // Fix URLs with leading semicolons from WP
  const cleanUrl = url.replace(/^;/, '')

  const filepath = path.join(TEMP_DIR, filename)
  const res = await fetch(cleanUrl)
  if (!res.ok) throw new Error(`Failed to download ${cleanUrl}: ${res.status}`)

  const fileStream = createWriteStream(filepath)
  await pipeline(Readable.fromWeb(res.body as any), fileStream)

  return filepath
}

async function migrate() {
  // Ensure temp dir exists
  if (!existsSync(TEMP_DIR)) {
    mkdirSync(TEMP_DIR, { recursive: true })
  }

  const payload = await getPayload({ config })

  console.log('\nFetching all WordPress media...\n')
  const allMedia = await fetchAllWPMedia()

  console.log(`\nTotal WP media items: ${allMedia.length}`)

  // Filter out WP-generated resized copies
  const originals = allMedia.filter((item) => {
    const filename = path.basename(item.source_url)
    return !isWPResizedCopy(filename)
  })

  const skippedResized = allMedia.length - originals.length
  console.log(`Skipping ${skippedResized} WP-resized copies`)
  console.log(`Migrating ${originals.length} original files\n`)

  const results = {
    success: 0,
    skipped: 0,
    failed: 0,
    failedFiles: [] as string[],
  }

  for (let i = 0; i < originals.length; i++) {
    const item = originals[i]
    const filename = path.basename(item.source_url)
    const progress = `[${i + 1}/${originals.length}]`

    // Check if already migrated
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      console.log(`${progress} ↺ Already exists — skipping: ${filename}`)
      results.skipped++
      continue
    }

    let filepath: string | null = null

    try {
      console.log(`${progress} ↓ Downloading: ${filename}`)
      filepath = await downloadFile(item.source_url, filename)

      // Get file stats
      const { statSync } = await import('fs')
      const stats = statSync(filepath)

      // Read file into buffer
      const { readFileSync } = await import('fs')
      const fileBuffer = readFileSync(filepath)

      // Upload to Payload (which sends to B2)
      const created = await payload.create({
        collection: 'media',
        data: {
          alt: item.title?.rendered ?? filename,
        },
        file: {
          data: fileBuffer,
          mimetype: item.mime_type,
          name: filename,
          size: stats.size,
        },
        overrideAccess: true,
        context: { disableRevalidate: true },
      })

      // Backfill original WP creation date directly in Postgres
      if (item.date_gmt) {
        const originalDate = new Date(item.date_gmt + 'Z').toISOString()
        await pool.query(
          'UPDATE media SET created_at = $1, updated_at = $2 WHERE id = $3',
          [originalDate, originalDate, created.id]
        )
      }

      console.log(`${progress} ✓ Uploaded: ${filename}`)
      results.success++
    } catch (err: any) {
      console.error(`${progress} ✗ Failed: ${filename} — ${err.message}`)
      results.failed++
      results.failedFiles.push(filename)
    } finally {
      // Clean up temp file
      if (filepath && existsSync(filepath)) {
        try {
          unlinkSync(filepath)
        } catch (_err) { /* cleanup failure is non-fatal */ }
      }
    }

    // Small delay between uploads
    await new Promise((r) => setTimeout(r, 100))
  }

  console.log('\n--- Migration Summary ---')
  console.log(`✓ Success:  ${results.success}`)
  console.log(`↺ Skipped:  ${results.skipped}`)
  console.log(`✗ Failed:   ${results.failed}`)

  if (results.failedFiles.length > 0) {
    console.log('\nFailed files:')
    results.failedFiles.forEach((f) => console.log(`  - ${f}`))
  }

  await pool.end()
  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
