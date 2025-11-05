import { NextRequest, NextResponse } from 'next/server';
import { getAllProperties, createProperty } from '@/lib/storage';

export async function GET() {
  try {
    const properties = getAllProperties();
    return NextResponse.json(properties);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newProperty = createProperty(body);
    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
