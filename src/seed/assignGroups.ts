import { getPayload } from 'payload'
import config from '../payload.config'

const YEAR = 2025
const ROUND = 1

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function assignGroups() {
  const payload = await getPayload({ config })
  const db = payload.db.drizzle

  // 1. Load songs
  const songsResult = await db.execute(
    `SELECT id, anon_token, original_filename FROM lc_songs WHERE year = ${YEAR} AND round = ${ROUND}`,
  )
  const songs = songsResult.rows as { id: number; anon_token: string; original_filename: string }[]

  // 2. Load active listeners
  const listenersResult = await db.execute(
    `SELECT id, first_name, last_name, email FROM listening_committee WHERE status = 'active'`,
  )
  const listeners = listenersResult.rows as {
    id: number
    first_name: string
    last_name: string
    email: string
  }[]

  console.log(`Songs: ${songs.length}, Listeners: ${listeners.length}`)

  // 3. Determine group count — aim for ~22-25 songs per group
  const groupCount = Math.ceil(songs.length / 22)
  console.log(`Creating ${groupCount} groups`)

  // 4. Shuffle both lists
  const shuffledSongs = shuffle(songs)
  const shuffledListeners = shuffle(listeners)

  // 5. Clear any existing assignments for this year/round
  await db.execute(`
    DELETE FROM lc_group_members WHERE group_id IN (
      SELECT id FROM lc_groups WHERE year = ${YEAR} AND round = ${ROUND}
    )
  `)
  await db.execute(`
    DELETE FROM lc_group_songs WHERE group_id IN (
      SELECT id FROM lc_groups WHERE year = ${YEAR} AND round = ${ROUND}
    )
  `)
  await db.execute(`DELETE FROM lc_groups WHERE year = ${YEAR} AND round = ${ROUND}`)

  // 6. Create groups and assign songs + listeners
  for (let g = 0; g < groupCount; g++) {
    const groupName = `Group ${String.fromCharCode(65 + g)}` // Group A, B, C...

    const groupResult = await db.execute(`
      INSERT INTO lc_groups (name, round, year)
      VALUES ('${groupName}', ${ROUND}, ${YEAR})
      RETURNING id
    `)
    const groupId = (groupResult.rows[0] as any).id

    // Assign songs to this group
    const songsPerGroup = Math.ceil(shuffledSongs.length / groupCount)
    const groupSongs = shuffledSongs.slice(g * songsPerGroup, (g + 1) * songsPerGroup)

    for (const song of groupSongs) {
      await db.execute(`
        INSERT INTO lc_group_songs (group_id, song_id)
        VALUES (${groupId}, ${song.id})
      `)
    }

    // Assign listeners to this group
    const listenersPerGroup = Math.ceil(shuffledListeners.length / groupCount)
    const groupListeners = shuffledListeners.slice(
      g * listenersPerGroup,
      (g + 1) * listenersPerGroup,
    )

    for (const listener of groupListeners) {
      await db.execute(`
        INSERT INTO lc_group_members (group_id, listener_id)
        VALUES (${groupId}, ${listener.id})
      `)
    }

    console.log(`✅ ${groupName}: ${groupSongs.length} songs, ${groupListeners.length} listeners`)
  }

  // 7. Summary
  const summary = await db.execute(`
    SELECT 
      g.name,
      COUNT(DISTINCT gs.song_id) as songs,
      COUNT(DISTINCT gm.listener_id) as listeners
    FROM lc_groups g
    LEFT JOIN lc_group_songs gs ON gs.group_id = g.id
    LEFT JOIN lc_group_members gm ON gm.group_id = g.id
    WHERE g.year = ${YEAR} AND g.round = ${ROUND}
    GROUP BY g.id, g.name
    ORDER BY g.name
  `)

  console.log('\n📊 Group Summary:')
  console.log('─────────────────────────────')
  for (const row of summary.rows as any[]) {
    console.log(`  ${row.name}: ${row.songs} songs, ${row.listeners} listeners`)
  }
  console.log('─────────────────────────────')

  process.exit(0)
}

assignGroups().catch((err) => {
  console.error(err)
  process.exit(1)
})
