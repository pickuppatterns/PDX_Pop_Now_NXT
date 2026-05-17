import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { seedTestUser, cleanupTestUser } from '../helpers/seedUser'

let payload: Payload

/**
 * Products Collection Tests
 * -------------------------
 * Uses Payload's local API directly — no HTTP overhead.
 * Fill in each TODO block with your assertions.
 */

describe('Products collection', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    await seedTestUser('products')
  })

  afterAll(async () => {
    await cleanupTestUser('products')
    // TODO: clean up any products created during tests
    // await payload.delete({
    //   collection: 'products',
    //   where: { slug: { contains: 'test-product' } },
    // })
  })

  describe('fields', () => {
    it('should require a name', async () => {
      // TODO: create product without name
      // await expect(
      //   payload.create({
      //     collection: 'products',
      //     data: { slug: 'test-product', price: 2999 },
      //   })
      // ).rejects.toThrow()
    })

    it('should require a slug', async () => {
      // TODO: create product without slug
      // await expect(
      //   payload.create({
      //     collection: 'products',
      //     data: { name: 'Test Product', price: 2999 },
      //   })
      // ).rejects.toThrow()
    })

    it('should require a price', async () => {
      // TODO: create product without price
      // await expect(
      //   payload.create({
      //     collection: 'products',
      //     data: { name: 'Test Product', slug: 'test-product' },
      //   })
      // ).rejects.toThrow()
    })

    it('should store price in cents', async () => {
      // TODO: create product with price 2999
      // const product = await payload.create({
      //   collection: 'products',
      //   data: { name: 'Test Product', slug: 'test-product-cents', price: 2999 },
      // })
      // expect(product.price).toBe(2999)
    })

    it('should reject a negative price', async () => {
      // TODO: create product with price -100
      // await expect(
      //   payload.create({
      //     collection: 'products',
      //     data: { name: 'Test Product', slug: 'test-negative', price: -100 },
      //   })
      // ).rejects.toThrow()
    })

    it('should default inventory to 0', async () => {
      // TODO: create product without inventory
      // const product = await payload.create({
      //   collection: 'products',
      //   data: { name: 'Test Product', slug: 'test-inventory', price: 999 },
      // })
      // expect(product.inventory).toBe(0)
    })

    it('should default status to draft', async () => {
      // TODO: create product without status
      // const product = await payload.create({
      //   collection: 'products',
      //   data: { name: 'Test Product', slug: 'test-status', price: 999 },
      // })
      // expect(product.status).toBe('draft')
    })

    it('should only allow valid status values', async () => {
      // TODO: attempt to set status to an unlisted value
      // await expect(
      //   payload.create({
      //     collection: 'products',
      //     data: { name: 'Test', slug: 'test-bad-status', price: 999, status: 'invalid' },
      //   })
      // ).rejects.toThrow()
    })

    it('should enforce unique slugs', async () => {
      // TODO: create two products with the same slug
      // await payload.create({
      //   collection: 'products',
      //   data: { name: 'Product One', slug: 'duplicate-slug', price: 999 },
      // })
      // await expect(
      //   payload.create({
      //     collection: 'products',
      //     data: { name: 'Product Two', slug: 'duplicate-slug', price: 999 },
      //   })
      // ).rejects.toThrow()
    })

    it('should accept an optional stripeProductId', async () => {
      // TODO: create product with stripeProductId
      // const product = await payload.create({
      //   collection: 'products',
      //   data: {
      //     name: 'Stripe Product',
      //     slug: 'test-stripe-product',
      //     price: 999,
      //     stripeProductId: 'prod_test123',
      //   },
      // })
      // expect(product.stripeProductId).toBe('prod_test123')
    })

    it('should accept an optional category relationship', async () => {
      // TODO: create a category first, then create product with that category
      // const category = await payload.create({
      //   collection: 'categories',
      //   data: { title: 'Test Category' },
      // })
      // const product = await payload.create({
      //   collection: 'products',
      //   data: {
      //     name: 'Categorized Product',
      //     slug: 'test-categorized',
      //     price: 999,
      //     category: category.id,
      //   },
      // })
      // expect(product.category).toBeDefined()
    })

    it('should accept multiple images', async () => {
      // TODO: create product with images array
      // requires media documents to exist first
      // const product = await payload.create({
      //   collection: 'products',
      //   data: {
      //     name: 'Product With Images',
      //     slug: 'test-images',
      //     price: 999,
      //     images: [{ image: 'media-doc-id' }],
      //   },
      // })
      // expect(product.images.length).toBeGreaterThan(0)
    })
  })

  describe('access control', () => {
    it('should allow anyone to read active products', async () => {
      // TODO: query products without a user (guest)
      // const products = await payload.find({
      //   collection: 'products',
      //   overrideAccess: false,
      //   where: { status: { equals: 'active' } },
      // })
      // expect(products.docs.length).toBeGreaterThan(0)
    })

    it('should hide draft products from customers', async () => {
      // TODO: query products as customer
      // expect no draft products in results
      // const products = await payload.find({
      //   collection: 'products',
      //   overrideAccess: false,
      //   user: { id: 'customer-id', role: 'customer' },
      //   where: { status: { equals: 'draft' } },
      // })
      // expect(products.docs.length).toBe(0)
    })

    it('should allow editor to create a product', async () => {
      // TODO: create product as editor
      // await expect(
      //   payload.create({
      //     collection: 'products',
      //     overrideAccess: false,
      //     user: { id: 'editor-id', role: 'editor' },
      //     data: { name: 'Editor Product', slug: 'editor-product', price: 999 },
      //   })
      // ).resolves.toBeDefined()
    })

    it('should prevent customer from creating a product', async () => {
      // TODO: attempt product creation as customer
      // await expect(
      //   payload.create({
      //     collection: 'products',
      //     overrideAccess: false,
      //     user: { id: 'customer-id', role: 'customer' },
      //     data: { name: 'Customer Product', slug: 'customer-product', price: 999 },
      //   })
      // ).rejects.toThrow()
    })

    it('should prevent customer from updating a product', async () => {
      // TODO: attempt product update as customer
      // await expect(
      //   payload.update({
      //     collection: 'products',
      //     id: 'some-product-id',
      //     overrideAccess: false,
      //     user: { id: 'customer-id', role: 'customer' },
      //     data: { price: 100 },
      //   })
      // ).rejects.toThrow()
    })

    it('should allow super-admin to delete a product', async () => {
      // TODO: delete product as super-admin
      // await expect(
      //   payload.delete({
      //     collection: 'products',
      //     id: 'some-product-id',
      //     overrideAccess: false,
      //     user: { id: 'admin-id', role: 'super-admin' },
      //   })
      // ).resolves.toBeDefined()
    })

    it('should prevent customer from deleting a product', async () => {
      // TODO: attempt delete as customer
      // await expect(
      //   payload.delete({
      //     collection: 'products',
      //     id: 'some-product-id',
      //     overrideAccess: false,
      //     user: { id: 'customer-id', role: 'customer' },
      //   })
      // ).rejects.toThrow()
    })
  })
})
