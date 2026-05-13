import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });
    return NextResponse.json(reservations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const reservation = await prisma.reservation.create({
      data: {
        customerName: body.customerName,
        email: body.email,
        phone: body.phone,
        date: body.date,
        time: body.time,
        guests: parseInt(body.guests),
      }
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { status } = await request.json();

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(reservation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await prisma.reservation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 });
  }
}
