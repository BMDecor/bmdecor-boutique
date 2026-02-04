import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api/require-admin';
import {
  getUser,
  resolveUsername,
  addUserToGroup,
  removeUserFromGroup,
  enableUser,
  disableUser,
} from '@/lib/aws/cognito-admin';

type Ctx = { params: Promise<{ sub: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { sub } = await params;
    const user = await getUser(sub);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Admin user GET:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { sub } = await params;
    const { action, group } = await request.json();
    const username = await resolveUsername(sub);

    switch (action) {
      case 'addGroup':
        if (!group) return NextResponse.json({ error: 'group required' }, { status: 400 });
        await addUserToGroup(username, group);
        break;
      case 'removeGroup':
        if (!group) return NextResponse.json({ error: 'group required' }, { status: 400 });
        await removeUserFromGroup(username, group);
        break;
      case 'enable':
        await enableUser(username);
        break;
      case 'disable':
        await disableUser(username);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user PATCH:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
