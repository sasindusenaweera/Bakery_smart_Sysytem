import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  ShoppingBag, DollarSign, Clock, ArrowRight,
  CreditCard, Receipt, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { salesService, reportService, productService } from '../../services/api';

const CashierDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [recentTransactions, setRecentTransactions] = useState<{ id: string; time: string; amount: number; items: number; payment: string }[]>([]);
  const [quickProducts, setQuickProducts] = useState<{ name: string; price: number; sold: number }[]>([]);
  const [stats, setStats] = useState({
    todaySalesTotal: 0,
    transactions: 0,
    avgOrder: 0,
    thisHour: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        
        const [salesSummary, topProducts, products] = await Promise.all([
          reportService.getSalesSummary().catch(() => null),
          reportService.getTopProducts(4).catch(() => []),
          productService.getAllProducts().catch(() => []),
        ]);

        setStats({
          todaySalesTotal: salesSummary?.todayRevenue || 0,
          transactions: salesSummary?.todayTransactions || 0,
          avgOrder: salesSummary?.averageOrderValue || 0,
          thisHour: 0,
        });

        setQuickProducts(topProducts.slice(0, 4).map(p => ({
          name: p.productName,
          price: p.averagePrice,
          sold: p.totalQuantitySold,
        })));

        const salesList = Array.isArray(products) ? products : [];
        if (salesList.length > 0 && !quickProducts.length) {
          setQuickProducts(salesList.slice(0, 4).map((p: { name: string; price: number }) => ({
            name: p.name,
            price: p.price,
            sold: 0,
          })));
        }

        try {
          const allSales = await salesService.getAllSales();
          const sales = Array.isArray(allSales) ? allSales.slice(0, 5) : [];
          setRecentTransactions(
            sales.map((s: { id: number | string; totalAmount?: number; paymentMethod?: string; createdAt?: string }, i) => ({
              id: `TXN-${String(s.id).padStart(4, '0')}`,
              time: `${(i + 1) * 5} mins ago`,
              amount: s.totalAmount || 0,
              items: 1,
              payment: s.paymentMethod || 'Cash',
            }))
          );
        } catch {
          setRecentTransactions([]);
        }

      } catch (err) {
        console.error('Failed to fetch cashier data:', err);
        setError('Failed to load dashboard data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const statsCards = [
    { title: "Today's Sales", value: `Rs${stats.todaySalesTotal.toLocaleString()}`, icon: DollarSign, gradient: 'from-emerald-500 to-teal-600' },
    { title: 'Transactions', value: String(stats.transactions), icon: Receipt, gradient: 'from-blue-500 to-indigo-600' },
    { title: 'Avg. Order', value: `Rs${Math.round(stats.avgOrder)}`, icon: ShoppingBag, gradient: 'from-purple-500 to-pink-600' },
    { title: 'This Hour', value: `Rs${stats.thisHour.toLocaleString()}`, icon: Clock, gradient: 'from-orange-500 to-red-600' },
  ];

  const quickActions = [
    { name: 'New Sale', icon: ShoppingBag, path: '/pos', color: 'from-orange-500 to-orange-600' },
    { name: 'View Orders', icon: Receipt, path: '/orders', color: 'from-blue-500 to-blue-600' },
    { name: 'Credits', icon: CreditCard, path: '/credits', color: 'from-purple-500 to-purple-600' },
    { name: 'Sales Report', icon: DollarSign, path: '/sales', color: 'from-green-500 to-green-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Cashier Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Welcome, {user?.username}. Ready for today's sales?
            </p>
          </div>
          <button
            onClick={() => navigate('/pos')}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/20 transition-all"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Start New Sale</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className={`p-4 bg-gradient-to-br ${stat.gradient}`}>
                  <Icon className="h-5 w-5 text-white/80" />
                </div>
                <div className="p-4">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-slate-400 text-sm">{stat.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className={`bg-gradient-to-br ${action.color} rounded-xl p-4 text-white transition-all hover:scale-[1.02] hover:shadow-lg flex flex-col items-center space-y-2`}
              >
                <Icon className="h-6 w-6" />
                <span className="font-medium text-sm">{action.name}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Products */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Popular Items</h3>
            <div className="space-y-3">
              {quickProducts.length > 0 ? (
                quickProducts.map((product, index) => (
                  <button
                    key={index}
                    onClick={() => navigate('/pos')}
                    className="w-full flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <span className="text-orange-400 font-bold">{index + 1}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-slate-400 text-sm">Rs{product.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-medium">{product.sold}</p>
                      <p className="text-slate-500 text-xs">sold</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">No products available</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <button 
              onClick={() => navigate('/sales')}
              className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center"
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto">
            {recentTransactions.length > 0 ? (
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {recentTransactions.map((txn, index) => (
                    <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-orange-400">{txn.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{txn.time}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{txn.items} items</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          txn.payment === 'Cash' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {txn.payment}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-bold">Rs{txn.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-400 text-center py-8">No transactions found</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CashierDashboard;
