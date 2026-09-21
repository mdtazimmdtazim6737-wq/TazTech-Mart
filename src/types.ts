export type UserRole = 'super_admin' | 'admin' | 'manager' | 'content_manager' | 'order_manager' | 'customer';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'pending' | 'paid' | 'refunded';
export type PaymentMethod = 'Cash on Delivery' | 'bKash' | 'Nagad' | 'Card' | 'cod' | 'bkash' | 'nagad' | 'card';
export type StockStatus = 'in_stock' | 'out_of_stock' | 'pre_order';
export type DiscountType = 'percentage' | 'fixed';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  created_at: string;
}

export interface CustomerProfile {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  full_address: string;
  notes?: string;
  created_at: string;
  total_orders?: number;
  total_spent?: number;
  tags?: string[];
  last_order_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  image_url?: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
  parent_id?: string | null;
  product_count?: number;
}

export interface ProductVariant {
  id: string;
  product_id?: string;
  title: string; // e.g. "Space Gray / 64GB"
  sku: string;
  price: number;
  stock_quantity: number;
  attributes: Record<string, string>; // e.g. { Color: "Space Gray", Storage: "64GB" }
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  category_name?: string;
  subcategory_id?: string;
  brand: string;
  description?: string;
  short_description: string;
  full_description: string;
  images: string[];
  video_url?: string;
  regular_price: number;
  sale_price: number;
  discount_percentage: number;
  stock_quantity: number;
  stock_status: StockStatus;
  variants: ProductVariant[];
  specifications: Record<string, string>;
  warranty?: string;
  tags: string[];
  related_product_ids: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  rating: number;
  reviews_count: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  product: Product;
  selected_variant?: ProductVariant;
  quantity: number;
  price: number;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_title?: string;
  sku?: string;
  unit_price?: number;
  price: number;
  quantity: number;
  total_price: number;
  product_image: string;
}

export interface Order {
  id: string; // e.g. TZM-20260921-0001
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  division?: string;
  district?: string;
  area?: string;
  full_address?: string;
  shipping_address?: {
    name: string;
    phone: string;
    division: string;
    district: string;
    area: string;
    full_address: string;
    country?: string;
  };
  delivery_note?: string;
  notes?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status?: OrderStatus;
  status?: string;
  subtotal: number;
  discount?: number;
  discount_amount?: number;
  delivery_charge: number;
  total?: number;
  total_amount?: number;
  coupon_code?: string;
  internal_notes?: string;
  tracking_number?: string;
  courier_name?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  start_date: string;
  expiry_date: string;
  usage_limit: number;
  times_used: number;
  specific_product_ids?: string[];
  specific_category_ids?: string[];
  is_active: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  product_name?: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  comment: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  website_name: string;
  logo_text: string;
  logo_image?: string;
  favicon?: string;
  primary_color: string;
  secondary_color: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  currency_symbol: string;
  currency_code: string;
  delivery_inside_dhaka: number;
  delivery_outside_dhaka: number;
  free_delivery_threshold: number;
  estimated_delivery_dhaka: string;
  estimated_delivery_outside: string;
  delivery_notes: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  tiktok_url: string;
  whatsapp_number: string;
  seo_meta_title: string;
  seo_meta_description: string;
  seo_keywords: string;
  og_image: string;
  announcement_text: string;
  announcement_enabled: boolean;
  announcement_bg_color: string;
  announcement_text_color: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  type?: string;
  title: string;
  subtitle?: string;
  is_enabled: boolean;
  order_index: number;
  config?: Record<string, any>;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  badge_text: string;
  image_url: string;
  button_text: string;
  button_link: string;
  link_url?: string;
  bg_gradient?: string;
  is_active: boolean;
  order_index: number;
}

export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  updated_at: string;
}

export interface AnalyticsSummary {
  total_visitors: number;
  new_visitors: number;
  returning_visitors: number;
  product_views: number;
  add_to_cart_events: number;
  checkout_events: number;
  total_orders: number;
  total_sales: number;
  total_pageviews?: number;
  total_cart_additions?: number;
  conversion_rate: number;
  cart_abandonment_rate: number;
  top_viewed_products: { id: string; name: string; views: number; image: string }[];
  top_selling_products: { id: string; name: string; sales_count: number; revenue: number; image: string }[];
}

export interface MarketingCampaign {
  id: string;
  name: string;
  target_segment: string;
  subject: string;
  message?: string;
  image_url?: string;
  promo_offer?: string;
  start_date?: string;
  end_date?: string;
  channel?: string;
  discount_code?: string;
  status: 'Draft' | 'Scheduled' | 'Active' | 'Completed' | 'draft' | 'scheduled' | 'active' | 'completed';
  created_at: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  count: number;
  criteria: string;
}
