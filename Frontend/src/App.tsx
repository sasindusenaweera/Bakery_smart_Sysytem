import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import { AdminDashboard, CashierDashboard, BakerDashboard, StorekeeperDashboard } from './pages/dashboards';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import POSPage from './pages/POSPage';
import SalesPage from './pages/SalesPage';
import ReportsPage from './pages/ReportsPage';
import OrdersPage from './pages/OrdersPage';
import ProductionPage from './pages/ProductionPage';
import SuppliersPage from './pages/SuppliersPage';
import PurchasesPage from './pages/PurchasesPage';
import ExpensesPage from './pages/ExpensesPage';
import CreditsPage from './pages/CreditsPage';
import InventoryDistributionPage from './pages/InventoryDistributionPage';
import UsersPage from './pages/UsersPage';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'OWNER':
      return <AdminDashboard />;
    case 'CASHIER':
      return <CashierDashboard />;
    case 'BAKER':
      return <BakerDashboard />;
    case 'STOREKEEPER':
      return <StorekeeperDashboard />;
    default:
      return <AdminDashboard />;
  }
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'STOREKEEPER']}>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'STOREKEEPER']}>
            <InventoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'CASHIER']}>
            <POSPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'CASHIER']}>
            <SalesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'CASHIER', 'BAKER']}>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/production"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'BAKER', 'CASHIER', 'STOREKEEPER']}>
            <ProductionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory-distribution"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'STOREKEEPER', 'BAKER']}>
            <InventoryDistributionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'STOREKEEPER']}>
            <SuppliersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'STOREKEEPER']}>
            <PurchasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <ExpensesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/credits"
        element={
          <ProtectedRoute allowedRoles={['OWNER', 'CASHIER']}>
            <CreditsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
