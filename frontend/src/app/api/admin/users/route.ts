import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api/require-admin';
import { listUsers } from '@/lib/aws/cognito-admin';

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const limit = Number(request.nextUrl.searchParams.get('limit') || '60');
    const token = request.nextUrl.searchParams.get('token') || undefined;

    const result = await listUsers(limit, token);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin users GET:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
