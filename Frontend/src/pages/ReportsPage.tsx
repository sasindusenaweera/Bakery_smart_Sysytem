import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, CreditCard,
  AlertTriangle, RefreshCw,
  Receipt, Package, DollarSign, ShoppingCart,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { reportService, SalesSummaryReport } from '../services/api';
import { ReportPeriod } from '../types/report';
import DashboardLayout from '../components/DashboardLayout';

interface ApiError {
  message?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  variant?: 'default' | 'highlight' | 'success' | 'warning';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, trend, variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700',
    highlight: 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400',
    success: 'bg-gradient-to-br from-green-500 to-green-600 border-green-400',
    warning: 'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400',
  };

  const iconBgStyles = {
    default: 'bg-orange-500/20',
    highlight: 'bg-white/20',
    success: 'bg-white/20',
    warning: 'bg-white/20',
  };

  const textStyles = {
    default: 'text-white',
    highlight: 'text-white',
    success: 'text-white',
    warning: 'text-white',
  };

  return (
    <div className={`rounded-2xl p-6 border ${variantStyles[variant]} shadow-xl`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBgStyles[variant]}`}>
          <Icon className={`h-6 w-6 ${textStyles[variant]}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            trend > 0 ? 'bg-green-500/20 text-green-300' :
            trend < 0 ? 'bg-red-500/20 text-red-300' :
            'bg-slate-500/20 text-slate-300'
          }`}>
            {trend > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> :
             trend < 0 ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-sm text-slate-400 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${textStyles[variant]} mb-1`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};

const ReportsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SalesSummaryReport | null>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [performance, setPerformance] = useState<{
    revenueGrowth: number;
    transactionGrowth: number;
  } | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('WEEK');

  const periodButtons: { value: ReportPeriod; label: string }[] = [
    { value: 'WEEK', label: 'This Week' },
    { value: 'MONTH', label: 'This Month' },
    { value: 'YEAR', label: 'This Year' },
  ];

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [summaryData, productsData, alertsData, performanceData] = await Promise.all([
        reportService.getSalesSummary().catch(() => null),
        reportService.getTopProducts(5).catch(() => []),
        reportService.getLowStockAlerts().catch(() => []),
        reportService.getPerformance(selectedPeriod).catch(() => null)
      ]);

      if (summaryData) setSummary(summaryData);
      if (productsData) setTopProducts(productsData);
      if (alertsData) setLowStockAlerts(alertsData);
      if (performanceData) setPerformance(performanceData);
      
      if (!summaryData && !productsData && !alertsData) {
        setError('Unable to connect to the server. Please check your connection.');
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load report data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-LK').format(num);
  };

  const formatPercent = (num: number) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  const paymentData = summary ? [
    { name: 'Cash', value: summary.cashTotal, color: '#22C55E' },
    { name: 'Card', value: summary.cardTotal, color: '#3B82F6' },
    { name: 'Credit', value: summary.creditTotal, color: '#EAB308' }
  ].filter(item => item.value > 0) : [] as { name: string; value: number; color: string }[];

  const chartData = summary?.dailyBreakdown.slice(-14).map(day => ({
    ...day,
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  })) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your reports...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
              <p className="text-slate-400">Track your bakery performance and insights</p>
            </div>
            <button
              onClick={fetchAllData}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </button>
          </div>

          <div className="flex flex-wrap gap-2 bg-slate-800/50 p-2 rounded-xl w-fit">
            {periodButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setSelectedPeriod(btn.value)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedPeriod === btn.value
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {summary ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(summary.totalRevenue)}
                subtitle={`${formatCurrency(summary.todayRevenue)} today`}
                icon={DollarSign}
                trend={performance?.revenueGrowth}
                variant="highlight"
              />
              <StatCard
                title="Total Transactions"
                value={formatNumber(summary.totalTransactions)}
                subtitle={`${formatNumber(summary.todayTransactions)} today`}
                icon={Receipt}
                trend={performance?.transactionGrowth}
              />
              <StatCard
                title="Avg Order Value"
                value={formatCurrency(summary.averageOrderValue)}
                subtitle="Per transaction"
                icon={ShoppingCart}
              />
              <StatCard
                title="Payment Collection"
                value={formatCurrency(summary.cashTotal + summary.cardTotal)}
                subtitle={`${paymentData.length} payment types`}
                icon={CreditCard}
                variant="success"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Revenue Trend</h3>
                    <p className="text-sm text-slate-400">Daily sales for the last 14 days</p>
                  </div>
                  <div className="bg-slate-700/50 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                  </div>
                </div>
                <div className="h-72">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF6600" stopOpacity={1} />
                            <stop offset="100%" stopColor="#FF6600" stopOpacity={0.3} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11, fill: '#94A3B8' }}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 11, fill: '#94A3B8' }}
                          tickLine={false}
                          tickFormatter={(value) => `LKR ${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                          contentStyle={{ 
                            backgroundColor: '#1E293B', 
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                          labelStyle={{ color: '#94A3B8' }}
                        />
                        <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No revenue data available
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Payment Methods</h3>
                    <p className="text-sm text-slate-400">Distribution by type</p>
                  </div>
                  <div className="bg-slate-700/50 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <div className="h-48">
                  {paymentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {paymentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => formatCurrency(Number(value))}
                          contentStyle={{ 
                            backgroundColor: '#1E293B', 
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No payment data
                    </div>
                  )}
                </div>
                <div className="space-y-3 mt-4">
                  {paymentData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {((item.value / (summary.cashTotal + summary.cardTotal + summary.creditTotal)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Top Selling Products</h3>
                    <p className="text-sm text-slate-400">Best performers this {selectedPeriod.toLowerCase()}</p>
                  </div>
                  <div className="bg-slate-700/50 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
                {topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {topProducts.map((product, index) => (
                      <div key={product.productId || index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                            index === 1 ? 'bg-slate-400/20 text-slate-300' :
                            index === 2 ? 'bg-orange-600/20 text-orange-400' :
                            'bg-slate-600/20 text-slate-400'
                          }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-white">{product.productName}</p>
                            <p className="text-xs text-slate-400">{formatNumber(product.totalQuantitySold)} sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-orange-400">{formatCurrency(product.totalRevenue)}</p>
                          <p className="text-xs text-slate-400">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No product data available</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Low Stock Alerts</h3>
                    <p className="text-sm text-slate-400">Items that need attention</p>
                  </div>
                  <div className="bg-slate-700/50 p-2 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                </div>
                {lowStockAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {lowStockAlerts.slice(0, 5).map((alert, index) => (
                      <div key={alert.itemId || index} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-500/20 p-2 rounded-lg">
                            <ShoppingCart className="h-4 w-4 text-red-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{alert.itemName}</p>
                            <p className="text-xs text-red-400/70">
                              {alert.isOutOfStock ? 'Out of stock' : `Only ${alert.currentStock} left`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-400">{alert.currentStock} {alert.unit}</p>
                          <p className="text-xs text-slate-400">Min: {alert.minimumStock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                    <p className="font-medium text-green-400 mb-1">All stocked up!</p>
                    <p className="text-sm">No low stock items at the moment</p>
                  </div>
                )}
              </div>
            </div>

            {performance && (
              <div className="mt-8 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${
                    performance.revenueGrowth >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {performance.revenueGrowth >= 0 ? (
                      <TrendingUp className={`h-8 w-8 ${
                        performance.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'
                      }`} />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Performance Summary</h3>
                    <p className="text-slate-400">
                      Your revenue has {performance.revenueGrowth >= 0 ? 'increased' : 'decreased'} by{' '}
                      <span className={`font-bold ${
                        performance.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatPercent(performance.revenueGrowth)}
                      </span>{' '}
                      compared to the previous period.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
            <div className="bg-slate-700/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Reports Data</h3>
            <p className="text-slate-400 mb-6">Start making sales to see your reports and analytics</p>
            <button
              onClick={fetchAllData}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
