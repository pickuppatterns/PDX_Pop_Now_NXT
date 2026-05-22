import Link from 'next/link'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const NAV_ITEMS = [
  { role: ['super-admin', 'web_admin'], href: '/dashboard', label: '🖥️ Overview' },
  {
    role: ['super-admin', 'web_admin', 'volunteer_director'],
    href: '/dashboard/volunteers',
    label: '👥 Volunteers',
  },
  {
    role: ['super-admin', 'web_admin', 'compilation_director'],
    href: '/dashboard/compilation',
    label: '🎵 Compilation',
  },
  {
    role: ['super-admin', 'web_admin', 'booking_director'],
    href: '/dashboard/booking',
    label: '🎪 Booking',
  },
  {
    role: ['super-admin', 'web_admin', 'sponsorship_director'],
    href: '/dashboard/sponsorship',
    label: '💰 Sponsorship',
  },
  {
    role: ['super-admin', 'web_admin', 'social_director'],
    href: '/dashboard/social',
    label: '📱 Social',
  },
  {
    role: ['super-admin', 'web_admin', 'radio_director'],
    href: '/dashboard/radio',
    label: '📻 Radio',
  },
  {
    role: ['super-admin', 'web_admin', 'listening_director'],
    href: '/dashboard/listening',
    label: '🎧 Listening',
  },
  {
    role: ['super-admin', 'web_admin', 'orders_director'],
    href: '/dashboard/orders',
    label: '🛍️ Orders',
  },
  {
    role: ['super-admin', 'web_admin', 'support_director'],
    href: '/dashboard/support',
    label: '🎫 Support',
  },
]

async function getUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return session?.user ?? null
  } catch (e) {
    console.log('SESSION ERROR:', e)
    return null
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/dashboard-login')

  const visibleNav = NAV_ITEMS.filter((item) => item.role.includes(user.role))

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#0f0f1a',
            fontFamily: "'Courier New', monospace",
          }}
        >
          <aside
            style={{
              width: 240,
              background: '#1a1a2e',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <p
                style={{
                  color: '#ff8c42',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  margin: '0 0 4px',
                }}
              >
                PDX Pop Now!
              </p>
              <p
                style={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  margin: 0,
                  fontStyle: 'italic',
                }}
              >
                Director Dashboard
              </p>
            </div>
            <nav style={{ flex: 1, padding: '1rem 0' }}>
              {visibleNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'block',
                    padding: '10px 1.5rem',
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p
                style={{
                  color: '#aaa',
                  fontSize: '0.75rem',
                  margin: '0 0 4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </p>
              <p
                style={{
                  color: '#666',
                  fontSize: '0.7rem',
                  margin: '0 0 12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {user.role.replace(/_/g, ' ')}
              </p>
              <LogoutButton />
            </div>
          </aside>
          <main style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>{children}</main>
        </div>
      </body>
    </html>
  )
}
