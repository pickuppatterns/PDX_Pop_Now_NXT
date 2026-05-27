import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, selectedForCompilation, resultMessage } = body

    const payload = await getPayload({ config })
    const updated = await payload.update({
      collection: 'compilation-submissions',
      id,
      data: {
        ...(status !== undefined && { status }),
        ...(selectedForCompilation !== undefined && { selectedForCompilation }),
        ...(resultMessage !== undefined && { resultMessage }),
      },
      overrideAccess: true,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[/api/compilation-list/[id]] PATCH Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
