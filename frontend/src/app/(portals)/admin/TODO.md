# Admin Portal - Taxonomy Refactor TODO

This document outlines the required updates to align the Admin Command Center with the new industry-standard paint taxonomy defined in `src/types/store.ts`.

## Overview

The frontend customer experience has been updated to use a **Department → Category → Product Line → Product** hierarchy. The admin portal forms and APIs need to be updated to match this structure.

## Required Updates

### 1. Product Add/Edit Forms (`products/new/page.tsx`, `products/[id]/page.tsx`)

**Current State:**
- Uses flat `productType` field (paint/wallpaper/accessory)
- No category selection (Interior/Exterior/Trim/Primer/Specialty)
- No product line association

**Required Changes:**
- [ ] Add **Department** dropdown: Paint | Wallpaper | Supplies | Samples
- [ ] Add **Category** dropdown (conditional on Paint): Interior | Exterior | Trim & Door | Primer | Specialty
- [ ] Add **Product Line** dropdown (e.g., Aura, Regal Select, Advance)
- [ ] Update finish type to use standardized `FinishSheen` types: Matte | Eggshell | Satin | Semi-Gloss | Gloss
- [ ] Add `isTintable` boolean field
- [ ] Add multi-select for `availableSizes`: Sample | Quart | Gallon | 5-Gallon

### 2. API Routes (`api/admin/products/route.ts`)

**Required Changes:**
- [ ] Update POST/PUT handlers to accept new taxonomy fields
- [ ] Add validation for department/category relationships
- [ ] Update DynamoDB schema to store new fields:
  - `department`
  - `category`
  - `productLine`
  - `isTintable`
  - `availableFinishes` (array)
  - `availableSizes` (array)

### 3. Products List View (`products/page.tsx`)

**Required Changes:**
- [ ] Add filter by Department
- [ ] Add filter by Category
- [ ] Update table columns to show category/product line
- [ ] Group or sort by product line for better organization

### 4. Colors Management (`colors/page.tsx`)

**Current State:**
- Colors are treated as products with hex codes

**Required Changes:**
- [ ] Separate Color as an attribute (tintable option), not a product
- [ ] Add `usage` field: Interior | Exterior | All
- [ ] Add `lrv` (Light Reflectance Value) field
- [ ] Add `undertone` field

### 5. Inventory Management (`inventory/page.tsx`)

**Required Changes:**
- [ ] Update inventory views to work with new product structure
- [ ] Show stock by product line, not just individual SKUs

### 6. Export Functionality (`exports/page.tsx`)

**Required Changes:**
- [ ] Update Excel export to include new taxonomy fields
- [ ] Add filters for department/category in export options

## Type Imports

All admin forms should import types from the new store types:

```typescript
import {
  Department,
  PaintCategory,
  FinishSheen,
  ContainerSize,
  Product,
  Color,
  DEPARTMENTS,
  PAINT_CATEGORIES,
  FINISH_SHEENS,
  CONTAINER_SIZES,
} from '@/types/store';
```

## Migration Strategy

1. **Phase 1**: Add new fields to DynamoDB schema (non-breaking)
2. **Phase 2**: Update admin forms to capture new fields
3. **Phase 3**: Backfill existing products with appropriate categories
4. **Phase 4**: Update frontend shop pages to query by category
5. **Phase 5**: Deprecate old flat product type field

## Priority Order

1. Product Add/Edit Forms (highest impact)
2. API Routes (required for forms)
3. Products List View (admin UX)
4. Colors Management (data model)
5. Inventory & Exports (lower priority)

---

*Generated: Phase 23 - Global Taxonomy & Data Architecture Refactor*
