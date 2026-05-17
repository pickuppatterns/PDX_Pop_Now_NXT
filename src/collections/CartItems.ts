import type { CollectionConfig } from 'payload'

export const CartItems: CollectionConfig = {
  slug: 'cart-items',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'product', 'quantity', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'super-admin') return true
      return {
        user: {
          equals: req.user?.id,
        },
      }
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (req.user?.role === 'super-admin') return true
      return {
        user: {
          equals: req.user?.id,
        },
      }
    },
    delete: ({ req }) => {
      if (req.user?.role === 'super-admin') return true
      return {
        user: {
          equals: req.user?.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 1,
    },
  ],
  timestamps: true,
}
