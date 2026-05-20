import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from './SignOutButton'

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-medium mb-2">Account</h1>
      <p className="text-[var(--color-text-secondary)] text-sm mb-8">Signed in as {session.user.email}</p>

      <div className="flex flex-col gap-4">
        <Link
          href="/account/orders"
          className="border rounded-lg p-4 hover:shadow-sm transition-shadow flex justify-between items-center"
        >
          <div>
            <p className="font-medium text-sm">Orders</p>
            <p className="text-[var(--color-text-secondary)] text-xs mt-1">View your order history and tracking</p>
          </div>
          <span className="text-[var(--color-text-secondary)]">→</span>
        </Link>

        <Link
          href="/shop"
          className="border rounded-lg p-4 hover:shadow-sm transition-shadow flex justify-between items-center"
        >
          <div>
            <p className="font-medium text-sm">Shop</p>
            <p className="text-[var(--color-text-secondary)] text-xs mt-1">Browse products</p>
          </div>
          <span className="text-[var(--color-text-secondary)]">→</span>
        </Link>
      </div>

      <SignOutButton />
    </main>
  )
}
