import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'customer', 'status', 'total', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'super-admin') return true
      return {
        customer: {
          equals: req.user?.id,
        },
      }
    },
    create: () => true,
    update: ({ req }) => req.user?.role === 'super-admin',
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
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
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          admin: {
            description: 'Price at time of purchase in cents',
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Fulfilled', value: 'fulfilled' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
        description: 'Total in cents',
      },
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'trackingNumber',
      type: 'text',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
