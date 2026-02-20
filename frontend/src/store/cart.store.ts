import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface CartProduct {
  id: string;
  name: string;
  nameEs: string;
  price: number;
  imageUrls: string[];
  stock: number;
  slug: string;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchCart: async () => {
        try {
          const { data } = await api.get('/cart');
          set({ items: data.items || [] });
        } catch {
          set({ items: [] });
        }
      },

      addItem: async (productId, quantity = 1) => {
        set({ isLoading: true });
        await api.post('/cart/items', { productId, quantity });
        await get().fetchCart();
        set({ isLoading: false });
      },

      updateItem: async (productId, quantity) => {
        await api.patch(`/cart/items/${productId}`, { quantity });
        await get().fetchCart();
      },

      removeItem: async (productId) => {
        await api.delete(`/cart/items/${productId}`);
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
      },

      clearCart: async () => {
        await api.delete('/cart');
        set({ items: [] });
      },

      total: () => get().items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'cart-store', partialize: (state) => ({ items: state.items }) }
  )
);
