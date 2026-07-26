import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, AlertTriangle, PackageX } from 'lucide-react';
import { inventoryService } from '../services/api';
import { InventoryItem, CreateInventoryRequest } from '../types/inventory';
import InventoryTable from '../components/InventoryTable';
import InventoryModal from '../components/InventoryModal';
import DashboardLayout from '../components/DashboardLayout';

const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let data: InventoryItem[];

      if (showLowStock) {
        data = await inventoryService.getLowStockItems();
      } else if (searchQuery) {
        data = await inventoryService.searchItems(searchQuery);
      } else {
        data = await inventoryService.getAllItems();
      }

      setItems(data);
    } catch (err) {
      setError('Failed to load inventory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchQuery, showLowStock]);

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (itemData: CreateInventoryRequest, imageFile?: File) => {
    try {
      setIsSaving(true);
      if (editingItem) {
        await inventoryService.updateItem(editingItem.id, itemData, imageFile);
      } else {
        await inventoryService.createItem(itemData, imageFile);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      setError('Failed to save inventory item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.deleteItem(id);
        fetchItems();
      } catch (err) {
        setError('Failed to delete item. Please try again.');
      }
    }
  };

  const handleAdjustStock = async (id: number, adjustment: number) => {
    try {
      await inventoryService.adjustStock(id, adjustment);
      fetchItems();
    } catch (err) {
      setError('Failed to adjust stock. Please try again.');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setShowLowStock(false);
  };

  const lowStockCount = items.filter((item) => item.isLowStock).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Inventory</h1>
              <p className="text-slate-400 text-sm">Manage your inventory items</p>
            </div>
          </div>
          <button
            onClick={handleAddItem}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Item
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <p className="text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`flex items-center px-4 py-2.5 rounded-lg transition-all ${
                showLowStock
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700'
              }`}
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Low Stock ({lowStockCount})
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading inventory...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
            <PackageX className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">No inventory items found</p>
            <p className="text-slate-500 text-sm">
              {searchQuery || showLowStock
                ? 'Try adjusting your filters'
                : 'Add your first inventory item to get started'}
            </p>
            {(searchQuery || showLowStock) && (
              <button onClick={clearFilters} className="mt-4 text-orange-400 hover:underline font-medium">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
            <InventoryTable
              items={items}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onAdjustStock={handleAdjustStock}
            />
          </div>
        )}

        <InventoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItem}
          item={editingItem}
          isLoading={isSaving}
        />
      </div>
    </DashboardLayout>
  );
};

export default InventoryPage;
