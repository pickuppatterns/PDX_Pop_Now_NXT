import { getPayload } from 'payload'
import config from '../payload.config'

async function seedHeader() {
  const payload = await getPayload({ config })

  await payload.updateGlobal({
    slug: 'header',
    context: {
      disableRevalidate: true,
    },
    data: {
      navItems: [
        {
          link: { type: 'custom', label: 'Donate', url: '/donate' },
          subItems: [],
        },
        {
          link: { type: 'custom', label: 'About', url: '/about' },
          subItems: [
            { link: { type: 'custom', label: 'General', url: '/about' } },
            { link: { type: 'custom', label: 'Open Positions', url: '/about/open-positions' } },
            { link: { type: 'custom', label: 'The Team', url: '/about/the-team' } },
            { link: { type: 'custom', label: 'Contact', url: '/about/contact' } },
          ],
        },
        {
          link: { type: 'custom', label: 'Volunteer', url: '/volunteer' },
          subItems: [],
        },
        {
          link: { type: 'custom', label: 'Sponsorship', url: '/sponsorship' },
          subItems: [],
        },
        {
          link: { type: 'custom', label: 'Events', url: '/events' },
          subItems: [
            { link: { type: 'custom', label: 'Events', url: '/events' } },
            { link: { type: 'custom', label: 'Outreach', url: '/events/outreach' } },
          ],
        },
        {
          link: { type: 'custom', label: 'Festival', url: '/festival' },
          subItems: [
            { link: { type: 'custom', label: 'Info', url: '/festival' } },
            { link: { type: 'custom', label: 'Schedule', url: '/festival/schedule' } },
            { link: { type: 'custom', label: 'Booking', url: '/festival/booking' } },
          ],
        },
        {
          link: { type: 'custom', label: 'Compilation', url: '/compilation' },
          subItems: [
            { link: { type: 'custom', label: 'Submission', url: '/submission' } },
            { link: { type: 'custom', label: 'Compilations', url: '/compilation' } },
            {
              link: {
                type: 'custom',
                label: 'Listening Committee',
                url: '/compilation/listening-committee',
              },
            },
          ],
        },
      ],
    } as any,
  })

  console.log('✅ Header nav seeded')
  process.exit(0)
}

seedHeader().catch((err) => {
  console.error(err)
  process.exit(1)
})
