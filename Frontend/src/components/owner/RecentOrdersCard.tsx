import React from 'react';
import { ShoppingBag, Clock } from 'lucide-react';
import { OrderSummary } from '../../types/owner';

interface RecentOrdersCardProps {
  orders: OrderSummary[];
  formatCurrency: (n: number) => string;
}

export const RecentOrdersCard: React.FC<RecentOrdersCardProps> = ({
  orders,
  formatCurrency,
}) => {
  const getStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case 'READY':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2 text-[#00008B]" />
          RECENT ORDERS
        </h3>
        <span className="px-2 py-1 bg-[#00008B]/10 text-[#00008B] text-xs font-bold rounded-full">
          {orders.length} orders
        </span>
      </div>
      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#00008B]/30 hover:bg-gray-100/50 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-[#00008B]/10 p-2 rounded-lg">
                  <ShoppingBag className="h-4 w-4 text-[#00008B]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{order.customerName}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(order.orderDate)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full border ${getStatusStyles(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No recent orders</p>
        </div>
      )}
    </div>
  );
};

export default RecentOrdersCard;
