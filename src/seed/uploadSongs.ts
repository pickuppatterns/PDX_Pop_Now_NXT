import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getPayload } from 'payload'
import config from '../payload.config'

const SONGS_DIR = path.resolve(process.env.HOME!, 'Desktop/Songs')
const YEAR = 2025
const PREFIX = '2025'

const GENRES = [
  'classical',
  'country',
  'electronic',
  'experimental',
  'folk_americana',
  'hip_hop',
  'international',
  'rb_soul',
  'jazz',
  'metal_hardcore',
  'pop',
  'post_punk',
  'rock_alt_punk',
  'indie_rock_pop',
  'goth_darkwave',
]

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
  region: process.env.B2_BUCKET_REGION!,
  endpoint: `https://${process.env.B2_ENDPOINT}`,
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

const BUCKET = process.env.B2_SUBMISSION_SONGS!

async function uploadSongs() {
  const payload = await getPayload({ config })

  const files = fs.readdirSync(SONGS_DIR).filter((f) => f.toLowerCase().endsWith('.mp3'))
  console.log(`Found ${files.length} MP3 files`)

  let success = 0
  let failed = 0

  for (const file of files) {
    const filePath = path.join(SONGS_DIR, file)
    const fileBuffer = fs.readFileSync(filePath)
    const fileSize = fs.statSync(filePath).size
    const anonToken = crypto.randomUUID()
    const shortToken = anonToken.slice(0, 8)
    const safeFilename = file.replace(/[^a-zA-Z0-9._\-() ]/g, '_')
    const b2Key = `${PREFIX}/${shortToken}_${safeFilename}`
    const b2Url = `https://${process.env.B2_ENDPOINT}/${BUCKET}/${b2Key}`
    const db = payload.db.drizzle // 👈 declare once here

    try {
      // 1. Upload to B2
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: b2Key,
          Body: fileBuffer,
          ContentType: 'audio/mpeg',
        }),
      )
      console.log(`☁️ B2 upload complete: ${b2Key}`)

      // 2. Create compilation_songs record directly
      const songResult = await db.execute(`
  INSERT INTO compilation_songs (alt, year, url, filename, mime_type, filesize, prefix, updated_at, created_at)
  VALUES ('${anonToken}', ${YEAR}, '${b2Url}', '${(shortToken + '_' + safeFilename).replace(/'/g, "''")}', 'audio/mpeg', ${fileSize}, '${PREFIX}', NOW(), NOW())
  RETURNING id
`)
      const songRecord = { id: (songResult.rows[0] as any).id }

      // 3. Create compilation_submissions record
      const submission = await payload.create({
        collection: 'compilation-submissions',
        data: {
          artistName: path.basename(file, '.mp3'),
          songTitle: path.basename(file, '.mp3'),
          genre: GENRES[Math.floor(Math.random() * GENRES.length)],
          releaseStatus: 'self_released',
          radioAppropriate: 'radio_friendly',
          affiliation: 'other',
          firstName: 'Uploaded',
          lastName: 'Song',
          email: `upload+${anonToken.slice(0, 8)}@pdxpopnow.com`,
          phone: '0000000000',
          status: 'selected',
          selectedForCompilation: true,
          trackUrl: b2Url,
          trackFilename: `${shortToken}_${safeFilename}`,
          agreementAccepted: true,
          agreementTimestamp: new Date().toISOString(),
          agreementVersion: '2026-v1',
          agreementIp: '127.0.0.1',
        } as any,
        overrideAccess: true,
        context: { disableRevalidate: true },
      })

      // 4. Create lc_songs record
      await db.execute(`
        INSERT INTO lc_songs (submission_id, song_file_id, anon_token, original_filename, year)
        VALUES ('${submission.id}', ${songRecord.id}, '${anonToken}', '${file.replace(/'/g, "''")}', ${YEAR})
      `)

      console.log(`✅ ${file} → ${shortToken}_${safeFilename}`)
      success++
    } catch (err) {
      console.error(`❌ ${file}:`, err)
      failed++
    }
  }

  console.log(`\nDone. ${success} uploaded, ${failed} failed.`)
  process.exit(0)
}

uploadSongs().catch((err) => {
  console.error(err)
  process.exit(1)
})
