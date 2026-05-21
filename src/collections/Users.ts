import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'accountStatus', 'isVolunteer', 'createdAt'],
    group: 'Admin',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'super-admin' || req.user?.role === 'editor') return true
      return { id: { equals: req.user?.id } }
    },
    create: () => true,
    update: ({ req }) => {
      if (req.user?.role === 'super-admin') return true
      return { id: { equals: req.user?.id } }
    },
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
    },
    // ─── Role ─────────────────────────────────────────────────────────
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'volunteer',
      access: {
        update: ({ req }) => req.user?.role === 'super-admin',
      },
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Volunteer', value: 'volunteer' },
        { label: 'Musician', value: 'musician' },
        { label: 'Vendor', value: 'vendor' },
        { label: 'Venue', value: 'venue' },
        { label: 'Sponsor', value: 'sponsor' },
        { label: 'Customer (legacy)', value: 'customer' },
      ],
      admin: {
        description: 'Primary role — determines billing and content access',
      },
    },
    // ─── Account Status ───────────────────────────────────────────────
    {
      name: 'accountStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      access: {
        update: ({ req }) => req.user?.role === 'super-admin' || req.user?.role === 'editor',
      },
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
      ],
      admin: {
        description: 'Controls access to paid features. Volunteers are always active.',
      },
    },
    // ─── Volunteer ────────────────────────────────────────────────────
    {
      name: 'isVolunteer',
      type: 'checkbox',
      defaultValue: false,
      label: 'Is a Volunteer',
      admin: {
        description: 'Can be true regardless of primary role or account status',
      },
    },
    {
      name: 'volunteerStatus',
      type: 'select',
      defaultValue: 'pending',
      access: {
        update: ({ req }) => req.user?.role === 'super-admin' || req.user?.role === 'editor',
      },
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Assigned', value: 'assigned' },
        { label: 'Inactive', value: 'inactive' },
      ],
      admin: {
        condition: (data) => data.isVolunteer === true,
        description: 'Only visible when Is a Volunteer is checked',
      },
    },
    // ─── Volunteer Profile ────────────────────────────────────────────
    {
      name: 'volunteerProfile',
      type: 'group',
      label: 'Volunteer Profile',
      admin: {
        condition: (data) => data.isVolunteer === true,
      },
      fields: [
        {
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
        },
        {
          name: 'emergencyContact',
          type: 'text',
          label: 'Emergency Contact Name & Phone',
        },
        {
          name: 'shirtSize',
          type: 'select',
          label: 'Shirt Size (unisex)',
          options: [
            { label: 'XS', value: 'xs' },
            { label: 'S', value: 's' },
            { label: 'M', value: 'm' },
            { label: 'L', value: 'l' },
            { label: 'XL', value: 'xl' },
            { label: 'XXL', value: 'xxl' },
            { label: 'XXXL', value: 'xxxl' },
          ],
        },
        {
          name: 'availability',
          type: 'select',
          hasMany: true,
          label: 'Available Shifts',
          options: [
            { label: 'Friday 12:00–5:00 PM (Set-Up)', value: 'fri-noon-setup' },
            { label: 'Friday 4:30–10:00 PM', value: 'fri-evening' },
            { label: 'Saturday 12:30–5:30 PM', value: 'sat-afternoon' },
            { label: 'Saturday 5:00–10:00 PM', value: 'sat-evening' },
            { label: 'Sunday 12:30–5:30 PM', value: 'sun-afternoon' },
            { label: 'Sunday 5:00–10:00 PM', value: 'sun-evening' },
          ],
        },
        {
          name: 'rolePreference',
          type: 'select',
          hasMany: true,
          label: 'Preferred Volunteer Positions',
          options: [
            { label: 'No Preference', value: 'no-preference' },
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
          name: 'multipleShifts',
          type: 'select',
          label: 'Willing to work multiple shifts?',
          options: [
            { label: 'Yes, multiple shifts one day', value: 'multi-same-day' },
            { label: 'Yes, one shift each on multiple days', value: 'multi-days' },
            { label: 'Yes, multiple shifts multiple days', value: 'multi-all' },
            { label: 'No', value: 'no' },
            { label: 'Maybe', value: 'maybe' },
          ],
        },
        {
          name: 'experience',
          type: 'textarea',
          label: 'Relevant experience or skills',
        },
        {
          name: 'accommodations',
          type: 'textarea',
          label: 'Accommodations needed',
        },
        {
          name: 'hearAbout',
          type: 'select',
          label: 'How did you hear about volunteering?',
          options: [
            { label: 'Friend / Word of Mouth', value: 'friend' },
            { label: 'Social Media', value: 'social' },
            { label: 'PDX Pop Now! Website', value: 'website' },
            { label: 'PDX Pop Now! Outreach Email', value: 'email' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'hearAboutOther',
          type: 'text',
          label: 'If other, please specify',
          admin: {
            condition: (_, siblingData) => siblingData?.hearAbout === 'other',
          },
        },
        {
          name: 'additionalNotes',
          type: 'textarea',
          label: "Anything else you'd like us to know?",
        },
      ],
    },
    // ─── Billing ──────────────────────────────────────────────────────
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Set automatically when user subscribes',
        condition: (data) => ['musician', 'vendor', 'venue', 'sponsor'].includes(data.role),
      },
    },
  ],
}
