import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const rawData = formData.get('data')
    if (!rawData) return NextResponse.json({ message: 'Missing data.' }, { status: 400 })

    const data = JSON.parse(rawData as string)
    const mp3File = formData.get('mp3') as File | null
    const bandPhotoFile = formData.get('bandPhoto') as File | null

    const {
      artistName,
      songTitle,
      genre,
      releaseStatus,
      labelName,
      radioAppropriate,
      songwritingCreditMusic,
      songwritingCreditLyrics,
      publishers,
      soundRecordingOwners,
      promoLink,
      bandcamp,
      instagram,
      website,
      firstName,
      lastName,
      affiliation,
      email,
      phone,
      agreementTimestamp,
      agreementVersion,
    } = data

    if (!firstName || !lastName || !email || !phone || !artistName || !songTitle) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 })
    }

    if (!mp3File) {
      return NextResponse.json({ message: 'MP3 file is required.' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const year = new Date().getFullYear()

    // Get IP address
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown'

    // Create submission record first to get the UUID
    const submission = await payload.create({
      collection: 'compilation-submissions',
      data: {
        artistName,
        songTitle,
        genre,
        releaseStatus,
        labelName: labelName ?? '',
        radioAppropriate,
        songwritingCreditMusic,
        songwritingCreditLyrics,
        publishers,
        soundRecordingOwners,
        promoLink: promoLink ?? '',
        bandcamp: bandcamp ?? '',
        instagram: instagram ?? '',
        website: website ?? '',
        firstName,
        lastName,
        affiliation,
        email,
        phone,
        agreementAccepted: true,
        agreementTimestamp,
        agreementVersion,
        agreementIp: ip,
        status: 'pending',
      },
      overrideAccess: true,
    })

    const fullId = submission.id as string
    const submissionId = fullId.slice(0, 8)

    // Build filename: {submissionId}_{artistName:30}_{songTitle:40}.mp3
    const safeArtist = artistName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30)
    const safeTitle = songTitle.replace(/[^a-zA-Z0-9]/g, '').slice(0, 40)
    const mp3Filename = `${year}_${submissionId}_song_${safeArtist}_${safeTitle}.mp3`

    // Upload MP3 to compilation-media collection (separate from general media)
    const mp3Buffer = Buffer.from(await mp3File.arrayBuffer())
    const mp3Result = await payload.create({
      collection: 'compilation-media',
      data: {
        alt: mp3Filename,
        year,
        fileType: 'track',
      },
      file: {
        data: mp3Buffer,
        mimetype: 'audio/mpeg',
        name: mp3Filename,
        size: mp3File.size,
      },
      overrideAccess: true,
    })

    // Upload band photo if provided
    let bandPhotoUrl = null
    if (bandPhotoFile && bandPhotoFile.size > 0) {
      const photoBuffer = Buffer.from(await bandPhotoFile.arrayBuffer())
      const ext = bandPhotoFile.name.substring(bandPhotoFile.name.lastIndexOf('.'))
      const photoFilename = `${year}_${submissionId}_photo_${safeArtist}${ext}`
      const photoResult = await payload.create({
        collection: 'compilation-media',
        data: {
          alt: `${artistName} band photo`,
          year,
          fileType: 'band_photo',
        },
        file: {
          data: photoBuffer,
          mimetype: bandPhotoFile.type,
          name: photoFilename,
          size: bandPhotoFile.size,
        },
        overrideAccess: true,
      })
      bandPhotoUrl = photoResult.url ?? null
    }

    // Update submission with file URLs and filename
    await payload.update({
      collection: 'compilation-submissions',
      id: fullId,
      data: {
        trackUrl: mp3Result.url ?? null,
        trackFilename: mp3Filename,
        bandPhotoUrl,
      },
      overrideAccess: true,
    })

    // Create Better Auth account
    const tempPassword =
      Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10)

    try {
      const authResult = await auth.api.signUpEmail({
        body: {
          name: `${firstName}${lastName ? ' ' + lastName : ''}`,
          email,
          password: tempPassword,
          role: 'submitter',
        },
      })

      if (authResult?.user?.id) {
        await payload.update({
          collection: 'compilation-submissions',
          id: fullId,
          data: { betterAuthId: authResult.user.id },
          overrideAccess: true,
        })
      }
    } catch (authErr: unknown) {
      const msg = authErr instanceof Error ? authErr.message : ''
      if (!msg.toLowerCase().includes('already') && !msg.toLowerCase().includes('exists')) {
        console.error('[/api/submission] Better Auth signup error:', authErr)
      }
    }

    // Send password setup email
    await new Promise((resolve) => setTimeout(resolve, 500))
    await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        redirectTo: `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password`,
      }),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/submission] Error:', err)
    return NextResponse.json({ message: 'Server error. Please try again.' }, { status: 500 })
  }
}
