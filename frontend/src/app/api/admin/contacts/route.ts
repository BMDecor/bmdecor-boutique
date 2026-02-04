import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api/require-admin';
import { paginatedQuery } from '@/lib/aws/dynamo-helpers';

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const items = await paginatedQuery({
      IndexName: 'GSI-EntityType',
      KeyConditionExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'CONTACT' },
    });

    const contacts = items.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      message: item.message || '',
      status: item.status || 'new',
      createdAt: item.createdAt,
    }));

    contacts.sort((a, b) =>
      new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
    );

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Contacts GET:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}
