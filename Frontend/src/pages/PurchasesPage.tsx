import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Search, Plus, Package, Truck, Receipt, Calendar, Users } from 'lucide-react';
import { purchaseService, supplierService } from '../services/purchaseService';
import { PurchaseResponse, PurchaseCreate, PurchaseStatus, PaymentRecord, SupplierResponse } from '../types/purchase';
import { PurchaseModal } from '../components/PurchaseModal';
import { PaymentModal } from '../components/PaymentModal';
import { PurchaseCard } from '../components/PurchaseCard';
import { StatCardSkeleton } from '../components/PurchaseSkeleton';
import { PurchaseErrorBoundary } from '../components/PurchaseErrorBoundary';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const PurchasesPage: React.FC = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | ''>('');
  const [supplierFilter, setSupplierFilter] = useState<number | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const canAccessFull = user?.role === 'OWNER';
  const canAccessPartial = user?.role === 'OWNER' || user?.role === 'STOREKEEPER';

  const fetchPurchases = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filters: { status?: PurchaseStatus; supplierId?: number } = {};
      if (statusFilter) filters.status = statusFilter;
      if (supplierFilter) filters.supplierId = supplierFilter;
      const data = await purchaseService.getAll(filters);
      setPurchases(data);
    } catch {
      setError('Failed to load purchases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, supplierFilter]);

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getActive();
      setSuppliers(data);
    } catch {
      setSuppliers([]);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleCreate = () => {
    setSelectedPurchase(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: PurchaseCreate) => {
    try {
      await purchaseService.create(data);
      setIsModalOpen(false);
      fetchPurchases();
      fetchSuppliers();
    } catch (err: any) {
      console.error('Failed to save purchase:', err);
      setError(err.response?.data?.message || 'Failed to save purchase. Please try again.');
      throw err;
    }
  };

  const handlePayment = async (data: PaymentRecord) => {
    if (selectedPurchase) {
      await purchaseService.recordPayment(selectedPurchase.id, data);
      fetchPurchases();
      fetchSuppliers();
    }
  };

  const handleStatusChange = async (id: number, status: PurchaseStatus) => {
    try {
      await purchaseService.updateStatus(id, status);
      fetchPurchases();
    } catch {
      setError('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this purchase?')) return;
    try {
      await purchaseService.delete(id);
      fetchPurchases();
    } catch {
      setError('Failed to delete purchase');
    }
  };

  const handlePaymentClick = (purchase: PurchaseResponse) => {
    setSelectedPurchase(purchase);
    setIsPaymentModalOpen(true);
  };

  const filteredPurchases = purchases.filter((p) => {
    const supplierName = p.supplier?.name || '';
    const matchesSearch = !searchQuery ||
      supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.id).includes(searchQuery);
    
    const pending = p.pendingAmount ?? (p.totalAmount - p.paidAmount);
    let matchesPayment = true;
    if (paymentFilter === 'paid') matchesPayment = p.status === 'PAID' || (p.paidAmount || 0) >= pending;
    else if (paymentFilter === 'pending') matchesPayment = pending > 0;
    
    return matchesSearch && matchesPayment;
  });

  const totalValue = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalPending = purchases.reduce((sum, p) => {
    const pending = p.pendingAmount ?? (p.totalAmount - p.paidAmount);
    return sum + pending;
  }, 0);
  const thisMonthPurchases = purchases.filter(p => {
    const purchaseDate = new Date(p.purchaseDate);
    const now = new Date();
    return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear();
  }).reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Purchases</h1>
              <p className="text-slate-400 text-sm">Manage raw material purchases & payments</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button onClick={fetchPurchases} className="flex items-center px-4 py-2 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded-lg hover:bg-slate-600/50">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </button>
            {canAccessPartial && (
              <button onClick={handleCreate} className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700">
                <Plus className="h-4 w-4 mr-2" /> New Purchase
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {isLoading ? (
            <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
          ) : (
            <>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <div><p className="text-sm text-slate-400">Total Payments</p><p className="text-xl font-bold text-orange-400">{formatCurrency(totalValue)}</p></div>
                  <div className="bg-orange-500/20 p-3 rounded-lg"><Truck className="h-6 w-6 text-orange-400" /></div>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <div><p className="text-sm text-slate-400">Pending Payments</p><p className="text-xl font-bold text-red-400">{formatCurrency(totalPending)}</p></div>
                  <div className="bg-red-500/20 p-3 rounded-lg"><Receipt className="h-6 w-6 text-red-400" /></div>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <div><p className="text-sm text-slate-400">This Month</p><p className="text-xl font-bold text-blue-400">{formatCurrency(thisMonthPurchases)}</p></div>
                  <div className="bg-blue-500/20 p-3 rounded-lg"><Calendar className="h-6 w-6 text-blue-400" /></div>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <div><p className="text-sm text-slate-400">Active Suppliers</p><p className="text-xl font-bold text-emerald-400">{suppliers.length}</p></div>
                  <div className="bg-emerald-500/20 p-3 rounded-lg"><Users className="h-6 w-6 text-emerald-400" /></div>
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300">{error}</div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by supplier..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-orange-500/50 text-slate-200 placeholder-slate-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PurchaseStatus | '')}
            className="px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-orange-500/50 text-slate-200"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="RECEIVED">Received</option>
            <option value="PAID">Paid</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-orange-500/50 text-slate-200"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value ? Number(e.target.value) : '')}
            className="px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-orange-500/50 text-slate-200"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
          </select>
        </div>

        <PurchaseErrorBoundary fallbackMessage="Failed to load purchase cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 animate-pulse">
                  <div className="h-12 bg-slate-700 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </div>
              ))
            ) : filteredPurchases.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <Package className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-lg">No purchases found</p>
                {canAccessPartial && <button onClick={handleCreate} className="mt-3 text-orange-400 hover:text-orange-300 font-medium">Add your first purchase</button>}
              </div>
            ) : (
filteredPurchases.map((purchase) => (
                    <PurchaseCard
                      key={purchase.id}
                      purchase={purchase}
                      onPayment={handlePaymentClick}
                      onDelete={canAccessFull ? handleDelete : () => {}}
                      onStatusChange={canAccessPartial ? handleStatusChange : () => {}}
                    />
                  ))
            )}
          </div>
        </PurchaseErrorBoundary>

        {isModalOpen && (
          <PurchaseModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            mode="create"
            suppliers={suppliers}
          />
        )}

        {isPaymentModalOpen && selectedPurchase && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onSubmit={handlePayment}
            purchase={selectedPurchase}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PurchasesPage;