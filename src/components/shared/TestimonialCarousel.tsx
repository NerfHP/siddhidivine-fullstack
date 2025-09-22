import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ContentItem, Review } from '@/types';
import Spinner from './Spinner';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- TYPES ---
interface HighlightedReview extends Review {
  product?: ContentItem;
  user?: {
    name: string;
  };
}

// --- MOCK DATA FOR FALLBACK ---
const mockReviews: HighlightedReview[] = [
  {
    id: '1',
    rating: 5,
    comment: 'Absolutely amazing product! The quality is outstanding and delivery was super fast. Highly recommend to everyone.',
    imageUrl: null,
    createdAt: new Date().toISOString(),
    user: { name: 'Priya Sharma' },
    product: {
      id: '1',
      name: 'Rudraksha Mala',
      slug: 'rudraksha-mala',
      description: 'Sacred Rudraksha Mala',
      images: JSON.stringify(['https://placehold.co/400x300/8B4513/FFF?text=Rudraksha+Mala']),
      type: 'PRODUCT' as const,
      categories: [],
      categoryId: '1'
    }
  },
  {
    id: '2',
    rating: 4,
    comment: 'Great service and authentic products. The spiritual energy is definitely felt. Thank you for this wonderful experience.',
    imageUrl: null,
    createdAt: new Date().toISOString(),
    user: { name: 'Amit Kumar' },
    product: {
      id: '2',
      name: 'Yantra Collection',
      slug: 'yantra-collection',
      description: 'Sacred Yantra Collection',
      images: JSON.stringify(['https://placehold.co/400x300/FFD700/000?text=Sacred+Yantra']),
      type: 'PRODUCT' as const,
      categories: [],
      categoryId: '2'
    }
  },
  {
    id: '3',
    rating: 5,
    comment: 'Incredible quality and fast shipping. The product exceeded my expectations. Will definitely order again!',
    imageUrl: null,
    createdAt: new Date().toISOString(),
    user: { name: 'Sunita Devi' },
    product: {
      id: '3',
      name: 'Crystal Set',
      slug: 'crystal-set',
      description: 'Healing Crystal Set',
      images: JSON.stringify(['https://placehold.co/400x300/9932CC/FFF?text=Healing+Crystals']),
      type: 'PRODUCT' as const,
      categories: [],
      categoryId: '3'
    }
  },
  {
    id: '4',
    rating: 5,
    comment: 'Perfect for meditation and daily prayers. The energy is pure and divine. Thank you for such an authentic product.',
    imageUrl: null,
    createdAt: new Date().toISOString(),
    user: { name: 'Rajesh Gupta' },
    product: {
      id: '4',
      name: 'Prayer Beads',
      slug: 'prayer-beads',
      description: 'Sacred Prayer Beads',
      images: JSON.stringify(['https://placehold.co/400x300/CD853F/FFF?text=Prayer+Beads']),
      type: 'PRODUCT' as const,
      categories: [],
      categoryId: '4'
    }
  }
];

// --- API CALL ---
const fetchHighlightedReviews = async (): Promise<HighlightedReview[]> => {
  try {
    const { data } = await api.get('/content/reviews/highlighted');
    
    if (data && Array.isArray(data) && data.length > 0) {
      return data as HighlightedReview[];
    }
    
    // Return mock data if no real data
    return mockReviews;
  } catch (error) {
    console.error('Failed to fetch reviews, using mock data:', error);
    return mockReviews;
  }
};

// --- STAR RATING COMPONENT ---
const StarRating = ({ rating, size = 16, isActive = false }: { 
  rating: number; 
  size?: number; 
  isActive?: boolean; 
}) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={size} 
          className={`transition-colors duration-200 ${
            i < (rating || 0) 
              ? "text-yellow-400 fill-current drop-shadow-sm" 
              : (isActive ? "text-indigo-300" : "text-gray-300")
          }`} 
        />
      ))}
    </div>
  );
};

