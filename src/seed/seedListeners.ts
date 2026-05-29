import { getPayload } from 'payload'
import config from '../payload.config'
import { auth } from '../lib/auth'

const PASSWORD = 'squ33z3!'

const GENRES = [
  'classical',
  'country',
  'electronic',
  'experimental',
  'folk_americana',
  'hip_hop',
  'international',
  'rb_soul',
  'jazz',
  'metal_hardcore',
  'pop',
  'post_punk',
  'rock_alt_punk',
  'indie_rock_pop',
  'goth_darkwave',
]

async function seedListeners() {
  const payload = await getPayload({ config })

  let success = 0
  let failed = 0

  for (let i = 1; i <= 50; i++) {
    const num = String(i).padStart(2, '0')
    const email = `listener${num}@pdxpopnow.com`
    const firstName = `Listener`
    const lastName = `${num}`

    try {
      // Create Better Auth account
      const authResult = await auth.api.signUpEmail({
        body: {
          name: `${firstName} ${lastName}`,
          email,
          password: PASSWORD,
          role: 'listener',
        },
      })

      const betterAuthId = authResult?.user?.id ?? null

      // Create listening_committee record
      await payload.create({
        collection: 'listening-committee',
        data: {
          firstName,
          lastName,
          email,
          phone: '5030000000',
          status: 'active',
          betterAuthId,
          mailingList: false,
          genreFirst: GENRES[Math.floor(Math.random() * GENRES.length)],
          isReturning: 'no',
        } as any,
        overrideAccess: true,
        context: { disableRevalidate: true },
      })

      console.log(`✅ ${email}`)
      success++
    } catch (err) {
      console.error(`❌ ${email}:`, err)
      failed++
    }
  }

  console.log(`\nDone. ${success} created, ${failed} failed.`)
  process.exit(0)
}

seedListeners().catch((err) => {
  console.error(err)
  process.exit(1)
})
