import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()
    const { items, userId } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // Fetch products from database to get current prices
    const productIds = items.map((item: { productId: string }) => item.productId)

    const productDocs = await Promise.all(
      productIds.map((id: string) =>
        payload.findByID({
          collection: 'products',
          id,
          overrideAccess: true,
        }),
      ),
    )

    // Build line items for Stripe
    const lineItems = productDocs.map((product, index) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
        },
        unit_amount: product.price, // already in cents
      },
      quantity: items[index].quantity,
    }))

    // Calculate total
    const total = productDocs.reduce((sum, product, index) => {
      return sum + product.price * items[index].quantity
    }, 0)

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/account/orders?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart?cancelled=true`,
      metadata: {
        userId,
      },
    })

    // Create a pending order in the database
    const order = await payload.create({
      collection: 'orders',
      data: {
        customer: userId,
        items: productDocs.map((product, index) => ({
          product: product.id,
          quantity: items[index].quantity,
          price: product.price,
        })),
        total,
        status: 'pending',
        stripePaymentIntentId: session.payment_intent as string,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: order.id,
    })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
