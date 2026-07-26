import { api } from './api';
import { 
  IssueCreate, 
  IssueUpdate, 
  IssueResponse,
  ProductionUpdate,
  ProductionStats
} from '../types/issue';
import { ProductionCreate, ProductionResponse } from '../types/owner';

export const productionService = {
  getAllProductions: async (): Promise<ProductionResponse[]> => {
    const response = await api.get('/production');
    return response.data;
  },

  getProductionById: async (id: number): Promise<ProductionResponse> => {
    const response = await api.get(`/production/${id}`);
    return response.data;
  },

  getProductionsByDateRange: async (
    startDate?: string, 
    endDate?: string
  ): Promise<ProductionResponse[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/production/filter?${params.toString()}`);
    return response.data;
  },

  getProductionStats: async (
    period: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<ProductionStats> => {
    const response = await api.get(`/production/stats?period=${period}`);
    return response.data;
  },

  createProduction: async (
    data: ProductionCreate, 
    userId?: number
  ): Promise<ProductionResponse> => {
    const params = userId ? `?userId=${userId}` : '';
    const response = await api.post(`/production${params}`, data);
    return response.data;
  },

  updateProduction: async (
    id: number, 
    data: ProductionUpdate
  ): Promise<ProductionResponse> => {
    const response = await api.put(`/production/${id}`, data);
    return response.data;
  },

  deleteProduction: async (id: number): Promise<void> => {
    await api.delete(`/production/${id}`);
  },
};

export const issueService = {
  getAllIssues: async (): Promise<IssueResponse[]> => {
    const response = await api.get('/issues');
    return response.data;
  },

  getIssueById: async (id: number): Promise<IssueResponse> => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  filterIssues: async (
    startDate?: string, 
    endDate?: string, 
    issuedTo?: string
  ): Promise<IssueResponse[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (issuedTo) params.append('issuedTo', issuedTo);
    const response = await api.get(`/issues/filter?${params.toString()}`);
    return response.data;
  },

  createIssue: async (
    data: IssueCreate, 
    userId?: number
  ): Promise<IssueResponse> => {
    // Try without userId first to debug
    const url = userId ? `/issues?userId=${userId}` : '/issues';
    console.log('POST to:', url, 'with data:', JSON.stringify(data));
    const response = await api.post(url, data);
    return response.data;
  },

  updateIssue: async (
    id: number, 
    data: IssueUpdate
  ): Promise<IssueResponse> => {
    const response = await api.put(`/issues/${id}`, data);
    return response.data;
  },

  deleteIssue: async (id: number): Promise<void> => {
    await api.delete(`/issues/${id}`);
  },
};
