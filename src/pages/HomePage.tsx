import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ContentItem } from '@/types';
import Card from '@/components/shared/Card';
import Spinner from '@/components/shared/Spinner';
import Alert from '@/components/shared/Alert';
import Button from '@/components/shared/Button';
import { Link } from 'react-router-dom';
import SEO from '@/components/shared/SEO';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks/useCart';
import ShuffleHero from '@/components/ShuffleHero';
import FaqAccordion from '@/components/shared/FaqAccordion';
import TestimonialCarousel from '@/components/shared/TestimonialCarousel';
import TrustBadgeScroller from '@/components/shared/TrustBadgeScroller';

// --- TYPE DEFINITIONS FOR OUR DATA ---
interface FeaturedData {
  products: ContentItem[];
  services: ContentItem[];
}
interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// --- API CALLS (NOW CORRECTED FOR UNIFIED VERCEL SETUP) ---
// In the new full-stack setup, all API calls must go to the /api path.
const fetchFeaturedItems = async () => {
  const { data } = await api.get('/content/featured');
  return data as FeaturedData;
};

const fetchBestsellers = async () => {
  const { data } = await api.get('/content/bestsellers');
  return data as ContentItem[];
};

const fetchFaqs = async () => {
  const { data } = await api.get('/content/faqs');
  return data as FaqItem[];
};


export default function HomePage() {
  const { addToCart } = useCart();
  
  // Your existing queries, now with error states for all.
  const { data: featuredData, isLoading: isFeaturedLoading, isError: featuredError } = useQuery({
    queryKey: ['featuredItems'],
    queryFn: fetchFeaturedItems,
  });

  const { data: bestsellers, isLoading: isBestsellersLoading, isError: bestsellersError } = useQuery({
    queryKey: ['bestsellersHome'],
    queryFn: fetchBestsellers,
  });

  const { data: faqs, isLoading: isFaqsLoading, isError: faqsError } = useQuery({
    queryKey: ['faqsHome'],
    queryFn: fetchFaqs,
  });

  const handleAddToCart = (item: ContentItem) => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

  // --- THE MAIN FIX ---
  // If ANY of the essential page data is still loading, we show a single, page-level spinner.
  // This is the cleanest way to prevent the component from trying to render with undefined data.
  if (isFeaturedLoading || isBestsellersLoading || isFaqsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Your Guide to Spiritual Wellness"
        description="Discover authentic spiritual products, book puja services, and find guidance with our expert astrology consultations. Your path to peace and well-being starts here."
      />
      
      <ShuffleHero/>

      <div className="relative z-10 bg-transparent">
        <div className="py-16 space-y-20">
          
          {/* Featured Products Section (Now with robust error handling) */}
          <section className="container mx-auto px-4">
            <h2 className="text-center font-sans text-3xl font-bold text-text-main">
              Featured Products
            </h2>
            <p className="mt-2 text-center text-gray-600">
              Handpicked items for your spiritual practices.
            </p>
            {featuredError ? (
              <Alert type="error" message="Could not load featured products. Please try again later."/>
            ) : (
              featuredData?.products && featuredData.products.length > 0 && (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {featuredData.products.map((item: ContentItem) => (
                    <Card key={item.id} item={item} />
                  ))}
                </div>
              )
            )}
          </section>

          {/* --- BEST SELLERS SECTION (CRASH FIXED) --- */}
          <section className="container mx-auto px-4">
            <div className="relative text-center">
              <h2 className="font-sans text-3xl font-bold text-text-main">Our Best Sellers</h2>
              <p className="mt-2 text-gray-600">Discover what our community loves the most.</p>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 hidden sm:block">
                  <Button asChild variant="outline"><Link to="/products">View All Products</Link></Button>
              </div>
              <div className="mt-4 sm:hidden">
                  <Button asChild variant="outline"><Link to="/products">View All Products</Link></Button>
              </div>
            </div>
            {bestsellersError ? <Alert type="error" message="Could not load best sellers." /> 
             : (
              // This is the key fix. We now safely check if `bestsellers` is a valid array.
              Array.isArray(bestsellers) && bestsellers.length > 0 ? (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {bestsellers.slice(0, 4).map((item) => <Card key={item.id} item={item} />)}
                </div>
              ) : (
                // If the array is empty or invalid, we show this friendly message.
                <p className="text-center text-gray-500 mt-8">Our best sellers will be featured here soon!</p>
              )
            )}
          </section>
          
          {/* Our Services Section (Now with robust error handling) */}
          <section className="container mx-auto px-4">
            <h2 className="text-center font-sans text-3xl font-bold text-text-main">
              Our Services
            </h2>
            <p className="mt-2 text-center text-gray-600">
              Connect with ancient traditions through our expert services.
            </p>
            {featuredError ? (
               <Alert type="error" message="Could not load our services." />
            ) : (
              featuredData?.services && featuredData.services.length > 0 && (
                <div className="mt-8">
                  {featuredData.services.length === 1 ? (
                    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg border">
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                          <img 
                            src={JSON.parse(featuredData.services[0].images || '[]')[0]} 
                            alt={featuredData.services[0].name}
                            className="w-full rounded-lg object-cover aspect-square"
                          />
                        </div>
                        <div className="text-center md:text-left">
                          <h3 className="font-sans text-2xl font-bold text-text-main">{featuredData.services[0].name}</h3>
                          <p className="text-gray-600 text-sm mt-2">{featuredData.services[0].description}</p>
                          <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                            {featuredData.services[0].salePrice && (
                              <p className="text-2xl font-bold text-primary-dark">{formatCurrency(featuredData.services[0].salePrice)}</p>
                            )}
                            <p className={`text-lg ${featuredData.services[0].salePrice ? 'text-gray-500 line-through' : 'font-bold text-primary-dark'}`}>
                              {formatCurrency(featuredData.services[0].price || 0)}
                            </p>
                          </div>
                          <div className="mt-4 flex flex-col gap-2">
                            <Button size="md" onClick={() => handleAddToCart(featuredData.services[0])}>Add to Cart</Button>
                            <Button asChild size="md" variant="outline">
                              <Link to={`/services/${featuredData.services[0].slug}`}>View Details</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
                      {featuredData.services.map((item: ContentItem) => (
                        <Card key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </section>

          <TestimonialCarousel />

          {/* --- FAQS SECTION (Now with robust error handling) --- */}
          <section className="container mx-auto px-4">
             <div className="text-center">
                <h2 className="font-sans text-3xl font-bold text-text-main">FAQs</h2>
                <p className="mt-2 text-gray-600">Here to help you on your spiritual journey.</p>
             </div>
             <div className="mt-8 max-w-3xl mx-auto">
                {faqsError ? <Alert type="error" message="Could not load FAQs." />
                 : (
                    Array.isArray(faqs) && faqs.length > 0 ? <FaqAccordion faqs={faqs} /> : <p className="text-center text-gray-500">Frequently asked questions will be shown here soon.</p>
                 )}
             </div>
          </section>
        </div>
      </div>
      <TrustBadgeScroller />
    </>
  );
}

