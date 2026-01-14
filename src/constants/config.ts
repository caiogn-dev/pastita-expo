// API Configuration
// Backend: https://web-production-3e83a.up.railway.app
// Frontend: https://pastita.com.br
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://web-production-3e83a.up.railway.app/api/v1',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'wss://web-production-3e83a.up.railway.app/ws',
  STORE_SLUG: process.env.EXPO_PUBLIC_STORE_SLUG || 'pastita',
  TIMEOUT: 30000,
};

// Store Information
export const STORE_INFO = {
  NAME: 'Pastita',
  WHATSAPP_NUMBER: process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || '5563992957931',
  EMAIL: process.env.EXPO_PUBLIC_CONTACT_EMAIL || 'contato@pastita.com.br',
  ADDRESS: 'Q. 112 Sul Rua SR 1, conj. 06 lote 04 - Plano Diretor Sul',
  CITY: 'Palmas',
  STATE: 'TO',
  ZIP: '77020-170',
  LAT: -10.1847,
  LNG: -48.3337,
};

// Payment Configuration (Mercado Pago)
export const PAYMENT_CONFIG = {
  MERCADO_PAGO_PUBLIC_KEY: process.env.EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || 'APP_USR-1028397074398684-010420-b5a75e26d020b05d1fb4b2fbcd759506-235180147',
};

// Maps Configuration
export const MAPS_CONFIG = {
  HERE_API_KEY: process.env.EXPO_PUBLIC_HERE_API_KEY || '',
};

// App Configuration
export const APP_CONFIG = {
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
  MIN_ORDER_VALUE: 0,
  CURRENCY: 'BRL',
  LOCALE: 'pt-BR',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
  WISHLIST_DATA: 'wishlist_data',
  PUSH_TOKEN: 'push_token',
  ONBOARDING_COMPLETE: 'onboarding_complete',
};

export default {
  API_CONFIG,
  STORE_INFO,
  PAYMENT_CONFIG,
  MAPS_CONFIG,
  APP_CONFIG,
  STORAGE_KEYS,
};
