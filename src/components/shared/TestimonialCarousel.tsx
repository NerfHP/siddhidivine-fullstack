import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Review, ContentItem } from '@/types';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

// Enhanced review interface matching your backend
interface TestimonialReview extends Review {
  product?: ContentItem;
  user?: {
    name: string;
    avatar?: string;
  };
  guestName?: string;
}

// Fetch testimonial reviews from your existing API endpoint
const fetchTestimonialReviews = async (): Promise<TestimonialReview[]> => {
  try {
    const { data } = await api.get('/reviews/testimonials/featured?limit=50');
    return data.filter((review: TestimonialReview) => 
      review.rating >= 4 && 
      review.comment && 
      review.comment.trim().length > 20
    );
  } catch (error) {
    console.warn('Failed to fetch testimonial reviews:', error);
    return [];
  }
};

// Get review image with smart fallbacks (review image -> product image -> avatar)
const getReviewImage = (review: TestimonialReview): string => {
  // Priority 1: Review image
  if (review.imageUrl && review.imageUrl !== 'placeholder' && !review.imageUrl.includes('dicebear')) {
    return review.imageUrl;
  }
  
  // Priority 2: Product image
  if (review.product?.images) {
    try {
      const images = JSON.parse(review.product.images);
      if (images.length > 0 && !images[0].includes('dicebear')) {
        return images[0];
      }
    } catch (e) {
      console.warn('Failed to parse product images');
    }
  }
  
  // Priority 3: Generated avatar based on user name
  const userName = review.user?.name || review.guestName || review.id;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&clothingGraphic=resist,skullOutline,skull`;
};

// Get product thumbnail
const getProductThumbnail = (product?: ContentItem): string => {
  if (!product) return '';
  
  try {
    const images = JSON.parse(product.images || '[]');
    return images[0] || `https://api.dicebear.com/7.x/shapes/svg?seed=${product.id}&backgroundColor=f1f5f9`;
  } catch {
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${product.id}&backgroundColor=f1f5f9`;
  }
};

// Format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};

// Testimonial Card Component
const TestimonialCard = ({ 
  review, 
  isVisible,
  delay = 0 
}: { 
  review: TestimonialReview; 
  isVisible: boolean;
  delay?: number;
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const reviewImage = getReviewImage(review);
  const productThumbnail = getProductThumbnail(review.product);
  const customerName = review.user?.name || review.guestName || 'Verified Customer';

  const handleProductClick = () => {
    if (review.product?.slug) {
      navigate(`/products/${review.product.slug}`);
    }
  };

  return (
    <div 
      className={`group relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-700 transform hover:scale-[1.02] ${
        isVisible 
          ? 'opacity-100 translate-y-0 rotate-0' 
          : 'opacity-0 translate-y-12 rotate-1'
      }`}
      style={{
        transitionDelay: `${delay}ms`,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      }}
    >
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
      
      <div className="relative">
        {/* Header with avatar and info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
              <img
                src={reviewImage}
                alt={customerName}
                className={`w-full h-full rounded-full object-cover bg-white transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 text-sm truncate">
                {customerName}
              </h4>
              <div className="flex">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatTimeAgo(review.createdAt)}</span>
              <span>•</span>
              <span className="text-green-600 font-medium">Verified Purchase</span>
            </div>
          </div>
        </div>

        {/* Review text */}
        <blockquote className="text-gray-700 text-sm leading-relaxed mb-4 font-medium">
          "{(review.comment || '').length > 120 ? (review.comment || '').substring(0, 120) + '...' : (review.comment || 'Amazing product!')}"
        </blockquote>

        {/* Product link card */}
        {review.product && (
          <div 
            onClick={handleProductClick}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-100 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all duration-300 group/product"
          >
            <div className="relative">
              <img
                src={productThumbnail}
                alt={review.product.name}
                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
              />
              <div className="absolute inset-0 bg-blue-400/20 rounded-lg opacity-0 group-hover/product:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate group-hover/product:text-blue-600 transition-colors">
                {review.product.name}
              </p>
              <p className="text-xs text-gray-500">View Product →</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Testimonial Carousel Component
export default function TestimonialCarousel() {
  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ['testimonial-reviews'],
    queryFn: fetchTestimonialReviews,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    retry: 2,
    retryDelay: 1000,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const cardsPerPage = 6;
  const totalPages = Math.ceil(reviews.length / cardsPerPage);
  
  const currentReviews = reviews.slice(
    currentIndex * cardsPerPage,
    (currentIndex + 1) * cardsPerPage
  );

  const nextPage = () => {
    setVisibleCards(new Set());
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setVisibleCards(new Set());
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Staggered animation
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    setVisibleCards(new Set());
    
    currentReviews.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleCards(prev => new Set([...prev, index]));
      }, index * 150);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [currentIndex, currentReviews.length]);

  // Auto-advance carousel
  useEffect(() => {
    if (totalPages > 1 && reviews.length > 0) {
      intervalRef.current = setInterval(nextPage, 8000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [totalPages, reviews.length]);

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Customer Love Stories
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || reviews.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Customer Love Stories
          </h2>
          <p className="text-gray-600 mb-8">We're gathering amazing customer experiences...</p>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {reviews.length} Verified Reviews
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
            Customer Love Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real experiences from customers who found their perfect spiritual products
          </p>
        </div>

        {/* Masonry-style grid with stagger effect */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 mb-12">
          {currentReviews.map((review, index) => (
            <div
              key={`${review.id}-${currentIndex}`}
              className="break-inside-avoid"
              style={{
                transform: `translateY(${Math.sin(index * 0.5) * 8}px)`,
              }}
            >
              <TestimonialCard
                review={review}
                isVisible={visibleCards.has(index)}
                delay={index * 150}
              />
            </div>
          ))}
        </div>

        {/* Navigation */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6">
            <button
              onClick={prevPage}
              className="group p-3 rounded-full bg-white/70 backdrop-blur-sm border border-gray-200/50 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setVisibleCards(new Set());
                    setCurrentIndex(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex 
                      ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500' 
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextPage}
              className="group p-3 rounded-full bg-white/70 backdrop-blur-sm border border-gray-200/50 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              aria-label="Next reviews"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}