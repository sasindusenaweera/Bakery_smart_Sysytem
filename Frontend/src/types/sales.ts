export type PaymentMethod = 'CASH' | 'CARD' | 'CREDIT';

export interface SaleItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateSaleRequest {
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
  discountAmount?: number;
  paymentMethod: PaymentMethod;
  amountPaid?: number;
  cashierId?: number;
  cashierName?: string;
}

export interface Sale {
  id: number;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeGiven: number;
  cashierId: number | null;
  cashierName: string | null;
  saleDate: string;
  items: SaleItem[];
}

export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  cashTotal: number;
  cardTotal: number;
  creditTotal: number;
  todaySales: number;
  todayRevenue: number;
}

export interface CartItem extends SaleItem {
  quantity: number;
}

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'CREDIT', label: 'Credit' },
];
