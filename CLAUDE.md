# BM Decoración (bmdecor.es) — Project Brief

> **Last updated:** 2026-04-18
> **Next client review:** Monday 2026-04-21

Single source of truth for everyone (and every Claude session) working on this project. Read it top-to-bottom at the start of any session. When anything meaningful changes — a brand is confirmed, a ticket delivers, the AWS profile gate changes, the client approves a new layout — update this file and commit the change.

---

## 0. Mission in one paragraph

BM Decoración (bmdecor.es) is a premium digital boutique for paint and wall-decoration brands, serving the Costa del Sol / Marbella design market. Independent business venture — not affiliated with benjaminmoore.com.es. Physical hub at **Calle Dublín 21, Marbella, Spain**. The site is built on the **Brand House** model: each brand gets a dedicated, immersive experience with its own colour collections, product structure, imagery, and buying journey. Immersive brand heritage takes priority over unified catalog browsing — this is the one non-negotiable UX principle.

---

## 1. Delivery cadence — What matters this week

**Monday 2026-04-21 is a client review.** The client (the site's owner, Jason's friend) expects meaningful progress on the wishes list he delivered via `Jason.zip` (see `docs/client-brief/` and tickets #11–#30 on GitHub).

### State now (2026-04-18)
- `main` at the post-PR-#53 state: pre-launch gate + AWS Amplify setup (#46), WIP product work + config (#33), colour-picker polish (#38), bypass-token docs (#53), Vercel-deploy step disabled pending AWS cut-over (#52). Gate live at `preview.bmdecor.es`.
- Public client progress board: **https://github.com/orgs/BMDecores/projects/1** (66 items). Shareable client-visibility guide: `docs/client-progress-access.md` (EN+RU). Client-decision questions ready to send: `docs/client-questions/` (7 items, EN+RU). Both landed in PR #57.
- Farrow & Ball product imagery wired from S3 (bucket `bmdecor-images`, eu-west-1, public-read for `brands/*`). PR #70 open; DynamoDB prod already updated via `scripts/migrate-fb-imagery-from-s3.sh`.
- 12 BM API feature opportunities opened as issues #58–#69 (LRV badge, harmony rail, colour family browser, exterior badge, BM description copy, ProductTypesAvailable pre-filter, TDS downloads, retina images, live palette browser, weekly API refresh job, native sample SKUs, eStoreAvailable filter). All on the client board.
- AWS resource audit in-progress (see `docs/aws-audit-2026-04-18.md` if landed, otherwise resume from `project_session_resume_2026-04-18.md` memory).

### Prioritised tickets for Monday (in order of visibility impact)

| # | Ticket | Why it's in scope for Monday |
|---|--------|-------------------------------|
| 1 | **#15** Colour-page redesign (3-level selector, big preview, per-colour imagery) | High visual impact, explicit client ask. |
| 2 | **#27** BM collection fixes (order, descriptions, scroll-on-click, dense layout) | Explicit client request; affects every BM browsing path. Blocked on Q1. |
| 3 | **#17** Filter products by category (interior/exterior/furniture/primer) | Client ask from the brief. |
| 4 | **#20** Buy Sample button on colour pages | Explicit ask; ties into #22 (Merchant Center). Blocked on Q7. |
| 5 | **#16** Brand nav restructure (Colours + Products) | Blocked on Q2. |
| 6 | **#19** F&B product imagery from S3 — **PR #70 open** | F&B part ready to merge. |
| 7 | **#55** Playwright E2E suite — **PR #55 open** | CI safety net. |
| 8 | **#57** Client visibility docs — **PR #57 open** | Progress board + 7 decision questions for the client (EN+RU). |

### Epic / not expected by Monday
- **#11** Orac Décor brand house
- **#12** Wallpaper catalog
- **#13** Multi-language EN/ES
- **#22** Admin-managed brands
- **#24** Inspirations & Advices blog + brand news
- **#9** Clean CI-style deploys

These are multi-week efforts. Mention them in the client review as tracked, not as in-flight.

### Blocking decisions before building
Listed in section 15. Resolve with the client before implementing — guessing costs rework.

---

## 2. Business Identity & Constraints

- **Entity:** BM Decoración (bmdecor.es). Standalone e-commerce venture.
- **Owner:** Jason's friend (the "client"); Jason builds it as a **side project** (day job elsewhere, Slack not in scope for this project).
- **Market:** Premium design clientele on the Costa del Sol / Marbella. Luxury expectations, design-driven rather than price-driven.
- **Physical hub:** **Calle Dublín 21, Marbella, Spain**. Supports Click & Collect plus home delivery across Marbella / Costa del Sol.
- **Tax:** **21% Spanish IVA (IVA incluido)** — all displayed prices include VAT.
- **Independence:** Completely separate from benjaminmoore.com.es. Do not share assets, deployments, or branding with that entity.
- **Languages:** EN + ES (multilingual is in scope per the client site map — not yet implemented; epic #13).
- **Currency:** EUR across all product data (`priceEur` field).

---

## 3. The Brand Houses

The site serves multiple brand houses. Each gets a distinct immersive experience. Three are live; one is planned; one is under investigation.

### 3.1 Benjamin Moore (`BM`, `benjamin-moore`)
- **Position:** professional-grade American paint technology.
- **Data source:** **Production API** (`api.benjaminmoore.com`). Credentials in env vars (also works on Vercel).
- **Catalog:** ~4,067 colours, 13+ product lines (Aura, Regal Select, Advance, Aura Bath/Spa, Element Guard, SCUFFX, Fresh Start, Ultra Spec, Ben, Pro Primer, etc.).
- **Collections (client's preferred ordering):** Off-White → Preview → Classics → Historical → Designer Classic → Affinity → Color Stories → Williamsburg → All Colours → current year's Color Trend. See §15 #1 for the 8-vs-11 contradiction.
- **Imagery:**
  - Live: BM's official CDN (pulled by `/api/admin/seed/assets`).
  - Staged locally at `assets/brands/benjamin-moore/cans/` (33 PNGs; filename encodes product × finish × container size — e.g. `N524_AURAInterior_Eggshell_1Gal_US.png`).

### 3.2 Farrow & Ball (`FB`, `farrow-ball`)
- **Position:** British heritage / artisan.
- **Data source:** **manual CSV/Excel exports** from the F&B Trade Portal. No API.
- **Catalog:** ~630 colours + paint finishes + 52 wallpaper patterns.
- **Collections:** New Colours, Carte Blanche, Archive Collection, All Paint Colours.
- **Finishes available:** Estate Emulsion, Modern Emulsion, Dead Flat, Flat Eggshell, Modern Eggshell, Full Gloss, Exterior Masonry, Exterior Eggshell, Casein Distemper, Soft Distemper, Limewash, Wall Primer & Undercoat, Wood Primer & Undercoat, Metal Primer & Undercoat.
- **Wallpapers:** Geometric, Striped, Metallic, Floral, Damask, Scenic. Specific patterns in the client's zip (Achard, Aranami, Bamboo, Broad Stripe, Enigma, Peony, Renaissance Leaves, Tessella, Wisteria, etc. — 52 total).
- **Imagery:** staged at `assets/brands/farrow-ball/cans/<finish-slug>/` and `assets/brands/farrow-ball/wallpaper/<pattern-slug>/` (354 files, 2.4 GB). Two client typos were corrected on ingestion (`Distamper` → `distemper`, `Mesonry` → `masonry`).
- **Wallpaper feature:** not yet modelled in the codebase; epic #12.

### 3.3 Little Greene (`LG`, `little-greene`)
- **Position:** British heritage / eco-conscious.
- **Data source:** **agentic scraping** — no API. Scrapers evolve with the brand's website.
- **Catalog:** ~659 colours + wallpaper patterns + paint finishes.
- **Collections:** Colours of England, Colour Scales, Stone, Grey, All Paint Colours.
- **Finishes:** Absolute Matt Emulsion, Intelligent Matt/Eggshell/Satin/Floor/Gloss, Distemper, Limewash, Intelligent Masonry, Intelligent Exterior Eggshell, Intelligent ASP, Wall Primer Sealer.
- **Wallpaper lines:** National Trust Papers, Storybook Papers, 20th Century Papers, Révolution Papers, Archive Trails, London Wallpapers, Archive Wallpapers.
- **Imagery:** not in the client zip. Comes from the web scrape pipeline; staging folder exists (`assets/brands/little-greene/`) but empty.
- **Wallpaper feature:** part of epic #12.

### 3.4 Orac Décor (`orac`, `orac-decor`) — PLANNED, epic #11
- **Status:** not yet in the codebase.
- **Position:** European wall decoration — mouldings, cornices, 3D panels, indirect lighting, decorative elements. Product category is structurally distinct from paint/wallpaper (no colours, no gloss levels).
- **Catalog structure (Spanish-native):** Zócalos, Cornisas, Molduras, Revestimiento de pared 3D, Luz indirecta, Elementos Decorativos, Adhesivos y herramientas.
- **Data source:** TBD (manufacturer API, manual CSV, or scrape).
- **Imagery:** empty staging folder at `assets/brands/orac-decor/`.

### 3.5 Noel & Marquet (`nm`, `noel-marquet`) — STATUS UNCLEAR, investigation #30
- The client's zip included a `Noel&Marquet/` folder with 2 PNG images and no other context.
- NMC Group (parent) is related to Orac manufacturing — so this might be an Orac supplier under a different brand name, a separate brand, or reference material only.
- Staging folder: `assets/brands/noel-marquet/` (2 files).

---

## 4. Architecture

### 4.1 Navigation model — the UX core
```
Grand Lobby  →  Brand House  →  Colours | Products  →  Collection / Category  →  Color / Product detail
```
Every brand entered from the Grand Lobby splits into two top-level sections: **Colours** (browse by palette / collection) and **Products** (browse by paint category / finish). This split is mandatory per the client brief. Current implementation partially conflates them — restructure tracked in #15.

### 4.2 Frontend
- **Framework:** Next.js 16 (App Router) + TypeScript.
- **Styling:** Tailwind CSS.
- **UI kit:** Shadcn UI (installed via `shadcn@latest mcp`).
- **Motion:** Framer Motion. Subtle only — animations under ~600ms, staggered where meaningful, never ornamental.
- **Aesthetic:** luxury minimalist. Whitespace is a feature, not a bug.
- **Hosting:** Vercel, project `jherren80-9618s-projects/frontend` (team `team_2GkunwSiqE4HaUzcirBvJgo7`, project ID `prj_9y2XUx4owjXQ7wCZ47jtJ1bu0K6F`).
- **Production URL:** https://frontend-five-beige-41.vercel.app.
- **Directory:** `bmdecor-boutique/frontend/`.

### 4.3 Backend (serverless + Lambdas)
- Mostly serverless routes on Vercel (Node runtime unless Edge is explicitly useful).
- Standalone Lambdas live at `bmdecor-boutique/backend/functions/` (e.g. Cognito post-confirmation trigger).

### 4.4 Data layer
- **DynamoDB** single-table design, region **eu-west-1**, account `450284264313`, table `BmDecorProducts`.
- **Primary key:** `PK = PRODUCT#<type>#<id>` / `SK = METADATA`.
- **GSIs:** `GSI-Brand` (lookup by brand), `GSI-EntityType` (cross-brand listings across entity types).
- **Entity types:** `PRODUCT` today; may need extension or a second entity for Orac-style décor.
- **Chunked migrations** (batch size 500, `hasMore` continuation) are required to respect Vercel's 10-second serverless limit. Established pattern on `/api/admin/migrate/brands` — reuse it.

### 4.5 Asset storage
- **S3** in eu-west-1 for brand imagery (colour swatches, interior photos, paint can imagery). Today:
  - BM uses its own CDN URLs (no S3 overlay).
  - F&B + NM assets staged locally at `/home/jason/bmdecor-project/assets/brands/` pending S3 upload (#31, blocked on bmdecor profile activation).
- **Long term:** every image URL stored in DynamoDB points to S3 or CloudFront. Local staging is temporary.
- **Secrets Manager** for API keys:
  - `BmDecor/BenjaminMoore` — BM production API credentials.
  - Stripe restricted key.
  - Any brand API key added later.

### 4.6 Payments
- **Stripe** with restricted key (scope limited to payment + invoice operations).
- **Tax:** 21% IVA baked into displayed prices.
- **Logistics:** shipping zones for Marbella / greater Costa del Sol + Click & Collect at the physical store.
- **Sample SKUs** planned (see #19 + #21) to drive Google Merchant Center feeds.
- **Stripe MCP** currently awaits OAuth (`! Needs authentication` in `claude mcp list`); unblocked via #8.

### 4.7 Auth
- **AWS Cognito** (User Pool `eu-west-1_JxtlXtf30`).
- **Groups:** Admin, Employee, Customer.
- **Browser session:** JWT in `bmdecor_id_token` cookie.
- **Admin scripts:** `X-Admin-Key` header; key stored in `ADMIN_API_KEY` env var. Bypasses Cognito for automated migrations.
- **Post-confirmation Lambda** auto-assigns new users to the Customer group.
- **Middleware:** `/admin` requires the Admin group, `/my-studio` requires any authenticated user, `/api/admin` routes handle their own auth (middleware explicitly bypasses them).

### 4.8 Infrastructure as Code
- **AWS CDK** for all cloud resources. Stacks in `bmdecor-boutique/infrastructure/`.
- All resources in **eu-west-1**. All deploys via the `bmdecor` profile (see §12). Never the default profile.

---

## 5. Portals

### 5.1 Customer-facing storefront

Pages per the client's site map (`docs/client-brief/text/Первый вариант SiteMapBMDecor.txt`):

**Shell**
- Grand Lobby (home) with brand tiles, new arrivals, shop-by-category (Color Tools / Color Samples / Tools / Color APP), "Level up your desk" (colour inspirations).
- Top nav: Paint Colors | Paint Finishes | Wallpaper | Wall Décor | Tools | Inspirations & Advices | About us | Search | Basket.
- Footer: Products / Company / Account / Connect / Newsletter sub-sections.

**Brand House**
- Brand tile click → Options displayed (Option 2 recommended): a brand landing page with Colours + Products. See §15 #2.

**Colours**
- Collection index per brand (e.g. `/shop/<brand>/colours`).
- Collection detail with description + dense colour grid (`/shop/<brand>/colours/<collection>`).
- Colour detail page (`/colors/<brand>/<code>-<slug>`) — **SEO-indexable**, Merchant-Center-compatible, with:
  - Large colour preview (significant portion of screen).
  - Per-colour image / photo (from client's URL list, not yet wired).
  - **3-level product selector:** gloss → product → container size. Inactive combinations appear greyed out, not hidden.
  - PaintCalculator below the selector.
  - Prominent "Buy Sample" button.
  - Deep-link parameters (e.g. `?color=HC-1`) for colour persistence when navigating to a product page.

**Products**
- Brand products index with **category filter:** interior / exterior / furniture / primer (#16).
- Product line page (or per-product page — either shape is fine per the client).
- Product detail page with:
  - Larger imagery (#17), with the image itself clickable.
  - Colour selector (via `ColorPickerModal`).
  - Container size selector.
  - PaintCalculator (default m², expandable detailed — #28).

**Wallpaper (planned, #12)** — catalog pages per brand × pattern family, pattern detail pages with hero imagery + purchase options.

**Wall Décor / Orac (planned, #11)** — structurally different; category landing pages for Zócalos / Cornisas / Molduras / etc.

**Tools (planned, #13)** — rollers, brushes, buckets, accessories. Non-brand catalog.

**Inspirations & Advices (planned, #24)** — two sub-sections (inspirations, advices), plus per-brand news threads.

**Commerce flow**
- Cart ("Boutique Bag").
- Single-step checkout with order summary.
- Order detail page (`/my-studio/orders/<id>` or public-token version for unregistered tracking).
- Order history.

**Legal / ops (planned, #25)**
- About us, Terms & Conditions, Privacy Policy, Shipping and Returns Policy, Cookie Policy.
- Store locator (single location: Calle Dublín 21 + Google Maps embed + Click & Collect instructions).
- Newsletter signup.

### 5.2 Admin Command Center (`/admin`)
- Cognito Admin group only.
- **Inventory:** full CRUD on `BmDecorProducts` (edit prices, toggle availability).
- **Pricing:** global multipliers and product-line overrides.
- **Orders:** fulfilment dashboard.
- **Migrations:** chunked admin API (`/api/admin/migrate/brands`, `/api/admin/migrate/color-families`, etc.).
- **Export engine:** XLSX + CSV master catalog, PDF "Project Palettes" (admin-to-client and customer-self use).
- **Future (#22):** admin-managed brands — add a new brand from the UI without a code deploy.

### 5.3 Customer Design Studio (`/my-studio`)
- Any authenticated Cognito user.
- **Order History:** past Boutique Bag purchases.
- **Saved Projects:** personal palettes saved from colour pages; built on the Universal Visualizer when that ships.
- **Address Book:** Marbella / Costa del Sol delivery defaults.
- Dormant today; the merge-cart-on-sign-in flow is wired.

---

## 6. Ingestion Pipelines

Live in `bmdecor-boutique/ingestion/`. Each brand's pipeline normalises to the unified `PRODUCT` schema before writing to DynamoDB.

### 6.1 Benjamin Moore — API-driven
- Hits `api.benjaminmoore.com` for colours, palettes, products, and CDN image URLs.
- `/api/admin/seed/products` seeds master products; `/api/admin/seed/assets` populates image URLs by mapping product numbers (N524, N549, etc.) to the BM CDN.
- Env: production API key loaded from Secrets Manager (`BmDecor/BenjaminMoore`), fallbacks via env vars to work on Vercel.
- Healthy at ~4,067 colours and 13+ product lines in DynamoDB.

### 6.2 Farrow & Ball — manual export
- `ingestion/farrow-ball-sync.ts` (on `wip/feb-2026-session`, pending #3).
- Parses CSV / XLSX exports from the F&B Trade Portal.
- Raw drops land in `ingestion/data/farrow-ball/` (gitignored — sometimes >1 GB).
- Wallpaper parsing not yet wired.

### 6.3 Little Greene — agentic scraping
- `ingestion/little-greene-scraper.ts` (colour catalog).
- `ingestion/little-greene-wallpaper.ts` + `parse-lg-wallpaper.py` (wallpapers, on WIP branch, pending #3).
- Scrapers break when the LG site changes; treat flakiness as expected and keep them maintainable.
- Raw drops land in `ingestion/data/little-greene/` (gitignored — 1.4 GB+ web packs).

### 6.4 Orac Décor + Noel & Marquet — TBD
- Neither has a pipeline yet. Decide per #11 and #30 before building.

---

## 7. Data Normalisation — Unified `PRODUCT` Schema

Every ingested product must produce:

| Field            | Type     | Notes                                                                 |
|------------------|----------|------------------------------------------------------------------------|
| `brand`          | enum     | `BM` / `FB` / `LG` (+ future: `ORAC`, `NM`)                            |
| `brandId`        | string   | slug form (`benjamin-moore`, `farrow-ball`, etc.)                      |
| `productType`    | enum     | `color` / `base_paint` / `wallpaper` / `moulding` / `accessory` / `sample` |
| `colorCode`      | string   | brand-native code (e.g. `HC-1`, `No.301`)                              |
| `hexCode`        | string   | `#RRGGBB`                                                              |
| `name`           | string   | human-readable                                                         |
| `finishType`     | string   | `matte`, `eggshell`, `satin`, `gloss`, `flat`, `distemper`, etc.       |
| `priceEur`       | float    | includes 21% IVA                                                       |
| `volume`         | string   | `750ml`, `2.5L`, `5L`, etc. (wallpaper: roll dimensions)               |
| `coverageRate`   | float    | m² per litre — fuels PaintCalculator                                   |
| `imageUrl`       | string   | S3 / CloudFront URL (today may be BM CDN or placeholder)               |
| `collection`     | string   | brand collection name (e.g. `Classics`, `Historical`, `Colours of England`) |
| `paintCategory`  | enum     | `interior` / `exterior` / `furniture` / `primer` / `special` (pending #16)                |
| `entityType`     | const    | `PRODUCT`                                                              |

Wallpaper extras: `patternName`, `roll_dimensions`, `repeat`, `pasteType`, `category` (geometric / striped / etc.).

Orac extras: `oracCategory` (Zócalo / Cornisa / Moldura / 3D / etc.), `dimensions`, `material`.

---

## 8. Source-of-Truth Model (transitional)

**Today:** **Vercel production is a pragmatic, temporary source of truth** — specifically the deployment the client last saw and approved (`dpl_4PmRhhwa832qgmT17x2jFXkRWp75`). Vercel is NOT authoritative as a platform; it's authoritative *for this one approved artifact*.

**Why Vercel and not git?** Every recent deploy has `gitDirty: "1"` — the bundle contains files that weren't in any git commit. `git show main HEAD` ≠ what the client saw. Until the delta is captured into `main`, git cannot honestly claim to be the source of truth.

**Goal:** GitHub `BMDecores/bmdecor-boutique` `main` branch as the canonical source of truth. Path:
1. Reconcile deploy ↔ git (**#2**).
2. Land the WIP content that was bundled into the approved deploy (#4 + parts of #5, #6).
3. Adopt clean CI-style deploys (#9) so every future deploy has `gitDirty: "0"`.
4. Retire local `vercel` CLI deploys from dirty trees.

**Answering "what's in production?"** — use the Vercel MCP (`get_deployment`, `get_deployment_build_logs`), never assume from `git`. Call this out explicitly when giving answers to the user.

**Answering "what's in the repo?"** — `git show`, `gh api`, or the GitHub MCP.

**WIP branch `wip/feb-2026-session`** preserves 4 commits of uncommitted work from around the last approved deploy:
- `b8061ba` — Thread A: ingestion (F&B CSV sync + LG wallpaper parser) — likely NOT in the Vercel bundle (`ingestion/` is server-side tooling, likely `.vercelignore`d).
- `e42c5d3` — Thread B: ProductDetailClient + PaintCalculator — **likely in the bundle** (mtimes predate the last deploy).
- `9025e34` — Thread C: nav / search / colour picker polish — **NOT in the bundle** (mtimes postdate the last deploy).
- `9e84cd1` — Thread D: config leftovers (`.vercelignore`, color-families migration scaffold, etc.) — mixed.

---

## 9. Current state snapshot (as of 2026-04-17)

### Branches (active)
| Branch                              | Notes                                                           |
|-------------------------------------|------------------------------------------------------------------|
| `main`                              | Eventual source of truth. Updated regularly via PRs.            |
| `feat/aws-migration-opennext`       | OpenNext migration epic (#44) — deploying frontend to AWS eu-west-1. |
| `feat/19-product-imagery-from-s3`   | F&B imagery from S3 — PR #70 open, closes part of #19.          |
| `feat/playwright-e2e-suite`         | 17 E2E tests — PR #55 open.                                      |
| `docs/client-visibility-questions`  | Progress board guide + 7 client decisions (EN+RU) — PR #57.     |
| `wip/feb-2026-session`              | Preservation snapshot from pre-reconciliation. Do not ship.     |

### Open PRs (authoritative: `gh pr list --state open`)
- **#55** Playwright E2E suite — awaiting review/merge.
- **#57** Client visibility docs (progress board + 7 decision questions, EN+RU).
- **#70** F&B product imagery from S3 — DynamoDB already updated in prod; merge needed for frontend config.

### Open issues (authoritative: `https://github.com/orgs/BMDecores/projects/1`)

Do not maintain an issue list here — the GitHub Project board is the live source of truth (public, no login, updated automatically). 66 items as of 2026-04-18. Sharable entry point for the client: `docs/client-progress-access.md`.

Quick high-priority pointers as of 2026-04-18 (change daily — check the board for the current view):
- Monday-review priority: #15 (colour-page redesign), #16 (brand nav), #17 (category filter), #20 (Buy Sample), #27 (BM collections).
- Recently opened: #58–#69 (12 BM API feature opportunities — LRV, harmony rail, colour family, etc.). All on the board.
- Blocked on client decisions: #28 → Q1, #16 → Q2, #30 → Q3, #27 → Q5, #29 → Q6, #20 + #22 → Q7 (see `docs/client-questions/`).
- Infra tracks: #44 (AWS OpenNext migration — epic), #50 (AWS hardening), #52 (CI/Vercel gate), #56 (branded /progress page).

### Labels (issue taxonomy)
- **Type:** `type:bug`, `type:feature`, `type:chore`, `type:investigation`
- **Scope:** `scope:ingestion`, `scope:shop`, `scope:admin`, `scope:infra`, `scope:auth`, `scope:payments`, `scope:content`, `scope:i18n`, `scope:marketing`
- **Brand:** `brand:bm`, `brand:fb`, `brand:lg`, `brand:orac`, `brand:nm`
- **Priority:** `priority:high`, `priority:med`, `priority:low`
- **Status:** `status:blocked`, `status:needs-review`
- **Other:** `epic`, `needs-clarification`

---

## 10. Specialist Claude Agents

Defined in `.claude/agents/*.md` (ship with PR #10). Each agent is pre-briefed with project context so invoking it doesn't require re-explaining the setup.

| Agent                         | Invoke when…                                                                                       |
|-------------------------------|-----------------------------------------------------------------------------------------------------|
| `boutique-reviewer`           | Reviewing frontend changes for luxury / minimalist aesthetic, per-brand heritage, shadcn + Framer Motion polish, responsive behaviour. |
| `ingestion-specialist`        | Working on the BM API, F&B CSV/XLSX, or LG scraping pipelines. Knows the unified `PRODUCT` schema. |
| `aws-cdk-reviewer`            | Reviewing CDK stacks, DynamoDB design, S3 / Cognito / Secrets Manager. Enforces bmdecor-profile gating. |
| `deploy-hygienist`            | Running before any production deploy. Checks clean tree, main-sync, commit match. Drives clean-CI migration. |
| `source-of-truth-reconciler`  | Driving the Vercel-to-git reconciliation. Owns #2 end-to-end. |

Usage rule: prefer parallel agent calls for independent tasks. Don't duplicate an agent's work in the main thread.

---

## 11. MCP Tools

Ten MCPs connected at session start. Always prefer an MCP over a hand-rolled shell command for its domain.

| MCP                            | Use it for                                                                 |
|--------------------------------|-----------------------------------------------------------------------------|
| `aws-dynamodb` (AWS Labs)      | Data modelling, cost / performance checks, schema validation.               |
| `aws-cdk` (AWS Labs)           | CDK construct lookups, CDK Nag, Solutions Library patterns.                 |
| `playwright`                   | Browser automation — frontend smoke tests, driving the LG scraper.          |
| `chrome-devtools`              | Live browser inspection — DOM, network, Lighthouse, console errors.         |
| `context7`                     | Current docs for Next.js 16, React, Shadcn, Tailwind, Framer Motion, etc. Don't rely on training-cutoff memory. |
| `github`                       | Issues, PRs, commits, files, branches. **Caveat:** token scope can't open PRs — use `gh` CLI for PR create/comment. |
| `claude_ai_Vercel`             | Deployment metadata, build logs, runtime logs, inspector.                   |
| `claude_ai_ClickUp`            | External task reference (user's day-job tracker — not primary for bmdecor). |
| `grafana`                      | Reads only (write/oncall/incident/sift/pyroscope disabled). Not yet instrumented for bmdecor. |
| `shadcn`                       | Component registry lookups.                                                 |
| `claude_ai_Stripe`             | Awaits OAuth (#8). Useful for payment inspection once auth'd.               |

No AWS MCP covers **S3** (Labs only ships an S3 Tables MCP for analytics) or **Secrets Manager** — use `aws --profile bmdecor` CLI for those and announce CLI usage explicitly.

---

## 12. AWS Safety Gate (non-negotiable)

**The `bmdecor` AWS profile is commented out in `~/.aws/config` by design.** The default profile belongs to a different AWS account (not bmdecor's `450284264313`). Running `aws` without `--profile bmdecor` risks mutating the wrong account — silently.

### The gate
1. **NEVER use `AWS_PROFILE=default` for this project.** No fallbacks, no "just for reads," no "one-off testing." Not once.
2. **Always specify `--profile bmdecor`** on `aws` CLI commands.
3. **`bmdecor` uses SSO, not static keys.** Activation has two steps:
   - Uncomment `[profile bmdecor]` + `[sso-session bmdecor-sso]` in `~/.aws/config`.
   - Run `aws sso login --profile bmdecor`.
   - Tokens expire in ~8–12 hours — recurring logins are expected.
4. **If `bmdecor` is commented out when AWS work is needed, stop and ask the user to activate it.** Don't improvise.
5. **Verify account ID `450284264313`** before any state-changing action.
6. **Region `eu-west-1` (Ireland)** — all resources live here. Flag any construct that pins elsewhere.

### AWS-backed MCPs
Configured with `AWS_PROFILE=bmdecor`:
- `aws-dynamodb` — inert when bmdecor isn't activated; that's desirable.
- `aws-cdk` — advisory/docs usage, fine even without active SSO.

---

## 13. Development Workflow

### Tracking
- **All meaningful work gets a GitHub issue** in `BMDecores/bmdecor-boutique`. Templates in `.github/ISSUE_TEMPLATE/` (bug / feature / chore / investigation). Reference issues in commits and PRs (`Closes #N`).
- Use `gh issue list` / the GitHub MCP at session start to see what's open.
- Granularity: one issue per meaningful unit of work. Not one per trivial question, but err toward creating one if the thread might span a session.

### Branching
- `main` is the default and eventual source of truth.
- Branch naming: `<type>/<short-description>` (e.g. `feat/color-page-redesign`, `chore/add-dependabot`).
- `wip/...` branches for preservation snapshots, not for shipping.
- Merge via PR. Don't push directly to main unless the change is doc-only and explicitly user-approved.

### PRs
- Template: `.github/pull_request_template.md` (summary / linked issues / test plan / deploy notes / screenshots).
- **Test plan honesty:** always list what was actually verified and what was skipped and why. Never claim "tested" if you didn't click through the feature in a real browser (use Playwright + Chrome DevTools MCPs).

### Commits
- Conventional prefixes: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `wip(<scope>)`.
- Co-authored-by trailer for Claude collaborations when committing from a Claude session.

### Dependabot
- Weekly grouped npm updates for `/frontend` (next/react / tailwind-ui / types / dev-deps as separate PRs).
- Monthly GitHub-Actions updates.
- Green PRs: review and merge the same day.

### Deploys
- **Today:** local `vercel` CLI from (possibly-unclean) working tree. Gate with `deploy-hygienist` agent to avoid regressing the approved state.
- **Goal (#9):** GitHub Actions deploys on `main` merge. CI runs type-check + build + lint on every PR.

### Conventions on content
- **Fix typos on ingestion** — don't preserve client misspellings as "provenance." E.g. `Casein Distamper` → `casein-distemper`, `Exterior Mesonry` → `exterior-masonry`. The archive (`Jason.zip` was deleted after extraction, but content is reconstructable from DynamoDB) retains originals if anyone needs to audit.
- **Use client-provided strings verbatim** for brand-specific or proper-noun content (colour names, brand lines, collection names) — the rule is about typos, not about second-guessing vocabulary.

---

## 14. Communication Style

- **Plain language, not jargon.** Swap "CodeQL" for "automatic security scanning"; "gitDirty flag" for "deploy included work that wasn't committed." User is not deeply technical on CI / git / AWS internals.
- **Decide and execute.** When the user says "do what you think is best," treat it as broad authorisation — present outcomes and pending items, not option menus, unless the choice is irreversible.
- **Short reports, not plans.** After finishing a batch: "I did X. See Y. What's pending on my vs. your side." Nothing more unless asked.
- **Autonomy granted.** User-level `~/.claude/settings.json` has an allowlist for common ops (git, gh CLI, file management, unzip, python, npx, uvx, AWS `--profile bmdecor`, all project MCPs) and a denylist (`sudo:*`, `rm -rf:*`). Don't ask for routine operations.
- **Announce CLI fallback.** If an operation needs `aws` or `vercel` CLI instead of a matching MCP, say so. The user asked explicitly to be told.

---

## 15. Open Questions / Contradictions (resolve before building)

Before implementing any of the below, send the client one message to decide.

1. **BM collection count — 8 or 11?**
   - `Пожелания.txt` says 8: Off-White, Preview, Classics, Historical, Designer Classic, Affinity, Color Stories, Williamsburg + All Colours + current year trend.
   - `SiteMap.txt` lists 11: those 8 + America's Colors + Color Trends 2024 + Color Trends 2025 + All Colors.
   - **Recommended default:** 8 + "All Colours" + a single dynamic current-trend collection. Tracked in #27.

2. **Brand tile click behaviour — dropdown or dedicated page?**
   - Option 1: dropdown appears below the tile with Products + Colours (if either is missing, tile routes directly to the other).
   - Option 2: click the tile → dedicated brand page with the two options side-by-side.
   - Client says "whichever is easier." **Recommended:** Option 2 — better mobile UX and stronger brand-page SEO. Tracked in #15.

3. **Noel & Marquet** — new brand, Orac supplier, or reference-only? Tracked in #30. Pending a question to the client.

4. **"Color APP"** — appears in the site map's Shop-by-category section with no definition. Ask the client what this is before building.

5. **"2811 Curated Colors" counter** — inaccurate per the client; unclear if meant to be auto-computed or a manual field. Tracked in #26.

6. **PaintCalculator shape** — simple-only vs simple-with-expandable-detailed. Client has "no strong preference." **Recommended:** simple by default (m² input), with an expandable "Detailed" section for walls/doors/windows/coats. Tracked in #28.

7. **Sample SKUs** — one "Colour Sample" SKU per brand, or per brand × finish? Needed before building #19 / #21. Ask the client; depends on their supplier pricing for small-format samples.

---

## 16. File locations (key)

### Inside the repo — `bmdecor-boutique/`

**Frontend**
- `frontend/src/app/shop/product/[slug]/page.tsx` — product detail route handler.
- `frontend/src/app/shop/product/[slug]/ProductDetailClient.tsx` — client component (on WIP, pending #4).
- `frontend/src/app/shop/product/[slug]/PaintCalculator.tsx` — calculator (on WIP, pending #4).
- `frontend/src/app/shop/product/[slug]/ProductConfigurator.tsx` — size / colour / finish picker.
- `frontend/src/components/shop/ColorPickerModal.tsx` — live colour picker (fetches `/api/colors?brand=XX`).
- `frontend/src/components/layout/nav/{ShopMenu,MobileMenu,StudioMenu}.tsx` — nav menus.
- `frontend/src/app/search/page.tsx` — search.
- `frontend/src/app/api/colors/route.ts` — DynamoDB colour API.
- `frontend/src/app/api/admin/migrate/brands/route.ts` — brand migration endpoint.
- `frontend/src/app/api/admin/migrate/color-families/route.ts` — WIP scaffold (pending #6).
- `frontend/src/app/api/admin/seed/assets/route.ts` — BM asset-seeding.
- `frontend/src/app/api/admin/seed/products/route.ts` — master products seeding.
- `frontend/src/lib/api/require-admin.ts` — admin auth helper.
- `frontend/src/middleware.ts` — route guards.
- `frontend/src/types/store.ts` — frontend store types.
- `frontend/ARCHITECTURE_AUDIT.md` — prior architectural notes (on WIP, to be folded in).

**Backend**
- `backend/functions/auth/post-confirmation/index.ts` — Cognito post-confirmation Lambda.

**Ingestion**
- `ingestion/farrow-ball-sync.ts` — F&B CSV/XLSX sync (WIP, pending #3).
- `ingestion/little-greene-scraper.ts` — LG colour scraper.
- `ingestion/little-greene-wallpaper.ts` / `parse-lg-wallpaper.py` — LG wallpaper parsers (WIP, pending #3).

**Shared**
- `shared/types.ts` — TypeScript types shared between frontend/backend/ingestion.

**Infrastructure**
- `infrastructure/` — AWS CDK stacks.

**Project-level config**
- `.github/ISSUE_TEMPLATE/`, `.github/pull_request_template.md`, `.github/dependabot.yml` — GitHub Pro setup (PR #10).
- `.claude/agents/*.md` — specialist Claude agents (PR #10).
- `.gitignore`, `.vercelignore` — standard exclusions; `ingestion/data/` must always be excluded.

### Outside the repo — workspace at `/home/jason/bmdecor-project/`

- `docs/client-brief/` — 5 client-delivered Word docs + text conversions in `text/*.txt`. Canonical source of requirements until superseded.
- `assets/brands/<brand>/...` — staged brand imagery (2.5 GB, 389 files). Moves to S3 per #31.
- `CLAUDE.md` — symlink to the repo's `bmdecor-boutique/CLAUDE.md` (this file). Single authored copy.
- `.claude/settings.local.json` — per-project Claude settings (unused over time; actual allowlist is in `~/.claude/settings.json`).

---

## 17. Absolute Constraints (never break)

| Rule                                                         | Why                                                                |
|---------------------------------------------------------------|---------------------------------------------------------------------|
| AWS profile = `bmdecor`, never default                        | Default belongs to a different account. §12.                        |
| Account ID `450284264313`                                     | Verify before any state-changing AWS action.                        |
| Region `eu-west-1`                                            | All infra lives here. No US/other.                                  |
| GitHub org `BMDecores`                                        | No personal-fork pushes.                                            |
| Attribution `jherren`                                         | User identity on all commits.                                       |
| Never commit `ingestion/data/`                                | Gigabytes of raw brand data.                                        |
| Fix typos on ingestion                                        | Don't propagate them downstream.                                    |
| No destructive git on `main` without approval                 | `main` reflects the approved reference (transitional).              |
| No `sudo:*` or `rm -rf:*`                                     | Explicit denylist in `~/.claude/settings.json`.                     |
| Announce CLI fallback when MCP doesn't cover an AWS operation | User asked to be told.                                              |
| IVA included in all displayed prices                          | Spanish consumer law + client expectation.                          |

---

## 18. Quick reference

**How is the colour page different from the product page?** The colour page (`/colors/<brand>/<code>-<slug>`) is SEO-indexed — Google should surface it for queries like "Benjamin Moore HC-1." It lets the shopper pick the paint line × gloss × size they want in that colour. The product page (`/shop/<brand>/product/<slug>`) is the paint-line buying surface — size + colour selection for a specific product. They link: selecting a product on a colour page navigates to the product page with that colour pre-selected (#20).

**How do I test a live change?** Use the `playwright` MCP to drive clicks in a real browser; use `chrome-devtools` to inspect DOM / network / performance. Production is `frontend-five-beige-41.vercel.app` — but remember that's the approved state; your new work isn't there until it's deployed.

**How do I look up a Next.js 16 or Shadcn API?** Use the `context7` MCP. Don't rely on training-cutoff memory — Next.js 16 and Shadcn iterate quickly.

**Where are the client's written requirements?** `docs/client-brief/text/*.txt` (Web / WebBM / updates / Пожелания / Первый вариант SiteMapBMDecor). Russian + English versions.

**Where are the client's raw brand images?** `assets/brands/<brand>/...`. Pending S3 upload per #31.

**How do I stop re-prompting for routine permission?** The allowlist in `~/.claude/settings.json` covers git, gh CLI, file management, unzip, python, uvx/npx, `aws --profile bmdecor`, and all project MCPs. `sudo:*` and `rm -rf:*` are denied.

**What's the address of the physical store?** Calle Dublín 21, Marbella, Spain. Click & Collect operates from there.

**What's the current deployed commit?** `42e3c43` on Vercel deployment `dpl_4PmRhhwa832qgmT17x2jFXkRWp75` (as of 2026-02-06). Remember the bundle has `gitDirty: "1"` so the deployed bytes ≠ `git show 42e3c43`.

---

*Every session starts with this file loaded. When something meaningful changes — a new brand decided, a ticket that delivers a deliverable, the AWS profile gate changed, the client approves a new layout — update this document in the same PR as the change.*
