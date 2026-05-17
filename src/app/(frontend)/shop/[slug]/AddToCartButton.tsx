'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  productId: string
  disabled?: boolean
}

export default function AddToCartButton({ productId, disabled }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  async function handleAddToCart() {
    setLoading(true)

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.error === 'Unauthorized') {
          router.push('/login?redirect=/shop')
          return
        }
        throw new Error(data.error)
      }

      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (err) {
      console.error('Add to cart error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || loading}
      data-testid="add-to-cart"
      className="w-full bg-black text-white rounded-md px-6 py-3 text-sm font-medium hover:opacity-80 disabled:opacity-50 transition-opacity"
    >
      {loading ? 'Adding...' : added ? 'Added to cart!' : 'Add to cart'}
    </button>
  )
}
