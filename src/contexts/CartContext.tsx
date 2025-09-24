import { CartItem, ContentItem } from '@/types';
import { createContext, ReactNode, useState, useEffect, useMemo } from 'react';

// --- NEW: Define the structure of a variant, consistent with the product page ---
interface ProductVariant {
  id: string;
  origin: string;
  price: number;
  salePrice?: number | null;
  stock: number;
}

// --- UPDATED: The signature for `addToCart` now accepts all possible options ---
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

  // --- UPDATED: The core logic of `addToCart` handles all combinations ---
  const addToCart = (item: ContentItem, variant: ProductVariant | null, quantity: number, isEnergized: boolean) => {
    const ENERGIZING_COST = 151;

    // Create a unique ID for the cart item based on all its options.
    // This ensures every unique combination is treated as a separate item.
    // e.g., "product_abc-nepali-energized"
    const cartItemId = `${item.id}${variant ? `-${variant.id}` : ''}${isEnergized ? '-energized' : ''}`;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.id === cartItemId);

      if (existingItem) {
        // If this exact item already exists, just increase its quantity.
        return prevItems.map((cartItem) =>
          cartItem.id === cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // If it's a new item, construct it with the correct name and price.
        let finalPrice = variant?.salePrice ?? variant?.price ?? item.salePrice ?? item.price ?? 0;
        let finalName = item.name;

        if (variant) {
          finalName += ` (${variant.origin})`;
        }

        if (isEnergized) {
          finalName += ' (Energized)';
          finalPrice += ENERGIZING_COST;
        }

        const newItemToAdd: CartItem = {
          ...item,
          id: cartItemId,
          name: finalName,
          price: finalPrice,
          salePrice: null, // The final price is already calculated, so we nullify the original salePrice.
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
    
    // This calculation is now robust because each item's price is pre-calculated
    // when it was added to the cart.
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

