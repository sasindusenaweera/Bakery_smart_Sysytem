import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ShoppingBag, 
  BarChart3, 
  Users, 
  ClipboardList,
  Factory,
  Truck,
  DollarSign,
  CreditCard,
  Settings,
  LogOut,
  ChefHat,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  ArrowDownToLine,
  UsersRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['OWNER', 'CASHIER', 'BAKER', 'STOREKEEPER'] },
  { name: 'Products', path: '/products', icon: Package, roles: ['OWNER', 'STOREKEEPER'] },
  { name: 'Inventory', path: '/inventory', icon: ShoppingCart, roles: ['OWNER', 'STOREKEEPER'] },
  { name: 'POS', path: '/pos', icon: ShoppingBag, roles: ['OWNER', 'CASHIER'] },
  { name: 'Sales', path: '/sales', icon: DollarSign, roles: ['OWNER', 'CASHIER'] },
  { name: 'Orders', path: '/orders', icon: ClipboardList, roles: ['OWNER', 'CASHIER', 'BAKER'] },
  { name: 'Production', path: '/production', icon: Factory, roles: ['OWNER', 'BAKER'] },
  { name: 'Inventory Distribution', path: '/inventory-distribution', icon: ArrowDownToLine, roles: ['OWNER', 'STOREKEEPER', 'BAKER'] },
  { name: 'Purchases', path: '/purchases', icon: Truck, roles: ['OWNER', 'STOREKEEPER'] },
  { name: 'Suppliers', path: '/suppliers', icon: UsersRound, roles: ['OWNER', 'STOREKEEPER'] },
  { name: 'Expenses', path: '/expenses', icon: DollarSign, roles: ['OWNER'] },
  { name: 'Credits', path: '/credits', icon: CreditCard, roles: ['OWNER', 'CASHIER'] },
  { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['OWNER'] },
  { name: 'Users', path: '/users', icon: Users, roles: ['OWNER'] },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'CASHIER': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'BAKER': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'STOREKEEPER': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50
        transform transition-transform duration-300 z-50
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg shadow-lg shadow-orange-500/20">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">SmartBake 360</h1>
              <p className="text-[10px] text-slate-400">Management System</p>
            </div>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex flex-row items-center justify-start space-x-3 px-4 py-3 rounded-lg text-left
                  transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? '' : 'text-slate-400 group-hover:text-orange-400'}`} />
                <span className="font-medium text-left">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="h-16 bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md ml-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl shadow-black/20 z-50 overflow-hidden">
                      <div className="p-4 border-b border-slate-700/50">
                        <p className="text-sm font-medium text-white">{user?.username}</p>
                        <p className="text-xs text-slate-400">{user?.email}</p>
                        <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user?.role || 'CASHIER')}`}>
                          {user?.role}
                        </span>
                      </div>
                      <div className="p-2">
                        <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-all">
                          <Settings className="h-4 w-4" />
                          <span className="text-sm">Settings</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
