/**
 * Pre-launch gating helpers.
 *
 * While bmdecor is not yet publicly launched, the production domain serves the
 * existing static coming-soon page (from S3+CloudFront at the apex). The
 * Next.js app runs on a preview subdomain (e.g. preview.bmdecor.es) and is
 * gated so only authorised visitors see it:
 *
 *   1. Cognito-authenticated Admin users always bypass.
 *   2. `?preview=<token>` URL parameter — when it matches
 *      PRELAUNCH_BYPASS_TOKEN, the middleware sets a 30-day HttpOnly cookie
 *      so the visitor doesn't need the parameter again.
 *   3. Requests carrying the valid bypass cookie pass through.
 *
 * Launch flip: set PRELAUNCH_MODE to "false" on the Amplify/Vercel env vars
 * and redeploy. The gate becomes a no-op and the site is public.
 */

export const PRELAUNCH_BYPASS_COOKIE = 'bm_prelaunch_bypass';
export const PRELAUNCH_BYPASS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function isPrelaunchEnabled(): boolean {
  // Default: OFF. Explicitly set PRELAUNCH_MODE=true in the preview/staging
  // environment (AWS Amplify for preview.bmdecor.es) to activate the gate.
  // Leaving it unset keeps the gate disabled for local dev and for the
  // current Vercel production deploy during the migration window.
  const v = process.env.PRELAUNCH_MODE;
  if (!v) return false;
  return v.toLowerCase() === 'true';
}

export function expectedBypassToken(): string | undefined {
  const v = process.env.PRELAUNCH_BYPASS_TOKEN;
  return v && v.length > 0 ? v : undefined;
}

/**
 * Subset of cookies we need — deliberately minimal shape so middleware and
 * route handlers can both call this without depending on next/server types.
 */
export interface CookieBag {
  get(name: string): { value: string } | undefined;
}

export interface PrelaunchRequestShape {
  cookies: CookieBag;
  searchParam: (name: string) => string | null;
}

export interface PrelaunchDecision {
  /** If true, the gate is active and this visitor has not bypassed. */
  blocked: boolean;
  /** If true, the middleware should set the bypass cookie (token matched). */
  setBypassCookie: boolean;
  /** Why the visitor is allowed through (for logging/debugging). */
  bypassReason?: 'disabled' | 'token' | 'cookie' | 'cognito-admin';
}

/**
 * Decide whether a request should be blocked by the pre-launch gate.
 *
 * Admin check is caller-supplied (already decoded in the main middleware).
 */
export function evaluatePrelaunch(
  req: PrelaunchRequestShape,
  isCognitoAdmin: boolean
): PrelaunchDecision {
  if (!isPrelaunchEnabled()) {
    return { blocked: false, setBypassCookie: false, bypassReason: 'disabled' };
  }

  if (isCognitoAdmin) {
    return { blocked: false, setBypassCookie: false, bypassReason: 'cognito-admin' };
  }

  const expected = expectedBypassToken();
  const tokenParam = req.searchParam('preview');
  if (expected && tokenParam && tokenParam === expected) {
    return { blocked: false, setBypassCookie: true, bypassReason: 'token' };
  }

  const cookieVal = req.cookies.get(PRELAUNCH_BYPASS_COOKIE)?.value;
  if (cookieVal === '1') {
    return { blocked: false, setBypassCookie: false, bypassReason: 'cookie' };
  }

  return { blocked: true, setBypassCookie: false };
}
