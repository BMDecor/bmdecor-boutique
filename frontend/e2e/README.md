# End-to-end tests

Playwright suite exercising the live boutique at `preview.bmdecor.es` (or any `BASE_URL` you point it at).

## Layout

```
e2e/
├── gate.spec.ts         Pre-launch gate — coming-soon, bypass URL, cookie, noindex
├── navigation.spec.ts   Grand Lobby → brand pages → product detail → search
├── api.spec.ts          /api/colors, /api/color-counts, /api/products
├── guards.spec.ts       /admin and /my-studio auth redirects
└── README.md            (this file)
```

## Running

From `frontend/`:

```bash
# Install deps once
npm install
npx playwright install chromium

# Run the whole suite against preview
BASE_URL=https://preview.bmdecor.es \
  PRELAUNCH_BYPASS_TOKEN=<token-from-aws-secrets-manager> \
  npx playwright test

# Run a single file
npx playwright test e2e/gate.spec.ts

# Run against local dev (gate off by default — some tests will skip)
BASE_URL=http://localhost:3000 npx playwright test

# Open the HTML report after a run
npx playwright show-report
```

## Environment variables

| Name | Required | Default | Notes |
|------|----------|---------|-------|
| `BASE_URL` | no | `https://preview.bmdecor.es` | Target origin for all tests |
| `PRELAUNCH_BYPASS_TOKEN` | yes for gate/nav/api/guards | — | Fetch from AWS Secrets Manager: `aws --profile bmdecor --region eu-west-1 secretsmanager get-secret-value --secret-id BmDecor/PreviewBypassToken --query SecretString --output text`. Tests that need the token auto-skip if it's missing so `npx playwright test` still runs cleanly in environments without it. |

## What's covered

- **Gate** — coming-soon served without bypass, `X-Robots-Tag: noindex` header present, `?preview=<token>` grants access and sets `bm_prelaunch_bypass` HttpOnly cookie, cookie-only navigation keeps the gate bypassed, wrong token falls back to coming-soon.
- **Navigation** — Grand Lobby, brand pages (BM, F&B, LG), paint category listing, product detail (PaintCalculator + color selector present), search.
- **API** — `/api/color-counts` brand totals + collection breakdown, `/api/colors` shape.
- **Guards** — `/admin` and `/my-studio` do not render privileged content to an unauthenticated visitor.

## What's NOT covered yet (follow-ups)

- Authenticated Cognito sign-in flow.
- Cart add / remove / checkout happy path.
- Color-page 3-level selector (issue #15 — will add tests when the feature lands).
- Buy Sample button (issue #20).
- Brand nav Colours + Products restructure (issue #16).
- Multi-language EN/ES (issue #14).

## CI integration (not wired yet)

To add Playwright to the pipeline, a new GitHub Actions job would:

1. Check out main.
2. Install deps + Chromium (`npx playwright install --with-deps chromium`).
3. Pull `PRELAUNCH_BYPASS_TOKEN` from Secrets Manager via the `bmdecor` AWS profile (requires the pipeline to assume a role with `secretsmanager:GetSecretValue`).
4. Run `npx playwright test`.
5. Upload the HTML report as a workflow artifact.

Kept out of this initial PR to keep scope small; separate follow-up.
