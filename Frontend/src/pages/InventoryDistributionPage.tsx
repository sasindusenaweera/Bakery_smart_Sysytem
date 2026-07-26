import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Truck, Package, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/productionService';
import { IssueResponse, IssueCreate } from '../types/issue';
import IssueCard from '../components/IssueCard';
import IssueModal from '../components/IssueModal';
import DashboardLayout from '../components/DashboardLayout';

const InventoryDistributionPage: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<IssueResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<IssueResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchIssues = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await issueService.getAllIssues();
      setIssues(data);
    } catch {
      setError('Failed to load issues. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleAddIssue = () => {
    setEditingIssue(null);
    setIsModalOpen(true);
  };

  const handleEditIssue = (issue: IssueResponse) => {
    setEditingIssue(issue);
    setIsModalOpen(true);
  };

  const handleSaveIssue = async (data: IssueCreate) => {
    try {
      setIsSaving(true);
      console.log('Saving issue with data:', JSON.stringify(data));
      
      if (editingIssue) {
        await issueService.updateIssue(editingIssue.id, {
          issueDate: data.issueDate,
          issuedTo: data.issuedTo,
          notes: data.notes,
          items: data.items,
        });
      } else {
        console.log('Creating issue, user id:', user?.id);
        await issueService.createIssue(data, user?.id);
      }
      setIsModalOpen(false);
      fetchIssues();
    } catch (err: any) {
      console.error('Failed to save issue - full error:', err);
      console.error('Response data:', err.response?.data);
      console.error('Status:', err.response?.status);
      setError(err.response?.data?.message || 'Failed to save issue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteIssue = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this issue record? This will restore the inventory.')) {
      try {
        await issueService.deleteIssue(id);
        fetchIssues();
      } catch {
        setError('Failed to delete issue');
      }
    }
  };

  const totalItems = issues.reduce((sum, issue) => sum + issue.totalItems, 0);
  const totalValue = issues.reduce((sum, issue) => sum + issue.totalValue, 0);

  const statCards = [
    { title: 'Total Issues', value: issues.length, icon: Truck, gradient: 'from-amber-500 to-orange-600' },
    { title: 'Items Issued', value: totalItems, icon: Package, gradient: 'from-emerald-500 to-teal-600' },
    { title: 'Total Value', value: `Rs${totalValue.toLocaleString()}`, icon: DollarSign, gradient: 'from-blue-500 to-indigo-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Issue Tracking
            </h1>
            <p className="text-slate-400 mt-1">
              Track inventory items issued to bakery, shop, or production
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchIssues}
              className="flex items-center px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleAddIssue}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Issue
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map((stat, index) => {
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

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-slate-700/30 rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-slate-600 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-600 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-600 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No issue records found</p>
                <p className="text-slate-500 text-sm mt-1">Click "New Issue" to track issued inventory</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {issues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onEdit={handleEditIssue}
                    onDelete={handleDeleteIssue}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <IssueModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveIssue}
          issue={editingIssue}
          isLoading={isSaving}
        />
      </div>
    </DashboardLayout>
  );
};

export default InventoryDistributionPage;
