import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, assignedBatch } = body

    const payload = await getPayload({ config })
    const updated = await payload.update({
      collection: 'listening-committee',
      id: Number(id),
      data: {
        ...(status !== undefined && { status }),
        ...(assignedBatch !== undefined && { assignedBatch }),
      },
      overrideAccess: true,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[/api/listening-list/[id]] PATCH Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
