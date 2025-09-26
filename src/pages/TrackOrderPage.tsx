import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import SEO from '@/components/shared/SEO';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import Button from '@/components/shared/Button';
import { Mail, Hash, Search, LoaderCircle, ServerCrash, Package, CheckCircle, Truck, ShoppingBag } from 'lucide-react';

// --- ADDED: Defining the shape of our data to fix TypeScript errors ---
// This tells TypeScript what an 'Order' and its 'items' look like.
type Product = {
  id: string;
  name: string;
};

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: Product;
};

type Order = {
  id: string;
  createdAt: string;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  items: OrderItem[];
};

const trackingSchema = z.object({
  orderId: z.string().min(5, 'A valid Order ID is required.'),
  email: z.string().email('Please enter the email you used for the order.'),
});
type TrackingFormData = z.infer<typeof trackingSchema>;

const trackOrderRequest = async (formData: TrackingFormData): Promise<Order> => {
    const { data } = await api.post('/api/orders/track', formData);
    return data;
};

// --- Sub-Component for displaying the order status timeline ---
const OrderStatusTimeline = ({ status }: { status: Order['status'] }) => {
    const statuses = ['PENDING', 'SHIPPED', 'DELIVERED'];
    const currentStatusIndex = statuses.indexOf(status);

    const getStatusInfo = (s: string) => {
        switch(s) {
            case 'PENDING': return { icon: <Package />, label: 'Order Placed' };
            case 'SHIPPED': return { icon: <Truck />, label: 'Shipped' };
            case 'DELIVERED': return { icon: <CheckCircle />, label: 'Delivered' };
            default: return { icon: <Package />, label: 'Pending' };
        }
    }

    return (
        <div className="flex justify-between items-center my-8">
            {statuses.map((s, index) => (
                <div key={s} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentStatusIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {getStatusInfo(s).icon}
                    </div>
                    <p className={`mt-2 text-xs font-semibold ${index <= currentStatusIndex ? 'text-gray-800' : 'text-gray-400'}`}>{getStatusInfo(s).label}</p>
                    {index < statuses.length - 1 && <div className={`absolute top-5 left-1/2 w-full h-1 -z-10 ${index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </div>
            ))}
        </div>
    );
};


// --- Sub-Component to display order details once found ---
const OrderDetails = ({ order }: { order: Order }) => (
    <div className="mt-12 text-left border rounded-lg p-6 sm:p-8 bg-white animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-center">Order Details</h2>
        <OrderStatusTimeline status={order.status} />
        <div className="grid grid-cols-2 gap-4 mt-8 text-sm">
            <div><p className="text-gray-500">Order ID</p><p className="font-medium truncate">{order.id}</p></div>
            <div><p className="text-gray-500">Order Date</p><p className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p></div>
            <div><p className="text-gray-500">Status</p><p className="font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full inline-block">{order.status}</p></div>
            <div><p className="text-gray-500">Total</p><p className="font-medium">₹{order.total.toFixed(2)}</p></div>
        </div>
        <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold flex items-center gap-2"><ShoppingBag size={18} /> Items</h3>
            <ul className="mt-4 space-y-3">
                {order.items?.map((item: OrderItem) => ( // Explicitly typed 'item' here
                    <li key={item.id} className="flex justify-between text-sm items-center bg-gray-50 p-3 rounded-md">
                        <span>{item.product.name} (x{item.quantity})</span>
                        <span className="font-medium">₹{item.price.toFixed(2)}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);


export default function TrackOrderPage() {
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<TrackingFormData>({
    resolver: zodResolver(trackingSchema),
  });
  
  const mutation = useMutation({
    mutationFn: trackOrderRequest,
    onSuccess: (data) => {
        setFoundOrder(data);
    },
    onError: () => {
        setFoundOrder(null);
    }
  });

  const onSubmit = (data: TrackingFormData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <SEO 
        title="Track Your Order"
        description="Check the status of your Siddhi Divine order by entering your order ID and email address."
      />
      <div className="bg-transparent">
        <div className="container mx-auto px-4 py-16">
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' }, 
              { label: 'Track Your Order' }
            ]} 
          />
          <div className="mt-4 text-center">
              <h1 className="font-sans text-4xl font-bold text-text-main">Track Your Order</h1>
              <p className="mt-2 text-gray-600 max-w-xl mx-auto">
                Enter your order details below to see the latest shipping updates.
              </p>
          </div>

          <div className="mt-12 max-w-md mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg border">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="order-id" className="block text-sm font-medium text-gray-700">Order ID</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <input {...register('orderId')} type="text" id="order-id" className="block w-full rounded-md border-gray-300 pl-10 p-2.5 focus:border-primary focus:ring-primary" placeholder="e.g., cl..." />
                    {errors.orderId && <p className="text-red-500 text-xs mt-1">{errors.orderId.message}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Billing Email</label>
                   <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input {...register('email')} type="email" id="email" className="block w-full rounded-md border-gray-300 pl-10 p-2.5 focus:border-primary focus:ring-primary" placeholder="you@example.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
                  {mutation.isPending ? <LoaderCircle className="animate-spin" /> : 'Track Order'}
                </Button>
              </form>
            </div>

            {mutation.isError && (
                 <div className="mt-8 text-red-600 bg-red-50 p-4 rounded-lg animate-fade-in text-center shadow-md border border-red-100">
                    <ServerCrash className="mx-auto mb-2" />
                    <p className="font-semibold">Order Not Found</p>
                    <p className="text-sm">Please check your Order ID and email and try again.</p>
                </div>
            )}

            {foundOrder && <OrderDetails order={foundOrder} />}
          </div>
        </div>
      </div>
    </>
  );
}

