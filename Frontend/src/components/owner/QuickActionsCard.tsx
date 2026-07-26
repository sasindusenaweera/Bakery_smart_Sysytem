import React from 'react';
import { Plus, Package, ShoppingBag, TrendingUp, DollarSign, Truck, ChefHat } from 'lucide-react';

interface QuickActionsCardProps {
  onNavigate: (path: string) => void;
  stats: {
    totalExpenses: number;
    creditDue: number;
    supplierDues: number;
    cashOnHand: number;
  };
  formatCurrency: (n: number) => string;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onNavigate,
  stats,
  formatCurrency,
}) => {
  const actions = [
    { label: 'POS SALE', icon: Plus, color: 'bg-[#FF6600] hover:bg-orange-700', path: '/pos' },
    { label: 'INVENTORY', icon: Package, color: 'bg-[#00008B] hover:bg-blue-900', path: '/inventory' },
    { label: 'ORDERS', icon: ShoppingBag, color: 'bg-green-600 hover:bg-green-700', path: '/orders' },
    { label: 'PRODUCTION', icon: ChefHat, color: 'bg-purple-600 hover:bg-purple-700', path: '/production' },
    { label: 'SUPPLIERS', icon: Truck, color: 'bg-teal-600 hover:bg-teal-700', path: '/suppliers' },
    { label: 'REPORTS', icon: TrendingUp, color: 'bg-gray-600 hover:bg-gray-700', path: '/reports' },
  ];

  const financialLinks = [
    { label: 'Cash on Hand', value: stats.cashOnHand, color: 'text-green-600', path: '/sales' },
    { label: 'Expenses', value: stats.totalExpenses, color: 'text-red-600', path: '/expenses' },
    { label: 'Credit Due', value: stats.creditDue, color: 'text-orange-600', path: '/credits' },
    { label: 'Supplier Dues', value: stats.supplierDues, color: 'text-red-600', path: '/purchases' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center">
        <DollarSign className="h-5 w-5 mr-2 text-[#FF6600]" />
        QUICK ACTIONS
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => onNavigate(action.path)}
            className={`flex items-center justify-center px-3 py-3 text-white rounded-lg transition-all duration-200 font-bold uppercase text-xs hover:scale-105 active:scale-95 ${action.color}`}
          >
            <action.icon className="h-4 w-4 mr-1" />
            {action.label}
          </button>
        ))}
      </div>
      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center">
          <DollarSign className="h-4 w-4 mr-1" />
          Financial Summary (Click to view)
        </h4>
        <div className="space-y-1">
          {financialLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => onNavigate(link.path)}
              className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-gray-600 text-sm">{link.label}:</span>
              <span className={`font-bold text-sm ${link.color}`}>{formatCurrency(link.value)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsCard;
