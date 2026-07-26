export type ProductCategory = 'BREAD' | 'BUN' | 'CAKES' | 'PASTRIES' | 'BEVERAGES' | 'COOKIES' | 'OTHER';

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  costPrice: number | null;
  category: ProductCategory;
  imageUrl: string | null;
  isAvailable: boolean;
  stockQuantity: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  category: ProductCategory;
  imageUrl?: string;
  stockQuantity?: number;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  category: ProductCategory;
  imageUrl?: string;
  stockQuantity?: number;
}

export interface StockUpdateRequest {
  quantity: number;
}

export interface AvailabilityUpdateRequest {
  isAvailable: boolean;
}

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'BREAD', label: 'Bread' },
  { value: 'BUN', label: 'Bun' },
  { value: 'CAKES', label: 'Cakes' },
  { value: 'PASTRIES', label: 'Pastries' },
  { value: 'BEVERAGES', label: 'Beverages' },
  { value: 'COOKIES', label: 'Cookies' },
  { value: 'OTHER', label: 'Other' },
];
