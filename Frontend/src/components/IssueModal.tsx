import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { IssueResponse } from '../types/issue';
import { inventoryService } from '../services/api';
import { InventoryItem } from '../types/inventory';

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { issueDate: string; issuedTo: string; notes: string; items: { inventoryItemId: number; quantity: number }[] }) => Promise<void>;
  issue?: IssueResponse | null;
  isLoading?: boolean;
}

const ISSUED_TO_OPTIONS = ['Bakery', 'Shop', 'Production', 'Other'];

const IssueModal: React.FC<IssueModalProps> = ({
  isOpen,
  onClose,
  onSave,
  issue,
  isLoading = false,
}) => {
  const [issueDate, setIssueDate] = useState('');
  const [issuedTo, setIssuedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ inventoryItemId: number; itemName: string; quantity: number; unit: string }[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchInventoryItems();
      if (issue) {
        setIssueDate(issue.issueDate);
        setIssuedTo(issue.issuedTo);
        setNotes(issue.notes || '');
        setItems(
          issue.items?.map(item => ({
            inventoryItemId: item.inventoryItemId,
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
          })) || []
        );
      } else {
        // Set default date for datetime-local input (YYYY-MM-DDTHH:mm)
        const now = new Date();
        const formatted = now.getFullYear() + '-' +
          String(now.getMonth() + 1).padStart(2, '0') + '-' +
          String(now.getDate()).padStart(2, '0') + 'T' +
          String(now.getHours()).padStart(2, '0') + ':' +
          String(now.getMinutes()).padStart(2, '0');
        setIssueDate(formatted);
        setIssuedTo('');
        setNotes('');
        setItems([]);
      }
    }
  }, [isOpen, issue]);

  const fetchInventoryItems = async () => {
    try {
      const data = await inventoryService.getAllItems();
      setInventoryItems(data);
    } catch {
      setError('Failed to load inventory items');
    }
  };

  const handleAddItem = () => {
    setItems([...items, { inventoryItemId: 0, itemName: '', quantity: 1, unit: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === 'inventoryItemId') {
      const invItem = inventoryItems.find(i => i.id === Number(value));
      newItems[index] = { 
        ...newItems[index], 
        inventoryItemId: Number(value), 
        itemName: invItem?.name || '',
        unit: invItem?.unit || ''
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuedTo || items.length === 0) {
      setError('Please select recipient and add at least one item');
      return;
    }
    if (items.some(item => !item.inventoryItemId || item.quantity <= 0)) {
      setError('Please select inventory items and enter valid quantities');
      return;
    }

    try {
      // Convert datetime-local format to ISO for backend
      const isoDate = new Date(issueDate).toISOString();
      const formattedItems = items.map(item => ({
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
      }));
      console.log('Submitting issue:', { issueDate: isoDate, issuedTo, notes, items: formattedItems });
      await onSave({ issueDate: isoDate, issuedTo, notes, items: formattedItems });
      onClose();
    } catch (err) {
      setError('Failed to save issue');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            {issue ? 'Edit Issue' : 'New Issue'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Issue Date
              </label>
              <input
                type="datetime-local"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Issued To
              </label>
              <select
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all"
                required
              >
                <option value="">Select Recipient</option>
                {ISSUED_TO_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add any notes..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Issue Items
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
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <select
                    value={item.inventoryItemId}
                    onChange={(e) => handleItemChange(index, 'inventoryItemId', e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                    required
                  >
                    <option value="">Select Item</option>
                    {inventoryItems.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} ({inv.currentStock} {inv.unit} available)
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      placeholder="Qty"
                      min="0.01"
                      step="0.01"
                      className="w-24 px-3 py-2 bg-slate-700 border border-slate-600/50 rounded-lg text-white text-center focus:ring-2 focus:ring-orange-500/50 outline-none"
                      required
                    />
                    <span className="text-slate-400 text-sm">{item.unit}</span>
                  </div>
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
                  No items added. Click "Add Item" to add inventory items.
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
              {isLoading ? 'Saving...' : issue ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueModal;
