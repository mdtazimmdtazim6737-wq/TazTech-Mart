import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Truck, Printer, ArrowRight, Phone, MessageSquare, 
  Package, MapPin, Calendar, Clock, Download 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { Order } from '../types';

export const OrderConfirmationPage: React.FC = () => {
  const { confirmedOrderId, setActivePage, settings } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!confirmedOrderId) return;
    async function loadOrder() {
      try {
        setLoading(true);
        const data = await api.getOrder(confirmedOrderId!);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load confirmed order:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [confirmedOrderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4" />
        <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order Information Unavailable</h2>
        <button 
          onClick={() => setActivePage('shop')}
          className="mt-4 bg-cyan-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const currentStatus = (order.order_status || order.status || 'pending').toLowerCase();
  const isCod = order.payment_method === 'cod' || order.payment_method === 'Cash on Delivery';

  const steps = [
    { title: 'Order Placed', status: 'completed' },
    { title: 'Confirmed by TazTech', status: currentStatus !== 'pending' ? 'completed' : 'current' },
    { title: 'Packed & Dispatched', status: ['processing', 'shipped', 'delivered'].includes(currentStatus) ? 'completed' : 'upcoming' },
    { title: 'Out for Delivery', status: ['shipped', 'delivered'].includes(currentStatus) ? 'completed' : 'upcoming' },
    { title: 'Delivered', status: currentStatus === 'delivered' ? 'completed' : 'upcoming' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-24">
      
      {/* Success Hero Banner */}
      <div className="text-center bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs mb-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
          Order Successfully Placed!
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          Thank you for choosing {settings.website_name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          We have received your order. Our team will verify your address and package your gadgets for swift dispatch.
        </p>

        <div className="mt-4 inline-flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-800">
          <span>Order Reference:</span>
          <span className="text-cyan-700">{order.id}</span>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-8">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
          Live Order Status Tracker
        </h3>

        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                step.status === 'completed' ? 'bg-emerald-600 text-white' : 
                step.status === 'current' ? 'bg-cyan-600 text-white animate-pulse' : 
                'bg-slate-100 text-slate-400'
              }`}>
                {idx + 1}
              </div>
              <span className={`text-[11px] font-semibold leading-tight ${
                step.status === 'completed' || step.status === 'current' ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {order.courier_name && order.tracking_number && (
          <div className="mt-6 p-3 bg-cyan-50 rounded-xl border border-cyan-200 flex items-center justify-between text-xs">
            <span className="text-cyan-900 font-medium">
              Courier: <strong>{order.courier_name}</strong> • Tracking Number: <strong className="font-mono">{order.tracking_number}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Invoice Card */}
      <div id="printable-invoice" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-xl font-black text-slate-900">{settings.website_name}</h3>
            <p className="text-xs text-slate-500">{settings.contact_address}</p>
            <p className="text-xs text-slate-500">Phone: {settings.contact_phone} | Email: {settings.contact_email}</p>
          </div>
          <div className="sm:text-right text-xs">
            <p className="text-slate-400">Invoice ID</p>
            <p className="font-bold text-slate-800 font-mono text-sm">{order.id}</p>
            <p className="text-slate-400 mt-1">Date: {new Date(order.created_at).toLocaleDateString()}</p>
            <span className="inline-block mt-1 uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              {isCod ? 'Cash on Delivery (Pending Payment)' : 'Paid Online'}
            </span>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl">
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Delivering To:</span>
            <p className="font-bold text-slate-900 text-sm">{order.customer_name}</p>
            <p className="text-slate-600 font-mono">{order.customer_phone}</p>
            <p className="text-slate-600">{order.customer_email}</p>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Destination Address:</span>
            <p className="text-slate-800 leading-relaxed">
              {order.shipping_address ? (
                <>
                  {order.shipping_address.full_address}, {order.shipping_address.area && `${order.shipping_address.area}, `}
                  {order.shipping_address.district}, {order.shipping_address.division}, Bangladesh
                </>
              ) : (
                <>
                  {order.full_address}, {order.area && `${order.area}, `}
                  {order.district}, {order.division}, Bangladesh
                </>
              )}
            </p>
            {(order.notes || order.delivery_note) && (
              <p className="text-slate-500 italic mt-1">Note: "{order.notes || order.delivery_note}"</p>
            )}
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                <th className="pb-2">Item</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Price</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((it, idx) => (
                <tr key={idx} className="py-2.5">
                  <td className="py-2.5 pr-2">
                    <p className="font-bold text-slate-800">{it.product_name}</p>
                    {it.variant_title && <span className="text-[11px] text-slate-400">{it.variant_title}</span>}
                  </td>
                  <td className="py-2.5 text-center font-bold text-slate-700">{it.quantity}</td>
                  <td className="py-2.5 text-right text-slate-600">৳{(it.unit_price || it.price).toLocaleString()}</td>
                  <td className="py-2.5 text-right font-bold text-slate-900">৳{it.total_price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="border-t border-slate-200 pt-4 flex flex-col items-end text-xs space-y-1.5">
          <div className="w-64 flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-bold text-slate-900">৳{order.subtotal.toLocaleString()}</span>
          </div>
          {(order.discount_amount || order.discount || 0) > 0 && (
            <div className="w-64 flex justify-between text-emerald-700 font-semibold">
              <span>Coupon Discount:</span>
              <span>-৳{(order.discount_amount || order.discount || 0).toLocaleString()}</span>
            </div>
          )}
          <div className="w-64 flex justify-between text-slate-600">
            <span>Nationwide Delivery:</span>
            <span className="font-bold text-slate-900">
              {order.delivery_charge === 0 ? 'FREE' : `৳${order.delivery_charge}`}
            </span>
          </div>
          <div className="w-64 flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
            <span>Total Payable:</span>
            <span className="text-cyan-700 text-lg">৳{(order.total_amount || order.total || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Print / Action Buttons */}
        <div className="border-t border-slate-100 pt-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors inline-flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          <div className="flex items-center space-x-3">
            {settings.whatsapp_number && (
              <a
                href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi%20TazTech,%20inquiring%20about%20order%20${order.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors inline-flex items-center space-x-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Support</span>
              </a>
            )}

            <button
              onClick={() => setActivePage('shop')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors inline-flex items-center space-x-1.5"
            >
              <span>Back to Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
