import { api } from './api';
import {
  DashboardSummary,
  ProductionCreate,
  ProductionResponse,
  OrderCreate,
  OrderResponse,
  OrderUpdateStatus,
  OrderPayment,
  OrderCancellation,
  SupplierDTO,
  PurchaseCreate,
  PurchaseResponse,
  ExpenseCreate,
  ExpenseResponse,
  ExpenseFundCreate,
  ExpenseFundResponse,
  ExpenseFundSummary,
  CreditEntryResponse,
  CreditEntryCreate,
  CreditPaymentResponse,
  CreditPaymentCreate,
  CreditSummary,
  CreditCustomerResponse,
  CreditCustomerCreate,
  CreditTransactionResponse,
} from '../types/owner';

interface OrderFilters {
  status?: string;
  customerName?: string;
  startDate?: string;
  endDate?: string;
}

export const ownerService = {
  getDashboard: async (): Promise<DashboardSummary> => {
    const response = await api.get('/owner/dashboard');
    return response.data;
  },

  getProductions: async (): Promise<ProductionResponse[]> => {
    const response = await api.get('/production');
    return response.data;
  },

  createProduction: async (data: ProductionCreate): Promise<ProductionResponse> => {
    const response = await api.post('/production', data);
    return response.data;
  },

  getProductionById: async (id: number): Promise<ProductionResponse> => {
    const response = await api.get(`/production/${id}`);
    return response.data;
  },

  getOrders: async (filters?: OrderFilters): Promise<OrderResponse[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customerName) params.append('customerName', filters.customerName);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const queryString = params.toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';
    const response = await api.get(url);
    return response.data;
  },

  createOrder: async (data: OrderCreate, userId?: number): Promise<OrderResponse> => {
    const response = await api.post('/orders', data, {
      params: userId ? { userId } : undefined
    });
    return response.data;
  },

  getOrderById: async (id: number): Promise<OrderResponse> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: number, data: OrderUpdateStatus): Promise<OrderResponse> => {
    const response = await api.put(`/orders/${id}/status`, data);
    return response.data;
  },

  recordPayment: async (id: number, data: OrderPayment): Promise<OrderResponse> => {
    const response = await api.post(`/orders/${id}/payment`, data);
    return response.data;
  },

  deleteOrder: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  cancelOrder: async (id: number, data: OrderCancellation): Promise<OrderResponse> => {
    const response = await api.put(`/orders/${id}/status`, {
      status: 'CANCELLED',
      cancellationReason: data.cancellationReason
    });
    return response.data;
  },

  getSuppliers: async (): Promise<SupplierDTO[]> => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  getSupplierById: async (id: number): Promise<SupplierDTO> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  createSupplier: async (data: Omit<SupplierDTO, 'id' | 'totalPurchases' | 'pendingAmount'>): Promise<SupplierDTO> => {
    const response = await api.post('/suppliers', data);
    return response.data;
  },

  updateSupplier: async (id: number, data: Partial<SupplierDTO>): Promise<SupplierDTO> => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },

  deactivateSupplier: async (id: number): Promise<void> => {
    await api.patch(`/suppliers/${id}/active?active=false`);
  },

  activateSupplier: async (id: number): Promise<void> => {
    await api.patch(`/suppliers/${id}/active?active=true`);
  },

  getPurchases: async (): Promise<PurchaseResponse[]> => {
    const response = await api.get('/purchases');
    return response.data;
  },

  createPurchase: async (data: PurchaseCreate): Promise<PurchaseResponse> => {
    const response = await api.post('/purchases', data);
    return response.data;
  },

  getPurchaseById: async (id: number): Promise<PurchaseResponse> => {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  },

  getExpenses: async (): Promise<ExpenseResponse[]> => {
    const response = await api.get('/expenses');
    return response.data;
  },

  createExpense: async (data: ExpenseCreate): Promise<ExpenseResponse> => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  getExpenseById: async (id: number): Promise<ExpenseResponse> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  deleteExpense: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },

  getExpenseFunds: async (): Promise<ExpenseFundResponse[]> => {
    const response = await api.get('/expense-funds');
    return response.data;
  },

  getExpenseFundById: async (id: number): Promise<ExpenseFundResponse> => {
    const response = await api.get(`/expense-funds/${id}`);
    return response.data;
  },

  getExpenseFundSummary: async (): Promise<ExpenseFundSummary> => {
    const response = await api.get('/expense-funds/summary');
    return response.data;
  },

  createExpenseFund: async (data: ExpenseFundCreate): Promise<ExpenseFundResponse> => {
    const response = await api.post('/expense-funds', data);
    return response.data;
  },

  getExpensesByFund: async (fundId: number): Promise<ExpenseResponse[]> => {
    const response = await api.get(`/expenses/fund/${fundId}`);
    return response.data;
  },

  getCreditSummary: async (): Promise<CreditSummary> => {
    const response = await api.get('/credits/summary');
    return response.data;
  },

  getCreditCustomers: async (filters?: { search?: string }): Promise<CreditCustomerResponse[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString();
    const url = queryString ? `/credits?${queryString}` : '/credits';
    const response = await api.get(url);
    return response.data;
  },

  createCreditCustomer: async (data: CreditCustomerCreate): Promise<CreditCustomerResponse> => {
    const response = await api.post('/credits', data);
    return response.data;
  },

  getCreditCustomerById: async (id: number): Promise<CreditCustomerResponse> => {
    const response = await api.get(`/credits/${id}`);
    return response.data;
  },

  deleteCreditCustomer: async (id: number): Promise<void> => {
    await api.delete(`/credits/${id}`);
  },

  recordCreditPayment: async (id: number, data: CreditPaymentCreate): Promise<CreditPaymentResponse> => {
    const response = await api.post(`/credits/${id}/payment`, data);
    return response.data;
  },

  getCreditTransactionsByCustomer: async (customerId: number): Promise<CreditTransactionResponse[]> => {
    const response = await api.get(`/credits/${customerId}/transactions`);
    return response.data;
  },

  getCreditPaymentHistory: async (id: number): Promise<CreditPaymentResponse[]> => {
    const response = await api.get(`/credits/${id}/payments`);
    return response.data;
  },

  getCreditEntries: async (filters?: { status?: string; customerName?: string }): Promise<CreditEntryResponse[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customerName) params.append('customerName', filters.customerName);
    const queryString = params.toString();
    const url = queryString ? `/credits?${queryString}` : '/credits';
    const response = await api.get(url);
    return response.data;
  },

  getCreditEntryById: async (id: number): Promise<CreditEntryResponse> => {
    const response = await api.get(`/credits/${id}`);
    return response.data;
  },

  createCreditEntry: async (data: CreditEntryCreate): Promise<CreditEntryResponse> => {
    const response = await api.post('/credits', data);
    return response.data;
  },

  deleteCreditEntry: async (id: number): Promise<void> => {
    await api.delete(`/credits/${id}`);
  },
};
