import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import { productService } from '../services/api';
import { Product, PRODUCT_CATEGORIES, CreateProductRequest } from '../types/product';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { CardSkeleton } from '../components/Skeleton';
import DashboardLayout from '../components/DashboardLayout';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showLowStock, setShowLowStock] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let data: Product[];
      
      if (showLowStock) {
        data = await productService.getLowStockProducts(10);
      } else if (searchQuery) {
        data = await productService.searchProducts(searchQuery);
      } else if (selectedCategory !== 'ALL') {
        data = await productService.getProductsByCategory(selectedCategory);
      } else {
        data = await productService.getAllProducts();
      }
      
      setProducts(data);
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, showLowStock]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData: CreateProductRequest, imageFile?: File) => {
    try {
      setIsSaving(true);
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData, imageFile);
      } else {
        await productService.createProduct(productData, imageFile);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete product. Please try again.');
      }
    }
  };

  const handleToggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      await productService.updateAvailability(id, !currentStatus);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product availability. Please try again.');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setShowLowStock(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Products</h1>
              <p className="text-slate-400 text-sm">Manage your products</p>
            </div>
          </div>
          <button
            onClick={handleAddProduct}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <p className="text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none"
                >
                  <option value="ALL">All Categories</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowLowStock(!showLowStock)}
                className={`flex items-center px-4 py-2.5 rounded-lg border transition-all ${
                  showLowStock
                    ? 'bg-red-500/20 border-red-500/30 text-red-300'
                    : 'border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Low Stock
              </button>

              {(searchQuery || selectedCategory !== 'ALL' || showLowStock) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-400 hover:underline px-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
            <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">No products found</p>
            <p className="text-slate-500 text-sm">
              {searchQuery || selectedCategory !== 'ALL' || showLowStock
                ? 'Try adjusting your filters'
                : 'Add your first product to get started'}
            </p>
            {(searchQuery || selectedCategory !== 'ALL' || showLowStock) && (
              <button onClick={clearFilters} className="mt-4 text-orange-400 hover:underline font-medium">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onToggleAvailability={handleToggleAvailability}
              />
            ))}
          </div>
        )}

        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
          product={editingProduct}
          isLoading={isSaving}
        />
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;
