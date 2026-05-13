import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { items: true }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // If it has categoryId, it's an item
    if (body.type === 'item') {
      const item = await prisma.menuItem.create({
        data: {
          name: body.name,
          description: body.description,
          price: parseFloat(body.price),
          image: body.image || null,
          categoryId: body.categoryId
        }
      });
      return NextResponse.json(item);
    } 
    // Otherwise it's a category
    else if (body.type === 'category') {
      const category = await prisma.category.create({
        data: { name: body.name }
      });
      return NextResponse.json(category);
    }
    
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    if (type === 'item') {
      await prisma.menuItem.delete({ where: { id } });
    } else if (type === 'category') {
      await prisma.category.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
