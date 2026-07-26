import React from 'react';
import { Truck, Edit2, Trash2, Package, User, Clock } from 'lucide-react';
import { IssueResponse } from '../types/issue';

interface IssueCardProps {
  issue: IssueResponse;
  onEdit: (issue: IssueResponse) => void;
  onDelete: (id: number) => void;
}

const getIssuedToColor = (issuedTo: string) => {
  switch (issuedTo.toLowerCase()) {
    case 'bakery':
      return 'from-amber-500 to-orange-600';
    case 'shop':
      return 'from-emerald-500 to-teal-600';
    case 'production':
      return 'from-blue-500 to-indigo-600';
    default:
      return 'from-slate-500 to-gray-600';
  }
};

const IssueCard: React.FC<IssueCardProps> = ({ issue, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalItems = issue.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/50 transition-all duration-300 group">
      <div className={`bg-gradient-to-r ${getIssuedToColor(issue.issuedTo)} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                Issue #{issue.id}
              </span>
              <p className="text-white font-bold text-sm">{issue.issuedTo}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(issue)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Edit2 className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={() => onDelete(issue.id)}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4 text-sm text-slate-400">
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {formatDate(issue.issueDate)}
          </span>
          {issue.createdBy && (
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {issue.createdBy}
            </span>
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-400 mb-2">Items Issued</p>
          <div className="space-y-2">
            {issue.items?.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2 bg-slate-700/30 rounded-lg"
              >
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-slate-500 mr-2" />
                  <span className="text-sm font-medium text-slate-200">
                    {item.itemName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400">
                    {item.quantity} {item.unit}
                  </span>
                  <p className="text-xs text-slate-500">
                    Rs{item.subtotal.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {issue.items?.length > 3 && (
              <p className="text-xs text-slate-500 text-center">
                +{issue.items.length - 3} more items
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/50">
          <div className="text-center p-2 bg-slate-700/30 rounded-lg">
            <p className="text-lg font-bold text-white">{totalItems}</p>
            <p className="text-xs text-slate-500">Total Items</p>
          </div>
          <div className="text-center p-2 bg-slate-700/30 rounded-lg">
            <p className="text-lg font-bold text-emerald-400">
              Rs{issue.totalValue.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Total Value</p>
          </div>
        </div>

        {issue.notes && (
          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Notes</p>
            <p className="text-sm text-slate-300">{issue.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
