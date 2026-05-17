import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

let payload: Payload

/**
 * Users Collection Tests
 * ----------------------
 * Uses Payload's local API directly — no HTTP overhead.
 * beforeAll seeds a test user, afterAll cleans up.
 * Fill in each TODO block with your assertions.
 */

describe('Users collection', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    await seedTestUser('users')
  })

  afterAll(async () => {
    await cleanupTestUser('users')
  })

  describe('roles', () => {
    it('should default new users to customer role', async () => {
      // TODO: create a user without specifying a role
      // const user = await payload.create({
      //   collection: 'users',
      //   data: { email: 'test@example.com', password: 'password123' },
      // })
      // expect(user.role).toBe('customer')
    })

    it('should allow valid roles: super-admin, editor, customer, musician, guest', async () => {
      // TODO: assert each role value is accepted
      // const validRoles = ['super-admin', 'editor', 'customer', 'musician', 'guest']
      // for (const role of validRoles) {
      //   const user = await payload.create({
      //     collection: 'users',
      //     data: { email: `${role}@test.com`, password: 'password123', role },
      //   })
      //   expect(user.role).toBe(role)
      // }
    })

    it('should reject an invalid role value', async () => {
      // TODO: attempt to set role to an unlisted value
      // await expect(
      //   payload.create({
      //     collection: 'users',
      //     data: { email: 'bad@test.com', password: 'password123', role: 'hacker' },
      //   })
      // ).rejects.toThrow()
    })

    it('should only allow super-admin to change another users role', async () => {
      // TODO: attempt role update as customer — should be rejected
      // attempt role update as super-admin — should succeed
    })
  })

  describe('access control', () => {
    it('should allow a user to read their own record', async () => {
      // TODO: query users collection as that user
      // const users = await payload.find({
      //   collection: 'users',
      //   overrideAccess: false,
      //   user: { id: testUserId, role: 'customer' },
      // })
      // expect(users.docs.length).toBe(1)
      // expect(users.docs[0].email).toBe(testUser.email)
    })

    it('should prevent a customer from reading another users record', async () => {
      // TODO: query as customer, expect only own record returned
    })

    it('should allow super-admin to read all user records', async () => {
      // TODO: query as super-admin
      // const users = await payload.find({
      //   collection: 'users',
      //   overrideAccess: false,
      //   user: { id: 'admin-id', role: 'super-admin' },
      // })
      // expect(users.totalDocs).toBeGreaterThan(1)
    })

    it('should prevent a customer from deleting a user', async () => {
      // TODO: attempt delete as customer
      // await expect(
      //   payload.delete({
      //     collection: 'users',
      //     id: 'some-other-user-id',
      //     overrideAccess: false,
      //     user: { id: 'customer-id', role: 'customer' },
      //   })
      // ).rejects.toThrow()
    })

    it('should allow super-admin to delete a user', async () => {
      // TODO: attempt delete as super-admin
      // await expect(
      //   payload.delete({
      //     collection: 'users',
      //     id: 'some-user-id',
      //     overrideAccess: false,
      //     user: { id: 'admin-id', role: 'super-admin' },
      //   })
      // ).resolves.toBeDefined()
    })
  })

  describe('fields', () => {
    it('should require an email address', async () => {
      // TODO: create user without email
      // await expect(
      //   payload.create({
      //     collection: 'users',
      //     data: { password: 'password123' },
      //   })
      // ).rejects.toThrow()
    })

    it('should store a stripeCustomerId when provided', async () => {
      // TODO: create user with stripeCustomerId
      // const user = await payload.create({
      //   collection: 'users',
      //   data: {
      //     email: 'stripe@test.com',
      //     password: 'password123',
      //     stripeCustomerId: 'cus_test123',
      //   },
      // })
      // expect(user.stripeCustomerId).toBe('cus_test123')
    })

    it('should store a name when provided', async () => {
      // TODO: create user with name field
      // const user = await payload.create({
      //   collection: 'users',
      //   data: {
      //     email: 'named@test.com',
      //     password: 'password123',
      //     name: 'Jane Smith',
      //   },
      // })
      // expect(user.name).toBe('Jane Smith')
    })
  })
})
