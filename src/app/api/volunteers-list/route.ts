import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'volunteers',
      limit: 1000,
      sort: '-createdAt',
      overrideAccess: true,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/volunteers-list] GET Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split('/')
    const id = Number(segments[segments.length - 1])
    if (!id) return NextResponse.json({ message: 'Missing ID.' }, { status: 400 })

    const body = await req.json()
    const payload = await getPayload({ config })

    const updated = await payload.update({
      collection: 'volunteers',
      id,
      data: body,
      overrideAccess: true,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[/api/volunteers-list] PATCH Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
