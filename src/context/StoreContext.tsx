import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as storeApi from '../services/storeApi';
import type { Store, Catalog, Category, Product, Combo } from '../types';

interface StoreContextType {
  store: Store | null;
  catalog: Catalog | null;
  categories: Category[];
  products: Product[];
  combos: Combo[];
  featuredProducts: Product[];
  productsByCategory: Record<string, Product[]>;
  isLoading: boolean;
  error: string | null;
  refreshCatalog: () => Promise<void>;
  getProductsByCategory: (categoryId: string) => Product[];
  searchProducts: (query: string) => Product[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [store, setStore] = useState<Store | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch catalog from API
  const fetchCatalog = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await storeApi.getCatalog();
      setCatalog(data);
      setStore(data.store);
    } catch (err: any) {
      console.error('Error fetching catalog:', err);
      setError(err.message || 'Erro ao carregar catálogo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load catalog on mount
  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Get products by category ID
  const getProductsByCategory = useCallback(
    (categoryId: string): Product[] => {
      if (!catalog) return [];
      return catalog.products_by_category[categoryId] || [];
    },
    [catalog]
  );

  // Search products by name or description
  const searchProducts = useCallback(
    (query: string): Product[] => {
      if (!catalog || !query.trim()) return [];

      const lowerQuery = query.toLowerCase().trim();
      return catalog.products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerQuery) ||
          product.description?.toLowerCase().includes(lowerQuery) ||
          product.short_description?.toLowerCase().includes(lowerQuery)
      );
    },
    [catalog]
  );

  // Refresh catalog from server
  const refreshCatalog = async (): Promise<void> => {
    await fetchCatalog();
  };

  // Derived values
  const categories = catalog?.categories || [];
  const products = catalog?.products || [];
  const combos = catalog?.combos || [];
  const featuredProducts = catalog?.featured_products || [];
  const productsByCategory = catalog?.products_by_category || {};

  return (
    <StoreContext.Provider
      value={{
        store,
        catalog,
        categories,
        products,
        combos,
        featuredProducts,
        productsByCategory,
        isLoading,
        error,
        refreshCatalog,
        getProductsByCategory,
        searchProducts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export default StoreContext;
