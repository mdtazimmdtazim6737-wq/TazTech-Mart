import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, FolderTree, PackageCheck, Users, 
  Tag, Star, Megaphone, BarChart3, Sliders, Image as ImageIcon,
  Settings, FileText, ArrowLeft, Search, Plus, Trash2, Edit3, 
  Check, X, RefreshCw, Truck, Eye, EyeOff, Printer, AlertTriangle, ShieldCheck,
  DollarSign, TrendingUp, Save, Copy, Lock, LogOut, Key
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { 
  Product, Category, Order, CustomerProfile, Coupon, Review, 
  SiteSettings, HomepageSection, HeroBanner, StaticPage, 
  AnalyticsSummary, MarketingCampaign, CustomerSegment 
} from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    user, settings: globalSettings, refreshSettings, refreshCategories,
    setActivePage, categories: storeCategories, login, logout 
  } = useStore();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'products' | 'categories' | 'orders' | 'customers' | 
    'coupons' | 'reviews' | 'marketing' | 'analytics' | 'cms' | 
    'banners' | 'settings' | 'pages'
  >('overview');

  const isAdmin = Boolean(
    user && ['super_admin', 'admin', 'manager', 'content_manager', 'order_manager'].includes(user.role)
  );

  // Admin login form state
  const [adminEmail, setAdminEmail] = useState('admin@taztech.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin password change modal / form state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeStatus(null);
    if (!newPasswordInput || newPasswordInput.length < 6) {
      setPasswordChangeStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeStatus({ type: 'error', message: 'New passwords do not match. Please re-enter.' });
      return;
    }
    try {
      setIsChangingPassword(true);
      await api.changePassword({
        currentPassword: currentPasswordInput,
        newPassword: newPasswordInput
      });
      setPasswordChangeStatus({ type: 'success', message: 'Password updated successfully! Your new password is now active.' });
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setActionFeedback('Admin password has been securely updated.');
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setPasswordChangeStatus({ type: 'error', message: err.message || 'Failed to update password. Please check your current password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!adminEmail.trim() || !adminPassword) {
      setLoginError('Please enter both admin email and password.');
      return;
    }
    try {
      setIsLoggingIn(true);
      const loggedUser = await login(adminEmail.trim(), adminPassword);
      if (!['super_admin', 'admin', 'manager', 'content_manager', 'order_manager'].includes(loggedUser.role)) {
        setLoginError('Access denied: This user account does not have administrative privileges.');
        setIsLoggingIn(false);
        return;
      }
      setActionFeedback(`Authentication successful. Welcome, ${loggedUser.name}!`);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Overview data
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Customers state
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);

  // Marketing state
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignSubject, setNewCampaignSubject] = useState('');
  const [newCampaignChannel, setNewCampaignChannel] = useState<'email' | 'sms' | 'whatsapp'>('whatsapp');
  const [newCampaignDiscount, setNewCampaignDiscount] = useState('');

  // CMS state
  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>([]);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [editingBanner, setEditingBanner] = useState<Partial<HeroBanner> | null>(null);
  const [showBannerModal, setShowBannerModal] = useState(false);

  // Site Settings Form
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(globalSettings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Static Pages
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);

  const [loading, setLoading] = useState(true);

  // Load all initial admin data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [
        summary,
        allOrders,
        allProds,
        allCats,
        allCusts,
        allCoupons,
        allRevs,
        cmsData,
        allPages,
        allSegs,
        allCamps
      ] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getOrders(),
        api.getProducts(),
        api.getCategories(),
        api.getCustomers(),
        api.getCoupons(),
        api.getReviews(),
        api.getHomepageCMS(),
        api.getPages(),
        api.getCustomerSegments(),
        api.getCampaigns()
      ]);

      setAnalytics(summary);
      setOrders(allOrders);
      setRecentOrders(allOrders.slice(0, 6));
      setProducts(allProds);
      setLowStockProducts(allProds.filter(p => p.stock_quantity <= 10));
      setCategories(allCats);
      setCustomers(allCusts);
      setCoupons(allCoupons);
      setReviews(allRevs);
      setHomepageSections(cmsData.sections);
      setBanners(cmsData.banners);
      setStaticPages(allPages);
      setSegments(allSegs);
      setCampaigns(allCamps);
      setSettingsForm(globalSettings);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, globalSettings]);

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settingsForm);
      await refreshSettings();
      setSettingsSavedMessage(true);
      setTimeout(() => setSettingsSavedMessage(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, status: string, tracking?: string, courier?: string) => {
    try {
      const updated = await api.updateOrderStatus(orderId, {
        status,
        tracking_number: tracking || selectedOrder?.tracking_number,
        courier_name: courier || selectedOrder?.courier_name
      });
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Review Moderation
  const handleReviewStatus = async (revId: string, status: 'approved' | 'rejected', is_featured?: boolean) => {
    try {
      const updated = await api.updateReviewStatus(revId, status, is_featured);
      setReviews(prev => prev.map(r => r.id === revId ? updated : r));
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.sale_price) return;
    try {
      if (editingProduct.id) {
        const updated = await api.updateProduct(editingProduct.id, editingProduct);
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else {
        const created = await api.createProduct(editingProduct);
        setProducts(prev => [created, ...prev]);
      }
      setShowProductModal(false);
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Product Delete
  const handleDeleteProduct = async (id: string, name?: string) => {
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setActionFeedback(`Deleted product: "${name || 'Item'}" successfully.`);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      console.error(err);
      setActionFeedback('Failed to delete product. Please try again.');
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  // Handle Product Duplicate
  const handleDuplicateProduct = async (id: string) => {
    try {
      const dup = await api.duplicateProduct(id);
      setProducts(prev => [dup, ...prev]);
      setActionFeedback(`Duplicated product as: "${dup.name}"`);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      console.error(err);
      setActionFeedback('Failed to duplicate product.');
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  // Handle Category Save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    try {
      if (editingCategory.id) {
        const updated = await api.updateCategory(editingCategory.id, editingCategory);
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
        setActionFeedback(`Updated category: "${updated.name}"`);
      } else {
        const created = await api.createCategory(editingCategory);
        setCategories(prev => [...prev, created]);
        setActionFeedback(`Created category: "${created.name}"`);
      }
      refreshCategories();
      setShowCategoryModal(false);
      setEditingCategory(null);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Category Delete
  const handleDeleteCategory = async (id: string, name?: string) => {
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      refreshCategories();
      setActionFeedback(`Deleted category: "${name || 'Category'}"`);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      console.error(err);
      setActionFeedback('Failed to delete category.');
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  // Handle Coupon Save
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon?.code || !editingCoupon?.discount_value) return;
    try {
      if (editingCoupon.id) {
        const updated = await api.updateCoupon(editingCoupon.id, editingCoupon);
        setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
        setActionFeedback(`Updated coupon: "${updated.code}"`);
      } else {
        const created = await api.createCoupon(editingCoupon);
        setCoupons(prev => [created, ...prev]);
        setActionFeedback(`Created coupon: "${created.code}"`);
      }
      setShowCouponModal(false);
      setEditingCoupon(null);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Coupon Delete
  const handleDeleteCoupon = async (id: string, code?: string) => {
    try {
      await api.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      setActionFeedback(`Deleted coupon: "${code || 'Coupon'}"`);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      console.error(err);
      setActionFeedback('Failed to delete coupon.');
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  // Handle Banner Save
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title || !editingBanner?.image_url) return;
    try {
      if (editingBanner.id) {
        const updated = await api.updateBanner(editingBanner.id, editingBanner);
        setBanners(prev => prev.map(b => b.id === updated.id ? updated : b));
        setActionFeedback(`Updated banner: "${updated.title}"`);
      } else {
        const created = await api.createBanner(editingBanner);
        setBanners(prev => [...prev, created]);
        setActionFeedback(`Created banner: "${created.title}"`);
      }
      setShowBannerModal(false);
      setEditingBanner(null);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Banner Delete
  const handleDeleteBanner = async (id: string, title?: string) => {
    try {
      await api.deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      setActionFeedback(`Deleted hero banner: "${title || 'Banner'}"`);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      console.error(err);
      setActionFeedback('Failed to delete banner.');
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  // Handle Review Delete
  const handleDeleteReview = async (id: string) => {
    try {
      await api.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      setActionFeedback('Review removed from moderation queue.');
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Campaign Create
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;
    try {
      const camp = await api.createCampaign({
        name: newCampaignName,
        subject: newCampaignSubject || newCampaignName,
        channel: newCampaignChannel,
        target_segment: 'All Customers',
        discount_code: newCampaignDiscount || undefined,
        status: 'active'
      });
      setCampaigns(prev => [camp, ...prev]);
      setNewCampaignName('');
      setNewCampaignSubject('');
      setNewCampaignDiscount('');
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Static Page Save
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    try {
      const updated = await api.updatePage(editingPage.slug, editingPage);
      setStaticPages(prev => prev.map(p => p.slug === updated.slug ? updated : p));
      setEditingPage(null);
    } catch (err) {
      console.error(err);
    }
  };

  // RESTRICTED ACCESS GATE: If not logged in as Admin/Manager, show Password Login Screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <header className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between relative z-10">
          <button
            onClick={() => setActivePage('home')}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="font-black text-sm tracking-tight text-white">{globalSettings.website_name}</span>
            <span className="bg-cyan-500/20 text-cyan-400 font-bold text-[10px] px-2 py-0.5 rounded border border-cyan-500/30 uppercase">
              Admin Gateway
            </span>
          </div>
        </header>

        {/* Login Box */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-600/20">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">Admin Control Login</h1>
              <p className="text-xs text-slate-400">
                Password protected management area. Please enter your administrator email and password to log in.
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@taztech.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Admin Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/25"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Log In to Admin Panel</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Encrypted Session • Authorized Personnel Only</span>
            </div>
          </div>
        </main>

        <footer className="py-4 text-center text-[11px] text-slate-600 border-t border-slate-900 relative z-10">
          TazTech Mart E-Commerce • Secured Administrative Subsystem
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* Admin Topbar */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActivePage('home')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-1 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Store Front</span>
          </button>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center space-x-2">
            <span className="font-black text-sm sm:text-base tracking-tight text-white font-sans">
              {globalSettings.website_name}
            </span>
            <span className="bg-cyan-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
              Control Panel
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 hidden md:flex">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Logged in as <strong className="text-cyan-300">{user?.name}</strong> ({user?.role})
            </span>
          </div>
          <button
            onClick={loadAdminData}
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => {
              setShowPasswordModal(true);
              setPasswordChangeStatus(null);
              setCurrentPasswordInput('');
              setNewPasswordInput('');
              setConfirmPasswordInput('');
            }}
            className="flex items-center space-x-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 hover:border-cyan-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            title="Change Admin Password"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change Password</span>
          </button>
          <button
            onClick={() => {
              logout();
              setActionFeedback('Logged out of Admin Panel.');
            }}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 hover:border-rose-700/60 transition-colors"
            title="Log Out of Admin Panel"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Action Confirmation Banner */}
      {actionFeedback && (
        <div className="bg-emerald-600 text-white py-2 px-4 text-xs font-semibold flex items-center justify-between shadow-md sticky top-[49px] z-20 transition-all">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-200 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 border-r border-slate-800 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
              Store Operations
            </p>

            <button
              onClick={() => setActiveAdminTab('overview')}
              className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors ${
                activeAdminTab === 'overview' ? 'bg-cyan-600 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>Overview & KPIs</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('orders')}
              className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                activeAdminTab === 'orders' ? 'bg-cyan-600 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                <span>Orders & Fulfillment</span>
              </div>
              <span className="bg-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded text-cyan-400">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('products')}
              className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                activeAdminTab === 'products' ? 'bg-cyan-600 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <span>Products & Inventory</span>
              </div>
              {lowStockProducts.length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {lowStockProducts.length} low
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveAdminTab('categories')}
              className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors ${
                activeAdminTab === 'categories' ? 'bg-cyan-600 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <FolderTree className="w-4 h-4 text-purple-400" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('customers')}
              className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors ${
                activeAdminTab === 'customers' ? 'bg-cyan-600 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Customers Directory</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('coupons')}
              className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors ${
                activeAdminTab === 'coupons' ? 'bg-cyan-600 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Tag className="w-4 h-4 text-pink-400" />
              <span>Coupons & Promos</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('reviews')}
              className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                activeAdminTab === 'reviews' ? 'bg-cyan-600 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Reviews Moderation</span>
              </div>
              <span className="text-[10px] text-slate-400">{reviews.length}</span>
            </button>

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 pt-4">
              Growth & Content CMS
            </p>

            <button
              onClick={() => setActiveAdminTab('marketing')}
              className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors ${
                activeAdminTab === 'marketing' ? 'bg-cyan-600 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Megaphone className="w-4 h-4 text-orange-400" />
              <span>Marketing & Segments</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('analytics')}
              className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors ${
                activeAdminTab === 'analytics' ? 'bg-cyan-600 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Traffic & Funnel</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('cms')}
              className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors ${
                activeAdminTab === 'cms' ? 'bg-cyan-600 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Homepage Layout</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('banners')}
              className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors ${
                activeAdminTab === 'banners' ? 'bg-cyan-600 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>Hero Sliders & Banners</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('pages')}
              className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors ${
                activeAdminTab === 'pages' ? 'bg-cyan-600 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Static Pages & Policies</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('settings')}
              className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors ${
                activeAdminTab === 'settings' ? 'bg-cyan-600 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Site & Delivery Settings</span>
            </button>

          </div>
        </aside>

        {/* Workspace Canvas Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
          
          {/* TAB 1: OVERVIEW */}
          {activeAdminTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Admin Command Center</h2>
                <p className="text-xs text-slate-500">Live operational overview for TazTech Mart in Bangladesh.</p>
              </div>

              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total Sales Volume</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    ৳{(analytics?.total_sales || orders.reduce((s, o) => s + (o.total_amount || o.total || 0), 0)).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                    {orders.filter(o => o.status !== 'cancelled').length} successful orders
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total Orders</span>
                    <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                      <PackageCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{orders.length}</div>
                  <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
                    {orders.filter(o => o.status === 'pending').length} pending fulfillment
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Customer Accounts</span>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{customers.length}</div>
                  <span className="text-[11px] text-purple-600 font-semibold mt-1 inline-block">
                    Registered & Guest buyers
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Inventory Health</span>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{products.length} Products</div>
                  <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
                    {lowStockProducts.length} low in stock (&lt;10)
                  </span>
                </div>
              </div>

              {/* Two Column Section: Recent Orders + Low Stock Warnings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Orders List */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Recent Customer Orders</h3>
                    <button
                      onClick={() => setActiveAdminTab('orders')}
                      className="text-xs text-cyan-600 font-semibold hover:underline"
                    >
                      View All Orders
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-400 font-semibold uppercase">
                          <th className="pb-2">Order ID</th>
                          <th className="pb-2">Customer</th>
                          <th className="pb-2">Items</th>
                          <th className="pb-2">Total</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentOrders.map(ord => (
                          <tr key={ord.id} className="hover:bg-slate-50">
                            <td className="py-2.5 font-mono font-bold text-slate-800">{ord.id}</td>
                            <td className="py-2.5 text-slate-700">{ord.customer_name}</td>
                            <td className="py-2.5 text-slate-500">{ord.items.length} items</td>
                            <td className="py-2.5 font-bold text-slate-900">৳{(ord.total_amount || ord.total || 0).toLocaleString()}</td>
                            <td className="py-2.5">
                              {(() => {
                                const st = (ord.order_status || ord.status || '').toLowerCase();
                                return (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    st === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                    st === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                    st === 'confirmed' ? 'bg-cyan-100 text-cyan-800' :
                                    'bg-amber-100 text-amber-800'
                                  }`}>
                                    {ord.order_status || ord.status || 'pending'}
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Low Stock Warning Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                    <h3 className="text-sm font-bold text-slate-900">Low Stock Alerts (&le;10)</h3>
                  </div>

                  <div className="space-y-2.5">
                    {lowStockProducts.length === 0 ? (
                      <p className="text-xs text-slate-500">All inventory levels are healthy.</p>
                    ) : (
                      lowStockProducts.map(p => (
                        <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                          <div className="truncate mr-2">
                            <p className="font-bold text-slate-800 truncate">{p.name}</p>
                            <span className="text-[10px] text-slate-400">SKU: {p.sku}</span>
                          </div>
                          <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                            p.stock_quantity <= 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.stock_quantity} left
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeAdminTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Product Inventory Management</h2>
                  <p className="text-xs text-slate-500">Add, edit pricing, update stock and manage variants.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      brand: 'Anker',
                      category_id: categories[0]?.id || '',
                      regular_price: 1500,
                      sale_price: 1200,
                      stock_quantity: 20,
                      sku: `TZM-${Math.floor(1000 + Math.random() * 9000)}`,
                      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
                      description: 'Original genuine gadget with official manufacturer warranty in Bangladesh.',
                      warranty: '6 Months Official Warranty',
                      is_featured: false,
                      is_new_arrival: true,
                      is_best_seller: false,
                      variants: []
                    });
                    setShowProductModal(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by title, brand, or SKU..."
                  className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Brand</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Badges</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products
                      .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase()))
                      .map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 flex items-center space-x-3">
                            <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg border shrink-0" />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-xs">{p.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-700">{p.brand}</td>
                          <td className="p-3.5 text-slate-600">{p.category_name}</td>
                          <td className="p-3.5 font-bold text-slate-900">
                            ৳{p.sale_price.toLocaleString()}
                            {p.regular_price > p.sale_price && (
                              <span className="ml-1.5 text-[10px] text-slate-400 line-through">৳{p.regular_price.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              p.stock_quantity <= 0 ? 'bg-rose-100 text-rose-700' :
                              p.stock_quantity <= 5 ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.stock_quantity}
                            </span>
                          </td>
                          <td className="p-3.5 space-x-1">
                            {p.is_featured && <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Featured</span>}
                            {p.is_best_seller && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Best Seller</span>}
                          </td>
                          <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => handleDuplicateProduct(p.id)}
                              className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-slate-100 rounded-lg"
                              title="Duplicate Product"
                            >
                              <Copy className="w-3.5 h-3.5 inline" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setShowProductModal(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-slate-100 rounded-lg"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5 inline" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeAdminTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Categories Management</h2>
                  <p className="text-xs text-slate-500">Organize gadget catalog taxonomy and visual banners.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory({
                      name: '',
                      description: '',
                      image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
                      order_index: categories.length + 1,
                      is_active: true
                    });
                    setShowCategoryModal(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={c.image_url} alt={c.name} className="w-12 h-12 object-cover rounded-xl border shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{c.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">/{c.slug} • {c.product_count || 0} items</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingCategory(c);
                          setShowCategoryModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS & COURIER DISPATCH */}
          {activeAdminTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Orders & Delivery Tracking</h2>
                  <p className="text-xs text-slate-500">Manage dispatch, courier tracking, and Cash on Delivery settlements.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer / Contact</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Courier Tracking</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders
                      .filter(o => {
                        const s = (o.order_status || o.status || '').toLowerCase();
                        return orderStatusFilter === 'all' || s === orderStatusFilter.toLowerCase();
                      })
                      .map(o => (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-slate-900">{o.id}</td>
                          <td className="p-3.5">
                            <p className="font-bold text-slate-800">{o.customer_name}</p>
                            <span className="text-[11px] text-slate-500 font-mono">{o.customer_phone}</span>
                          </td>
                          <td className="p-3.5 text-slate-600">
                            {o.shipping_address ? `${o.shipping_address.district}, ${o.shipping_address.division}` : `${o.district || ''}, ${o.division || ''}`}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">৳{(o.total_amount || o.total || 0).toLocaleString()}</td>
                          <td className="p-3.5">
                            <select
                              value={o.order_status || o.status || 'pending'}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="bg-slate-100 text-xs font-bold py-1 px-2 rounded-lg border border-slate-200 cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3.5">
                            {o.courier_name ? (
                              <span className="font-semibold text-cyan-800">{o.courier_name} #{o.tracking_number}</span>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="text-cyan-600 font-bold hover:underline bg-cyan-50 px-2.5 py-1 rounded-lg"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMERS */}
          {activeAdminTab === 'customers' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Customer Profiles & Segments</h2>
                <p className="text-xs text-slate-500">Track buyers across Dhaka and regional districts in Bangladesh.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="p-3.5">Customer Name</th>
                      <th className="p-3.5">Contact Details</th>
                      <th className="p-3.5">Region</th>
                      <th className="p-3.5">Total Orders</th>
                      <th className="p-3.5">Total Spent</th>
                      <th className="p-3.5">Tags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900">{c.name}</td>
                        <td className="p-3.5">
                          <p>{c.email}</p>
                          <span className="text-slate-400 font-mono">{c.phone}</span>
                        </td>
                        <td className="p-3.5">{c.district}, {c.division}</td>
                        <td className="p-3.5 font-bold text-slate-700">{c.total_orders || 0}</td>
                        <td className="p-3.5 font-bold text-cyan-700">৳{(c.total_spent || 0).toLocaleString()}</td>
                        <td className="p-3.5">
                          {c.tags?.map((t, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full mr-1">
                              {t}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: COUPONS */}
          {activeAdminTab === 'coupons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Discount Coupons & Vouchers</h2>
                  <p className="text-xs text-slate-500">Create promotional codes for Bangladesh campaigns.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCoupon({
                      code: '',
                      discount_type: 'fixed',
                      discount_value: 500,
                      min_order_amount: 3000,
                      is_active: true
                    });
                    setShowCouponModal(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map(c => (
                  <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                        {c.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 pt-1">
                      Discount: {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `৳${c.discount_value} FLAT OFF`}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Minimum Order: ৳{c.min_order_amount.toLocaleString()}
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center p-1 rounded hover:bg-rose-50 transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setEditingCoupon(c);
                          setShowCouponModal(true);
                        }}
                        className="text-xs text-cyan-600 font-bold hover:underline"
                      >
                        Edit Coupon
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: REVIEWS */}
          {activeAdminTab === 'reviews' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Customer Reviews Moderation</h2>
                <p className="text-xs text-slate-500">Approve, reject, or feature customer testimonials on the homepage.</p>
              </div>

              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <strong className="text-xs text-slate-900">{r.customer_name}</strong>
                        <span className="text-[10px] text-slate-400">({r.customer_email})</span>
                        <div className="flex text-amber-400">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        {r.is_featured && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                            Homepage Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 italic">"{r.comment}"</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleReviewStatus(r.id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewStatus(r.id, 'rejected')}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <button
                          onClick={() => handleReviewStatus(r.id, 'approved', !r.is_featured)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                            r.is_featured ? 'bg-amber-50 border-amber-300 text-amber-800' : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {r.is_featured ? 'Unfeature' : 'Feature on Home'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: MARKETING & CAMPAIGNS */}
          {activeAdminTab === 'marketing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Marketing & Promotional Campaigns</h2>
                <p className="text-xs text-slate-500">Segment buyers and dispatch WhatsApp / SMS / Email campaigns across BD.</p>
              </div>

              {/* Create Campaign Box */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Launch New Promotional Blast</h3>
                <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Campaign Title</label>
                    <input
                      type="text"
                      required
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      placeholder="e.g. Flash Earbuds Eid Promo"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Channel</label>
                    <select
                      value={newCampaignChannel}
                      onChange={(e: any) => setNewCampaignChannel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl"
                    >
                      <option value="whatsapp">WhatsApp Business Blast</option>
                      <option value="sms">Bulk SMS (BD 880)</option>
                      <option value="email">Email Newsletter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Promo Voucher Code</label>
                    <input
                      type="text"
                      value={newCampaignDiscount}
                      onChange={(e) => setNewCampaignDiscount(e.target.value.toUpperCase())}
                      placeholder="e.g. EID500"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl uppercase"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-2.5 rounded-xl shadow-xs"
                    >
                      Launch Campaign
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Campaigns */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
                    <tr>
                      <th className="p-3.5">Campaign Name</th>
                      <th className="p-3.5">Channel</th>
                      <th className="p-3.5">Audience Segment</th>
                      <th className="p-3.5">Voucher</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {campaigns.map(camp => (
                      <tr key={camp.id}>
                        <td className="p-3.5 font-bold text-slate-900">{camp.name}</td>
                        <td className="p-3.5 uppercase font-semibold text-cyan-700">{camp.channel}</td>
                        <td className="p-3.5">{camp.target_segment}</td>
                        <td className="p-3.5 font-mono">{camp.discount_code || 'None'}</td>
                        <td className="p-3.5">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {camp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: ANALYTICS & TRAFFIC */}
          {activeAdminTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Visitor Analytics & Conversion Funnel</h2>
                <p className="text-xs text-slate-500">First-party, privacy-preserving conversion metrics.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Pageviews</span>
                  <div className="text-3xl font-black text-slate-900 mt-2">{analytics?.total_pageviews || 1420}</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">+18% this week</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">Cart Additions</span>
                  <div className="text-3xl font-black text-slate-900 mt-2">{analytics?.total_cart_additions || 84}</div>
                  <span className="text-[11px] text-cyan-600 font-semibold">Active shopper intent</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">Checkout Conversion Rate</span>
                  <div className="text-3xl font-black text-slate-900 mt-2">
                    {analytics?.conversion_rate ? `${analytics.conversion_rate.toFixed(1)}%` : '4.8%'}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Industry leading in BD</span>
                </div>
              </div>

              {/* Conversion Funnel Bar */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">E-commerce Funnel Breakdown</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>1. Store Visitors</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-cyan-600 h-full w-full rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>2. Product Details Views</span>
                      <span>68%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full w-[68%] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>3. Add to Cart</span>
                      <span>24%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full w-[24%] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>4. Completed Purchases (Cash on Delivery)</span>
                      <span>5.2%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[5.2%] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: CMS HOMEPAGE SECTIONS */}
          {activeAdminTab === 'cms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Homepage Sections CMS</h2>
                  <p className="text-xs text-slate-500">Toggle sections on/off, customize headings, and order on the page.</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await api.updateHomepageSections(homepageSections);
                      setActionFeedback('Homepage layout & section ordering saved successfully!');
                      setTimeout(() => setActionFeedback(null), 3500);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Section Layout</span>
                </button>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
                {homepageSections.map((sec, idx) => (
                  <div key={sec.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{sec.title}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">Type: {sec.type} • Order: {sec.order_index}</span>
                    </div>
                    <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sec.is_enabled}
                        onChange={(e) => {
                          const updated = [...homepageSections];
                          updated[idx].is_enabled = e.target.checked;
                          setHomepageSections(updated);
                        }}
                        className="rounded text-cyan-600 w-4 h-4"
                      />
                      <span>{sec.is_enabled ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: HERO BANNERS */}
          {activeAdminTab === 'banners' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Hero Carousel Banners</h2>
                  <p className="text-xs text-slate-500">Control promotional banners and clickable CTAs.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingBanner({
                      title: 'New Flagship Drop',
                      subtitle: 'Premium gadget with official warranty and fast shipping.',
                      badge_text: 'Featured',
                      button_text: 'Shop Now',
                      link_url: '/shop',
                      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200',
                      is_active: true,
                      order_index: banners.length + 1
                    });
                    setShowBannerModal(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Banner</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                    <div className="relative aspect-[16/8] bg-slate-900">
                      <img src={b.image_url} alt={b.title} className="w-full h-full object-cover opacity-70" />
                      <div className="absolute inset-0 p-4 text-white flex flex-col justify-end bg-gradient-to-t from-slate-950/90 to-transparent">
                        <span className="text-[10px] font-bold text-cyan-300 uppercase">{b.badge_text}</span>
                        <h4 className="font-black text-base">{b.title}</h4>
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-between border-t border-slate-100">
                      <span className="text-xs text-slate-500 truncate max-w-xs">{b.link_url}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeleteBanner(b.id, b.title)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingBanner(b);
                            setShowBannerModal(true);
                          }}
                          className="text-xs text-cyan-600 font-bold hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12: SITE & DELIVERY SETTINGS */}
          {activeAdminTab === 'settings' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs max-w-3xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Website & Delivery Configuration</h2>
                <p className="text-xs text-slate-500">Edit branding, logo text, hotline, and nationwide courier fees.</p>
              </div>

              {settingsSavedMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" />
                  <span>Settings updated successfully! Changes are live across the store.</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                
                {/* Branding */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider">Store Identity</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Website Name</label>
                      <input
                        type="text"
                        value={settingsForm.website_name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, website_name: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Editable Logo Text</label>
                      <input
                        type="text"
                        value={settingsForm.logo_text}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logo_text: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Fees & Free Threshold */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider">
                    Bangladesh Courier & Shipping Rates
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Inside Dhaka (৳)</label>
                      <input
                        type="number"
                        value={settingsForm.delivery_inside_dhaka}
                        onChange={(e) => setSettingsForm({ ...settingsForm, delivery_inside_dhaka: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Outside Dhaka (৳)</label>
                      <input
                        type="number"
                        value={settingsForm.delivery_outside_dhaka}
                        onChange={(e) => setSettingsForm({ ...settingsForm, delivery_outside_dhaka: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Free Delivery Minimum (৳)</label>
                      <input
                        type="number"
                        value={settingsForm.free_delivery_threshold}
                        onChange={(e) => setSettingsForm({ ...settingsForm, free_delivery_threshold: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Elephant Road Address */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider">Contact & Support</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hotline Phone</label>
                      <input
                        type="text"
                        value={settingsForm.contact_phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contact_phone: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
                      <input
                        type="text"
                        value={settingsForm.whatsapp_number}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Store Address</label>
                      <input
                        type="text"
                        value={settingsForm.contact_address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contact_address: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Announcement Bar */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider">Top Announcement Bar</h4>
                  <div>
                    <label className="flex items-center space-x-2 font-bold text-slate-700 mb-2">
                      <input
                        type="checkbox"
                        checked={settingsForm.announcement_enabled}
                        onChange={(e) => setSettingsForm({ ...settingsForm, announcement_enabled: e.target.checked })}
                        className="rounded text-cyan-600"
                      />
                      <span>Enable Announcement Bar</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.announcement_text}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcement_text: e.target.value })}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-colors inline-flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Settings</span>
                </button>
              </form>

              {/* Admin Security & Password Change */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Admin Access Security & Password</h3>
                    <p className="text-slate-500 text-[11px]">
                      Change your administrator account password. Only authorized administrators can update this access credential.
                    </p>
                  </div>
                </div>

                {passwordChangeStatus && (
                  <div className={`p-3 rounded-xl text-xs flex items-start space-x-2 ${
                    passwordChangeStatus.type === 'success' 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}>
                    {passwordChangeStatus.type === 'success' ? (
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    )}
                    <span>{passwordChangeStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-xl">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Current Password</label>
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="text-[11px] text-cyan-600 font-semibold hover:underline"
                      >
                        {showCurrentPass ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="Enter your current admin password"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">New Password</label>
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="text-[11px] text-cyan-600 font-semibold hover:underline"
                        >
                          {showNewPass ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors inline-flex items-center space-x-1.5"
                  >
                    {isChangingPassword ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Update Admin Password</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 13: STATIC PAGES CMS */}
          {activeAdminTab === 'pages' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Static Pages & Content Editor</h2>
                <p className="text-xs text-slate-500">Edit About Us, FAQ, Privacy, and Return Policies directly.</p>
              </div>

              {editingPage ? (
                <form onSubmit={handleSavePage} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Editing: {editingPage.title}</h3>
                    <button
                      type="button"
                      onClick={() => setEditingPage(null)}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Page Title</label>
                    <input
                      type="text"
                      value={editingPage.title}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Page Body Content</label>
                    <textarea
                      rows={10}
                      value={editingPage.content}
                      onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs"
                  >
                    Save Page Content
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {staticPages.map(page => (
                    <div key={page.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{page.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">/{page.slug}</span>
                      </div>
                      <button
                        onClick={() => setEditingPage(page)}
                        className="text-xs text-cyan-600 font-bold hover:underline bg-cyan-50 px-3 py-1.5 rounded-lg"
                      >
                        Edit Page
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Order Details & Courier Assignment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Manage Order</span>
                <h3 className="font-mono font-black text-slate-900 text-base">{selectedOrder.id}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Courier Dispatch */}
            <div className="bg-cyan-50/70 p-4 rounded-2xl border border-cyan-200/80 space-y-3">
              <h4 className="font-bold text-cyan-950 flex items-center">
                <Truck className="w-4 h-4 mr-1.5 text-cyan-600" />
                Assign Courier & Tracking
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-cyan-800 uppercase mb-1">Courier Service</label>
                  <select
                    value={selectedOrder.courier_name || 'Steadfast Courier'}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, courier_name: e.target.value })}
                    className="w-full bg-white border border-cyan-200 p-2 rounded-xl text-xs"
                  >
                    <option value="Steadfast Courier">Steadfast Courier (Nationwide)</option>
                    <option value="Pathao Courier">Pathao Courier (Express)</option>
                    <option value="RedX Logistics">RedX Logistics</option>
                    <option value="Paperfly">Paperfly BD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-cyan-800 uppercase mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={selectedOrder.tracking_number || ''}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, tracking_number: e.target.value })}
                    placeholder="e.g. ST-9824819"
                    className="w-full bg-white border border-cyan-200 p-2 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, selectedOrder.order_status || selectedOrder.status || 'pending', selectedOrder.tracking_number, selectedOrder.courier_name)}
                  className="bg-cyan-600 text-white font-bold px-4 py-1.5 rounded-lg hover:bg-cyan-700"
                >
                  Save Courier Details
                </button>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p><strong>Customer:</strong> {selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
              <p>
                <strong>Address:</strong>{' '}
                {selectedOrder.shipping_address ? (
                  `${selectedOrder.shipping_address.full_address}, ${selectedOrder.shipping_address.district}, ${selectedOrder.shipping_address.division}`
                ) : (
                  `${selectedOrder.full_address || ''}, ${selectedOrder.district || ''}, ${selectedOrder.division || ''}`
                )}
              </p>
              {(selectedOrder.notes || selectedOrder.delivery_note) && (
                <p className="text-slate-500 italic">"{selectedOrder.notes || selectedOrder.delivery_note}"</p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-1.5 divide-y divide-slate-100">
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="pt-1.5 flex justify-between">
                  <span>{it.product_name} x {it.quantity}</span>
                  <span className="font-bold">৳{it.total_price.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-sm">
              <span>Total:</span>
              <span className="text-cyan-700">৳{(selectedOrder.total_amount || selectedOrder.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleSaveProduct} className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingProduct.id ? 'Edit Product' : 'Create New Gadget'}
              </h3>
              <button type="button" onClick={() => setShowProductModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={editingProduct.brand || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={editingProduct.category_id || categories[0]?.id}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sale Price (৳ BDT)</label>
                <input
                  type="number"
                  required
                  value={editingProduct.sale_price || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sale_price: Number(e.target.value) })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Regular Price (৳ BDT)</label>
                <input
                  type="number"
                  required
                  value={editingProduct.regular_price || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, regular_price: Number(e.target.value) })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={editingProduct.stock_quantity ?? 10}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={editingProduct.sku || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Primary Image URL</label>
                <input
                  type="url"
                  value={editingProduct.images?.[0] || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2 flex items-center space-x-4">
                <label className="flex items-center space-x-1.5 font-bold">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                    className="rounded text-cyan-600"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center space-x-1.5 font-bold">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_best_seller || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_best_seller: e.target.checked })}
                    className="rounded text-cyan-600"
                  />
                  <span>Best Seller</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-cyan-600 text-white font-bold px-5 py-2 rounded-xl hover:bg-cyan-700"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleSaveCategory} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 text-xs shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Save Category</h3>
            <div>
              <label className="block font-bold mb-1">Name</label>
              <input
                type="text"
                required
                value={editingCategory.name || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="w-full bg-slate-50 border p-2.5 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Image URL</label>
              <input
                type="url"
                value={editingCategory.image_url || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                className="w-full bg-slate-50 border p-2.5 rounded-xl"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setShowCategoryModal(false)} className="bg-slate-200 px-4 py-2 rounded-xl">Cancel</button>
              <button type="submit" className="bg-cyan-600 text-white font-bold px-5 py-2 rounded-xl">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleSaveCoupon} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 text-xs shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Save Voucher Coupon</h3>
            <div>
              <label className="block font-bold mb-1">Coupon Code</label>
              <input
                type="text"
                required
                value={editingCoupon.code || ''}
                onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border p-2.5 rounded-xl uppercase font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1">Discount Type</label>
                <select
                  value={editingCoupon.discount_type || 'fixed'}
                  onChange={(e: any) => setEditingCoupon({ ...editingCoupon, discount_type: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                >
                  <option value="fixed">Fixed BDT Amount (৳)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Discount Value</label>
                <input
                  type="number"
                  required
                  value={editingCoupon.discount_value || 100}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_value: Number(e.target.value) })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold mb-1">Minimum Order Subtotal (৳)</label>
              <input
                type="number"
                value={editingCoupon.min_order_amount || 1000}
                onChange={(e) => setEditingCoupon({ ...editingCoupon, min_order_amount: Number(e.target.value) })}
                className="w-full bg-slate-50 border p-2.5 rounded-xl"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setShowCouponModal(false)} className="bg-slate-200 px-4 py-2 rounded-xl">Cancel</button>
              <button type="submit" className="bg-cyan-600 text-white font-bold px-5 py-2 rounded-xl">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Banner Modal */}
      {showBannerModal && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleSaveBanner} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 text-xs shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Save Hero Carousel Banner</h3>
            <div>
              <label className="block font-bold mb-1">Title</label>
              <input
                type="text"
                required
                value={editingBanner.title || ''}
                onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                className="w-full bg-slate-50 border p-2.5 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Subtitle</label>
              <input
                type="text"
                value={editingBanner.subtitle || ''}
                onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                className="w-full bg-slate-50 border p-2.5 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Image URL</label>
              <input
                type="url"
                required
                value={editingBanner.image_url || ''}
                onChange={(e) => setEditingBanner({ ...editingBanner, image_url: e.target.value })}
                className="w-full bg-slate-50 border p-2.5 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1">Button Text</label>
                <input
                  type="text"
                  value={editingBanner.button_text || 'Shop Now'}
                  onChange={(e) => setEditingBanner({ ...editingBanner, button_text: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Destination Link</label>
                <input
                  type="text"
                  value={editingBanner.link_url || '/shop'}
                  onChange={(e) => setEditingBanner({ ...editingBanner, link_url: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setShowBannerModal(false)} className="bg-slate-200 px-4 py-2 rounded-xl">Cancel</button>
              <button type="submit" className="bg-cyan-600 text-white font-bold px-5 py-2 rounded-xl">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Change Admin Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Change Admin Password</h3>
                  <p className="text-[11px] text-slate-500">Update your credentials to maintain security</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordChangeStatus(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordChangeStatus && (
              <div className={`p-3 rounded-xl text-xs flex items-start space-x-2 ${
                passwordChangeStatus.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {passwordChangeStatus.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <span>{passwordChangeStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Current Password</label>
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="text-[11px] text-cyan-600 font-semibold hover:underline"
                  >
                    {showCurrentPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">New Password</label>
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="text-[11px] text-cyan-600 font-semibold hover:underline"
                  >
                    {showNewPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordChangeStatus(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 shadow-md shadow-cyan-600/20"
                >
                  {isChangingPassword ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Save New Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
