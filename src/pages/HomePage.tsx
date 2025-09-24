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
import { TestimonialCarousel } from '@/components/shared/TestimonialCarousel';
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

// --- API CALLS (NOW CORRECTED) ---

// This is your original, working function, now restored.
const fetchFeaturedItems = async () => {
  const { data } = await api.get('/content/featured');
  return data as FeaturedData;
};

// These new functions now follow your correct API path structure.
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
  
  // Your existing, working query for featured items.
  const { data: featuredData, isLoading: isFeaturedLoading, error: featuredError } = useQuery({
    queryKey: ['featuredItems'],
    queryFn: fetchFeaturedItems,
  });

  // New, separate queries for the new sections.
  const { data: bestsellers, isLoading: isBestsellersLoading } = useQuery({
    queryKey: ['bestsellersHome'],
    queryFn: fetchBestsellers,
  });

  const { data: faqs, isLoading: isFaqsLoading } = useQuery({
    queryKey: ['faqsHome'],
    queryFn: fetchFaqs,
  });

  const handleAddToCart = (item: ContentItem) => {
    addToCart(item, 1, false);
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <>
      <SEO 
        title="Your Guide to Spiritual Wellness"
        description="Discover authentic spiritual products, book puja services, and find guidance with our expert astrology consultations. Your path to peace and well-being starts here."
      />
      
      {/* --- Style for the animated button --- */}
      <style>
        {`
          @keyframes pulse-glow {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 0.75rem rgba(249, 115, 22, 0.4);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 1.5rem rgba(249, 115, 22, 0.7);
            }
          }

          .animate-pulse-glow {
            animation: pulse-glow 2.5s infinite ease-in-out;
          }
        `}
      </style>

      <ShuffleHero/>

      <div className="relative z-10 bg-transparent">
        <div className="py-16 space-y-20">
          
          {/* Featured Products Section (Your original, working code) */}
          <section className="container mx-auto px-4">
            <h2 className="text-center font-sans text-3xl font-bold text-text-main">
              Featured Products
            </h2>
            <p className="mt-2 text-center text-gray-600">
              Handpicked items for your spiritual practices.
            </p>
            {isFeaturedLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : featuredError ? (
              <Alert type="error" message="Could not load featured products. Please try again later."/>
            ) : (
              // This safe check prevents crashes while data is loading
              featuredData?.products && featuredData.products.length > 0 && (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {featuredData.products.map((item: ContentItem) => (
                    <Card key={item.id} item={item} />
                  ))}
                </div>
              )
            )}
          </section>

          {/* --- NEW BEST SELLERS SECTION --- */}
          <section className="container mx-auto px-4">
            <div className="relative text-center">
              {/* This container ensures the text is always centered */}
              <h2 className="font-sans text-3xl font-bold text-text-main">Our Best Sellers</h2>
              <p className="mt-2 text-gray-600">Discover what our community loves the most.</p>

              {/* This button is positioned to the right on larger screens */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 hidden sm:block">
                  <Button asChild variant="outline"><Link to="/bestsellers">View All Best Sellers</Link></Button>
              </div>
              
              {/* This button appears below the text on smaller screens */}
              <div className="mt-4 sm:hidden">
                  <Button asChild variant="outline"><Link to="/bestsellers">View All Best Sellers</Link></Button>
              </div>
            </div>
            {isBestsellersLoading ? ( <div className="flex justify-center py-8"><Spinner /></div> )
             : (
              bestsellers && bestsellers.length > 0 && (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {bestsellers.slice(0, 4).map((item) => <Card key={item.id} item={item} />)}
                </div>
              )
            )}
          </section>
          
          {/* Our Services Section (Your original, working code) */}
          <section className="container mx-auto px-4">
            <h2 className="text-center font-sans text-3xl font-bold text-text-main">
              Our Services
            </h2>
            <p className="mt-2 text-center text-gray-600 max-w-2xl mx-auto">
              Connect with ancient traditions through our expert services. Whether you seek clarity with a personalized Kundali report or wish to perform powerful Puja services, we are here to guide you.
            </p>
            <div className="mt-8 flex justify-center">
                <Button asChild size="lg" className="animate-pulse-glow">
                    <Link to="/services">Book Now!</Link>
                </Button>
            </div>
          </section>

          <TestimonialCarousel />

          {/* --- NEW FAQS SECTION --- */}
          <section className="container mx-auto px-4">
             <div className="text-center">
                <h2 className="font-sans text-3xl font-bold text-text-main">FAQs</h2>
                <p className="mt-2 text-gray-600">Here to help you on your spiritual journey.</p>
             </div>
             <div className="mt-8 max-w-3xl mx-auto">
                {isFaqsLoading ? <div className="flex justify-center py-8"><Spinner /></div> 
                : (
                  faqs && faqs.length > 0 && <FaqAccordion faqs={faqs} />
                )}
             </div>
          </section>
        </div>
      </div>
      <TrustBadgeScroller />
    </>
  );
}


