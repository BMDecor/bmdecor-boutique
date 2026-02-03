import { NextRequest, NextResponse } from 'next/server';
import { discoverComplementaryColors, fetchColorDetail } from '@/lib/api/benjamin-moore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { colorNumber } = body;

    if (!colorNumber) {
      return NextResponse.json(
        { error: 'colorNumber is required' },
        { status: 400 }
      );
    }

    // Fetch real color detail from BM API
    const detail = await fetchColorDetail(colorNumber);

    // Get curated palettes (harmony, similar, shades)
    const palettes = await discoverComplementaryColors(colorNumber);

    return NextResponse.json({
      palettes,
      description: detail.description,
      lrv: detail.lrv,
      isActive: detail.isActive,
    });
  } catch (error) {
    console.error('Color Discovery API error:', error);
    return NextResponse.json(
      { error: 'Failed to discover complementary colors' },
      { status: 500 }
    );
  }
}
