import { CartItem, ContentItem } from '@/types';
import { createContext, ReactNode, useState, useEffect, useMemo } from 'react';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: ContentItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  // **UPGRADE**: Renamed cartTotal to subtotal for clarity
  subtotal: number; 
}

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const localData = localStorage.getItem('cart');
      if (localData) {
        const parsedData = JSON.parse(localData);
        if (Array.isArray(parsedData)) {
          return parsedData;
        }
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: ContentItem) => {
    setCartItems((prevItems) => {
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      const existingItem = currentItems.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [...currentItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) =>
      (Array.isArray(prevItems) ? prevItems : []).filter((item) => item.id !== itemId),
    );
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems((prevItems) =>
      (Array.isArray(prevItems) ? prevItems : []).map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item,
      ).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  
  // **UPGRADE**: useMemo efficiently recalculates values only when cartItems changes
  const { cartCount, subtotal } = useMemo(() => {
    const count = safeCartItems.reduce((acc, item) => acc + item.quantity, 0);
    
    // **THE FIX**: This now correctly uses salePrice if it exists, otherwise it uses the regular price.
    const total = safeCartItems.reduce((acc, item) => {
        const price = item.salePrice ?? item.price ?? 0;
        return acc + (price * item.quantity);
    }, 0);

    return { cartCount: count, subtotal: total };
  }, [safeCartItems]);


  return (
    <CartContext.Provider
      value={{ cartItems: safeCartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

