import React, { useState, useEffect } from 'react';
import { Users, Plus, LogOut, ChefHat, Package, ShoppingCart, Receipt, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userService, authService } from '../services/api';
import { User, UserRole } from '../types';
import UserCard from '../components/UserCard';
import UserModal from '../components/UserModal';
import { CardSkeleton } from '../components/Skeleton';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData: { username: string; email: string; password?: string; role: UserRole }) => {
    try {
      setIsSaving(true);
      if (editingUser) {
        await userService.updateUser(editingUser.id, userData);
      } else {
        await authService.register(userData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError('Failed to save user. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;

    try {
      if (targetUser.active) {
        await userService.deactivateUser(id);
      } else {
        await userService.activateUser(id);
      }
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#00008B] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-lg">
                <ChefHat className="h-6 w-6 text-[#FF6600]" />
              </div>
              <h1 className="text-xl font-bold">SmartBake 360</h1>
            </div>
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center px-3 py-2 rounded-lg text-sm bg-white/20"
              >
                <Users className="h-4 w-4 mr-2" />
                Users
              </button>
              <button
                onClick={() => navigate('/products')}
                className="flex items-center px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                <Package className="h-4 w-4 mr-2" />
                Products
              </button>
              <button
                onClick={() => navigate('/inventory')}
                className="flex items-center px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Inventory
              </button>
              <button
                onClick={() => navigate('/sales')}
                className="flex items-center px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Sales
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="flex items-center px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-orange-200">Welcome,</span>{' '}
                <span className="font-semibold">{user?.username}</span>
                <span className="ml-2 px-2 py-0.5 bg-orange-500 text-xs rounded-full">{user?.role}</span>
              </div>
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
              <Users className="h-6 w-6 text-[#FF6600]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center px-4 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found. Add your first user to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((userItem) => (
              <UserCard
                key={userItem.id}
                user={userItem}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </main>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
        isLoading={isSaving}
      />
    </div>
  );
};

export default DashboardPage;
