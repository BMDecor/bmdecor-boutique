# AWS Amplify Hosting — setup runbook

Serves the Next.js app at `preview.bmdecor.es` (initially, gated by the
pre-launch middleware). Replaces the current Vercel hosting for the app.

The public coming-soon page at the `bmdecor.es` apex stays unchanged —
it's a separate static S3 + CloudFront site and is not part of this
Amplify deploy.

---

## Prerequisites

- `bmdecor` AWS profile active (`aws sso login --profile bmdecor`)
- Route 53 hosted zone for `bmdecor.es` in the same AWS account (`450284264313`)
- GitHub repo access token for Amplify to poll the repo

## One-time values to set

| Variable | Value | Source |
|---|---|---|
| AWS account | `450284264313` | fixed |
| AWS region | `eu-west-1` | fixed |
| App repository | `https://github.com/BMDecores/bmdecor-boutique` | fixed |
| Branch to deploy | `main` | fixed |
| App root | `frontend/` | `amplify.yml` |
| Node version | `24.x` | matches Vercel |
| Framework | Next.js 16 (App Router, SSR) | auto-detected |
| Custom domain | `preview.bmdecor.es` | staging / demo URL |

## Environment variables — mirror Vercel's production set

The current Vercel `frontend` project has **12 env vars** in production. All must be set on Amplify too, plus 2 new ones for the pre-launch gate:

### Copy these from Vercel (same values)

| Key | Scope |
|---|---|
| `ADMIN_API_KEY` | prod |
| `BMDECOR_AWS_ACCESS_KEY_ID` | prod |
| `BMDECOR_AWS_REGION` | prod |
| `BMDECOR_AWS_SECRET_ACCESS_KEY` | prod |
| `BMDECOR_DYNAMODB_TABLE` | prod |
| `BMDECOR_S3_BUCKET` | prod |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | prod |
| `NEXT_PUBLIC_COGNITO_REGION` | prod |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | prod |

### Different value on Amplify

| Key | Value |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | `https://preview.bmdecor.es` |

### New on Amplify (not on Vercel)

| Key | Value |
|---|---|
| `PRELAUNCH_MODE` | `true` |
| `PRELAUNCH_BYPASS_TOKEN` | 32+ random chars — `openssl rand -hex 32` |

### How to get Vercel values

From the Amplify console, copy each value from Vercel's UI → paste into Amplify. Values never go through this runbook or the terminal pipes.

If you want a fully scripted path: `vercel env pull .env.production.snapshot --environment=production` writes them to a file locally; then `aws amplify update-app --app-id ... --environment-variables key=value,...` sets them. Delete the `.env.production.snapshot` when done. Ensure it's ignored in `.gitignore` (already is via `*.local` rule).

## Create the Amplify app

Option A — **AWS Console** (fastest the first time):

1. https://eu-west-1.console.aws.amazon.com/amplify/apps
2. **Create new app** → **Host web app** → **GitHub** → authorise the Vercel org / BMDecores org.
3. Pick `BMDecores/bmdecor-boutique`, branch `main`.
4. **Monorepo?** Yes — set `frontend` as the app root. Amplify picks up `amplify.yml` automatically from repo root.
5. Framework: Next.js (auto-detected).
6. Service role: let Amplify create a new one, or attach an existing one with DynamoDB + S3 + Cognito read perms if you have one.
7. Add env vars (see above table).
8. Advanced → Build image settings → Live package updates: Node.js 24, npm latest.
9. Save + deploy. First build ~5 min.

Option B — **CLI** (reproducible):

```bash
aws --profile bmdecor --region eu-west-1 amplify create-app \
  --name bmdecor-boutique-app \
  --repository https://github.com/BMDecores/bmdecor-boutique \
  --access-token "$GITHUB_TOKEN" \
  --platform WEB_COMPUTE \
  --environment-variables PRELAUNCH_MODE=true,PRELAUNCH_BYPASS_TOKEN=<token>,...
```

Then branch:

```bash
aws --profile bmdecor --region eu-west-1 amplify create-branch \
  --app-id <appId> --branch-name main --framework "Next.js - SSR"
aws --profile bmdecor --region eu-west-1 amplify start-job \
  --app-id <appId> --branch-name main --job-type RELEASE
```

