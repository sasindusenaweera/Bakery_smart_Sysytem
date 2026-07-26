import React from 'react';
import { User, Shield, Mail, MoreVertical, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { User as UserType } from '../types';

interface UserCardProps {
  user: UserType;
  onEdit: (user: UserType) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

const roleColors: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-800',
  CASHIER: 'bg-blue-100 text-blue-800',
  BAKER: 'bg-orange-100 text-orange-800',
  STOREKEEPER: 'bg-green-100 text-green-800',
};

const roleIcons: Record<string, React.ReactNode> = {
  OWNER: <Shield className="h-4 w-4" />,
  CASHIER: <User className="h-4 w-4" />,
  BAKER: <User className="h-4 w-4" />,
  STOREKEEPER: <User className="h-4 w-4" />,
};

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#FF6600] to-orange-400 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user.username}</h3>
            <div className="flex items-center text-gray-500 text-sm mt-0.5">
              <Mail className="h-3 w-3 mr-1" />
              {user.email}
            </div>
          </div>
        </div>
        <div className="relative">
          <button className="p-1.5 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
          {roleIcons[user.role]}
          <span className="ml-1.5">{user.role}</span>
        </span>
        <button
          onClick={() => onToggleStatus(user.id)}
          className={`flex items-center text-sm ${user.active ? 'text-green-600' : 'text-gray-400'}`}
        >
          {user.active ? (
            <ToggleRight className="h-5 w-5" />
          ) : (
            <ToggleLeft className="h-5 w-5" />
          )}
          <span className="ml-1">{user.active ? 'Active' : 'Inactive'}</span>
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-3">
        <button
          onClick={() => onEdit(user)}
          className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-[#00008B] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default UserCard;
