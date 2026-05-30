import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const db = payload.db.drizzle

    // Song votes per group
    const songResult = await db.execute(`
      SELECT
        g.id as group_id,
        g.name as group_name,
        s.id as song_id,
        s.original_filename,
        COUNT(CASE WHEN v.vote = 'like' THEN 1 END) as likes,
        COUNT(CASE WHEN v.vote = 'dislike' THEN 1 END) as dislikes,
        COUNT(v.id) as total_votes,
        COUNT(DISTINCT gm.listener_id) as total_listeners
      FROM lc_groups g
      JOIN lc_group_songs gs ON gs.group_id = g.id
      JOIN lc_songs s ON s.id = gs.song_id
      JOIN lc_group_members gm ON gm.group_id = g.id
      LEFT JOIN lc_votes v ON v.song_id = s.id AND v.listener_id = gm.listener_id
      WHERE g.round = 1
      GROUP BY g.id, g.name, s.id, s.original_filename
      ORDER BY g.name, likes DESC
    `)

    // Listener progress per group
    const progressResult = await db.execute(`
      SELECT
        g.id as group_id,
        lc.id as listener_id,
        lc.first_name,
        lc.last_name,
        lc.email,
        COUNT(DISTINCT gs.song_id) as total_songs,
        COUNT(DISTINCT v.song_id) as voted_songs
      FROM lc_groups g
      JOIN lc_group_members gm ON gm.group_id = g.id
      JOIN listening_committee lc ON lc.id = gm.listener_id
      JOIN lc_group_songs gs ON gs.group_id = g.id
      LEFT JOIN lc_votes v ON v.song_id = gs.song_id AND v.listener_id = lc.id
      WHERE g.round = 1
      GROUP BY g.id, lc.id, lc.first_name, lc.last_name, lc.email
      ORDER BY g.id, voted_songs DESC
    `)

    // Build group map
    const groupMap: Record<string, any> = {}

    for (const row of songResult.rows as any[]) {
      if (!groupMap[row.group_id]) {
        groupMap[row.group_id] = {
          groupId: row.group_id,
          groupName: row.group_name,
          totalListeners: Number(row.total_listeners),
          songs: [],
          totalVotes: 0,
          listeners: [],
        }
      }
      const g = groupMap[row.group_id]
      if (g.songs.length < 5) {
        g.songs.push({
          rank: g.songs.length + 1,
          songId: row.song_id,
          originalFilename: row.original_filename,
          likes: Number(row.likes),
          dislikes: Number(row.dislikes),
          total: Number(row.total_votes),
        })
      }
      g.totalVotes += Number(row.total_votes)
    }

    // Add listener progress
    for (const row of progressResult.rows as any[]) {
      const g = groupMap[row.group_id]
      if (g) {
        g.listeners.push({
          listenerId: row.listener_id,
          name: `${row.first_name} ${row.last_name}`,
          email: row.email,
          totalSongs: Number(row.total_songs),
          votedSongs: Number(row.voted_songs),
          pct: Math.round((Number(row.voted_songs) / Number(row.total_songs)) * 100),
        })
      }
    }

    // Calculate group completion
    for (const g of Object.values(groupMap) as any[]) {
      const totalPossible = g.listeners.reduce((sum: number, l: any) => sum + l.totalSongs, 0)
      g.completionPct = totalPossible > 0 ? Math.round((g.totalVotes / totalPossible) * 100) : 0
    }

    return NextResponse.json({ groups: Object.values(groupMap) })
  } catch (err) {
    console.error('[/api/listening-leaderboard] Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
