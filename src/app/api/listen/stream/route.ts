import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

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

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = req.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.json({ error: 'Missing token.' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const db = payload.db.drizzle

    // Verify this token belongs to a song in the listener's group
    const songResult = await db.execute(
      `SELECT s.id, cs.filename FROM lc_songs s
       JOIN compilation_songs cs ON cs.id = s.song_file_id
       JOIN lc_group_songs gs ON gs.song_id = s.id
       JOIN lc_group_members gm ON gm.group_id = gs.group_id
       JOIN listening_committee lc ON lc.id = gm.listener_id
       WHERE s.anon_token = '${token}' AND lc.better_auth_id = '${session.user.id}'
       LIMIT 1`,
    )

    if (!songResult.rows.length) {
      return NextResponse.json({ error: 'Song not found in your group.' }, { status: 404 })
    }

    const song = songResult.rows[0] as { id: number; filename: string }

    const command = new GetObjectCommand({
      Bucket: process.env.B2_SUBMISSION_SONGS!,
      Key: `2025/${song.filename}`,
    })

    const url = await getSignedUrl(s3, command, { expiresIn: 300 })
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[/api/listen/stream] Error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
