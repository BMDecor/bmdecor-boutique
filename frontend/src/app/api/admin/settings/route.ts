import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';

const KEY = { PK: 'SETTINGS', SK: 'COMPANY' };

const DEFAULTS = {
  companyName: 'BM Decoracion',
  address: {
    street: 'Calle Dublín 21',
    city: 'Marbella',
    postalCode: '29660',
    province: 'Málaga',
    country: 'Spain',
  },
  phone: '',
  email: '',
  vatNumber: '',
  taxRate: 21,
  currency: 'EUR',
  shippingZones: [
    { name: 'Marbella Local', price: 0, description: 'Free delivery within Marbella' },
    { name: 'Costa del Sol', price: 9.95, description: 'Estepona to Málaga' },
  ],
  clickCollectEnabled: true,
  clickCollectAddress: 'Calle Dublín 21, 29660 Marbella',
  businessHours: {
    weekdays: '10:00 – 14:00, 17:00 – 20:00',
    saturday: '10:00 – 14:00',
    sunday: 'Closed',
  },
};

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: KEY,
    }));

    if (!result.Item) {
      return NextResponse.json(DEFAULTS);
    }

    const item = result.Item;
    return NextResponse.json({
      companyName: item.companyName ?? DEFAULTS.companyName,
      address: item.address ?? DEFAULTS.address,
      phone: item.phone ?? DEFAULTS.phone,
      email: item.email ?? DEFAULTS.email,
      vatNumber: item.vatNumber ?? DEFAULTS.vatNumber,
      taxRate: item.taxRate ?? DEFAULTS.taxRate,
      currency: item.currency ?? DEFAULTS.currency,
      shippingZones: item.shippingZones ?? DEFAULTS.shippingZones,
      clickCollectEnabled: item.clickCollectEnabled ?? DEFAULTS.clickCollectEnabled,
      clickCollectAddress: item.clickCollectAddress ?? DEFAULTS.clickCollectAddress,
      businessHours: item.businessHours ?? DEFAULTS.businessHours,
    });
  } catch (error) {
    console.error('Settings GET:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const now = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...KEY,
        entityType: 'COMPANY_SETTINGS',
        companyName: body.companyName ?? DEFAULTS.companyName,
        address: body.address ?? DEFAULTS.address,
        phone: body.phone ?? '',
        email: body.email ?? '',
        vatNumber: body.vatNumber ?? '',
        taxRate: body.taxRate ?? 21,
        currency: body.currency ?? 'EUR',
        shippingZones: body.shippingZones ?? [],
        clickCollectEnabled: body.clickCollectEnabled ?? true,
        clickCollectAddress: body.clickCollectAddress ?? '',
        businessHours: body.businessHours ?? DEFAULTS.businessHours,
        updatedAt: now,
      },
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings PUT:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
