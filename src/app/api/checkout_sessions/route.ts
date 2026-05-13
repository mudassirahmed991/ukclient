import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20' as any,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, items, orderType, success_url, cancel_url } = body;

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name || item.nameAtTime,
        },
        unit_amount: Math.round((item.price || item.priceAtTime) * 100),
      },
      quantity: item.quantity,
    }));

    if (orderType === 'DELIVERY') {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Delivery Fee',
          },
          unit_amount: 500, // £5.00
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        orderId: orderId
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

