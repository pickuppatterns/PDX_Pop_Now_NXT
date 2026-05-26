import { NextRequest, NextResponse } from 'next/server'
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
      where: { betterAuthId: { equals: session.user.id } },
      limit: 1,
      overrideAccess: true,
    })

    if (!result.docs.length) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(result.docs[0])
  } catch (err) {
    console.error('[/api/submission-profile] GET Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'compilation-submissions',
      where: { betterAuthId: { equals: session.user.id } },
      limit: 1,
      overrideAccess: true,
    })

    if (!result.docs.length) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    const { avatarUrl } = await req.json()

    const updated = await payload.update({
      collection: 'compilation-submissions',
      id: result.docs[0].id,
      data: { ...(avatarUrl !== undefined && { avatarUrl }) },
      overrideAccess: true,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[/api/submission-profile] PATCH Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
