import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ContentItem, Review } from '@/types';
import Spinner from './Spinner';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Alert from './Alert'; // Import the Alert component for error messages

// --- TYPES ---
interface HighlightedReview extends Review {
  product: ContentItem;
  user: {
    name: string;
  };
}

// --- API CALL (URL FIXED) ---
const fetchHighlightedReviews = async () => {
  // This is the CRITICAL FIX. The URL now correctly points to your API endpoint.
  const { data } = await api.get('/content/reviews/highlighted');
  return data as HighlightedReview[];
};

// --- DETAILED SUB-COMPONENT (No changes needed here) ---
const DetailedTestimonialCard = ({ review, isActive }: { review: HighlightedReview; isActive: boolean }) => {
  const productLink = `/product/${review.product?.slug}`;
  
  const [productMainImage, productThumbImage] = (() => {
    try {
      if (typeof review.product?.images === 'string') {
        const images = JSON.parse(review.product.images);
        return [images[0] || 'https://placehold.co/600x400/F7F7F7/CCC?text=Image', images[1] || 'https://placehold.co/100x100/F7F7F7/CCC?text=P'];
      }
    } catch (e) {
      console.error("Failed to parse product images:", e);
    }
    return ['https://placehold.co/600x400/F7F7F7/CCC?text=Image', 'https://placehold.co/100x100/F7F7F7/CCC?text=P'];
  })();
  
  const cardDisplayImage = review.imageUrl || (review.rating === 5 ? productMainImage : productMainImage);

  return (
    <div className={`flex flex-col h-full rounded-2xl shadow-xl transition-colors duration-500 ease-in-out ${isActive ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'}`}>
        <img src={cardDisplayImage} alt={review.product.name} className="w-full h-32 object-cover rounded-t-2xl" />
        <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-2">
                <div className="flex">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < (review.rating || 0) ? "text-yellow-400 fill-current" : (isActive ? "text-indigo-400" : "text-gray-300")} />
                    ))}
                </div>
                <p className={`text-xs font-medium ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
            <p className="font-sans text-sm italic mb-3 flex-grow">"{review.comment}"</p>
            <p className="font-bold text-xs text-right">- {review.user.name}</p>
        </div>
        <Link to={productLink} className={`mt-auto p-2 border-t transition-colors duration-300 ease-in-out rounded-b-2xl flex items-center gap-3 ${isActive ? 'border-indigo-500 hover:bg-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}>
            <img src={productThumbImage} alt={review.product.name} className="w-8 h-8 object-cover rounded-md border-2 border-white shadow-sm"/>
            <span className="font-semibold text-xs">{review.product.name}</span>
        </Link>
    </div>
  );
};

// --- MAIN CAROUSEL COMPONENT (LOGIC FIXED) ---
export default function TestimonialCarousel() {
  // We now get the isError state from react-query
  const { data: reviews, isLoading, isError } = useQuery({
    queryKey: ['highlightedReviews'],
    queryFn: fetchHighlightedReviews,
  });
  
  const [activeIndex, setActiveIndex] = useState(0);

  const nextReview = () => {
    // We now check if reviews is a valid array before using it
    if (Array.isArray(reviews) && reviews.length > 0) {
      setActiveIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
    }
  };

  const prevReview = () => {
    if (Array.isArray(reviews) && reviews.length > 0) {
      setActiveIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
    }
  };
  
  useEffect(() => {
    if (Array.isArray(reviews) && reviews.length > 1) {
        const slideInterval = setInterval(nextReview, 5000);
        return () => clearInterval(slideInterval);
    }
  }, [activeIndex, reviews]);

  // --- THE FINAL, ROBUST CHECKS ---
  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  // This new check handles API failures gracefully.
  if (isError) {
    return (
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800">See what our customers said</h2>
            <div className="mt-8">
              <Alert type="error" message="Could not load reviews at this time." />
            </div>
        </div>
      </section>
    )
  }

  // Your existing check now safely handles the "no reviews yet" case.
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return (
      <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-gray-800">See what our customers said</h2>
              <p className="mt-4 text-gray-500">Customer reviews will be shown here soon.</p>
          </div>
      </section>
    )
  }
  
  const getCardStyle = (displayIndex: number) => {
      const backgroundCardScale = 0.7;
      const horizontalOffset = 60; // in percent

      if (displayIndex === 0) { // Active card
        return {
            transform: 'translateX(0%) scale(1)',
            zIndex: 10,
        };
      }

      if (Math.abs(displayIndex) <= 3) { // Visible background cards
        return {
            transform: `translateX(${displayIndex * horizontalOffset}%) scale(${backgroundCardScale})`,
            zIndex: 10 - Math.abs(displayIndex),
        };
      }
      
      // Off-screen cards
      return {
          transform: `translateX(${displayIndex < 0 ? '-240%' : '240%'}) scale(${backgroundCardScale})`,
          zIndex: 0,
      };
  }

  return (
    <section className="bg-gray-50 py-20 overflow-hidden">
      <div className="w-full">
        <h2 className="text-center text-4xl font-bold text-gray-800 mb-4">See what our customers said</h2>
        <p className="text-center text-lg text-gray-500 mb-16 max-w-3xl mx-auto px-4">Honest feedback from our valued users who have experienced the quality and authenticity of our products firsthand.</p>
        
        <div className="relative h-[380px] w-full">
          <motion.div
            className="relative h-full w-full flex items-center justify-center"
          >
            {/* It is now 100% safe to call .map() on reviews */}
            {reviews.map((review, index) => {
              const delta = index - activeIndex;
              const distance = (delta + reviews.length) % reviews.length;
              const displayIndex = distance > reviews.length / 2 ? distance - reviews.length : distance;

              if (Math.abs(displayIndex) > 3) return null;

              const style = getCardStyle(displayIndex);

              return (
                <motion.div
                  key={review.id}
                  className="absolute"
                  style={{
                    width: 'clamp(180px, 18vw, 240px)',
                    zIndex: style.zIndex,
                  }}
                  initial={false}
                  animate={{
                    transform: style.transform,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                >
                  <DetailedTestimonialCard review={review} isActive={displayIndex === 0} />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        
        <div className="flex justify-center mt-12 gap-6">
          <button onClick={prevReview} className="bg-white rounded-full p-4 shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-200 focus-outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" aria-label="Previous Review">
            <ChevronLeft size={28} className="text-gray-700"/>
          </button>
          <button onClick={nextReview} className="bg-white rounded-full p-4 shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-200 focus-outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" aria-label="Next Review">
            <ChevronRight size={28} className="text-gray-700"/>
          </button>
        </div>
      </div>
    </section>
  );
}
