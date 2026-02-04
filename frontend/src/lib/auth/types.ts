export type UserGroup = 'Admin' | 'Employee' | 'Customer';

export interface AuthUser {
  sub: string;
  email: string;
  displayName: string;
  groups: UserGroup[];
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  isLoading: boolean;
}

export interface OrderEntity {
  PK: string;
  SK: string;
  entityType: 'ORDER';
  orderId: string;
  userId: string;
  email: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: Record<string, unknown>[];
  itemCount: number;
  subtotalEur: number;
  shippingMethod: 'delivery' | 'click-and-collect';
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SavedColor {
  brand: 'BM' | 'FB' | 'LG';
  colorCode: string;
  colorName: string;
  hexCode: string;
  notes?: string;
}

export interface ProjectEntity {
  PK: string;
  SK: string;
  entityType: 'USER_PROJECT';
  projectId: string;
  userId: string;
  name: string;
  description?: string;
  colors: SavedColor[];
  createdAt: string;
  updatedAt: string;
}
