# BM Decoración - Full System Architecture Audit

**Generated:** 2026-02-06
**Audit Mode:** Code-Only Analysis (No Assumptions)
**Codebase Location:** `/home/jason/bmdecor-project/bmdecor-boutique/frontend`

---

## A. Infrastructure & Deployment

### Hosting Platform
| Aspect | Value |
|--------|-------|
| Platform | **Vercel** |
| Project | `jherren80-9618s-projects/frontend` |
| Production URL | `https://frontend-five-beige-41.vercel.app` |
| Framework | Next.js 16.1.6 (App Router) |
| Runtime | Serverless Functions (Edge-compatible middleware) |

### Vercel Configuration (`vercel.json`)
```json
{
  "framework": "nextjs",
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```
- CORS enabled for all API routes
- No custom rewrites or redirects

### Environment Variables (Production)
| Variable | Purpose | Scope |
|----------|---------|-------|
| `BMDECOR_AWS_REGION` | AWS region (`eu-west-1`) | Server |
| `BMDECOR_AWS_ACCESS_KEY_ID` | IAM access key | Server |
| `BMDECOR_AWS_SECRET_ACCESS_KEY` | IAM secret | Server |
| `BMDECOR_DYNAMODB_TABLE` | DynamoDB table name | Server |
| `BMDECOR_S3_BUCKET` | S3 bucket for images | Server |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Cognito User Pool | Client |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Cognito App Client | Client |
| `ADMIN_API_KEY` | API key for admin scripts | Server |

### AWS Resources (Region: `eu-west-1`)
| Service | Resource | Purpose |
|---------|----------|---------|
| DynamoDB | Single table (name from env) | All data storage |
| S3 | Image bucket | Swatches, product images |
| Cognito | User Pool | Authentication |
| Secrets Manager | (Not actively used in code) | Reserved for future |

---

## B. Database Architecture (DynamoDB)

### Design Pattern
**Single-Table Design** - All entities stored in one DynamoDB table using composite primary keys.

### Primary Key Structure
| Attribute | Type | Description |
|-----------|------|-------------|
| `PK` | String | Partition Key (entity prefix + identifier) |
| `SK` | String | Sort Key (sub-entity or `METADATA`) |

### Entity Types & Key Patterns

#### 1. PRODUCT (Colors/Paints)
```
PK: PRODUCT#{brand}#{colorCode}
SK: METADATA
```
**Attributes:**
- `entityType`: `"PRODUCT"`
- `brand`: Short code (`BM`, `FB`, `LG`)
- `brandId`: Slug (`benjamin-moore`, `farrow-ball`, `little-greene`)
- `colorCode`: Brand-specific code (e.g., `HC-154`, `No.47`)
- `hexCode`: Hex color value
- `name`: Color name
- `collection`: Optional collection/family
- `updatedAt`: ISO timestamp

**Record Counts:**
- Benjamin Moore: 4,067 colors
- Farrow & Ball: 630 colors
- Little Greene: 659 colors
- **Total: 5,356 colors**

#### 2. PRODUCT (Master Products - Paint Cans)
```
PK: PRODUCT#CAN#{product-id}
SK: METADATA
```
**Attributes:**
- `entityType`: `"PRODUCT"`
- `productType`: `"base_paint"` or `"primer"`
- `id`, `name`, `brand`, `brandId`
- `productLine`: Reference to product line (e.g., `bm-aura`)
- `department`: `"Paint"`
- `category`: `Interior`, `Exterior`, `Trim & Door`, `Primer`
- `basePrice`: EUR price
- `availableFinishes`: Array (`Matte`, `Eggshell`, `Satin`, etc.)
- `availableSizes`: Array (`Sample`, `Quart`, `Gallon`, `5-Gallon`)
- `isTintable`: Boolean
- `coverageRateM2PerL`: Coverage rate
- `inStock`: Boolean

**Record Count:** 13 master products (5 BM, 5 FB, 3 LG)

#### 3. CART (Shopping Cart)
```
PK: CART#GUEST_{uuid} | CART#USER_{cognitoId}
SK: SESSION | ITEM#{productId}#{colorCode}#{finish}#{size}
```
**Session Attributes:** `createdAt`, `updatedAt`, `itemCount`, `subtotalEur`
**Item Attributes:** `productId`, `colorCode`, `finish`, `size`, `quantity`, `unitPrice`, `productName`, `colorName`, `colorHex`

#### 4. ORDER
```
PK: ORDER#{orderId}
SK: METADATA | ITEM#...
```

