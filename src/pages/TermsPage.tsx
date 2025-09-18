import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SEO from '@/components/shared/SEO';

export default function TermsPage() {
  return (
    <>
      <SEO 
        title="Terms and Conditions"
        description="Read the terms and conditions for using the Siddhi Divine website and purchasing our products and services."
      />
      <div className="bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' }, 
              { label: 'Terms and Conditions' }
            ]} 
          />
          <div className="mt-4 text-center border-b pb-4">
              <h1 className="font-sans text-4xl font-bold text-text-main">Terms and Conditions</h1>
              <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
                Last updated: September 11, 2025
              </p>
          </div>

          <div className="mt-8 max-w-3xl mx-auto prose prose-lg prose-h2:font-sans prose-h2:font-bold prose-a:text-primary hover:prose-a:underline">
            <p>
              Welcome to Siddhi Divine. These terms and conditions outline the rules and regulations for the use of our website and the purchase of our products and services. By accessing this website, we assume you accept these terms and conditions.
            </p>
            
            <h2>1. Intellectual Property</h2>
            <p>
              The content, layout, design, data, databases and graphics on this website are protected by Indian and international intellectual property laws. Unless otherwise stated, Siddhi Divine and/or its licensors own the intellectual property rights for all material on this website.
            </p>

            <h2>2. Use of the Website</h2>
            <p>
              You are permitted to use our website for your own personal and non-commercial use only. You must not use this website for any of the following:
            </p>
            <ul>
              <li>For any fraudulent purposes.</li>
              <li>To send, use or reuse any material that is illegal, offensive, abusive, indecent, defamatory, obscene or menacing.</li>
              <li>To cause annoyance, inconvenience or needless anxiety.</li>
            </ul>

            <h2>3. Products and Services</h2>
            <p>
              We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors. All products are subject to availability, and we cannot guarantee that items will be in stock.
            </p>

            <h2>4. Limitation of Liability</h2>
            <p>
              In no event will Siddhi Divine, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this website. The spiritual and healing properties of our products are based on traditional beliefs and are not a substitute for professional medical or financial advice.
            </p>

            <h2>5. Governing Law</h2>
            <p>
              These terms will be governed by and interpreted in accordance with the laws of the State of Uttar Pradesh, India, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Meerut for the resolution of any disputes.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
