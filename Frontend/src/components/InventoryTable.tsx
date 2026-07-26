import React from 'react';
import { Edit, Trash2, Package, AlertTriangle, Plus, Minus } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
  onAdjustStock: (id: number, adjustment: number) => void;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatCurrency = (num: number | null): string => {
  if (num === null) return '-';
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(num);
};

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onEdit,
  onDelete,
  onAdjustStock,
}) => {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/50 border-b border-slate-600/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Min. Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Cost/Unit
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {items.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-slate-700/30 transition-colors ${
                  item.isLowStock ? 'bg-red-500/10' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                          <Package className="h-5 w-5 text-orange-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-xs text-slate-400 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-300">{item.unit}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onAdjustStock(item.id, -1)}
                      className="p-1 rounded hover:bg-slate-600 transition-colors"
                      title="Decrease stock"
                    >
                      <Minus className="h-4 w-4 text-slate-400" />
                    </button>
                    <span
                      className={`text-sm font-semibold min-w-[60px] text-center ${
                        item.isLowStock ? 'text-red-400' : 'text-white'
                      }`}
                    >
                      {formatNumber(item.currentStock)}
                    </span>
                    <button
                      onClick={() => onAdjustStock(item.id, 1)}
                      className="p-1 rounded hover:bg-slate-600 transition-colors"
                      title="Increase stock"
                    >
                      <Plus className="h-4 w-4 text-slate-400" />
                    </button>
                    {item.isLowStock && (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-300">
                    {formatNumber(item.minimumStock)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-300">
                    {formatCurrency(item.costPerUnit)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-300">
                    {item.supplier || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-orange-400 hover:bg-orange-500/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;