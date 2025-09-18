import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../lib/utils';
import Button from './Button';
import { CartItem } from '../../types';
import { useEffect } from 'react';
import { useLenis } from 'lenis/react';

// Quantity Selector
function QuantitySelector({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCart();
  return (
    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
      <button
        onClick={() => removeFromCart(item.id)}
        className="p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        aria-label="Remove item"
      >
        <Trash2 size={16} />
      </button>
      <div className="flex items-center border-l border-r">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="px-2 py-1 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          disabled={item.quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span className="px-3 text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="px-2 py-1 text-gray-700 hover:bg-gray-100"
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, cartCount, subtotal } = useCart();
  const lenis = useLenis();

  // Stop Lenis + lock body scroll
  useEffect(() => {
    if (isOpen) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start();
      document.body.style.overflow = '';
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = '';
    };
  }, [isOpen, lenis]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* --- HEADER (Fixed) --- */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Shopping Cart ({cartCount})</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>

            {/* --- MAIN CONTENT (Scrollable, with Lenis ignore) --- */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto min-h-0 overscroll-contain"
            >
              {cartCount > 0 ? (
                <div className="p-4 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-24 h-24 flex-shrink-0 border rounded-md overflow-hidden">
                        <img
                          src={JSON.parse(item.images || '[]')[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between flex-grow">
                        <div>
                          <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-base font-semibold">
                              {formatCurrency(item.salePrice ?? item.price)}
                            </p>
                            {item.salePrice && (
                              <p className="text-sm text-gray-400 line-through">
                                {formatCurrency(item.price)}
                              </p>
                            )}
                          </div>
                        </div>
                        <QuantitySelector item={item} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <ShoppingCart size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">Your cart is empty</h3>
                  <p className="text-sm text-gray-500 mt-1">Add items to see them here.</p>
                </div>
              )}
            </div>

            {/* --- FOOTER (Fixed) --- */}
            {cartCount > 0 && (
              <div className="flex-shrink-0 border-t p-4 space-y-4 bg-gray-50">
                <div className="flex justify-between text-base font-medium">
                  <p>Subtotal</p>
                  <p>{formatCurrency(subtotal)}</p>
                </div>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link to="/checkout" onClick={onClose}>
                      Proceed to Checkout
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/cart" onClick={onClose}>
                      View Cart
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
