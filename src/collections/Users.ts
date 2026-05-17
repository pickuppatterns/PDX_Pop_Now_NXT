import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'super-admin') return true
      return {
        id: {
          equals: req.user?.id,
        },
      }
    },
    create: () => true,
    update: ({ req }) => {
      if (req.user?.role === 'super-admin') return true
      return {
        id: {
          equals: req.user?.id,
        },
      }
    },
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'customer',
      access: {
        update: ({ req }) => req.user?.role === 'super-admin',
      },
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Customer', value: 'customer' },
        { label: 'Musician', value: 'musician' },
        { label: 'Guest', value: 'guest' },
      ],
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Set automatically when customer checks out',
      },
    },
    // Future: musician profile relationship
    // {
    //   name: 'musicianProfile',
    //   type: 'relationship',
    //   relationTo: 'musicianProfiles',
    //   admin: {
    //     condition: (data) => data.role === 'musician',
    //   },
    // },
  ],
}
