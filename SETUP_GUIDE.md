# Pastita Mobile App - Setup & Backend Connection Guide

## 📋 Overview

This guide explains how to configure the Pastita Expo mobile app to connect to your Django backend server.

---

## 🔧 Step 1: Configure API Endpoints

### Option A: Using Environment Variables (Recommended for Production)

Create a `.env` file in the root of the `pastita-expo` folder:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api/v1
EXPO_PUBLIC_WS_URL=wss://your-api-domain.com/ws
EXPO_PUBLIC_STORE_SLUG=pastita

# Store Contact Info
EXPO_PUBLIC_WHATSAPP_NUMBER=5563992957931
EXPO_PUBLIC_CONTACT_EMAIL=contato@pastita.com.br
```

### Option B: Direct Configuration (For Development/Testing)

Edit the file `src/constants/config.ts`:

```typescript
// Change these values to match your server
export const API_CONFIG = {
  BASE_URL: 'https://your-api-domain.com/api/v1',  // Your Django API URL
  WS_URL: 'wss://your-api-domain.com/ws',          // WebSocket URL (optional)
  STORE_SLUG: 'pastita',                            // Your store slug
  TIMEOUT: 30000,
};

export const STORE_INFO = {
  NAME: 'Pastita',
  WHATSAPP_NUMBER: '5563992957931',  // Your WhatsApp number (with country code)
  EMAIL: 'contato@pastita.com.br',
  ADDRESS: 'Quadra 104 Sul, Rua SE 09',
  CITY: 'Palmas',
  STATE: 'TO',
  ZIP_CODE: '77020-018',
};
```

---

## 🌐 Step 2: Backend Server Requirements

Your Django backend must have these endpoints available:

### Public Endpoints (No Authentication Required)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/stores/s/{store_slug}/` | GET | Store information |
| `/stores/s/{store_slug}/catalog/` | GET | Full product catalog |
| `/stores/s/{store_slug}/cart/` | GET | Get cart contents |
| `/stores/s/{store_slug}/cart/add/` | POST | Add item to cart |
| `/stores/s/{store_slug}/cart/item/{id}/` | PATCH/DELETE | Update/remove cart item |
| `/stores/s/{store_slug}/cart/clear/` | DELETE | Clear cart |
| `/stores/s/{store_slug}/checkout/` | POST | Process checkout |
| `/stores/s/{store_slug}/delivery-fee/` | GET | Calculate delivery fee |
| `/stores/s/{store_slug}/validate-coupon/` | POST | Validate coupon code |
| `/stores/s/{store_slug}/wishlist/` | GET | Get wishlist |
| `/stores/s/{store_slug}/wishlist/add/` | POST | Add to wishlist |
| `/stores/s/{store_slug}/wishlist/remove/` | POST | Remove from wishlist |
| `/stores/s/{store_slug}/wishlist/toggle/` | POST | Toggle wishlist item |
| `/stores/orders/{id}/` | GET | Get order details |
| `/stores/orders/{id}/whatsapp/` | GET | Get WhatsApp link |

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register/` | POST | Register new user |
| `/auth/login/` | POST | Login user |
| `/auth/logout/` | POST | Logout user |
| `/users/profile/` | GET/PATCH | Get/update user profile |

### Maps Endpoints (Optional)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/stores/maps/geocode/` | GET | Geocode address |
| `/stores/maps/reverse-geocode/` | GET | Reverse geocode |
| `/stores/s/{store_slug}/autosuggest/` | GET | Address autocomplete |
| `/stores/s/{store_slug}/validate-delivery/` | POST | Validate delivery address |

---

## 🔒 Step 3: CORS Configuration (Backend)

Add your mobile app's origin to Django's CORS settings in `settings.py`:

```python
# settings.py

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",      # Expo development
    "http://localhost:19006",     # Expo web
    "exp://localhost:8081",       # Expo Go
    # Add your production domains
]

# Or allow all origins for development (NOT recommended for production)
CORS_ALLOW_ALL_ORIGINS = True

# Allow credentials (cookies, auth headers)
CORS_ALLOW_CREDENTIALS = True

# Allowed headers
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

---

## 📱 Step 4: Running the App

### Development Mode

```bash
cd pastita-expo

# Install dependencies
npm install

# Start Expo development server
npm start

# Or run directly on device/emulator
npm run android   # For Android
npm run ios       # For iOS (macOS only)
```

### Testing with Expo Go

1. Install **Expo Go** app on your phone
2. Run `npm start` in the terminal
3. Scan the QR code with:
   - **Android**: Expo Go app
   - **iOS**: Camera app

### Testing with Local Backend

If your backend is running locally (e.g., `http://localhost:8000`):

1. Find your computer's local IP address:
   ```bash
   # On macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # On Windows
   ipconfig
   ```

2. Update `src/constants/config.ts`:
   ```typescript
   export const API_CONFIG = {
     BASE_URL: 'http://192.168.1.100:8000/api/v1',  // Use your local IP
     // ...
   };
   ```

