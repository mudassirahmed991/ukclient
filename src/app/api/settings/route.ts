import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Triggering reload

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({ data: {} });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const settings = await prisma.settings.findFirst();
    
    if (settings) {
      const updated = await prisma.settings.update({
        where: { id: settings.id },
        data
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.settings.create({ data });
      return NextResponse.json(created);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