// --- IMAGE HANDLERS ---
const getReviewImage = (review: HighlightedReview): string => {
  if (review.imageUrl && review.imageUrl !== 'placeholder') {
    return review.imageUrl;
  }
  
  try {
    if (review.product?.images) {
      const images = JSON.parse(review.product.images);
      if (Array.isArray(images) && images.length > 0) {
        return images[0];
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }
  
  return 'https://placehold.co/600x400/F7F7F7/CCC?text=No+Image';
};

const getThumbnailImage = (review: HighlightedReview): string => {
  try {
    if (review.product?.images) {
      const images = JSON.parse(review.product.images);
      if (Array.isArray(images)) {
        return images[1] || images[0] || 'https://placehold.co/100x100/F7F7F7/CCC?text=P';
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }
  return 'https://placehold.co/100x100/F7F7F7/CCC?text=P';
};

// --- TESTIMONIAL CARD ---
const DetailedTestimonialCard = ({ review, isActive }: { 
  review: HighlightedReview; 
  isActive: boolean; 
}) => {
  const productLink = `/product/${review.product?.slug || 'unknown'}`;
  const cardDisplayImage = getReviewImage(review);
  const productThumbImage = getThumbnailImage(review);

  return (
    <div className={`flex flex-col h-full rounded-2xl shadow-xl transition-all duration-500 ease-in-out transform ${
      isActive 
        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white scale-105' 
        : 'bg-white text-gray-800 hover:shadow-2xl'
    }`}>
      {/* Image Section */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <img 
          src={cardDisplayImage} 
          alt={review.product?.name || 'Review image'} 
          className="w-full h-36 object-cover transition-transform duration-300 hover:scale-110" 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://placehold.co/600x400/F7F7F7/CCC?text=No+Image';
          }}
        />
        <div className="absolute top-3 right-3">
          <div className={`px-2 py-1 rounded-full ${isActive ? 'bg-white/20' : 'bg-black/70'}`}>
            <StarRating rating={review.rating} size={12} isActive={isActive} />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <StarRating rating={review.rating} size={18} isActive={isActive} />
          <p className={`text-xs font-medium ${isActive ? 'text-indigo-200' : 'text-gray-500'}`}>
            {new Date(review.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex-grow">
          <p className="font-sans text-sm leading-relaxed italic mb-4 line-clamp-4">
            "{review.comment}"
          </p>
        </div>
        
        <div className="mt-auto">
          <p className={`font-bold text-sm text-right ${isActive ? 'text-indigo-100' : 'text-gray-700'}`}>
            — {review.user?.name || 'Anonymous'}
          </p>
        </div>
      </div>

      {/* Product Link Section */}
      {review.product && (
        <Link 
          to={productLink} 
          className={`mt-auto p-4 border-t transition-all duration-300 ease-in-out rounded-b-2xl flex items-center gap-3 hover:scale-105 ${
            isActive 
              ? 'border-indigo-500 hover:bg-indigo-800/50 backdrop-blur-sm' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <img 
            src={productThumbImage} 
            alt={review.product.name} 
            className="w-10 h-10 object-cover rounded-lg border-2 border-white shadow-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/100x100/F7F7F7/CCC?text=P';
            }}
          />
          <div className="flex-grow">
            <span className={`font-semibold text-sm block ${isActive ? 'text-white' : 'text-gray-800'}`}>
              {review.product.name || 'Product'}
            </span>
            <span className={`text-xs ${isActive ? 'text-indigo-200' : 'text-gray-500'}`}>
              View Product →
            </span>
          </div>
        </Link>
      )}
    </div>
  );
};

// --- MAIN CAROUSEL COMPONENT ---
export default function TestimonialCarousel() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['highlightedReviews'],
    queryFn: fetchHighlightedReviews,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  
  const [activeIndex, setActiveIndex] = useState(0);

  const nextReview = () => {
    if (reviews && reviews.length > 0) {
      setActiveIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
    }
  };

  const prevReview = () => {
    if (reviews && reviews.length > 0) {
      setActiveIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
    }
  };
  
  useEffect(() => {
    if (reviews && reviews.length > 1) {
      const slideInterval = setInterval(nextReview, 6000);
      return () => clearInterval(slideInterval);
    }
  }, [activeIndex, reviews]);

  // Loading state
  if (isLoading) {
    return (
      <section className="bg-gray-50 py-20">
        <div className="flex flex-col items-center justify-center py-8">
          <Spinner />
          <span className="text-gray-600 mt-4">Loading testimonials...</span>
        </div>
      </section>
    );
  }

  // No reviews state
  if (!reviews || reviews.length === 0) {
    return (
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Customer Reviews</h2>
          <p className="text-gray-500">No reviews available yet. Be the first to share your experience!</p>
        </div>
      </section>
    );
  }
  
  const getCardStyle = (displayIndex: number) => {
    const backgroundCardScale = 0.75;
    const horizontalOffset = 65;

    if (displayIndex === 0) {
      return {
        transform: 'translateX(0%) scale(1)',
        zIndex: 10,
      };
    }

    if (Math.abs(displayIndex) <= 3) {
      return {
        transform: `translateX(${displayIndex * horizontalOffset}%) scale(${backgroundCardScale})`,
        zIndex: 10 - Math.abs(displayIndex),
      };
    }
    
    return {
      transform: `translateX(${displayIndex < 0 ? '-250%' : '250%'}) scale(${backgroundCardScale})`,
      zIndex: 0,
    };
  };

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-24 overflow-hidden">
      <div className="w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto px-4">
            Honest feedback from our valued customers who have experienced the quality 
            and authenticity of our products firsthand.
          </p>
          <div className="text-sm text-gray-400 mt-2">
            Showing {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="relative h-[420px] w-full">
          <motion.div className="relative h-full w-full flex items-center justify-center">
            {reviews.map((review, index) => {
              const delta = index - activeIndex;
              const distance = (delta + reviews.length) % reviews.length;
              const displayIndex = distance > reviews.length / 2 ? distance - reviews.length : distance;

              if (Math.abs(displayIndex) > 3) return null;

              const style = getCardStyle(displayIndex);

              return (
                <motion.div
                  key={review.id}
                  className="absolute cursor-pointer"
                  style={{
                    width: 'clamp(200px, 20vw, 280px)',
                    zIndex: style.zIndex,
                  }}
                  initial={false}
                  animate={{
                    transform: style.transform,
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 180, 
                    damping: 20,
                    mass: 0.8
                  }}
                  onClick={() => displayIndex !== 0 && setActiveIndex(index)}
                >
                  <DetailedTestimonialCard 
                    review={review} 
                    isActive={displayIndex === 0} 
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex justify-center mt-12 gap-6">
          <button 
            onClick={prevReview} 
            className="bg-white rounded-full p-4 shadow-lg hover:bg-gray-100 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:ring-offset-2" 
            aria-label="Previous Review"
          >
            <ChevronLeft size={28} className="text-gray-700"/>
          </button>
          <button 
            onClick={nextReview} 
            className="bg-white rounded-full p-4 shadow-lg hover:bg-gray-100 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:ring-offset-2" 
            aria-label="Next Review"
          >
            <ChevronRight size={28} className="text-gray-700"/>
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 gap-2">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-indigo-600 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}