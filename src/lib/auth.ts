import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    },
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'volunteer',
        input: true,
      },
      stripeCustomerId: {
        type: 'string',
        input: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  trustedOrigins: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
