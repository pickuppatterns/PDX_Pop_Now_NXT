import type { CollectionConfig } from 'payload'

export const RadioSubmissions: CollectionConfig = {
  slug: 'radio-submissions',
  labels: { singular: 'Radio Submission', plural: 'Radio Submissions' },
  admin: {
    useAsTitle: 'artistName',
    defaultColumns: ['createdAt', 'artistName', 'name', 'genre', 'radioAppropriate', 'status'],
    group: 'Radio',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Contact Name', required: true },
    { name: 'artistName', type: 'text', label: 'Artist / Band Name', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'phone', type: 'text', label: 'Phone', required: true },
    { name: 'zipCode', type: 'text', label: 'Zip Code' },
    {
      name: 'portlandBased',
      type: 'select',
      label: 'Portland Based',
      options: [
        { label: 'Yes', value: 'YES' },
        { label: 'No', value: 'NO' },
      ],
    },
    { name: 'genre', type: 'text', label: 'Genre' },
    {
      name: 'radioAppropriate',
      type: 'select',
      label: 'Radio Appropriate',
      options: [
        { label: 'Radio Friendly', value: 'radio_friendly' },
        { label: 'Parental Advisory', value: 'parental_advisory' },
      ],
    },
    { name: 'downloadLink', type: 'text', label: 'Download Link / Bandcamp Code' },
    { name: 'website', type: 'text', label: 'Artist Website / Bandcamp / Instagram' },
    { name: 'comments', type: 'textarea', label: 'Comments' },
    { name: 'trackUrl', type: 'text', label: 'Track URL', admin: { readOnly: true } },
    { name: 'trackFilename', type: 'text', label: 'Track Filename', admin: { readOnly: true } },
    { name: 'agreeLibrary', type: 'checkbox', label: 'Agreed: PRP Music Library' },
    {
      name: 'agreeNotCompilation',
      type: 'checkbox',
      label: 'Agreed: Not a Compilation Submission',
    },
    {
      name: 'year',
      type: 'number',
      label: 'Year',
      defaultValue: () => new Date().getFullYear(),
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Under Review', value: 'under_review' },
        { label: 'Added to Library', value: 'added' },
        { label: 'Not Selected', value: 'not_selected' },
      ],
    },
  ],
  timestamps: true,
}
