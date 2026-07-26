import React, { useState, useEffect } from 'react';
import { X, Truck, Phone, Mail, MapPin, Clock, FileText } from 'lucide-react';
import { SupplierCreate, SupplierUpdate, SupplierResponse } from '../types/purchase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierCreate | SupplierUpdate) => Promise<void>;
  supplier?: SupplierResponse | null;
  mode: 'create' | 'edit';
}

const initialForm: SupplierCreate = {
  name: '',
  contactPerson: '',
  phoneNumber: '',
  email: '',
  address: '',
  itemsSupplied: '',
  leadTimeDays: undefined,
  paymentTerms: '',
};

export const SupplierModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, supplier, mode }) => {
  const [form, setForm] = useState<SupplierCreate>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (supplier && mode === 'edit') {
      setForm({
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        phoneNumber: supplier.phoneNumber || '',
        email: supplier.email || '',
        address: supplier.address || '',
        itemsSupplied: supplier.itemsSupplied || '',
        leadTimeDays: supplier.leadTimeDays,
        paymentTerms: supplier.paymentTerms || '',
      });
    } else {
      setForm(initialForm);
    }
  }, [supplier, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      setError('Supplier name is required');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(form);
      onClose();
    } catch {
      setError('Failed to save supplier. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {mode === 'create' ? 'Add New Supplier' : 'Edit Supplier'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Supplier Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-200 placeholder-slate-400"
                placeholder="Enter supplier name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                Contact Person
              </label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-200 placeholder-slate-400"
                placeholder="Contact person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-200 placeholder-slate-400"
                placeholder="+94 XX XXX XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-200 placeholder-slate-400"
                placeholder="supplier@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Lead Time (Days)
              </label>
              <input
                type="number"
                min="0"
                value={form.leadTimeDays || ''}
                onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-200 placeholder-slate-400"
                placeholder="e.g., 3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Address
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-200 placeholder-slate-400 resize-none"
                placeholder="Full address"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Items Supplied
              </label>
              <input
                type="text"
                value={form.itemsSupplied}
                onChange={(e) => setForm({ ...form, itemsSupplied: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-200 placeholder-slate-400"
                placeholder="e.g., Flour, Sugar, Eggs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                Payment Terms
              </label>
              <input
                type="text"
                value={form.paymentTerms}
                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-200 placeholder-slate-400"
                placeholder="e.g., Net 30, Cash on delivery"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Supplier' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
