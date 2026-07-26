import React from 'react';
import { Phone, Mail, MapPin, Truck, FileText, Edit2, Trash2 } from 'lucide-react';
import { SupplierResponse } from '../types/purchase';

interface Props {
  supplier: SupplierResponse;
  onEdit: (supplier: SupplierResponse) => void;
  onToggleStatus: (id: number, active: boolean) => void;
  onDelete: (id: number) => void;
}

export const SupplierCard: React.FC<Props> = ({ supplier, onEdit, onToggleStatus, onDelete }) => {

  return (
    <div
      className={`bg-slate-800/50 border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 group ${
        supplier.active ? 'border-slate-700' : 'border-slate-700 opacity-75'
      }`}
    >
      <div className={`px-6 py-4 ${supplier.active ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-gray-600 to-gray-700'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-bold text-white uppercase truncate max-w-[180px]">
              {supplier.name}
            </span>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              supplier.active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {supplier.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3 mb-4">
          {supplier.contactPerson && (
            <div className="flex items-center text-sm text-slate-300">
              <span className="w-24 font-medium text-slate-400">Contact:</span>
              <span className="text-white">{supplier.contactPerson}</span>
            </div>
          )}
          {supplier.phoneNumber && (
            <div className="flex items-center text-sm text-slate-400">
              <Phone className="h-4 w-4 mr-2 text-slate-500 flex-shrink-0" />
              <span className="text-slate-300 truncate">{supplier.phoneNumber}</span>
            </div>
          )}
          {supplier.email && (
            <div className="flex items-center text-sm text-slate-400">
              <Mail className="h-4 w-4 mr-2 text-slate-500 flex-shrink-0" />
              <span className="text-slate-300 truncate">{supplier.email}</span>
            </div>
          )}
          {supplier.address && (
            <div className="flex items-center text-sm text-slate-400">
              <MapPin className="h-4 w-4 mr-2 text-slate-500 flex-shrink-0" />
              <span className="text-slate-300 truncate">{supplier.address}</span>
            </div>
          )}
        </div>

        {supplier.itemsSupplied && (
          <div className="mb-4 pb-4 border-b border-slate-700">
            <div className="flex items-center text-xs text-slate-500 mb-1">
              <FileText className="h-3 w-3 mr-1" />
              Items Supplied
            </div>
            <p className="text-sm text-slate-300">{supplier.itemsSupplied}</p>
          </div>
        )}

        <div className="flex space-x-2 pt-3 border-t border-slate-700">
          <button
            onClick={() => onDelete(supplier.id)}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-all duration-200 flex items-center justify-center active:scale-95"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </button>
          <button
            onClick={() => onEdit(supplier)}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-all duration-200 flex items-center justify-center active:scale-95"
          >
            <Edit2 className="h-4 w-4 mr-1.5" />
            Edit
          </button>
          <button
            onClick={() => onToggleStatus(supplier.id, !supplier.active)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 ${
              supplier.active
                ? 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
            }`}
          >
            {supplier.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
};
