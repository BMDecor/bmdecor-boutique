import { NextRequest, NextResponse } from 'next/server';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { verifyIdToken } from '@/lib/auth/jwt-verify';
import { renderToBuffer } from '@react-pdf/renderer';
import PaletteSheet from '@/lib/pdf/palette-sheet';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  let sub: string;
  try {
    const token = request.cookies.get('bmdecor_id_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const payload = await verifyIdToken(token);
    sub = payload.sub;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { projectId } = await params;

    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PROJECT#USER_${sub}`, SK: `PROJECT#${projectId}` },
    }));

    if (!result.Item) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = result.Item;
    const date = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const buffer = await renderToBuffer(
      PaletteSheet({
        projectName: project.name as string,
        colors: (project.colors || []) as { brand: string; colorCode: string; colorName: string; hexCode: string; notes?: string }[],
        date,
      })
    );

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(project.name as string).replace(/[^a-zA-Z0-9-_ ]/g, '')}-palette.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
