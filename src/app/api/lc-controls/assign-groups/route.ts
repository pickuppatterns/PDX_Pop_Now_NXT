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
    const ROUND = 1

    const songsResult = await db.execute(
      `SELECT id FROM lc_songs WHERE year = ${year} AND round = ${ROUND}`,
    )
    const songs = songsResult.rows as { id: number }[]

    const listenersResult = await db.execute(
      `SELECT id FROM listening_committee WHERE status = 'active'`,
    )
    const listeners = listenersResult.rows as { id: number }[]

    if (songs.length === 0)
      return NextResponse.json({ message: 'No songs found.' }, { status: 400 })
    if (listeners.length === 0)
      return NextResponse.json({ message: 'No active listeners found.' }, { status: 400 })

    // Clear existing round 1 assignments
    await db.execute(
      `DELETE FROM lc_group_members WHERE group_id IN (SELECT id FROM lc_groups WHERE year = ${year} AND round = ${ROUND})`,
    )
    await db.execute(
      `DELETE FROM lc_group_songs WHERE group_id IN (SELECT id FROM lc_groups WHERE year = ${year} AND round = ${ROUND})`,
    )
    await db.execute(`DELETE FROM lc_groups WHERE year = ${year} AND round = ${ROUND}`)

    const shuffledSongs = shuffle(songs)
    const shuffledListeners = shuffle(listeners)
    const groupCount = Math.ceil(shuffledSongs.length / 22)
    const groups = []

    for (let g = 0; g < groupCount; g++) {
      const groupName = `Group ${String.fromCharCode(65 + g)}`
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

    return NextResponse.json({ success: true, groups })
  } catch (err) {
    console.error('[/api/lc-controls/assign-groups] Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
