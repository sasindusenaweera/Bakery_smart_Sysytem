import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users, Package, ShoppingCart, DollarSign, 
  TrendingUp, TrendingDown, Plus, ArrowRight,
  ShoppingBag, ClipboardList, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { userService, productService, salesService, reportService, inventoryService } from '../../services/api';

interface LowStockItem {
  id: number;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

interface DashboardStats {
  totalSales: number;
  salesChange: number;
  todayOrders: number;
  ordersChange: number;
  totalProducts: number;
  productsChange: number;
  totalCustomers: number;
  customersChange: number;
}

interface DailySales {
  date: string;
  revenue: number;
  transactionCount: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    salesChange: 0,
    todayOrders: 0,
    ordersChange: 0,
    totalProducts: 0,
    productsChange: 0,
    totalCustomers: 0,
    customersChange: 0,
  });
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; sold: number; revenue: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<{ id: string; customer: string; items: number; total: number; status: string }[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null);
        
        const [products, users, salesSummary] = await Promise.all([
          productService.getAllProducts().catch(() => []),
          userService.getAllUsers().catch(() => []),
          reportService.getSalesSummary().catch(() => null),
        ]);

        const productList: any[] = Array.isArray(products) ? products : [];
        const userList = Array.isArray(users) ? users : [];

        setStats({
          totalSales: salesSummary?.totalRevenue || 0,
          salesChange: 0,
          todayOrders: salesSummary?.todayTransactions || 0,
          ordersChange: 0,
          totalProducts: productList.length,
          productsChange: 0,
          totalCustomers: userList.length,
          customersChange: 0,
        });

        if (salesSummary?.dailyBreakdown) {
          setDailySales(salesSummary.dailyBreakdown.map(d => ({
            date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: d.revenue,
            transactionCount: d.transactionCount,
          })));
        } else {
          setDailySales([
            { date: 'Mon', revenue: 0, transactionCount: 0 },
            { date: 'Tue', revenue: 0, transactionCount: 0 },
            { date: 'Wed', revenue: 0, transactionCount: 0 },
            { date: 'Thu', revenue: 0, transactionCount: 0 },
            { date: 'Fri', revenue: 0, transactionCount: 0 },
            { date: 'Sat', revenue: 0, transactionCount: 0 },
            { date: 'Sun', revenue: 0, transactionCount: 0 },
          ]);
        }

        try {
          const topProdData = await reportService.getTopProducts(5);
          setTopProducts(topProdData.map(p => ({
            name: p.productName,
            sold: p.totalQuantitySold,
            revenue: p.totalRevenue,
          })));
        } catch {
          setTopProducts([]);
        }

        try {
          const allSales = await salesService.getAllSales();
          const salesList = Array.isArray(allSales) ? allSales : [];
          setRecentOrders(
            salesList.slice(0, 5).map((s: { id: number | string; customerName?: string; cashierName?: string; totalAmount?: number; status?: string }) => ({
              id: `ORD-${String(s.id).padStart(3, '0')}`,
              customer: s.customerName || s.cashierName || 'Walk-in',
              items: 1,
              total: s.totalAmount || 0,
              status: s.status || 'Completed',
            }))
          );
        } catch {
          setRecentOrders([]);
        }

        try {
          const inventoryItems = await inventoryService.getAllItems();
          const items = Array.isArray(inventoryItems) ? inventoryItems : [];
          const lowStock = items
            .filter((item: { currentStock?: number; minimumStock?: number }) => (item.currentStock || 0) <= (item.minimumStock || 0))
            .map((item: { id: number; name?: string; itemName?: string; currentStock?: number; minimumStock?: number; unit?: string }) => ({
              id: item.id,
              name: item.name || item.itemName || 'Unknown',
              currentStock: item.currentStock || 0,
              minStock: item.minimumStock || 0,
              unit: item.unit || 'units',
            }));
          setLowStockItems(lowStock);
        } catch {
          setLowStockItems([]);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    { 
      title: 'Total Sales', 
      value: `Rs${stats.totalSales.toLocaleString()}`, 
      change: stats.salesChange,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600'
    },
    { 
      title: 'Orders Today', 
      value: String(stats.todayOrders), 
      change: stats.ordersChange,
      icon: ShoppingBag,
      gradient: 'from-blue-500 to-indigo-600'
    },
    { 
      title: 'Products', 
      value: String(stats.totalProducts), 
      change: stats.productsChange,
      icon: Package,
      gradient: 'from-purple-500 to-pink-600'
    },
    { 
      title: 'Customers', 
      value: String(stats.totalCustomers), 
      change: stats.customersChange,
      icon: Users,
      gradient: 'from-orange-500 to-red-600'
    },
  ];

  const quickActions = [
    { name: 'New Sale', icon: ShoppingBag, path: '/pos', color: 'from-orange-500 to-orange-600' },
    { name: 'Add Product', icon: Plus, path: '/products', color: 'from-blue-500 to-blue-600' },
    { name: 'New Order', icon: ClipboardList, path: '/orders', color: 'from-purple-500 to-purple-600' },
    { name: 'Inventory', icon: ShoppingCart, path: '/inventory', color: 'from-green-500 to-green-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome back, {user?.username}
            </h1>
            <p className="text-slate-400 mt-1">
              Here's what's happening with your bakery today
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/10 group"
              >
                <div className={`p-4 bg-gradient-to-br ${stat.gradient}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                    <Icon className="h-5 w-5 text-white/60" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                  <div className={`flex items-center mt-2 ${stat.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">{Math.abs(stat.change)}%</span>
                    <span className="text-slate-500 text-sm ml-1">vs last week</span>
                  </div>
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
                className={`
                  group relative overflow-hidden
                  bg-gradient-to-br ${action.color}
                  rounded-xl p-4 text-white
                  transition-all duration-300 
                  hover:shadow-lg hover:scale-[1.02]
                  flex flex-col items-center space-y-2
                `}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Icon className="h-6 w-6 relative z-10" />
                <span className="font-medium text-sm relative z-10">{action.name}</span>
              </button>
            );
          })}
        </div>

        {/* Stock Updates - Low */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-300">
                <span className="font-semibold">{lowStockItems.length} item(s)</span> are running low on stock. Please restock soon.
              </p>
            </div>
            <button 
              onClick={() => navigate('/inventory')}
              className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center"
            >
              Restock Now <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Stock Updates - Low</h3>
              {lowStockItems.length > 0 && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                  {lowStockItems.length} items
                </span>
              )}
            </div>
            <button 
              onClick={() => navigate('/inventory')}
              className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center"
            >
              View Inventory <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto">
            {lowStockItems.length > 0 ? (
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Min Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {lowStockItems.slice(0, 10).map((item, index) => (
                    <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-white">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{item.currentStock} {item.unit}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{item.minStock} {item.unit}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">
                          Low Stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-emerald-400" />
                </div>
                <p className="text-slate-400 text-center">All stock levels are healthy</p>
              </div>
            )}
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
              <button 
                onClick={() => navigate('/orders')}
                className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              {recentOrders.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-700/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-orange-400">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{order.customer}</td>
                        <td className="px-6 py-4 text-sm text-white font-medium">Rs{order.total.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                            order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-400 text-center py-8">No orders found</p>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Top Products</h3>
              <button 
                onClick={() => navigate('/products')}
                className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="p-6">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <span className="text-orange-400 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-slate-500 text-sm">{product.sold} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">Rs{product.revenue.toLocaleString()}</p>
                      <div className="w-24 h-2 bg-slate-700 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                          style={{ width: `${topProducts[0].revenue > 0 ? (product.revenue / topProducts[0].revenue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">No product data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Monthly Revenue</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-slate-400 text-sm">Revenue</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(value) => `Rs${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1E293B', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [`Rs${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                <Bar dataKey="revenue" fill="url(#gradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6600" />
                    <stop offset="100%" stopColor="#EA580C" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
