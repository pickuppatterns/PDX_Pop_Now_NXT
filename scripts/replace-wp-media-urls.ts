import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Strip WP resize suffix and get base filename
function getBaseFilename(url: string): string {
  const filename = url.split('/').pop() ?? ''
  // Remove WP resize suffix like -819x1024 before extension
  return filename.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1')
}

async function replace() {
  const payload = await getPayload({ config })

  // Fetch all Payload media records — build filename → URL map
  console.log('Building media URL map...')
  const { docs: mediaRecords } = await payload.find({
    collection: 'media',
    limit: 10000,
    overrideAccess: true,
    depth: 0,
  })

  const mediaMap = new Map<string, string>()
  for (const record of mediaRecords) {
    if (record.filename && record.url) {
      mediaMap.set(record.filename as string, record.url as string)
    }
  }
  console.log(`Media map built with ${mediaMap.size} entries`)

  // Get all content blocks with WP URLs
  const { rows: blocks } = await pool.query(
    `SELECT id, rich_text FROM pages_blocks_content_columns 
     WHERE rich_text::text LIKE '%pdxpopnow.com/wp-content%'`,
  )

  console.log(`\nFound ${blocks.length} blocks with WP URLs\n`)

  let totalReplaced = 0
  let totalNotFound = 0

  for (const block of blocks) {
    let richText = JSON.stringify(block.rich_text)
    const wpUrls =
      richText.match(/https?:\/\/pdxpopnow\.com\/wp-content\/uploads\/[^\s"'\\]+/g) ?? []

    const uniqueUrls = [...new Set(wpUrls)]
    let blockReplaced = 0
    let blockNotFound = 0

    for (const wpUrl of uniqueUrls) {
      const baseFilename = getBaseFilename(wpUrl)
      const b2Url = mediaMap.get(baseFilename)

      if (b2Url) {
        // Escape special regex chars in the URL
        const escaped = wpUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        richText = richText.replace(new RegExp(escaped, 'g'), b2Url)
        console.log(`  ✓ ${baseFilename}`)
        blockReplaced++
        totalReplaced++
      } else {
        console.log(`  ⚠ Not found in Payload: ${baseFilename}`)
        blockNotFound++
        totalNotFound++
      }
    }

    // Update the block in the database
    if (blockReplaced > 0) {
      await pool.query(`UPDATE pages_blocks_content_columns SET rich_text = $1 WHERE id = $2`, [
        JSON.parse(richText),
        block.id,
      ])
      console.log(
        `  → Updated block ${block.id} (${blockReplaced} replaced, ${blockNotFound} not found)\n`,
      )
    }
  }

  await pool.end()

  console.log('\n--- Summary ---')
  console.log(`✓ URLs replaced:  ${totalReplaced}`)
  console.log(`⚠ Not found:      ${totalNotFound}`)

  process.exit(0)
}

replace().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
