import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({
      slug: 'listening-committee-settings',
      overrideAccess: true,
    })

    const now = new Date()
    const start = settings.startDate ? new Date(settings.startDate) : null
    const end = settings.endDate ? new Date(settings.endDate) : null
    const isOpen = !!(start && end && now >= start && now <= end)

    return NextResponse.json({ ...settings, isOpen })
  } catch (err) {
    console.error('[/api/listening-committee-settings] GET Error:', err)
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
    const { year, startDate, endDate } = body

    const now = new Date()
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null
    const isOpen = !!(start && end && now >= start && now <= end)

    const payload = await getPayload({ config })
    const updated = await payload.updateGlobal({
      slug: 'listening-committee-settings',
      data: {
        ...(year !== undefined && { year }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        isOpen,
      },
      overrideAccess: true,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[/api/listening-committee-settings] PATCH Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
