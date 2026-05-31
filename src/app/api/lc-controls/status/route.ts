import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

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

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const payload = await getPayload({ config })
    const db = payload.db.drizzle

    // Get most recent year in lc_songs
    const yearResult = await db.execute(`SELECT MAX(year) as year FROM lc_songs`)
    const year = (yearResult.rows[0] as any)?.year ?? new Date().getFullYear()

    // Count B2 files in submission-songs/{year}
    let b2SongCount = 0
    try {
      const b2Result = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.B2_SUBMISSION_SONGS!,
          Prefix: `${year}/`,
        }),
      )
      b2SongCount = b2Result.KeyCount ?? 0
    } catch (err) {
      console.warn('[lc-controls/status] B2 list failed:', err instanceof Error ? err.message : err)
    }

    // Songs in DB
    const songsResult = await db.execute(
      `SELECT COUNT(*) as count FROM lc_songs WHERE year = ${year}`,
    )
    const songsInApp = Number((songsResult.rows[0] as any)?.count ?? 0)

    // Peaks generated
    const peaksResult = await db.execute(
      `SELECT COUNT(*) as count FROM lc_songs WHERE year = ${year} AND peaks IS NOT NULL`,
    )
    const peaksGenerated = Number((peaksResult.rows[0] as any)?.count ?? 0)

    // Active listeners
    const listenersResult = await db.execute(
      `SELECT COUNT(*) as count FROM listening_committee WHERE status = 'active'`,
    )
    const activeListeners = Number((listenersResult.rows[0] as any)?.count ?? 0)

    // Listeners in groups
    const listenersInGroupsResult = await db.execute(
      `SELECT COUNT(DISTINCT listener_id) as count FROM lc_group_members gm JOIN lc_groups g ON g.id = gm.group_id WHERE g.year = ${year}`,
    )
    const listenersInGroups = Number((listenersInGroupsResult.rows[0] as any)?.count ?? 0)

    // Groups assigned
    const groupsResult = await db.execute(
      `SELECT COUNT(*) as count, SUM(song_count) as songs FROM (SELECT g.id, COUNT(gs.song_id) as song_count FROM lc_groups g JOIN lc_group_songs gs ON gs.group_id = g.id WHERE g.year = ${year} AND g.round = 1 GROUP BY g.id) sub`,
    )
    const groupCount = Number((groupsResult.rows[0] as any)?.count ?? 0)
    const songsAssigned = Number((groupsResult.rows[0] as any)?.songs ?? 0)

    // Round 1 votes
    const votesResult = await db.execute(`
      SELECT COUNT(*) as count FROM lc_votes v
      JOIN lc_songs s ON s.id = v.song_id
      WHERE s.year = ${year} AND s.round = 1
    `)
    const totalVotes = Number((votesResult.rows[0] as any)?.count ?? 0)

    // Check if all listeners have voted on all their songs
    const round1CompleteResult = await db.execute(`
      SELECT 
        COUNT(DISTINCT gm.listener_id) FILTER (
          WHERE (
            SELECT COUNT(*) FROM lc_votes v 
            JOIN lc_group_songs gs ON gs.song_id = v.song_id 
            WHERE v.listener_id = gm.listener_id AND gs.group_id = gm.group_id
          ) = (
            SELECT COUNT(*) FROM lc_group_songs gs2 WHERE gs2.group_id = gm.group_id
          )
        ) as completed,
        COUNT(DISTINCT gm.listener_id) as total
      FROM lc_group_members gm
      JOIN lc_groups g ON g.id = gm.group_id
      WHERE g.year = ${year} AND g.round = 1
    `)
    const round1Completed = Number((round1CompleteResult.rows[0] as any)?.completed ?? 0)
    const round1Total = Number((round1CompleteResult.rows[0] as any)?.total ?? 0)
    const round1Complete = round1Total > 0 && round1Completed === round1Total

    // Round 2 exists
    const round2Result = await db.execute(
      `SELECT COUNT(*) as count FROM lc_groups WHERE year = ${year} AND round = 2`,
    )
    const round2Exists = Number((round2Result.rows[0] as any)?.count ?? 0) > 0

    return NextResponse.json({
      year,
      b2SongCount,
      songsInApp,
      peaksGenerated,
      activeListeners,
      listenersInGroups,
      groupCount,
      songsAssigned,
      totalVotes,
      round2Exists,
      round1Complete,
    })
  } catch (err) {
    console.error('[/api/lc-controls/status] Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
