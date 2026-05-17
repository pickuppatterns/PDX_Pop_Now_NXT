import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
  name: 'Test User',
  role: 'customer' as const,
}

export const testAdminUser = {
  email: 'admin@payloadcms.com',
  password: 'test',
  name: 'Test Admin',
  role: 'super-admin' as const,
}

// Tracks emails created per suffix so cleanup can find them
const createdUsers: Record<string, string> = {}
const createdAdmins: Record<string, string> = {}

export async function seedTestUser(suffix = 'default'): Promise<{ email: string; id: string }> {
  const payload = await getPayload({ config })

  // Timestamp guarantees a unique email every run — no collision with previous runs
  const email = `test-${suffix}-${Date.now()}@payloadcms.com`
  createdUsers[suffix] = email

  const user = await payload.create({
    collection: 'users',
    data: {
      email,
      password: 'test',
      name: 'Test User',
      role: 'customer' as const,
    },
  })

  return { email, id: String(user.id) }
}

export async function cleanupTestUser(suffix = 'default'): Promise<void> {
  const payload = await getPayload({ config })
  const email = createdUsers[suffix]
  if (!email) return

  await payload.delete({
    collection: 'users',
    where: { email: { equals: email } },
    overrideAccess: true,
  })

  delete createdUsers[suffix]
}

export async function seedAdminUser(suffix = 'default'): Promise<{ email: string; id: string }> {
  const payload = await getPayload({ config })

  const email = `admin-${suffix}-${Date.now()}@payloadcms.com`
  createdAdmins[suffix] = email

  const user = await payload.create({
    collection: 'users',
    data: {
      email,
      password: 'test',
      name: 'Test Admin',
      role: 'super-admin' as const,
    },
  })

  return { email, id: String(user.id) }
}

export async function cleanupAdminUser(suffix = 'default'): Promise<void> {
  const payload = await getPayload({ config })
  const email = createdAdmins[suffix]
  if (!email) return

  await payload.delete({
    collection: 'users',
    where: { email: { equals: email } },
    overrideAccess: true,
  })

  delete createdAdmins[suffix]
}
