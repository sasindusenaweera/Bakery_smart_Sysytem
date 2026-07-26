import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, User, Phone, MapPin, FileText, ShoppingBag, CreditCard, Banknote } from 'lucide-react';
import { productService } from '../services/api';
import { Product } from '../types/product';
import { OrderCreate, OrderItemCreate, OrderResponse, PaymentMethod } from '../types/owner';
import { useAuth } from '../context/AuthContext';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrderCreate) => Promise<void>;
  order?: OrderResponse | null;
  isLoading?: boolean;
}

interface OrderItemRow {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const paymentMethods = [
  { value: 'CASH', label: 'Cash', icon: Banknote },
  { value: 'CARD', label: 'Card', icon: CreditCard },
  { value: 'CREDIT', label: 'Credit', icon: CreditCard },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Banknote },
];

const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  order,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [advancePayment, setAdvancePayment] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canCreateOrder = user?.role === 'OWNER' || user?.role === 'CASHIER';

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      if (order) {
        setCustomerName(order.customerName || '');
        setPhoneNumber(order.phoneNumber || '');
        setOrderDate(order.orderDate ? new Date(order.orderDate).toISOString().slice(0, 16) : '');
        setRequiredDate(order.requiredDate ? new Date(order.requiredDate).toISOString().slice(0, 16) : '');
        setDeliveryAddress(order.deliveryAddress || '');
        setNotes(order.notes || '');
        setAdvancePayment(order.advancePayment || 0);
        setPaymentMethod(order.paymentMethod || 'CASH');
        setItems(order.items?.map((item, idx) => ({
          id: `existing-${item.id}-${idx}`,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })) || []);
      } else {
        resetForm();
      }
    }
  }, [isOpen, order]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAvailableProducts();
      setProducts(data);
    } catch {
      console.error('Failed to load products');
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setPhoneNumber('');
    const now = new Date();
    setOrderDate(now.toISOString().slice(0, 16));
    setRequiredDate('');
    setDeliveryAddress('');
    setNotes('');
    setAdvancePayment(0);
    setPaymentMethod('CASH');
    setItems([]);
    setErrors({});
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: `new-${Date.now()}`, productId: 0, productName: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof OrderItemRow, value: number | string) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'productId') {
            const product = products.find((p) => p.id === Number(value));
            if (product) {
              updated.productName = product.name;
              updated.unitPrice = product.price;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  const calculateTotal = (): number => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!orderDate) newErrors.orderDate = 'Order date is required';
    if (items.length === 0) newErrors.items = 'At least one item is required';
    items.forEach((item, index) => {
      if (!item.productId) newErrors[`item-${index}`] = 'Please select a product';
      if (item.quantity <= 0) newErrors[`qty-${index}`] = 'Quantity must be positive';
    });
    if (advancePayment < 0) newErrors.advancePayment = 'Advance payment cannot be negative';
    if (advancePayment > calculateTotal()) newErrors.advancePayment = 'Advance payment cannot exceed total';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const orderItems: OrderItemCreate[] = items
      .filter((item) => item.productId > 0 && item.quantity > 0)
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

    const orderData: OrderCreate = {
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      orderDate: new Date(orderDate).toISOString(),
      requiredDate: requiredDate ? new Date(requiredDate).toISOString() : undefined,
      deliveryAddress: deliveryAddress.trim() || undefined,
      notes: notes.trim() || undefined,
      items: orderItems,
      advancePayment: advancePayment > 0 ? advancePayment : undefined,
      paymentMethod: advancePayment > 0 ? paymentMethod : undefined,
    };

    await onSubmit(orderData);
    onClose();
  };

  if (!isOpen) return null;

  const isViewMode = !!order;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between shadow-lg shadow-orange-500/20">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isViewMode ? 'Order Details' : 'New Customer Order'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Customer Name * {!canCreateOrder && <span className="text-red-400">(View Only)</span>}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 ${
                  errors.customerName ? 'border-red-500' : ''
                }`}
                disabled={isViewMode || !canCreateOrder}
              />
              {errors.customerName && (
                <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07X XXX XXXX"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                disabled={isViewMode || !canCreateOrder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Order Date *
              </label>
              <input
                type="datetime-local"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all bg-slate-700/50 border-slate-600/50 text-white ${
                  errors.orderDate ? 'border-red-500' : ''
                }`}
                disabled={isViewMode || !canCreateOrder}
              />
              {errors.orderDate && (
                <p className="text-red-500 text-xs mt-1">{errors.orderDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Required Date/Time
              </label>
              <input
                type="datetime-local"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all bg-slate-700/50 border-slate-600/50 text-white"
                disabled={isViewMode || !canCreateOrder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Delivery Address
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Delivery location (optional)"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                disabled={isViewMode || !canCreateOrder}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions or notes..."
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all resize-none bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                disabled={isViewMode || !canCreateOrder}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-200">Order Items</h3>
              {!isViewMode && canCreateOrder && (
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-500/30 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              )}
            </div>

            {errors.items && (
              <p className="text-red-500 text-sm mb-2">{errors.items}</p>
            )}

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 bg-slate-700/30 p-3 rounded-lg border border-slate-600/30">
                  <div className="flex-1">
                    {!isViewMode && canCreateOrder ? (
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(item.id, 'productId', Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/50 outline-none bg-slate-700 border-slate-600/50 text-white ${
                          errors[`item-${index}`] ? 'border-red-500' : ''
                        }`}
                      >
                        <option value={0}>Select Product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {formatCurrency(product.price)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-medium text-white">{item.productName}</span>
                    )}
                    {errors[`item-${index}`] && (
                      <p className="text-red-500 text-xs">{errors[`item-${index}`]}</p>
                    )}
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      min="1"
                      placeholder="Qty"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/50 text-center bg-slate-700 border-slate-600/50 text-white ${
                        errors[`qty-${index}`] ? 'border-red-500' : ''
                      }`}
                      disabled={isViewMode || !canCreateOrder}
                    />
                    {errors[`qty-${index}`] && (
                      <p className="text-red-500 text-xs">{errors[`qty-${index}`]}</p>
                    )}
                  </div>
                  <div className="w-28 text-right">
                    <span className="font-medium text-orange-400">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                  {!isViewMode && canCreateOrder && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 bg-slate-700/20 rounded-lg border border-slate-700/30">
                  <ShoppingBag className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">No items added yet</p>
                  {!isViewMode && canCreateOrder && (
                    <button
                      type="button"
                      onClick={addItem}
                      className="mt-2 text-orange-400 hover:text-orange-300 font-medium"
                    >
                      Add your first item
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {items.length > 0 && (
            <div className="border-t border-slate-700 pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-slate-300">Total Amount:</span>
                <span className="text-2xl font-bold text-orange-400">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>

              {canCreateOrder && !isViewMode && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-slate-300">Advance Payment:</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={advancePayment}
                        onChange={(e) => setAdvancePayment(Number(e.target.value))}
                        min="0"
                        max={calculateTotal()}
                        className={`w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/50 text-center font-bold bg-slate-700 border-slate-600/50 text-white ${
                          errors.advancePayment ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.advancePayment && (
                        <p className="text-red-500 text-xs">{errors.advancePayment}</p>
                      )}
                    </div>
                  </div>

                  {advancePayment > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {paymentMethods.map((method) => {
                          const Icon = method.icon;
                          return (
                            <button
                              key={method.value}
                              type="button"
                              onClick={() => setPaymentMethod(method.value as PaymentMethod)}
                              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                paymentMethod === method.value
                                  ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                  : 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {method.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {advancePayment > 0 && (
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="text-slate-300">Balance Due:</span>
                      <span className="text-lg font-bold text-green-400">
                        {formatCurrency(calculateTotal() - advancePayment)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
            >
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
            {!isViewMode && canCreateOrder && (
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
              >
                {isLoading ? 'Creating...' : 'Create Order'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
