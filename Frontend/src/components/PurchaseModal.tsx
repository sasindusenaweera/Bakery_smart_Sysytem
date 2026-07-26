import React, { useState, useEffect } from 'react';
import { X, Package, Plus, Trash2 } from 'lucide-react';
import { PurchaseCreate, SupplierResponse } from '../types/purchase';
import { inventoryService } from '../services/api';

interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  currentStock: number;
  costPerUnit: number;
}

interface PurchaseItem {
  inventoryItemId: number;
  itemName: string;
  quantity: number;
  unitCost: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PurchaseCreate) => Promise<void>;
  mode: 'create' | 'edit';
  suppliers: SupplierResponse[];
}

const initialForm: PurchaseCreate = {
  supplierId: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
  invoiceNumber: '',
  notes: '',
  items: [],
};

export const PurchaseModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, mode, suppliers }) => {
  const [form, setForm] = useState<PurchaseCreate>(initialForm);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInventory();
      setForm(initialForm);
      setPurchaseItems([]);
    }
  }, [isOpen]);

  const loadInventory = async () => {
    try {
      const items = await inventoryService.getAllItems();
      setInventoryItems(items);
    } catch {
      setInventoryItems([]);
    }
  };

  const addItem = () => {
    setPurchaseItems([...purchaseItems, { inventoryItemId: 0, itemName: '', quantity: 1, unitCost: 0 }]);
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: number | string) => {
    const updated = [...purchaseItems];
    if (field === 'inventoryItemId') {
      const item = inventoryItems.find((i) => i.id === Number(value));
      if (item) {
        updated[index] = {
          ...updated[index],
          inventoryItemId: item.id,
          itemName: item.name,
          unitCost: item.costPerUnit || 0,
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPurchaseItems(updated);
  };

  const removeItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplierId) {
      setError('Please select a supplier');
      return;
    }
    if (purchaseItems.length === 0) {
      setError('Please add at least one item');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Format date as yyyy-MM-ddTHH:mm:ss (without timezone for LocalDateTime)
      const formatDateTime = (dateStr?: string): string => {
        if (!dateStr) {
          const now = new Date();
          return now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + 'T' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0');
        }
        const d = new Date(dateStr);
        return d.getFullYear() + '-' +
          String(d.getMonth() + 1).padStart(2, '0') + '-' +
          String(d.getDate()).padStart(2, '0') + 'T' +
          String(d.getHours()).padStart(2, '0') + ':' +
          String(d.getMinutes()).padStart(2, '0') + ':' +
          String(d.getSeconds()).padStart(2, '0');
      };
      
      const data: PurchaseCreate = {
        supplierId: form.supplierId,
        purchaseDate: formatDateTime(form.purchaseDate),
        invoiceNumber: form.invoiceNumber,
        notes: form.notes,
        items: purchaseItems.map((item) => ({
          inventoryItemId: item.inventoryItemId,
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
        })),
      };
      console.log('PurchaseModal submitting:', JSON.stringify(data, null, 2));
      await onSubmit(data);
      onClose();
    } catch (err: any) {
      console.error('PurchaseModal submit error:', err);
      const errData = err.response?.data;
      if (errData?.errors) {
        const errorMessages = Object.entries(errData.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        setError('Validation: ' + errorMessages);
      } else {
        setError(errData?.message || 'Failed to save purchase. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {mode === 'create' ? 'New Purchase Order' : 'Edit Purchase'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Supplier <span className="text-red-400">*</span>
              </label>
              <select
                value={form.supplierId}
                onChange={(e) => setForm({ ...form, supplierId: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-200"
              >
                <option value={0}>Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Purchase Date</label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-200"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Purchase Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>

            <div className="border border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Item</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase w-24">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase w-32">Unit Cost</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase w-32">Subtotal</th>
                    <th className="px-4 py-2 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {purchaseItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No items added. Click "Add Item" to begin.
                      </td>
                    </tr>
                  ) : (
                    purchaseItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <select
                            value={item.inventoryItemId}
                            onChange={(e) => updateItem(index, 'inventoryItemId', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-200 text-sm"
                          >
                            <option value={0}>Select item</option>
                            {inventoryItems.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.name} ({inv.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-200 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-200 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-orange-400">
                          {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(item.quantity * item.unitCost)}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1.5 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-200 placeholder-slate-400 resize-none"
              placeholder="Additional notes..."
            />
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Amount:</span>
              <span className="text-2xl font-bold text-orange-400">
                {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(calculateTotal())}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Purchase' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};