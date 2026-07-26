export type PurchaseStatus = 'PENDING' | 'RECEIVED' | 'PAID' | 'CANCELLED';

export interface SupplierCreate {
  name: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  itemsSupplied?: string;
  leadTimeDays?: number;
  paymentTerms?: string;
}

export interface SupplierUpdate {
  name?: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  itemsSupplied?: string;
  leadTimeDays?: number;
  paymentTerms?: string;
  active?: boolean;
}

export interface SupplierResponse {
  id: number;
  name: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  itemsSupplied?: string;
  leadTimeDays?: number;
  paymentTerms?: string;
  totalPurchases?: number;
  pendingAmount?: number;
  active: boolean;
}

export interface PurchaseItemCreate {
  inventoryItemId: number;
  quantity: number;
  unitCost: number;
}

export interface PurchaseCreate {
  supplierId: number;
  purchaseDate?: string;
  invoiceNumber?: string;
  notes?: string;
  items: PurchaseItemCreate[];
}

export interface PurchaseUpdate {
  status?: PurchaseStatus;
  notes?: string;
  items?: PurchaseItemCreate[];
}

export interface PurchaseItemResponse {
  id: number;
  inventoryItemId: number;
  itemName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseResponse {
  id: number;
  supplier?: SupplierResponse;
  purchaseDate: string;
  status: PurchaseStatus;
  invoiceNumber?: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  notes?: string;
  items: PurchaseItemResponse[];
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentRecord {
  amount: number;
  paymentDate?: string;
  notes?: string;
}

export interface PurchaseStats {
  totalPurchases: number;
  pendingPurchases: number;
  paidPurchases: number;
  totalValue: number;
  pendingValue: number;
  paidValue: number;
}
