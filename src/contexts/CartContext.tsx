import { CartItem, ContentItem } from '@/types';
import { createContext, ReactNode, useState, useEffect, useMemo } from 'react';

// Define the structure of a single variant, consistent with the Product Detail Page
interface ProductVariant {
  id: string;
  origin: string;
  price: number;
  salePrice?: number | null;
  stock: number;
}

// The signature for `addToCart` is updated to accept the `isEnergized` flag
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

  const addToCart = (item: ContentItem, variant: ProductVariant | null, quantity: number, isEnergized: boolean) => {
    const ENERGIZING_COST = 101;

    // Create a unique ID for the cart item based on all its options.
    const cartItemId = `${item.id}${variant ? `-${variant.id}` : ''}${isEnergized ? '-energized' : ''}`;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.id === cartItemId);

      if (existingItem) {
        // If this exact item exists, just increase its quantity.
        return prevItems.map((cartItem) =>
          cartItem.id === cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // If it's a new item, construct it with all the correct details.
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
          salePrice: null, // Nullify original salePrice as it's now part of the final price
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
    const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    
    // This calculation includes a fallback of 0 to prevent TypeScript errors.
    const total = cartItems.reduce((acc, item) => {
        return acc + ((item.price ?? 0) * item.quantity);
    }, 0);

    return { cartCount: count, subtotal: total };
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

