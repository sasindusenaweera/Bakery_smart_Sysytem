import React from 'react';
import { Package, Truck, Eye, DollarSign, Trash2, Clock } from 'lucide-react';
import { PurchaseResponse, PurchaseStatus } from '../types/purchase';

interface Props {
  purchase: PurchaseResponse;
  onView?: (purchase: PurchaseResponse) => void;
  onPayment: (purchase: PurchaseResponse) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: PurchaseStatus) => void;
}

const formatCurrency = (amount?: number): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusConfig: Record<PurchaseStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', label: 'Pending' },
  RECEIVED: { bg: 'bg-blue-900/30', text: 'text-blue-400', label: 'Received' },
  PAID: { bg: 'bg-green-900/30', text: 'text-green-400', label: 'Paid' },
  CANCELLED: { bg: 'bg-slate-700', text: 'text-slate-400', label: 'Cancelled' },
};

export const PurchaseCard: React.FC<Props> = ({ purchase, onView, onPayment, onDelete, onStatusChange }) => {
  const status = statusConfig[purchase.status] || statusConfig.PENDING;
  const hasPending = (purchase.pendingAmount || 0) > 0 && purchase.status !== 'PAID' && purchase.status !== 'CANCELLED';

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-bold text-white">#{purchase.id}</span>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-semibold text-white flex items-center">
              <Truck className="h-4 w-4 mr-2 text-orange-400" />
              {purchase.supplier?.name || 'Unknown Supplier'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              <Clock className="h-3 w-3 inline mr-1" />
              {formatDate(purchase.purchaseDate)} at {formatTime(purchase.purchaseDate)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-xl font-bold text-orange-400">
              {formatCurrency(purchase.totalAmount)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Paid</p>
            <p className="font-bold text-green-400">{formatCurrency(purchase.paidAmount)}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Pending</p>
            <p className={`font-bold ${hasPending ? 'text-red-400' : 'text-slate-400'}`}>
              {formatCurrency(purchase.pendingAmount)}
            </p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Items</p>
            <p className="font-bold text-white">{purchase.items?.length || 0}</p>
          </div>
        </div>

        {purchase.notes && (
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">{purchase.notes}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {purchase.status === 'PENDING' && (
            <button
              onClick={() => onStatusChange(purchase.id, 'RECEIVED')}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition-all duration-200"
            >
              Mark Received
            </button>
          )}
          {hasPending && (
            <button
              onClick={() => onPayment(purchase)}
              className="px-3 py-1.5 text-xs font-semibold bg-green-900/30 text-green-400 rounded-lg hover:bg-green-900/50 transition-all duration-200 flex items-center"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Record Payment
            </button>
          )}
          {purchase.status !== 'CANCELLED' && (
            <button
              onClick={() => onStatusChange(purchase.id, 'CANCELLED')}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all duration-200"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="flex space-x-2 pt-3 border-t border-slate-700">
          <button
            onClick={() => onView?.(purchase)}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-all duration-200 active:scale-95 flex items-center justify-center"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            View
          </button>
          <button
            onClick={() => onDelete(purchase.id)}
            className="px-3 py-2.5 rounded-lg text-sm font-semibold bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-all duration-200 active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
