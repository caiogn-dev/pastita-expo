import { storeApi, authApi, globalApi, setAuthToken, clearAuthToken, getAuthToken } from './api';
import { API_CONFIG } from '../constants/config';
import type {
  User,
  Product,
  Category,
  Combo,
  Cart,
  CartItem,
  Order,
  Catalog,
  CheckoutData,
  Coupon,
  DeliveryInfo,
  LoginResponse,
  RegisterData,
  WishlistItem,
  Address,
} from '../types';

// =============================================================================
// STORE INFO
// =============================================================================

export const getStoreInfo = async () => {
  const response = await storeApi.get('/');
  return response.data;
};

// =============================================================================
// CATALOG
// =============================================================================

export const getCatalog = async (): Promise<Catalog> => {
  const response = await storeApi.get('/catalog/');
  return response.data;
};

export const getProductsByCategory = async (categorySlug: string): Promise<Product[]> => {
  const catalog = await getCatalog();
  const category = catalog.categories.find((c) => c.slug === categorySlug);
  if (!category) return [];
  return catalog.products_by_category[category.id] || [];
};

export const getProduct = async (productId: string): Promise<Product> => {
  const response = await globalApi.get(`/products/${productId}/`);
  return response.data;
};

// =============================================================================
// CART
// =============================================================================

export const getCart = async (): Promise<Cart> => {
  const response = await storeApi.get('/cart/');
  return response.data;
};

export const addToCart = async (
  productId: string,
  quantity: number = 1,
  options: Record<string, any> = {},
  notes: string = ''
): Promise<Cart> => {
  const response = await storeApi.post('/cart/add/', {
    product_id: productId,
    quantity,
    options,
    notes,
  });
  return response.data;
};

export const addComboToCart = async (
  comboId: string,
  quantity: number = 1,
  customizations: Record<string, any> = {},
  notes: string = ''
): Promise<Cart> => {
  const response = await storeApi.post('/cart/add/', {
    combo_id: comboId,
    quantity,
    customizations,
    notes,
  });
  return response.data;
};

export const updateCartItem = async (itemId: string, quantity: number): Promise<Cart> => {
  const response = await storeApi.patch(`/cart/item/${itemId}/`, { quantity });
  return response.data;
};

export const removeCartItem = async (itemId: string): Promise<Cart> => {
  const response = await storeApi.delete(`/cart/item/${itemId}/`);
  return response.data;
};

export const clearCart = async (): Promise<void> => {
  await storeApi.delete('/cart/clear/');
};

// =============================================================================
// CHECKOUT
// =============================================================================

export const checkout = async (checkoutData: CheckoutData): Promise<any> => {
  const response = await storeApi.post('/checkout/', checkoutData);
  return response.data;
};

export const calculateDeliveryFee = async (
  distanceKm?: number,
  zipCode?: string
): Promise<DeliveryInfo> => {
  const params = new URLSearchParams();
  if (distanceKm) params.append('distance_km', String(distanceKm));
  if (zipCode) params.append('zip_code', zipCode);

  const response = await storeApi.get(`/delivery-fee/?${params.toString()}`);
  return response.data;
};

export const validateCoupon = async (
  code: string,
  subtotal: number
): Promise<{ valid: boolean; coupon?: Coupon; discount?: number; message?: string }> => {
  const response = await storeApi.post('/validate-coupon/', { code, subtotal });
  return response.data;
};

// =============================================================================
// MAPS & DELIVERY
// =============================================================================

export const calculateRoute = async (
  destLat: number,
  destLng: number
): Promise<{ distance_km: number; duration_minutes: number; polyline?: string }> => {
  const response = await storeApi.get(`/route/?dest_lat=${destLat}&dest_lng=${destLng}`);
  return response.data;
};

export const validateDeliveryAddress = async (
  lat: number,
  lng: number
): Promise<{ valid: boolean; fee?: number; message?: string }> => {
  const response = await storeApi.post('/validate-delivery/', { lat, lng });
  return response.data;
};

export const validateDeliveryByAddress = async (
  address: string
): Promise<{ valid: boolean; fee?: number; lat?: number; lng?: number; message?: string }> => {
  const response = await storeApi.post('/validate-delivery/', { address });
  return response.data;
};

export const getDeliveryZones = async (timeRanges?: number[]) => {
  let url = '/delivery-zones/';
  if (timeRanges) {
    url += `?time_ranges=${timeRanges.join(',')}`;
  }
  const response = await storeApi.get(url);
  return response.data;
};

