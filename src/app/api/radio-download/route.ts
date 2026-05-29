import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
  region: process.env.B2_BUCKET_REGION!,
  endpoint: `https://${process.env.B2_ENDPOINT}`,
  forcePathStyle: true,
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const filename = req.nextUrl.searchParams.get('filename')
    if (!filename) {
      return NextResponse.json({ message: 'Missing filename.' }, { status: 400 })
    }

    const command = new GetObjectCommand({
      Bucket: process.env.B2_SUBMISSION_RADIO!,
      Key: `2026/${filename}`,
    })

    const url = await getSignedUrl(s3, command, { expiresIn: 300 })
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[/api/radio-download] Error:', err)
    return NextResponse.json({ message: 'Server error.' }, { status: 500 })
  }
}
