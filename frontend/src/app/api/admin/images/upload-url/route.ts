import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME } from '@/lib/aws/s3-client';
import { requireAdmin } from '@/lib/api/require-admin';

export async function POST(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { productId, filename, contentType } = await request.json();

    if (!productId || !filename) {
      return NextResponse.json({ error: 'productId and filename required' }, { status: 400 });
    }

    const key = `products/${productId}/${filename}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType || 'image/jpeg',
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl: `https://${BUCKET_NAME}.s3.eu-west-1.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error('Upload URL generation:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
