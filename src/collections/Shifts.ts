import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const Shifts: CollectionConfig = {
  slug: 'shifts',
  labels: {
    singular: 'Shift',
    plural: 'Shifts',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'date', 'startTime', 'endTime', 'role', 'maxVolunteers'],
    group: 'PDX Pop Now!',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Shift Name',
      admin: {
        description: 'e.g. "Saturday Merch Booth PM"',
      },
    },
    {
      name: 'festivalYear',
      type: 'number',
      required: true,
      label: 'Festival Year',
      defaultValue: new Date().getFullYear(),
    },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'select',
          required: true,
          label: 'Day',
          admin: { width: '33%' },
          options: [
            { label: 'Friday', value: 'friday' },
            { label: 'Saturday', value: 'saturday' },
            { label: 'Sunday', value: 'sunday' },
          ],
        },
        {
          name: 'startTime',
          type: 'text',
          required: true,
          label: 'Start Time',
          admin: {
            width: '33%',
            description: 'e.g. 12:30 PM',
          },
        },
        {
          name: 'endTime',
          type: 'text',
          required: true,
          label: 'End Time',
          admin: {
            width: '33%',
            description: 'e.g. 5:30 PM',
          },
        },
      ],
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      label: 'Volunteer Position',
      options: [
        { label: 'Set-Up Volunteer', value: 'setup' },
        { label: 'Merch Booth', value: 'merch' },
        { label: 'Green Room', value: 'green-room' },
        { label: '21+ Wristband Station', value: 'wristband' },
        { label: 'Videographer', value: 'videographer' },
        { label: 'Donation Taker', value: 'donation' },
        { label: 'Crowd Counter', value: 'crowd-counter' },
        { label: 'Floater', value: 'floater' },
        { label: 'Ice Cream & Popcorn', value: 'ice-cream' },
        { label: 'Kids Craft Table', value: 'kids-craft' },
      ],
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location / Station',
      admin: {
        description: 'e.g. "Main Stage", "Merch Booth", "Beer Garden Entrance"',
      },
    },
    {
      name: 'maxVolunteers',
      type: 'number',
      label: 'Max Volunteers',
      defaultValue: 2,
      admin: {
        description: 'Maximum number of volunteers for this shift',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes for Volunteers',
      admin: {
        description: 'Instructions or details shown to assigned volunteers',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        description: 'Uncheck to hide this shift from the run of show',
      },
    },
  ],
}
