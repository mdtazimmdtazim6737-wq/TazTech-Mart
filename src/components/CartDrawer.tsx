import React, { useState } from 'react';
import { 
  X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, 
  Tag, CheckCircle2, AlertCircle, Sparkles, Truck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, setIsCartOpen, cart, cartSubtotal, deliveryCharge,
    couponDiscount, cartTotal, removeFromCart, updateCartQuantity,
    appliedCoupon, applyCoupon, removeCoupon, deliveryDivision,
    setDeliveryDivision, settings, setActivePage
  } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = settings.free_delivery_threshold || 3000;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const freeDeliveryPercent = Math.min(100, Math.round((cartSubtotal / freeDeliveryThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponMessage(null);
    const res = await applyCoupon(couponCodeInput);
    setIsApplyingCoupon(false);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) setCouponCodeInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-cyan-600" />
              <h3 className="font-bold text-slate-900 text-lg">Your Cart</h3>
              <span className="text-xs bg-cyan-100 text-cyan-800 font-semibold px-2 py-0.5 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>
            <button 
              id="close-cart-drawer-btn"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-cyan-50/80 p-3 sm:px-5 border-b border-cyan-100 text-xs">
            <div className="flex items-center justify-between font-medium text-cyan-900 mb-1.5">
              <span className="flex items-center">
                <Truck className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                {remainingForFreeDelivery > 0 ? (
                  <>Add <strong className="mx-1 text-cyan-700">৳{remainingForFreeDelivery.toLocaleString()}</strong> more for FREE Nationwide Delivery</>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Congratulations! You qualified for Free Delivery!
                  </span>
                )}
              </span>
              <span className="font-bold">{freeDeliveryPercent}%</span>
            </div>
            <div className="w-full bg-cyan-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-cyan-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${freeDeliveryPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Your shopping cart is empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Browse our curated genuine gadgets, smart audio, and power accessories to fill your cart.
                </p>
                <button
                  id="empty-cart-shop-now-btn"
                  onClick={() => {
                    setIsCartOpen(false);
                    setActivePage('shop');
                  }}
                  className="mt-5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="py-3.5 flex space-x-3.5 group">
                  <img 
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'} 
                    alt={item.product.name} 
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-slate-800 truncate group-hover:text-cyan-600 transition-colors">
                      {item.product.name}
                    </h5>
                    {item.selected_variant && (
                      <span className="inline-block text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">
                        {item.selected_variant.title}
                      </span>
                    )}
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      ৳{item.price.toLocaleString()}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-200 text-slate-600 rounded-l-lg transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-200 text-slate-600 rounded-r-lg transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Item Total & Remove */}
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-bold text-cyan-700">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-slate-200 p-4 sm:p-5 bg-slate-50/80 space-y-3.5">
              
              {/* Delivery Zone Selector */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <label className="text-[11px] font-semibold text-slate-500 block mb-1.5 uppercase tracking-wide">
                  Select Delivery Location in Bangladesh:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryDivision('inside_dhaka')}
                    className={`text-xs py-1.5 px-2 rounded-lg font-medium border text-center transition-all ${deliveryDivision === 'inside_dhaka' ? 'bg-cyan-50 border-cyan-500 text-cyan-800 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Inside Dhaka (৳{settings.delivery_inside_dhaka})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryDivision('outside_dhaka')}
                    className={`text-xs py-1.5 px-2 rounded-lg font-medium border text-center transition-all ${deliveryDivision === 'outside_dhaka' ? 'bg-cyan-50 border-cyan-500 text-cyan-800 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Outside Dhaka (৳{settings.delivery_outside_dhaka})
                  </button>
                </div>
              </div>

              {/* Coupon Form */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-emerald-700 font-medium">
                      <Tag className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      <span>Code: <strong>{appliedCoupon.code}</strong> (-৳{couponDiscount.toLocaleString()})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex space-x-1.5">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="Coupon (e.g. TAZTECH500)"
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isApplyingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <div className={`mt-1.5 text-[11px] flex items-center ${couponMessage.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {couponMessage.isError ? (
                      <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" />
                    )}
                    <span>{couponMessage.text}</span>
                  </div>
                )}
              </div>

              {/* Order Cost Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-2.5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">৳{cartSubtotal.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-৳{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-slate-900">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `৳${deliveryCharge}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                  <span>Total Payable</span>
                  <span className="text-cyan-700 text-base">৳{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  id="checkout-from-drawer-btn"
                  onClick={() => {
                    setIsCartOpen(false);
                    setActivePage('checkout');
                  }}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl shadow-md shadow-cyan-600/20 flex items-center justify-center space-x-2 transition-all hover:translate-y-[-1px]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="continue-shopping-drawer-btn"
                  onClick={() => {
                    setIsCartOpen(false);
                    setActivePage('shop');
                  }}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-600 hover:text-cyan-600 transition-colors"
                >
                  View Full Cart & Continue Shopping
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
