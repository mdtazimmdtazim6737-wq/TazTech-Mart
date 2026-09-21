import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, 
  Phone, MapPin, ShieldCheck, Zap, Sparkles, LayoutDashboard,
  ArrowRight, Truck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { Product } from '../types';

export const Header: React.FC = () => {
  const { 
    settings, categories, totalCartQuantity, cartSubtotal, wishlistIds,
    user, isCartOpen, setIsCartOpen, setIsAuthModalOpen,
    activePage, setActivePage, searchQuery, setSearchQuery,
    navigateToCategory, navigateToProduct
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  
  // Live autocomplete search suggestions
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        api.getProducts({ search: searchQuery })
          .then(res => setSearchSuggestions(res.slice(0, 5)))
          .catch(() => setSearchSuggestions([]));
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setActivePage('shop');
      api.trackEvent('search', { query: searchQuery });
    }
  };

  const isAdminOrManager = user && ['super_admin', 'admin', 'manager', 'content_manager', 'order_manager'].includes(user.role);

  return (
    <header className="w-full sticky top-0 z-40 bg-white shadow-xs border-b border-slate-200">
      {/* Top Announcement Bar */}
      {settings.announcement_enabled && !announcementDismissed && (
        <div 
          id="announcement-bar"
          style={{ 
            backgroundColor: settings.announcement_bg_color || '#0f172a',
            color: settings.announcement_text_color || '#38bdf8' 
          }}
          className="py-1.5 px-4 text-xs sm:text-sm font-medium transition-colors"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex-1 flex items-center justify-center text-center truncate pr-2">
              <span className="truncate">{settings.announcement_text}</span>
            </div>
            <button 
              id="dismiss-announcement-btn"
              onClick={() => setAnnouncementDismissed(true)}
              className="text-slate-400 hover:text-white p-1 text-xs"
              aria-label="Close announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Contact & Utility Bar (Desktop) */}
      <div className="hidden lg:block bg-slate-100/90 border-b border-slate-200/80 text-xs text-slate-600 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center text-slate-700">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-cyan-600" />
              Hotline: <strong className="ml-1 text-slate-900 font-semibold">{settings.contact_phone}</strong>
            </span>
            <span className="flex items-center text-slate-500">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Elephant Road, Dhaka, Bangladesh
            </span>
            <span className="flex items-center text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
              100% Genuine Products with Warranty
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              id="topbar-track-order"
              onClick={() => {
                if (user) {
                  setActivePage('my-orders');
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="hover:text-cyan-600 transition-colors flex items-center"
            >
              <Truck className="w-3.5 h-3.5 mr-1" />
              Track Order
            </button>

            {isAdminOrManager && (
              <button 
                id="topbar-admin-link"
                onClick={() => setActivePage('admin')}
                className="inline-flex items-center bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-2.5 py-0.5 rounded-md shadow-xs transition-colors"
              >
                <LayoutDashboard className="w-3 h-3 mr-1" />
                Admin Dashboard
              </button>
            )}

            {!user ? (
              <button 
                id="topbar-login-btn"
                onClick={() => setIsAuthModalOpen(true)}
                className="font-medium text-cyan-700 hover:text-cyan-800"
              >
                Login / Register
              </button>
            ) : (
              <button 
                id="topbar-my-account-btn"
                onClick={() => setActivePage('account')}
                className="font-medium text-slate-800 hover:text-cyan-600"
              >
                Hi, {user.name.split(' ')[0]}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center lg:hidden">
            <button 
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-slate-700 hover:text-cyan-600 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo Area (Configurable text or image) */}
          <div 
            id="brand-logo-btn"
            onClick={() => setActivePage('home')}
            className="cursor-pointer flex items-center space-x-2 group select-none"
          >
            {settings.logo_image ? (
              <img 
                src={settings.logo_image} 
                alt={settings.website_name} 
                className="h-10 w-auto object-contain" 
              />
            ) : (
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-slate-900 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 block leading-tight font-sans">
                    {settings.logo_text || 'TazTech Mart'}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-cyan-600 block -mt-0.5">
                    Gadgets & Lifestyle BD
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar with Autocomplete */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-2 relative">
            <form onSubmit={handleSearchSubmit} className="w-full flex items-center">
              <div className="relative w-full">
                <input
                  id="header-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search genuine earbuds, smart watches, chargers, keyboards..."
                  className="w-full bg-slate-100 border border-slate-300 focus:border-cyan-500 focus:bg-white text-slate-900 pl-4 pr-11 py-2.5 rounded-xl text-sm focus:outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  id="header-search-submit-btn"
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-lg transition-colors shadow-xs"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Products matching "{searchQuery}"
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {searchSuggestions.map(prod => (
                    <div 
                      key={prod.id}
                      onClick={() => {
                        setShowSuggestions(false);
                        navigateToProduct(prod.slug);
                      }}
                      className="p-2.5 flex items-center space-x-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{prod.name}</p>
                        <p className="text-xs text-slate-500">{prod.brand} • <span className="text-cyan-600 font-semibold">৳{prod.sale_price.toLocaleString()}</span></p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleSearchSubmit}
                  className="w-full py-2 bg-slate-50 hover:bg-cyan-50 text-cyan-700 text-xs font-semibold text-center transition-colors border-t border-slate-100"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            )}
          </div>

          {/* Right Action Icons: Wishlist, Account, Cart */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Wishlist Button */}
            <button 
              id="header-wishlist-btn"
              onClick={() => setActivePage('wishlist')}
              className="relative p-2 text-slate-700 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Account Button / Dropdown */}
            <div className="relative">
              <button 
                id="header-account-btn"
                onClick={() => {
                  if (user) {
                    setIsAccountDropdownOpen(!isAccountDropdownOpen);
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="flex items-center space-x-1.5 p-2 text-slate-700 hover:text-cyan-600 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Customer Account"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs border border-slate-300">
                  {user ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <span className="hidden xl:inline-block text-xs font-semibold text-left">
                  {user ? (
                    <>
                      <span className="block text-slate-400 font-normal text-[10px]">Account</span>
                      <span className="block truncate max-w-[90px]">{user.name.split(' ')[0]}</span>
                    </>
                  ) : (
                    <>
                      <span className="block text-slate-400 font-normal text-[10px]">Welcome</span>
                      <span className="block text-slate-800">Sign In</span>
                    </>
                  )}
                </span>
              </button>

              {/* Account Dropdown */}
              {isAccountDropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-medium bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>

                  <button 
                    onClick={() => { setActivePage('account'); setIsAccountDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                  >
                    <User className="w-4 h-4 mr-2 text-slate-400" /> My Profile
                  </button>

                  <button 
                    onClick={() => { setActivePage('my-orders'); setIsAccountDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                  >
                    <Truck className="w-4 h-4 mr-2 text-slate-400" /> My Orders
                  </button>

                  <button 
                    onClick={() => { setActivePage('wishlist'); setIsAccountDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                  >
                    <Heart className="w-4 h-4 mr-2 text-slate-400" /> Saved Items
                  </button>

                  {isAdminOrManager && (
                    <button 
                      onClick={() => { setActivePage('admin'); setIsAccountDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-cyan-700 font-semibold hover:bg-cyan-50 flex items-center border-t border-slate-100"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2 text-cyan-600" /> Admin Dashboard
                    </button>
                  )}

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button 
                      onClick={() => {
                        useStore().logout();
                        setIsAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button 
              id="header-cart-btn"
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-xl shadow-sm transition-all group"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                {totalCartQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalCartQuantity}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left text-xs leading-none">
                <span className="block text-[10px] text-slate-400">Cart</span>
                <span className="font-bold text-white">৳{cartSubtotal.toLocaleString()}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gadgets, watches, audio..."
              className="w-full bg-slate-100 border border-slate-300 pl-3.5 pr-10 py-2 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
            />
            <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-slate-500">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Desktop Category Navigation Bar */}
      <div className="hidden lg:block bg-slate-50 border-t border-slate-200 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          <div className="flex items-center space-x-1">
            {/* All Categories Dropdown Button */}
            <div className="relative">
              <button 
                id="categories-dropdown-btn"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-4 py-2.5 flex items-center space-x-2 transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span>All Categories</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {/* Categories Flyout */}
              {isCategoryDropdownOpen && (
                <div 
                  onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                  className="absolute left-0 top-full mt-0 w-64 bg-white rounded-b-xl shadow-xl border border-slate-200 py-2 z-50 divide-y divide-slate-100"
                >
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setIsCategoryDropdownOpen(false);
                        navigateToCategory(cat.slug);
                      }}
                      className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-cyan-600 flex items-center justify-between text-xs font-semibold group transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] bg-slate-100 group-hover:bg-cyan-100 text-slate-500 group-hover:text-cyan-700 px-1.5 py-0.5 rounded-full font-normal">
                        {cat.product_count || 0}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Category Links */}
            <button 
              id="nav-home-btn"
              onClick={() => setActivePage('home')}
              className={`px-3 py-2 font-medium transition-colors ${activePage === 'home' ? 'text-cyan-600 font-semibold' : 'text-slate-700 hover:text-cyan-600'}`}
            >
              Home
            </button>
            <button 
              id="nav-shop-btn"
              onClick={() => {
                useStore().setSelectedCategorySlug(null);
                setActivePage('shop');
              }}
              className={`px-3 py-2 font-medium transition-colors ${activePage === 'shop' ? 'text-cyan-600 font-semibold' : 'text-slate-700 hover:text-cyan-600'}`}
            >
              All Products
            </button>
            
            {categories.slice(0, 4).map(cat => (
              <button
                key={cat.id}
                onClick={() => navigateToCategory(cat.slug)}
                className="px-3 py-2 font-medium text-slate-700 hover:text-cyan-600 transition-colors"
              >
                {cat.name}
              </button>
            ))}

            <button 
              id="nav-categories-catalog-btn"
              onClick={() => setActivePage('categories')}
              className="px-3 py-2 font-medium text-slate-700 hover:text-cyan-600 transition-colors"
            >
              Categories Grid
            </button>
          </div>

          {/* Right Highlights */}
          <div className="flex items-center space-x-3 text-xs">
            <button 
              id="nav-flash-deals-btn"
              onClick={() => {
                useStore().setSelectedCategorySlug(null);
                setActivePage('shop');
              }}
              className="flex items-center text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded bg-rose-50"
            >
              <Zap className="w-3.5 h-3.5 mr-1 text-rose-500 animate-pulse" />
              Flash Deals
            </button>

            <button 
              id="nav-best-sellers-btn"
              onClick={() => {
                setActivePage('shop');
              }}
              className="flex items-center text-amber-700 hover:text-amber-800 font-semibold px-2 py-1"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Best Sellers
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-lg">{settings.website_name}</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto divide-y divide-slate-100">
              <div className="py-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Navigation</p>
                <button 
                  onClick={() => { setActivePage('home'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-2 font-medium text-slate-800 hover:text-cyan-600 block"
                >
                  Home
                </button>
                <button 
                  onClick={() => { 
                    useStore().setSelectedCategorySlug(null);
                    setActivePage('shop'); 
                    setIsMobileMenuOpen(false); 
                  }}
                  className="w-full text-left py-2 font-medium text-slate-800 hover:text-cyan-600 block"
                >
                  Shop All Products
                </button>
                <button 
                  onClick={() => { setActivePage('categories'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-2 font-medium text-slate-800 hover:text-cyan-600 block"
                >
                  Categories
                </button>
              </div>

              <div className="py-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Product Categories</p>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      navigateToCategory(cat.slug);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-sm text-slate-700 hover:text-cyan-600 flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-slate-400">({cat.product_count || 0})</span>
                  </button>
                ))}
              </div>

              <div className="py-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Help & Policies</p>
                <button 
                  onClick={() => { useStore().navigateToPolicy('delivery-info'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-1.5 text-xs text-slate-600 hover:text-cyan-600"
                >
                  Delivery Information (Dhaka & Nationwide)
                </button>
                <button 
                  onClick={() => { useStore().navigateToPolicy('return-refund-policy'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-1.5 text-xs text-slate-600 hover:text-cyan-600"
                >
                  7-Day Return & Refund Policy
                </button>
                <button 
                  onClick={() => { useStore().navigateToPolicy('faq'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-1.5 text-xs text-slate-600 hover:text-cyan-600"
                >
                  FAQ & Support
                </button>
                <button 
                  onClick={() => { useStore().navigateToPolicy('contact-us'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-1.5 text-xs text-slate-600 hover:text-cyan-600"
                >
                  Contact Us
                </button>
              </div>

              {isAdminOrManager && (
                <div className="py-3">
                  <button
                    onClick={() => {
                      setActivePage('admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 bg-cyan-600 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Open Admin Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
