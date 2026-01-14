# Pastita - Expo React Native App

Mobile app for Pastita artisanal pasta e-commerce, built with Expo and React Native.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for development)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Running on Device

1. Install **Expo Go** on your phone (iOS App Store / Google Play)
2. Run `npm start`
3. Scan the QR code with Expo Go (Android) or Camera app (iOS)

### Running on Emulator

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios
```

## 📱 Features

- **Product Catalog**: Browse products by category with search
- **Shopping Cart**: Add products and combos with quantity controls
- **Checkout**: Complete checkout with delivery/pickup options
- **User Authentication**: Login, register, profile management
- **Order Tracking**: View order history and status
- **Favorites/Wishlist**: Save favorite products
- **Push Notifications**: Order status updates
- **Location Services**: GPS-based delivery address

## 🏗️ Project Structure

```
pastita-expo/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── cardapio.tsx   # Menu/catalog screen
│   │   ├── cart.tsx       # Shopping cart
│   │   ├── orders.tsx     # Order history
│   │   └── profile.tsx    # User profile
│   ├── auth/              # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── product/           # Product detail
│   │   └── [id].tsx
│   ├── order/             # Order detail
│   │   └── [id].tsx
│   ├── checkout.tsx       # Checkout flow
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/           # React Context providers
│   ├── services/          # API and native services
│   ├── constants/         # Theme and config
│   ├── types/             # TypeScript types
│   └── hooks/             # Custom hooks
├── assets/                # Images and fonts
├── app.json              # Expo configuration
└── package.json
```

## 🎨 Tech Stack

- **Framework**: Expo SDK 51 + React Native
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context
- **Styling**: StyleSheet + Theme constants
- **HTTP Client**: Axios
- **Storage**: AsyncStorage + SecureStore
- **Images**: expo-image
- **Notifications**: expo-notifications
- **Location**: expo-location
- **Haptics**: expo-haptics

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
EXPO_PUBLIC_API_URL=https://api.pastita.com.br/api/v1
EXPO_PUBLIC_WS_URL=wss://api.pastita.com.br/ws
EXPO_PUBLIC_STORE_SLUG=pastita
EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=your-key
EXPO_PUBLIC_HERE_API_KEY=your-key
EXPO_PUBLIC_WHATSAPP_NUMBER=5563992957931
EXPO_PUBLIC_CONTACT_EMAIL=contato@pastita.com.br
```

### App Configuration

Edit `app.json` to customize:
- App name and slug
- Bundle identifiers (iOS/Android)
- Icons and splash screen
- Permissions
- EAS project ID

## 📦 Building for Production

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for Android (APK)
eas build --platform android --profile preview

# Build for Android (AAB - Play Store)
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

### Local Build (Advanced)

```bash
# Generate native projects
npx expo prebuild

# Build Android APK
cd android && ./gradlew assembleRelease

# Build iOS (requires macOS + Xcode)
cd ios && xcodebuild -workspace App.xcworkspace -scheme App archive
```

## 🔐 App Store Submission

### Android (Google Play)

1. Build AAB: `eas build --platform android --profile production`
2. Download the `.aab` file from EAS
3. Upload to Google Play Console
4. Fill in store listing, screenshots, etc.
5. Submit for review

### iOS (App Store)

1. Build: `eas build --platform ios --profile production`
2. Submit: `eas submit --platform ios`
3. Or download IPA and upload via Transporter
4. Configure in App Store Connect
5. Submit for review

## 📋 Required Assets for Stores

### Android
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Screenshots: 1080x1920 (phone), 1200x1920 (tablet)

### iOS
- App icon: 1024x1024 PNG (no alpha)
- Screenshots: Various sizes for different devices
- App preview video (optional)

## 🧪 Testing

```bash
# Run on development
npm start

# Run with tunnel (for testing on external devices)
npm start -- --tunnel

# Clear cache
npm start -- --clear
```

## 📝 API Documentation

The app connects to the Pastita backend API:

- **Base URL**: `https://api.pastita.com.br/api/v1`
- **Store API**: `/stores/s/pastita/`
- **Auth API**: `/auth/`

See the server repository for full API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for Pastita
