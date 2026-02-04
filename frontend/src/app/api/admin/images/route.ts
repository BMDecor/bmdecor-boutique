import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '@/lib/aws/s3-client';
import { requireAdmin } from '@/lib/api/require-admin';

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const productId = request.nextUrl.searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 });
    }

    const prefix = `products/${productId}/`;
    const result = await s3Client.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    }));

    const images = (result.Contents || [])
      .filter((obj) => obj.Key && obj.Key !== prefix)
      .map((obj) => ({
        key: obj.Key!,
        filename: obj.Key!.replace(prefix, ''),
        size: obj.Size,
        lastModified: obj.LastModified?.toISOString(),
        url: `https://${BUCKET_NAME}.s3.eu-west-1.amazonaws.com/${obj.Key}`,
      }));

    return NextResponse.json(images);
  } catch (error) {
    console.error('Images GET:', error);
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { key } = await request.json();
    if (!key) {
      return NextResponse.json({ error: 'key required' }, { status: 400 });
    }

    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Images DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
