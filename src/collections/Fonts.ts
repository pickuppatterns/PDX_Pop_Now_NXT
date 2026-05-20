import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const Fonts: CollectionConfig = {
  slug: 'fonts',
  labels: {
    singular: 'Font',
    plural: 'Fonts',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
    defaultColumns: ['name', 'fontFamily', 'weight', 'style'],
    description:
      'Upload custom fonts to use across the site. Preferred format: .woff2 (smallest file size, best performance). Also supports .woff, .ttf, and .otf.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Font Name',
      admin: {
        description: 'Display name shown in font dropdowns (e.g. "My Brand Font")',
      },
    },
    {
      name: 'fontFamily',
      type: 'text',
      required: true,
      label: 'Font Family (CSS)',
      admin: {
        description:
          'The CSS font-family name used in @font-face (e.g. "MyBrandFont"). No spaces — use dashes or camelCase.',
      },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Font File',
      admin: {
        description:
          'Preferred: .woff2 — best compression and performance. Also accepts .woff, .ttf, and .otf.',
      },
    },
    {
      name: 'weight',
      type: 'select',
      label: 'Font Weight',
      defaultValue: '400',
      options: [
        { label: 'Thin (100)', value: '100' },
        { label: 'Extra Light (200)', value: '200' },
        { label: 'Light (300)', value: '300' },
        { label: 'Regular (400)', value: '400' },
        { label: 'Medium (500)', value: '500' },
        { label: 'Semi Bold (600)', value: '600' },
        { label: 'Bold (700)', value: '700' },
        { label: 'Extra Bold (800)', value: '800' },
        { label: 'Black (900)', value: '900' },
      ],
    },
    {
      name: 'style',
      type: 'select',
      label: 'Font Style',
      defaultValue: 'normal',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Italic', value: 'italic' },
        { label: 'Oblique', value: 'oblique' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      admin: {
        description: 'Optional — license info, usage notes, or source URL.',
      },
    },
  ],
}
