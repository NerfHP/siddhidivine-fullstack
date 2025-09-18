import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SEO from '@/components/shared/SEO';
import { Mail, Phone } from 'lucide-react';

export default function ReturnsPolicyPage() {
  return (
    <>
      <SEO 
        title="Returns & Exchanges Policy"
        description="Understand the returns and exchanges policy for Siddhi Divine. Our priority is your satisfaction with our spiritual products."
      />
      <div className="bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' }, 
              { label: 'Returns & Exchanges Policy' }
            ]} 
          />
          <div className="mt-4 text-center border-b pb-4">
              <h1 className="font-sans text-4xl font-bold text-text-main">Returns & Exchanges Policy</h1>
              <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
                At Siddhi Divine, your satisfaction is our highest priority. We stand behind the quality and spiritual integrity of our products.
              </p>
          </div>

          <div className="mt-8 max-w-3xl mx-auto prose prose-lg prose-h2:font-sans prose-h2:font-bold prose-a:text-primary hover:prose-a:underline">
            <h2>Our Promise</h2>
            <p>
              We're not relaxed until you are. If your divine positive energy is not right for you, we are here to help. This policy outlines the conditions under which you can return or exchange an item purchased from Siddhi Divine.
            </p>
            
            <h2>Eligibility for Returns</h2>
            <ul>
              <li>Returns must be initiated within <strong>7 days</strong> of the delivery date.</li>
              <li>The item must be in its original, unused condition, with all original packaging and certificates intact.</li>
              <li>Customized or energized products (pujas performed on your behalf) are not eligible for return unless a defect is found.</li>
              <li>Items damaged due to misuse or neglect are not eligible for return.</li>
            </ul>

            <h2>How to Initiate a Return</h2>
            <ol>
              <li>
                <strong>Contact Us:</strong> Please email our support team at <a href="mailto:support@siddhidivine.com">support@siddhidivine.com</a> with your order number and a brief description of the issue. Including a photo is helpful for damaged items.
              </li>
              <li>
                <strong>Receive Approval:</strong> Our team will review your request and, upon approval, will provide you with a Return Authorization (RA) number and shipping instructions.
              </li>
              <li>
                <strong>Ship the Item:</strong> Securely package the item and ship it to the address provided. You are responsible for the return shipping costs.
              </li>
            </ol>
            
            <h2>Refunds & Exchanges</h2>
            <p>
              Once we receive and inspect your returned item, we will notify you via email. If your return is approved, a refund will be processed to your original method of payment within 5-7 business days. For exchanges, the new item will be shipped out after the original item has been received and inspected.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about our returns policy, please don't hesitate to reach out. We are here to ensure your journey with Siddhi Divine is a positive one.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 mt-4 not-prose">
                <div className="flex items-center gap-3">
                    <Mail className="text-primary"/>
                    <a href="mailto:support@siddhidivine.com" className="font-medium">support@siddhidivine.com</a>
                </div>
                 <div className="flex items-center gap-3">
                    <Phone className="text-primary"/>
                    <a href="tel:+911234567890" className="font-medium">+91 123 456 7890</a>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
