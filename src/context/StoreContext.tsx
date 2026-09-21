import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  SiteSettings, Category, Product, ProductVariant, CartItem, User,
  CustomerProfile, Coupon
} from '../types';
import { api, setAuthToken, getAuthToken } from '../services/api';

interface StoreContextType {
  settings: SiteSettings;
  categories: Category[];
  cart: CartItem[];
  cartSubtotal: number;
  deliveryCharge: number;
  couponDiscount: number;
  cartTotal: number;
  totalCartQuantity: number;
  appliedCoupon: Coupon | null;
  deliveryDivision: 'inside_dhaka' | 'outside_dhaka';
  setDeliveryDivision: (div: 'inside_dhaka' | 'outside_dhaka') => void;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number, buyNow?: boolean) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  wishlist: Product[];
  wishlistIds: string[];
  toggleWishlist: (product: Product) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;

  recentlyViewed: Product[];
  addRecentlyViewed: (product: Product) => void;

  user: User | null;
  customerProfile: CustomerProfile | null;
  login: (email: string, pass: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  updateProfile: (data: any) => Promise<void>;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  activePage: string;
  setActivePage: (page: string) => void;
  selectedProductSlug: string | null;
  setSelectedProductSlug: (slug: string | null) => void;
  selectedPolicySlug: string;
  setSelectedPolicySlug: (slug: string) => void;
  confirmedOrderId: string | null;
  setConfirmedOrderId: (orderId: string | null) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (catSlug: string | null) => void;

  refreshSettings: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  navigateToProduct: (slug: string) => void;
  navigateToCategory: (slug: string) => void;
  navigateToPolicy: (slug: string) => void;
}

