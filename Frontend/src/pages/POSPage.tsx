import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Search, Plus, Minus, Trash2, CreditCard,
  Banknote, Calculator, Receipt, X, CheckCircle, PackageSearch,
  Tag, ChevronRight, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { productService, salesService } from '../services/api';
import { Product } from '../types/product';
import { CartItem, PaymentMethod, PAYMENT_METHODS, Sale } from '../types/sales';
import { ownerService } from '../services/ownerService';
import { CreditCustomerCreate } from '../types/owner';
import DashboardLayout from '../components/DashboardLayout';

const POSPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditCustomer, setCreditCustomer] = useState<CreditCustomerCreate>({
    customerName: '',
    phoneNumber: '',
    address: '',
    creditAmount: 0,
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getAvailableProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category)))];

  const isOutOfStock = (product: Product) => !product.isAvailable || product.stockQuantity <= 0;

  const addToCart = (product: Product) => {
    if (isOutOfStock(product)) {
      showTemporaryError('This item is currently out of stock');
      return;
    }

    const cartItem = cart.find(item => item.productId === product.id);
    const currentQtyInCart = cartItem ? cartItem.quantity : 0;
    const availableStock = product.stockQuantity;

    if (currentQtyInCart >= availableStock) {
      showTemporaryError(`Only ${availableStock} items available in stock`);
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        subtotal: product.price
      }]);
    }
  };

  const showTemporaryError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 3000);
  };

  const updateQuantity = (productId: number, delta: number) => {
    const cartItem = cart.find(item => item.productId === productId);
    const product = products.find(p => p.id === productId);
    if (!cartItem || !product) return;

    const newQty = cartItem.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.map(item => {
        if (item.productId === productId) return null;
        return item;
      }).filter(Boolean) as CartItem[]);
      return;
    }

    if (newQty > product.stockQuantity) {
      showTemporaryError(`Only ${product.stockQuantity} items available in stock`);
      return;
    }

    setCart(cart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: newQty, subtotal: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setAmountPaid('');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = Math.max(0, subtotal - discount);

  const handlePayment = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'CREDIT') {
      setCreditCustomer({
        customerName: '',
        phoneNumber: '',
        address: '',
        creditAmount: total,
        dueDate: '',
        notes: cart.map(item => `${item.quantity}x ${item.productName}`).join(', ')
      });
      setShowCreditModal(true);
      return;
    }

    await processSale();
  };

  const processSale = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const sale = await salesService.createSale({
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        discountAmount: discount,
        paymentMethod,
        amountPaid: paymentMethod === 'CASH' ? parseFloat(amountPaid) || total : total,
        cashierId: user?.id,
        cashierName: user?.username
      });

      if (paymentMethod === 'CREDIT') {
        await ownerService.createCreditCustomer(creditCustomer);
      }

      setLastSale(sale);
      setShowPaymentModal(false);
      setShowCreditModal(false);
      setShowReceiptModal(true);
      clearCart();
      setTimeout(() => {
        fetchProducts();
      }, 500);
    } catch (err: any) {
      console.error('Sale error:', err);
      showTemporaryError(err.response?.data?.message || err.message || 'Failed to process sale');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const changeAmount = paymentMethod === 'CASH'
    ? Math.max(0, (parseFloat(amountPaid) || 0) - total)
    : 0;

  return (
    <DashboardLayout>
      {/* Toast Error */}
      {error && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-red-500/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-400/30">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-4 opacity-70 hover:opacity-100 transition-opacity">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="h-[calc(100vh-2rem)] flex flex-col">
        {/* Header Section */}
        <div className="flex-none flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl shadow-lg shadow-orange-500/20">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              Point of Sale
            </h1>
            <p className="text-slate-400 mt-1 ml-14">Streamlined checkout experience</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-300">Cashier</p>
              <p className="text-xs text-slate-500">{user?.username || 'Guest'}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border-2 border-slate-500/30 flex items-center justify-center shadow-inner">
              <span className="text-sm font-bold text-white">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
          </div>
        </div>

        {/* Main POS Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          
          {/* Left Panel: Product Grid */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
            {/* Top Bar: Search & Filter */}
            <div className="p-5 border-b border-slate-700/50 bg-slate-800/20">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name..."
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-slate-700/60 rounded-2xl focus:ring-2 focus:ring-orange-500/50 text-slate-200 placeholder-slate-500 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Categories Scrollable Row */}
              <div className="flex space-x-2 mt-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`snap-start px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25 border border-orange-400/50'
                        : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-700/60 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {cat === 'ALL' ? <PackageSearch className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
                    {cat === 'ALL' ? 'All Items' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-auto p-5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-slate-800/40 rounded-2xl h-48 animate-pulse border border-slate-700/30"></div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <div className="p-6 bg-slate-800/30 rounded-full border border-slate-700/50">
                    <PackageSearch className="h-12 w-12 opacity-50" />
                  </div>
                  <p className="text-lg font-medium text-slate-400">No products found</p>
                  <button onClick={() => {setSearchQuery(''); setSelectedCategory('ALL');}} className="text-orange-400 hover:text-orange-300 text-sm font-medium">Clear filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
                  {filteredProducts.map(product => {
                    const outOfStock = !product.isAvailable || product.stockQuantity <= 0;
                    return (
                      <button
                        key={product.id}
                        onClick={() => outOfStock ? null : addToCart(product)}
                        disabled={outOfStock}
                        className={`group relative bg-slate-800/40 backdrop-blur-sm border rounded-2xl p-4 transition-all duration-300 text-left overflow-hidden ${
                          outOfStock
                            ? 'border-red-500/20 opacity-60 cursor-not-allowed grayscale-[0.5]'
                            : 'border-slate-700/50 hover:border-orange-500/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 hover:bg-slate-800/80'
                        }`}
                      >
                        {/* Image Container */}
                        <div className="h-32 bg-slate-900/50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingCart className={`h-10 w-10 transition-colors ${outOfStock ? 'text-red-500/50' : 'text-slate-600 group-hover:text-orange-400/50'}`} />
                          )}
                          
                          {/* Out of Stock Overlay */}
                          {outOfStock && (
                            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] flex items-center justify-center">
                              <span className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-bold text-xs uppercase tracking-wider">
                                Out of Stock
                              </span>
                            </div>
                          )}

                          {/* Category Badge overlay */}
                          <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] font-bold text-white/90 uppercase tracking-wider">
                            {product.category}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1">
                          <h3 className={`font-semibold text-[15px] leading-tight line-clamp-1 ${outOfStock ? 'text-slate-400' : 'text-slate-100 group-hover:text-white'}`}>
                            {product.name}
                          </h3>
                          <div className="flex items-end justify-between pt-1">
                            <p className={`font-bold text-lg tracking-tight ${outOfStock ? 'text-slate-500' : 'text-orange-400'}`}>
                              {formatCurrency(product.price)}
                            </p>
                            {!outOfStock && (
                              <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-slate-950/50 border border-slate-700/50 text-slate-400">
                                Qty: {product.stockQuantity}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Cart & Checkout */}
          <div className="w-full lg:w-[420px] flex flex-col bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl shrink-0">
            {/* Cart Header */}
            <div className="p-5 border-b border-slate-700/50 bg-slate-800/20 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Current Order
                <span className="bg-orange-500/20 text-orange-400 text-xs py-0.5 px-2.5 rounded-full border border-orange-500/30">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                </span>
              </h2>
              {cart.length > 0 && (
                <button 
                  onClick={clearCart}
                  className="text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-auto p-5 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-80">
                  <div className="p-5 bg-slate-800/40 rounded-full mb-4 border border-slate-700/50">
                    <ShoppingCart className="h-10 w-10" />
                  </div>
                  <p className="font-medium text-slate-300">Your cart is empty</p>
                  <p className="text-sm mt-1 text-slate-500">Add products from the menu</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.productId} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 transition-all hover:border-slate-600/50">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-slate-200 text-[15px] flex-1 pr-4">{item.productName}</h4>
                        <button 
                          onClick={() => removeFromCart(item.productId)} 
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-400">
                          {formatCurrency(item.unitPrice)}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-slate-700/50">
                            <button 
                              onClick={() => updateQuantity(item.productId, -1)} 
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-3 w-3 text-white" />
                            </button>
                            <span className="w-8 text-center font-bold text-white text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.productId, 1)} 
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-3 w-3 text-white" />
                            </button>
                          </div>
                          
                          <span className="font-bold text-white min-w-[80px] text-right">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Section */}
            <div className="bg-slate-800/60 border-t border-slate-700/50 p-5 backdrop-blur-md">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-400 text-sm font-medium">
                  <span>Subtotal</span>
                  <span className="text-slate-300">{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center group">
                  <span className="text-slate-400 text-sm font-medium">Discount</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rs</span>
                    <input
                      type="number"
                      value={discount || ''}
                      onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-32 pl-8 pr-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-right text-sm font-bold text-orange-400 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all group-hover:border-slate-600"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-slate-700/50 mt-4">
                  <span className="text-slate-300 font-medium pb-1">Total Due</span>
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0}
                className="group w-full relative overflow-hidden bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <div className="relative flex items-center justify-center gap-2 text-lg">
                  Proceed to Payment
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 px-6 py-5 flex items-center justify-between border-b border-slate-700/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-400" />
                Payment Options
              </h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center py-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-inner">
                <p className="text-slate-400 text-sm font-medium mb-1">Total Amount Due</p>
                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">
                  {formatCurrency(total)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={`relative py-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                        paymentMethod === method.value
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-lg shadow-orange-500/20'
                          : 'border-slate-700 hover:border-slate-500 bg-slate-800/50 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {method.value === 'CASH' && <Banknote className="h-7 w-7" />}
                      {method.value === 'CARD' && <CreditCard className="h-7 w-7" />}
                      {method.value === 'CREDIT' && <Calculator className="h-7 w-7" />}
                      <span className="text-xs font-bold uppercase tracking-wider">{method.label}</span>
                      
                      {paymentMethod === method.value && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'CASH' && (
                <div className="space-y-4 pt-2 animate-in slide-in-from-bottom-2 fade-in">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Amount Received</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">Rs</span>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-2xl font-bold text-white outline-none transition-all shadow-inner"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[500, 1000, 2000, 5000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setAmountPaid(amt.toString())}
                        className="py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-xl text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors shadow-sm"
                      >
                        {amt}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAmountPaid(total.toString())}
                      className="py-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400 text-sm font-bold hover:bg-orange-500/20 transition-colors"
                    >
                      Exact Amount
                    </button>
                    <button
                      onClick={() => setAmountPaid('')}
                      className="py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 text-sm font-bold hover:bg-slate-700 hover:text-slate-300 transition-colors"
                    >
                      Clear
                    </button>
                  </div>

                  {changeAmount >= 0 && amountPaid !== '' && (parseFloat(amountPaid) >= total) && (
                    <div className="mt-4 p-5 bg-emerald-500/10 rounded-2xl flex justify-between items-center border border-emerald-500/20 shadow-inner animate-in zoom-in-95">
                      <span className="text-emerald-400 font-medium">Change Due</span>
                      <span className="text-3xl font-bold text-emerald-400">{formatCurrency(changeAmount)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || (paymentMethod === 'CASH' && (parseFloat(amountPaid) || 0) < total)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 text-lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-6 w-6 mr-2" />
                      {paymentMethod === 'CREDIT' ? 'Proceed to Credit Details' : 'Complete Sale'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between sticky top-0 z-10 shadow-md">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calculator className="h-5 w-5 text-white/80" />
                Credit Customer Details
              </h2>
              <button onClick={() => setShowCreditModal(false)} className="text-white/80 hover:text-white bg-black/20 p-2 rounded-full hover:bg-black/40 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-2 flex justify-between items-center">
                <span className="text-blue-300 font-medium">Total Credit Amount</span>
                <span className="text-xl font-bold text-blue-400">{formatCurrency(total)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Customer Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={creditCustomer.customerName}
                  onChange={(e) => setCreditCustomer({ ...creditCustomer, customerName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-slate-200 outline-none transition-all"
                  placeholder="Enter full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={creditCustomer.phoneNumber}
                    onChange={(e) => setCreditCustomer({ ...creditCustomer, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-slate-200 outline-none transition-all"
                    placeholder="07X XXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={creditCustomer.dueDate}
                    onChange={(e) => setCreditCustomer({ ...creditCustomer, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-slate-200 outline-none transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Address</label>
                <textarea
                  value={creditCustomer.address}
                  onChange={(e) => setCreditCustomer({ ...creditCustomer, address: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-slate-200 outline-none transition-all resize-none"
                  rows={2}
                  placeholder="Street address, City"
                />
              </div>

              <div className="hidden">
                <input
                  type="number"
                  value={creditCustomer.creditAmount}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes (Auto-generated from cart)</label>
                <textarea
                  value={creditCustomer.notes}
                  onChange={(e) => setCreditCustomer({ ...creditCustomer, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-slate-400 outline-none transition-all resize-none text-sm"
                  rows={3}
                />
              </div>

              <button
                onClick={processSale}
                disabled={isProcessing || !creditCustomer.customerName}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 mt-6 flex items-center justify-center text-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="h-6 w-6 mr-2" />
                    Complete Credit Sale
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && lastSale && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in">
          <div className="bg-slate-100 rounded-lg shadow-2xl w-full max-w-sm mx-4 overflow-hidden text-slate-900 animate-in slide-in-from-bottom-8 duration-300">
            {/* Receipt Content - styled like a paper receipt */}
            <div className="p-8 pb-12 font-mono text-sm relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDAgNSwxMCAxMCwwIiBmaWxsPSIjMGYxNzJhIi8+PC9zdmc+')] bg-repeat-x"></div>
              
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold uppercase tracking-widest mb-1">SmartBake 360</h2>
                <p className="text-xs text-slate-600">123 Upper Bazar, Pundaluoya</p>
                <p className="text-xs text-slate-600">Tel: 051-2233483 / 0763657214</p>
                <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-300">
                  <p className="text-xs text-slate-500 mb-1">
                    {new Date(lastSale.saleDate || new Date()).toLocaleString('en-US', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute:'2-digit'
                    })}
                  </p>
                  <p className="font-bold">Receipt #{lastSale.id}</p>
                  <p className="text-xs mt-1">Cashier: {lastSale.cashierName || 'Guest'}</p>
                </div>
              </div>

              <div className="border-t-2 border-b-2 border-dashed border-slate-300 py-4 space-y-3 mb-4">
                <div className="flex justify-between font-bold text-xs uppercase tracking-wider mb-2">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                {lastSale.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{item.productName}</span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(lastSale.subtotal)}</span>
                </div>
                {lastSale.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>-{formatCurrency(lastSale.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t-2 border-dashed border-slate-300">
                  <span>TOTAL</span>
                  <span>{formatCurrency(lastSale.totalAmount)}</span>
                </div>
                
                <div className="pt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Payment Method</span>
                    <span className="uppercase">{lastSale.paymentMethod}</span>
                  </div>
                  {lastSale.paymentMethod === 'CASH' && lastSale.amountPaid > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Cash Tendered</span>
                        <span>{formatCurrency(lastSale.amountPaid)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Change</span>
                        <span>{formatCurrency(Math.max(0, lastSale.amountPaid - lastSale.totalAmount))}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 text-center border-t-2 border-dashed border-slate-300 pt-4">
                <p className="font-bold text-sm">Thank You!</p>
                <p className="text-xs text-slate-500">Please come again</p>
                <div className="mt-4 flex justify-center">
                  {/* Fake barcode */}
                  <div className="h-10 w-3/4 flex bg-black">
                    <div className="flex-1 bg-white ml-1"></div>
                    <div className="w-2 bg-white ml-2"></div>
                    <div className="flex-1 bg-white ml-1"></div>
                    <div className="w-1 bg-white ml-1"></div>
                    <div className="flex-1 bg-white ml-3"></div>
                    <div className="w-3 bg-white ml-1"></div>
                    <div className="flex-1 bg-white ml-1"></div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDEwIDUsMCAxMCwxMCIgZmlsbD0iIzBmMTcyYSIvPjwvc3ZnPg==')] bg-repeat-x"></div>
            </div>

            <div className="flex bg-slate-900 border-t border-slate-800 p-4 gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-slate-800 text-white py-3 rounded-xl hover:bg-slate-700 flex items-center justify-center font-medium transition-colors"
              >
                <Receipt className="h-5 w-5 mr-2" />
                Print
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-rose-600 font-bold transition-all shadow-lg shadow-orange-500/20"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default POSPage;
