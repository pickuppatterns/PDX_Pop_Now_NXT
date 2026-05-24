import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, genreFirst, genreSecond, isReturning, mailingList } =
      body

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 })
    }
    if (!genreFirst) {
      return NextResponse.json(
        { message: 'Please select your first choice genre.' },
        { status: 400 },
      )
    }
    if (!isReturning) {
      return NextResponse.json(
        { message: 'Please indicate if you have been on the committee before.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    await payload.create({
      collection: 'listening-committee',
      data: {
        firstName,
        lastName,
        email,
        phone,
        genreFirst,
        genreSecond: genreSecond ?? '',
        isReturning,
        mailingList: mailingList ?? false,
      },
      overrideAccess: true,
    })

    const tempPassword =
      Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10)

    try {
      const authResult = await auth.api.signUpEmail({
        body: {
          name: `${firstName}${lastName ? ' ' + lastName : ''}`,
          email,
          password: tempPassword,
          role: 'listening_committee_member',
        },
      })

      if (authResult?.user?.id) {
        await payload.update({
          collection: 'listening-committee',
          where: { email: { equals: email } },
          data: { betterAuthId: authResult.user.id },
          overrideAccess: true,
        })
      }
    } catch (authErr: unknown) {
      const msg = authErr instanceof Error ? authErr.message : ''
      if (!msg.toLowerCase().includes('already') && !msg.toLowerCase().includes('exists')) {
        console.error('[/api/listening-committee] Better Auth signup error:', authErr)
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
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

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/listening-committee] Error:', err)
    return NextResponse.json({ message: 'Server error. Please try again.' }, { status: 500 })
  }
}
