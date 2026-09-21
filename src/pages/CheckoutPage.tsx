import React, { useState } from 'react';
import { 
  ShieldCheck, Truck, ArrowLeft, CheckCircle2, AlertCircle, 
  MapPin, Phone, User, Mail, CreditCard, Banknote, ShoppingBag 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';

const BD_DIVISIONS = [
  'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 
  'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'
];

export const CheckoutPage: React.FC = () => {
  const { 
    cart, cartSubtotal, deliveryCharge, couponDiscount, cartTotal,
    deliveryDivision, setDeliveryDivision, appliedCoupon, clearCart,
    setConfirmedOrderId, setActivePage, user, customerProfile, settings 
  } = useStore();

  const [customerName, setCustomerName] = useState(user?.name || customerProfile?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || customerProfile?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || customerProfile?.phone || '');
  const [division, setDivision] = useState(customerProfile?.division || 'Dhaka');
  const [district, setDistrict] = useState(customerProfile?.district || 'Dhaka');
  const [area, setArea] = useState(customerProfile?.area || '');
  const [fullAddress, setFullAddress] = useState(customerProfile?.full_address || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync delivery division if customer picks Dhaka vs others
  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    if (newDiv === 'Dhaka') {
      setDeliveryDivision('inside_dhaka');
    } else {
      setDeliveryDivision('outside_dhaka');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate phone number format (standard Bangladesh 11-digit format starting with 01)
    const phoneClean = customerPhone.replace(/[^0-9]/g, '');
    if (!phoneClean.startsWith('01') || phoneClean.length !== 11) {
      setErrorMsg('Please provide a valid 11-digit Bangladesh mobile number starting with 01 (e.g. 01711234567)');
      return;
    }

    if (!fullAddress.trim()) {
      setErrorMsg('Please enter your complete delivery street address.');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty. Please add items before placing an order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cart.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product.name,
        variant_title: item.selected_variant?.title,
        sku: item.selected_variant?.sku || item.product.sku,
        price: item.price,
        unit_price: item.price,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        product_image: item.product.images[0]
      }));

      const newOrder = await api.createOrder({
        customer_id: user?.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: {
          name: customerName,
          phone: customerPhone,
          division,
          district: district || division,
          area: area || '',
          full_address: fullAddress,
          country: 'Bangladesh'
        },
        items: orderItems,
        subtotal: cartSubtotal,
        delivery_charge: deliveryCharge,
        discount_amount: couponDiscount,
        coupon_code: appliedCoupon?.code,
        total_amount: cartTotal,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        status: 'pending',
        notes: notes || undefined
      });

      // Clear cart & set order
      clearCart();
      setConfirmedOrderId(newOrder.id);
      setActivePage('order-confirmation');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <button 
          onClick={() => setActivePage('shop')}
          className="mt-4 bg-cyan-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
      
      {/* Back button */}
      <button 
        onClick={() => setActivePage('cart')} 
        className="mb-5 inline-flex items-center text-xs font-bold text-slate-500 hover:text-cyan-600"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Return to Shopping Cart
      </button>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">Complete your delivery details for Cash on Delivery in Bangladesh.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Shipping Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Information */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
              <User className="w-4 h-4 mr-2 text-cyan-600" />
              1. Customer Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bangladesh Mobile Number * <span className="text-slate-400 font-normal">(Courier will call here)</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address in Bangladesh */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-cyan-600" />
              2. Delivery Address in Bangladesh
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Division *</label>
                <select
                  value={division}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {BD_DIVISIONS.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District / Zilla *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Dhaka, Cumilla, Bogura"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Area / Thana / Upazila</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Dhanmondi, Mirpur, Sadar"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Street Address (House, Road, Block/Sector) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="e.g. House #14, Road #5, Block C, Banani, Dhaka"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Special Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call before delivery, deliver after 2 PM, leave with office security"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
              <Banknote className="w-4 h-4 mr-2 text-cyan-600" />
              3. Payment Method
            </h3>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label className={`flex items-start p-4 rounded-2xl border transition-all cursor-pointer ${
                paymentMethod === 'cod' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="text-cyan-600 mt-1 mr-3"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">Cash on Delivery (COD)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Inspect package on arrival and pay the delivery rider in cash. Available across all 64 districts.
                  </p>
                </div>
              </label>

              {/* bKash */}
              <label className={`flex items-start p-4 rounded-2xl border transition-all cursor-pointer ${
                paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50/40 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="text-pink-600 mt-1 mr-3"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">bKash Online / Merchant</span>
                    <span className="bg-pink-100 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Mobile Banking
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay securely using your bKash wallet. Merchant integration ready for production.
                  </p>
                </div>
              </label>

              {/* Nagad */}
              <label className={`flex items-start p-4 rounded-2xl border transition-all cursor-pointer ${
                paymentMethod === 'nagad' ? 'border-amber-500 bg-amber-50/40 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'nagad'}
                  onChange={() => setPaymentMethod('nagad')}
                  className="text-amber-600 mt-1 mr-3"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">Nagad Mobile Payment</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Instant payment with Nagad digital postal wallet.
                  </p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div>
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs sticky top-24 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Items in Order</span>
              <span className="text-xs text-slate-500 font-normal">({cart.length} unique)</span>
            </h3>

            {/* Compact item list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
              {cart.map(item => (
                <div key={item.id} className="pt-2 flex items-center space-x-3 text-xs">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-800 truncate">{item.product.name}</h5>
                    <p className="text-[11px] text-slate-400">
                      Qty: {item.quantity} {item.selected_variant ? `• ${item.selected_variant.title}` : ''}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">৳{cartSubtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-৳{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery ({division === 'Dhaka' ? 'Dhaka' : 'Outside Dhaka'})</span>
                <span className="font-bold text-slate-900">
                  {deliveryCharge === 0 ? <span className="text-emerald-700">FREE</span> : `৳${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-3">
                <span>Total Payable</span>
                <span className="text-cyan-700 text-xl">৳{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              id="submit-place-order-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-sm py-4 rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
            </button>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p className="flex items-center text-slate-700 font-semibold">
                <Truck className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                <span>Estimated Arrival: {division === 'Dhaka' ? settings.estimated_delivery_dhaka : settings.estimated_delivery_outside}</span>
              </p>
              <p>Our representative may call your mobile to verify address before dispatch.</p>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
