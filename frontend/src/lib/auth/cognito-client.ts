import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import type { AuthUser, UserGroup } from './types';

const userPool = new CognitoUserPool({
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
});

function extractUserFromSession(session: CognitoUserSession, email: string): AuthUser {
  const idPayload = session.getIdToken().decodePayload();
  return {
    sub: idPayload['sub'] as string,
    email: (idPayload['email'] as string) || email,
    displayName: (idPayload['custom:display_name'] as string) || email.split('@')[0],
    groups: ((idPayload['cognito:groups'] as string[]) || []) as UserGroup[],
  };
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  consentTimestamp?: string,
  consentVersion?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const attrs = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'custom:display_name', Value: displayName }),
      ...(consentTimestamp ? [new CognitoUserAttribute({ Name: 'custom:consent_timestamp', Value: consentTimestamp })] : []),
      ...(consentVersion ? [new CognitoUserAttribute({ Name: 'custom:consent_version', Value: consentVersion })] : []),
    ];

    userPool.signUp(email, password, attrs, [], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.confirmRegistration(code, true, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    user.authenticateUser(authDetails, {
      onSuccess: async (session) => {
        const authUser = extractUserFromSession(session, email);

        // Set httpOnly cookies via server endpoint
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: session.getIdToken().getJwtToken(),
            accessToken: session.getAccessToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
          }),
        });

        // Trigger cart merge (the handshake)
        await fetch('/api/auth/merge-cart', { method: 'POST' }).catch(() => {});

        resolve(authUser);
      },
      onFailure: reject,
      newPasswordRequired: () => {
        reject(new Error('NEW_PASSWORD_REQUIRED'));
      },
    });
  });
}

export async function signOut(): Promise<void> {
  const user = userPool.getCurrentUser();
  if (user) user.signOut();
  await fetch('/api/auth/session', { method: 'DELETE' });
}

export function getCurrentUser(): CognitoUser | null {
  return userPool.getCurrentUser();
}

export async function getSession(): Promise<{ session: CognitoUserSession; user: AuthUser } | null> {
  const user = userPool.getCurrentUser();
  if (!user) return null;

  return new Promise((resolve) => {
    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      const email = session.getIdToken().decodePayload()['email'] as string;
      resolve({ session, user: extractUserFromSession(session, email) });
    });
  });
}
