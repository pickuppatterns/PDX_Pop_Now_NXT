import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'
import { slugField } from 'payload'

export const FestivalGFXArtists: CollectionConfig = {
  slug: 'festival-gfx-artists',
  labels: {
    singular: 'Festival Graphic Artist',
    plural: 'Festival Graphic Artists',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'artistName',
    defaultColumns: ['artistName', 'year', 'updatedAt'],
    group: 'PDX Pop Now!',
  },
  fields: [
    {
      name: 'artistName',
      type: 'text',
      required: true,
      label: 'Artist Name',
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      label: 'Festival Year',
    },
    {
      name: 'bio',
      type: 'richText',
      label: 'Artist Bio',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured Image / Artwork',
    },
    {
      name: 'portfolioImages',
      type: 'array',
      label: 'Portfolio Images',
      admin: {
        description: 'Additional artwork or portfolio images',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Caption (optional)',
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Links',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Instagram', value: 'instagram' },
            { label: 'Website', value: 'website' },
            { label: 'Behance', value: 'behance' },
            { label: 'Dribbble', value: 'dribbble' },
            { label: 'Twitter/X', value: 'twitter' },
            { label: 'Other', value: 'other' },
          ],
        },
        { name: 'url', type: 'text', required: true },
        { name: 'handle', type: 'text', label: 'Handle (e.g. @bextattoos)' },
      ],
    },
    {
      name: 'compilationVolume',
      type: 'relationship',
      relationTo: 'compilations',
      label: 'Associated Compilation',
      admin: {
        description: 'The compilation CD this artist designed artwork for',
      },
    },
    {
      name: 'meta',
      label: 'SEO',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', label: 'Meta Title' },
        { name: 'description', type: 'textarea', label: 'Meta Description' },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'OG Image' },
      ],
    },
    slugField(),
  ],
  versions: {
    drafts: {
      autosave: { interval: 100 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
