import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import nodemailer from 'nodemailer'
import { auth } from '@/lib/auth'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

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
        shirtSize,
        musicGenres: musicGenres ?? [],
        heardFrom: heardFrom === 'Other' ? `Other: ${heardFromOther}` : (heardFrom ?? ''),
        additionalNotes: additionalNotes ?? '',
      },
      overrideAccess: true,
    })

    // Create Better Auth account for the volunteer
    // Generate a temporary password — volunteer will be prompted to reset it
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
    } catch (authErr: unknown) {
      // If account already exists, don't fail the whole signup
      const msg = authErr instanceof Error ? authErr.message : ''
      if (!msg.toLowerCase().includes('already') && !msg.toLowerCase().includes('exists')) {
        console.error('[/api/volunteers] Better Auth signup error:', authErr)
      }
    }

    // Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      replyTo: process.env.GMAIL_REPLY_TO,
      subject: 'Thanks for signing up to volunteer with PDX Pop Now! 2025 🎉',
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#222">
          <div style="background:#1a1a2e;padding:32px;text-align:center;border-radius:8px 8px 0 0">
            <h1 style="color:#fff;font-size:2rem;font-style:italic;margin:0">You're In!</h1>
          </div>
          <div style="background:#faf7f2;padding:32px;border-radius:0 0 8px 8px">
            <p>Hi ${firstName},</p>
            <p>Thanks for signing up to volunteer with <strong>PDX Pop Now! 2025</strong>!</p>
            <p>We've created an account for you. You can log in at any time to view your profile and shift details once assigned:</p>
            <div style="text-align:center;margin:24px 0">
              <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/volunteer/profile" style="background:#e63946;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-family:'Courier New',monospace">
                View My Profile →
              </a>
            </div>
            <p>When the festival approaches, we'll reach out with shift details.</p>
            <p>Questions? Email <a href="mailto:mike.elliott@pdxpopnow.com" style="color:#e63946">mike.elliott@pdxpopnow.com</a>.</p>
            <p style="margin-top:24px">See you at the festival! 🎶<br/><strong>PDX Pop Now! Team</strong></p>
          </div>
        </div>
      `,
    })

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
