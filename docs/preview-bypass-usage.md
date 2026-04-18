# Preview bypass — `preview.bmdecor.es` pre-launch gate

While `PRELAUNCH_MODE=true` is set on the AWS hosting environment, `preview.bmdecor.es` shows the minimal `/coming-soon` page to anyone without a bypass. This lets the team (and the client, on one link) browse the real boutique during the migration without exposing it to the public or search engines.

## Bypass paths

There are two ways to see the real site:

### 1. One-time URL with the token (for the client)
```
https://preview.bmdecor.es/?preview=<PREVIEW_BYPASS_TOKEN>
```

Clicking that URL once sets a signed, HttpOnly cookie `bm_prelaunch_bypass=1` valid for 30 days. After the first click, the client can navigate freely — the token is never seen again in their URL bar.

### 2. Cognito Admin sign-in
Any user in the Cognito `Admin` group bypasses the gate automatically once they sign in. No URL parameter needed.

## Where the token lives

The token is stored in **AWS Secrets Manager** at secret name `BmDecor/PreviewBypassToken` in `eu-west-1`. This is the source of truth.

- Fetch the current value (requires the `bmdecor` AWS profile with `secretsmanager:GetSecretValue` permission):
  ```bash
  aws --profile bmdecor --region eu-west-1 secretsmanager get-secret-value \
    --secret-id BmDecor/PreviewBypassToken \
    --query SecretString --output text
  ```
- The live Lambda reads it through the `PRELAUNCH_BYPASS_TOKEN` env var baked in at CDK deploy time. If you rotate the secret, you must redeploy `BmDecorFrontendStack` (with the new token pulled into the CDK context) to pick up the change.

## Rotating the token

When the 30-day cookie window has drifted or someone leaks the URL:

1. Generate a fresh token:
   ```bash
   openssl rand -hex 32
   ```
2. Update Secrets Manager:
   ```bash
   aws --profile bmdecor --region eu-west-1 secretsmanager put-secret-value \
     --secret-id BmDecor/PreviewBypassToken \
     --secret-string "<new-token>"
   ```
3. Redeploy `BmDecorFrontendStack` with the new token passed via `--context env:PRELAUNCH_BYPASS_TOKEN=<new-token>`.
4. Old cookies still work (the cookie value is a constant `1`, not the token itself) — users who already bypassed won't be forced out by rotation. To force everyone back through the gate, rename the cookie too (in `frontend/src/lib/prelaunch.ts`).

## Disabling the gate entirely (post-Monday cutover)

After the client approves and we flip `bmdecor.es` apex to the AWS hosting:

1. Set `PRELAUNCH_MODE=false` in the CDK context.
2. Redeploy `BmDecorFrontendStack`.
3. `preview.bmdecor.es` and the apex (once DNS is flipped) serve the real boutique to everyone; the `/coming-soon` route is still reachable if someone hits it directly, but nothing redirects there anymore.
4. Remove the `PRELAUNCH_*` env keys entirely from `requiredEnvKeys` in `infrastructure/bin/infrastructure.ts` — they're no longer needed.
5. (Optional) delete the `BmDecor/PreviewBypassToken` secret.

## Related

- Middleware: `frontend/src/middleware.ts`
- Gate helper: `frontend/src/lib/prelaunch.ts`
- Fallback page: `frontend/src/app/coming-soon/page.tsx`
- CDK stack: `infrastructure/lib/frontend-stack.ts` (`SsrFunction` receives the env vars)
- Epic: #44 (AWS migration)
