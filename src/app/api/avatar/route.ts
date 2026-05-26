import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ message: 'No file provided' }, { status: 400 })

    const payload = await getPayload({ config })

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await payload.create({
      collection: 'media',
      data: { alt: `${session.user.name ?? session.user.email} avatar` },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
      overrideAccess: true,
    })

    const url = result.url

    // Update user.image in Better Auth user table
    const db = payload.db.drizzle
    await db.execute(
      `UPDATE "user" SET image = '${url}', "updatedAt" = NOW() WHERE id = '${session.user.id}'`,
    )

    return NextResponse.json({ url })
  } catch (err) {
    console.error('[/api/avatar] POST Error:', err)
    return NextResponse.json({ message: 'Upload failed.' }, { status: 500 })
  }
}
