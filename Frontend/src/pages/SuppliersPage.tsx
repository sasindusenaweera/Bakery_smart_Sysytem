import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Search, Plus, Truck } from 'lucide-react';
import { supplierService } from '../services/purchaseService';
import { SupplierResponse, SupplierCreate, SupplierUpdate } from '../types/purchase';
import { SupplierModal } from '../components/SupplierModal';
import { SupplierCard } from '../components/SupplierCard';
import { SupplierCardSkeleton, StatCardSkeleton } from '../components/PurchaseSkeleton';
import { PurchaseErrorBoundary } from '../components/PurchaseErrorBoundary';
import DashboardLayout from '../components/DashboardLayout';

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActive, setShowActive] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierResponse | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const fetchSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch {
      setError('Failed to load suppliers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleCreate = () => {
    setEditingSupplier(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (supplier: SupplierResponse) => {
    setEditingSupplier(supplier);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: SupplierCreate | SupplierUpdate) => {
    if (modalMode === 'create') {
      await supplierService.create(data as SupplierCreate);
    } else if (editingSupplier) {
      await supplierService.update(editingSupplier.id, data as SupplierUpdate);
    }
    fetchSuppliers();
  };

  const handleToggleStatus = async (id: number, active: boolean) => {
    try {
      await supplierService.setActive(id, active);
      fetchSuppliers();
    } catch {
      setError('Failed to update supplier status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await supplierService.delete(id);
      fetchSuppliers();
    } catch {
      setError('Failed to delete supplier');
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      !searchQuery ||
      supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActive = showActive === null || supplier.active === showActive;
    return matchesSearch && matchesActive;
  });

  const activeCount = suppliers.filter((s) => s.active).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Suppliers</h1>
              <p className="text-slate-400 text-sm">Manage suppliers</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchSuppliers}
              className="flex items-center px-4 py-2 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded-lg hover:bg-slate-600/50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-400">Total Suppliers</p>
                    <p className="text-2xl font-bold text-white">{suppliers.length}</p>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <Truck className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-400">Active Suppliers</p>
                    <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
                  </div>
                  <div className="bg-emerald-500/20 p-3 rounded-lg">
                    <Truck className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suppliers by name or contact..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-orange-500/50 text-slate-200 placeholder-slate-400"
            />
          </div>
          <select
            value={showActive === null ? 'ALL' : showActive ? 'ACTIVE' : 'INACTIVE'}
            onChange={(e) => setShowActive(e.target.value === 'ALL' ? null : e.target.value === 'ACTIVE')}
            className="px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-orange-500/50 text-slate-200"
          >
            <option value="ALL">All Suppliers</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        <PurchaseErrorBoundary fallbackMessage="Failed to load supplier cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SupplierCardSkeleton key={i} />)
            ) : filteredSuppliers.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <Truck className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-2">No suppliers found</p>
                <button
                  onClick={handleCreate}
                  className="text-orange-400 hover:text-orange-300 font-medium"
                >
                  Add your first supplier
                </button>
              </div>
            ) : (
              filteredSuppliers.map((supplier) => (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </PurchaseErrorBoundary>
      </div>

      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        supplier={editingSupplier}
        mode={modalMode}
      />
    </DashboardLayout>
  );
};

export default SuppliersPage;
