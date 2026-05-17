import { getPayload } from 'payload'
import config from '@/payload.config'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 0

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  fulfilled: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/login?redirect=/account/orders')
  }

  const payload = await getPayload({ config })

  const { docs: orders } = await payload.find({
    collection: 'orders',
    where: {
      customer: { equals: session.user.id },
    },
    sort: '-createdAt',
    depth: 2,
    overrideAccess: true,
  })

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-medium">Your orders</h1>
        <Link href="/shop" className="text-sm underline">
          Continue shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div>
          <p className="text-gray-500 mb-4">No orders yet.</p>
          <Link href="/shop" className="underline text-sm">
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order #{order.id}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    statusColors[order.status] ?? 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Line items */}
              <div className="flex flex-col gap-2 mb-4">
                {order.items?.map((item, index) => {
                  const product = typeof item.product === 'object' ? item.product : null
                  return (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {product?.name ?? 'Product'} × {item.quantity}
                      </span>
                      <span className="text-gray-600">
                        ${((item.price * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-medium">
                  ${((order.total ?? 0) / 100).toFixed(2)}
                </span>
              </div>

              {order.trackingNumber && (
                <div className="mt-3 text-xs text-gray-500">
                  Tracking: <span className="font-medium">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
