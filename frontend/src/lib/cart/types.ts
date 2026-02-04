/**
 * Cart Types — API request/response shapes and DynamoDB entity types.
 *
 * Supports three product types: paint, wallpaper, accessory.
 */

import type { ContainerSize } from './variant-config';

// ─────────────────────────────────────────────────────────
// Product Type
// ─────────────────────────────────────────────────────────

export type CartProductType = 'paint' | 'wallpaper' | 'accessory';

// ─────────────────────────────────────────────────────────
// DynamoDB Entity Types
// ─────────────────────────────────────────────────────────

export interface CartSessionEntity {
  PK: string;           // CART#GUEST_{uuid}
  SK: 'SESSION';
  entityType: 'CART_SESSION';
  itemCount: number;
  subtotalEur: number;
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
  ttl: number;          // epoch seconds
}

export interface CartItemEntity {
  PK: string;           // CART#GUEST_{uuid}
  SK: string;           // ITEM#{productType}#{productId}#{variant}
  entityType: 'CART_ITEM';
  productType: CartProductType;
  brand: 'BM' | 'FB' | 'LG';
  quantity: number;
  unitPriceEur: number;
  lineTotalEur: number;
  addedAt: string;      // ISO 8601
  ttl: number;          // epoch seconds

  // Paint-specific fields
  colorNumber?: string;
  colorName?: string;
  hexCode?: string;
  productLine?: string;
  productNumber?: string;
  sheen?: string;
  size?: ContainerSize;

  // Wallpaper-specific fields
  designName?: string;
  colourway?: string;
  wallpaperId?: string;
  imageUrl?: string;

  // Accessory-specific fields
  accessoryId?: string;
  accessoryName?: string;
  accessoryCategory?: string;
}

// ─────────────────────────────────────────────────────────
// API Request/Response Types
// ─────────────────────────────────────────────────────────

export interface AddToCartRequest {
  productType?: CartProductType;  // defaults to 'paint'
  brand: 'BM' | 'FB' | 'LG';
  quantity: number;

  // Paint fields
  colorNumber?: string;
  colorName?: string;
  hexCode?: string;
  productLine?: string;
  productNumber?: string;
  sheen?: string;
  size?: ContainerSize;

  // Wallpaper fields
  wallpaperId?: string;
  designName?: string;
  colourway?: string;
  imageUrl?: string;
  unitPriceEur?: number;

  // Accessory fields
  accessoryId?: string;
  accessoryName?: string;
  accessoryCategory?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;     // 0 = remove
}

export interface CartItemResponse {
  sk: string;
  productType: CartProductType;
  brand: 'BM' | 'FB' | 'LG';
  quantity: number;
  unitPriceEur: number;
  lineTotalEur: number;

  // Paint fields
  colorNumber?: string;
  colorName?: string;
  hexCode?: string;
  productLine?: string;
  productNumber?: string;
  sheen?: string;
  size?: ContainerSize;

  // Wallpaper fields
  designName?: string;
  colourway?: string;
  wallpaperId?: string;
  imageUrl?: string;

  // Accessory fields
  accessoryId?: string;
  accessoryName?: string;
  accessoryCategory?: string;
}

export interface CartResponse {
  cartId: string;
  itemCount: number;
  subtotalEur: number;
  items: CartItemResponse[];
}

export interface CartMutationResponse {
  success: boolean;
  cart: CartResponse;
}

// ─────────────────────────────────────────────────────────
// Variant Selection (for UI state)
// ─────────────────────────────────────────────────────────

export interface SelectedVariant {
  productLine: string;
  productNumber: string;
  sheen: string;
  size: ContainerSize;
  unitPriceEur: number;
}
