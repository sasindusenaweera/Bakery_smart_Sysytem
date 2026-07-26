import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, DollarSign, ArrowUpRight, ArrowDownRight, Phone, CreditCard,
  Plus, Trash2, History, AlertTriangle, X, Calendar, Search
} from 'lucide-react';
import { ownerService } from '../services/ownerService';
import { 
  CreditCustomerResponse, CreditCustomerCreate, CreditPaymentCreate,
  CreditSummary, CreditTransactionResponse 
} from '../types/owner';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const CreditsPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<CreditCustomerResponse[]>([]);
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CreditCustomerResponse | null>(null);
  const [transactions, setTransactions] = useState<CreditTransactionResponse[]>([]);
  
  const [search, setSearch] = useState('');

  const [newCustomer, setNewCustomer] = useState<CreditCustomerCreate>({
    customerName: '',
    phoneNumber: '',
    address: '',
    creditAmount: 0,
    dueDate: '',
    notes: ''
  });

  const [payment, setPayment] = useState<CreditPaymentCreate>({
    amount: 0,
    paymentMethod: 'CASH',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [customersRes, summaryRes] = await Promise.all([
        ownerService.getCreditCustomers(search ? { search } : {}),
        ownerService.getCreditSummary()
      ]);
      
      setCustomers(customersRes);
      setSummary(summaryRes);
    } catch (err) {
      setError('Failed to load credit data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleCreateCredit = async () => {
    try {
      if (!newCustomer.customerName || newCustomer.creditAmount <= 0) {
        setError('Please fill in customer name and credit amount');
        return;
      }

      const response = await ownerService.createCreditCustomer(newCustomer);
      
      if (response.message) {
        setSuccessMessage(response.message);
      }
      
      setShowCreateModal(false);
      setNewCustomer({
        customerName: '',
        phoneNumber: '',
        address: '',
        creditAmount: 0,
        dueDate: '',
        notes: ''
      });
      
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create credit');
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedCustomer || payment.amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    try {
      const latestCustomer = await ownerService.getCreditCustomerById(selectedCustomer.id);
      
      if (latestCustomer.status === 'PAID') {
        setError('This credit is already fully paid');
        return;
      }

      if (payment.amount > latestCustomer.remainingBalance) {
        setError('Payment amount cannot exceed remaining balance');
        return;
      }

      await ownerService.recordCreditPayment(selectedCustomer.id, payment);
      setShowPaymentModal(false);
      setPayment({ amount: 0, paymentMethod: 'CASH', notes: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleViewHistory = async (customer: CreditCustomerResponse) => {
    try {
      const history = await ownerService.getCreditTransactionsByCustomer(customer.id);
      setTransactions(history);
      setSelectedCustomer(customer);
      setShowHistoryModal(true);
    } catch (err) {
      setError('Failed to load transaction history');
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this credit customer?')) return;
    
    try {
      await ownerService.deleteCreditCustomer(id);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete credit customer');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'ACTIVE': 'bg-blue-900/40 text-blue-400',
      'PARTIAL': 'bg-yellow-900/40 text-yellow-400',
      'PAID': 'bg-green-900/40 text-green-400',
      'OVERDUE': 'bg-red-900/40 text-red-400'
    };
    return styles[status] || 'bg-slate-700 text-slate-300';
  };

  const canAccess = user?.role === 'OWNER' || user?.role === 'CASHIER';

  if (!canAccess) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <CreditCard className="h-16 w-16 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">You do not have access to credit management</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded-lg text-green-400 flex items-center justify-between">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-green-400 hover:text-green-300">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

{error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 flex items-center justify-between select-text">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-green-300">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Credits</h1>
              <p className="text-slate-400 text-sm">Manage customer credit accounts</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="flex items-center px-4 py-2 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded-lg hover:bg-slate-600/50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            {(user?.role === 'OWNER' || user?.role === 'CASHIER') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Credit
              </button>
            )}
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-sm text-slate-400">Total Credit Issued</p>
                <p className="text-2xl font-bold text-orange-400 mt-1">{formatCurrency(summary.totalCreditIssued)}</p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg mt-3">
                <ArrowUpRight className="h-6 w-6 text-orange-400 mx-auto" />
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-sm text-slate-400">Collected Amount</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(summary.totalCollected)}</p>
              </div>
              <div className="bg-green-900/30 p-3 rounded-lg mt-3">
                <ArrowDownRight className="h-6 w-6 text-green-400 mx-auto" />
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-sm text-slate-400">Pending Balance</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{formatCurrency(summary.pendingBalance)}</p>
              </div>
              <div className="bg-blue-900/30 p-3 rounded-lg mt-3">
                <DollarSign className="h-6 w-6 text-blue-400 mx-auto" />
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-sm text-slate-400">Overdue Amount</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(summary.overdueAmount)}</p>
              </div>
              <div className="bg-red-900/30 p-3 rounded-lg mt-3">
                <AlertTriangle className="h-6 w-6 text-red-400 mx-auto" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 border border-slate-700/50">
          <div className="p-4 border-b border-slate-700">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-200 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#00008B] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Total Credit</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {isLoading ? (
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    <CreditCard className="h-12 w-12 mx-auto mb-2 text-slate-600" />
                    <p>No credit customers found</p>
                  </td></tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{customer.customerName}</div>
                        <div className="text-xs text-slate-500">{customer.referenceNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-slate-500" />
                          {customer.phoneNumber || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-orange-400">{formatCurrency(customer.totalCredit)}</td>
                      <td className="px-6 py-4 text-sm text-green-400">{formatCurrency(customer.totalPaid)}</td>
                      <td className={`px-6 py-4 text-sm font-bold ${customer.remainingBalance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {formatCurrency(customer.remainingBalance)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {customer.dueDate ? (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(customer.dueDate)}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(customer.status)}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewHistory(customer)}
                            className="p-1 text-blue-400 hover:bg-blue-900/30 rounded"
                            title="View History"
                          >
                            <History className="h-4 w-4" />
                          </button>
                          {customer.remainingBalance > 0 && (
                            <button
                              onClick={async () => {
                                try {
                                  const latestCustomer = await ownerService.getCreditCustomerById(customer.id);
                                  setSelectedCustomer(latestCustomer);
                                  setPayment({ ...payment, amount: latestCustomer.remainingBalance });
                                  setShowPaymentModal(true);
                                } catch {
                                  setError('Failed to load customer data');
                                }
                              }}
                              className="p-1 text-green-400 hover:bg-green-900/30 rounded"
                              title="Record Payment"
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                          )}
                          {user?.role === 'OWNER' && (
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="p-1 text-red-400 hover:bg-red-900/30 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white">Add New Credit</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={newCustomer.customerName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, customerName: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-200"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newCustomer.phoneNumber}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-200"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                  <textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-200"
                    rows={2}
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Credit Amount *</label>
                  <input
                    type="number"
                    value={newCustomer.creditAmount}
                    onChange={(e) => setNewCustomer({ ...newCustomer, creditAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-200"
                    placeholder="Enter credit amount"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newCustomer.dueDate}
                    onChange={(e) => setNewCustomer({ ...newCustomer, dueDate: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                  <textarea
                    value={newCustomer.notes}
                    onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-200"
                    rows={3}
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCredit}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Add Credit
                </button>
              </div>
            </div>
          </div>
        )}

        {showPaymentModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white">Record Payment</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-400">Customer</p>
                  <p className="font-medium text-white">{selectedCustomer.customerName}</p>
                  <p className="text-sm text-slate-400">Balance: {formatCurrency(selectedCustomer.remainingBalance)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Payment Amount</label>
                  <input
                    type="number"
                    value={payment.amount}
                    onChange={(e) => setPayment({ ...payment, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-200"
                    min="0"
                    max={selectedCustomer.remainingBalance}
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={payment.paymentMethod}
                    onChange={(e) => setPayment({ ...payment, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-200"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                  <textarea
                    value={payment.notes}
                    onChange={(e) => setPayment({ ...payment, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-200"
                    rows={2}
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {showHistoryModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div>
                  <h3 className="text-xl font-bold text-white">Transaction History</h3>
                  <p className="text-sm text-slate-400">{selectedCustomer.customerName}</p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                {transactions.length === 0 ? (
                  <p className="text-center text-slate-400 py-4">No transactions found</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center">
                          {tx.transactionType === 'CREDIT_ISSUED' ? (
                            <ArrowUpRight className="h-5 w-5 text-orange-400 mr-3" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5 text-green-400 mr-3" />
                          )}
                          <div>
                            <p className="font-medium text-white">
                              {tx.transactionType === 'CREDIT_ISSUED' ? 'Credit Issued' : 'Payment Received'}
                            </p>
                            <p className="text-sm text-slate-400">{formatDateTime(tx.transactionDate)}</p>
                            {tx.notes && <p className="text-xs text-slate-500">{tx.notes}</p>}
                          </div>
                        </div>
                        <div className={`font-bold ${tx.transactionType === 'CREDIT_ISSUED' ? 'text-orange-400' : 'text-green-400'}`}>
                          {tx.transactionType === 'CREDIT_ISSUED' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreditsPage;