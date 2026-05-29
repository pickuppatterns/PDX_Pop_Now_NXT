import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { songId, vote } = await req.json()

    if (!songId || !['like', 'dislike'].includes(vote)) {
      return NextResponse.json({ error: 'Invalid vote.' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const db = payload.db.drizzle

    // Get listener ID
    const listenerResult = await db.execute(
      `SELECT id FROM listening_committee WHERE better_auth_id = '${session.user.id}' LIMIT 1`,
    )

    if (!listenerResult.rows.length) {
      return NextResponse.json({ error: 'Listener not found.' }, { status: 403 })
    }

    const listenerId = (listenerResult.rows[0] as any).id

    // Verify song is in listener's group
    const verifyResult = await db.execute(
      `SELECT s.id FROM lc_songs s
       JOIN lc_group_songs gs ON gs.song_id = s.id
       JOIN lc_group_members gm ON gm.group_id = gs.group_id
       WHERE s.id = ${songId} AND gm.listener_id = ${listenerId}
       LIMIT 1`,
    )

    if (!verifyResult.rows.length) {
      return NextResponse.json({ error: 'Song not in your group.' }, { status: 403 })
    }

    // Upsert vote — last vote wins
    await db.execute(
      `INSERT INTO lc_votes (listener_id, song_id, vote, voted_at)
       VALUES (${listenerId}, ${songId}, '${vote}', NOW())
       ON CONFLICT (listener_id, song_id)
       DO UPDATE SET vote = '${vote}', voted_at = NOW()`,
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/listen/vote] Error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
