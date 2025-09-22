import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link } from 'react-router-dom';
import api from '@/lib/api'; // Corrected import path
import Spinner from './Spinner'; // Corrected import path

// --- Type Definition ---
interface Review {
  id: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  user: {
    name: string;
  } | null;
  guestName?: string;
  product: {
    name:string;
    slug: string;
    images: string; // The API returns this as a JSON string
  };
}


const TestimonialCard = ({ review }: { review: Review }) => {
  // Helper function to safely parse the stringified images array
  const getProductImage = (imagesString: string): string | null => {
    if (!imagesString) return null;
    try {
      const imagesArray = JSON.parse(imagesString);
      return Array.isArray(imagesArray) && imagesArray.length > 0 ? imagesArray[0] : null;
    } catch (error) {
      console.error("Failed to parse product images:", error);
      return null;
    }
  };

  const productImageUrl = getProductImage(review.product.images);
  const displayImage = review.imageUrl || productImageUrl || 'https://placehold.co/400x300/F7F7F7/CCC?text=Siddhi+Divine';
  const authorName = review.user?.name || review.guestName || 'Anonymous';
  
  return (
    <div className="embla__slide relative flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
        <div className="p-6 flex-grow">
          <div className="flex items-center mb-4">
            {/* Star Rating */}
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-5 h-5 fill-current ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
              ))}
            </div>
          </div>
          <p className="text-gray-600 italic mb-4">"{review.comment}"</p>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-200 mt-auto">
           <div className="flex items-center">
            <img 
              src={displayImage}
              alt={`${authorName}'s review image`}
              className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-white shadow-md"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/F7F7F7/CCC?text=Siddhi+Divine'; }}
            />
            <div>
              <p className="font-bold text-gray-800">{authorName}</p>
            </div>
          </div>
        </div>
        {/* Product Link Banner */}
        <Link to={`/products/${review.product.slug}`} className="block bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-center py-2 px-4 hover:opacity-90 transition-opacity">
          View {review.product.name}
        </Link>
      </div>
    </div>
  );
};

export const TestimonialCarousel = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get('/reviews/top');
        setReviews(response.data);
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
        setError('Failed to load testimonials.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  if (isLoading) return <div className="text-center p-10"><Spinner /></div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (reviews.length === 0) return null; // Don't render if there are no reviews

  return (
    <div className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">What Our Customers Say</h2>
        <div className="embla relative overflow-hidden">
          <div className="embla__viewport" ref={emblaRef}>
            <div className="embla__container flex">
              {reviews.map(review => (
                <TestimonialCard key={review.id} review={review} />
              ))}
            </div>
          </div>
           {/* Navigation Buttons */}
           <button className="embla__prev absolute top-1/2 -translate-y-1/2 left-0 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-white" onClick={scrollPrev}>
             <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </button>
           <button className="embla__next absolute top-1/2 -translate-y-1/2 right-0 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-white" onClick={scrollNext}>
             <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
           </button>
        </div>
      </div>
    </div>
  );
};

