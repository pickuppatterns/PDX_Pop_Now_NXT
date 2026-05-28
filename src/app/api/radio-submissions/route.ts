import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const rawData = formData.get('data')
    if (!rawData) return NextResponse.json({ message: 'Missing data.' }, { status: 400 })

    const data = JSON.parse(rawData as string)
    const mp3File = formData.get('mp3') as File | null

    const {
      email,
      portlandBased,
      zipCode,
      name,
      artistName,
      songTitle,
      genre,
      radioAppropriate,
      downloadLink,
      website,
      phone,
      agreeLibrary,
      agreeNotCompilation,
      comments,
    } = data

    if (!email || !name || !artistName || !genre || !phone) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 })
    }

    if (!mp3File && !downloadLink) {
      return NextResponse.json(
        { message: 'Please provide either an MP3 upload or a download link.' },
        { status: 400 },
      )
    }

    if (!agreeLibrary || !agreeNotCompilation) {
      return NextResponse.json({ message: 'You must agree to both terms.' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const year = new Date().getFullYear()

    console.log('[radio] parsed data:', { email, name, artistName, genre, radioAppropriate })

    const submission = await payload.create({
      collection: 'radio-submissions',
      data: {
        email,
        portlandBased,
        zipCode,
        name,
        artistName,
        songTitle,
        genre: Array.isArray(genre) ? genre.join(', ') : genre,
        radioAppropriate,
        downloadLink: downloadLink ?? '',
        website,
        phone,
        agreeLibrary,
        agreeNotCompilation,
        comments: comments ?? '',
        status: 'pending',
        year,
      },
      overrideAccess: true,
    })

    const fullId = String(submission.id)
    const submissionId = fullId.slice(0, 8)

    if (mp3File && mp3File.size > 0) {
      if (mp3File.size > 5 * 1024 * 1024) {
        return NextResponse.json({ message: 'MP3 must be under 5MB.' }, { status: 400 })
      }

      const safeArtist = artistName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30)
      const safeTitle = songTitle.replace(/[^a-zA-Z0-9]/g, '').slice(0, 40)
      const mp3Filename = `${year}_${submissionId}_${safeArtist}_${safeTitle}.mp3`
      const mp3Buffer = Buffer.from(await mp3File.arrayBuffer())
      console.log(
        '[radio] uploading MP3:',
        mp3Filename,
        'size:',
        mp3File.size,
        'type:',
        mp3File.type,
      )

      try {
        const mp3Result = await payload.create({
          collection: 'radio-songs',
          data: { alt: mp3Filename, year },
          file: {
            data: mp3Buffer,
            mimetype: 'audio/mpeg',
            name: mp3Filename,
            size: mp3File.size,
          },
          overrideAccess: true,
        })

        await payload.update({
          collection: 'radio-submissions',
          id: fullId,
          data: {
            trackUrl: mp3Result.url ?? null,
            trackFilename: mp3Filename,
          },
          overrideAccess: true,
        })
      } catch (uploadErr: unknown) {
        console.error('[radio] MP3 upload error detail:', JSON.stringify(uploadErr, null, 2))
        throw uploadErr
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/radio-submissions] Error:', err)
    return NextResponse.json({ message: 'Server error. Please try again.' }, { status: 500 })
  }
}
