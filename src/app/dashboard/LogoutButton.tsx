'use client'
import { signOut } from '@/lib/auth-client'

export default function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await signOut()
        window.location.href = '/dashboard-login'
      }}
      style={{
        background: 'none',
        border: 'none',
        color: '#e63946',
        fontSize: '0.75rem',
        cursor: 'pointer',
        fontFamily: "'Courier New', monospace",
        padding: 0,
      }}
    >
      Sign out →
    </button>
  )
}
