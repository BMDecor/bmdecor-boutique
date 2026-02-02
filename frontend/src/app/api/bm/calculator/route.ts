import { NextRequest, NextResponse } from 'next/server';
import { calculatePaintNeeds } from '@/lib/api/benjamin-moore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { colorNumber, surfaceArea, coats, productLine, finish } = body;

    if (!colorNumber || !surfaceArea) {
      return NextResponse.json(
        { error: 'colorNumber and surfaceArea are required' },
        { status: 400 }
      );
    }

    const result = await calculatePaintNeeds(
      colorNumber,
      surfaceArea,
      coats || 2,
      productLine || 'Regal Select',
      finish || 'Matte'
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Calculator API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate paint needs' },
      { status: 500 }
    );
  }
}
