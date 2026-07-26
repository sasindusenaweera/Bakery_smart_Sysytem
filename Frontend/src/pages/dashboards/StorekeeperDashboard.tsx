import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Package, ShoppingCart, Truck, AlertTriangle,
  ArrowRight, Plus, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { inventoryService, reportService } from '../../services/api';
import { purchaseService } from '../../services/purchaseService';

const StorekeeperDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [lowStockItems, setLowStockItems] = useState<{ name: string; current: number; min: number; unit: string }[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<{ id: string; supplier: string; items: number; total: number; status: string }[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    pendingOrders: 0,
    categories: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        
        const [inventory, inventoryStatus, purchases] = await Promise.all([
          inventoryService.getAllItems().catch(() => []),
          reportService.getInventoryStatus().catch(() => null),
          purchaseService.getAll().catch(() => []),
        ]);

        const inventoryList = Array.isArray(inventory) ? inventory : [];
        const purchaseList = Array.isArray(purchases) ? purchases : [];

        setStats({
          totalItems: inventoryList.length,
          lowStock: inventoryStatus?.lowStockCount || 0,
          pendingOrders: purchaseList.filter((p: { status?: string }) => p.status === 'PENDING' || p.status === 'PROCESSING').length,
          categories: new Set(inventoryList.map((i: { category?: string }) => i.category || 'Other')).size || 5,
        });

        setLowStockItems(inventoryList
          .filter((item: { currentStock?: number; minimumStock?: number }) => 
            (item.currentStock || 0) < (item.minimumStock || 0) * 1.5)
          .slice(0, 5)
          .map((item: { name?: string; itemName?: string; currentStock?: number; minimumStock?: number; unit?: string }) => ({
            name: item.name || item.itemName || 'Unknown',
            current: Number(item.currentStock) || 0,
            min: Number(item.minimumStock) || 0,
            unit: item.unit || 'units',
          }))
        );

        setRecentPurchases(purchaseList.slice(0, 3).map((p: { id: number | string; supplierName?: string; supplier?: { name?: string }; totalAmount?: number; status?: string }) => ({
          id: `PO-${p.id}`,
          supplier: p.supplierName || p.supplier?.name || 'Unknown Supplier',
          items: 1,
          total: p.totalAmount || 0,
          status: p.status || 'PENDING',
        })));

      } catch (err) {
        console.error('Failed to fetch storekeeper data:', err);
        setError('Failed to load dashboard data');
      }
    };

    fetchData();
  }, []);

  const statsCards = [
    { title: 'Total Items', value: String(stats.totalItems), icon: Package, gradient: 'from-blue-500 to-indigo-600' },
    { title: 'Low Stock', value: String(stats.lowStock), icon: AlertTriangle, gradient: 'from-red-500 to-pink-600' },
    { title: 'Pending Orders', value: String(stats.pendingOrders), icon: Truck, gradient: 'from-orange-500 to-red-600' },
    { title: 'Categories', value: String(stats.categories), icon: ShoppingCart, gradient: 'from-emerald-500 to-teal-600' },
  ];

  const quickActions = [
    { name: 'View Inventory', icon: ShoppingCart, path: '/inventory', color: 'from-blue-500 to-blue-600' },
    { name: 'New Purchase', icon: Truck, path: '/purchases', color: 'from-orange-500 to-orange-600' },
    { name: 'Add Product', icon: Plus, path: '/products', color: 'from-purple-500 to-purple-600' },
    { name: 'Suppliers', icon: Package, path: '/suppliers', color: 'from-green-500 to-green-600' },
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
              Storekeeper Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Welcome, {user?.username}. Manage your inventory efficiently.
            </p>
          </div>
          <button
            onClick={() => navigate('/purchases')}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/20 transition-all"
          >
            <Truck className="h-5 w-5" />
            <span>New Purchase Order</span>
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
          {/* Categories */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                <span className="text-slate-400">Total Items</span>
                <span className="text-white font-bold">{stats.totalItems}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                <span className="text-slate-400">Low Stock</span>
                <span className="text-red-400 font-bold">{stats.lowStock}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                <span className="text-slate-400">Pending Orders</span>
                <span className="text-yellow-400 font-bold">{stats.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                <span className="text-slate-400">Categories</span>
                <span className="text-blue-400 font-bold">{stats.categories}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Low Stock Alert</h3>
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{item.name}</span>
                      <span className="text-slate-400 text-sm">{item.current}/{item.min} {item.unit}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          (item.current / item.min) < 0.5 ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min((item.current / item.min) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">All items are well stocked</p>
              )}
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Purchases</h3>
              <button 
                onClick={() => navigate('/purchases')}
                className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {recentPurchases.length > 0 ? (
                recentPurchases.map((po, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <div>
                      <p className="text-white font-medium">{po.supplier}</p>
                      <p className="text-slate-500 text-sm">{po.items} items • {po.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">Rs{po.total.toLocaleString()}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        po.status === 'RECEIVED' || po.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                        po.status === 'PENDING' || po.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {po.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">No recent purchases</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StorekeeperDashboard;
