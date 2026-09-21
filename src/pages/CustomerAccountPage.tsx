import React, { useState, useEffect } from 'react';
import { 
  User, Package, MapPin, Heart, Clock, LogOut, CheckCircle2, 
  AlertCircle, Truck, ExternalLink, ArrowRight 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';
import { Order } from '../types';

export const CustomerAccountPage: React.FC = () => {
  const { 
    user, customerProfile, updateProfile, logout, wishlist, 
    recentlyViewed, setActivePage, setConfirmedOrderId, setIsAuthModalOpen 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist' | 'recent'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [division, setDivision] = useState(customerProfile?.division || 'Dhaka');
  const [district, setDistrict] = useState(customerProfile?.district || 'Dhaka');
  const [area, setArea] = useState(customerProfile?.area || '');
  const [fullAddress, setFullAddress] = useState(customerProfile?.full_address || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    async function loadOrders() {
      try {
        setLoadingOrders(true);
        const data = await api.getOrders({ email: user?.email });
        setOrders(data);
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Please Sign In</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">You need an active account to view your orders and profile.</p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="bg-cyan-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name,
        phone,
        division,
        district,
        area,
        full_address: fullAddress
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24">
      
      {/* Account Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-600 flex items-center justify-center text-white font-black text-2xl shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded">
              Customer Account
            </span>
            <h1 className="text-2xl font-black mt-1">{user.name}</h1>
            <p className="text-xs text-slate-400">{user.email} • {user.phone || 'No phone set'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors inline-flex items-center space-x-1.5 border border-slate-700"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 mb-6 overflow-x-auto text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 ${
            activeTab === 'orders' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 ${
            activeTab === 'profile' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Shipping & Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 ${
            activeTab === 'wishlist' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist</span>
        </button>

        <button
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 ${
            activeTab === 'recent' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Recently Viewed</span>
        </button>
      </div>

      {/* Tab 1: My Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No orders yet</h3>
              <p className="text-xs text-slate-500 mt-1">You haven't placed any gadget orders with us yet.</p>
              <button
                onClick={() => setActivePage('shop')}
                className="mt-4 bg-cyan-600 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Shop Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(ord => (
                <div key={ord.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Order Reference</span>
                      <h4 className="font-mono font-bold text-slate-900 text-sm">{ord.id}</h4>
                      <span className="text-xs text-slate-400">{new Date(ord.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {(() => {
                        const ordStatus = (ord.order_status || ord.status || 'pending').toLowerCase();
                        return (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            ordStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            ordStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            ordStatus === 'processing' ? 'bg-purple-100 text-purple-800' :
                            ordStatus === 'confirmed' ? 'bg-cyan-100 text-cyan-800' :
                            ordStatus === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.order_status || ord.status || 'pending'}
                          </span>
                        );
                      })()}
                      <button
                        onClick={() => {
                          setConfirmedOrderId(ord.id);
                          setActivePage('order-confirmation');
                        }}
                        className="text-xs font-bold text-cyan-600 hover:text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-3 py-1 rounded-lg transition-colors inline-flex items-center"
                      >
                        <span>Invoice</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  </div>

                  {/* Order Items preview */}
                  <div className="divide-y divide-slate-100">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          {it.product_image && (
                            <img src={it.product_image} alt={it.product_name} className="w-10 h-10 object-cover rounded-lg border" />
                          )}
                          <div>
                            <p className="font-bold text-slate-800">{it.product_name}</p>
                            <p className="text-slate-400 text-[11px]">Qty: {it.quantity} {it.variant_title ? `• ${it.variant_title}` : ''}</p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">৳{it.total_price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Courier & Total */}
                  <div className="border-t border-slate-100 pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                    <div>
                      {ord.courier_name && ord.tracking_number ? (
                        <span className="text-cyan-800 font-semibold flex items-center">
                          <Truck className="w-3.5 h-3.5 mr-1" />
                          {ord.courier_name} Courier (Tracking: {ord.tracking_number})
                        </span>
                      ) : (
                        <span>
                          Destination: {ord.shipping_address ? `${ord.shipping_address.district}, ${ord.shipping_address.division}` : `${ord.district || ''}, ${ord.division || ''}`}
                        </span>
                      )}
                    </div>
                    <div className="font-black text-slate-900 text-sm">
                      Total: <span className="text-cyan-700">৳{(ord.total_amount || ord.total || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile & Shipping */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs max-w-2xl">
          <h3 className="font-bold text-slate-900 text-base mb-4">Edit Profile & Default Delivery Address</h3>
          
          {saveSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone (BD)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Division</label>
                <input
                  type="text"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Area / Thana</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                <textarea
                  rows={2}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Heart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">Your Wishlist is Empty</h3>
              <p className="text-xs text-slate-500 mt-1">Tap the heart icon on any product to save it for later.</p>
              <button
                onClick={() => setActivePage('shop')}
                className="mt-4 bg-cyan-600 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Browse Gadgets
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlist.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Recently Viewed */}
      {activeTab === 'recent' && (
        <div>
          {recentlyViewed.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No recently viewed gadgets</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentlyViewed.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
