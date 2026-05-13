import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const completedOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      select: { total: true, createdAt: true }
    });

    const now = new Date();
    
    // Quick helper to see if two dates are same day, week, etc.
    const isSameDay = (d1: Date, d2: Date) => 
      d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
      
    const getWeek = (d: Date) => {
      const date = new Date(d.getTime());
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      const week1 = new Date(date.getFullYear(), 0, 4);
      return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };

    let daily = 0;
    let weekly = 0;
    let monthly = 0;
    let yearly = 0;

    completedOrders.forEach(order => {
      const d = new Date(order.createdAt);
      
      if (isSameDay(d, now)) daily += order.total;
      if (d.getFullYear() < now.getFullYear() || (d.getFullYear() === now.getFullYear() && getWeek(d) < getWeek(now))) weekly += order.total;
      if (d.getFullYear() < now.getFullYear() || (d.getFullYear() === now.getFullYear() && d.getMonth() < now.getMonth())) monthly += order.total;
      if (d.getFullYear() < now.getFullYear()) yearly += order.total;
    });

    return NextResponse.json({
      daily,
      weekly,
      monthly,
      yearly
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
