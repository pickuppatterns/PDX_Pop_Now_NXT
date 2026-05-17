'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    slug: string
    images?: { image?: { url?: string } }[]
  }
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart')
      if (res.status === 401) {
        router.push('/login?redirect=/cart')
        return
      }
      const data = await res.json()
      setCartItems(data.cartItems ?? [])
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  async function removeItem(id: string) {
    await fetch(`/api/cart?id=${id}`, { method: 'DELETE' })
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  async function handleCheckout() {
    setCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      })
      const data = await res.json()
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      }
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setCheckingOut(false)
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-gray-500">Loading cart...</p>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-medium mb-8">Your cart</h1>
      {cartItems.length === 0 ? (
        <div data-testid="cart-empty">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link href="/shop" className="underline text-sm">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-4 mb-8">
            {cartItems.map(item => {
              const imageUrl = item.product.images?.[0]?.image?.url
              return (
                <div
                  key={item.id}
                  className="flex gap-4 border rounded-lg p-4 items-center"
                  data-testid="cart-item"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded relative overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-gray-500 text-sm">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      ${((item.product.price * item.quantity) / 100).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 text-xs mt-1 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="border-t pt-4 flex justify-between items-center mb-6">
            <span className="font-medium">Total</span>
            <span className="font-medium text-lg">
              ${(total / 100).toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="w-full bg-black text-white rounded-md px-6 py-3 text-sm font-medium hover:opacity-80 disabled:opacity-50"
          >
            {checkingOut ? 'Redirecting to checkout...' : 'Checkout'}
          </button>
        </div>
      )}
    </main>
  )
}
