import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { StaticPolicyPage } from './pages/StaticPolicyPage';
import { AdminDashboard } from './pages/AdminDashboard';

import { MessageSquare, ShoppingBag } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activePage, settings, cart, totalCartQuantity, setIsCartOpen } = useStore();

  if (activePage === 'admin') {
    return (
      <div className="min-h-screen bg-slate-100">
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1">
        {activePage === 'home' && <HomePage />}
        {activePage === 'shop' && <ShopPage />}
        {activePage === 'product-detail' && <ProductDetailPage />}
        {activePage === 'categories' && <CategoriesPage />}
        {activePage === 'cart' && <CartPage />}
        {activePage === 'checkout' && <CheckoutPage />}
        {activePage === 'order-confirmation' && <OrderConfirmationPage />}
        {activePage === 'account' && <CustomerAccountPage />}
        {activePage === 'static-page' && <StaticPolicyPage />}
      </main>

      <Footer />

      {/* Global Modals & Slide-out Cart */}
      <CartDrawer />
      <AuthModal />

      {/* Floating WhatsApp Quick Action Button for Bangladesh Customers */}
      {settings.whatsapp_number && (
        <a
          id="floating-whatsapp-btn"
          href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hello%20TazTech%20Mart,%20I%20have%20an%20inquiry%20about%20a%20gadget.`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-30 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
          title="Chat with TazTech Mart on WhatsApp"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 text-xs font-bold whitespace-nowrap transition-all duration-300">
            WhatsApp Support
          </span>
        </a>
      )}

      {/* Mobile Floating Sticky Cart Bar */}
      {cart.length > 0 && activePage !== 'cart' && activePage !== 'checkout' && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden z-20 bg-slate-900/95 backdrop-blur-md text-white p-3 border-t border-slate-800 flex items-center justify-between shadow-2xl">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartQuantity}
              </span>
            </div>
            <span className="text-xs font-bold">
              {totalCartQuantity} {totalCartQuantity === 1 ? 'item' : 'items'} in cart
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-colors"
          >
            View Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