## Attach preview.bmdecor.es

1. In Amplify app → Domain management → Add domain.
2. Enter `bmdecor.es`; Amplify finds the Route 53 zone (same account).
3. Point the subdomain `preview` → `main` branch.
4. Amplify requests a certificate via ACM (us-east-1 for CloudFront),
   validates it via DNS records it adds automatically to Route 53.
5. After validation (5–20 min), `https://preview.bmdecor.es` goes live.

## Verify the gate works

1. Visit `https://preview.bmdecor.es/` → should see the minimal coming-soon
   fallback (the one in `app/coming-soon/page.tsx`, not the S3 public one).
2. Visit `https://preview.bmdecor.es/?preview=<PRELAUNCH_BYPASS_TOKEN>`.
3. You should be redirected to `/` with the `bm_prelaunch_bypass=1`
   cookie set; refreshing without the param should still show the site.
4. Clear cookies → back to coming-soon. Confirm gate is tight.
5. Sign in with your Cognito Admin account → should also bypass without
   needing the token.

## Sharing with the client

Give the client the URL with the token (one-time): `https://preview.bmdecor.es/?preview=<token>`. Their browser sets the cookie; they can navigate freely for 30 days without re-entering the token.

Rotate the token any time by updating `PRELAUNCH_BYPASS_TOKEN` in Amplify env and redeploying. Old cookies still work (cookie is a simple `1`, not the token itself) — you'd need to change the cookie name too for a hard revoke.

## Swap the GitHub Actions pipeline

Once `preview.bmdecor.es` is verified:

1. Edit `.github/workflows/ci-deploy.yml`.
2. Replace the `Install Vercel CLI`, `Vercel pull`, `Vercel build`, `Vercel deploy` steps with a single `aws amplify start-job` call that triggers a deploy of `main`.
3. Keep the Vercel deploy as a *failsafe* in a separate workflow (`vercel-fallback.yml`, `workflow_dispatch` only) for a week.
4. Remove Vercel secrets from the repo after confidence.

Full before/after workflow diff lands in a follow-up PR alongside the Amplify app going live.

## Launch-day flip (post-Monday, after client approves)

1. In Amplify domain management, add `bmdecor.es` (apex) + `www.bmdecor.es`
   to this same app, `main` branch.
2. Update DNS so the apex ALIAS record points at the Amplify CloudFront
   distribution instead of the current static coming-soon CloudFront.
3. Set `PRELAUNCH_MODE=false` in Amplify env vars, redeploy.
4. Retire the static coming-soon S3 bucket (keep for 30 days as rollback safety net, then delete).

## Fallback if Amplify has Next.js 16 compatibility issues

Next.js 16 is new; Amplify's Next.js runtime may lag on specific features (Cache Components, Server Actions edge cases, Turbopack output format). If the first build fails or runtime errors surface and can't be resolved in a reasonable window:

**Alternate Monday plan — keep Vercel, get the branded URL anyway:**

1. Leave the Next.js app on Vercel (current, working).
2. In Vercel: Project → Settings → Domains → add `preview.bmdecor.es`.
3. Vercel returns a CNAME target (something like `cname.vercel-dns.com`).
4. In Route 53: create a CNAME record `preview.bmdecor.es` → that target.
5. Vercel auto-provisions the SSL cert; ~5 min later `https://preview.bmdecor.es` serves the Vercel deployment.
6. Apply the same PRELAUNCH_MODE=true + PRELAUNCH_BYPASS_TOKEN env vars on Vercel (scoped to production) so the gate works the same way.

This gets the client demo onto the `bmdecor.es` domain for Monday without the full AWS migration. The migration work continues in the background, cutover post-Monday.

## Rollback

If the Amplify deploy fails after going live:

1. Remove / delete the CNAME record for `preview.bmdecor.es` in Route 53 (or point it at the Vercel target above).
2. DNS propagates in ~5–30 min depending on TTL.
3. Vercel production URL continues working throughout — zero dependency on Amplify for the public `bmdecor.es` apex.

No DNS changes to the apex until step 1 of Launch-day — so the public `bmdecor.es` coming-soon stays untouched regardless.
