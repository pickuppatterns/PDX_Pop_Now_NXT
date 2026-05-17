'use client'

import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <button onClick={handleSignOut} className="mt-8 text-sm text-red-500 hover:underline">
      Sign out
    </button>
  )
}
