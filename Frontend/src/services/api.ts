import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError, ValidationError } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError | ValidationError>) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      console.error('API Error:', status, data);

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      if (status === 403) {
        console.error('Access forbidden: You do not have permission to perform this action');
      }

      if (status === 400 && 'errors' in data) {
        const validationError = data as ValidationError;
        console.error('Validation errors:', validationError.errors);
      }
    } else if (error.request) {
      console.error('Network error: Please check your connection', error.request);
    } else {
      console.error('Unexpected error:', error.message);
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (userData: {
    username: string;
    email: string;
    password?: string;
    role: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getUsersByRole: async (role: string) => {
    const response = await api.get(`/users/role/${role}`);
    return response.data;
  },

  updateUser: async (id: number, userData: {
    username: string;
    email: string;
    password?: string;
    role: string;
  }) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deactivateUser: async (id: number) => {
    const response = await api.patch(`/users/${id}/deactivate`);
    return response.data;
  },

  activateUser: async (id: number) => {
    const response = await api.patch(`/users/${id}/activate`);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export const productService = {
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  getProductById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (category: string) => {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  },

  getAvailableProducts: async () => {
    const response = await api.get('/products/available');
    return response.data;
  },

  searchProducts: async (query: string) => {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getLowStockProducts: async (threshold: number = 10) => {
    const response = await api.get(`/products/low-stock?threshold=${threshold}`);
    return response.data;
  },

  createProduct: async (productData: {
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    category: string;
    imageUrl?: string;
    stockQuantity?: number;
  }, imageFile?: File) => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('name', productData.name);
      if (productData.description) formData.append('description', productData.description);
      formData.append('price', productData.price.toString());
      if (productData.costPrice) formData.append('costPrice', productData.costPrice.toString());
      formData.append('category', productData.category);
      if (productData.stockQuantity !== undefined) formData.append('stockQuantity', productData.stockQuantity.toString());
      const response = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id: number, productData: {
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    category: string;
    imageUrl?: string;
    stockQuantity?: number;
  }, imageFile?: File) => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('name', productData.name);
      if (productData.description) formData.append('description', productData.description);
      formData.append('price', productData.price.toString());
      if (productData.costPrice) formData.append('costPrice', productData.costPrice.toString());
      formData.append('category', productData.category);
      if (productData.stockQuantity !== undefined) formData.append('stockQuantity', productData.stockQuantity.toString());
      const response = await api.put(`/products/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  updateStock: async (id: number, quantity: number) => {
    const response = await api.patch(`/products/${id}/stock`, { quantity });
    return response.data;
  },

  updateAvailability: async (id: number, isAvailable: boolean) => {
    const response = await api.patch(`/products/${id}/availability`, { isAvailable });
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export const inventoryService = {
  getAllItems: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },

  getItemById: async (id: number) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  getLowStockItems: async () => {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  },

  getItemsBySupplier: async (supplier: string) => {
    const response = await api.get(`/inventory/supplier/${supplier}`);
    return response.data;
  },

  searchItems: async (query: string) => {
    const response = await api.get(`/inventory/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  createItem: async (itemData: {
    name: string;
    description?: string;
    unit: string;
    currentStock: number;
    minimumStock: number;
    costPerUnit?: number;
    supplier?: string;
    imageUrl?: string;
  }, imageFile?: File) => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('name', itemData.name);
      if (itemData.description) formData.append('description', itemData.description);
      formData.append('unit', itemData.unit);
      formData.append('currentStock', itemData.currentStock.toString());
      formData.append('minimumStock', itemData.minimumStock.toString());
      if (itemData.costPerUnit) formData.append('costPerUnit', itemData.costPerUnit.toString());
      if (itemData.supplier) formData.append('supplier', itemData.supplier);
      const response = await api.post('/inventory/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.post('/inventory', itemData);
    return response.data;
  },

  updateItem: async (id: number, itemData: {
    name: string;
    description?: string;
    unit: string;
    currentStock: number;
    minimumStock: number;
    costPerUnit?: number;
    supplier?: string;
    imageUrl?: string;
  }, imageFile?: File) => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('name', itemData.name);
      if (itemData.description) formData.append('description', itemData.description);
      formData.append('unit', itemData.unit);
      formData.append('currentStock', itemData.currentStock.toString());
      formData.append('minimumStock', itemData.minimumStock.toString());
      if (itemData.costPerUnit) formData.append('costPerUnit', itemData.costPerUnit.toString());
      if (itemData.supplier) formData.append('supplier', itemData.supplier);
      if (itemData.imageUrl) formData.append('imageUrl', itemData.imageUrl);
      const response = await api.put(`/inventory/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.put(`/inventory/${id}`, itemData);
    return response.data;
  },

  adjustStock: async (id: number, adjustment: number) => {
    const response = await api.patch(`/inventory/${id}/adjust`, { adjustment });
    return response.data;
  },

  setStock: async (id: number, stock: number) => {
    const response = await api.patch(`/inventory/${id}/stock?stock=${stock}`);
    return response.data;
  },

  deleteItem: async (id: number) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },
};

export const salesService = {
  getAllSales: async () => {
    const response = await api.get('/sales');
    return response.data;
  },

  getSaleById: async (id: number) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  getTodaySales: async () => {
    const response = await api.get('/sales/today');
    return response.data;
  },

  getSalesSummary: async () => {
    const response = await api.get('/sales/summary');
    return response.data;
  },

  getSalesReport: async (start: string, end: string) => {
    const response = await api.get(`/sales/report?start=${start}&end=${end}`);
    return response.data;
  },

  createSale: async (saleData: {
    items: {
      productId: number;
      productName: string;
      quantity: number;
      unitPrice: number;
    }[];
    discountAmount?: number;
    paymentMethod: string;
    amountPaid?: number;
    cashierId?: number;
    cashierName?: string;
  }) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },
};

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

export const reportService = {
  getSalesSummary: async (startDate?: string, endDate?: string): Promise<SalesSummaryReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    const response = await api.get(`/reports/sales-summary${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  getTopProducts: async (limit: number = 10): Promise<TopProductReport[]> => {
    const response = await api.get(`/reports/top-products?limit=${limit}`);
    return response.data;
  },

  getDailyBreakdown: async (startDate: string, endDate: string): Promise<DailySalesReport[]> => {
    const response = await api.get(`/reports/daily-breakdown?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
    return response.data;
  },

  getInventoryStatus: async (): Promise<InventoryStatusReport> => {
    const response = await api.get('/reports/inventory-status');
    return response.data;
  },

  getLowStockAlerts: async (): Promise<LowStockAlert[]> => {
    const response = await api.get('/reports/low-stock-alerts');
    return response.data;
  },

  getPerformance: async (period: string = 'WEEK'): Promise<PerformanceReport> => {
    const response = await api.get(`/reports/performance?period=${period}`);
    return response.data;
  },
};
