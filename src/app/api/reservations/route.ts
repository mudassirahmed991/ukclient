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

    if (!body.customerName || !body.phone || !body.date || !body.time) {
      return NextResponse.json({ error: 'Missing required reservation fields' }, { status: 400 });
    }

    // Combine branch and special notes into customerName so it displays in the existing admin dashboard without database migration
    const metaParts = [];
    if (body.branch) {
      metaParts.push(`[${body.branch}]`);
    }
    if (body.notes && body.notes.trim()) {
      metaParts.push(`(Note: ${body.notes.trim()})`);
    }

    const finalCustomerName = metaParts.length > 0
      ? `${body.customerName.trim()} ${metaParts.join(' ')}`
      : body.customerName.trim();

    const reservation = await prisma.reservation.create({
      data: {
        customerName: finalCustomerName,
        email: body.email?.trim() || 'N/A',
        phone: body.phone.trim(),
        date: body.date,
        time: body.time,
        guests: parseInt(body.guests) || 2,
        status: 'PENDING',
      }
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Reservation creation error:', error);
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
