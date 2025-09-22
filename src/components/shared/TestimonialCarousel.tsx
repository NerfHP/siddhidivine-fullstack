import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link } from 'react-router-dom';
import api from '@/lib/api'; // Assuming you have a configured axios instance
import Spinner from './Spinner'; // Assuming you have a Spinner component

// Define the shape of our review data
type Review = {
  id: string;
  rating: number;
  comment: string;
  image?: string; // Customer's image
  user: {
    name: string;
  };
  product: {
    name: string;
    images: string[];
    slug: string;
  };
};

// Star rating component
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex text-yellow-400">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'fill-current' : 'text-gray-300'}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export const TestimonialCarousel = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true, // Enable looping
    align: 'start',
    containScroll: 'trimSnaps',
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const fetchTopReviews = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/reviews/top');
        setReviews(response.data);
      } catch (err) {
        setError('Failed to load testimonials.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopReviews();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  if (reviews.length === 0) {
    return null; // Don't render anything if there are no reviews
  }

  return (
    <section className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">What Our Customers Say</h2>
            <p className="mt-4 text-lg text-gray-600">Real stories from our valued customers.</p>
        </div>

        <div className="relative mt-12">
           {/* Carousel Viewport */}
          <div className="overflow-hidden" ref={emblaRef}>
            {/* Carousel Container */}
            <div className="flex -ml-4">
              {reviews.map((review, index) => (
                // Carousel Slide
                <div key={review.id} className="flex-[0_0_90%] sm:flex-[0_0_45%] lg:flex-[0_0_33.33%] pl-4">
                  <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
                     <div className="flex-1 p-6 flex flex-col justify-between">
                       <div>
                         <StarRating rating={review.rating} />
                         <blockquote className="mt-4">
                           <p className="text-gray-600 italic">"{review.comment}"</p>
                         </blockquote>
                       </div>
                       <footer className="mt-6 flex items-center space-x-4">
                         <img 
                            className="w-14 h-14 rounded-full object-cover"
                            src={review.image || review.product.images[0]} 
                            alt={review.user.name || 'Customer'}
                            onError={(e) => {
                                // Fallback if both images fail
                                (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/60x60/e2e8f0/e2e8f0?text=';
                            }}
                         />
                         <div>
                            <p className="font-semibold text-gray-900">{review.user.name || 'Anonymous'}</p>
                            <p className="text-sm text-gray-500">Verified Buyer</p>
                         </div>
                       </footer>
                     </div>
                     {/* Product Banner */}
                     <Link to={`/products/${review.product.slug}`} className="block bg-gray-100 hover:bg-gray-200 transition duration-300 p-3">
                        <div className="flex items-center space-x-3">
                            <img className="w-10 h-10 rounded-md object-cover" src={review.product.images[0]} alt={review.product.name} />
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{review.product.name}</p>
                                <p className="text-xs text-indigo-600">View Product &rarr;</p>
                            </div>
                        </div>
                     </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="absolute inset-y-0 left-0 hidden md:flex items-center">
             <button onClick={scrollPrev} className="bg-white/80 hover:bg-white rounded-full p-2 shadow-md -ml-5 ring-1 ring-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             </button>
          </div>
          <div className="absolute inset-y-0 right-0 hidden md:flex items-center">
             <button onClick={scrollNext} className="bg-white/80 hover:bg-white rounded-full p-2 shadow-md -mr-5 ring-1 ring-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>
          </div>

        </div>
      </div>
    </section>
  );
};

