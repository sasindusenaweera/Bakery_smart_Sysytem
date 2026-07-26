import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Search, Clock, CheckCircle, XCircle, Plus,
  Calendar, Phone, MapPin, DollarSign, Eye, Edit, AlertTriangle,
  CreditCard, Banknote, Lock, ChefHat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ownerService } from '../services/ownerService';
import { OrderResponse, OrderCreate, OrderUpdateStatus, OrderPayment, OrderCancellation, PaymentMethod } from '../types/owner';
import OrderModal from '../components/OrderModal';
import DashboardLayout from '../components/DashboardLayout';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getStatusConfig = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'PENDING' };
    case 'PREPARING':
      return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'PREPARING' };
    case 'READY':
      return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'READY' };
    case 'COMPLETED':
      return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'COMPLETED' };
    case 'DELIVERED':
      return { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30', label: 'DELIVERED' };
    case 'CANCELLED':
      return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'CANCELLED' };
    default:
      return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', label: status };
  }
};

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'READY', label: 'Ready' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  CREDIT: 'Credit',
  BANK_TRANSFER: 'Bank Transfer',
};

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const canCreateOrder = user?.role === 'OWNER' || user?.role === 'CASHIER';
  const canSeeFinancials = user?.role === 'OWNER' || user?.role === 'CASHIER';
  const canCancelOrder = user?.role === 'OWNER' || user?.role === 'CASHIER';
  const canUpdateStatus = user?.role === 'OWNER' || user?.role === 'CASHIER' || user?.role === 'BAKER';
  const canRecordPayment = user?.role === 'OWNER' || user?.role === 'CASHIER';

  const bakerStatusOptions = [
    { value: 'PREPARING', label: 'Preparing' },
    { value: 'READY', label: 'Ready' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filters: { status?: string; customerName?: string; startDate?: string; endDate?: string } = {};
      if (statusFilter) filters.status = statusFilter;
      if (dateFilter) {
        filters.startDate = `${dateFilter}T00:00:00`;
        filters.endDate = `${dateFilter}T23:59:59`;
      }
      const data = await ownerService.getOrders(filters);
      setOrders(data);
    } catch {
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateOrder = async (data: OrderCreate) => {
    try {
      setIsSaving(true);
      await ownerService.createOrder(data, user?.id);
      fetchOrders();
    } catch {
      setError('Failed to create order');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      setIsSaving(true);
      const updateData: OrderUpdateStatus = {
        status: newStatus,
        preparationNotes: statusNotes || undefined,
      };
      await ownerService.updateOrderStatus(selectedOrder.id, updateData);
      fetchOrders();
      setShowStatusModal(false);
      setSelectedOrder(null);
      setStatusNotes('');
      setNewStatus('');
    } catch {
      setError('Failed to update order status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedOrder || paymentAmount <= 0) return;
    try {
      setIsSaving(true);
      const paymentData: OrderPayment = {
        paidAmount: paymentAmount,
      };
      await ownerService.recordPayment(selectedOrder.id, paymentData);
      fetchOrders();
      setShowPaymentModal(false);
      setSelectedOrder(null);
      setPaymentAmount(0);
    } catch {
      setError('Failed to record payment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancellationReason.trim()) return;
    try {
      setIsSaving(true);
      const cancelData: OrderCancellation = {
        cancellationReason: cancellationReason.trim(),
      };
      await ownerService.cancelOrder(selectedOrder.id, cancelData);
      fetchOrders();
      setShowCancelModal(false);
      setSelectedOrder(null);
      setCancellationReason('');
    } catch (err: any) {
      console.error('Cancel order error:', err);
      setError(err?.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsSaving(false);
    }
  };

  const openViewModal = (order: OrderResponse) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const openStatusModal = (order: OrderResponse) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNotes(order.preparationNotes || '');
    setShowStatusModal(true);
  };

  const openPaymentModal = (order: OrderResponse) => {
    setSelectedOrder(order);
    setPaymentAmount(order.pendingAmount > 0 ? order.pendingAmount : 0);
    setShowPaymentModal(true);
  };

  const openCancelModal = (order: OrderResponse) => {
    setSelectedOrder(order);
    setCancellationReason('');
    setShowCancelModal(true);
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.customerName?.toLowerCase().includes(query) ||
      order.phoneNumber?.toLowerCase().includes(query) ||
      `#${order.id}`.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    preparing: orders.filter(o => o.status === 'PREPARING').length,
    ready: orders.filter(o => o.status === 'READY').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    totalValue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Customer Orders</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchOrders}
              className="flex items-center px-4 py-2 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {canCreateOrder && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Orders</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <ChefHat className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Preparing</p>
                <p className="text-2xl font-bold text-blue-400">{stats.preparing}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Edit className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Ready</p>
                <p className="text-2xl font-bold text-green-400">{stats.ready}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>
          {canSeeFinancials && (
            <>
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Completed</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.completed}</p>
                  </div>
                  <div className="bg-purple-500/20 p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Value</p>
                    <p className="text-2xl font-bold text-orange-400">{formatCurrency(stats.totalValue)}</p>
                  </div>
                  <div className="bg-orange-500/20 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-orange-400" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, phone, or order ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="">All Status</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-orange-500/50"
          />
          {(statusFilter || dateFilter) && (
            <button
              onClick={() => { setStatusFilter(''); setDateFilter(''); }}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-300">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-300">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-300">Order Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-300">Required Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-300">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-300">Items</th>
                  {canSeeFinancials && (
                    <>
                      <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-300">Total</th>
                      <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-300">Balance</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={canSeeFinancials ? 8 : 6} className="px-6 py-8 text-center text-slate-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={canSeeFinancials ? 8 : 6} className="px-6 py-8 text-center text-slate-500">
                      <ChefHat className="h-12 w-12 mx-auto mb-2 text-slate-600" />
                      <p>No orders found</p>
                      {canCreateOrder && (
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="mt-2 text-orange-400 hover:text-orange-300 font-medium"
                        >
                          Create your first order
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusCfg = getStatusConfig(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-white">#{order.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{order.customerName}</div>
                          <div className="text-sm text-slate-400 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {order.phoneNumber || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {order.requiredDate ? (
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-orange-400" />
                              {formatDate(order.requiredDate)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {order.items?.length || 0} items
                        </td>
                        {canSeeFinancials && (
                          <>
                            <td className="px-6 py-4 text-right font-bold text-orange-400">
                              {formatCurrency(order.totalAmount)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {order.pendingAmount > 0 ? (
                                <span className="text-red-400 font-medium">
                                  {formatCurrency(order.pendingAmount)}
                                </span>
                              ) : (
                                <span className="text-green-400 font-medium">Paid</span>
                              )}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => openViewModal(order)}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {canUpdateStatus && order.status !== 'CANCELLED' && (
                              <button
                                onClick={() => openStatusModal(order)}
                                className="p-2 text-orange-400 hover:bg-orange-500/20 rounded-lg transition-colors"
                                title="Update Status"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {canRecordPayment && (order.pendingAmount || 0) > 0 && (
                              <button
                                onClick={() => openPaymentModal(order)}
                                className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                title="Record Payment"
                              >
                                <DollarSign className="h-4 w-4" />
                              </button>
                            )}
                            {canCancelOrder && order.status === 'PENDING' && (
                              <button
                                onClick={() => openCancelModal(order)}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Cancel Order"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <OrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateOrder}
        isLoading={isSaving}
      />

      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between shadow-lg shadow-orange-500/20">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <ChefHat className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Order #{selectedOrder.id}</h2>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <XCircle className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700/30">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Customer</p>
                  <p className="font-bold text-white">{selectedOrder.customerName}</p>
                  {selectedOrder.phoneNumber && (
                    <p className="text-sm text-slate-400 flex items-center mt-1">
                      <Phone className="h-3 w-3 mr-1" />
                      {selectedOrder.phoneNumber}
                    </p>
                  )}
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700/30">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${getStatusConfig(selectedOrder.status).bg} ${getStatusConfig(selectedOrder.status).text} border ${getStatusConfig(selectedOrder.status).border}`}>
                    {getStatusConfig(selectedOrder.status).label}
                  </span>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700/30">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Order Date</p>
                  <p className="font-medium text-white">{formatDate(selectedOrder.orderDate)}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700/30">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Required Date</p>
                  <p className="font-medium text-white">
                    {selectedOrder.requiredDate ? formatDate(selectedOrder.requiredDate) : '-'}
                  </p>
                </div>
                {selectedOrder.deliveryAddress && (
                  <div className="col-span-2 bg-slate-700/30 rounded-lg p-4 border border-slate-700/30">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Delivery Address</p>
                    <p className="font-medium text-white flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-orange-400" />
                      {selectedOrder.deliveryAddress}
                    </p>
                  </div>
                )}
                {selectedOrder.cancellationReason && (
                  <div className="col-span-2 bg-red-500/20 rounded-lg p-4 border border-red-500/30">
                    <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Cancellation Reason</p>
                    <p className="font-medium text-red-300">{selectedOrder.cancellationReason}</p>
                    {selectedOrder.cancelledAt && (
                      <p className="text-xs text-red-400 mt-1">Cancelled at: {formatDate(selectedOrder.cancelledAt)}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="border border-slate-700/50 rounded-lg overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-slate-700/30">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Item</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-slate-400 uppercase">Qty</th>
                      {canSeeFinancials && (
                        <>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase">Price</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase">Subtotal</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm text-white">{item.productName}</td>
                        <td className="px-4 py-2 text-sm text-white text-center">{item.quantity}</td>
                        {canSeeFinancials && (
                          <>
                            <td className="px-4 py-2 text-sm text-white text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-2 text-sm font-medium text-white text-right">{formatCurrency(item.subtotal)}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {canSeeFinancials ? (
                <div className="bg-slate-700/30 rounded-lg p-4 space-y-2 border border-slate-700/30">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Amount:</span>
                    <span className="font-bold text-white">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                  {selectedOrder.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Method:</span>
                      <span className="font-medium text-white flex items-center">
                        {selectedOrder.paymentMethod === 'CASH' ? <Banknote className="h-4 w-4 mr-1" /> : <CreditCard className="h-4 w-4 mr-1" />}
                        {paymentMethodLabels[selectedOrder.paymentMethod]}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Advance Payment:</span>
                    <span className="font-bold text-green-400">{formatCurrency(selectedOrder.advancePayment || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Paid Amount:</span>
                    <span className="font-bold text-green-400">{formatCurrency(selectedOrder.paidAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-600/50 pt-2">
                    <span className="text-slate-400">Balance Due:</span>
                    <span className={`font-bold ${selectedOrder.pendingAmount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatCurrency(selectedOrder.pendingAmount)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700/30">
                  <div className="flex items-center justify-center space-x-2 text-slate-400">
                    <Lock className="h-4 w-4" />
                    <span>Financial details restricted</span>
                  </div>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-1">Notes:</p>
                  <p className="text-sm text-slate-200 bg-slate-700/30 p-3 rounded-lg border border-slate-700/30">{selectedOrder.notes}</p>
                </div>
              )}
              {selectedOrder.preparationNotes && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-1">Preparation Notes:</p>
                  <p className="text-sm text-slate-200 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">{selectedOrder.preparationNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowStatusModal(false)} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 rounded-t-2xl shadow-lg shadow-orange-500/20">
              <h2 className="text-xl font-bold text-white">Update Order Status</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-400 mb-4">Order #{selectedOrder.id} - {selectedOrder.customerName}</p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-orange-500/50"
                >
                  {user?.role === 'BAKER' ? (
                    bakerStatusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))
                  ) : (
                    statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))
                  )}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Preparation Notes</label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add notes about the preparation..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500/50 resize-none"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={isSaving || !newStatus}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 shadow-lg shadow-orange-500/20"
                >
                  {isSaving ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-2xl shadow-lg shadow-green-500/20">
              <h2 className="text-xl font-bold text-white">Record Payment</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-400 mb-4">
                Order #{selectedOrder.id} - Balance: {formatCurrency(selectedOrder.pendingAmount)}
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Payment Amount (LKR)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  min="0"
                  max={selectedOrder.pendingAmount}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-xl font-bold focus:ring-2 focus:ring-green-500/50"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={isSaving || paymentAmount <= 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 shadow-lg shadow-green-500/20"
                >
                  {isSaving ? 'Processing...' : 'Record Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-2xl shadow-lg shadow-red-500/20">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-white" />
                <h2 className="text-xl font-bold text-white">Cancel Order</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-400 mb-4">
                Are you sure you want to cancel Order #{selectedOrder.id} for {selectedOrder.customerName}?
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cancellation Reason *
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500/50 resize-none"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={isSaving || !cancellationReason.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 shadow-lg shadow-red-500/20"
                >
                  {isSaving ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OrdersPage;
