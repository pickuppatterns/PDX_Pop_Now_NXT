import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const numericId = Number(id)
    if (!numericId) return NextResponse.json({ message: 'Invalid ID.' }, { status: 400 })

    const body = await req.json()
    const payload = await getPayload({ config })

    const updated = await payload.update({
      collection: 'volunteers',
      id: numericId,
      data: body,
      overrideAccess: true,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[/api/volunteers-list/[id]] PATCH Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
