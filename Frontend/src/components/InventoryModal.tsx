import React, { useState, useEffect, useRef } from 'react';
import {
  X, Package, Scale, DollarSign, Truck, FileText, ExternalLink,
  Image, Upload, Trash2, Camera, Wifi, WifiOff, RefreshCw, Minus, CheckSquare
} from 'lucide-react';
import { InventoryItem, COMMON_UNITS, CreateInventoryRequest } from '../types/inventory';
import { supplierService } from '../services/purchaseService';

interface Supplier { id: number; name: string; }

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: CreateInventoryRequest, imageFile?: File) => void;
  item: InventoryItem | null;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const SCALE_UNITS = ['kg', 'g'];

const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onSave, item, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('kg');
  const [currentStock, setCurrentStock] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [supplier, setSupplier] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scale state
  const [scaleConnected, setScaleConnected] = useState(false);
  const [scaleConnecting, setScaleConnecting] = useState(false);
  const [liveWeight, setLiveWeight] = useState<number | null>(null);
  const [autoFill, setAutoFill] = useState(false);
  const [scaleVisible, setScaleVisible] = useState(false);
  const liveWeightInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const showScale = SCALE_UNITS.includes(unit);

  // Animate scale section in/out
  useEffect(() => {
    if (showScale) {
      setScaleVisible(true);
    } else {
      setScaleVisible(false);
      // Disconnect if unit changes away
      if (scaleConnected) disconnectScale();
    }
  }, [showScale]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try { const data = await supplierService.getActive(); setSuppliers(data); }
      catch (err) { console.error('Failed to fetch suppliers'); }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description || '');
      setUnit(item.unit);
      setCurrentStock(item.currentStock.toString());
      setMinimumStock(item.minimumStock.toString());
      setCostPerUnit(item.costPerUnit?.toString() || '');
      setSupplier(item.supplier || '');
      setImageUrl(item.imageUrl || '');
      setImageFile(null);
      setImagePreview(item.imageUrl || null);
    } else {
      setName(''); setDescription(''); setUnit('kg');
      setCurrentStock('0'); setMinimumStock('0'); setCostPerUnit('');
      setSupplier(''); setImageUrl(''); setImageFile(null); setImagePreview(null);
    }
    setErrors({});
    setScaleConnected(false);
    setLiveWeight(null);
    setAutoFill(false);
    if (liveWeightInterval.current) clearInterval(liveWeightInterval.current);
  }, [item, isOpen]);

  // Cleanup on unmount
  useEffect(() => () => { if (liveWeightInterval.current) clearInterval(liveWeightInterval.current); }, []);

  const simulateLiveWeight = () => {
    if (liveWeightInterval.current) clearInterval(liveWeightInterval.current);
    liveWeightInterval.current = setInterval(() => {
      const w = parseFloat((Math.random() * 5 + 0.1).toFixed(3));
      setLiveWeight(w);
      setAutoFill(prev => {
        if (prev) setCurrentStock(w.toString());
        return prev;
      });
    }, 800);
  };

  const connectScale = () => {
    setScaleConnecting(true);
    setTimeout(() => {
      setScaleConnecting(false);
      setScaleConnected(true);
      simulateLiveWeight();
    }, 1500);
  };

  const disconnectScale = () => {
    setScaleConnected(false);
    setLiveWeight(null);
    setAutoFill(false);
    if (liveWeightInterval.current) { clearInterval(liveWeightInterval.current); liveWeightInterval.current = null; }
  };

  const readWeight = () => {
    if (liveWeight !== null) setCurrentStock(liveWeight.toString());
  };

  const tare = () => { setLiveWeight(0); };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Item name is required';
    if (!unit) newErrors.unit = 'Unit is required';
    if (currentStock === '' || parseFloat(currentStock) < 0) newErrors.currentStock = 'Current stock cannot be negative';
    if (minimumStock === '' || parseFloat(minimumStock) < 0) newErrors.minimumStock = 'Minimum stock cannot be negative';
    if (costPerUnit && parseFloat(costPerUnit) < 0) newErrors.costPerUnit = 'Cost cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) { setErrors(prev => ({ ...prev, image: 'Only JPG, JPEG, and PNG files are allowed' })); return; }
    if (file.size > MAX_FILE_SIZE) { setErrors(prev => ({ ...prev, image: 'File size must be less than 2MB' })); return; }
    setErrors(prev => { const { image, ...rest } = prev; return rest; });
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
  };
  const removeImage = () => {
    setImageFile(null); setImagePreview(null); setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        name: name.trim(), description: description.trim() || undefined,
        unit, currentStock: parseFloat(currentStock), minimumStock: parseFloat(minimumStock),
        costPerUnit: costPerUnit ? parseFloat(costPerUnit) : undefined,
        supplier: supplier || undefined, imageUrl: imageUrl.trim() || undefined,
      }, imageFile || undefined);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes scaleSlideIn {
          from { opacity: 0; transform: translateY(-12px) scaleY(0.95); max-height: 0; }
          to   { opacity: 1; transform: translateY(0)   scaleY(1);    max-height: 600px; }
        }
        @keyframes scaleSlideOut {
          from { opacity: 1; transform: translateY(0)   scaleY(1);    max-height: 600px; }
          to   { opacity: 0; transform: translateY(-12px) scaleY(0.95); max-height: 0; }
        }
        .scale-section-enter { animation: scaleSlideIn 0.35s cubic-bezier(0.4,0,0.2,1) forwards; overflow: hidden; }
        .scale-section-exit  { animation: scaleSlideOut 0.25s cubic-bezier(0.4,0,0.2,1) forwards; overflow: hidden; }
        @keyframes weightPulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.6; }
        }
        .weight-live { animation: weightPulse 1.6s ease-in-out infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; display: inline-block; }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <h2 className="text-xl font-bold text-white">{item ? 'Edit Inventory Item' : 'Add Inventory Item'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Item Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-500 ${errors.name ? 'border-red-500' : 'border-slate-600'}`}
                  placeholder="e.g., Flour"
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none text-white placeholder-slate-500"
                  placeholder="Optional description" />
              </div>
            </div>

            {/* Unit & Supplier */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Unit <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select value={unit} onChange={(e) => setUnit(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all appearance-none text-white">
                    {COMMON_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Supplier
                  <a href="/suppliers" target="_blank" className="ml-2 text-orange-400 hover:text-orange-300 inline-flex items-center">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </label>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select value={supplier} onChange={(e) => setSupplier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all appearance-none text-white">
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ─── Digital Scale Section (kg / g only) ─── */}
            {scaleVisible && (
              <div className={showScale ? 'scale-section-enter' : 'scale-section-exit'}>
                <div className="rounded-xl border border-slate-600/60 bg-slate-700/30 overflow-hidden">
                  {/* Scale Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-700/50 border-b border-slate-600/40">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-semibold text-slate-200">Digital Scale</span>
                      <span className="text-xs text-slate-500">({unit})</span>
                    </div>
                    {/* Status badge */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${scaleConnected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-600/50 text-slate-400'}`}>
                      {scaleConnected
                        ? <><Wifi className="h-3 w-3" /> Connected</>
                        : <><WifiOff className="h-3 w-3" /> Disconnected</>}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Connect / Disconnect */}
                    <div className="flex gap-2">
                      {!scaleConnected ? (
                        <button type="button" onClick={connectScale} disabled={scaleConnecting}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium transition-all disabled:opacity-60">
                          {scaleConnecting
                            ? <><RefreshCw className="h-4 w-4 spin" /> Connecting…</>
                            : <><Wifi className="h-4 w-4" /> Connect Scale</>}
                        </button>
                      ) : (
                        <button type="button" onClick={disconnectScale}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-sm font-medium transition-all">
                          <WifiOff className="h-4 w-4" /> Disconnect
                        </button>
                      )}
                    </div>

                    {/* Live Weight Display */}
                    {scaleConnected && (
                      <div className="rounded-lg bg-slate-800/70 border border-slate-600/40 p-3 text-center">
                        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Live Weight</p>
                        <p className={`text-3xl font-bold font-mono ${liveWeight !== null ? 'text-orange-400 weight-live' : 'text-slate-500'}`}>
                          {liveWeight !== null ? liveWeight.toFixed(3) : '—'}
                          <span className="text-base font-normal text-slate-400 ml-1">{unit}</span>
                        </p>
                      </div>
                    )}

                    {/* Read Weight & Tare */}
                    {scaleConnected && (
                      <div className="flex gap-2">
                        <button type="button" onClick={readWeight}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 text-sm font-medium transition-all">
                          <RefreshCw className="h-4 w-4" /> Read Weight
                        </button>
                        <button type="button" onClick={tare}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-600/40 hover:bg-slate-600/60 border border-slate-500/40 text-slate-300 text-sm font-medium transition-all">
                          <Minus className="h-4 w-4" /> Tare
                        </button>
                      </div>
                    )}

                    {/* Auto-fill toggle */}
                    {scaleConnected && (
                      <button type="button" onClick={() => setAutoFill(p => !p)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${autoFill ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'bg-slate-700/40 border-slate-600/40 text-slate-400 hover:border-slate-500/60'}`}>
                        <span className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4" />
                          Auto-fill Quantity from Scale
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${autoFill ? 'bg-orange-500/30 text-orange-300' : 'bg-slate-600/50 text-slate-500'}`}>
                          {autoFill ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    )}

                    {/* Manual entry hint when disconnected */}
                    {!scaleConnected && (
                      <p className="text-xs text-slate-500 text-center">
                        Scale disconnected — enter quantity manually below.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Current Stock & Minimum Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Current Stock <span className="text-red-500">*</span>
                  {showScale && scaleConnected && autoFill && (
                    <span className="ml-1 text-xs text-orange-400">(auto)</span>
                  )}
                </label>
                <input
                  type="number" step="0.01" min="0" value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                  readOnly={showScale && scaleConnected && autoFill}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-500 ${errors.currentStock ? 'border-red-500' : 'border-slate-600'} ${showScale && scaleConnected && autoFill ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
                {errors.currentStock && <p className="text-red-400 text-xs mt-1">{errors.currentStock}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Minimum Stock <span className="text-red-500">*</span></label>
                <input
                  type="number" step="0.01" min="0" value={minimumStock}
                  onChange={(e) => setMinimumStock(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-500 ${errors.minimumStock ? 'border-red-500' : 'border-slate-600'}`}
                />
                {errors.minimumStock && <p className="text-red-400 text-xs mt-1">{errors.minimumStock}</p>}
              </div>
            </div>

            {/* Cost Per Unit */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cost Per Unit</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="number" step="0.01" min="0" value={costPerUnit}
                  onChange={(e) => setCostPerUnit(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-500 ${errors.costPerUnit ? 'border-red-500' : 'border-slate-600'}`}
                  placeholder="0.00"
                />
              </div>
              {errors.costPerUnit && <p className="text-red-400 text-xs mt-1">{errors.costPerUnit}</p>}
            </div>

            {/* Item Image */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Camera className="h-4 w-4 inline mr-1" />Item Image
              </label>
              {imagePreview ? (
                <div className="relative mt-2">
                  <div className="relative w-full h-40 bg-slate-700/50 rounded-lg overflow-hidden border-2 border-dashed border-slate-600/50">
                    <img src={imagePreview} alt="Item preview" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg transition-colors" title="Change Image">
                      <Upload className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={removeImage}
                      className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors" title="Remove Image">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {imageFile && <p className="mt-2 text-sm text-slate-400 truncate">{imageFile.name}</p>}
                </div>
              ) : (
                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${dragActive ? 'border-orange-500 bg-orange-500/10' : 'border-slate-600/50 hover:border-slate-500 bg-slate-700/30'}`}
                  onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}>
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-700/50 p-3 rounded-full mb-2">
                      <Image className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-400 text-sm mb-1">Drag and drop an image here, or click to select</p>
                    <p className="text-slate-500 text-xs">JPG, PNG, JPEG (max 2MB)</p>
                    <button type="button"
                      className="mt-2 px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-500/30 transition-colors flex items-center"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                      <Upload className="h-3 w-3 mr-1" /> Choose Image
                    </button>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept={ALLOWED_TYPES.join(',')} onChange={handleFileInputChange} className="hidden" />
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-medium transition-colors disabled:opacity-50">
                {isLoading ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default InventoryModal;