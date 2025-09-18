import { Link } from 'react-router-dom';
import { useCart } from "@/hooks/useCart";
import SEO from "@/components/shared/SEO";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/shared/Button";
import { CartItem } from '@/types';
import { Minus, Plus } from 'lucide-react';

function CartPageItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-6 border-t py-6">
      <div className="w-36 h-36 flex-shrink-0">
        <img src={JSON.parse(item.images || '[]')[0]} alt={item.name} className="w-full h-full object-contain" />
      </div>
      <div className="flex-grow">
        <h2 className="text-lg font-medium">{item.name}</h2>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center border rounded">
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-2 py-1 disabled:opacity-50 hover:bg-gray-50" aria-label="Decrease quantity">
              <Minus size={14} />
            </button>
            <span className="px-3 text-sm font-medium">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-50" aria-label="Increase quantity">
              <Plus size={14} />
            </button>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <button onClick={() => removeFromCart(item.id)} className="text-sm text-blue-600 hover:underline">Delete</button>
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        {/* **UPGRADE**: Logic to display sale price */}
        <p className="text-lg font-bold">{formatCurrency(item.salePrice ?? item.price)}</p>
        {item.salePrice && <p className="text-sm text-gray-400 line-through">{formatCurrency(item.price)}</p>}
      </div>
    </div>
  );
}

export default function CartPage() {
  // **THE FIX**: Using the new 'subtotal' from our upgraded context
  const { cartItems, subtotal, cartCount } = useCart();

  return (
    <>
      <SEO title="Shopping Cart" description="Review items in your shopping cart." />
      <div className="bg-gray-100 min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Shopping Cart' }]} />
          </div>

          {cartCount === 0 ? (
            <div className="text-center bg-white p-16 rounded-lg shadow">
              <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
              <p className="text-gray-600 mt-2">Check out our bestsellers to find something you'll love!</p>
              <Button asChild className="mt-6">
                <Link to="/">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 items-start">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
                <div className="mt-4">
                  {cartItems.map(item => <CartPageItem key={item.id} item={item} />)}
                </div>
                <div className="text-right border-t pt-4 mt-4">
                  <p className="text-lg">Subtotal ({cartCount} {cartCount > 1 ? 'items' : 'item'}): <span className="font-bold">{formatCurrency(subtotal)}</span></p>
                </div>
              </div>

              <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow sticky top-24 mt-8 lg:mt-0">
                <div className="mt-4">
                  <p className="text-lg">Subtotal ({cartCount} {cartCount > 1 ? 'items' : 'item'}): <span className="font-bold">{formatCurrency(subtotal)}</span></p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link to="/checkout">Proceed to Buy</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
