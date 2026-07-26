import { api } from './api';
import {
  SupplierCreate,
  SupplierUpdate,
  SupplierResponse,
  PurchaseCreate,
  PurchaseUpdate,
  PurchaseResponse,
  PaymentRecord,
  PurchaseStats,
  PurchaseStatus,
} from '../types/purchase';

export const supplierService = {
  getAll: async (): Promise<SupplierResponse[]> => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  getActive: async (): Promise<SupplierResponse[]> => {
    const response = await api.get('/suppliers/active');
    return response.data;
  },

  search: async (query: string): Promise<SupplierResponse[]> => {
    const response = await api.get(`/suppliers/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getById: async (id: number): Promise<SupplierResponse> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  getPurchases: async (id: number): Promise<PurchaseResponse[]> => {
    const response = await api.get(`/suppliers/${id}/purchases`);
    return response.data;
  },

  create: async (data: SupplierCreate): Promise<SupplierResponse> => {
    const response = await api.post('/suppliers', data);
    return response.data;
  },

  update: async (id: number, data: SupplierUpdate): Promise<SupplierResponse> => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },

  setActive: async (id: number, active: boolean): Promise<void> => {
    await api.patch(`/suppliers/${id}/active?active=${active}`);
  },
};

export const purchaseService = {
  getAll: async (
    filters?: {
      supplierId?: number;
      status?: PurchaseStatus;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PurchaseResponse[]> => {
    const params = new URLSearchParams();
    if (filters?.supplierId) params.append('supplierId', String(filters.supplierId));
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const queryString = params.toString();
    const response = await api.get(`/purchases${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  getById: async (id: number): Promise<PurchaseResponse> => {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  },

  create: async (data: PurchaseCreate): Promise<PurchaseResponse> => {
    console.log('Creating purchase with data:', JSON.stringify(data));
    const response = await api.post('/purchases', data);
    return response.data;
  },

  update: async (id: number, data: PurchaseUpdate): Promise<PurchaseResponse> => {
    const response = await api.put(`/purchases/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/purchases/${id}`);
  },

  recordPayment: async (id: number, data: PaymentRecord): Promise<PurchaseResponse> => {
    const response = await api.post(`/purchases/${id}/payment`, data);
    return response.data;
  },

  updateStatus: async (id: number, status: PurchaseStatus): Promise<PurchaseResponse> => {
    const response = await api.patch(`/purchases/${id}/status`, { status });
    return response.data;
  },

  getStats: async (): Promise<PurchaseStats> => {
    const response = await api.get('/purchases/stats');
    return response.data;
  },
};
