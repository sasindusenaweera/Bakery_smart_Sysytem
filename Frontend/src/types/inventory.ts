export interface InventoryItem {
  id: number;
  name: string;
  description: string | null;
  unit: string;
  currentStock: number;
  minimumStock: number;
  costPerUnit: number | null;
  supplier: string | null;
  imageUrl: string | null;
  lastRestocked: string | null;
  isLowStock: boolean;
}

export interface CreateInventoryRequest {
  name: string;
  description?: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  costPerUnit?: number;
  supplier?: string;
  imageUrl?: string;
}

export interface UpdateInventoryRequest {
  name: string;
  description?: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  costPerUnit?: number;
  supplier?: string;
  imageUrl?: string;
}

export interface StockAdjustmentRequest {
  adjustment: number;
}

export const COMMON_UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'L', label: 'Liter (L)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'packs', label: 'Packs' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'bags', label: 'Bags' },
];
