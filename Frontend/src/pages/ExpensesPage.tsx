import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Plus, Wallet, TrendingDown, TrendingUp, Receipt } from 'lucide-react';
import { ownerService } from '../services/ownerService';
import { ExpenseResponse, ExpenseFundResponse, ExpenseFundSummary, ExpenseCreate, ExpenseFundCreate } from '../types/owner';
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

const CATEGORIES = ['Gas', 'Salary', 'Electricity', 'Water', 'Transport', 'Maintenance', 'Other'];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Gas': return '⛽';
    case 'Salary': return '👤';
    case 'Electricity': return '⚡';
    case 'Water': return '💧';
    case 'Transport': return '🚗';
    case 'Maintenance': return '🔧';
    default: return '📋';
  }
};

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [funds, setFunds] = useState<ExpenseFundResponse[]>([]);
  const [summary, setSummary] = useState<ExpenseFundSummary | null>(null);
  const [, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFundForm, setShowFundForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedFundId, setSelectedFundId] = useState<number | null>(null);

  const [newFund, setNewFund] = useState<ExpenseFundCreate>({
    allocatedAmount: 0,
    allocationDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [newExpense, setNewExpense] = useState<ExpenseCreate>({
    title: '',
    category: 'Other',
    amount: 0,
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    expenseFundId: undefined
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [expensesData, fundsData, summaryData] = await Promise.all([
        ownerService.getExpenses(),
        ownerService.getExpenseFunds(),
        ownerService.getExpenseFundSummary()
      ]);
      setExpenses(expensesData);
      setFunds(fundsData);
      setSummary(summaryData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateFund = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ownerService.createExpenseFund({
        allocatedAmount: newFund.allocatedAmount,
        allocationDate: newFund.allocationDate,
        notes: newFund.notes
      } as any);
      setShowFundForm(false);
      setNewFund({ allocatedAmount: 0, allocationDate: new Date().toISOString().split('T')[0], notes: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create fund');
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expenseData = {
        title: newExpense.title,
        category: newExpense.category,
        amount: newExpense.amount,
        description: newExpense.description,
        expenseDate: newExpense.expenseDate,
        expenseFundId: selectedFundId || undefined
      };
      console.log('Creating expense:', expenseData);
      await ownerService.createExpense(expenseData as any);
      setShowExpenseForm(false);
      setNewExpense({ title: '', category: 'Other', amount: 0, description: '', expenseDate: new Date().toISOString().split('T')[0] });
      setSelectedFundId(null);
      fetchData();
    } catch (err: any) {
      console.error('Error creating expense:', err);
      setError(err.response?.data?.message || 'Failed to create expense');
    }
  };

  const deleteExpense = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await ownerService.deleteExpense(id);
      fetchData();
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Expense Fund</h1>
              <p className="text-slate-400 text-sm">Manage expense funds and track expenses</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFundForm(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Allocate Fund
            </button>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </button>
            <button
              onClick={fetchData}
              className="flex items-center px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 border border-slate-600/50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Allocated</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(summary?.totalAllocated || 0)}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Wallet className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Used</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(summary?.totalUsed || 0)}</p>
              </div>
              <div className="bg-red-500/20 p-3 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Remaining Balance</p>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(summary?.totalRemaining || 0)}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Expenses</p>
                <p className="text-2xl font-bold text-white">{summary?.totalExpenses || 0}</p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <Receipt className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Fund Allocations</h3>
            {funds.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No fund allocations yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-right py-2 px-2">Amount</th>
                      <th className="text-right py-2 px-2">Used</th>
                      <th className="text-right py-2 px-2">Balance</th>
                      <th className="text-left py-2 px-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funds.map((fund) => (
                      <tr key={fund.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-2 px-2 text-slate-300">{formatDate(fund.allocationDate)}</td>
                        <td className="py-2 px-2 text-right text-green-400">{formatCurrency(fund.allocatedAmount)}</td>
                        <td className="py-2 px-2 text-right text-red-400">{formatCurrency(fund.usedAmount)}</td>
                        <td className="py-2 px-2 text-right text-blue-400">{formatCurrency(fund.remainingBalance)}</td>
                        <td className="py-2 px-2 text-slate-400 truncate max-w-32">{fund.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Expenses</h3>
            {expenses.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No expenses recorded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2 px-2">Title</th>
                      <th className="text-left py-2 px-2">Category</th>
                      <th className="text-right py-2 px-2">Amount</th>
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-center py-2 px-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.slice(0, 10).map((expense) => (
                      <tr key={expense.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-2 px-2 text-slate-300">{expense.title}</td>
                        <td className="py-2 px-2">
                          <span className="flex items-center gap-1">
                            <span>{getCategoryIcon(expense.category)}</span>
                            <span className="text-slate-300">{expense.category}</span>
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right text-red-400">{formatCurrency(expense.amount)}</td>
                        <td className="py-2 px-2 text-slate-400">{formatDate(expense.expenseDate)}</td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => deleteExpense(expense.id!)}
                            className="p-1 hover:bg-red-500/20 rounded"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {showFundForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Allocate Expense Fund</h3>
              <form onSubmit={handleCreateFund} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Allocated Amount (LKR)</label>
                  <input
                    type="number"
                    value={newFund.allocatedAmount || ''}
                    onChange={(e) => setNewFund({ ...newFund, allocatedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={newFund.allocationDate}
                    onChange={(e) => setNewFund({ ...newFund, allocationDate: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Notes / Purpose</label>
                  <textarea
                    value={newFund.notes}
                    onChange={(e) => setNewFund({ ...newFund, notes: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    rows={3}
                    placeholder="Enter purpose of the fund..."
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowFundForm(false)}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Allocate Fund
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showExpenseForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Record Expense</h3>
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Expense Title</label>
                  <input
                    type="text"
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    placeholder="e.g., Electricity bill payment"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Amount (LKR)</label>
                  <input
                    type="number"
                    value={newExpense.amount || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Select Fund</label>
                  <select
                    value={selectedFundId || ''}
                    onChange={(e) => setSelectedFundId(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Select a fund (optional)</option>
                    {funds.filter(f => f.remainingBalance > 0).map((fund) => (
                      <option key={fund.id} value={fund.id}>
                        Fund #{fund.id} - {formatCurrency(fund.remainingBalance)} remaining
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={newExpense.expenseDate}
                    onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    rows={2}
                    placeholder="Additional details..."
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowExpenseForm(false)}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Record Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExpensesPage;