import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const VolunteerAssignments: CollectionConfig = {
  slug: 'volunteer-assignments',
  labels: {
    singular: 'Volunteer Assignment',
    plural: 'Volunteer Assignments',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req }) => {
      if (req.user?.role === 'super-admin' || req.user?.role === 'editor') return true
      // Volunteers can only see their own assignments
      return {
        volunteer: {
          equals: req.user?.id,
        },
      }
    },
    update: ({ req }) => {
      if (req.user?.role === 'super-admin' || req.user?.role === 'editor') return true
      return false
    },
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['volunteer', 'shift', 'status', 'confirmedAt'],
    group: 'PDX Pop Now!',
  },
  fields: [
    {
      name: 'volunteer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Volunteer',
      admin: {
        description: 'The volunteer assigned to this shift',
      },
    },
    {
      name: 'shift',
      type: 'relationship',
      relationTo: 'shifts',
      required: true,
      label: 'Shift',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'assigned',
      options: [
        { label: 'Assigned', value: 'assigned' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'No Show', value: 'no-show' },
        { label: 'Completed', value: 'completed' },
      ],
    },
    {
      name: 'confirmedAt',
      type: 'date',
      label: 'Confirmed At',
      admin: {
        readOnly: true,
        description: 'Set automatically when volunteer confirms',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Assignment Notes',
      admin: {
        description: 'Internal notes from the Volunteer Director',
      },
    },
    {
      name: 'notificationSent',
      type: 'checkbox',
      label: 'Notification Email Sent',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Set automatically when assignment email is sent',
      },
    },
  ],
}
