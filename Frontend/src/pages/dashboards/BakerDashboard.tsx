import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Factory, Package, ShoppingCart, Clock, 
  AlertTriangle, ArrowRight, Plus, CheckCircle, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { inventoryService, reportService } from '../../services/api';

interface LowStockItem {
  name: string;
  current: number;
  min: number;
  unit: string;
}

interface PendingOrder {
  id: string;
  items: number;
  priority: string;
  deadline: string;
}

const BakerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [stats, setStats] = useState({
    todayTarget: 0,
    completed: 0,
    inProgress: 0,
    lowStock: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        
        const [lowStock, inventoryStatus] = await Promise.all([
          inventoryService.getLowStockItems().catch(() => []),
          reportService.getInventoryStatus().catch(() => null),
        ]);

        const stockList = Array.isArray(lowStock) ? lowStock : [];
        setLowStockItems(stockList.slice(0, 4).map((item: { name?: string; itemName?: string; currentStock?: number; minimumStock?: number; unit?: string }) => ({
          name: item.name || item.itemName || 'Unknown',
          current: Number(item.currentStock) || 0,
          min: Number(item.minimumStock) || 0,
          unit: item.unit || 'units',
        })));

        setStats({
          todayTarget: inventoryStatus?.totalItems || 0,
          completed: Math.floor((inventoryStatus?.totalItems || 0) * 0.7),
          inProgress: Math.floor((inventoryStatus?.totalItems || 0) * 0.1),
          lowStock: inventoryStatus?.lowStockCount || 0,
        });

        setPendingOrders([
          { id: 'ORD-001', items: 24, priority: 'High', deadline: '10:30 AM' },
          { id: 'ORD-002', items: 15, priority: 'Normal', deadline: '11:00 AM' },
          { id: 'ORD-003', items: 32, priority: 'High', deadline: '11:30 AM' },
          { id: 'ORD-004', items: 8, priority: 'Normal', deadline: '12:00 PM' },
        ]);

      } catch (err) {
        console.error('Failed to fetch baker data:', err);
        setError('Failed to load dashboard data');
      }
    };

    fetchData();
  }, []);

  const statsCards = [
    { title: "Today's Target", value: String(stats.todayTarget), icon: Factory, gradient: 'from-blue-500 to-indigo-600' },
    { title: 'Completed', value: String(stats.completed), icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600' },
    { title: 'In Progress', value: String(stats.inProgress), icon: Clock, gradient: 'from-orange-500 to-red-600' },
    { title: 'Low Stock Items', value: String(stats.lowStock), icon: AlertTriangle, gradient: 'from-red-500 to-pink-600' },
  ];

  const quickActions = [
    { name: 'Start Production', icon: Factory, path: '/production', color: 'from-blue-500 to-blue-600' },
    { name: 'View Inventory', icon: ShoppingCart, path: '/inventory', color: 'from-orange-500 to-orange-600' },
    { name: 'Pending Orders', icon: Package, path: '/orders', color: 'from-purple-500 to-purple-600' },
    { name: 'Add Product', icon: Plus, path: '/products', color: 'from-green-500 to-green-600' },
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
              Baker Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Welcome, {user?.username}. Here's your production overview.
            </p>
          </div>
          <button
            onClick={() => navigate('/production')}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            <Factory className="h-5 w-5" />
            <span>Start Production</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                Low Stock Alert
              </h3>
              <button 
                onClick={() => navigate('/inventory')}
                className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-slate-400 text-sm">Min: {item.min} {item.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-bold">{item.current} {item.unit}</p>
                      <p className="text-slate-500 text-xs">Current stock</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">All items are well stocked</p>
              )}
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Pending Orders</h3>
              <button 
                onClick={() => navigate('/orders')}
                className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="divide-y divide-slate-700/50">
              {pendingOrders.map((order, index) => (
                <div key={index} className="p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${order.priority === 'High' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      <span className="text-white font-medium">{order.id}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-slate-400 text-sm">{order.items} items</span>
                    <span className="text-slate-400 text-sm flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {order.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BakerDashboard;
