import React from 'react';
import { Package, Edit2, Trash2, AlertTriangle, Clock, User } from 'lucide-react';
import { ProductionResponse } from '../types/owner';

interface ProductionCardProps {
  production: ProductionResponse;
  onEdit?: (production: ProductionResponse) => void;
  onDelete?: (id: number) => void;
}

const ProductionCard: React.FC<ProductionCardProps> = ({ production, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalItems = production.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalWaste = production.items?.reduce((sum, item) => sum + (item.wasteQuantity || 0), 0) || 0;
  const totalCost = production.items?.reduce((sum, item) => sum + (item.productCost * item.quantity), 0) || 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/50 transition-all duration-300 group">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                Production #{production.id}
              </span>
              <p className="text-white/60 text-xs flex items-center mt-0.5">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(production.productionDate)}
              </p>
            </div>
          </div>
          {(onEdit || onDelete) && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={() => onEdit(production)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit2 className="h-4 w-4 text-white" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(production.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm text-slate-400 mb-2">Items Produced</p>
          <div className="space-y-2">
            {production.items?.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2 bg-slate-700/30 rounded-lg"
              >
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-slate-500 mr-2" />
                  <span className="text-sm font-medium text-slate-200">
                    {item.productName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-orange-400">x{item.quantity}</span>
                  {item.wasteQuantity > 0 && (
                    <span className="text-xs text-red-400 ml-2 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-0.5" />
                      {item.wasteQuantity} waste
                    </span>
                  )}
                </div>
              </div>
            ))}
            {production.items?.length > 3 && (
              <p className="text-xs text-slate-500 text-center">
                +{production.items.length - 3} more items
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/50">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{totalItems}</p>
            <p className="text-xs text-slate-500">Items</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-400">{totalWaste}</p>
            <p className="text-xs text-slate-500">Waste</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">
              Rs{totalCost.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Cost</p>
          </div>
        </div>

        {(production.enteredBy || production.notes) && (
          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg space-y-2">
            {production.enteredBy && (
              <div className="flex items-center text-xs text-slate-400">
                <User className="h-3 w-3 mr-1" />
                <span>Entered by:</span>
                <span className="ml-1 font-medium text-slate-300">{production.enteredBy}</span>
                {production.enteredByRole && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                    {production.enteredByRole}
                  </span>
                )}
              </div>
            )}
            {production.notes && (
              <>
                <p className="text-xs text-slate-400 mb-1">Notes</p>
                <p className="text-sm text-slate-300">{production.notes}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionCard;
