import type { CollectionConfig } from 'payload'

export const CompilationSongs: CollectionConfig = {
  slug: 'compilation-songs',
  labels: { singular: 'Submission Song', plural: 'Submission Songs' },
  admin: {
    group: 'Compilation',
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'year', 'createdAt'],
    description: 'MP3s from compilation submissions. Private — do not delete.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: 'compilation-songs',
    mimeTypes: ['audio/mpeg', 'audio/wav'],
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
