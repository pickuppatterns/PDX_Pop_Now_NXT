import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const payload = await getPayload({ config })
    const db = payload.db.drizzle

    const yearResult = await db.execute(`SELECT MAX(year) as year FROM lc_songs`)
    const year = (yearResult.rows[0] as any)?.year ?? new Date().getFullYear()

    // Top 5 per group from round 1
    const result = await db.execute(`
      SELECT
        g.name as group_name,
        s.id as song_id,
        s.original_filename,
        s.anon_token,
        COUNT(CASE WHEN v.vote = 'like' THEN 1 END) as likes,
        COUNT(CASE WHEN v.vote = 'dislike' THEN 1 END) as dislikes,
        ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY COUNT(CASE WHEN v.vote = 'like' THEN 1 END) DESC) as rank
      FROM lc_groups g
      JOIN lc_group_songs gs ON gs.group_id = g.id
      JOIN lc_songs s ON s.id = gs.song_id
      JOIN lc_group_members gm ON gm.group_id = g.id
      LEFT JOIN lc_votes v ON v.song_id = s.id AND v.listener_id = gm.listener_id
      WHERE g.year = ${year} AND g.round = 1
      GROUP BY g.id, g.name, s.id, s.original_filename, s.anon_token
    `)

    const winners = (result.rows as any[]).filter((r) => Number(r.rank) <= 5)

    return NextResponse.json({
      year,
      totalWinners: winners.length,
      songs: winners.map((r) => ({
        songId: r.song_id,
        originalFilename: r.original_filename,
        anonToken: r.anon_token,
        fromGroup: r.group_name,
        likes: Number(r.likes),
        dislikes: Number(r.dislikes),
        rank: Number(r.rank),
      })),
    })
  } catch (err) {
    console.error('[/api/lc-controls/round2-preview] Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
