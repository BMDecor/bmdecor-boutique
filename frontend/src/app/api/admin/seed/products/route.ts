import { NextRequest, NextResponse } from 'next/server';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import type { FinishSheen, ContainerSize, BrandId } from '@/types/store';

/**
 * POST /api/admin/seed/products
 *
 * Seeds the Master Product records (Base Paint Cans) into DynamoDB.
 * These serve as the Shop's inventory anchors - the actual products you can buy.
 * Colors are separate records that get linked at checkout.
 *
 * Schema: PK: PRODUCT#CAN#[ID], SK: METADATA, entityType: PRODUCT, type: base_paint
 */

interface MasterProduct {
  id: string;
  name: string;
  brand: string;
  brandId: BrandId;
  productLine: string;
  department: string;
  category: string;
  type: 'base_paint' | 'primer';
  tags: string[];
  basePrice: number;
  availableFinishes: FinishSheen[];
  availableSizes: ContainerSize[];
  isTintable: boolean;
  description: string;
  imageUrl: string;
  coverageRateM2PerL: number;
}

// =============================================================================
// MASTER PRODUCTS - The Paint Cans (not colors)
// =============================================================================

const MASTER_PRODUCTS: MasterProduct[] = [
  // ---------------------------------------------------------------------------
  // BENJAMIN MOORE
  // ---------------------------------------------------------------------------
  {
    id: 'bm-aura-interior',
    name: 'Aura Interior Paint',
    brand: 'BM',
    brandId: 'benjamin-moore',
    productLine: 'bm-aura',
    department: 'Paint',
    category: 'Interior',
    type: 'base_paint',
    tags: ['interior', 'walls', 'premium', 'living-room', 'bedroom', 'zero-voc', 'color-lock'],
    basePrice: 79.95,
    availableFinishes: ['Matte', 'Eggshell', 'Satin'],
    availableSizes: ['Sample', 'Quart', 'Gallon'],
    isTintable: true,
    description: 'Benjamin Moore\'s top-of-the-line interior paint featuring proprietary Color Lock® technology for richer, truer color that stays true over time. Zero VOC formula provides exceptional coverage and durability.',
    imageUrl: '/images/products/bm-aura-interior.jpg',
    coverageRateM2PerL: 10,
  },
  {
    id: 'bm-regal-select',
    name: 'Regal Select Interior Paint',
    brand: 'BM',
    brandId: 'benjamin-moore',
    productLine: 'bm-regal-select',
    department: 'Paint',
    category: 'Interior',
    type: 'base_paint',
    tags: ['interior', 'walls', 'professional', 'high-traffic', 'hallway', 'durable', 'washable'],
    basePrice: 64.95,
    availableFinishes: ['Matte', 'Eggshell', 'Satin', 'Semi-Gloss'],
    availableSizes: ['Sample', 'Quart', 'Gallon', '5-Gallon'],
    isTintable: true,
    description: 'A trusted favorite among painting professionals for over 60 years. Regal Select offers easy application, excellent touch-up, and a mildew-resistant finish perfect for any room.',
    imageUrl: '/images/products/bm-regal-select.jpg',
    coverageRateM2PerL: 10,
  },
  {
    id: 'bm-aura-bath-spa',
    name: 'Aura Bath & Spa',
    brand: 'BM',
    brandId: 'benjamin-moore',
    productLine: 'bm-aura',
    department: 'Paint',
    category: 'Interior',
    type: 'base_paint',
    tags: ['interior', 'bath', 'bathroom', 'kitchen', 'high-humidity', 'mold-resistant', 'moisture', 'spa'],
    basePrice: 84.95,
    availableFinishes: ['Matte', 'Satin'],
    availableSizes: ['Sample', 'Quart', 'Gallon'],
    isTintable: true,
    description: 'Specifically formulated for high-humidity environments like bathrooms and spas. Features mildew-resistant coating and Color Lock® technology for enduring beauty in moisture-prone areas.',
    imageUrl: '/images/products/bm-aura-bath-spa.jpg',
    coverageRateM2PerL: 10,
  },
  {
    id: 'bm-advance',
    name: 'Advance Interior Paint',
    brand: 'BM',
    brandId: 'benjamin-moore',
    productLine: 'bm-advance',
    department: 'Paint',
    category: 'Trim & Door',
    type: 'base_paint',
    tags: ['interior', 'trim', 'doors', 'cabinets', 'furniture', 'woodwork', 'self-leveling'],
    basePrice: 84.95,
    availableFinishes: ['Satin', 'Semi-Gloss', 'Gloss'],
    availableSizes: ['Quart', 'Gallon'],
    isTintable: true,
    description: 'A premium waterborne alkyd delivering a flawless, furniture-grade finish on trim, doors, and cabinets. Self-leveling formula minimizes brush marks for a smooth, professional result.',
    imageUrl: '/images/products/bm-advance.jpg',
    coverageRateM2PerL: 11,
  },
  {
    id: 'bm-aura-exterior',
    name: 'Aura Exterior Paint',
    brand: 'BM',
    brandId: 'benjamin-moore',
    productLine: 'bm-aura',
    department: 'Paint',
    category: 'Exterior',
    type: 'base_paint',
    tags: ['exterior', 'masonry', 'wood', 'facade', 'siding', 'weather-resistant', 'fade-resistant'],
    basePrice: 89.95,
    availableFinishes: ['Matte', 'Satin'],
    availableSizes: ['Gallon', '5-Gallon'],
    isTintable: true,
    description: 'Premium exterior paint with Color Lock® technology for exceptional fade resistance. Advanced resin technology provides superior adhesion and flexibility in all weather conditions.',
    imageUrl: '/images/products/bm-aura-exterior.jpg',
    coverageRateM2PerL: 9,
  },

  // ---------------------------------------------------------------------------
  // FARROW & BALL
  // ---------------------------------------------------------------------------
  {
    id: 'fb-estate-emulsion',
    name: 'Estate Emulsion',
    brand: 'FB',
    brandId: 'farrow-ball',
    productLine: 'fb-estate',
    department: 'Paint',
    category: 'Interior',
    type: 'base_paint',
    tags: ['interior', 'walls', 'ceilings', 'premium', 'chalky', 'heritage', 'traditional'],
    basePrice: 112.00,
    availableFinishes: ['Matte'],
    availableSizes: ['Sample', 'Gallon', '5-Gallon'],
    isTintable: true,
    description: 'Our signature chalky matt finish for interior walls and ceilings. Made with rich pigments for exceptional depth of color. Low sheen hides imperfections beautifully.',
    imageUrl: '/images/products/fb-estate-emulsion.jpg',
    coverageRateM2PerL: 12,
  },
  {
    id: 'fb-modern-emulsion',
    name: 'Modern Emulsion',
    brand: 'FB',
    brandId: 'farrow-ball',
    productLine: 'fb-modern',
    department: 'Paint',
    category: 'Interior',
    type: 'base_paint',
    tags: ['interior', 'walls', 'washable', 'durable', 'family', 'high-traffic', 'modern'],
    basePrice: 118.00,
    availableFinishes: ['Eggshell'],
    availableSizes: ['Sample', 'Gallon', '5-Gallon'],
    isTintable: true,
    description: 'A highly durable, washable finish with a soft mid-sheen. Perfect for busy households and high-traffic areas while maintaining Farrow & Ball\'s signature depth of color.',
    imageUrl: '/images/products/fb-modern-emulsion.jpg',
    coverageRateM2PerL: 12,
  },
  {
    id: 'fb-estate-eggshell',
    name: 'Estate Eggshell',
    brand: 'FB',
    brandId: 'farrow-ball',
    productLine: 'fb-estate',
    department: 'Paint',
    category: 'Trim & Door',
    type: 'base_paint',
    tags: ['interior', 'trim', 'doors', 'woodwork', 'traditional', 'heritage', 'period'],
    basePrice: 125.00,
    availableFinishes: ['Eggshell'],
    availableSizes: ['Quart', 'Gallon'],
    isTintable: true,
    description: 'A traditional mid-sheen finish for interior woodwork. Water-based with excellent flow and leveling. Creates the perfect complement to Estate Emulsion walls.',
    imageUrl: '/images/products/fb-estate-eggshell.jpg',
    coverageRateM2PerL: 14,
  },
  {
    id: 'fb-full-gloss',
    name: 'Full Gloss',
    brand: 'FB',
    brandId: 'farrow-ball',
    productLine: 'fb-full-gloss',
    department: 'Paint',
    category: 'Trim & Door',
    type: 'base_paint',
    tags: ['interior', 'exterior', 'trim', 'doors', 'high-gloss', 'traditional', 'statement'],
    basePrice: 128.00,
    availableFinishes: ['Gloss'],
    availableSizes: ['Quart', 'Gallon'],
    isTintable: true,
    description: 'A stunning high-gloss finish for interior and exterior woodwork. Creates a reflective, lacquer-like finish that makes colors truly sing.',
    imageUrl: '/images/products/fb-full-gloss.jpg',
    coverageRateM2PerL: 14,
  },
  {
    id: 'fb-exterior-masonry',
    name: 'Exterior Masonry Paint',
    brand: 'FB',
    brandId: 'farrow-ball',
    productLine: 'fb-exterior',
    department: 'Paint',
    category: 'Exterior',
    type: 'base_paint',
    tags: ['exterior', 'masonry', 'brick', 'render', 'stucco', 'weather-resistant', 'breathable'],
    basePrice: 135.00,
    availableFinishes: ['Matte'],
    availableSizes: ['Gallon', '5-Gallon'],
    isTintable: true,
    description: 'A durable, breathable masonry paint for exterior walls. Allows moisture to escape while protecting against the elements. Available in the full Farrow & Ball color range.',
    imageUrl: '/images/products/fb-exterior-masonry.jpg',
    coverageRateM2PerL: 8,
  },

  // ---------------------------------------------------------------------------
  // LITTLE GREENE
  // ---------------------------------------------------------------------------
  {
    id: 'lg-absolute-matt',
    name: 'Absolute Matt Emulsion',
    brand: 'LG',
    brandId: 'little-greene',
    productLine: 'lg-absolute-matt',
    department: 'Paint',
    category: 'Interior',
    type: 'base_paint',
    tags: ['interior', 'walls', 'ceilings', 'ultra-matt', 'heritage', 'eco-friendly', 'breathable'],
    basePrice: 78.00,
    availableFinishes: ['Matte'],
    availableSizes: ['Sample', 'Gallon', '5-Gallon'],
    isTintable: true,
    description: 'An ultra-flat, high-coverage emulsion with a beautiful, velvety finish. Made with eco-friendly ingredients and fully breathable. Perfect for period properties.',
    imageUrl: '/images/products/lg-absolute-matt.jpg',
    coverageRateM2PerL: 14,
  },
  {
    id: 'lg-intelligent-matt',
    name: 'Intelligent Matt Emulsion',
    brand: 'LG',
    brandId: 'little-greene',
    productLine: 'lg-intelligent',
    department: 'Paint',
    category: 'Interior',
    type: 'base_paint',
    tags: ['interior', 'walls', 'washable', 'durable', 'family', 'high-traffic', 'wipeable'],
    basePrice: 85.00,
    availableFinishes: ['Matte'],
    availableSizes: ['Sample', 'Gallon', '5-Gallon'],
    isTintable: true,
    description: 'A revolutionary washable matt emulsion that stays looking fresh. Stain-resistant technology allows marks to be wiped away while maintaining the flat, chalky appearance.',
    imageUrl: '/images/products/lg-intelligent-matt.jpg',
    coverageRateM2PerL: 14,
  },
  {
    id: 'lg-intelligent-satin',
    name: 'Intelligent Satinwood',
    brand: 'LG',
    brandId: 'little-greene',
    productLine: 'lg-intelligent',
    department: 'Paint',
    category: 'Trim & Door',
    type: 'base_paint',
    tags: ['interior', 'trim', 'doors', 'woodwork', 'cabinets', 'water-based', 'low-odor'],
    basePrice: 92.00,
    availableFinishes: ['Satin'],
    availableSizes: ['Quart', 'Gallon'],
    isTintable: true,
    description: 'A premium water-based satinwood for interior woodwork. Low odor, quick drying, and non-yellowing. Provides a beautiful, durable mid-sheen finish.',
    imageUrl: '/images/products/lg-intelligent-satin.jpg',
    coverageRateM2PerL: 16,
  },
];

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const dryRun = body.dryRun === true;

    const results = {
      total: MASTER_PRODUCTS.length,
      created: 0,
      errors: 0,
      products: [] as string[],
    };

    const now = new Date().toISOString();

    for (const product of MASTER_PRODUCTS) {
      const item = {
        PK: `PRODUCT#CAN#${product.id}`,
        SK: 'METADATA',
        entityType: 'PRODUCT',
        productType: product.type,
        id: product.id,
        name: product.name,
        brand: product.brand,
        brandId: product.brandId,
        productLine: product.productLine,
        department: product.department,
        category: product.category,
        tags: product.tags,
        basePrice: product.basePrice,
        availableFinishes: product.availableFinishes,
        availableSizes: product.availableSizes,
        isTintable: product.isTintable,
        description: product.description,
        imageUrl: product.imageUrl,
        coverageRateM2PerL: product.coverageRateM2PerL,
        inStock: true,
        createdAt: now,
        updatedAt: now,
      };

      if (!dryRun) {
        try {
          await docClient.send(
            new PutCommand({
              TableName: TABLE_NAME,
              Item: item,
            })
          );
          results.created++;
          results.products.push(product.id);
        } catch (error) {
          console.error(`[Seed] Failed to create ${product.id}:`, error);
          results.errors++;
        }
      } else {
        results.created++;
        results.products.push(product.id);
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      results,
      message: dryRun
        ? `Dry run complete. Would create ${results.total} master products.`
        : `Seed complete. Created ${results.created} master products.`,
    });
  } catch (error) {
    console.error('[Seed] Error:', error);
    return NextResponse.json(
      { error: 'Seed failed', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/seed/products
 * Returns list of master products that would be seeded
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  return NextResponse.json({
    total: MASTER_PRODUCTS.length,
    products: MASTER_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      brandId: p.brandId,
      category: p.category,
      basePrice: p.basePrice,
    })),
  });
}
