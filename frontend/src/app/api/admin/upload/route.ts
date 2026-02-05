import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '@/lib/aws/s3-client';
import { requireAdmin } from '@/lib/api/require-admin';

const ALLOWED_FOLDERS = ['journal', 'heroes', 'branding'] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: NextRequest) {
  // Admin auth required
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file || !folder) {
      return NextResponse.json(
        { error: 'Missing required fields: file, folder' },
        { status: 400 }
      );
    }

    // Validate folder
    if (!ALLOWED_FOLDERS.includes(folder as AllowedFolder)) {
      return NextResponse.json(
        { error: `Invalid folder. Allowed: ${ALLOWED_FOLDERS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate unique key
    const sanitizedFilename = sanitizeFilename(file.name);
    const key = `${folder}/${Date.now()}-${sanitizedFilename}`;

    console.log('[upload] Processing file:', file.name, 'size:', file.size, 'type:', file.type);
    console.log('[upload] Target bucket:', BUCKET_NAME, 'key:', key);

    // Convert File to Uint8Array (works in all runtimes)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: uint8Array,
      ContentType: file.type,
    });

    console.log('[upload] Sending to S3...');
    await s3Client.send(command);

    // Construct public URL
    const region = process.env.BMDECOR_AWS_REGION || process.env.AWS_REGION || 'eu-west-1';
    const publicUrl = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

    console.log('[upload] Success - publicUrl:', publicUrl);

    return NextResponse.json({
      publicUrl,
      key,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'Error';
    console.error('[upload] Error:', errorName, errorMessage);
    console.error('[upload] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json(
      { error: `Upload failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
