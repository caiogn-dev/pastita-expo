import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Haptics from '../utils/haptics';
import * as storeApi from '../services/storeApi';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants/config';
import type { Product, WishlistItem } from '../types';

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistIds: Set<string>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch wishlist from API
  const fetchWishlist = useCallback(async () => {
    try {
      const data = await storeApi.getWishlist();
      setWishlist(data);
      setWishlistIds(new Set(data.map((item) => item.product.id)));

      // Cache wishlist data
      await storage.setJSON(STORAGE_KEYS.WISHLIST_DATA, data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  }, []);

  // Load cached wishlist and fetch fresh data
  useEffect(() => {
    const initWishlist = async () => {
      // Load cached data first
      const cached = await storage.getJSON<WishlistItem[]>(STORAGE_KEYS.WISHLIST_DATA);
      if (cached) {
        setWishlist(cached);
        setWishlistIds(new Set(cached.map((item) => item.product.id)));
      }

      // Fetch fresh data
      await fetchWishlist();
    };

    initWishlist();
  }, [fetchWishlist]);

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return wishlistIds.has(productId);
    },
    [wishlistIds]
  );

  // Toggle product in wishlist
  const toggleWishlist = async (product: Product): Promise<void> => {
    setIsLoading(true);
    const wasInWishlist = isInWishlist(product.id);

    // Optimistic update
    if (wasInWishlist) {
      setWishlist((prev) => prev.filter((item) => item.product.id !== product.id));
      setWishlistIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    } else {
      const newItem: WishlistItem = {
        id: `temp_${product.id}`,
        product,
        added_at: new Date().toISOString(),
      };
      setWishlist((prev) => [...prev, newItem]);
      setWishlistIds((prev) => new Set(prev).add(product.id));
    }

    // Haptic feedback
    await Haptics.impactAsync(
      wasInWishlist ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
    );

    try {
      await storeApi.toggleWishlist(product.id);
      await fetchWishlist();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Revert on error
      await fetchWishlist();
    } finally {
      setIsLoading(false);
    }
  };

  // Add product to wishlist
  const addToWishlist = async (product: Product): Promise<void> => {
    if (isInWishlist(product.id)) return;

    setIsLoading(true);

    // Optimistic update
    const newItem: WishlistItem = {
      id: `temp_${product.id}`,
      product,
      added_at: new Date().toISOString(),
    };
    setWishlist((prev) => [...prev, newItem]);
    setWishlistIds((prev) => new Set(prev).add(product.id));

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await storeApi.addToWishlist(product.id);
      await fetchWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Revert on error
      await fetchWishlist();
    } finally {
      setIsLoading(false);
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId: string): Promise<void> => {
    if (!isInWishlist(productId)) return;

    setIsLoading(true);

    // Optimistic update
    setWishlist((prev) => prev.filter((item) => item.product.id !== productId));
    setWishlistIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await storeApi.removeFromWishlist(productId);
      await fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Revert on error
      await fetchWishlist();
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh wishlist from server
  const refreshWishlist = async (): Promise<void> => {
    await fetchWishlist();
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        refreshWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
