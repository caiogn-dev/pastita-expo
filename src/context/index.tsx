import React, { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { CartProvider, useCart } from './CartContext';
import { WishlistProvider, useWishlist } from './WishlistContext';
import { StoreProvider, useStore } from './StoreContext';

export { AuthProvider, useAuth } from './AuthContext';
export { CartProvider, useCart } from './CartContext';
export { WishlistProvider, useWishlist } from './WishlistContext';
export { StoreProvider, useStore } from './StoreContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
};

export default AppProviders;
