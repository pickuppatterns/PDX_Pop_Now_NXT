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
      collection: 'volunteers',
      where: { betterAuthId: { equals: session.user.id } },
      limit: 1,
      overrideAccess: true,
    })

    if (!result.docs.length) {
      return NextResponse.json({ message: 'Volunteer profile not found' }, { status: 404 })
    }

    return NextResponse.json(result.docs[0])
  } catch (err) {
    console.error('[/api/volunteer-profile] GET Error:', err)
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

    // Find the volunteer record by Better Auth ID
    const result = await payload.find({
      collection: 'volunteers',
      where: { betterAuthId: { equals: session.user.id } },
      limit: 1,
      overrideAccess: true,
    })

    if (!result.docs.length) {
      return NextResponse.json({ message: 'Volunteer profile not found' }, { status: 404 })
    }

    const volunteer = result.docs[0]
    const body = await req.json()

    // Only allow updating contact fields — not assigned shift/position
    const {
      firstName,
      lastName,
      phone,
      emergencyContact,
      status,
      shirtSize,
      musicGenres,
      avatarUrl,
    } = body

    const updated = await payload.update({
      collection: 'volunteers',
      id: volunteer.id,
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(emergencyContact !== undefined && { emergencyContact }),
        ...(shirtSize !== undefined && { shirtSize }),
        ...(musicGenres !== undefined && { musicGenres }),
        ...(status !== undefined && { status }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      overrideAccess: true,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[/api/volunteer-profile] PATCH Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
