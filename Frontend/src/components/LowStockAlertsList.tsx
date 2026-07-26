import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { LowStockAlert } from '../types/report';

interface LowStockAlertsListProps {
  alerts: LowStockAlert[];
  maxItems?: number;
}

const LowStockAlertsList: React.FC<LowStockAlertsListProps> = ({
  alerts,
  maxItems = 5
}) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
            LOW STOCK ALERTS
          </h3>
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-gray-500 font-medium">All items are well stocked</p>
          <p className="text-sm text-gray-400 mt-1">No inventory alerts at this time</p>
        </div>
      </div>
    );
  }

  const displayedAlerts = alerts.slice(0, maxItems);
  const remainingCount = alerts.length - maxItems;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
            LOW STOCK ALERTS
          </h3>
          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
            {alerts.length}
          </span>
        </div>
        <AlertTriangle className="h-5 w-5 text-red-500" />
      </div>
      <div className="space-y-3">
        {displayedAlerts.map((alert) => (
          <div
            key={alert.itemId}
            className={`flex items-center justify-between p-4 rounded-lg transition-all hover:scale-[1.01] ${
              alert.isOutOfStock
                ? 'bg-red-50 border border-red-200 hover:bg-red-100'
                : 'bg-orange-50 border border-orange-200 hover:bg-orange-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                alert.isOutOfStock ? 'bg-red-100' : 'bg-orange-100'
              }`}>
                <AlertTriangle className={`h-5 w-5 ${
                  alert.isOutOfStock ? 'text-red-500' : 'text-orange-500'
                }`} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{alert.itemName}</p>
                <p className="text-sm text-gray-500">
                  {alert.supplier || 'No supplier'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold text-lg ${
                alert.isOutOfStock ? 'text-red-600' : 'text-orange-600'
              }`}>
                {alert.currentStock} {alert.unit}
              </p>
              <p className="text-xs text-gray-400">
                Min: {alert.minimumStock} {alert.unit}
              </p>
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-center pt-2">
            <p className="text-sm text-gray-500">
              +{remainingCount} more items need attention
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockAlertsList;
