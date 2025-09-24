import { CartItem, ContentItem } from '@/types';
import { createContext, ReactNode, useState, useEffect, useMemo } from 'react';

// --- NEW: Define the structure of a variant here or in your types file ---
interface ProductVariant {
  id: string;
  origin: string;
  price: number;
  salePrice?: number | null;
  stock: number;
}

// --- CHANGE: The signature for `addToCart` is updated to accept all new options ---
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: ContentItem, variant: ProductVariant | null, quantity: number, isEnergized: boolean) => void;
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

  // --- CHANGE: The core logic of `addToCart` now handles all combinations ---
  const addToCart = (item: ContentItem, variant: ProductVariant | null, quantity: number, isEnergized: boolean) => {
    const ENERGIZING_COST = 151;

    // Create a unique ID for the cart item based on all its options.
    // e.g., "product_abc-nepali-energized" is treated as a completely unique item.
    const cartItemId = `${item.id}${variant ? `-${variant.id}` : ''}${isEnergized ? '-energized' : ''}`;

    setCartItems((prevItems) => {
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      const existingItem = currentItems.find((cartItem) => cartItem.id === cartItemId);
      
      if (existingItem) {
        // If this exact item exists, just increase its quantity.
        return currentItems.map((cartItem) =>
          cartItem.id === cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // If it's a new item, construct it with all the correct details.
        let basePrice = variant ? (variant.salePrice ?? variant.price) : (item.salePrice ?? item.price ?? 0);
        let finalName = item.name;

        if (variant) {
          finalName += ` (${variant.origin})`;
        }

        if (isEnergized) {
          finalName += ' (Energized)';
          basePrice += ENERGIZING_COST;
        }

        const newItemToAdd: CartItem = {
          ...item,
          id: cartItemId,
          name: finalName,
          price: basePrice,
          salePrice: null, // The final price is now calculated, so we nullify the original salePrice.
          quantity: quantity,
        };
        return [...currentItems, newItemToAdd];
      }
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prevItems) => 
        (Array.isArray(prevItems) ? prevItems : []).filter((item) => item.id !== cartItemId)
    );
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    setCartItems((prevItems) =>
      (Array.isArray(prevItems) ? prevItems : [])
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