3. Make sure your Django server is accessible:
   ```bash
   # Run Django with 0.0.0.0 to accept external connections
   python manage.py runserver 0.0.0.0:8000
   ```

---

## 📦 Step 5: Building for Production

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure the project
eas build:configure

# Build Android APK (for testing)
eas build --platform android --profile preview

# Build Android AAB (for Play Store)
eas build --platform android --profile production

# Build iOS (for App Store)
eas build --platform ios --profile production
```

### Using Local Build (Already Done)

The APK files are already built and available:
- `pastita-v1.0.0-release.apk` - Release build (75MB)
- `pastita-debug.apk` - Debug build (159MB)

To install on Android device:
```bash
# Using ADB
adb install pastita-v1.0.0-release.apk

# Or transfer the APK to your phone and install manually
```

---

## 🔑 Step 6: Authentication Flow

The app uses Token-based authentication:

1. **Login**: User enters email/password → App calls `/auth/login/` → Server returns token
2. **Token Storage**: Token is stored securely using `expo-secure-store`
3. **API Requests**: Token is automatically added to all authenticated requests
4. **Logout**: Token is cleared from storage

### Token Format

The app expects the server to return:
```json
{
  "token": "your-auth-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

---

## 🛒 Step 7: Cart & Session Management

The app uses session-based cart management:

- **Anonymous Users**: Cart is stored in cookies/session
- **Authenticated Users**: Cart is linked to user account
- **Cart Persistence**: Cart data is cached locally for offline access

### Cart API Request Format

```json
// Add to cart
POST /stores/s/pastita/cart/add/
{
  "product_id": "uuid-of-product",
  "quantity": 1,
  "options": {},
  "notes": ""
}

// Add combo to cart
POST /stores/s/pastita/cart/add/
{
  "combo_id": "uuid-of-combo",
  "quantity": 1,
  "customizations": {},
  "notes": ""
}
```

---

## 📍 Step 8: Push Notifications (Optional)

To enable push notifications:

1. **Get Expo Project ID**:
   ```bash
   eas project:init
   ```

2. **Update `app.json`**:
   ```json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "your-actual-project-id"
         }
       }
     }
   }
   ```

3. **Update `src/services/notifications.ts`**:
   ```typescript
   const tokenData = await Notifications.getExpoPushTokenAsync({
     projectId: 'your-actual-project-id',
   });
   ```

4. **Backend Integration**: Send push tokens to your server and use Expo's push notification service.

---

## 🐛 Troubleshooting

### Common Issues

1. **"Network Error" or "Connection Refused"**
   - Check if backend server is running
   - Verify API URL is correct
   - Ensure CORS is configured properly
   - For local development, use your computer's IP, not `localhost`

2. **"401 Unauthorized"**
   - Token may have expired
   - Check if token is being sent in headers
   - Verify authentication endpoint is working

3. **"Cart not persisting"**
   - Check if cookies are enabled
   - Verify session middleware is configured in Django
   - Check `withCredentials: true` in API config

4. **"Images not loading"**
   - Verify `buildMediaUrl` function in `storeApi.ts`
   - Check if media files are served correctly by backend
   - Ensure CORS allows image requests

### Debug Mode

Enable debug logging by adding to your component:
```typescript
import { API_CONFIG } from '../constants/config';
console.log('API URL:', API_CONFIG.BASE_URL);
```

---

## 📊 API Response Formats

### Catalog Response
```json
{
  "store": { "id": "...", "name": "Pastita", ... },
  "categories": [...],
  "products": [...],
  "combos": [...],
  "featured_products": [...],
  "products_by_category": { "category_id": [...] }
}
```

### Cart Response
```json
{
  "id": "cart-uuid",
  "items": [
    {
      "id": "item-uuid",
      "product": "product-uuid",
      "product_name": "Rondelli 4 Queijos",
      "quantity": 2,
      "unit_price": "29.90",
      "total_price": "59.80"
    }
  ],
  "combo_items": [...],
  "subtotal": "59.80",
  "total": "59.80"
}
```

### Order Response
```json
{
  "id": "order-uuid",
  "order_number": "PAS-001234",
  "status": "pending",
  "payment_status": "pending",
  "items": [...],
  "subtotal": "59.80",
  "delivery_fee": "10.00",
  "discount": "0.00",
  "total": "69.80",
  "created_at": "2026-01-14T12:00:00Z"
}
```

---

## 🚀 Quick Start Checklist

- [ ] Clone/copy the `pastita-expo` folder
- [ ] Run `npm install`
- [ ] Edit `src/constants/config.ts` with your API URL
- [ ] Ensure backend CORS is configured
- [ ] Run `npm start`
- [ ] Test on Expo Go or emulator
- [ ] Build APK when ready: `eas build --platform android`

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your backend API is working (test with Postman/curl)
3. Check the browser console for errors
4. Review the network requests in React Native Debugger

---

**Happy coding! 🍝**
