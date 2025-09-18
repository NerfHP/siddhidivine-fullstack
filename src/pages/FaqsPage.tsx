import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SEO from '@/components/shared/SEO';
import Spinner from '@/components/shared/Spinner';
import Alert from '@/components/shared/Alert';
import FaqAccordion from '@/components/shared/FaqAccordion';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const fetchFaqs = async () => {
  // THE FIX: This now uses the correct API path with the /api prefix.
  const { data } = await api.get('/content/faqs');
  return data as FaqItem[];
};

export default function FaqsPage() {
    const { data: faqs, isLoading, error } = useQuery({
    queryKey: ['faqsPage'],
    queryFn: fetchFaqs,
  });

  return (
    <>
      <SEO 
        title="Frequently Asked Questions (FAQs)"
        description="Find answers to common questions about Siddhi Divine products, shipping, authenticity, and more."
      />
      <div className="bg-transparent">
        <div className="container mx-auto px-4 py-16">
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' }, 
              { label: 'FAQs' }
            ]} 
          />
          <div className="mt-4 text-center">
              <h1 className="font-sans text-4xl font-bold text-text-main">Frequently Asked Questions</h1>
              <p className="mt-2 text-gray-600 max-w-xl mx-auto">
                Have questions? We're here to help. Find answers to the most common queries below.
              </p>
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
             {isLoading ? <div className="flex justify-center py-16"><Spinner /></div>
             : error ? <Alert type="error" message="Could not load FAQs." />
             : faqs && <FaqAccordion faqs={faqs} />}
          </div>
        </div>
      </div>
    </>
  );
}