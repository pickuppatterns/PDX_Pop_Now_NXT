import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    const { docs: cartItems } = await payload.find({
      collection: 'cart-items',
      where: {
        user: { equals: Number(session.user.id) },
      },
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json({ cartItems })
  } catch (err) {
    console.error('Cart GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const body = await req.json()
    const { productId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Check if item already in cart
    const { docs: existing } = await payload.find({
      collection: 'cart-items',
      where: {
        user: { equals: Number(session.user.id) },
        product: { equals: productId },
      },
      overrideAccess: true,
    })

    if (existing.length > 0) {
      // Update quantity
      const updated = await payload.update({
        collection: 'cart-items',
        id: existing[0].id,
        data: {
          quantity: (existing[0].quantity ?? 1) + quantity,
        },
        overrideAccess: true,
      })
      return NextResponse.json({ cartItem: updated })
    }

    // Create new cart item
    const cartItem = await payload.create({
      collection: 'cart-items',
      data: {
        user: Number(session.user.id),
        product: productId,
        quantity,
      },
      overrideAccess: true,
    })

    return NextResponse.json({ cartItem }, { status: 201 })
  } catch (err) {
    console.error('Cart POST error:', err)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const { searchParams } = new URL(req.url)
    const cartItemId = searchParams.get('id')

    if (!cartItemId) {
      return NextResponse.json({ error: 'Cart item ID required' }, { status: 400 })
    }

    await payload.delete({
      collection: 'cart-items',
      id: cartItemId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Cart DELETE error:', err)
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 })
  }
}
