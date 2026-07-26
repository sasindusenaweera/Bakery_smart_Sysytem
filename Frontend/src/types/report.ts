export interface SalesSummaryReport {
  startDate: string;
  endDate: string;
  totalTransactions: number;
  totalRevenue: number;
  averageOrderValue: number;
  cashTotal: number;
  cardTotal: number;
  creditTotal: number;
  todayTransactions: number;
  todayRevenue: number;
  dailyBreakdown: DailySalesReport[];
}

export interface DailySalesReport {
  date: string;
  transactionCount: number;
  revenue: number;
  averageOrderValue: number;
}

export interface TopProductReport {
  productId: number;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface InventoryStatusReport {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
  lowestStockItemValue: number;
  lowStockItems: LowStockAlert[];
}

export interface LowStockAlert {
  itemId: number;
  itemName: string;
  currentStock: number;
  minimumStock: number;
  costPerUnit: number;
  unit: string;
  supplier: string;
  lastRestocked: string;
  isOutOfStock: boolean;
}

export interface PerformanceReport {
  startDate: string;
  endDate: string;
  period: string;
  totalTransactions: number;
  totalRevenue: number;
  revenueGrowth: number;
  transactionGrowth: number;
  averageOrderValue: number;
  topProducts: TopProductReport[];
  dailyTrend: DailySalesReport[];
}

export type ReportPeriod = 'WEEK' | 'MONTH' | 'YEAR';

export interface PaymentBreakdown {
  name: string;
  value: number;
  color: string;
  percentage: number;
}
