import type { GlobalConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const ListeningCommitteeSettings: GlobalConfig = {
  slug: 'listening-committee-settings',
  label: 'Listening Committee Settings',
  access: {
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'Compilation',
  },
  fields: [
    { name: 'year', type: 'number', label: 'Campaign Year' },
    {
      name: 'startDate',
      type: 'date',
      label: 'Open Date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'Close Date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'isOpen',
      type: 'checkbox',
      label: 'Is Open',
      defaultValue: false,
      admin: { readOnly: true, description: 'Managed automatically by start/end dates' },
    },
  ],
}
