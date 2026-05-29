import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Not logged in. Please sign in to vote.' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const db = payload.db.drizzle

    // Find listener by Better Auth ID
    const listenerResult = await db.execute(
      `SELECT id, first_name, last_name FROM listening_committee WHERE better_auth_id = '${session.user.id}' AND status = 'active' LIMIT 1`,
    )

    if (!listenerResult.rows.length) {
      return NextResponse.json(
        { error: 'You are not registered as a listening committee member.' },
        { status: 403 },
      )
    }

    const listener = listenerResult.rows[0] as { id: number; first_name: string; last_name: string }

    // Find their group
    const groupResult = await db.execute(
      `SELECT g.id, g.name FROM lc_groups g
       JOIN lc_group_members gm ON gm.group_id = g.id
       WHERE gm.listener_id = ${listener.id}
       LIMIT 1`,
    )

    if (!groupResult.rows.length) {
      return NextResponse.json(
        { error: 'You have not been assigned to a group yet.' },
        { status: 403 },
      )
    }

    const group = groupResult.rows[0] as { id: number; name: string }

    // Get songs in their group with existing votes
    const songsResult = await db.execute(
      `SELECT 
        s.id,
        s.anon_token,
        s.original_filename,
        v.vote as existing_vote
       FROM lc_group_songs gs
       JOIN lc_songs s ON s.id = gs.song_id
       LEFT JOIN lc_votes v ON v.song_id = s.id AND v.listener_id = ${listener.id}
       WHERE gs.group_id = ${group.id}
       ORDER BY s.id`,
    )

    const songs = (songsResult.rows as any[]).map((row, i) => ({
      id: row.id,
      anonToken: row.anon_token,
      groupName: group.name,
      position: i + 1,
      total: songsResult.rows.length,
      existingVote: row.existing_vote ?? null,
    }))

    return NextResponse.json({ songs, groupName: group.name, listenerId: listener.id })
  } catch (err) {
    console.error('[/api/listen/queue] Error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
