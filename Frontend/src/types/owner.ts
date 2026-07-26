export interface DashboardSummary {
  sales: SalesOverview;
  inventory: InventoryOverview;
  production: ProductionOverview;
  orders: OrdersOverview;
  stats: QuickStats;
}

export interface SalesOverview {
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  todayTransactions: number;
  weeklyTransactions: number;
  monthlyTransactions: number;
  cashierSales: CashierSalesSummary[];
  dailySales: DailySales[];
}

export interface CashierSalesSummary {
  cashierId: number;
  cashierName: string;
  totalSales: number;
  transactionCount: number;
}

export interface DailySales {
  date: string;
  revenue: number;
  transactions: number;
}

export interface InventoryOverview {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  lowStockItems: LowStockItem[];
}

export interface LowStockItem {
  id: number;
  name: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
}

export interface ProductionOverview {
  todayProductions: number;
  todayProductionCost: number;
  recentProductions: ProductionRecord[];
}

export interface ProductionRecord {
  id: number;
  productionDate: string;
  itemCount: number;
  estimatedCost: number;
  notes: string;
}

export interface OrdersOverview {
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  todayOrders: number;
  todayOrdersValue: number;
  recentOrders: OrderSummary[];
}

export interface OrderSummary {
  id: number;
  customerName: string;
  orderDate: string;
  status: string;
  totalAmount: number;
}

export interface QuickStats {
  cashOnHand: number;
  totalExpenses: number;
  creditDue: number;
  supplierDues: number;
  activeCustomers: number;
}

export interface ProductionCreate {
  productionDate: string;
  notes: string;
  items: ProductionItemCreate[];
}

export interface ProductionItemCreate {
  productId: number;
  quantity: number;
  wasteQuantity: number;
}

export interface ProductionResponse {
  id: number;
  productionDate: string;
  notes: string;
  items: ProductionItemResponse[];
  createdAt: string;
  enteredBy?: string;
  enteredByRole?: string;
}

export interface ProductionItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  wasteQuantity: number;
  productCost: number;
}

export interface OrderCreate {
  customerName: string;
  phoneNumber: string;
  orderDate: string;
  requiredDate?: string;
  deliveryAddress?: string;
  notes?: string;
  items: OrderItemCreate[];
  advancePayment?: number;
  paymentMethod?: PaymentMethod;
}

export interface OrderItemCreate {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderResponse {
  id: number;
  customerName: string;
  phoneNumber: string;
  orderDate: string;
  requiredDate?: string;
  deliveryAddress?: string;
  status: string;
  notes?: string;
  preparationNotes?: string;
  totalAmount: number;
  advancePayment: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMethod?: PaymentMethod;
  items: OrderItemResponse[];
  createdAt: string;
  createdBy?: number;
  createdByName?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderUpdateStatus {
  status: string;
  preparationNotes?: string;
}

export interface OrderPayment {
  advancePayment?: number;
  paidAmount?: number;
  notes?: string;
}

export interface SupplierDTO {
  id: number;
  name: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  address: string;
  itemsSupplied: string;
  leadTimeDays: number;
  paymentTerms: string;
  totalPurchases: number;
  pendingAmount: number;
  active: boolean;
}

export interface PurchaseCreate {
  supplierId: number;
  purchaseDate: string;
  invoiceNumber: string;
  notes: string;
  items: PurchaseItemCreate[];
}

export interface PurchaseItemCreate {
  inventoryItemId: number;
  quantity: number;
  unitCost: number;
}

export interface PurchaseResponse {
  id: number;
  supplier: SupplierDTO;
  purchaseDate: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  notes: string;
  items: PurchaseItemResponse[];
  createdAt: string;
}

export interface PurchaseItemResponse {
  id: number;
  inventoryItemId: number;
  itemName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface ExpenseCreate {
  title: string;
  category: string;
  amount: number;
  description: string;
  expenseDate: string;
  expenseFundId?: number;
}

export interface ExpenseResponse {
  id: number;
  title: string;
  category: string;
  amount: number;
  description: string;
  expenseDate: string;
  expenseFundId?: number;
  createdAt: string;
}

export interface ExpenseFundCreate {
  allocatedAmount: number;
  allocationDate: string;
  notes?: string;
}

export interface ExpenseFundResponse {
  id: number;
  allocatedAmount: number;
  usedAmount: number;
  remainingBalance: number;
  allocationDate: string;
  notes?: string;
  allocatedByName?: string;
  createdAt: string;
  expenses: ExpenseResponse[];
}

export interface ExpenseFundSummary {
  totalAllocated: number;
  totalUsed: number;
  totalRemaining: number;
  totalFunds: number;
  totalExpenses: number;
}

export interface CreditTransactionCreate {
  customerName: string;
  phoneNumber: string;
  amount: number;
  transactionType: string;
  transactionDate: string;
  notes: string;
}

export interface CreditTransactionResponse {
  id: number;
  customerId: number;
  customerName: string;
  phoneNumber: string;
  amount: number;
  transactionType: string;
  transactionDate: string;
  notes: string;
  referenceNumber: string;
  createdAt: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'CREDIT' | 'BANK_TRANSFER';

export interface OrderItemRow {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderCancellation {
  cancellationReason: string;
}

export interface OrderFilters {
  status?: string;
  customerName?: string;
  startDate?: string;
  endDate?: string;
  assignedBakerId?: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  preparing: number;
  ready: number;
  completed: number;
  cancelled: number;
  totalValue: number;
}

export interface CreditItemCreate {
  productId?: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreditEntryCreate {
  customerName: string;
  phoneNumber?: string;
  address?: string;
  creditAmount: number;
  dueDate?: string;
  notes?: string;
  linkedOrderId?: number;
  items?: CreditItemCreate[];
}

export interface CreditItemResponse {
  id: number;
  productId?: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreditEntryResponse {
  id: number;
  customerName: string;
  phoneNumber?: string;
  address?: string;
  creditAmount: number;
  paidAmount: number;
  remainingBalance: number;
  dueDate?: string;
  status: string;
  notes?: string;
  linkedOrderId?: number;
  referenceNumber: string;
  items: CreditItemResponse[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreditPaymentCreate {
  amount: number;
  paymentMethod?: string;
  notes?: string;
}

export interface CreditPaymentResponse {
  id: number;
  creditEntryId: number;
  amount: number;
  paymentMethod?: string;
  notes?: string;
  referenceNumber: string;
  paymentDate: string;
  createdAt: string;
}

export interface CreditSummary {
  totalCreditIssued: number;
  totalCollected: number;
  pendingBalance: number;
  overdueAmount: number;
  totalCustomers: number;
  overdueCustomers: number;
}

export interface CreditCustomerCreate {
  customerName: string;
  phoneNumber?: string;
  address?: string;
  creditAmount: number;
  dueDate?: string;
  notes?: string;
}

export interface CreditCustomerResponse {
  id: number;
  customerName: string;
  phoneNumber?: string;
  address?: string;
  totalCredit: number;
  totalPaid: number;
  remainingBalance: number;
  dueDate?: string;
  status: string;
  notes?: string;
  referenceNumber: string;
  lastTransactionDate?: string;
  createdAt: string;
  message?: string;
}
