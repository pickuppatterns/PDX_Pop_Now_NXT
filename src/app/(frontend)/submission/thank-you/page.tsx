import Link from 'next/link'

export default function SubmissionThankYouPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'Georgia, serif',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: 900,
            fontStyle: 'italic',
            color: '#fff',
            lineHeight: 1,
            marginBottom: '1.25rem',
          }}
        >
          Right On!
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.7,
            marginBottom: '0.75rem',
          }}
        >
          Thanks for submitting to the <strong style={{ color: '#ff8c42' }}>PDX Pop Now!</strong>{' '}
          Compilation. An email with a link to finalize your account will be sent promptly. Follow
          the link to set up your profile page where you can track your submission status.
        </p>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>
          Questions? Email{' '}
          <a
            href="mailto:compilations@pdxpopnow.com"
            style={{ color: '#e63946', textDecoration: 'none' }}
          >
            compilations@pdxpopnow.com
          </a>
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '11px 28px',
            background: '#e63946',
            color: '#fff',
            borderRadius: 8,
            fontFamily: 'Courier New, monospace',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  )
}
