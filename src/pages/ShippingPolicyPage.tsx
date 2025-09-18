import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SEO from '@/components/shared/SEO';

export default function ShippingPolicyPage() {
  return (
    <>
      <SEO 
        title="Shipping Policy"
        description="Find information about our shipping process, rates, delivery times, and international shipping options for Siddhi Divine products."
      />
      <div className="bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' }, 
              { label: 'Shipping Policy' }
            ]} 
          />
          <div className="mt-4 text-center border-b pb-4">
              <h1 className="font-sans text-4xl font-bold text-text-main">Shipping Policy</h1>
              <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
                We are committed to delivering your spiritual items to you in a timely and secure manner.
              </p>
          </div>

          <div className="mt-8 max-w-3xl mx-auto prose prose-lg prose-h2:font-sans prose-h2:font-bold">
            <h2>Order Processing Time</h2>
            <p>
              All orders are processed within 1-3 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
            </p>
            
            <h2>Shipping Rates & Delivery Estimates</h2>
            <p>
              Shipping charges for your order will be calculated and displayed at checkout.
            </p>
            <ul>
              <li><strong>Standard Shipping (India):</strong> 5-7 business days.</li>
              <li><strong>Express Shipping (India):</strong> 2-4 business days.</li>
              <li><strong>International Shipping:</strong> 7-21 business days.</li>
            </ul>
            <p>Delivery delays can occasionally occur.</p>

            <h2>Shipment Confirmation & Order Tracking</h2>
            <p>
              You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
            </p>
            
            <h2>Customs, Duties, and Taxes</h2>
            <p>
              Siddhi Divine is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
            </p>

            <h2>Damages</h2>
            <p>
             Siddhi Divine is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
