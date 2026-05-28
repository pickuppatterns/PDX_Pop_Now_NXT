import type { CollectionConfig } from 'payload'

export const RadioSongs: CollectionConfig = {
  slug: 'radio-songs',
  labels: { singular: 'Radio Song', plural: 'Radio Songs' },
  admin: {
    group: 'Radio',
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'year', 'createdAt'],
    description: 'MP3s from radio submissions. Private — do not delete.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: 'radio-songs',
    mimeTypes: ['audio/mpeg'],
    filesRequiredOnCreate: false,
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
