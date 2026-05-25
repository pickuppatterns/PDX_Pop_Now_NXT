import type { CollectionConfig } from 'payload'

export const CompilationMedia: CollectionConfig = {
  slug: 'compilation-media',
  labels: { singular: 'Submission Asset', plural: 'Submission Assets' },
  admin: {
    group: 'Compilation',
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'fileType', 'year', 'createdAt'],
    description: 'MP3s and band photos from compilation submissions. Do not delete.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: 'compilation-media',
    mimeTypes: ['audio/mpeg', 'audio/wav', 'image/jpeg', 'image/png', 'image/webp'],
  },
  fields: [
    { name: 'alt', type: 'text' },
    {
      name: 'year',
      type: 'number',
      defaultValue: () => new Date().getFullYear(),
      admin: { readOnly: true },
    },
    {
      name: 'fileType',
      type: 'select',
      options: [
        { label: 'Track', value: 'track' },
        { label: 'Band Photo', value: 'band_photo' },
      ],
      admin: { readOnly: true },
    },
  ],
}
