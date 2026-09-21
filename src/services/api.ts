import { 
  Product, Category, Order, Coupon, Review, SiteSettings, HomepageSection,
  HeroBanner, StaticPage, User, CustomerProfile, AnalyticsSummary,
  MarketingCampaign, CustomerSegment
} from '../types';

const API_BASE = '/api';

// Visitor ID management for privacy-conscious first-party analytics
export function getVisitorId(): string {
  let vid = localStorage.getItem('tzm_visitor_id');
  if (!vid) {
    vid = 'vis-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem('tzm_visitor_id', vid);
  }
  return vid;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('tzm_auth_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('tzm_auth_token', token);
  } else {
    localStorage.removeItem('tzm_auth_token');
  }
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errorMsg = 'API request failed';
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch (e) {
      // not json
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Settings
  getSettings: () => fetchJson<SiteSettings>('/settings'),
  updateSettings: (settings: Partial<SiteSettings>) => 
    fetchJson<SiteSettings>('/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  // Categories
  getCategories: () => fetchJson<Category[]>('/categories'),
  createCategory: (data: Partial<Category>) => 
    fetchJson<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Partial<Category>) => 
    fetchJson<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => 
    fetchJson<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (params?: {
    category?: string;
    search?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    sort?: string;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          query.set(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    return fetchJson<Product[]>(`/products${qStr ? '?' + qStr : ''}`);
  },
  getProduct: (idOrSlug: string) => fetchJson<Product>(`/products/${idOrSlug}`),
  createProduct: (data: Partial<Product>) => 
    fetchJson<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Partial<Product>) => 
    fetchJson<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => 
    fetchJson<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  duplicateProduct: (id: string) => 
    fetchJson<Product>(`/products/${id}/duplicate`, { method: 'POST' }),

  // Orders
  getOrders: (params?: { search?: string; status?: string; email?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.email) query.set('email', params.email);
    const qStr = query.toString();
    return fetchJson<Order[]>(`/orders${qStr ? '?' + qStr : ''}`);
  },
  getOrder: (id: string) => fetchJson<Order>(`/orders/${id}`),
  createOrder: (data: Partial<Order>) => 
    fetchJson<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id: string, data: { status: string; tracking_number?: string; courier_name?: string; internal_notes?: string }) => 
    fetchJson<Order>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Coupons
  getCoupons: () => fetchJson<Coupon[]>('/coupons'),
  validateCoupon: (code: string, subtotal: number) => 
    fetchJson<{ valid: boolean; discount: number; coupon?: Coupon; message?: string }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    }),
  createCoupon: (data: Partial<Coupon>) => 
    fetchJson<Coupon>('/coupons', { method: 'POST', body: JSON.stringify(data) }),
  updateCoupon: (id: string, data: Partial<Coupon>) => 
    fetchJson<Coupon>(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCoupon: (id: string) => 
    fetchJson<{ success: boolean }>(`/coupons/${id}`, { method: 'DELETE' }),

  // Reviews
  getReviews: (params?: { productId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.productId) query.set('productId', params.productId);
    if (params?.status) query.set('status', params.status);
    return fetchJson<Review[]>(`/reviews?${query.toString()}`);
  },
  createReview: (data: Partial<Review>) => 
    fetchJson<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  updateReviewStatus: (id: string, status: 'approved' | 'rejected', is_featured?: boolean) => 
    fetchJson<Review>(`/reviews/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, is_featured }) }),
  deleteReview: (id: string) => 
    fetchJson<{ success: boolean }>(`/reviews/${id}`, { method: 'DELETE' }),

  // CMS
  getHomepageCMS: () => fetchJson<{ sections: HomepageSection[]; banners: HeroBanner[] }>('/cms/homepage'),
  updateHomepageSections: (sections: HomepageSection[]) => 
    fetchJson<HomepageSection[]>('/cms/sections', { method: 'PUT', body: JSON.stringify(sections) }),
  createBanner: (data: Partial<HeroBanner>) => 
    fetchJson<HeroBanner>('/cms/banners', { method: 'POST', body: JSON.stringify(data) }),
  updateBanner: (id: string, data: Partial<HeroBanner>) => 
    fetchJson<HeroBanner>(`/cms/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBanner: (id: string) => 
    fetchJson<{ success: boolean }>(`/cms/banners/${id}`, { method: 'DELETE' }),

  // Static Pages
  getPages: () => fetchJson<StaticPage[]>('/pages'),
  getPage: (slug: string) => fetchJson<StaticPage>(`/pages/${slug}`),
  updatePage: (slug: string, data: Partial<StaticPage>) => 
    fetchJson<StaticPage>(`/pages/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Auth
  register: (data: any) => fetchJson<{ user: User; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => fetchJson<{ user: User; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchJson<{ user: User; customer?: CustomerProfile }>('/auth/me'),
  updateProfile: (data: any) => fetchJson<{ user: User; customer?: CustomerProfile }>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Wishlist
  getWishlist: () => fetchJson<Product[]>('/wishlist'),
  toggleWishlist: (productId: string) => 
    fetchJson<{ added: boolean; wishlist: Product[] }>('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ product_id: productId }) }),

  // Analytics & Marketing
  trackEvent: (eventType: string, payload?: any, customerId?: string) => {
    const vid = getVisitorId();
    return fetch(`${API_BASE}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: vid,
        customer_id: customerId,
        event_type: eventType,
        payload
      })
    }).catch(() => {});
  },
  getAnalyticsSummary: () => fetchJson<AnalyticsSummary>('/admin/analytics'),
  getCustomerSegments: () => fetchJson<CustomerSegment[]>('/admin/marketing/segments'),
  getCampaigns: () => fetchJson<MarketingCampaign[]>('/admin/marketing/campaigns'),
  createCampaign: (data: Partial<MarketingCampaign>) => 
    fetchJson<MarketingCampaign>('/admin/marketing/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id: string, data: Partial<MarketingCampaign>) => 
    fetchJson<MarketingCampaign>(`/admin/marketing/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getCustomers: () => fetchJson<CustomerProfile[]>('/admin/customers'),
  getCustomer: (id: string) => fetchJson<{ customer: CustomerProfile; orders: Order[] }>(`/admin/customers/${id}`),

  // Newsletter
  subscribeNewsletter: (email: string, phone?: string) => 
    fetchJson<{ success: boolean; message: string }>('/newsletter', { method: 'POST', body: JSON.stringify({ email, phone, source: 'Website Subscription' }) })
};
