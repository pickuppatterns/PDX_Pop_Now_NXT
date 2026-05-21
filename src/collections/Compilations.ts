import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'
import { slugField } from 'payload'

export const Compilations: CollectionConfig = {
  slug: 'compilations',
  labels: {
    singular: 'Compilation',
    plural: 'Compilations',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'volume', 'updatedAt'],
    group: 'PDX Pop Now!',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Album Title',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'volume',
          type: 'number',
          label: 'Volume Number',
          admin: { width: '50%' },
        },
        {
          name: 'year',
          type: 'number',
          label: 'Year',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'artwork',
      type: 'upload',
      relationTo: 'media',
      label: 'Album Artwork',
    },
    {
      name: 'artworkCredit',
      type: 'text',
      label: 'Artwork Credit',
      admin: {
        description: 'Designer name e.g. "Layout & Design — Erin Norris"',
      },
    },
    {
      name: 'albumNotes',
      type: 'richText',
      label: 'Album Notes',
    },
    {
      name: 'streamingLinks',
      type: 'array',
      label: 'Streaming & Purchase Links',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Bandcamp', value: 'bandcamp' },
            { label: 'Spotify', value: 'spotify' },
            { label: 'Apple Music', value: 'apple' },
            { label: 'SoundCloud', value: 'soundcloud' },
            { label: 'YouTube Music', value: 'youtube' },
            { label: 'Other', value: 'other' },
          ],
        },
        { name: 'url', type: 'text', required: true },
        { name: 'label', type: 'text', label: 'Button Label (optional)' },
      ],
    },
    {
      name: 'tracks',
      type: 'array',
      label: 'Track Listing',
      admin: {
        description: 'Add tracks in order. Use disc field for double albums.',
        components: {
          RowLabel: '@/collections/Compilations/RowLabel#TrackRowLabel',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'disc',
              type: 'select',
              label: 'Disc',
              defaultValue: '1',
              admin: { width: '20%' },
              options: [
                { label: 'Disc 1', value: '1' },
                { label: 'Disc 2', value: '2' },
                { label: 'Disc 3', value: '3' },
              ],
            },
            {
              name: 'number',
              type: 'number',
              label: 'Track #',
              admin: { width: '20%' },
            },
            {
              name: 'artist',
              type: 'text',
              required: true,
              admin: { width: '30%' },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Song Title',
              admin: { width: '30%' },
            },
          ],
        },
        {
          name: 'duration',
          type: 'text',
          label: 'Duration (e.g. 3:42)',
        },
      ],
    },
    {
      name: 'meta',
      label: 'SEO',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Meta Title',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Meta Description',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'OG Image',
        },
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