export const autosuggestAddress = async (
  query: string,
  limit: number = 5
): Promise<Array<{ label: string; lat: number; lng: number }>> => {
  const response = await storeApi.get(
    `/autosuggest/?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  return response.data.suggestions;
};

// =============================================================================
// WISHLIST
// =============================================================================

export const getWishlist = async (): Promise<WishlistItem[]> => {
  const response = await storeApi.get('/wishlist/');
  return response.data;
};

export const addToWishlist = async (productId: string): Promise<WishlistItem> => {
  const response = await storeApi.post('/wishlist/add/', { product_id: productId });
  return response.data;
};

export const removeFromWishlist = async (productId: string): Promise<void> => {
  await storeApi.post('/wishlist/remove/', { product_id: productId });
};

export const toggleWishlist = async (
  productId: string
): Promise<{ added: boolean; item?: WishlistItem }> => {
  const response = await storeApi.post('/wishlist/toggle/', { product_id: productId });
  return response.data;
};

// =============================================================================
// GLOBAL MAPS
// =============================================================================

export const geocodeAddress = async (
  address: string
): Promise<{ lat: number; lng: number; formatted_address: string }> => {
  const response = await globalApi.get(`/maps/geocode/?address=${encodeURIComponent(address)}`);
  return response.data;
};

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<{ address: string; street?: string; city?: string; state?: string; zip_code?: string }> => {
  const response = await globalApi.get(`/maps/reverse-geocode/?lat=${lat}&lng=${lng}`);
  return response.data;
};

// =============================================================================
// ORDERS
// =============================================================================

export const getOrderByToken = async (accessToken: string): Promise<Order> => {
  const response = await globalApi.get(`/orders/by-token/${accessToken}/`);
  return response.data;
};

export const getOrderStatus = async (
  orderIdOrNumber: string,
  token?: string
): Promise<{ status: string; payment_status: string; order: Order }> => {
  const params = token ? { token } : {};
  const authToken = await getAuthToken();
  const headers = authToken ? { Authorization: `Token ${authToken}` } : {};

  const response = await globalApi.get(`/orders/${orderIdOrNumber}/payment-status/`, {
    params,
    headers,
  });
  return response.data;
};

export const getUserOrders = async (): Promise<Order[]> => {
  const token = await getAuthToken();
  const response = await globalApi.get('/orders/', {
    headers: token ? { Authorization: `Token ${token}` } : {},
    params: { store: API_CONFIG.STORE_SLUG },
  });
  return response.data.results || response.data;
};

export const getOrder = async (orderId: string): Promise<Order> => {
  const token = await getAuthToken();
  const response = await globalApi.get(`/orders/${orderId}/`, {
    headers: token ? { Authorization: `Token ${token}` } : {},
  });
  return response.data;
};

export const getOrderWhatsApp = async (
  orderId: string
): Promise<{ url: string; message: string }> => {
  const token = await getAuthToken();
  const response = await globalApi.get(`/orders/${orderId}/whatsapp/`, {
    headers: token ? { Authorization: `Token ${token}` } : {},
  });
  return response.data;
};

// =============================================================================
// AUTH
// =============================================================================

export const registerUser = async (data: RegisterData): Promise<LoginResponse> => {
  const response = await authApi.post('/auth/register/', data);
  if (response.data.token) {
    await setAuthToken(response.data.token);
  }
  return response.data;
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await authApi.post('/auth/login/', { email, password });
  if (response.data.token) {
    await setAuthToken(response.data.token);
  }
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  try {
    await authApi.post('/auth/logout/');
  } finally {
    await clearAuthToken();
  }
};

export const getProfile = async (): Promise<User> => {
  const response = await authApi.get('/users/profile/');
  return response.data;
};

export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await authApi.patch('/users/profile/', data);
  return response.data;
};

// =============================================================================
// UTILITIES
// =============================================================================

export const buildMediaUrl = (value?: string): string => {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  const baseUrl = API_CONFIG.BASE_URL.replace('/api/v1', '');
  if (value.startsWith('/')) {
    return `${baseUrl}${value}`;
  }
  return `${baseUrl}/${value}`;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const formatCEP = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return cep;
};

// Export token management functions
export { setAuthToken, clearAuthToken, getAuthToken };
