import React from 'react';
import { Package } from 'lucide-react';
import { TopProductReport } from '../types/report';

interface TopProductsListProps {
  products: TopProductReport[];
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
}

const TopProductsList: React.FC<TopProductsListProps> = ({
  products,
  formatCurrency,
  formatNumber
}) => {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
            TOP PRODUCTS
          </h3>
          <Package className="h-5 w-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-gray-500">No product data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
          TOP PRODUCTS
        </h3>
        <Package className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {products.map((product, index) => (
          <div
            key={product.productId}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-[#FF6600] text-white rounded-full font-bold text-sm group-hover:scale-110 transition-transform">
                {index + 1}
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-[#FF6600] transition-colors">
                  {product.productName}
                </p>
                <p className="text-sm text-gray-500">
                  {formatNumber(product.totalQuantitySold)} sold
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#FF6600]">{formatCurrency(product.totalRevenue)}</p>
              <p className="text-xs text-gray-400">
                avg {formatCurrency(product.averagePrice)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProductsList;
