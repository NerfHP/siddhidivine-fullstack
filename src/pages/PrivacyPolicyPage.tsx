import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SEO from '@/components/shared/SEO';

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEO 
        title="Privacy Policy"
        description="Learn how Siddhi Divine collects, uses, and protects your personal information when you use our website."
      />
      <div className="bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' }, 
              { label: 'Privacy Policy' }
            ]} 
          />
          <div className="mt-4 text-center border-b pb-4">
              <h1 className="font-sans text-4xl font-bold text-text-main">Privacy Policy</h1>
              <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
                Your privacy is important to us.
              </p>
          </div>

          <div className="mt-8 max-w-3xl mx-auto prose prose-lg prose-h2:font-sans prose-h2:font-bold prose-a:text-primary hover:prose-a:underline">
            <h2>Information We Collect</h2>
            <p>
              We collect information from you when you register on our site, place an order, or subscribe to our newsletter. This may include your name, e-mail address, mailing address, phone number, or credit card information.
            </p>
            
            <h2>How We Use Your Information</h2>
            <p>
              Any of the information we collect from you may be used in one of the following ways:
            </p>
            <ul>
              <li>To personalize your experience.</li>
              <li>To improve our website and customer service.</li>
              <li>To process transactions and deliver your purchased product or service.</li>
              <li>To send periodic emails regarding your order or other products and services.</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. We use a secure server and all supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology.
            </p>
            
            <h2>Cookies</h2>
            <p>
              Yes, we use cookies. Cookies are small files that a site or its service provider transfers to your computer's hard drive through your Web browser (if you allow) that enables the sites or service providers systems to recognize your browser and capture and remember certain information.
            </p>

            <h2>Third-Party Disclosure</h2>
            <p>
              We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
