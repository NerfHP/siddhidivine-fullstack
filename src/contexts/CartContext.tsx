import { CartItem, ContentItem } from '@/types';
import { createContext, ReactNode, useState, useEffect, useMemo } from 'react';

// --- CHANGE: The signature for `addToCart` is updated to accept quantity and the `isEnergized` flag ---
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: ContentItem, quantity: number, isEnergized: boolean) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number; 
}

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const localData = localStorage.getItem('cart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- CHANGE: The core logic of `addToCart` is updated for the energized option ---
  const addToCart = (item: ContentItem, quantity: number, isEnergized: boolean) => {
    const ENERGIZING_COST = 151;

    // Create a unique ID for the cart item. 
    // e.g., "product_abc-energized" is different from "product_abc"
    const cartItemId = isEnergized ? `${item.id}-energized` : item.id;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.id === cartItemId);
      
      if (existingItem) {
        // If this exact item (including its energized state) is already in the cart, just increase its quantity.
        return prevItems.map((cartItem) =>
          cartItem.id === cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // If it's a new item, construct it with all the correct details.
        const basePrice = item.salePrice ?? item.price ?? 0;
        const finalPrice = basePrice + (isEnergized ? ENERGIZING_COST : 0);
        const finalName = isEnergized ? `${item.name} (Energized)` : item.name;

        const newItemToAdd: CartItem = {
          ...item,
          id: cartItemId,
          name: finalName,
          price: finalPrice,
          salePrice: item.salePrice ? finalPrice : null, // Reflect sale status if applicable
          quantity: quantity,
        };
        return [...prevItems, newItemToAdd];
      }
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => (item.id === cartItemId ? { ...item, quantity: Math.max(0, quantity) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };
  
  const { cartCount, subtotal } = useMemo(() => {
    const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
    const count = safeCartItems.reduce((acc, item) => acc + item.quantity, 0);
    
    // The total calculation now works correctly because each item's price is pre-calculated
    // when it's added to the cart.
    const total = safeCartItems.reduce((acc, item) => {
        return acc + ((item.price ?? 0) * item.quantity);
    }, 0);

    return { cartCount: count, subtotal: total };
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{ cartItems: Array.isArray(cartItems) ? cartItems : [], addToCart, removeFromCart, updateQuantity, clearCart, cartCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

