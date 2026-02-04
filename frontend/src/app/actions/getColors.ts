'use server';

/**
 * Server Action: Get Colors from DynamoDB
 *
 * Queries the BmDecorProducts table using the bmdecor AWS profile.
 * Returns all products for display in the Color Grid.
 */

import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';

// Types matching shared/types.ts
export type Brand = 'BM' | 'FB' | 'LG';

export interface ColorProduct {
  id: string;
  brand: Brand;
  name: string;
  colorCode: string;
  hexCode: string;
  finishType: string;
  priceEur: number;
  volume: string;
  collection?: string;
  description?: string;
  inStock: boolean;
}

/**
 * Fetch all colors from DynamoDB
 */
export async function getColors(): Promise<ColorProduct[]> {
  try {
    const allItems: Record<string, unknown>[] = [];
    let lastKey: Record<string, unknown> | undefined;

    do {
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'entityType = :type',
          ExpressionAttributeValues: {
            ':type': 'PRODUCT',
          },
          ExclusiveStartKey: lastKey,
        })
      );
      if (result.Items) allItems.push(...result.Items);
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    // Map DynamoDB items to ColorProduct interface
    const colors: ColorProduct[] = allItems.map((item) => ({
      id: item.id as string,
      brand: item.brand as Brand,
      name: item.name as string,
      colorCode: item.colorCode as string,
      hexCode: item.hexCode as string,
      finishType: item.finishType as string,
      priceEur: item.priceEur as number,
      volume: item.volume as string,
      collection: item.collection as string | undefined,
      description: item.description as string | undefined,
      inStock: item.inStock as boolean,
    }));

    // Sort by brand then by name
    colors.sort((a, b) => {
      if (a.brand !== b.brand) {
        return a.brand.localeCompare(b.brand);
      }
      return a.name.localeCompare(b.name);
    });

    return colors;
  } catch (error) {
    console.error('Error fetching colors from DynamoDB:', error);
    return [];
  }
}

/**
 * Fetch colors by brand
 */
export async function getColorsByBrand(brand: Brand): Promise<ColorProduct[]> {
  try {
    const allItems: Record<string, unknown>[] = [];
    let lastKey: Record<string, unknown> | undefined;

    do {
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'brand = :brand AND entityType = :type',
          ExpressionAttributeValues: {
            ':brand': brand,
            ':type': 'PRODUCT',
          },
          ExclusiveStartKey: lastKey,
        })
      );
      if (result.Items) allItems.push(...result.Items);
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    const colors: ColorProduct[] = allItems.map((item) => ({
      id: item.id as string,
      brand: item.brand as Brand,
      name: item.name as string,
      colorCode: item.colorCode as string,
      hexCode: item.hexCode as string,
      finishType: item.finishType as string,
      priceEur: item.priceEur as number,
      volume: item.volume as string,
      collection: item.collection as string | undefined,
      description: item.description as string | undefined,
      inStock: item.inStock as boolean,
    }));

    colors.sort((a, b) => a.name.localeCompare(b.name));

    return colors;
  } catch (error) {
    console.error(`Error fetching ${brand} colors from DynamoDB:`, error);
    return [];
  }
}
