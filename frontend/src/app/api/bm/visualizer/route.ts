import { NextRequest, NextResponse } from 'next/server';
import { getVisualizerScenes } from '@/lib/api/benjamin-moore';

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

    const scenes = await getVisualizerScenes(colorNumber, hexCode);
    return NextResponse.json({ scenes });
  } catch (error) {
    console.error('Visualizer API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate visualizer scenes' },
      { status: 500 }
    );
  }
}
