import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'listening-committee',
      limit: 1000,
      overrideAccess: true,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/listening-list] GET Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
