/**
 * BM Decoracion — API Configuration
 *
 * Toggle between STAGE and PRODUCTION environments with one line.
 * All BM API URLs are derived from this single config.
 */

type Environment = 'STAGE' | 'PRODUCTION';

// ─── Toggle this line to switch environments ───
const ACTIVE_ENV: Environment = 'PRODUCTION';
// ────────────────────────────────────────────────

const ENV_CONFIG = {
  STAGE: {
    bmApiBase: 'https://stageapi.benjaminmoore.com',
    bmWebBase: 'https://staging.benjaminmoore.com',
    label: 'Stage',
  },
  PRODUCTION: {
    bmApiBase: 'https://api.benjaminmoore.com',
    bmWebBase: 'https://www.benjaminmoore.com',
    label: 'Production',
  },
} as const;

/** Active environment configuration */
export const apiConfig = {
  env: ACTIVE_ENV,
  ...ENV_CONFIG[ACTIVE_ENV],

  /** Build a full BM API URL with key in path */
  buildBmUrl(apiKey: string, endpoint: string, params: Record<string, string> = {}): string {
    const base = `${ENV_CONFIG[ACTIVE_ENV].bmApiBase}/api/${apiKey}/${endpoint}`;
    const qs = new URLSearchParams(params).toString();
    return qs ? `${base}?${qs}` : base;
  },
};

export type { Environment };
