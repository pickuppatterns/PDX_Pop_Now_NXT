import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

let payload: Payload

/**
 * Orders Collection Tests
 * -----------------------
 * Uses Payload's local API directly — no HTTP overhead.
 * Fill in each TODO block with your assertions.
 */

describe('Orders collection', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    await seedTestUser('orders')
  })

  afterAll(async () => {
    await cleanupTestUser('orders')
    // TODO: clean up any orders created during tests
    // await payload.delete({
    //   collection: 'orders',
    //   where: { notes: { contains: 'test-order' } },
    // })
  })

  describe('fields', () => {
    it('should require a customer relationship', async () => {
      // TODO: create order without customer
      // await expect(
      //   payload.create({
      //     collection: 'orders',
      //     data: {
      //       items: [{ product: 'product-id', quantity: 1, price: 999 }],
      //       total: 999,
      //     },
      //   })
      // ).rejects.toThrow()
    })

    it('should require at least one line item', async () => {
      // TODO: create order with empty items array
      // await expect(
      //   payload.create({
      //     collection: 'orders',
      //     data: { customer: 'user-id', items: [], total: 0 },
      //   })
      // ).rejects.toThrow()
    })

    it('should require a quantity of at least 1 per line item', async () => {
      // TODO: create order with item quantity 0
      // await expect(
      //   payload.create({
      //     collection: 'orders',
      //     data: {
      //       customer: 'user-id',
      //       items: [{ product: 'product-id', quantity: 0, price: 999 }],
      //       total: 0,
      //     },
      //   })
      // ).rejects.toThrow()
    })

    it('should require a price per line item', async () => {
      // TODO: create order item without price
      // await expect(
      //   payload.create({
      //     collection: 'orders',
      //     data: {
      //       customer: 'user-id',
      //       items: [{ product: 'product-id', quantity: 1 }],
      //       total: 999,
      //     },
      //   })
      // ).rejects.toThrow()
    })

    it('should default status to pending', async () => {
      // TODO: create order without status
      // const order = await payload.create({
      //   collection: 'orders',
      //   data: {
      //     customer: 'user-id',
      //     items: [{ product: 'product-id', quantity: 1, price: 999 }],
      //     total: 999,
      //   },
      // })
      // expect(order.status).toBe('pending')
    })

    it('should only allow valid status values', async () => {
      // TODO: attempt to set status to unlisted value
      // await expect(
      //   payload.create({
      //     collection: 'orders',
      //     data: {
      //       customer: 'user-id',
      //       items: [{ product: 'product-id', quantity: 1, price: 999 }],
      //       total: 999,
      //       status: 'invalid-status',
      //     },
      //   })
      // ).rejects.toThrow()
    })

    it('should store total in cents', async () => {
      // TODO: create order with total 5999
      // const order = await payload.create({
      //   collection: 'orders',
      //   data: {
      //     customer: 'user-id',
      //     items: [{ product: 'product-id', quantity: 1, price: 5999 }],
      //     total: 5999,
      //   },
      // })
      // expect(order.total).toBe(5999)
    })

    it('should accept an optional stripePaymentIntentId', async () => {
      // TODO: create order with stripePaymentIntentId
      // const order = await payload.create({
      //   collection: 'orders',
      //   data: {
      //     customer: 'user-id',
      //     items: [{ product: 'product-id', quantity: 1, price: 999 }],
      //     total: 999,
      //     stripePaymentIntentId: 'pi_test123',
      //   },
      // })
      // expect(order.stripePaymentIntentId).toBe('pi_test123')
    })

    it('should accept an optional tracking number', async () => {
      // TODO: create order with trackingNumber
      // const order = await payload.create({
      //   collection: 'orders',
      //   data: {
      //     customer: 'user-id',
      //     items: [{ product: 'product-id', quantity: 1, price: 999 }],
      //     total: 999,
      //     trackingNumber: '1Z999AA10123456784',
      //   },
      // })
      // expect(order.trackingNumber).toBe('1Z999AA10123456784')
    })

    it('should accept optional notes', async () => {
      // TODO: create order with notes
      // const order = await payload.create({
      //   collection: 'orders',
      //   data: {
      //     customer: 'user-id',
      //     items: [{ product: 'product-id', quantity: 1, price: 999 }],
      //     total: 999,
      //     notes: 'test-order please leave at door',
      //   },
      // })
      // expect(order.notes).toBe('test-order please leave at door')
    })

    it('should store a timestamp on creation', async () => {
      // TODO: create order and check createdAt
      // const order = await payload.create({
      //   collection: 'orders',
      //   data: {
      //     customer: 'user-id',
      //     items: [{ product: 'product-id', quantity: 1, price: 999 }],
      //     total: 999,
      //   },
      // })
      // expect(order.createdAt).toBeDefined()
    })
  })

  describe('status transitions', () => {
    it('should move from pending to paid', async () => {
      // TODO: create order then update status to paid
      // const order = await payload.create({ ... })
      // const updated = await payload.update({
      //   collection: 'orders',
      //   id: order.id,
      //   data: { status: 'paid' },
      // })
      // expect(updated.status).toBe('paid')
    })

    it('should move from paid to fulfilled', async () => {
      // TODO: update order status from paid to fulfilled
      // expect(order.status).toBe('fulfilled')
    })

    it('should move from fulfilled to shipped', async () => {
      // TODO: update order status from fulfilled to shipped
      // expect(order.status).toBe('shipped')
    })

    it('should move from shipped to delivered', async () => {
      // TODO: update order status from shipped to delivered
      // expect(order.status).toBe('delivered')
    })

    it('should allow cancellation from pending', async () => {
      // TODO: update order status to cancelled
      // expect(order.status).toBe('cancelled')
    })

    it('should allow refund from paid', async () => {
      // TODO: update order status to refunded
      // expect(order.status).toBe('refunded')
    })
  })

  describe('access control', () => {
    it('should allow a customer to read their own orders', async () => {
      // TODO: query orders as customer
      // const orders = await payload.find({
      //   collection: 'orders',
      //   overrideAccess: false,
      //   user: { id: 'customer-id', role: 'customer' },
      // })
      // expect(orders.docs.every(o => o.customer === 'customer-id')).toBe(true)
    })

    it('should prevent a customer from reading another customers orders', async () => {
      // TODO: query orders as customer
      // expect other customer orders to be inaccessible
      // expect(orders.docs.some(o => o.customer !== 'customer-id')).toBe(false)
    })

    it('should allow super-admin to read all orders', async () => {
      // TODO: query orders as super-admin
      // const orders = await payload.find({
      //   collection: 'orders',
      //   overrideAccess: false,
      //   user: { id: 'admin-id', role: 'super-admin' },
      // })
      // expect(orders.totalDocs).toBeGreaterThan(0)
    })

    it('should prevent a customer from updating an order', async () => {
      // TODO: attempt order update as customer
      // await expect(
      //   payload.update({
      //     collection: 'orders',
      //     id: 'some-order-id',
      //     overrideAccess: false,
      //     user: { id: 'customer-id', role: 'customer' },
      //     data: { status: 'cancelled' },
      //   })
      // ).rejects.toThrow()
    })

    it('should allow super-admin to update any order', async () => {
      // TODO: update order as super-admin
      // await expect(
      //   payload.update({
      //     collection: 'orders',
      //     id: 'some-order-id',
      //     overrideAccess: false,
      //     user: { id: 'admin-id', role: 'super-admin' },
      //     data: { status: 'fulfilled' },
      //   })
      // ).resolves.toBeDefined()
    })

    it('should prevent a customer from deleting an order', async () => {
      // TODO: attempt delete as customer
      // await expect(
      //   payload.delete({
      //     collection: 'orders',
      //     id: 'some-order-id',
      //     overrideAccess: false,
      //     user: { id: 'customer-id', role: 'customer' },
      //   })
      // ).rejects.toThrow()
    })

    it('should allow super-admin to delete an order', async () => {
      // TODO: delete order as super-admin
      // await expect(
      //   payload.delete({
      //     collection: 'orders',
      //     id: 'some-order-id',
      //     overrideAccess: false,
      //     user: { id: 'admin-id', role: 'super-admin' },
      //   })
      // ).resolves.toBeDefined()
    })
  })
})
