import type { Block } from 'payload'

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
