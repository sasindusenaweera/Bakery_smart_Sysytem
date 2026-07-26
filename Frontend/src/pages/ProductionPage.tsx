import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Factory, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { productionService } from '../services/productionService';
import { ProductionResponse, ProductionCreate } from '../types/owner';
import ProductionCard from '../components/ProductionCard';
import ProductionModal from '../components/ProductionModal';
import DashboardLayout from '../components/DashboardLayout';

const ProductionPage: React.FC = () => {
  const { user } = useAuth();
  const [productions, setProductions] = useState<ProductionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduction, setEditingProduction] = useState<ProductionResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = user?.role === 'OWNER' || user?.role === 'BAKER';

  const fetchProductions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const productionsData = await productionService.getAllProductions();
      setProductions(productionsData);
    } catch {
      setError('Failed to load productions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductions();
  }, []);

  const handleAddProduction = () => {
    setEditingProduction(null);
    setIsModalOpen(true);
  };

  const handleEditProduction = (production: ProductionResponse) => {
    setEditingProduction(production);
    setIsModalOpen(true);
  };

  const handleSaveProduction = async (data: ProductionCreate) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      console.log('Sending production data:', JSON.stringify(data, null, 2));

      if (editingProduction) {
        await productionService.updateProduction(editingProduction.id, {
          productionDate: data.productionDate,
          notes: data.notes,
          items: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            wasteQuantity: item.wasteQuantity,
          })),
        });
        setSuccessMessage('Production updated successfully!');
      } else {
        const response = await productionService.createProduction(data, user?.id);
        console.log('Production created successfully:', response);
        setSuccessMessage('Production added successfully!');
      }

      setIsModalOpen(false);
      await fetchProductions();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      console.error('Full error details:', err);
      const errorMessage = err instanceof Error ? err.message :
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save production. Please check console for details.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduction = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this production record?')) {
      try {
        await productionService.deleteProduction(id);
        fetchProductions();
      } catch {
        setError('Failed to delete production');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Production Management
            </h1>
            <p className="text-slate-400 mt-1">
              Track and manage daily bakery production
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchProductions}
              className="flex items-center px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {canEdit && (
              <button
                onClick={handleAddProduction}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Production
              </button>
            )}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-blue-300 text-sm leading-relaxed">
            <strong>Note:</strong> Production records do not automatically update product stock. Stock must be updated manually. This is a tracking record. Storekeepers and Owners can add produced items to the product stock from the Products page.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-6">
            {successMessage && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
                {successMessage}
              </div>
            )}
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
            ) : productions.length === 0 ? (
              <div className="text-center py-12">
                <Factory className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No production records found</p>
                <p className="text-slate-500 text-sm mt-1">Click "New Production" to create your first record</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productions.map((production) => (
                  <ProductionCard
                    key={production.id}
                    production={production}
                    onEdit={canEdit ? handleEditProduction : undefined}
                    onDelete={canEdit ? handleDeleteProduction : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <ProductionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduction}
          production={editingProduction}
          isLoading={isSaving}
        />
      </div>
    </DashboardLayout>
  );
};

export default ProductionPage;
