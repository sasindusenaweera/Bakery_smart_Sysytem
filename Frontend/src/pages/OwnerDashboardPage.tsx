import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  ChefHat,
  LogOut,
  RefreshCw,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ownerService } from '../services/ownerService';
import { DashboardSummary } from '../types/owner';
import { OwnerStatCard } from '../components/owner/OwnerStatCard';
import { QuickActionsCard } from '../components/owner/QuickActionsCard';
import { LowStockAlertsCard } from '../components/owner/LowStockAlertsCard';
import { RecentOrdersCard } from '../components/owner/RecentOrdersCard';
import { CashierSalesCard } from '../components/owner/CashierSalesCard';
import { OwnerDashboardSkeleton } from '../components/owner/OwnerDashboardSkeleton';
import ErrorBoundary from '../components/ErrorBoundary';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const OwnerDashboardContent: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ownerService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return <OwnerDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center px-4 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-orange-700 transition-colors font-bold"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#00008B] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-lg">
                <ChefHat className="h-6 w-6 text-[#FF6600]" />
              </div>
              <h1 className="text-xl font-bold tracking-wide">BAKERY SMART MANAGEMENT</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-orange-500 text-xs font-bold rounded-full uppercase">
                Owner
              </span>
              <span className="text-sm">
                <span className="text-orange-200">Welcome,</span>{' '}
                <span className="font-semibold">{user?.username}</span>
              </span>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <LayoutDashboard className="h-6 w-6 text-[#FF6600]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              Owner Dashboard
            </h2>
          </div>
          <button
            onClick={fetchDashboard}
            className="flex items-center px-4 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-orange-700 transition-colors uppercase text-sm font-bold"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {dashboardData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <OwnerStatCard
                title="Today's Revenue"
                value={formatCurrency(dashboardData.sales.todayRevenue)}
                subtitle={`${dashboardData.sales.todayTransactions} transactions`}
                trend={8.5}
                icon={DollarSign}
              />
              <OwnerStatCard
                title="Weekly Revenue"
                value={formatCurrency(dashboardData.sales.weeklyRevenue)}
                subtitle={`${dashboardData.sales.weeklyTransactions} transactions`}
                trend={12.3}
                icon={TrendingUp}
              />
              <OwnerStatCard
                title="Low Stock Items"
                value={dashboardData.inventory.lowStockCount}
                subtitle={`${dashboardData.inventory.outOfStockCount} out of stock`}
                icon={AlertTriangle}
                variant="warning"
              />
              <OwnerStatCard
                title="Pending Orders"
                value={dashboardData.orders.pendingOrders}
                subtitle={`${dashboardData.orders.readyOrders} ready`}
                icon={ShoppingBag}
                variant="success"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <QuickActionsCard
                onNavigate={navigate}
                stats={{
                  totalExpenses: dashboardData.stats.totalExpenses,
                  creditDue: dashboardData.stats.creditDue,
                  supplierDues: dashboardData.stats.supplierDues,
                  cashOnHand: dashboardData.stats.cashOnHand,
                }}
                formatCurrency={formatCurrency}
              />
              <LowStockAlertsCard items={dashboardData.inventory.lowStockItems} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentOrdersCard
                orders={dashboardData.orders.recentOrders}
                formatCurrency={formatCurrency}
              />
              <CashierSalesCard
                sales={dashboardData.sales.cashierSales}
                formatCurrency={formatCurrency}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const OwnerDashboardPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <OwnerDashboardContent />
    </ErrorBoundary>
  );
};

export default OwnerDashboardPage;
