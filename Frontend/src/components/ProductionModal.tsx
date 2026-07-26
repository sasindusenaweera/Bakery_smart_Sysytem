import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ProductionResponse } from '../types/owner';
import { ProductionItemCreate } from '../types/owner';
import { Product } from '../types/product';
import { productService } from '../services/api';

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { productionDate: string; notes: string; items: ProductionItemCreate[] }) => Promise<void>;
  production?: ProductionResponse | null;
  isLoading?: boolean;
}

const ProductionModal: React.FC<ProductionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  production,
  isLoading = false,
}) => {
  const [productionDate, setProductionDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ productId: number; productName: string; quantity: number; wasteQuantity: number }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      if (production) {
        setProductionDate(production.productionDate);
        setNotes(production.notes || '');
        setItems(
          production.items?.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            wasteQuantity: item.wasteQuantity || 0,
          })) || []
        );
      } else {
        setProductionDate(new Date().toISOString().slice(0, 16));
        setNotes('');
        setItems([]);
      }
    }
  }, [isOpen, production]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch {
      setError('Failed to load products');
    }
  };

  const handleAddItem = () => {
    setItems([...items, { productId: 0, productName: '', quantity: 1, wasteQuantity: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === 'productId') {
      const product = products.find(p => p.id === Number(value));
      newItems[index] = { ...newItems[index], productId: Number(value), productName: product?.name || '' };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('At least one item is required');
      return;
    }
    if (items.some(item => !item.productId || item.quantity <= 0)) {
      setError('Please select products and enter valid quantities');
      return;
    }

    setError(null);
    const formattedItems = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      wasteQuantity: item.wasteQuantity || 0,
    }));
    
    await onSave({ productionDate, notes, items: formattedItems });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            {production ? 'Edit Production' : 'New Production'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Production Date
            </label>
            <input
              type="datetime-local"
              value={productionDate}
              onChange={(e) => setProductionDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes about this production..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Production Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-500/30 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.length > 0 && (
                <div className="flex items-center gap-3 px-3 pb-1 text-xs font-medium text-slate-400">
                  <div className="flex-1">Product</div>
                  <div className="w-20 text-center">Produced</div>
                  <div className="w-20 text-center">Waste Items</div>
                  <div className="w-8"></div>
                </div>
              )}
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                    placeholder="Qty"
                    min="1"
                    className="w-20 px-3 py-2 bg-slate-700 border border-slate-600/50 rounded-lg text-white text-center focus:ring-2 focus:ring-orange-500/50 outline-none"
                    required
                  />
                  <input
                    type="number"
                    value={item.wasteQuantity}
                    onChange={(e) => handleItemChange(index, 'wasteQuantity', Number(e.target.value))}
                    placeholder="Waste"
                    min="0"
                    className="w-20 px-3 py-2 bg-slate-700 border border-slate-600/50 rounded-lg text-white text-center focus:ring-2 focus:ring-orange-500/50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No items added. Click "Add Item" to add products.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
            >
              {isLoading ? 'Saving...' : production ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductionModal;
