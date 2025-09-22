import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import FaqAccordion from './FaqAccordion';
import Spinner from './Spinner';
import Alert from './Alert';
import { ProductFaq } from '../../types';

/**
 * Fetches the FAQs for a given product ID from the API.
 */
const fetchFaqs = async (productId: string): Promise<ProductFaq[]> => {
  const { data } = await api.get(`/faqs/${productId}`);
  return data;
};

interface ProductFaqSectionProps {
  productId: string;
}

/**
 * A self-contained component to display a list of FAQs for a product.
 * It handles its own data fetching, loading, and error states.
 */
export default function ProductFaqSection({ productId }: ProductFaqSectionProps) {
  const { data: faqs, isLoading, isError } = useQuery({
    queryKey: ['productFaqs', productId],
    queryFn: () => fetchFaqs(productId),
    enabled: !!productId, // Only run the query if productId is available
  });

  // If there are no FAQs for this product, render nothing.
  if (!isLoading && (!faqs || faqs.length === 0)) {
    return null;
  }

  // Transform the fetched data into the format expected by the FaqAccordion component.
  // This now correctly includes the 'id' field and matches the 'FaqItem' type.
  const accordionItems = faqs?.map(faq => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
  })) || [];

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="font-sans text-2xl font-bold mb-6 text-text-main">Frequently Asked Questions</h2>
      {isLoading && <div className="flex justify-center py-4"><Spinner /></div>}
      {isError && <Alert type="error" message="Could not load FAQs at this time." />}
      {!isLoading && !isError && faqs && faqs.length > 0 && (
        // The prop is now correctly named 'faqs' to match the child component.
        <FaqAccordion faqs={accordionItems} />
      )}
    </div>
  );
}

