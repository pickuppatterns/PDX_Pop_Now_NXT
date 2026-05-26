import type { CollectionConfig } from 'payload'

export const CompilationPhotos: CollectionConfig = {
  slug: 'compilation-photos',
  labels: { singular: 'Submission Photo', plural: 'Submission Photos' },
  admin: {
    group: 'Compilation',
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'year', 'createdAt'],
    description: 'Band photos from compilation submissions. Do not delete.',
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: 'compilation-photos',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  fields: [
    { name: 'alt', type: 'text' },
    {
      name: 'year',
      type: 'number',
      defaultValue: () => new Date().getFullYear(),
      admin: { readOnly: true },
    },
  ],
}
