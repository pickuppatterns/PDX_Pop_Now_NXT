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
    sendResetPassword: async ({ user, url }) => {
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.default.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Welcome to the PDX Pop Now! Family! Set your PDX Pop Now! Volunteer Password',

        html: `

  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#222">

    <div style="background:#1a1a2e;padding:32px;text-align:center;border-radius:8px 8px 0 0">

      <h1 style="color:#fff;font-size:2rem;font-style:italic;margin:0">You're In!</h1>

    </div>

    <div style="background:#faf7f2;padding:32px;border-radius:0 0 8px 8px">

      <p>Hi ${user.name ?? 'there'},</p>
      <p>Thanks for signing up to volunteer with <strong>PDX Pop Now! 2025</strong>!</p>
      <p>Set your password to access your volunteer profile where you can update your settings</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${url}" style="background:#e63946;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-family:'Courier New',monospace">
          Set Your Password →
        </a>
      </div>
      <p>This link expires in 1 hour. If you need a new one, visit <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/login" style="color:#e63946">your login page</a>.</p>
      <p>Questions? Email <a href="volunteers@pdxpopnow.com" style="color:#e63946">mike.elliott@pdxpopnow.com</a>.</p>
      <p style="margin-top:24px">See you at the festival! 🎶<br/><strong>PDX Pop Now! Team</strong></p>
    </div>
  </div>
`,
      })
    },
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
