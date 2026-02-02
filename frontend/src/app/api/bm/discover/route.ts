import { NextRequest, NextResponse } from 'next/server';
import { discoverComplementaryColors } from '@/lib/api/benjamin-moore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { colorNumber, hexCode } = body;

    if (!colorNumber || !hexCode) {
      return NextResponse.json(
        { error: 'colorNumber and hexCode are required' },
        { status: 400 }
      );
    }

    const palettes = await discoverComplementaryColors(colorNumber, hexCode);
    return NextResponse.json({ palettes });
  } catch (error) {
    console.error('Color Discovery API error:', error);
    return NextResponse.json(
      { error: 'Failed to discover complementary colors' },
      { status: 500 }
    );
  }
}
