import React, { useState, useEffect, useRef } from 'react';
import { X, Package, Tag, DollarSign, Image, Package as PackageIcon, Upload, Trash2, Camera } from 'lucide-react';
import { Product, ProductCategory, PRODUCT_CATEGORIES, CreateProductRequest } from '../types/product';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: CreateProductRequest, imageFile?: File) => void;
  product: Product | null;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('BREAD');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setCostPrice(product.costPrice?.toString() || '');
      setCategory(product.category);
      setImageUrl(product.imageUrl || '');
      setImageFile(null);
      setImagePreview(product.imageUrl || null);
      setStockQuantity(product.stockQuantity.toString());
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCostPrice('');
      setCategory('BREAD');
      setImageUrl('');
      setImageFile(null);
      setImagePreview(null);
      setStockQuantity('0');
    }
    setErrors({});
  }, [product, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!price || parseFloat(price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (stockQuantity && parseInt(stockQuantity) < 0) newErrors.stockQuantity = 'Stock quantity cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Only JPG, JPEG, and PNG files are allowed' }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ ...prev, image: 'File size must be less than 2MB' }));
      return;
    }
    setErrors(prev => { const { image, ...rest } = prev; return rest; });
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(
        {
          name: name.trim(),
          description: description.trim() || undefined,
          price: parseFloat(price),
          costPrice: costPrice ? parseFloat(costPrice) : undefined,
          category,
          imageUrl: imageUrl.trim() || undefined,
          stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
        },
        imageFile || undefined
      );
    }
  };

  const [stockQuantity, setStockQuantity] = useState('');

  useEffect(() => {
    if (product) {
      setStockQuantity(product.stockQuantity.toString());
    } else {
      setStockQuantity('0');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between shadow-lg shadow-orange-500/20">
          <h2 className="text-xl font-bold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <PackageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all text-white placeholder-slate-400 ${
                  errors.name ? 'border-red-500' : 'border-slate-600/50'
                }`}
                placeholder="Enter product name"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all resize-none text-white placeholder-slate-400"
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all text-white placeholder-slate-400 ${
                    errors.price ? 'border-red-500' : 'border-slate-600/50'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cost Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all text-white placeholder-slate-400"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all appearance-none text-white"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Stock Quantity</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all text-white placeholder-slate-400 ${
                    errors.stockQuantity ? 'border-red-500' : 'border-slate-600/50'
                  }`}
                  placeholder="0"
                />
              </div>
              {errors.stockQuantity && <p className="text-red-500 text-xs mt-1">{errors.stockQuantity}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              <Camera className="h-4 w-4 inline mr-1" />
              Product Image
            </label>
            
            {imagePreview ? (
              <div className="relative mt-2">
                <div className="relative w-full h-48 bg-slate-700/50 rounded-lg overflow-hidden border-2 border-dashed border-slate-600/50">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    title="Change Image"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {imageFile && (
                  <p className="mt-2 text-sm text-slate-400 truncate">
                    {imageFile.name}
                  </p>
                )}
              </div>
            ) : (
              <div
                className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-slate-600/50 hover:border-slate-500 bg-slate-700/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-slate-700/50 p-4 rounded-full mb-3">
                    <Image className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-sm mb-1">
                    Drag and drop an image here, or click to select
                  </p>
                  <p className="text-slate-500 text-xs">
                    JPG, PNG, JPEG (max 2MB)
                  </p>
                  <button
                    type="button"
                    className="mt-3 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-500/30 transition-colors flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </button>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">{errors.image}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-medium transition-colors disabled:opacity-50 shadow-lg shadow-orange-500/20"
            >
              {isLoading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
