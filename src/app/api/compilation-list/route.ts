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
    const result = await payload.find({
      collection: 'compilation-submissions',
      limit: 1000,
      sort: '-createdAt',
      overrideAccess: true,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/compilation-list] GET Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
