import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SEO from '@/components/shared/SEO';
import Button from '@/components/shared/Button';
import { Mail, Hash } from 'lucide-react';

export default function TrackOrderPage() {
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

          <div className="mt-12 max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border">
            <form className="space-y-6">
              <div>
                <label htmlFor="order-id" className="block text-sm font-medium text-gray-700">Order ID</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" id="order-id" className="block w-full rounded-md border-gray-300 pl-10 p-2.5 focus:border-primary focus:ring-primary" placeholder="e.g., SD12345" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Billing Email</label>
                 <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="email" id="email" className="block w-full rounded-md border-gray-300 pl-10 p-2.5 focus:border-primary focus:ring-primary" placeholder="you@example.com" />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">Track Order</Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
