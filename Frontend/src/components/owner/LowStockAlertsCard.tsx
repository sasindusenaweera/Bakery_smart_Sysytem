import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { LowStockItem } from '../../types/owner';

interface LowStockAlertsCardProps {
  items: LowStockItem[];
}

export const LowStockAlertsCard: React.FC<LowStockAlertsCardProps> = ({ items }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
          LOW STOCK ALERTS
        </h3>
        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
          {items.length} items
        </span>
      </div>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:border-orange-300 hover:bg-orange-100 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500/10 p-2 rounded-lg">
                  <Package className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Min: {item.minimumStock} {item.unit}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">
                  {item.currentStock} {item.unit}
                </p>
                <p className="text-xs text-gray-400">remaining</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">All items are well stocked</p>
        </div>
      )}
    </div>
  );
};

export default LowStockAlertsCard;
