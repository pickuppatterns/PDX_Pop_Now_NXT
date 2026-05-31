import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const round = Number(url.searchParams.get('round') ?? 1)

    const payload = await getPayload({ config })
    const db = payload.db.drizzle

    const yearResult = await db.execute(`SELECT MAX(year) as year FROM lc_songs`)
    const year = (yearResult.rows[0] as any)?.year ?? new Date().getFullYear()

    // Get top 5 per group with real song names
    const result = await db.execute(`
      SELECT
        g.name as group_name,
        s.original_filename,
        COUNT(CASE WHEN v.vote = 'like' THEN 1 END) as likes,
        COUNT(CASE WHEN v.vote = 'dislike' THEN 1 END) as dislikes,
        COUNT(v.id) as total_votes,
        ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY COUNT(CASE WHEN v.vote = 'like' THEN 1 END) DESC) as rank
      FROM lc_groups g
      JOIN lc_group_songs gs ON gs.group_id = g.id
      JOIN lc_songs s ON s.id = gs.song_id
      JOIN lc_group_members gm ON gm.group_id = g.id
      LEFT JOIN lc_votes v ON v.song_id = s.id AND v.listener_id = gm.listener_id
      WHERE g.year = ${year} AND g.round = ${round}
      GROUP BY g.id, g.name, s.id, s.original_filename
      ORDER BY g.name, likes DESC
    `)

    // Listener progress per group
    const progressResult = await db.execute(`
      SELECT
        g.name as group_name,
        lc.first_name || ' ' || lc.last_name as listener_name,
        lc.email,
        COUNT(DISTINCT gs.song_id) as total_songs,
        COUNT(DISTINCT v.song_id) as voted_songs
      FROM lc_groups g
      JOIN lc_group_members gm ON gm.group_id = g.id
      JOIN listening_committee lc ON lc.id = gm.listener_id
      JOIN lc_group_songs gs ON gs.group_id = g.id
      LEFT JOIN lc_votes v ON v.song_id = gs.song_id AND v.listener_id = lc.id
      WHERE g.year = ${year} AND g.round = ${round}
      GROUP BY g.id, g.name, lc.id, lc.first_name, lc.last_name, lc.email
      ORDER BY g.name, voted_songs DESC
    `)

    // Build report text
    const rows = result.rows as any[]
    const progressRows = progressResult.rows as any[]

    const groups = [...new Set(rows.map((r) => r.group_name))]

    let report = `PDX POP NOW! — LISTENING COMMITTEE REPORT\n`
    report += `Year: ${year} | Round: ${round}\n`
    report += `Generated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PT\n`
    report += `${'='.repeat(60)}\n\n`

    for (const groupName of groups) {
      report += `${groupName.toUpperCase()}\n`
      report += `${'-'.repeat(40)}\n`

      // Top 5
      report += `TOP 5 SONGS:\n`
      const groupSongs = rows.filter((r) => r.group_name === groupName && Number(r.rank) <= 5)
      groupSongs.forEach((song, i) => {
        const name = song.original_filename.replace(/\.[^/.]+$/, '')
        report += `  ${i + 1}. ${name}\n`
        report += `     👍 ${song.likes}  👎 ${song.dislikes}  (${song.total_votes} total votes)\n`
      })

      // Listener progress
      report += `\nVOTER PROGRESS:\n`
      const groupListeners = progressRows.filter((r) => r.group_name === groupName)
      groupListeners.forEach((listener) => {
        const pct = Math.round((Number(listener.voted_songs) / Number(listener.total_songs)) * 100)
        const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10))
        report += `  ${listener.listener_name.padEnd(25)} ${bar} ${listener.voted_songs}/${listener.total_songs}\n`
      })

      report += `\n`
    }

    report += `${'='.repeat(60)}\n`
    report += `END OF REPORT\n`

    return new NextResponse(report, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="pdxpopnow-round${round}-report-${year}.txt"`,
      },
    })
  } catch (err) {
    console.error('[/api/lc-controls/report] Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
