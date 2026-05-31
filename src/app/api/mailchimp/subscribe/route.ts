import { NextResponse } from 'next/server'

const API_KEY = process.env.MAILCHIMP_API_KEY!
const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID!
const DATA_CENTER = process.env.MAILCHIMP_DATA_CENTER! // e.g. 'us5'

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Valid email address required.' }, { status: 400 })
    }

    const response = await fetch(
      `https://${DATA_CENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `apikey ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            FNAME: firstName ?? '',
            LNAME: lastName ?? '',
          },
        }),
      },
    )

    const data = await response.json()

    if (response.status === 200 || response.status === 201) {
      return NextResponse.json({ success: true })
    }

    // Already subscribed
    if (data.title === 'Member Exists') {
      return NextResponse.json({ message: "You're already subscribed!" }, { status: 400 })
    }

    console.error('[mailchimp] Error:', data)
    return NextResponse.json({ message: data.detail ?? 'Subscription failed.' }, { status: 400 })
  } catch (err) {
    console.error('[/api/mailchimp/subscribe] Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
