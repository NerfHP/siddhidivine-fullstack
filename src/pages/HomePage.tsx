import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ContentItem } from '@/types';
import Card from '@/components/shared/Card';
import Spinner from '@/components/shared/Spinner';
import Alert from '@/components/shared/Alert';
import Button from '@/components/shared/Button';
import { Link } from 'react-router-dom';
import SEO from '@/components/shared/SEO';
import ShuffleHero from '@/components/ShuffleHero';
import FaqAccordion from '@/components/shared/FaqAccordion';
import { TestimonialCarousel } from '@/components/shared/TestimonialCarousel';
import TrustBadgeScroller from '@/components/shared/TrustBadgeScroller';

// --- TYPE DEFINITIONS FOR OUR DATA ---
interface FeaturedData {
  products: ContentItem[];
  services?: ContentItem[];
}
interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// --- API CALLS ---
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
  const { data: featuredData, isLoading: isFeaturedLoading, isError: isFeaturedError } = useQuery({
    queryKey: ['featuredItems'],
    queryFn: fetchFeaturedItems,
  });

  const { data: bestsellers, isLoading: isBestsellersLoading, isError: isBestsellersError } = useQuery({
    queryKey: ['bestsellersHome'],
    queryFn: fetchBestsellers,
  });

  const { data: faqs, isLoading: isFaqsLoading, isError: isFaqsError } = useQuery({
    queryKey: ['faqsHome'],
    queryFn: fetchFaqs,
  });

  // The handleAddToCart function is no longer needed here, as the Card component handles its own logic.

  return (
    <>
      <SEO 
        title="Your Guide to Spiritual Wellness"
        description="Discover authentic spiritual products, book puja services, and find guidance with our expert astrology consultations. Your path to peace and well-being starts here."
      />
      
      <style>
        {`
          @keyframes heartbeat-glow {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 1rem rgba(249, 115, 22, 0.5);
            }
            50% {
              transform: scale(1.07);
              box-shadow: 0 0 2.5rem rgba(249, 115, 22, 0.8);
            }
          }

          .animate-heartbeat-glow {
            animation: heartbeat-glow 2s infinite ease-in-out;
          }
        `}
      </style>

      <ShuffleHero/>

      <div className="relative z-10 bg-transparent">
        <div className="py-16 space-y-20">
          
          {/* Featured Products Section */}
          <section className="container mx-auto px-4">
            <h2 className="text-center font-sans text-3xl font-bold text-text-main">
              Featured Products
            </h2>
            <p className="mt-2 text-center text-gray-600">
              Handpicked items for your spiritual practices.
            </p>
            {isFeaturedLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : isFeaturedError ? (
              <Alert type="error" message="Could not load featured products. Please try again later."/>
            ) : (
              featuredData?.products && featuredData.products.length > 0 ? (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {featuredData.products.map((item: ContentItem) => (
                    // --- FIX: The onAddToCart prop has been removed ---
                    <Card key={item.id} item={item} />
                  ))}
                </div>
              ) : <p className="text-center text-gray-500 mt-8">No featured products at the moment.</p>
            )}
          </section>

          {/* Best Sellers Section */}
          <section className="container mx-auto px-4">
            <div className="relative text-center">
              <h2 className="font-sans text-3xl font-bold text-text-main">Our Best Sellers</h2>
              <p className="mt-2 text-gray-600">Discover what our community loves the most.</p>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 hidden sm:block">
                  <Button asChild variant="outline"><Link to="/bestsellers">View All</Link></Button>
              </div>
              <div className="mt-4 sm:hidden">
                  <Button asChild variant="outline"><Link to="/bestsellers">View All</Link></Button>
              </div>
            </div>
            {isBestsellersLoading ? ( <div className="flex justify-center py-8"><Spinner /></div> )
             : isBestsellersError ? <Alert type="error" message="Could not load bestsellers."/>
             : (
              bestsellers && bestsellers.length > 0 ? (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* --- FIX: The onAddToCart prop has been removed --- */}
                  {bestsellers.slice(0, 4).map((item) => <Card key={item.id} item={item} />)}
                </div>
              ) : <p className="text-center text-gray-500 mt-8">No bestsellers to show right now.</p>
            )}
          </section>
          
          {/* Our Services Section */}
          <section className="container mx-auto px-4">
            <div 
              className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 sm:p-12 text-center text-white shadow-2xl bg-cover bg-center"
              style={{backgroundImage: `url('/images/service-banner-bg.jpg')`}}
            >
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="relative z-10">
                <h2 className="font-sans text-4xl font-bold">
                  Guidance for Your Spiritual Path
                </h2>
                <p className="mt-4 mx-auto max-w-2xl text-lg text-slate-300">
                  Whether you seek clarity through a personalized Kundali report or wish to perform powerful Puja services, our experts are here to connect you with ancient traditions and unlock your harmony.
                </p>
                <div className="mt-8">
                  <Button asChild size="lg" className="animate-heartbeat-glow">
                    <Link to="/services">Book Now!</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <TestimonialCarousel />

          {/* FAQs Section */}
          <section className="container mx-auto px-4">
             <div className="text-center">
                <h2 className="font-sans text-3xl font-bold text-text-main">FAQs</h2>
                <p className="mt-2 text-gray-600">Here to help you on your spiritual journey.</p>
             </div>
             <div className="mt-8 max-w-3xl mx-auto">
                {isFaqsLoading ? <div className="flex justify-center py-8"><Spinner /></div> 
                : isFaqsError ? <Alert type="error" message="Could not load FAQs." />
                : (
                  faqs && faqs.length > 0 ? <FaqAccordion faqs={faqs} /> : null
                )}
             </div>
          </section>
        </div>
      </div>
      <TrustBadgeScroller />
    </>
  );
}

