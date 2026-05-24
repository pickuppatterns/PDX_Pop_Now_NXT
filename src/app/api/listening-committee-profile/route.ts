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
      collection: 'listening-committee',
      where: { betterAuthId: { equals: session.user.id } },
      limit: 1,
      overrideAccess: true,
    })

    if (!result.docs.length) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(result.docs[0])
  } catch (err) {
    console.error('[/api/listening-committee-profile] GET Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { firstName, lastName, phone, genreFirst, genreSecond, mailingList, status } = body

    const payload = await getPayload({ config })

    const existing = await payload.find({
      collection: 'listening-committee',
      where: { betterAuthId: { equals: session.user.id } },
      limit: 1,
      overrideAccess: true,
    })

    if (!existing.docs.length) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    const updated = await payload.update({
      collection: 'listening-committee',
      id: existing.docs[0].id,
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(genreFirst !== undefined && { genreFirst }),
        ...(genreSecond !== undefined && { genreSecond }),
        ...(mailingList !== undefined && { mailingList }),
        ...(status !== undefined && { status }),
      },
      overrideAccess: true,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[/api/listening-committee-profile] PATCH Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
