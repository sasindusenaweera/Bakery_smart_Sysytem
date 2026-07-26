import React from 'react';
import { Edit, Trash2, Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Product, ProductCategory, PRODUCT_CATEGORIES } from '../types/product';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onToggleAvailability: (id: number, currentStatus: boolean) => void;
}

const categoryColors: Record<ProductCategory, string> = {
  BREAD: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  BUN: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  CAKES: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  PASTRIES: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  BEVERAGES: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  COOKIES: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  OTHER: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const getCategoryLabel = (category: ProductCategory): string => {
  return PRODUCT_CATEGORIES.find(c => c.value === category)?.label || category;
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(price);
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, onToggleAvailability }) => {
  const isLowStock = product.stockQuantity <= 10;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all group">
      <div className="relative h-40 bg-slate-700/50 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-16 w-16 text-slate-500" />
        )}
        
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={() => onToggleAvailability(product.id, product.isAvailable)}
            className={`p-1.5 rounded-full transition-colors ${
              product.isAvailable
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            }`}
            title={product.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
          >
            {product.isAvailable ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
          </button>
        </div>

        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white text-lg line-clamp-1">{product.name}</h3>
        </div>

        <p className="text-slate-400 text-sm line-clamp-2 mb-3">
          {product.description || 'No description available'}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${categoryColors[product.category]}`}>
            {getCategoryLabel(product.category)}
          </span>
          
          {isLowStock && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
              <AlertTriangle className="h-3 w-3" />
              Low Stock
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-orange-400">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-slate-400">
            Stock: {product.stockQuantity}
          </span>
        </div>

        <div className="flex space-x-2 pt-3 border-t border-slate-700/50">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
