import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { PaymentRecord, PurchaseResponse } from '../types/purchase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentRecord) => Promise<void>;
  purchase: PurchaseResponse | null;
}

export const PaymentModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, purchase }) => {
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }
    if (amount > (purchase?.pendingAmount || 0)) {
      setError('Payment amount cannot exceed pending amount');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({ amount, paymentDate: new Date().toISOString(), notes });
      onClose();
    } catch {
      setError('Failed to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !purchase) return null;

  const pendingAmount = purchase.pendingAmount || 0;
  const formattedPending = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(pendingAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#00008B] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">Record Payment</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Purchase ID:</span>
              <span className="font-bold">#{purchase.id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Supplier:</span>
              <span className="font-medium">{purchase.supplier?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-[#FF6600]">
                {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(purchase.totalAmount)}
              </span>
            </div>
            <div className="border-t border-gray-200 my-3 pt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Amount:</span>
                <span className="font-bold text-red-600">{formattedPending}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <input
                type="number"
                min="0.01"
                max={pendingAmount}
                step="0.01"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Maximum: {formattedPending}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] resize-none"
              placeholder="Payment reference or notes..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
