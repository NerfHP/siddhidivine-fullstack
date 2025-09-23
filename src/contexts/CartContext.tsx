import { CartItem, ContentItem } from '@/types';
import { createContext, ReactNode, useState, useEffect, useMemo } from 'react';

// This interface should ideally be moved to your `src/types/index.ts` file
// It's defined here for clarity based on the changes in ProductDetailPage.tsx
interface ProductVariant {
  id: string;
  origin: string;
  price: number;
  stock: number;
}

// --- CHANGE: The signature for `addToCart` is updated to accept variants and quantity ---
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: ContentItem, variant?: ProductVariant | null, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
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

  // --- CHANGE: The core logic of `addToCart` is updated for variants ---
  const addToCart = (item: ContentItem, variant: ProductVariant | null = null, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      
      // Create a unique ID for the cart item. 
      // If it has a variant, append the variant ID to make it unique.
      // e.g., "product_abc-nepali" vs "product_abc-indonesian"
      const cartItemId = variant ? `${item.id}-${variant.id}` : item.id;

      const existingItem = currentItems.find((cartItem) => cartItem.id === cartItemId);
      
      if (existingItem) {
        // If this exact item (including its variant) is already in the cart, just increase its quantity.
        return currentItems.map((cartItem) =>
          cartItem.id === cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem,
        );
      } else {
        // If it's a new item, create it with the correct details based on whether it has a variant.
        const newItem: CartItem = {
          ...item,
          id: cartItemId, // Use our unique composite ID
          // The price is the variant's price if it exists, otherwise it's the product's regular/sale price.
          price: variant ? variant.price : (item.salePrice ?? item.price ?? 0),
          // Add the variant origin to the name for better display in the cart.
          name: variant ? `${item.name} (${variant.origin})` : item.name,
          quantity: quantity,
        };
        // This is important: remove the salePrice from the new item because the definitive `price` is already set.
        // This prevents confusion in the cart's subtotal calculation.
        delete newItem.salePrice; 

        return [...currentItems, newItem];
      }
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
  
  const { cartCount, subtotal } = useMemo(() => {
    const count = safeCartItems.reduce((acc, item) => acc + item.quantity, 0);
    
    // The subtotal calculation is now simpler because we set the correct, definitive price
    // on the cart item itself when it was added.
    const total = safeCartItems.reduce((acc, item) => {
        const price = item.price ?? 0;
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

