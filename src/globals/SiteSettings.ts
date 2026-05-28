import type { GlobalConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            { name: 'siteTitle', type: 'text', label: 'Site Title', maxLength: 250 },
            { name: 'tagline', type: 'text', label: 'Tagline', maxLength: 205 },
            { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo' },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Favicon',
              admin: { description: 'Recommended: 32x32px or 64x64px PNG or ICO file' },
            },
          ],
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'socialLinks',
              type: 'group',
              label: 'Social Media Links',
              fields: [
                { name: 'facebook', type: 'text', label: 'Facebook URL' },
                { name: 'instagram', type: 'text', label: 'Instagram URL' },
                { name: 'twitter', type: 'text', label: 'Twitter / X URL' },
                { name: 'youtube', type: 'text', label: 'YouTube URL' },
                { name: 'vimeo', type: 'text', label: 'Vimeo URL' },
                { name: 'linkedin', type: 'text', label: 'LinkedIn URL' },
                { name: 'bandcamp', type: 'text', label: 'Bandcamp URL' },
                { name: 'soundcloud', type: 'text', label: 'SoundCloud URL' },
              ],
            },
            {
              name: 'socialAtHeader',
              type: 'checkbox',
              label: 'Show social links in header',
              defaultValue: false,
            },
            {
              name: 'socialAtFooter',
              type: 'checkbox',
              label: 'Show social links in footer',
              defaultValue: true,
            },
            {
              name: 'socialAtSubFooter',
              type: 'checkbox',
              label: 'Show social links in sub-footer',
              defaultValue: false,
            },
          ],
        },
        {
          label: 'Colors',
          fields: [
            {
              name: 'colors',
              type: 'group',
              label: 'Brand Colors',
              fields: [
                {
                  name: 'brandColor',
                  type: 'text',
                  label: 'Brand Color',
                  defaultValue: '#ec2680',
                  admin: { description: 'Hex, HSL, or RGBA value' },
                },
                {
                  name: 'gradientColor1',
                  type: 'text',
                  label: 'Gradient Color #1',
                  admin: { description: 'Hex, HSL, or RGBA value' },
                },
                {
                  name: 'gradientColor2',
                  type: 'text',
                  label: 'Gradient Color #2',
                  admin: { description: 'Hex, HSL, or RGBA value' },
                },
                {
                  name: 'titleColor',
                  type: 'text',
                  label: 'Title Color',
                  admin: { description: 'Hex, HSL, or RGBA value' },
                },
                {
                  name: 'primaryTextColor',
                  type: 'text',
                  label: 'Primary Text Color',
                  admin: { description: 'Hex, HSL, or RGBA value' },
                },
                {
                  name: 'secondaryTextColor',
                  type: 'text',
                  label: 'Secondary Text Color',
                  admin: { description: 'Hex, HSL, or RGBA value' },
                },
                {
                  name: 'contentBackgroundColor',
                  type: 'text',
                  label: 'Content Background Color',
                  admin: { description: 'Hex, HSL, or RGBA value' },
                },
                {
                  name: 'pageTitleBackgroundColor',
                  type: 'text',
                  label: 'Page Title Background Color',
                  admin: { description: 'Hex, HSL, or RGBA value' },
                },
                {
                  name: 'pageTextBackgroundColor',
                  type: 'text',
                  label: 'Page Text Background Color',
                  admin: { description: 'Hex, HSL, or RGBA value' },
                },
              ],
            },
            {
              name: 'contentBackground',
              type: 'group',
              label: 'Content Background Image',
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Background Image' },
                {
                  name: 'repeat',
                  type: 'select',
                  label: 'Image Repeat',
                  defaultValue: 'no-repeat',
                  options: [
                    { label: 'Repeat', value: 'repeat' },
                    { label: 'Repeat X', value: 'repeat-x' },
                    { label: 'Repeat Y', value: 'repeat-y' },
                    { label: 'No Repeat', value: 'no-repeat' },
                    { label: 'Cover', value: 'cover' },
                    { label: 'Contain', value: 'contain' },
                  ],
                },
                {
                  name: 'position',
                  type: 'select',
                  label: 'Image Position',
                  defaultValue: 'center center',
                  options: [
                    { label: 'Top Left', value: 'top left' },
                    { label: 'Top Center', value: 'top center' },
                    { label: 'Top Right', value: 'top right' },
                    { label: 'Center Left', value: 'center left' },
                    { label: 'Center', value: 'center center' },
                    { label: 'Center Right', value: 'center right' },
                    { label: 'Bottom Left', value: 'bottom left' },
                    { label: 'Bottom Center', value: 'bottom center' },
                    { label: 'Bottom Right', value: 'bottom right' },
                  ],
                },
                {
                  name: 'attachment',
                  type: 'select',
                  label: 'Image Attachment',
                  defaultValue: 'scroll',
                  options: [
                    { label: 'Scroll', value: 'scroll' },
                    { label: 'Fixed', value: 'fixed' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Fonts',
          fields: [
            {
              name: 'fonts',
              type: 'group',
              label: 'Font Settings',
              fields: [
                {
                  name: 'titleFont',
                  type: 'text' as const,
                  label: 'Title Font',
                  defaultValue: 'Inter',
                  admin: {
                    components: { Field: '@/components/FontSelect/index#FontSelectComponent' },
                  },
                },
                {
                  name: 'textFont',
                  type: 'text' as const,
                  label: 'Body Text Font',
                  defaultValue: 'Inter',
                  admin: {
                    components: { Field: '@/components/FontSelect/index#FontSelectComponent' },
                  },
                },
                {
                  name: 'footerTitleFont',
                  type: 'text' as const,
                  label: 'Footer Title Font',
                  defaultValue: 'Inter',
                  admin: {
                    components: { Field: '@/components/FontSelect/index#FontSelectComponent' },
                  },
                },
                {
                  name: 'footerTextFont',
                  type: 'text' as const,
                  label: 'Footer Body Font',
                  defaultValue: 'Inter',
                  admin: {
                    components: { Field: '@/components/FontSelect/index#FontSelectComponent' },
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'footer',
              type: 'group',
              label: 'Footer Options',
              fields: [
                {
                  name: 'disableFooter',
                  type: 'checkbox',
                  label: 'Disable Footer Entirely',
                  defaultValue: false,
                },
                {
                  name: 'copyrightText',
                  type: 'textarea',
                  label: 'Copyright Text',
                  admin: { description: 'Appears in the sub-footer. Supports basic HTML.' },
                },
                {
                  name: 'footerColumns',
                  type: 'select',
                  label: 'Footer Columns Layout',
                  defaultValue: '3',
                  options: [
                    { label: 'Full width', value: 'full' },
                    { label: '2 columns', value: '2' },
                    { label: '3 columns', value: '3' },
                    { label: '4 columns', value: '4' },
                  ],
                },
                {
                  name: 'footerBackgroundColor',
                  type: 'text',
                  label: 'Footer Background Color',
                  admin: { description: 'Hex, HSL, or RGBA value' },
                },
                {
                  name: 'footerTitleColor',
                  type: 'text',
                  label: 'Footer Title Text Color',
                  admin: { description: 'Hex, HSL, or RGBA value' },
                },
                {
                  name: 'footerTextColor',
                  type: 'text',
                  label: 'Footer Text Color',
                  admin: { description: 'Hex, HSL, or RGBA value' },
                },
                {
                  name: 'footerLogoImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Footer Logo',
                },
              ],
            },
          ],
        },
        {
          label: 'Custom CSS',
          fields: [
            {
              name: 'customCSS',
              type: 'code',
              label: 'Custom CSS',
              admin: {
                language: 'css',
                description: 'Injected into every page. Use sparingly — prefer Tailwind classes.',
              },
            },
          ],
        },
      ],
    },
  ],
}
