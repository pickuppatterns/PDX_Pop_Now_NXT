import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      emergencyContact,
      positions,
      experience,
      accommodations,
      shirtSize,
      musicGenres,
      heardFrom,
      heardFromOther,
      additionalNotes,
    } = body

    if (!firstName || !email || !phone) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 })
    }
    if (!positions?.length) {
      return NextResponse.json({ message: 'At least one position is required.' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Save volunteer record to Payload
    await payload.create({
      collection: 'volunteers',
      data: {
        firstName,
        lastName: lastName ?? '',
        email,
        phone,
        emergencyContact: emergencyContact ?? '',
        positions,
        experience: experience ?? '',
        accommodations: accommodations ?? '',
        shirtSize: shirtSize ?? '',
        musicGenres: musicGenres ?? [],
        heardFrom: heardFrom === 'Other' ? `Other: ${heardFromOther}` : (heardFrom ?? ''),
        additionalNotes: additionalNotes ?? '',
      },
      overrideAccess: true,
    })

    // Create Better Auth account for the volunteer
    const tempPassword =
      Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10)

    try {
      const authResult = await auth.api.signUpEmail({
        body: {
          name: `${firstName}${lastName ? ' ' + lastName : ''}`,
          email,
          password: tempPassword,
          role: 'volunteer',
        },
      })

      // Link Better Auth user to Payload volunteer record
      if (authResult?.user?.id) {
        await payload.update({
          collection: 'volunteers',
          where: { email: { equals: email } },
          data: { betterAuthId: authResult.user.id },
          overrideAccess: true,
        })
      }

      // Send welcome + password setup email via Better Auth HTTP endpoint
      const resetRes = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/request-password-reset`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            redirectTo: `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password`,
          }),
        },
      )
      console.log('Reset email status:', resetRes.status)
    } catch (authErr: unknown) {
      const msg = authErr instanceof Error ? authErr.message : ''
      if (!msg.toLowerCase().includes('already') && !msg.toLowerCase().includes('exists')) {
        console.error('[/api/volunteers] Better Auth signup error:', authErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/volunteers] Error:', err)
    return NextResponse.json({ message: 'Server error. Please try again.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const payload = await getPayload({ config })

    const ids: number[] = []
    let i = 0
    while (searchParams.has(`where[and][0][id][in][${i}]`)) {
      ids.push(Number(searchParams.get(`where[and][0][id][in][${i}]`)))
      i++
    }

    await Promise.all(
      ids.map((id) => payload.delete({ collection: 'volunteers', id, overrideAccess: true })),
    )

    return NextResponse.json({ docs: ids.map((id) => ({ id })), errors: [] })
  } catch (err) {
    console.error('[/api/volunteers] DELETE Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
