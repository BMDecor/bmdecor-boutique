/**
 * Cart Types — API request/response shapes and DynamoDB entity types.
 */

import type { ContainerSize } from './variant-config';

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
  SK: string;           // ITEM#{colorNumber}#{productLine}#{sheen}#{size}
  entityType: 'CART_ITEM';
  colorNumber: string;
  colorName: string;
  hexCode: string;
  productLine: string;
  productNumber: string;
  sheen: string;
  size: ContainerSize;
  quantity: number;
  unitPriceEur: number;
  lineTotalEur: number;
  brand: 'BM' | 'FB' | 'LG';
  addedAt: string;      // ISO 8601
  ttl: number;          // epoch seconds
}

// ─────────────────────────────────────────────────────────
// API Request/Response Types
// ─────────────────────────────────────────────────────────

export interface AddToCartRequest {
  colorNumber: string;
  colorName: string;
  hexCode: string;
  productLine: string;
  productNumber: string;
  sheen: string;
  size: ContainerSize;
  quantity: number;
  brand: 'BM' | 'FB' | 'LG';
}

export interface UpdateCartItemRequest {
  quantity: number;     // 0 = remove
}

export interface CartItemResponse {
  sk: string;
  colorNumber: string;
  colorName: string;
  hexCode: string;
  productLine: string;
  productNumber: string;
  sheen: string;
  size: ContainerSize;
  quantity: number;
  unitPriceEur: number;
  lineTotalEur: number;
  brand: 'BM' | 'FB' | 'LG';
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
