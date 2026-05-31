import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const payload = await getPayload({ config })
    const db = payload.db.drizzle

    const yearResult = await db.execute(`SELECT MAX(year) as year FROM lc_songs`)
    const year = (yearResult.rows[0] as any)?.year ?? new Date().getFullYear()
    const ROUND = 2

    // Clear any existing round 2
    await db.execute(
      `DELETE FROM lc_group_members WHERE group_id IN (SELECT id FROM lc_groups WHERE year = ${year} AND round = ${ROUND})`,
    )
    await db.execute(
      `DELETE FROM lc_group_songs WHERE group_id IN (SELECT id FROM lc_groups WHERE year = ${year} AND round = ${ROUND})`,
    )
    await db.execute(`DELETE FROM lc_groups WHERE year = ${year} AND round = ${ROUND}`)

    // Update lc_songs round for winners
    await db.execute(`UPDATE lc_songs SET round = 1 WHERE year = ${year}`)

    // Get top 5 per group from round 1
    const result = await db.execute(`
      SELECT s.id as song_id, ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY COUNT(CASE WHEN v.vote = 'like' THEN 1 END) DESC) as rank
      FROM lc_groups g
      JOIN lc_group_songs gs ON gs.group_id = g.id
      JOIN lc_songs s ON s.id = gs.song_id
      JOIN lc_group_members gm ON gm.group_id = g.id
      LEFT JOIN lc_votes v ON v.song_id = s.id AND v.listener_id = gm.listener_id
      WHERE g.year = ${year} AND g.round = 1
      GROUP BY g.id, s.id
    `)

    const winnerIds = (result.rows as any[])
      .filter((r) => Number(r.rank) <= 5)
      .map((r) => r.song_id)

    if (winnerIds.length === 0)
      return NextResponse.json({ message: 'No winners found from round 1.' }, { status: 400 })

    // Mark winners as round 2
    await db.execute(`UPDATE lc_songs SET round = 2 WHERE id IN (${winnerIds.join(',')})`)

    // Get active listeners
    const listenersResult = await db.execute(
      `SELECT id FROM listening_committee WHERE status = 'active'`,
    )
    const listeners = listenersResult.rows as { id: number }[]

    // Assign winners to new groups
    const shuffledSongs = shuffle(winnerIds.map((id: number) => ({ id })))
    const shuffledListeners = shuffle(listeners)
    const groupCount = Math.ceil(shuffledSongs.length / 22)
    const groups = []

    for (let g = 0; g < groupCount; g++) {
      const groupName = `R2 Group ${String.fromCharCode(65 + g)}`
      const groupResult = await db.execute(
        `INSERT INTO lc_groups (name, round, year) VALUES ('${groupName}', ${ROUND}, ${year}) RETURNING id`,
      )
      const groupId = (groupResult.rows[0] as any).id

      const songsPerGroup = Math.ceil(shuffledSongs.length / groupCount)
      const groupSongs = shuffledSongs.slice(g * songsPerGroup, (g + 1) * songsPerGroup)
      for (const song of groupSongs) {
        await db.execute(
          `INSERT INTO lc_group_songs (group_id, song_id) VALUES (${groupId}, ${song.id})`,
        )
      }

      const listenersPerGroup = Math.ceil(shuffledListeners.length / groupCount)
      const groupListeners = shuffledListeners.slice(
        g * listenersPerGroup,
        (g + 1) * listenersPerGroup,
      )
      for (const listener of groupListeners) {
        await db.execute(
          `INSERT INTO lc_group_members (group_id, listener_id) VALUES (${groupId}, ${listener.id})`,
        )
      }

      groups.push({ name: groupName, songs: groupSongs.length, listeners: groupListeners.length })
    }

    return NextResponse.json({ success: true, groups, totalWinners: winnerIds.length })
  } catch (err) {
    console.error('[/api/lc-controls/round2-launch] Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
