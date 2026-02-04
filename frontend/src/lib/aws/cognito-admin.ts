import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  AdminEnableUserCommand,
  AdminDisableUserCommand,
  type AttributeType,
} from '@aws-sdk/client-cognito-identity-provider';

const REGION = process.env.BMDECOR_AWS_REGION || process.env.AWS_REGION || 'eu-west-1';

function getCredentials() {
  const accessKeyId = process.env.BMDECOR_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.BMDECOR_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    return { accessKeyId, secretAccessKey };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { fromIni } = require('@aws-sdk/credential-providers');
    const provider = fromIni({ profile: 'bmdecor' });
    return async () => {
      try { return await provider(); } catch {
        console.warn('Running without AWS credentials.');
        return { accessKeyId: '', secretAccessKey: '' };
      }
    };
  } catch {
    return undefined;
  }
}

export const cognitoClient = new CognitoIdentityProviderClient({
  region: REGION,
  credentials: getCredentials(),
});

export const USER_POOL_ID =
  process.env.BMDECOR_COGNITO_USER_POOL_ID ||
  process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ||
  '';

function attr(attrs: AttributeType[] | undefined, name: string): string {
  return attrs?.find((a) => a.Name === name)?.Value || '';
}

export interface CognitoUser {
  sub: string;
  email: string;
  name: string;
  enabled: boolean;
  status: string;
  createdAt: string;
  groups: string[];
}

export async function listUsers(limit = 60, paginationToken?: string) {
  const result = await cognitoClient.send(new ListUsersCommand({
    UserPoolId: USER_POOL_ID,
    Limit: limit,
    ...(paginationToken ? { PaginationToken: paginationToken } : {}),
  }));

  const users: Omit<CognitoUser, 'groups'>[] = (result.Users || []).map((u) => ({
    sub: attr(u.Attributes, 'sub'),
    email: attr(u.Attributes, 'email'),
    name: attr(u.Attributes, 'name') || attr(u.Attributes, 'given_name') || '',
    enabled: u.Enabled ?? true,
    status: u.UserStatus || '',
    createdAt: u.UserCreateDate?.toISOString() || '',
  }));

  // Fetch groups for each user
  const usersWithGroups: CognitoUser[] = await Promise.all(
    users.map(async (u) => {
      const groups = await getUserGroups(u.sub);
      return { ...u, groups };
    })
  );

  return {
    users: usersWithGroups,
    paginationToken: result.PaginationToken,
  };
}

export async function getUser(sub: string): Promise<CognitoUser> {
  // AdminGetUser requires username, not sub — look up by sub filter
  const result = await cognitoClient.send(new ListUsersCommand({
    UserPoolId: USER_POOL_ID,
    Filter: `sub = "${sub}"`,
    Limit: 1,
  }));

  const u = result.Users?.[0];
  if (!u) throw new Error('User not found');

  const groups = await getUserGroups(u.Username || sub);

  return {
    sub: attr(u.Attributes, 'sub'),
    email: attr(u.Attributes, 'email'),
    name: attr(u.Attributes, 'name') || attr(u.Attributes, 'given_name') || '',
    enabled: u.Enabled ?? true,
    status: u.UserStatus || '',
    createdAt: u.UserCreateDate?.toISOString() || '',
    groups,
  };
}

export async function getUserGroups(username: string): Promise<string[]> {
  try {
    const result = await cognitoClient.send(new AdminListGroupsForUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
    }));
    return (result.Groups || []).map((g) => g.GroupName || '').filter(Boolean);
  } catch {
    return [];
  }
}

export async function addUserToGroup(username: string, groupName: string) {
  await cognitoClient.send(new AdminAddUserToGroupCommand({
    UserPoolId: USER_POOL_ID,
    Username: username,
    GroupName: groupName,
  }));
}

export async function removeUserFromGroup(username: string, groupName: string) {
  await cognitoClient.send(new AdminRemoveUserFromGroupCommand({
    UserPoolId: USER_POOL_ID,
    Username: username,
    GroupName: groupName,
  }));
}

export async function enableUser(username: string) {
  await cognitoClient.send(new AdminEnableUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: username,
  }));
}

export async function disableUser(username: string) {
  await cognitoClient.send(new AdminDisableUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: username,
  }));
}

/** Resolve a sub to the Cognito username (needed for Admin* commands) */
export async function resolveUsername(sub: string): Promise<string> {
  const result = await cognitoClient.send(new ListUsersCommand({
    UserPoolId: USER_POOL_ID,
    Filter: `sub = "${sub}"`,
    Limit: 1,
  }));
  const u = result.Users?.[0];
  if (!u?.Username) throw new Error('User not found');
  return u.Username;
}
