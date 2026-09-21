import React, { useState } from 'react';
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, 
  Truck, ShieldCheck, ArrowLeft, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartPage: React.FC = () => {
  const { 
    cart, cartSubtotal, deliveryCharge, couponDiscount, cartTotal,
    removeFromCart, updateCartQuantity, clearCart, appliedCoupon,
    applyCoupon, removeCoupon, deliveryDivision, setDeliveryDivision,
    settings, setActivePage, navigateToProduct 
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<{ text: string; error: boolean } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const freeDeliveryThreshold = settings.free_delivery_threshold || 3000;
  const remainingForFree = Math.max(0, freeDeliveryThreshold - cartSubtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    setCouponStatus(null);
    const res = await applyCoupon(couponCode);
    setIsApplying(false);
    setCouponStatus({ text: res.message, error: !res.success });
    if (res.success) setCouponCode('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Cart is Currently Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          Explore genuine gadgets and accessories with official warranty in Bangladesh.
        </p>
        <button
          onClick={() => setActivePage('shop')}
          className="mt-6 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-colors inline-flex items-center space-x-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
      
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review items, apply promo vouchers and calculate BD delivery.</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:underline font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Free Shipping Alert Banner */}
          <div className="bg-cyan-50 border border-cyan-200 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <span className="flex items-center text-cyan-950 font-medium">
              <Truck className="w-4 h-4 mr-2 text-cyan-600" />
              {remainingForFree > 0 ? (
                <>Add <strong className="mx-1 text-cyan-700">৳{remainingForFree.toLocaleString()}</strong> more to qualify for <strong>FREE Delivery</strong> all across Bangladesh!</>
              ) : (
                <strong className="text-emerald-700">Congratulations! You get FREE Nationwide Delivery!</strong>
              )}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {cart.map(item => (
              <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                <div className="flex items-center space-x-3.5 min-w-0 flex-1 cursor-pointer" onClick={() => navigateToProduct(item.product.slug)}>
                  <img
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                    alt={item.product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-cyan-700 uppercase">{item.product.brand}</span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-cyan-600 transition-colors">
                      {item.product.name}
                    </h4>
                    {item.selected_variant && (
                      <span className="inline-block text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1">
                        Variant: {item.selected_variant.title}
                      </span>
                    )}
                    <div className="text-xs font-bold text-slate-800 mt-1">
                      ৳{item.price.toLocaleString()} each
                    </div>
                  </div>
                </div>

                {/* Quantity + Line Total + Remove */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActivePage('shop')}
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping for More Gadgets</span>
            </button>
          </div>
        </div>

        {/* Order Summary & Delivery Choice */}
        <div className="space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            {/* Delivery Destination Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Shipping Destination (Bangladesh):
              </label>
              <div className="space-y-2">
                <label className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  deliveryDivision === 'inside_dhaka' ? 'border-cyan-500 bg-cyan-50/60 font-bold text-cyan-900' : 'border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryDivision === 'inside_dhaka'}
                      onChange={() => setDeliveryDivision('inside_dhaka')}
                      className="text-cyan-600"
                    />
                    <span>Inside Dhaka (24 - 48h)</span>
                  </div>
                  <span>৳{settings.delivery_inside_dhaka}</span>
                </label>

                <label className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  deliveryDivision === 'outside_dhaka' ? 'border-cyan-500 bg-cyan-50/60 font-bold text-cyan-900' : 'border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryDivision === 'outside_dhaka'}
                      onChange={() => setDeliveryDivision('outside_dhaka')}
                      className="text-cyan-600"
                    />
                    <span>Outside Dhaka (2 - 4 Days)</span>
                  </div>
                  <span>৳{settings.delivery_outside_dhaka}</span>
                </label>
              </div>
            </div>

            {/* Coupon Application */}
            <div className="pt-2 border-t border-slate-100">
              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center text-emerald-800 font-bold">
                    <Tag className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    <span>Coupon: {appliedCoupon.code}</span>
                  </div>
                  <button onClick={removeCoupon} className="text-rose-600 hover:underline font-semibold">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Discount Code (e.g. TAZTECH500)"
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isApplying ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponStatus && (
                    <div className={`text-[11px] flex items-center ${couponStatus.error ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {couponStatus.error ? <AlertCircle className="w-3.5 h-3.5 mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                      <span>{couponStatus.text}</span>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Math Table */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">৳{cartSubtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-৳{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-bold text-slate-900">
                  {deliveryCharge === 0 ? <span className="text-emerald-700">FREE</span> : `৳${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-3">
                <span>Total Amount</span>
                <span className="text-cyan-700 text-lg">৳{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              id="proceed-to-checkout-btn"
              onClick={() => setActivePage('checkout')}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-slate-500 text-center flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash on Delivery is available in all 64 districts</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
