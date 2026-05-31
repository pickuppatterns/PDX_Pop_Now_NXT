import type { Block } from 'payload'

// ─── Hero Block ───────────────────────────────────────────────────────────────
export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'subheading',
      type: 'textarea',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'overlay',
      type: 'select',
      defaultValue: 'dark',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
      ],
    },
    {
      name: 'ctas',
      type: 'array',
      label: 'Call to Action Buttons',
      maxRows: 3,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        {
          name: 'style',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
          ],
        },
      ],
    },
    {
      name: 'textAlign',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
}

// ─── Sponsor Grid Block ───────────────────────────────────────────────────────
export const SponsorGridBlock: Block = {
  slug: 'sponsorGrid',
  labels: { singular: 'Sponsor Grid', plural: 'Sponsor Grids' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Our Sponsors',
    },
    {
      name: 'sponsors',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'url', type: 'text' },
        {
          name: 'logoFilters',
          type: 'group',
          label: 'Logo Display',
          admin: {
            description: 'Adjust logo appearance for dark/light backgrounds',
          },
          fields: [
            {
              name: 'invert',
              type: 'checkbox',
              label: 'Invert colors (white logo on dark bg)',
              defaultValue: false,
            },
            {
              name: 'opacity',
              type: 'number',
              label: 'Opacity (0-100)',
              defaultValue: 100,
              min: 0,
              max: 100,
            },
            {
              name: 'brightness',
              type: 'number',
              label: 'Brightness (100 = normal)',
              defaultValue: 100,
              min: 0,
              max: 200,
            },
            {
              name: 'contrast',
              type: 'number',
              label: 'Contrast (100 = normal)',
              defaultValue: 100,
              min: 0,
              max: 200,
            },
          ],
        },
        {
          name: 'tier',
          type: 'select',
          defaultValue: 'supporter',
          options: [
            { label: 'Presenting', value: 'presenting' },
            { label: 'Gold', value: 'gold' },
            { label: 'Silver', value: 'silver' },
            { label: 'Supporter', value: 'supporter' },
          ],
        },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '4',
      options: [
        { label: '2 columns', value: '2' },
        { label: '3 columns', value: '3' },
        { label: '4 columns', value: '4' },
        { label: '6 columns', value: '6' },
      ],
    },
  ],
}

// ─── Event List Block ─────────────────────────────────────────────────────────
export const EventListBlock: Block = {
  slug: 'eventList',
  labels: { singular: 'Event List', plural: 'Event Lists' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Upcoming Events',
    },
    {
      name: 'events',
      type: 'array',
      required: true,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'venue', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'url', type: 'text', label: 'Tickets / Event URL' },
        { name: 'free', type: 'checkbox', defaultValue: true, label: 'Free admission' },
        { name: 'allAges', type: 'checkbox', defaultValue: true, label: 'All ages' },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'list',
      options: [
        { label: 'List', value: 'list' },
        { label: 'Grid', value: 'grid' },
        { label: 'Cards', value: 'cards' },
      ],
    },
  ],
}

// ─── Compilation Block ────────────────────────────────────────────────────────
export const CompilationBlock: Block = {
  slug: 'compilation',
  labels: { singular: 'Compilation CD', plural: 'Compilation CDs' },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Album Title',
    },
    {
      name: 'volume',
      type: 'number',
      label: 'Volume Number',
    },
    {
      name: 'year',
      type: 'number',
    },
    {
      name: 'artwork',
      type: 'upload',
      relationTo: 'media',
      label: 'Album Artwork',
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'tracks',
      type: 'array',
      label: 'Track Listing',
      fields: [
        { name: 'number', type: 'number', label: 'Track #' },
        {
          name: 'disc',
          type: 'select',
          label: 'Disc',
          defaultValue: '1',
          options: [
            { label: 'Disc 1', value: '1' },
            { label: 'Disc 2', value: '2' },
            { label: 'Disc 3', value: '3' },
          ],
        },
        { name: 'artist', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'duration', type: 'text', label: 'Duration (e.g. 3:42)' },
      ],
    },
    {
      name: 'streamingLinks',
      type: 'array',
      label: 'Streaming / Purchase Links',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Bandcamp', value: 'bandcamp' },
            { label: 'Spotify', value: 'spotify' },
            { label: 'Apple Music', value: 'apple' },
            { label: 'Soundcloud', value: 'soundcloud' },
            { label: 'YouTube Music', value: 'youtube' },
            { label: 'Other', value: 'other' },
          ],
        },
        { name: 'url', type: 'text', required: true },
        { name: 'label', type: 'text', label: 'Button label (optional)' },
      ],
    },
  ],
}

// ─── Team Grid Block ──────────────────────────────────────────────────────────
export const TeamGridBlock: Block = {
  slug: 'teamGrid',
  labels: { singular: 'Team Grid', plural: 'Team Grids' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Our Team',
    },
    {
      name: 'subheading',
      type: 'textarea',
    },
    {
      name: 'members',
      type: 'array',
      required: true,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text', required: true },
        { name: 'bio', type: 'textarea' },
        { name: 'email', type: 'email' },
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'socialUrls',
          type: 'array',
          label: 'Social Links',
          fields: [
            {
              name: 'platform',
              type: 'select',
              options: [
                { label: 'Instagram', value: 'instagram' },
                { label: 'Twitter/X', value: 'twitter' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Website', value: 'website' },
              ],
            },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 columns', value: '2' },
        { label: '3 columns', value: '3' },
        { label: '4 columns', value: '4' },
      ],
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'cards',
      options: [
        { label: 'Cards', value: 'cards' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'List', value: 'list' },
      ],
    },
  ],
}

// ─── Newsletter Signup Block ──────────────────────────────────────────────────
export const NewsletterSignupBlock: Block = {
  slug: 'newsletterSignup',
  labels: {
    singular: 'Newsletter Signup',
    plural: 'Newsletter Signups',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      defaultValue: 'Stay in the loop',
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Subheading',
      defaultValue: 'Get PDX Pop Now! news, festival updates, and announcements delivered to your inbox.',
    },
    {
      name: 'buttonLabel',
      type: 'text',
      label: 'Button Label',
      defaultValue: 'Subscribe',
    },
    {
      name: 'theme',
      type: 'select',
      label: 'Theme',
      defaultValue: 'dark',
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
      ],
    },
  ],
}