#### 5. USER (Extended Profile)
```
PK: USER#{cognitoSub}
SK: METADATA | ADDR#{addressId}
```

#### 6. ARTICLE (Blog/Content)
```
PK: ARTICLE#{articleId}
SK: METADATA
```

#### 7. FAQ
```
PK: FAQ#{faqId}
SK: METADATA
```

#### 8. BANNER
```
PK: BANNER#{bannerId}
SK: METADATA
```

#### 9. COUPON
```
PK: COUPON#{couponId}
SK: METADATA
```

#### 10. CONTACT (Form Submissions)
```
PK: CONTACT#{contactId}
SK: METADATA
```

#### 11. COLOR_FAMILY
```
PK: COLOR_FAMILY#{familyId}
SK: METADATA
```

#### 12. COLOR_PALETTE
```
PK: COLOR_PALETTE#{paletteId}
SK: METADATA
```

#### 13. PROJECT (My Studio)
```
PK: PROJECT#{projectId}
SK: METADATA | COLOR#{colorCode}
```

### Global Secondary Indexes
| GSI Name | PK | SK | Purpose |
|----------|----|----|---------|
| `GSI-Brand` | `brand` | `colorCode` | Query colors by brand |

---

## C. Data Provenance & Pipelines

### Data Sources by Brand

| Brand | Source | Method | Location |
|-------|--------|--------|----------|
| **Benjamin Moore** | Production API | REST Client | `ingestion/benjamin-moore-api.ts` |
| **Farrow & Ball** | Trade Portal CSV | Parser | `ingestion/farrow-ball-sync.ts` |
| **Little Greene** | Manual Entry | Hardcoded Array | `ingestion/little-greene-scraper.ts` |

### Source File Details

#### Benjamin Moore (`ingestion/benjamin-moore-api.ts`)
- **API Endpoint:** `api.benjaminmoore.com`
- **Authentication:** API key-based
- **Data Flow:** Live API → Transform → DynamoDB
- **Status:** Production-ready

#### Farrow & Ball (`ingestion/farrow-ball-sync.ts`)
- **Source File:** `ingestion/data/farrow-ball/Parxjkd4jFuLQgjlF8_h-A==.csv` (4.2MB)
- **Parser:** CSV with field mapping
- **Data Flow:** CSV Export → Parse → Transform → DynamoDB
- **Status:** Manual refresh required

#### Little Greene (`ingestion/little-greene-scraper.ts`)
- **Source File:** `ingestion/data/little-greene/Little Greene - MASTER PRODUCT LIST September 2025.xlsx` (12.3MB)
- **Current Implementation:** Hardcoded 204 colors with hex values
- **Status:** Static, needs Excel parser integration

### Master Product Data
- **Source:** Hardcoded in `src/app/api/admin/seed/products/route.ts`
- **Count:** 13 products (curated selection)
- **Seeding:** Admin API endpoint with `X-Admin-Key` authentication

---

## D. Backend Architecture (Next.js App Router)

### API Routes (57 Total)

#### Public APIs
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/colors` | GET | Fetch colors with brand filter, pagination |
| `/api/color-counts` | GET | Get color counts by brand |
| `/api/products` | GET | Fetch master products |
| `/api/search` | GET | Universal search |
| `/api/cart` | GET, POST | Cart operations |
| `/api/cart/[itemSk]` | DELETE, PATCH | Item operations |
| `/api/articles` | GET | List published articles |
| `/api/articles/[slug]` | GET | Single article |
| `/api/faqs` | GET | List FAQs |
| `/api/banners` | GET | Active banners |
| `/api/contact` | POST | Contact form submission |
| `/api/coupons/validate` | POST | Validate coupon code |

#### Auth APIs
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth/session` | GET | Check session status |
| `/api/auth/merge-cart` | POST | Merge guest cart on login |

#### My Studio APIs (Requires Auth)
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/my-studio/orders` | GET | User order history |
| `/api/my-studio/projects` | GET, POST | Project CRUD |
| `/api/my-studio/projects/[projectId]` | GET, PUT, DELETE | Single project |
| `/api/my-studio/projects/[projectId]/colors` | POST, DELETE | Project colors |
| `/api/my-studio/projects/[projectId]/pdf` | GET | Generate PDF |
| `/api/user/profile` | GET, PUT | User profile |

#### Benjamin Moore Integration APIs
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/bm/discover` | GET | Color discovery |
| `/api/bm/calculator` | POST | Paint calculator |
| `/api/bm/visualizer` | POST | Room visualizer |

