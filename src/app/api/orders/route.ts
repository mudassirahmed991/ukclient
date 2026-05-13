import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Calculate total based on items
    let total = body.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    if (body.type === 'DELIVERY') {
      total += 5.0; // Add delivery fee
    }

    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        phone: body.phone || null,
        address: body.address || null,
        paymentMethod: body.paymentMethod || null,
        type: body.type, // 'COLLECTION', 'DELIVERY', 'INSTORE', 'PICKUP'
        status: body.type === 'INSTORE' ? 'COMPLETED' : 'PENDING',
        total: total,
        items: {
          create: body.items.map((item: any) => ({
            menuItemId: item.id ? String(item.id) : 'custom',
            nameAtTime: item.name,
            priceAtTime: item.price,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { status } = await request.json();

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
