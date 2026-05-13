import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        // Update the order status to COMPLETED
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED' },
        });
        console.log(`✅ Order ${orderId} marked as COMPLETED via Webhook!`);
      } else {
        console.warn('⚠️ Webhook received but no orderId found in session metadata.');
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing failed:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
