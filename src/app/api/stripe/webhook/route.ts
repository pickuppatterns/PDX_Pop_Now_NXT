import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: import('stripe').Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = await getPayload({ config })

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as import('stripe').Stripe.PaymentIntent

        // Find order by stripePaymentIntentId and mark as paid
        const orders = await payload.find({
          collection: 'orders',
          where: {
            stripePaymentIntentId: { equals: paymentIntent.id },
          },
          overrideAccess: true,
        })

        if (orders.docs.length > 0) {
          await payload.update({
            collection: 'orders',
            id: orders.docs[0].id,
            data: { status: 'paid' },
            overrideAccess: true,
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as import('stripe').Stripe.PaymentIntent

        const orders = await payload.find({
          collection: 'orders',
          where: {
            stripePaymentIntentId: { equals: paymentIntent.id },
          },
          overrideAccess: true,
        })

        if (orders.docs.length > 0) {
          await payload.update({
            collection: 'orders',
            id: orders.docs[0].id,
            data: { status: 'cancelled' },
            overrideAccess: true,
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as import('stripe').Stripe.Subscription

        // Find user by stripeCustomerId and lock their account
        const users = await payload.find({
          collection: 'users',
          where: {
            stripeCustomerId: { equals: subscription.customer as string },
          },
          overrideAccess: true,
        })

        if (users.docs.length > 0) {
          await payload.update({
            collection: 'users',
            id: users.docs[0].id,
            data: { role: 'volunteer' },
            overrideAccess: true,
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('Error processing webhook:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