const defaultSettings: SiteSettings = {
  id: 'default',
  website_name: 'TazTech Mart',
  logo_text: 'TazTech Mart',
  logo_image: '',
  favicon: '',
  primary_color: '#0284c7',
  secondary_color: '#0f172a',
  contact_email: 'support@taztechmart.com',
  contact_phone: '+880 1711-234567',
  contact_address: 'Level 4, Multiplan Center, Elephant Road, Dhaka 1205, Bangladesh',
  currency_symbol: '৳',
  currency_code: 'BDT',
  delivery_inside_dhaka: 70,
  delivery_outside_dhaka: 130,
  free_delivery_threshold: 3000,
  estimated_delivery_dhaka: '24 - 48 Hours',
  estimated_delivery_outside: '2 - 4 Days',
  delivery_notes: 'Cash on delivery is available all over Bangladesh.',
  facebook_url: 'https://facebook.com/taztechmart',
  instagram_url: 'https://instagram.com/taztechmart',
  youtube_url: 'https://youtube.com/@taztechmart',
  tiktok_url: 'https://tiktok.com/@taztechmart',
  whatsapp_number: '+8801711234567',
  seo_meta_title: 'TazTech Mart | Authentic Gadgets & Electronics in BD',
  seo_meta_description: 'Buy genuine electronics, earbuds, smart watches and fast chargers in Bangladesh.',
  seo_keywords: 'gadgets BD, tech shop bangladesh',
  og_image: '',
  announcement_text: '⚡ Eid & Tech Mega Sale: Use code TAZTECH500 for ৳500 OFF on orders over ৳3,000! Free Delivery over ৳3,000!',
  announcement_enabled: true,
  announcement_bg_color: '#0f172a',
  announcement_text_color: '#38bdf8'
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tzm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [deliveryDivision, setDeliveryDivision] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');

  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tzm_wishlist_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('tzm_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);

  // UI Navigation states
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [selectedPolicySlug, setSelectedPolicySlug] = useState<string>('about-us');
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Initial loads
  const refreshSettings = useCallback(async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Check auth
  useEffect(() => {
    refreshSettings();
    refreshCategories();

    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then(res => {
          setUser(res.user);
          if (res.customer) setCustomerProfile(res.customer);
        })
        .catch(() => {
          setAuthToken(null);
          setUser(null);
          setCustomerProfile(null);
        });
    }

    // Track initial pageview
    api.trackEvent('page_view', { path: window.location.pathname });
  }, [refreshSettings, refreshCategories]);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tzm_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tzm_wishlist_ids', JSON.stringify(wishlistIds));
    } catch (e) {
      console.error(e);
    }
  }, [wishlistIds]);

  // Calculate cart math
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const deliveryCharge = cartSubtotal >= settings.free_delivery_threshold || cartSubtotal === 0
    ? 0
    : (deliveryDivision === 'inside_dhaka' ? settings.delivery_inside_dhaka : settings.delivery_outside_dhaka);

  const cartTotal = Math.max(0, cartSubtotal - couponDiscount + deliveryCharge);

  const addToCart = (product: Product, variant?: ProductVariant, quantity = 1, buyNow = false) => {
    const itemPrice = variant ? variant.price : product.sale_price;
    const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, {
          id: cartItemId,
          product_id: product.id,
          variant_id: variant?.id,
          product,
          selected_variant: variant,
          quantity,
          price: itemPrice
        }];
      }
    });

    api.trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      variant_title: variant?.title,
      quantity,
      price: itemPrice
    }, user?.id);

    if (buyNow) {
      setActivePage('checkout');
    } else {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    api.trackEvent('remove_from_cart', { cart_item_id: cartItemId }, user?.id);
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
    }
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.validateCoupon(code, cartSubtotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponDiscount(res.discount);
        return { success: true, message: res.message || 'Coupon applied successfully!' };
      } else {
        return { success: false, message: res.message || 'Invalid coupon code.' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to apply coupon.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const toggleWishlist = async (product: Product): Promise<boolean> => {
    const isPresent = wishlistIds.includes(product.id);
    const newIds = isPresent ? wishlistIds.filter(id => id !== product.id) : [...wishlistIds, product.id];
    setWishlistIds(newIds);

    if (isPresent) {
      setWishlist(prev => prev.filter(p => p.id !== product.id));
    } else {
      setWishlist(prev => [product, ...prev]);
    }

    api.trackEvent('wishlist_action', {
      product_id: product.id,
      action: isPresent ? 'remove' : 'add'
    }, user?.id);

    if (user) {
      api.toggleWishlist(product.id).catch(() => {});
    }

    return !isPresent;
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const addRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('tzm_recently_viewed', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    api.trackEvent('product_view', {
      product_id: product.id,
      product_name: product.name,
      category_id: product.category_id,
      sale_price: product.sale_price
    }, user?.id);
  };

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    setAuthToken(res.token);
    setUser(res.user);
    const me = await api.getMe();
    if (me.customer) setCustomerProfile(me.customer);
    setIsAuthModalOpen(false);
    return res.user;
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setAuthToken(res.token);
    setUser(res.user);
    const me = await api.getMe();
    if (me.customer) setCustomerProfile(me.customer);
    setIsAuthModalOpen(false);
    return res.user;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setCustomerProfile(null);
    if (activePage === 'admin' || activePage === 'account' || activePage === 'my-orders') {
      setActivePage('home');
    }
  };

  const updateProfile = async (data: any) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
    if (res.customer) setCustomerProfile(res.customer);
  };

  const navigateToProduct = (slug: string) => {
    setSelectedProductSlug(slug);
    setActivePage('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (slug: string) => {
    setSelectedCategorySlug(slug);
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPolicy = (slug: string) => {
    setSelectedPolicySlug(slug);
    setActivePage('policy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <StoreContext.Provider value={{
      settings,
      categories,
      cart,
      cartSubtotal,
      deliveryCharge,
      couponDiscount,
      cartTotal,
      totalCartQuantity,
      appliedCoupon,
      deliveryDivision,
      setDeliveryDivision,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,

      wishlist,
      wishlistIds,
      toggleWishlist,
      isInWishlist,

      recentlyViewed,
      addRecentlyViewed,

      user,
      customerProfile,
      login,
      register,
      logout,
      updateProfile,

      isCartOpen,
      setIsCartOpen,
      isAuthModalOpen,
      setIsAuthModalOpen,

      activePage,
      setActivePage,
      selectedProductSlug,
      setSelectedProductSlug,
      selectedPolicySlug,
      setSelectedPolicySlug,
      confirmedOrderId,
      setConfirmedOrderId,

      searchQuery,
      setSearchQuery,
      selectedCategorySlug,
      setSelectedCategorySlug,

      refreshSettings,
      refreshCategories,
      navigateToProduct,
      navigateToCategory,
      navigateToPolicy
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
