import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { seedTestUser, cleanupTestUser } from '../helpers/seedUser'

let payload: Payload

/**
 * CartItems Collection Tests
 * --------------------------
 * Uses Payload's local API directly — no HTTP overhead.
 * Fill in each TODO block with your assertions.
 */

describe('CartItems collection', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    await seedTestUser('cartItems')
  })

  afterAll(async () => {
    await cleanupTestUser('cartItems')
    // TODO: clean up any cart items created during tests
    // await payload.delete({
    //   collection: 'cart-items',
    //   where: { user: { equals: 'test-user-id' } },
    // })
  })

  describe('fields', () => {
    it('should require a user relationship', async () => {
      // TODO: create cart item without user
      // await expect(
      //   payload.create({
      //     collection: 'cart-items',
      //     data: { product: 'product-id', quantity: 1 },
      //   })
      // ).rejects.toThrow()
    })

    it('should require a product relationship', async () => {
      // TODO: create cart item without product
      // await expect(
      //   payload.create({
      //     collection: 'cart-items',
      //     data: { user: 'user-id', quantity: 1 },
      //   })
      // ).rejects.toThrow()
    })

    it('should require a quantity', async () => {
      // TODO: create cart item without quantity
      // await expect(
      //   payload.create({
      //     collection: 'cart-items',
      //     data: { user: 'user-id', product: 'product-id' },
      //   })
      // ).rejects.toThrow()
    })

    it('should default quantity to 1', async () => {
      // TODO: create cart item without specifying quantity
      // const cartItem = await payload.create({
      //   collection: 'cart-items',
      //   data: { user: 'user-id', product: 'product-id' },
      // })
      // expect(cartItem.quantity).toBe(1)
    })

    it('should reject a quantity below 1', async () => {
      // TODO: create cart item with quantity 0
      // await expect(
      //   payload.create({
      //     collection: 'cart-items',
      //     data: { user: 'user-id', product: 'product-id', quantity: 0 },
      //   })
      // ).rejects.toThrow()
    })

    it('should reject a negative quantity', async () => {
      // TODO: create cart item with quantity -1
      // await expect(
      //   payload.create({
      //     collection: 'cart-items',
      //     data: { user: 'user-id', product: 'product-id', quantity: -1 },
      //   })
      // ).rejects.toThrow()
    })

    it('should store a timestamp on creation', async () => {
      // TODO: create cart item and check createdAt
      // const cartItem = await payload.create({
      //   collection: 'cart-items',
      //   data: { user: 'user-id', product: 'product-id', quantity: 1 },
      // })
      // expect(cartItem.createdAt).toBeDefined()
    })

    it('should update timestamp on quantity change', async () => {
      // TODO: create then update cart item
      // const cartItem = await payload.create({
      //   collection: 'cart-items',
      //   data: { user: 'user-id', product: 'product-id', quantity: 1 },
      // })
      // const updated = await payload.update({
      //   collection: 'cart-items',
      //   id: cartItem.id,
      //   data: { quantity: 2 },
      // })
      // expect(new Date(updated.updatedAt) > new Date(cartItem.createdAt)).toBe(true)
    })
  })

  describe('access control', () => {
    it('should require a logged in user to create a cart item', async () => {
      // TODO: attempt to create cart item as guest
      // await expect(
      //   payload.create({
      //     collection: 'cart-items',
      //     overrideAccess: false,
      //     data: { user: 'user-id', product: 'product-id', quantity: 1 },
      //   })
      // ).rejects.toThrow()
    })

    it('should allow a customer to create their own cart item', async () => {
      // TODO: create cart item as customer
      // await expect(
      //   payload.create({
      //     collection: 'cart-items',
      //     overrideAccess: false,
      //     user: { id: 'customer-id', role: 'customer' },
      //     data: { user: 'customer-id', product: 'product-id', quantity: 1 },
      //   })
      // ).resolves.toBeDefined()
    })

    it('should allow a customer to read their own cart items', async () => {
      // TODO: query cart items as customer
      // const items = await payload.find({
      //   collection: 'cart-items',
      //   overrideAccess: false,
      //   user: { id: 'customer-id', role: 'customer' },
      // })
      // expect(items.docs.every(i => i.user === 'customer-id')).toBe(true)
    })

    it('should prevent a customer from reading another users cart', async () => {
      // TODO: query cart items as customer
      // expect other users items to be inaccessible
      // expect(items.docs.some(i => i.user !== 'customer-id')).toBe(false)
    })

    it('should allow a customer to update their own cart item', async () => {
      // TODO: update quantity as customer
      // await expect(
      //   payload.update({
      //     collection: 'cart-items',
      //     id: 'own-cart-item-id',
      //     overrideAccess: false,
      //     user: { id: 'customer-id', role: 'customer' },
      //     data: { quantity: 3 },
      //   })
      // ).resolves.toBeDefined()
    })

    it('should prevent a customer from updating another users cart item', async () => {
      // TODO: attempt update on another users cart item
      // await expect(
      //   payload.update({
      //     collection: 'cart-items',
      //     id: 'other-users-cart-item-id',
      //     overrideAccess: false,
      //     user: { id: 'customer-id', role: 'customer' },
      //     data: { quantity: 3 },
      //   })
      // ).rejects.toThrow()
    })

    it('should allow a customer to delete their own cart item', async () => {
      // TODO: delete cart item as customer
      // await expect(
      //   payload.delete({
      //     collection: 'cart-items',
      //     id: 'own-cart-item-id',
      //     overrideAccess: false,
      //     user: { id: 'customer-id', role: 'customer' },
      //   })
      // ).resolves.toBeDefined()
    })

    it('should prevent a customer from deleting another users cart item', async () => {
      // TODO: attempt delete on another users cart item
      // await expect(
      //   payload.delete({
      //     collection: 'cart-items',
      //     id: 'other-users-cart-item-id',
      //     overrideAccess: false,
      //     user: { id: 'customer-id', role: 'customer' },
      //   })
      // ).rejects.toThrow()
    })

    it('should allow super-admin to read all cart items', async () => {
      // TODO: query cart items as super-admin
      // const items = await payload.find({
      //   collection: 'cart-items',
      //   overrideAccess: false,
      //   user: { id: 'admin-id', role: 'super-admin' },
      // })
      // expect(items.totalDocs).toBeGreaterThan(0)
    })

    it('should allow super-admin to delete any cart item', async () => {
      // TODO: delete any cart item as super-admin
      // await expect(
      //   payload.delete({
      //     collection: 'cart-items',
      //     id: 'any-cart-item-id',
      //     overrideAccess: false,
      //     user: { id: 'admin-id', role: 'super-admin' },
      //   })
      // ).resolves.toBeDefined()
    })
  })

  describe('cart operations', () => {
    it('should allow quantity to be incremented', async () => {
      // TODO: update cart item quantity from 1 to 2
      // const updated = await payload.update({
      //   collection: 'cart-items',
      //   id: 'cart-item-id',
      //   data: { quantity: 2 },
      // })
      // expect(updated.quantity).toBe(2)
    })

    it('should allow quantity to be decremented', async () => {
      // TODO: update cart item quantity from 2 to 1
      // const updated = await payload.update({
      //   collection: 'cart-items',
      //   id: 'cart-item-id',
      //   data: { quantity: 1 },
      // })
      // expect(updated.quantity).toBe(1)
    })

    it('should clear all cart items for a user on checkout', async () => {
      // TODO: simulate checkout — delete all cart items for user
      // await payload.delete({
      //   collection: 'cart-items',
      //   where: { user: { equals: 'customer-id' } },
      // })
      // const items = await payload.find({
      //   collection: 'cart-items',
      //   where: { user: { equals: 'customer-id' } },
      // })
      // expect(items.totalDocs).toBe(0)
    })

    it('should allow multiple products in the same cart', async () => {
      // TODO: create two cart items for same user different products
      // const item1 = await payload.create({ ... product-id-1 ... })
      // const item2 = await payload.create({ ... product-id-2 ... })
      // const items = await payload.find({
      //   collection: 'cart-items',
      //   where: { user: { equals: 'customer-id' } },
      // })
      // expect(items.totalDocs).toBe(2)
    })

    it('should not allow duplicate product entries in the same cart', async () => {
      // TODO: create two cart items for same user same product
      // expect second creation to fail or merge quantity
      // await payload.create({ user: 'customer-id', product: 'product-id', quantity: 1 })
      // await expect(
      //   payload.create({ user: 'customer-id', product: 'product-id', quantity: 1 })
      // ).rejects.toThrow()
    })
  })
})
