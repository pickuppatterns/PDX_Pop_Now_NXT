export default function DashboardPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <p
          style={{
            color: '#ff8c42',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}
        >
          PDX Pop Now!
        </p>
        <h1
          style={{
            color: '#fff',
            fontSize: '2rem',
            fontWeight: 900,
            fontStyle: 'italic',
            margin: 0,
          }}
        >
          Overview
        </h1>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {[
          {
            label: 'Volunteers',
            href: '/dashboard/volunteers',
            emoji: '👥',
            desc: 'Manage volunteer roster',
          },
          {
            label: 'Compilation',
            href: '/dashboard/compilation',
            emoji: '🎵',
            desc: 'Song submissions queue',
          },
          { label: 'Booking', href: '/dashboard/booking', emoji: '🎪', desc: 'Festival schedule' },
          {
            label: 'Sponsorship',
            href: '/dashboard/sponsorship',
            emoji: '💰',
            desc: 'Sponsor posts',
          },
          { label: 'Social', href: '/dashboard/social', emoji: '📱', desc: 'Social post queue' },
          { label: 'Radio', href: '/dashboard/radio', emoji: '📻', desc: 'Radio submissions' },
          {
            label: 'Listening',
            href: '/dashboard/listening',
            emoji: '🎧',
            desc: 'Listening committee',
          },
          { label: 'Orders', href: '/dashboard/orders', emoji: '🛍️', desc: 'Process orders' },
          { label: 'Support', href: '/dashboard/support', emoji: '🎫', desc: 'Support tickets' },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              display: 'block',
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '1.5rem',
              textDecoration: 'none',
            }}
          >
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{item.emoji}</div>
            <p
              style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                margin: '0 0 4px',
                fontFamily: "'Courier New', monospace",
              }}
            >
              {item.label}
            </p>
            <p
              style={{ color: '#666', fontSize: '0.8rem', margin: 0, fontFamily: 'Georgia, serif' }}
            >
              {item.desc}
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}
