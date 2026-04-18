# Handover — BM Decoración session migration

> **Written:** 2026-04-18 (evening, Madrid time)
> **Reason:** Jason's Linux laptop crashed mid-session; resuming on a Mac. This doc is a self-contained briefing so the fresh Claude session (and Jason) can pick up without rediscovering state.

---

## 1. First rule — FINISH READING BEFORE ANY TOOL CALL

Do not run a single tool, write a single file, or even `git status` until you have read:

1. This whole document.
2. `bmdecor-boutique/CLAUDE.md` (the 42 KB project brief — symlinked from the outer workspace).
3. Every memory file listed in §4 below (they encode non-negotiable operating rules; they may not have transferred to the Mac).
4. The three priority GitHub tickets (#28, #15, #50) and the three priority PRs (#57, #70, plus whatever's new on top of main).

Then report back per §15. Do not start work until Jason tells you what to tackle first.

---

## 2. What this project is

**BM Decoración (`bmdecor.es`)** is a premium digital boutique for paint and wall-decoration brands, serving the Costa del Sol / Marbella design market. Independent venture, not affiliated with `benjaminmoore.com.es`. Physical hub at **Calle Dublín 21, Marbella, Spain**. Built on the **Brand House model**: each brand (Benjamin Moore, Farrow & Ball, Little Greene, soon Orac Décor) gets a dedicated, immersive experience with its own colour collections, product structure, and buying journey — immersive brand heritage takes priority over unified catalog browsing.

**Stack:** Next.js 16 App Router (TypeScript) + Tailwind + Shadcn UI + Framer Motion. DynamoDB single-table (`BmDecorProducts`) in `eu-west-1`, AWS account `450284264313` via the `bmdecor` SSO profile. Auth: AWS Cognito (User Pool `eu-west-1_JxtlXtf30`, BmDecorWebClient `4o28lhd6d4bslgke642b4rntoo`). Payments: Stripe restricted key (21% Spanish IVA included). Currency: EUR.

**Hosting:** Currently Vercel (`frontend-five-beige-41.vercel.app`, project `jherren80-9618s-projects/frontend`, IDs `team_2GkunwSiqE4HaUzcirBvJgo7` / `prj_9y2XUx4owjXQ7wCZ47jtJ1bu0K6F`). **Actively migrating to AWS** via OpenNext + CDK (epic #44) — the destination is CloudFront + SSR Lambda in `eu-west-1`, Vercel is transitional.

**Owner (client):** Jason's friend. Paint-industry expert. Non-technical. Russian native speaker. The work is a **side project**, not Jason's day job. Monday **2026-04-21** is a client review — the main pressure driving this week.

---

## 3. What happened (why this handover exists)

Jason's Linux laptop crashed mid-session. We've been working intensively on the Vercel→AWS migration since 2026-04-17. There have been **multiple crashes during the day**. Jason is now moving to a Mac and needs the fresh Claude session to come up fully briefed without re-discovering everything from scratch.

Key implication: **memory files at `/home/jason/.claude/projects/-home-jason-bmdecor-project/memory/` exist on the crashed Linux machine. They may or may not transfer.** This document deliberately duplicates the critical content of those memory files so the fresh Claude on Mac can operate without them if necessary. §12 below captures the rules.

---

## 4. Required reading before any action

Read in this order. The line counts give you a size hint.

### In-repo (travels with the clone)
- `CLAUDE.md` — **42 KB, ~350 lines.** The project master brief — business identity, brand houses, architecture, portals, ingestion, schema, source-of-truth model, open issues, specialist agents, MCPs, AWS safety gate, development workflow, communication style, absolute constraints. **This is the single most important file; read it first after this handover.**
- `docs/aws-amplify-setup.md` — Original AWS migration runbook. Note: actual implementation pivoted to OpenNext + CDK (not Amplify). Runbook contains useful fallback paths.
- `docs/preview-bypass-usage.md` — How to share the pre-launch bypass URL with the client (with rotation instructions).
- `docs/client-progress-access.md` — Bilingual EN+RU one-pager Jason sends the client to explain how to read `github.com/orgs/BMDecores/projects/1`.
- `docs/client-brief/` (outside the repo, in the workspace at `/home/jason/bmdecor-project/docs/client-brief/`) — 5 DOCX files with the client's raw requirements, plus `text/*.txt` conversions. 5.4 MB total. Canonical source of requirements.
- `docs/client-questions/` — 7 open client-decision questions as bilingual markdown files. Answers from the client unblock specific GitHub issues; those links are inside each file.
- `amplify.yml` — unused since the OpenNext pivot; kept as fallback scaffolding.

### Memory files (may not exist on the Mac — their content is summarised in §12)
Path: `/home/jason/.claude/projects/-home-jason-bmdecor-project/memory/` (Linux) or the Mac-equivalent auto-memory path. Files currently there:

| File | Purpose |
|------|---------|
| `MEMORY.md` | Index of all memories with one-line descriptions. |
| `user_side_project_context.md` | Side project for a friend; user has a day job (uses Slack there); calibrate for solo dev. |
| `user_communication_style.md` | Plain language, no jargon, decide and execute, short reports. |
| `project_source_of_truth.md` | GitHub main is the goal; Vercel is temporary until migration completes. |
| `feedback_use_all_mcps.md` | Cross-reference MCPs; don't rely on a single source. |
| `project_vercel_dirty_deploys.md` | (historical) All pre-pipeline deploys had `gitDirty=1`. |
| `project_aws_profile_safety_gate.md` | `bmdecor` profile is commented out in `~/.aws/config` on purpose; default = someone else's account; **never fall back**. |
| `feedback_github_issues_tracking.md` | Every meaningful task → a GitHub issue in `BMDecores/bmdecor-boutique`. |
| `feedback_github_pro_and_agents.md` | Leverage Projects / templates / Actions / Dependabot + specialised sub-agents with bmdecor context. |
| `feedback_fix_typos_dont_preserve.md` | Correct source-data typos (e.g. `distamper`→`distemper`) at ingestion; don't propagate. |
| `reference_client_brief.md` | Pointer to the client brief in `docs/client-brief/`. |
| `feedback_ask_when_things_fail.md` | Surface failures immediately; don't silently continue. |
| `feedback_aws_best_practices.md` | Use every appropriate AWS service correctly (IAM roles > keys, KMS, WAF, PITR, alarms). |
| `project_aws_opennext_migration.md` | Epic #44 — frontend is moving from Vercel to AWS via OpenNext + CDK in eu-west-1. |
| `feedback_use_full_bm_api.md` | BM API exposes LRV / harmony / sample SKUs / datasheets / multi-res images — surface them, don't hard-code. |
| `project_client_language_russian.md` | Client's native language is Russian; client-facing docs bilingual EN+RU, internal docs English. |
| `reference_client_questions.md` | 7 decision questions for the client as markdown files at `docs/client-questions/` (bilingual). |
| `project_client_progress_board_priority.md` | Keeping `github.com/orgs/BMDecores/projects/1` current is a first-class client deliverable. |
| `feedback_save_progress_regularly.md` | User's computer crashes — save state to memory + CLAUDE.md + AWS + GitHub after every meaningful step. Never rely on `/tmp`. |
| `project_session_resume_2026-04-18.md` | **Read this.** Session checkpoint from 2026-04-18 with the current state of the AWS migration deploy and pending steps. |

---

## 5. Current git state (ground truth)

### Branch + dirty state
- **Current branch:** `main`
- **Local commits:** in sync with `origin/main` (`## main...origin/main`)
- **Uncommitted modifications (INTENTIONAL — do not revert without talking to Jason):**
  ```
  M infrastructure/bin/infrastructure.ts
  M infrastructure/lib/frontend-stack.ts
  ```
  These are in-flight CDK edits from the ongoing OpenNext migration deploy. 17 + 41 lines of additions. Related to the 403 OAC issue described in §7.
- **Untracked (safe to ignore):**
  ```
  ?? frontend/.open-next/                               (OpenNext build output — regenerate via npx open-next build)
  ?? frontend/test-results/                             (Playwright test artifacts)
  ?? infrastructure/bin/infrastructure.ts.tmp.5686.xxx  (editor temp file — delete)
  ```

### Recent commits on `main` (last 20)
| SHA | Message |
|-----|---------|
| `7f994ad` | **[HEAD]** fix(cdk): switch Lambda Function URLs to AWS_IAM + CloudFront OAC (best practice + unblocks public-access block) (#51) |
| `88d9a13` | docs: preview-bypass token usage + rotation instructions (#53) |
| `ccd959d` | chore(ci): disable Vercel deploy step (Hobby quota exhausted; AWS migration in flight) (#52) |
| `e0858d5` | fix(cdk): resolve openNextDir path + pass certArn via props (fixes frontend stack synth) (#49) |
| `87b199f` | feat(infra): pre-launch gate + AWS Amplify Hosting setup (step 1 of AWS migration) (#46) |
| `b21a97e` | bmdecor vscode workspace |
| `b9953cf` | Merge pull request #36 from dependabot next+react |
| `00bb45d` | chore(deps): bump the next-and-react group |
| `a541c67` | Merge pull request #42 — feat/21-auto-select-colour |
| `e278d01` | Merge pull request #43 — feat/vercel-analytics-sdks |
| `604526a` | feat(analytics): enable Vercel Web Analytics + Speed Insights |
| `feae009` | feat(shop): auto-select colour on product page when ?color param present |
| `2f9d4df` | fix(ci): drop strict tsc step so pre-existing TS errors do not block deploys |
| `1a498e2` | Merge PR #35 — chore/github-actions-deploy-pipeline |
| `689f4cd` | Merge PR #34 — feat/17-bigger-product-images |
| `626cdbd` | Merge PR #33 — chore/reconcile-deploy-to-main |
| `7656e0b` | Merge PR #32 — docs/claude-md-project-brief |
| `bd53d4a` | Merge PR #10 — chore/github-pro-setup |
| `8058f37` | chore(ci): pass git metadata env vars so deploys still show commit info |
| `5731ed1` | chore(ci): add GitHub Actions pipeline |

### Local branches
- `main` (current)
- `chore/reconcile-deploy-to-main` — legacy, PR #33 merged; safe to delete
- `docs/aws-audit-2026-04-18` — **in progress** — AWS resource audit draft; see §6
- `docs/client-visibility-questions` — PR #57 pending
- `feat/17-bigger-product-images` — PR #34 merged; safe to delete
- `feat/19-product-imagery-from-s3` — PR #70 pending
- `feat/21-auto-select-colour` — PR #42 merged; safe to delete
- `feat/aws-migration-opennext` — the migration work branch; active
- `feat/playwright-e2e-suite` — PR #55 pending
- `feat/vercel-analytics-sdks` — PR #43 merged; safe to delete
- `wip/feb-2026-session` — preserved historical WIP from Feb; keep, do not delete

### Remote branches
- `origin/main`, plus each of the local branches above, plus several active Dependabot branches (`dependabot/npm_and_yarn/frontend/*`)
- `origin/v0/jherren80-9618-26c47d19` — stale v0.app branch from February

### Stashes
- `stash@{0}: On main: pre-playwright-pr-cleanup` — whatever was dirty when the Playwright PR was being cut; inspect before dropping
- `stash@{1}: On feat/aws-migration-opennext: preswitch-cleanup-1776509605` — dirty state before branch-switching during the migration

---

## 6. Open work

### Open PRs (check `gh pr list` for the authoritative view)
| # | Branch | Title / status |
|---|--------|----------------|
| 72 | `docs/aws-audit-2026-04-18` | `docs(aws): resource audit — propose ~€60/mo savings by deleting dead architectures` — in progress, waiting for Jason's delete/keep decisions on each listed resource. |
| 70 | `feat/19-product-imagery-from-s3` | Farrow & Ball product imagery wired from S3 (closes #19 for F&B). DynamoDB already migrated in prod — 5 F&B CAN products point at `bmdecor-images`. `frontend/next.config.ts` allows the new host. Awaiting merge. |
| 57 | `docs/client-visibility-questions` | 7 bilingual client-decision questions + `docs/client-progress-access.md`. Awaiting merge. |
| 55 | `feat/playwright-e2e-suite` | Playwright E2E — 17 tests, all green last run. Awaiting merge. |
| 48 | dependabot/dev group | Weekly dev dep bumps. Review + merge if green. |
| 40, 39, 37 | various dependabot | Individual dep bumps (tiptap, fuse.js, tailwind-and-ui). Review + merge. |

No open PR from the current user-session is dirty. The `M` infrastructure changes are uncommitted only because the migration deploy paused.

### In-flight tasks (not yet PR'd)
- **AWS migration deploy** (per `project_session_resume_2026-04-18.md`): CDK FrontendStack was deployed once but CloudFront→Lambda URL returned 403 AccessDenied. PR #51 (the OAC/AWS_IAM fix) merged to main. **The fix still needs to be applied to the live stack** via a `cdk deploy BmDecorFrontendStack` using the rebuilt context args. See §6 "next steps" below.
- **AWS resource audit** (issue #47): ~70% complete. Lists CloudFormation stacks, Lambdas, CloudFront distributions, Amplify apps, ACM certs. Remaining: IAM roles, Route 53 records, API Gateway, Cognito, Secrets Manager, EventBridge rules, CloudWatch log groups, SNS/SQS, KMS keys, RDS, VPCs beyond `bmdecortemp-vpc`, ECS/EKS. Draft at `docs/aws-audit-2026-04-18.md` on the `docs/aws-audit-2026-04-18` branch.

### Scheduled / background jobs
- **GitHub Actions CI + Deploy pipeline** (`.github/workflows/ci-deploy.yml`) — runs on every PR (preview) and every push to `main` (production). **Vercel deploy step is currently disabled** via `VERCEL_DEPLOY_ENABLED=false` (Hobby quota exhausted, PR #52 landed 2026-04-18). Once the AWS cutover completes, swap the deploy target to CDK or re-enable Vercel as a failsafe.
- **A session cron monitor** was running at `:17` and `:47` past the hour to surface CI failures — may or may not have survived the crash; verify with `CronList` on the new session if it matters.

### Top open issues by priority
The `BMDecores/projects/1` board (public, 54–66 items depending on latest count) is the canonical view. High-priority tickets relevant to Monday:

| # | Title | Priority |
|---|-------|----------|
| 28 | Fix Benjamin Moore colour collections — order, scroll-on-click, descriptions, dense layout | high |
| 15 | Color page redesign — 3-level selector, big preview, per-colour imagery (epic) | high |
| 16 | Restructure brand nav — Colours + Products (epic) | high |
| 50 | AWS hardening — best practices pass after Monday cutover | high |
| 27 | "2811 Curated Colors" counter is inaccurate (investigation) | low, blocks #28 |
| 12 | Wallpaper catalog F&B + LG (epic) | high |
| 44 | Epic: Vercel → AWS migration | (tracker for the whole epic) |
| 45 | Point `bmdecor.es` at current Vercel deployment (Monday demo win — fallback path) | (demo-critical) |

Seven client-decision questions (`docs/client-questions/`) block: #28 (Q1), #16 (Q2), #30 (Q3), #27 (Q5), #29 (Q6), #20 + #22 (Q7). **Sending those seven questions to the client is itself a high-leverage action** — each answer unblocks a feature.

---

## 7. Current honest state (the truth, not marketing)

### What works and is live
- **Production frontend is live on Vercel** at `https://frontend-five-beige-41.vercel.app`. Latest deploy uses clean-tree CI pipeline (`gitDirty=0`). BM / F&B / LG colour catalogues, product detail pages, PaintCalculator, ColorPickerModal, auto-colour selection from URL param all functional.
- **Vercel Web Analytics + Speed Insights** enabled (PR #43).
- **S3 brand imagery** — 389 files / 2.57 GB uploaded to `s3://bmdecor-images/brands/`. Farrow & Ball products (5 CAN SKUs) already point at S3 URLs in DynamoDB.
- **DynamoDB** healthy: `BmDecorProducts` has ~4,067 BM + 630 F&B + 659 LG colours. BmDecor-PostConfirmation Lambda auto-assigns new Cognito users to the Customer group.
- **CI pipeline** reliably builds on every PR. Dependabot open PRs green.
- **Public progress board** at `github.com/orgs/BMDecores/projects/1` — 54+ items, statuses current as of 2026-04-18.

### What's half-shipped
- **AWS migration (epic #44)** — scaffolding complete, CertificateStack deployed in us-east-1 (cert ARN `arn:aws:acm:us-east-1:450284264313:certificate/1f34e416-15c8-42d1-a0f5-f6237579f478`, issued), FrontendStack deployed (CloudFront distribution `E2REYDYIHUVV7F`, SSR Lambda, image optimizer). **But**: CloudFront→Lambda URL returned 403 (AccessDenied). PR #51 landed the fix (AWS_IAM auth + OAC). **The stack has NOT been redeployed with the fix yet.** Until it is, `preview.bmdecor.es` via CloudFront still 403s.
- **Pre-launch gate** (`PRELAUNCH_MODE` + `PRELAUNCH_BYPASS_TOKEN`) — code is live in `frontend/src/middleware.ts`, token stored in Secrets Manager at `BmDecor/PreviewBypassToken` (ARN ends `-NKU5dH`). **Gate is off** (`PRELAUNCH_MODE` unset on both Vercel and the CDK stack). Flipping it on is a one-env-var change per target.
- **Monday fallback plan** (issue #45): CNAME `preview.bmdecor.es` → Vercel + `PRELAUNCH_MODE=true` on Vercel. **Not wired yet.** Before the AWS cutover was attempted, Jason said "I want the full migration to AWS done today. i dont want to use vercel at all" — so the fallback is still available but out of favour. If the AWS redeploy doesn't land by Monday, the CNAME path is still the zero-risk demo option.

### What's broken or incorrect
- **`~70 TypeScript errors are still in the codebase`** — tracked in #41. The `tsc --noEmit` step was dropped from CI (PR `2f9d4df`) so they don't block deploys. Must fix before re-enabling strict CI.
- **`2811 Curated Colors` lobby counter is wrong** — tracked in #27. Likely a stale hardcoded value; real count is closer to ~5,356 across brands.
- **Little Greene product imagery is broken** — products point at `/images/products/lg-*.jpg` paths that 404. Blocked on the LG scraper delivering real can photos (tracked in #71).
- **Stale CloudFront distributions in eu-west-3** — `E2LAD2EPTUNTFA`, `E1J7AJ5Q3FRB0P`, `E3CCOR4513MPMV` are all pointed at eu-west-3 S3 origins that predate this project's move to eu-west-1. Proposed for deletion in the audit (#72).
- **Orphan Amplify app** `bmdecor-dev` (`d1777jyl9z28yo`) wired to an unrelated repo (`bmdecores/bmdecores-store`). Proposed for deletion.
- **Two `bmdecor*` DynamoDB tables** (`BmDecorProducts` AND `bmdecor-products`) — the lowercase one may be legacy; audit confirms whether.

### Deploy / pipeline flags
- `VERCEL_DEPLOY_ENABLED=false` on GitHub Actions (Hobby quota reason)
- Vercel Git Integration is **disconnected** (done earlier in the session) — the GHA pipeline owns deploys
- Vercel CLI still authenticated as `jherren80-9618` locally
- AWS SSO: active on the crashed Linux machine as of 2026-04-18 ~17:00 UTC. **Assume expired on the Mac** and re-login with `aws sso login --profile bmdecor`

### Secrets / credentials
- `BmDecor/BenjaminMoore` — BM API credentials (Secrets Manager, eu-west-1)
- `BmDecor/PreviewBypassToken` — bypass token for pre-launch gate (Secrets Manager, ARN ends `-NKU5dH`, 65 bytes incl newline)
- `ADMIN_API_KEY` env var — admin script auth (currently in Vercel prod env vars)
- Stripe restricted key — Vercel prod env (limited scope)
- **Gone (crash):** `/tmp/bmdecor-bypass-token.txt`, `/tmp/vercel-prod-env.snapshot`, `/tmp/cdk-context-args.sh` — see §8

---

## 8. Things NOT in git that must transfer manually (or regenerate)

| Path | Size | Content | Why it matters | What to do on Mac |
|------|------|---------|----------------|--------------------|
| `/home/jason/.claude/projects/-home-jason-bmdecor-project/memory/` | ~50 KB | 20 memory files (listed in §4). Rules, project facts, session checkpoints. | They encode non-negotiable operating rules. | Rsync from Linux if accessible. Otherwise, §12 below is the fallback. |
| `/home/jason/bmdecor-project/assets/brands/` | 2.6 GB | 389 staged brand image files (BM paint cans, F&B cans + wallpaper, Noel & Marquet). | Source for S3 upload / product imagery. **Already synced to S3 at `s3://bmdecor-images/brands/`** — if the local copy is gone, re-download from S3 if needed. | Skip; prefer working from S3. |
| `/home/jason/bmdecor-project/docs/client-brief/` | 5.4 MB | 5 Word docs with client requirements + text conversions. Canonical client brief. | Requirements source of truth until superseded. | Transfer from Linux if possible. Otherwise request from client. |
| `/home/jason/bmdecor-project/.claude/` + `/home/jason/bmdecor-project/docs/claude-project/` | small | Claude Code project-level configs. | Non-critical but convenient. | Regenerate as-needed. |
| `~/.aws/config` + `~/.aws/credentials` | small | AWS profile config (`[profile bmdecor]`, `[sso-session bmdecor-sso]`) — **may be commented out by default.** | Without this, the SSO login command does nothing. | Replicate on Mac. See §10. |
| `/tmp/bmdecor-bypass-token.txt` | 65 B | Bypass token for pre-launch gate. | Was regenerated once already; **currently gone after the crash** — re-pull from Secrets Manager. | `aws secretsmanager get-secret-value --secret-id BmDecor/PreviewBypassToken --profile bmdecor --region eu-west-1 --query SecretString --output text` |
| `/tmp/vercel-prod-env.snapshot` | ~2 KB | 34 Vercel env values (ADMIN_API_KEY, Cognito IDs, AWS keys etc). | Needed for the CDK deploy context. **Gone.** | `vercel env pull --environment=production --yes /tmp/vercel-prod-env.snapshot` from `frontend/` dir. |
| `/tmp/cdk-context-args.sh` | ~1 KB | Shell exports that build `$CONTEXT_ARGS` for `cdk deploy`. | Needed to deploy the CDK stack. **Gone.** | Regenerate via the Python assembler described in `project_session_resume_2026-04-18.md`. |
| `frontend/.open-next/` | ~100 MB | OpenNext build artifacts. | Required for CDK deploy (Lambda SSR code). | Regenerate with `cd frontend && npx open-next build`. |
| `frontend/.env.local`, `.env.provision`, `.env.production.snapshot` | small | Local env values. | Speed up dev. | Ignore unless dev-server is needed. Actual prod values are in Vercel / Secrets Manager. |

---

## 9. Environment setup checklist (on the Mac)

1. **Clone the repo:**
   ```
   mkdir -p ~/bmdecor-project && cd ~/bmdecor-project
   gh repo clone BMDecores/bmdecor-boutique
   ```
   (Or just the inner project; Jason's preference is to have `bmdecor-project/bmdecor-boutique/` mirroring the Linux layout.)

2. **CLAUDE.md symlink** (optional but matches the Linux setup):
   ```
   cd ~/bmdecor-project
   ln -s bmdecor-boutique/CLAUDE.md CLAUDE.md
   ```

3. **Install runtime deps:**
   ```
   cd ~/bmdecor-project/bmdecor-boutique/frontend
   npm ci
   cd ../infrastructure
   npm ci
   ```

4. **Install the AWS CLI, Vercel CLI, gh CLI, `uv`, Docker (for the Grafana MCP), Node 24.**

5. **AWS profile:** Add `[profile bmdecor]` + `[sso-session bmdecor-sso]` to `~/.aws/config`. Account `450284264313`, region `eu-west-1`. **Then:**
   ```
   aws sso login --profile bmdecor
   aws sts get-caller-identity --profile bmdecor   # should show account 450284264313
   ```

6. **GitHub CLI:** `gh auth login`; verify `gh auth status` shows the `jherren` account.

7. **Vercel CLI:** `vercel login` (email `jherren80@gmail.com`).

8. **Re-authenticate the Claude Code MCPs** — most MCPs need re-auth on a new machine (Stripe, Vercel, Gmail, Google Calendar, ClickUp). `claude mcp list` to see state.

9. **Migrate or regenerate memory** — if possible, rsync the memory directory from the crashed Linux laptop. Otherwise treat §12 below as the rule set.

10. **Regenerate `/tmp/*` artefacts** before any CDK deploy (§8).

11. **Smoke-test:**
    ```
    cd ~/bmdecor-project/bmdecor-boutique/frontend
    npm run build        # should complete (~70 TS errors are tolerated; lint warnings fine)
    npm run dev          # visit http://localhost:3000
    ```

### Don't install unless needed
- No database runs locally — DynamoDB is live AWS.
- No queue / broker / cron locally — serverless.
- Test suite: Playwright (PR #55). `cd frontend && npx playwright install && npx playwright test` (~17 tests, all green on last run).

---

## 10. External service configuration

| Service | Endpoint / identifier | How to connect | Start/stop |
|---------|-----------------------|----------------|-----------|
| AWS account | `450284264313`, eu-west-1 + us-east-1 (ACM) | `aws sso login --profile bmdecor` | SSO token ~8–12h TTL |
| DynamoDB | Tables: `BmDecorProducts`, `bmdecor-carts`, `bmdecor-orders`, `bmdecor-products`, `bmdecor-users` | `aws-dynamodb` MCP or `aws dynamodb ...` CLI | Always-on |
| S3 | `bmdecor-images` (brand imagery, 389 files / 2.57 GB), `bmdecor.es` (static site, possibly stale), `cdk-hnb659fds-assets-450284264313-eu-west-1` (CDK bootstrap) | `aws s3 ...` CLI | Always-on |
| Secrets Manager | `BmDecor/BenjaminMoore`, `BmDecor/PreviewBypassToken` (ARN ends `-NKU5dH`) | CLI | Always-on |
| Cognito | User Pool `eu-west-1_JxtlXtf30` (BmDecorUserPool), Client `4o28lhd6d4bslgke642b4rntoo` (BmDecorWebClient), groups Admin/Employee/Customer | JWT in `bmdecor_id_token` cookie | Always-on |
| CloudFront (production OpenNext) | Distribution `E2REYDYIHUVV7F` (eu-west-1-originated, alias `preview.bmdecor.es`) | Managed by FrontendStack | **Currently 403s** until the PR #51 fix is redeployed |
| CloudFront (static site / legacy) | `E2LAD2EPTUNTFA` (aliases `bmdecor.es, *.bmdecor.es, www.bmdecor.es`, origin eu-west-3) — likely stale | — | Audit in #72 |
| Vercel | Project `jherren80-9618s-projects/frontend`, team `team_2GkunwSiqE4HaUzcirBvJgo7`, prod URL `frontend-five-beige-41.vercel.app` | `vercel login` | GHA pipeline deploys; Git Integration disconnected |
| Stripe | Restricted key (Vercel env var) | Stripe MCP needs OAuth (#8 pending) | — |
| Route 53 | Zone `bmdecor.es.` at `Z0888304370ICLTMQOITD`, 17 existing records | `aws route53 ...` CLI | — |
| Benjamin Moore API | `api.benjaminmoore.com`, key in Secrets Manager `BmDecor/BenjaminMoore` | HTTP | — |
| GitHub repo | `BMDecores/bmdecor-boutique` | `gh` CLI | — |
| GitHub Project | `github.com/orgs/BMDecores/projects/1` (public, client-visible) | `gh project ...` or web UI | **Keep current — client reads this** |

---

## 11. Integrations already wired

- **GitHub Actions pipeline** (`.github/workflows/ci-deploy.yml`): runs on every PR (preview) and every push to `main` (production). Type-check + lint + `vercel build` + `vercel deploy` (currently behind `VERCEL_DEPLOY_ENABLED=false` gate). Preview URL comment posted on PRs via `actions/github-script@v7`.
- **Dependabot** (`.github/dependabot.yml`): weekly grouped npm bumps for `/frontend` (next+react, tailwind+ui, types, dev separately); monthly github-actions bumps.
- **Issue templates** (`.github/ISSUE_TEMPLATE/`): bug / feature / chore / investigation + config disabling blanks.
- **PR template** (`.github/pull_request_template.md`).
- **Five specialist Claude agents** (`.claude/agents/`): `boutique-reviewer`, `ingestion-specialist`, `aws-cdk-reviewer`, `deploy-hygienist`, `source-of-truth-reconciler` — each pre-briefed with bmdecor context.
- **Public GitHub Project board** (`BMDecores/projects/1`): new issues auto-added; statuses manually maintained. Client reads this.
- **Post-confirmation Cognito Lambda**: `BmDecor-PostConfirmation` auto-assigns new users to the Customer group.
- **Admin migration endpoints** (`/api/admin/migrate/brands`, `/api/admin/migrate/color-families`): chunked (batchLimit 500 + hasMore continuation) to respect Vercel's 10 s serverless limit.
- **Session cron monitor** (optional — may not have survived): scheduled `:17` and `:47` past hour to surface CI failures.

---

## 12. Operating rules (non-negotiable — from memory files)

> If the memory files did not transfer to the Mac, these rules STILL apply. They were set by Jason and re-confirmed across multiple sessions.

### Autonomy + permissions
- `~/.claude/settings.json` has a broad allowlist (git, gh CLI, file ops, unzip, python, npx, uvx, `aws --profile bmdecor:*`, all project MCPs, WebFetch, WebSearch) and a deny list (`Bash(sudo:*)`, `Bash(rm -rf:*)`). Don't re-prompt for routine ops.
- The **Vercel plugin** was enabled in settings recently (`enabledPlugins.vercel@claude-plugins-official`). Expect the plugin's Vercel tools to show up once authenticated.

### Communication style
- **Plain language, not jargon.** Swap "CodeQL" for "automatic security scanning"; "gitDirty=1" for "deploy included work we hadn't committed." Jason is not deeply technical on CI / git / AWS internals.
- **Decide and execute; no option menus.** When Jason says "do what you think is best," treat it as broad authorisation — present outcomes, not options, unless the choice is genuinely irreversible.
- **Short reports, not plans.** "I did X. See Y. What's pending on my vs. your side." That's the template.
- **Acknowledge CLI fallback explicitly.** If an MCP doesn't cover an operation and you fall back to `aws` / `vercel` CLI, say so.

### AWS safety gate (absolute)
- **NEVER use `AWS_PROFILE=default`, EVER.** Default belongs to someone else's account. The `bmdecor` profile is commented out in `~/.aws/config` on purpose — that's the intentional gate.
- **Always specify `--profile bmdecor`** on `aws` CLI commands.
- `bmdecor` is SSO-based; two steps to activate: uncomment profile + `aws sso login --profile bmdecor`. Token expires in ~8–12 h.
- **Verify account ID `450284264313`** before any state-changing action.
- **Region `eu-west-1`** for all infra; ACM certs for CloudFront MUST be in us-east-1.
- If the `bmdecor` profile is commented out, **stop and ask Jason to activate it** — do not improvise with default.

### Git + issue workflow
- **Every meaningful task → a GitHub issue** in `BMDecores/bmdecor-boutique`. Reference issues in commits and PRs (`Closes #N`).
- **Use issue templates** (`.github/ISSUE_TEMPLATE/`) for consistency.
- **Branches:** `<type>/<short-description>` (e.g. `feat/14-color-page-redesign`, `chore/ci-caching`).
- **PRs required for `main`**; no direct push unless doc-only and Jason-approved.
- **Conventional commit prefixes:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `wip(<scope>)`.
- **Co-authored-by trailer** for Claude collaborations when committing from a Claude session.
- **Test plan honesty** in PR descriptions: say what was verified AND what was skipped and why. Don't claim "tested" without clicking through.

### Data + ingestion conventions
- **Fix typos on ingestion** — don't preserve client misspellings as "provenance." E.g. `Casein Distamper` → `casein-distemper`. The raw archive retains originals for audit; derived artifacts carry clean values.
- **Use client-provided strings verbatim** for brand-specific or proper-noun content (colour names, product lines, collection names) — the typo rule is only about typos.
- **Never commit `ingestion/data/`** — gigabytes of raw brand source data, always gitignored.
- **Unified `PRODUCT` schema** in DynamoDB — all brands must normalise to the same shape. `shared/types.ts` is the contract.

### Content + language
- **Client's native language is Russian** — client-facing docs are bilingual EN + RU side by side (see `docs/client-questions/*`). Internal docs (code comments, CLAUDE.md, HANDOVER.md, this file) are English.
- **Client brief is at `docs/client-brief/`** (not in the repo — in the outer workspace). 5 Word docs + text conversions. Canonical requirements source until superseded.

### BM API usage (highest-leverage feature direction)
- **Use the FULL BM API capabilities** — GetColorDetail / GetPaletteByCode / GetProductDetail expose LRV, colour harmony, sample SKUs (`wetSampleSKU`, `drySampleSKU`), datasheets (TDS), 1x/2x/3x image URLs, `ProductTypesAvailable` per colour, `eStoreAvailable` buyability flag, marketing descriptions. Surface these in the UI instead of hard-coding. Tracked in issues #58–#69.

### Reliability + resume-ability
- **Save progress regularly** — Jason's computer crashes intermittently. Re-save state to memory + CLAUDE.md + GitHub after every meaningful step. Never rely on `/tmp/*`, untracked files, or the running conversation.
- **Keep one session-resume memory file current** — `project_session_resume_<date>.md`. Update at every checkpoint, not only at the end. Save **before** risky long-running ops (`cdk deploy`, migrations).
- **When a session resumes after a crash:** read the session-resume memory first; then diff current state (`git`, `gh pr list`, `aws`, etc.) against what the memory says; don't restart from zero.

### Tool use
- **Use all relevant MCPs** for investigation — cross-reference Vercel + GitHub + Grafana + ClickUp + Vercel + aws-dynamodb + aws-cdk + Chrome DevTools + Playwright + Context7. Don't rely on a single source.
- **Pause and ask when things fail** — surface failures immediately; don't silently continue with other work after an error.
- **Prefer specialist agents** (`.claude/agents/*`) for role-specific work; don't duplicate their setup in the main thread.

### Pipeline + source of truth
- **GitHub `main` is the goal** canonical source of truth. Vercel is transitional (becoming obsolete post-AWS-migration).
- **"What's in production?"** uses Vercel MCP / runtime logs. **"What's in the repo?"** uses `git` / GitHub MCP. Be explicit about which.
- The pipeline owns deploys. Local `vercel --prod` from a dirty tree is banned. `deploy-hygienist` agent enforces cleanliness checks.

### Client-visibility
- **`BMDecores/projects/1`** public GitHub Project is a client deliverable. Keep it current. Moving issues to Done on PR merge; add `status:blocked` label when blocked.
- **`docs/client-progress-access.md`** is the shareable access doc Jason sends the client. Keep bilingual.
- **Post-Monday:** ship `preview.bmdecor.es/progress` branded page (#56) reading the same board via GitHub API.

---

## 13. Platform / environment differences (Linux → Mac)

- **Memory directory path** changes from `/home/jason/.claude/projects/-home-jason-bmdecor-project/memory/` to `/Users/jason/.claude/projects/-Users-jason-bmdecor-project/memory/` (or wherever the Mac's equivalent resolves). Memories are keyed by CWD.
- **`base64 -w0`** on Mac = GNU coreutils, typically not installed. Use `base64` (Mac native) or install `coreutils` via Homebrew for the `-w0` flag. This matters if you push files via `gh api` the way the Linux session did.
- **`readlink`** — different default behaviour; `greadlink` from Homebrew `coreutils` if needed.
- **LibreOffice headless**: was used to convert client DOCX → TXT. Install LibreOffice + the `soffice` command if the client sends new DOCX files.
- **Docker required** for the Grafana MCP (`docker run --rm -i grafana/mcp-grafana ...`). Install Docker Desktop on the Mac if needed.
- **File permissions**: `chmod 600 /tmp/cdk-context-args.sh` behaves the same; just be aware `/tmp` is `/tmp` on both.
- **`gh` + `vercel` + `aws`** all work identically on Mac (same CLIs).
- **Line endings**: git should auto-handle; don't `autocrlf` anything.

---

## 14. Human context

Jason is a solo developer building this boutique as a **side project for a friend** (the paint-boutique client/owner). Jason has a day job separately (uses Slack there; not relevant to this project). The client is a paint-industry expert, non-technical, Russian native speaker.

**The week of 2026-04-17 → 2026-04-21 has been intense:**
- Started as a broad refactor / GitHub setup session.
- Expanded into an ambitious Vercel → AWS migration driven by Jason's "i dont want to use vercel at all" directive.
- Jason's laptop has **crashed multiple times during the session**. Each crash means `/tmp/` artefacts are gone, the Claude conversation is lost, and work must be re-picked-up from memory/CLAUDE.md/git.
- The migration's CDK deploy hit a 403 AccessDenied issue (CloudFront → Lambda URL OAC). A fix shipped (PR #51) but the stack hasn't been redeployed with it yet.
- Monday 2026-04-21 is a real client review. If the AWS cutover isn't ready, the fallback (CNAME preview.bmdecor.es → Vercel + pre-launch gate on) is zero-risk and already scaffolded.

**Tone:** Jason is calm, decisive, trusts the agent to execute. He values short direct reports and dislikes jargon or option menus. He's under genuine time pressure but isn't panicking — the fallback exists and he knows it. The repeated crashes are the frustrating thing, not the work itself.

**Don't:** lecture, ask permission for routine operations, re-explain things already in CLAUDE.md or memory.

**Do:** come up to speed from docs, report state crisply, ask which open item to tackle, then go.

---

## 15. What to do when Jason next messages you

Execute this sequence **in order**. Do not skip steps. Do not start feature work until the final step is complete.

1. **Confirm you've read this entire document** plus `CLAUDE.md` plus the memory files you can access. One sentence in the response: "Read HANDOVER.md + CLAUDE.md + N memory files."
2. **Verify the environment** with a small parallel batch:
   - `pwd` and `git status -sb` (confirm you're in the right repo, see the dirty state)
   - `git log --oneline -5` (confirm the last commit is `7f994ad` or later)
   - `aws sts get-caller-identity --profile bmdecor` (confirm SSO works + account `450284264313`)
   - `gh pr list` (confirm the PR picture matches §6)
3. **Report back in 5–8 bullets,** in this shape:
   - Branch + HEAD commit + dirty state
   - Open PRs (with numbers + one-line each)
   - Top 3 open high-priority issues
   - AWS state (SSO live? Stack latest deploy SHA?)
   - Anything that looks different from the handover (drift)
4. **Ask which of these to tackle first** (don't recommend unless Jason asks):
   - (a) Finish the AWS migration — redeploy `BmDecorFrontendStack` with the PR #51 fix so CloudFront stops 403ing
   - (b) Send the 7 client-decision questions (`docs/client-questions/`) to the client — each answer unblocks a feature
   - (c) Land any of the open PRs (#55 Playwright, #57 client visibility docs, #70 F&B imagery, #72 AWS audit, Dependabot PRs)
   - (d) Start a new high-priority feature from the board (#28 BM collections fix, #15 Color page redesign, #16 brand nav restructure)
   - (e) Fix the accumulated TypeScript errors so `tsc --noEmit` can re-enter CI (#41)
   - (f) Something else Jason names
5. **Wait for Jason to choose.** Then go.

**Do not:**
- Touch the dirty `infrastructure/` files without understanding what they do (read CDK migration memory first).
- Run `aws` commands without `--profile bmdecor`.
- Start the CDK redeploy before SSO is confirmed active AND the /tmp artefacts are regenerated (§8).
- Re-create memory files that already exist on disk — check first.
- Rebuild `.open-next/` unless a code change affects it.

**Good luck. Jason's tired but trusts you; make it easy for him.**
