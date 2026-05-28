import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Products } from './collections/Products'
import { Orders } from './collections/Orders'
import { CartItems } from './collections/CartItems'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { s3Storage } from '@payloadcms/storage-s3'
import { SiteSettings } from './globals/SiteSettings'
import { Fonts } from './collections/Fonts'
import { Compilations } from './collections/Compilations'
import { FestivalGFXArtists } from './collections/FestivalGFXArtists'
import { Shifts } from './collections/Shifts'
import { VolunteerAssignments } from './collections/VolunteerAssignments'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'
import { Volunteers } from './collections/Volunteers'
import { ListeningCommittee } from './collections/ListeningCommittee'
import { CompilationSubmissions } from './collections/CompilationSubmissions'
import { CompilationSongs } from './collections/compilation-songs'
import { CompilationPhotos } from './collections/compilation-photos'
import { ListeningCommitteeSettings } from './globals/ListeningCommitteeSettings'
import { VolunteerSettings } from './globals/VolunteerSettings'
import { SubmissionSettings } from './globals/SubmissionSettings'
import { RadioSongs } from './collections/RadioSongs'
import { RadioSubmissions } from './collections/RadioSubmissions'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  email: nodemailerAdapter({
    defaultFromAddress: process.env.GMAIL_USER ?? 'noreply@pdxpopnow.com',
    defaultFromName: 'PDX Pop Now!',
    transport: nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    }),
  }),
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: false,
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Products,
    Orders,
    CartItems,
    Fonts,
    Compilations,
    FestivalGFXArtists,
    Shifts,
    VolunteerAssignments,
    Volunteers,
    ListeningCommittee,
    CompilationSubmissions,
    CompilationSongs,
    CompilationPhotos,
    RadioSongs,
    RadioSubmissions,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [
    Header,
    Footer,
    SiteSettings,
    SubmissionSettings,
    ListeningCommitteeSettings,
    VolunteerSettings,
  ],
  plugins: [
    ...plugins,
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.B2_BUCKET_NAME!,
      config: {
        credentials: {
          accessKeyId: process.env.B2_KEY_ID!,
          secretAccessKey: process.env.B2_APP_KEY!,
        },
        region: process.env.B2_BUCKET_REGION!,
        endpoint: `https://${process.env.B2_ENDPOINT}`,
        forcePathStyle: true,
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
        customUserAgent: 'payload-cms',
      },
    }),
    s3Storage({
      collections: {
        'compilation-songs': {
          prefix: '2026',
        },
      },
      bucket: process.env.B2_SUBMISSION_SONGS!,
      config: {
        credentials: {
          accessKeyId: process.env.B2_KEY_ID!,
          secretAccessKey: process.env.B2_APP_KEY!,
        },
        region: process.env.B2_BUCKET_REGION!,
        endpoint: `https://${process.env.B2_ENDPOINT}`,
        forcePathStyle: true,
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
        customUserAgent: 'payload-cms',
      },
    }),
    s3Storage({
      collections: {
        'compilation-photos': {
          prefix: '2026',
        },
      },
      bucket: process.env.B2_SUBMISSION_PHOTOS!,
      config: {
        credentials: {
          accessKeyId: process.env.B2_KEY_ID!,
          secretAccessKey: process.env.B2_APP_KEY!,
        },
        region: process.env.B2_BUCKET_REGION!,
        endpoint: `https://${process.env.B2_ENDPOINT}`,
        forcePathStyle: true,
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
        customUserAgent: 'payload-cms',
      },
    }),
    s3Storage({
      collections: {
        'radio-songs': { prefix: '2026' },
      },
      bucket: process.env.B2_SUBMISSION_RADIO!,
      config: {
        credentials: {
          accessKeyId: process.env.B2_KEY_ID!,
          secretAccessKey: process.env.B2_APP_KEY!,
        },
        region: process.env.B2_BUCKET_REGION!,
        endpoint: `https://${process.env.B2_ENDPOINT}`,
        forcePathStyle: true,
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
        customUserAgent: 'payload-cms',
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
