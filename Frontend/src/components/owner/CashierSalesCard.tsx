import React from 'react';
import { Users, User } from 'lucide-react';
import { CashierSalesSummary } from '../../types/owner';

interface CashierSalesCardProps {
  sales: CashierSalesSummary[];
  formatCurrency: (n: number) => string;
}

export const CashierSalesCard: React.FC<CashierSalesCardProps> = ({
  sales,
  formatCurrency,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id: number) => {
    const colors = [
      'bg-[#FF6600]',
      'bg-[#00008B]',
      'bg-green-600',
      'bg-purple-600',
      'bg-pink-600',
      'bg-teal-600',
    ];
    return colors[id % colors.length];
  };

  const totalSales = sales.reduce((sum, s) => sum + s.totalSales, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide flex items-center">
          <Users className="h-5 w-5 mr-2 text-[#FF6600]" />
          TODAY&apos;S SALES BY CASHIER
        </h3>
        <span className="px-2 py-1 bg-[#FF6600]/10 text-[#FF6600] text-xs font-bold rounded-full">
          {sales.length} cashiers
        </span>
      </div>
      {sales.length > 0 ? (
        <div className="space-y-3">
          {sales.map((sale) => (
            <div
              key={sale.cashierId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#FF6600]/30 hover:bg-gray-100/50 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`h-10 w-10 rounded-full ${getAvatarColor(
                    sale.cashierId
                  )} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {sale.cashierName ? getInitials(sale.cashierName) : <User className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {sale.cashierName || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {sale.transactionCount} transactions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#FF6600]">
                  {formatCurrency(sale.totalSales)}
                </p>
                {totalSales > 0 && (
                  <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-[#FF6600] h-1.5 rounded-full"
                      style={{
                        width: `${Math.round((sale.totalSales / totalSales) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No sales data for today</p>
        </div>
      )}
    </div>
  );
};

export default CashierSalesCard;
