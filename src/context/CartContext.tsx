import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Haptics from '../utils/haptics';
import * as storeApi from '../services/storeApi';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants/config';
import type { CartItem, CartComboItem, Product, Combo } from '../types';

interface CartContextType {
  // Products
  cart: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, amount: number) => Promise<void>;

  // Combos
  combos: CartComboItem[];
  addComboToCart: (combo: Combo) => Promise<void>;
  removeComboFromCart: (comboId: string) => Promise<void>;
  updateComboQuantity: (comboId: string, amount: number) => Promise<void>;

  // Totals
  cartCount: number;
  cartTotal: number;
  productTotal: number;
  comboTotal: number;
  hasItems: boolean;

  // Actions
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;

  // Loading state
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [combos, setCombos] = useState<CartComboItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Normalize cart item from API response
  const normalizeCartItem = (item: any): CartItem => ({
    id: item.product,
    cart_item_id: item.id,
    name: item.product_name,
    price: parseFloat(item.unit_price),
    image: storeApi.buildMediaUrl(item.product_image),
    quantity: item.quantity,
    options: item.options || {},
    notes: item.notes || '',
  });

  // Normalize combo item from API response
  const normalizeComboItem = (item: any): CartComboItem => ({
    id: item.combo,
    cart_item_id: item.id,
    name: item.combo_name,
    price: parseFloat(item.unit_price),
    image: storeApi.buildMediaUrl(item.combo_image),
    quantity: item.quantity,
    customizations: item.customizations || {},
    notes: item.notes || '',
    isCombo: true,
  });

  // Build optimistic item for immediate UI update
  const buildOptimisticItem = (product: Product, quantity: number): CartItem => ({
    id: product.id,
    cart_item_id: `temp_${product.id}`,
    name: product.name,
    price: product.price,
    image: storeApi.buildMediaUrl(product.main_image_url),
    quantity,
    options: {},
    notes: '',
  });

  // Build optimistic combo for immediate UI update
  const buildOptimisticCombo = (combo: Combo, quantity: number): CartComboItem => ({
    id: combo.id,
    cart_item_id: `temp_combo_${combo.id}`,
    name: combo.name,
    price: combo.price,
    image: storeApi.buildMediaUrl(combo.image_url),
    quantity,
    customizations: {},
    notes: '',
    isCombo: true,
  });

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    try {
      const data = await storeApi.getCart();
      const formattedProducts = (data.items || []).map(normalizeCartItem);
      const formattedCombos = (data.combo_items || []).map(normalizeComboItem);

      setCart(formattedProducts);
      setCombos(formattedCombos);

      // Cache cart data
      await storage.setJSON(STORAGE_KEYS.CART_DATA, {
        products: formattedProducts,
        combos: formattedCombos,
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, []);

  // Load cached cart and fetch fresh data
  useEffect(() => {
    const initCart = async () => {
      // Load cached data first
      const cached = await storage.getJSON<{ products: CartItem[]; combos: CartComboItem[] }>(
        STORAGE_KEYS.CART_DATA
      );
      if (cached) {
        setCart(cached.products || []);
        setCombos(cached.combos || []);
      }

      // Fetch fresh data
      await fetchCart();
    };

    initCart();
  }, [fetchCart]);

  // Add product to cart
  const addToCart = async (product: Product): Promise<void> => {
    setIsLoading(true);
    const previousCart = [...cart];

    // Optimistic update
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...prevCart, buildOptimisticItem(product, 1)];
    });

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await storeApi.addToCart(product.id, 1, {}, '');
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCart(previousCart);
    } finally {
      setIsLoading(false);
    }
  };

  // Add combo to cart
  const addComboToCart = async (combo: Combo): Promise<void> => {
    setIsLoading(true);
    const previousCombos = [...combos];

    // Optimistic update
    setCombos((prevCombos) => {
      const existingIndex = prevCombos.findIndex((item) => item.id === combo.id);
      if (existingIndex >= 0) {
        const updated = [...prevCombos];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...prevCombos, buildOptimisticCombo(combo, 1)];
    });

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await storeApi.addComboToCart(combo.id, 1, {}, '');
      await fetchCart();
    } catch (error) {
      console.error('Error adding combo to cart:', error);
      setCombos(previousCombos);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId: string): Promise<void> => {
    const previousCart = [...cart];
    const item = cart.find((i) => i.id === productId);

    setCart((prevCart) => prevCart.filter((i) => i.id !== productId));

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (item?.cart_item_id && !item.cart_item_id.startsWith('temp_')) {
        await storeApi.removeCartItem(item.cart_item_id);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setCart(previousCart);
    }
  };

  // Remove combo from cart
  const removeComboFromCart = async (comboId: string): Promise<void> => {
    const previousCombos = [...combos];
    const item = combos.find((i) => i.id === comboId);

    setCombos((prevCombos) => prevCombos.filter((i) => i.id !== comboId));

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (item?.cart_item_id && !item.cart_item_id.startsWith('temp_')) {
        await storeApi.removeCartItem(item.cart_item_id);
      }
    } catch (error) {
      console.error('Error removing combo from cart:', error);
      setCombos(previousCombos);
    }
  };

  // Update product quantity
  const updateQuantity = async (productId: string, amount: number): Promise<void> => {
    const currentItem = cart.find((item) => item.id === productId);
    if (!currentItem) return;

    const newQuantity = currentItem.quantity + amount;
    if (newQuantity < 1) {
      return removeFromCart(productId);
    }

    const previousCart = [...cart];
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );

    // Haptic feedback
    await Haptics.selectionAsync();

    try {
      if (currentItem.cart_item_id && !currentItem.cart_item_id.startsWith('temp_')) {
        await storeApi.updateCartItem(currentItem.cart_item_id, newQuantity);
      }
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      setCart(previousCart);
    }
  };

  // Update combo quantity
  const updateComboQuantity = async (comboId: string, amount: number): Promise<void> => {
    const currentItem = combos.find((item) => item.id === comboId);
    if (!currentItem) return;

    const newQuantity = currentItem.quantity + amount;
    if (newQuantity < 1) {
      return removeComboFromCart(comboId);
    }

    const previousCombos = [...combos];
    setCombos((prevCombos) =>
      prevCombos.map((item) =>
        item.id === comboId ? { ...item, quantity: newQuantity } : item
      )
    );

    // Haptic feedback
    await Haptics.selectionAsync();

    try {
      if (currentItem.cart_item_id && !currentItem.cart_item_id.startsWith('temp_')) {
        await storeApi.updateCartItem(currentItem.cart_item_id, newQuantity);
      }
      await fetchCart();
    } catch (error) {
      console.error('Error updating combo quantity:', error);
      setCombos(previousCombos);
    }
  };

  // Clear entire cart
  const clearCart = async (): Promise<void> => {
    try {
      await storeApi.clearCart();
      setCart([]);
      setCombos([]);
      await storage.removeItem(STORAGE_KEYS.CART_DATA);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Refresh cart from server
  const refreshCart = async (): Promise<void> => {
    await fetchCart();
  };

  // Calculate totals
  const productTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const comboTotal = combos.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartTotal = productTotal + comboTotal;

  const productCount = cart.reduce((count, item) => count + item.quantity, 0);
  const comboCount = combos.reduce((count, item) => count + item.quantity, 0);
  const cartCount = productCount + comboCount;

  const hasItems = cart.length > 0 || combos.length > 0;

  return (
    <CartContext.Provider
      value={{
        // Products
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,

        // Combos
        combos,
        addComboToCart,
        removeComboFromCart,
        updateComboQuantity,

        // Totals
        cartCount,
        cartTotal,
        productTotal,
        comboTotal,
        hasItems,

        // Actions
        clearCart,
        refreshCart,

        // Loading state
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
