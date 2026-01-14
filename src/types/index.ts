// User Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  cpf?: string;
  address?: Address;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  lat?: number;
  lng?: number;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  main_image_url?: string;
  images?: string[];
  category?: Category;
  category_id?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  stock_quantity?: number;
  featured: boolean;
  tags?: string[];
  attributes?: Record<string, any>;
  product_type?: ProductType;
}

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

// Combo Types
export interface Combo {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  image_url?: string;
  items: ComboItem[];
  is_active: boolean;
}

export interface ComboItem {
  id: string;
  product: Product;
  quantity: number;
}

// Cart Types
export interface CartItem {
  id: string;
  cart_item_id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  options?: Record<string, any>;
  notes?: string;
}

export interface CartComboItem extends CartItem {
  isCombo: true;
  customizations?: Record<string, any>;
}

export interface Cart {
  items: CartItem[];
  combo_items: CartComboItem[];
  subtotal: number;
  total: number;
}

// Order Types
export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  delivery_method: 'delivery' | 'pickup';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address?: Address;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  items: OrderItem[];
  combo_items?: OrderComboItem[];
  notes?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  created_at: string;
  updated_at: string;
  access_token?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'refunded'
  | 'cancelled';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderComboItem {
  id: string;
  combo_id: string;
  combo_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Checkout Types
export interface CheckoutData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cpf?: string;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: Address;
  delivery_notes?: string;
  payment_method: 'pix' | 'credit_card' | 'cash';
  payment?: PaymentData;
  coupon_code?: string;
  scheduled_date?: string;
  scheduled_time?: string;
}

export interface PaymentData {
  method: string;
  type?: string;
  token?: string;
  installments?: number;
  issuer_id?: string;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value?: number;
  max_discount?: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
}

// Delivery Types
export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  min_time: number;
  max_time: number;
}

export interface DeliveryInfo {
  fee: number;
  distance_km: number;
  estimated_time: number;
  zone?: DeliveryZone;
}

// Store Types
export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string;
  whatsapp_number?: string;
  email?: string;
  latitude: number;
  longitude: number;
  is_open: boolean;
  operating_hours?: Record<string, { open: string; close: string }>;
}

// Catalog Types
export interface Catalog {
  store: Store;
  categories: Category[];
  products: Product[];
  combos: Combo[];
  featured_products: Product[];
  products_by_category: Record<string, Product[]>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Auth Types
export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  product: Product;
  added_at: string;
}
