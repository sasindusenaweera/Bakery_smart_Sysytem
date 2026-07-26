import React, { useState, useEffect } from 'react';
import { Receipt, DollarSign, CreditCard, Banknote, Calendar, TrendingUp } from 'lucide-react';
import { salesService } from '../services/api';
import { Sale, SalesSummary } from '../types/sales';
import DashboardLayout from '../components/DashboardLayout';

const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'today' | 'all'>('today');

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [salesData, summaryData] = await Promise.all([
        view === 'today' ? salesService.getTodaySales() : salesService.getAllSales(),
        salesService.getSalesSummary()
      ]);
      setSales(salesData);
      setSummary(summaryData);
    } catch (err) {
      setError('Failed to load sales data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-LK', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sales</h1>
              <p className="text-slate-400 text-sm">View sales history</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setView('today')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'today' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'all' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300">{error}</div>
        )}

        {!isLoading && summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-400" />
                </div>
              </div>
              <p className="text-sm text-slate-400">Today's Sales</p>
              <p className="text-2xl font-bold text-white">{summary.todaySales}</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
              <p className="text-sm text-slate-400">Today's Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.todayRevenue)}</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Banknote className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <p className="text-sm text-slate-400">Cash Total</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.cashTotal)}</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <p className="text-sm text-slate-400">Card Total</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.cardTotal)}</p>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h3 className="font-semibold text-white">
              {view === 'today' ? "Today's Transactions" : 'All Transactions'}
            </h3>
          </div>

          {isLoading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-700/50 rounded"></div>
                ))}
              </div>
            </div>
          ) : sales.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No sales found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {sales.map(sale => (
                <div key={sale.id} className="p-6 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-semibold text-white">#{sale.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          sale.paymentMethod === 'CASH' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          sale.paymentMethod === 'CARD' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {sale.paymentMethod}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-slate-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(sale.saleDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-400">{formatCurrency(sale.totalAmount)}</p>
                      <p className="text-sm text-slate-400">{sale.items.length} items</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalesPage;