#### Admin APIs (Requires Admin Auth)
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/admin/products` | GET, POST | Product CRUD |
| `/api/admin/products/[id]` | GET, PUT, DELETE | Single product |
| `/api/admin/orders` | GET | Order list |
| `/api/admin/orders/[orderId]` | GET, PUT | Single order |
| `/api/admin/users` | GET | User list |
| `/api/admin/users/[sub]` | GET, PUT | Single user |
| `/api/admin/articles` | GET, POST | Article CRUD |
| `/api/admin/articles/[articleId]` | GET, PUT, DELETE | Single article |
| `/api/admin/faqs` | GET, POST | FAQ CRUD |
| `/api/admin/faqs/[faqId]` | PUT, DELETE | Single FAQ |
| `/api/admin/banners` | GET, POST | Banner CRUD |
| `/api/admin/banners/[bannerId]` | PUT, DELETE | Single banner |
| `/api/admin/coupons` | GET, POST | Coupon CRUD |
| `/api/admin/coupons/[couponId]` | PUT, DELETE | Single coupon |
| `/api/admin/contacts` | GET | Contact submissions |
| `/api/admin/contacts/[contactId]` | PUT, DELETE | Single contact |
| `/api/admin/colors/families` | GET, POST | Color family CRUD |
| `/api/admin/colors/palettes` | GET, POST | Palette CRUD |
| `/api/admin/images` | GET | Image list |
| `/api/admin/images/upload-url` | POST | S3 presigned URL |
| `/api/admin/upload` | POST | Direct upload |
| `/api/admin/upload-url` | POST | Presigned URL |
| `/api/admin/export` | GET | Export to XLS |
| `/api/admin/settings` | GET, PUT | Store settings |
| `/api/admin/seed/products` | GET, POST | Seed master products |
| `/api/admin/migrate/brands` | GET, POST | Brand migration |

### Server Actions
| File | Actions | Purpose |
|------|---------|---------|
| `src/app/actions/getColors.ts` | `getColorsAction` | Server-side color fetch |

### Authentication System

#### Dual Authentication Methods
1. **Cognito JWT (Browser Sessions)**
   - Cookie: `bmdecor_id_token`
   - Verified via `cognito:groups` claim
   - Used for admin UI and customer portal

2. **API Key (Admin Scripts)**
   - Header: `X-Admin-Key`
   - Env var: `ADMIN_API_KEY`
   - Used for CLI migrations and seeding

#### Auth Helper (`src/lib/api/require-admin.ts`)
```typescript
export async function requireAdmin(request: NextRequest) {
  // Method 1: API key header
  const apiKey = request.headers.get('X-Admin-Key');
  if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
    return { sub: 'api-key-admin', groups: ['Admin'] };
  }

  // Method 2: Cognito JWT cookie
  const token = request.cookies.get('bmdecor_id_token')?.value;
  // ... verify and return user
}
```

### Middleware (`src/middleware.ts`)

**Responsibilities:**
1. **Cart Cookie Management:** Creates `bmdecor_cart_id` UUID if missing
2. **Admin Route Guard:** Redirects non-admins from `/admin/*` pages
3. **My Studio Guard:** Redirects unauthenticated from `/my-studio/*`
4. **API Bypass:** Allows `/api/admin/*` through (routes handle own auth)

**Matcher Pattern:**
```typescript
matcher: ['/((?!_next/static|_next/image|favicon.ico|rooms/).*)']
```

---

## E. Frontend Ecosystem

### Technology Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | Framework (App Router) |
| React | 19.2.3 | UI Library |
| TypeScript | ^5 | Type Safety |
| Tailwind CSS | ^4 | Styling |
| Framer Motion | ^12.29.3 | Animations |
| Radix UI | ^1.4.3 | Primitives |
| Lucide React | ^0.563.0 | Icons |

### Additional Libraries
| Library | Purpose |
|---------|---------|
| `@react-pdf/renderer` | PDF generation |
| `@tiptap/*` | Rich text editor |
| `amazon-cognito-identity-js` | Cognito client |
| `class-variance-authority` | Component variants |
| `cmdk` | Command palette |
| `fuse.js` | Fuzzy search |
| `next-themes` | Theme switching |
| `react-dropzone` | File uploads |
| `sonner` | Toast notifications |
| `ulid` | Unique IDs |
| `xlsx` | Excel export |

### Design System

#### Theme Colors (Marbella Luxury Palette)
```css
--color-marbella-cream: #FAF8F5;    /* Background */
--color-marbella-linen: #F5F1EB;    /* Secondary */
--color-marbella-sand: #E8E2D9;     /* Borders */
--color-marbella-charcoal: #2C2C2C; /* Text */
--color-marbella-gold: #C9A86C;     /* Accent */
```

#### Typography
- **Serif:** Playfair Display (headings)
- **Sans:** Geist Sans (body)
- **Mono:** Geist Mono (code)

### React Context Providers

#### 1. AuthContext (`src/lib/auth/auth-context.tsx`)
```typescript
interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signIn, signUp, confirmSignUp, signOut, refreshUser
}
```

#### 2. CartContext (`src/lib/cart/cart-context.tsx`)
```typescript
interface CartContextValue {
  items: CartItemResponse[];
  itemCount: number;
  subtotalEur: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  setDrawerOpen, addItem, removeItem, updateQuantity
}
```

### Key Components

#### ColorPickerModal (`src/components/shop/ColorPickerModal.tsx`)
- Visual fan deck for color selection
- Fetches from `/api/colors?brand=XX`
- Client-side color family filtering (heuristic-based)
- Pagination with "Load More"
- Search with 300ms debounce

#### MegaDrawer (`src/components/layout/nav/MegaDrawer.tsx`)
- Glassmorphism slide-down menu
- Framer Motion animations
- Backdrop click to close

#### ProductConfigurator (`src/app/shop/product/[slug]/ProductConfigurator.tsx`)
- Size/finish selector
- Color picker integration
- Add to cart functionality

### Type Definitions (`src/types/store.ts`)

**Core Types:**
- `Department`: `'Paint' | 'Wallpaper' | 'Supplies' | 'Samples'`
- `PaintCategory`: `'Interior' | 'Exterior' | 'Trim & Door' | 'Primer' | 'Specialty'`
- `FinishSheen`: `'Matte' | 'Eggshell' | 'Satin' | 'Semi-Gloss' | 'Gloss'`
- `ContainerSize`: `'Sample' | 'Quart' | 'Gallon' | '5-Gallon'`
- `Brand`: `'BM' | 'FB' | 'LG'`
- `BrandId`: `'benjamin-moore' | 'farrow-ball' | 'little-greene'`

**Interfaces:** `Product`, `Color`, `CartItem`, `PriceVariant`, `ProductLine`

---

## F. External Integrations

### AWS Services

| Service | SDK Package | Usage |
|---------|-------------|-------|
| DynamoDB | `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb` | All data storage |
| S3 | `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` | Image storage, presigned URLs |
| Cognito | `@aws-sdk/client-cognito-identity-provider`, `amazon-cognito-identity-js` | Authentication |
| Secrets Manager | `@aws-sdk/client-secrets-manager` | Reserved (not actively used) |
| Credential Providers | `@aws-sdk/credential-providers` | IAM credential handling |

### DynamoDB Client Configuration (`src/lib/aws/dynamo-client.ts`)
```typescript
const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.BMDECOR_AWS_REGION,
    credentials: {
      accessKeyId: process.env.BMDECOR_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.BMDECOR_AWS_SECRET_ACCESS_KEY!,
    },
  })
);
const TABLE_NAME = process.env.BMDECOR_DYNAMODB_TABLE!;
```

### Third-Party Services

| Service | Status | Purpose |
|---------|--------|---------|
| Benjamin Moore API | **Active** | Color data (4,067 colors) |
| Stripe | **Planned** | Payment processing |
| Farrow & Ball Trade Portal | **Manual** | CSV exports |

### Installed but Not Actively Used
| Package | Notes |
|---------|-------|
| `@aws-sdk/client-secrets-manager` | Reserved for future secret retrieval |
| Stripe SDK | Not in package.json (payment not implemented) |

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Total API Routes** | 57 |
| **Server Actions** | 1 |
| **Context Providers** | 2 |
| **Color Records** | 5,356 |
| **Master Products** | 13 |
| **Brand Houses** | 3 |
| **npm Dependencies** | 31 |
| **Dev Dependencies** | 7 |

---

## Critical Configuration Notes

1. **Vercel Timeouts:** Hobby plan has 10-second limit. Batch operations use chunking (500 items/request).

2. **Environment Variables:** Never use heredoc (`<<<`) with `vercel env add` - it adds trailing newlines that break auth.

3. **Middleware Bypass:** `/api/admin/*` routes bypass middleware auth checks - they use `requireAdmin()` internally.

4. **Cart Identification:** Uses `bmdecor_cart_id` cookie (guest) or Cognito `sub` (authenticated).

5. **Brand Code Mapping:**
   - `BM` ↔ `benjamin-moore`
   - `FB` ↔ `farrow-ball`
   - `LG` ↔ `little-greene`
