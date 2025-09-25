import React from 'react';
import { Star } from 'lucide-react';

// --- Type Definition ---
interface HandpickedReview {
  id: number;
  comment: string;
  customerName: string;
  customerProfilePic: string;
  productImage: string;
  productSlug: string;
  productName: string;
  rating: number;
}

// --- Enhanced Testimonials with spiritual/divine products focus ---
const handpickedReviews: HandpickedReview[] = [
  {
    id: 1,
    comment: "The 10 Mukhi Rudraksha bracelet has brought incredible peace to my daily meditation. The energy is truly divine!",
    customerName: "Seema Prajapati",
    customerProfilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    productImage: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=200&auto=format&fit=crop",
    productSlug: "10-mukhi-rudraksha-bracelet-adjustable",
    productName: "10 Mukhi Rudraksha Bracelet Adjustable",
    rating: 5
  },
  {
    id: 2,
    comment: "Amazing quality Rudraksha beads! I can feel the positive vibrations throughout my day. Highly recommended!",
    customerName: "Kunal",
    customerProfilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    productImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=200&auto=format&fit=crop",
    productSlug: "7-mukhi-rudraksh",
    productName: "7 Mukhi Rudraksha",
    rating: 5
  },
  {
    id: 3,
    comment: "The Golden Pyrite Bracelet radiates positivity and confidence, I can truly feel its uplifting energy every time I wear it!",
    customerName: "Sharmila",
    customerProfilePic: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    productImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=200&auto=format&fit=crop",
    productSlug: "golden-pyrite",
    productName: "Golden Pyrite Bracelet",
    rating: 5
  },
  {
    id: 4,
    comment: "The Money Magnet Bracelet instantly makes me feel abundant and confident, attracting prosperity and positive vibes throughout the day!",
    customerName: "Satveer Singh",
    customerProfilePic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
    productImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=200&auto=format&fit=crop",
    productSlug: "money-magnet",
    productName: "Money Magnet Bracelet",
    rating: 5
  },
  {
    id: 5,
    comment: "I received my Turquoise Firoza Bracelet fully energized, and it has truly helped me with clarity and growth in my career.",
    customerName: "Vijay Prajapati",
    customerProfilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    productImage: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=200&auto=format&fit=crop",
    productSlug: "turquoise",
    productName: "Turquoise (Firoza)",
    rating: 5
  },
  {
    id: 6,
    comment: "The spiritual bracelet collection is amazing! Each piece radiates divine energy and helps in my daily spiritual practice.",
    customerName: "Ronak",
    customerProfilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    productImage: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=200&auto=format&fit=crop",
    productSlug: "rose-quartz-Bracelet",
    productName: "Rose Quartz Bracelet",
    rating: 5
  },
  {
    id: 7,
    comment: "I got my Moonga (Red Coral) Bracelet energized, and it has greatly boosted my confidence and supported me in my career growth.",
    customerName: "Sukhvinder Kaur",
    customerProfilePic: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=200&auto=format&fit=crop",
    productImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=200&auto=format&fit=crop",
    productSlug: "red-coral-moonga",
    productName: "Red Coral (Moonga) Gemstone",
    rating: 5
  },
  {
    id: 8,
    comment: "I received my Hessonite (Gomedh) Bracelet energized, and it has brought me focus, stability, and amazing progress in my professional journey.”",
    customerName: "Rajeev Saxena",
    customerProfilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
    productImage: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=200&auto=format&fit=crop",
    productSlug: "hessonite-gomedh",
    productName: "Hessonite (Gomedh) Gemstone",
    rating: 5
  },
  {
    id: 9,
    comment: "Divine protection amulet gives me confidence and peace. I never leave home without it. Truly blessed!",
    customerName: "Bhavya Sharma",
    customerProfilePic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    productImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=200&auto=format&fit=crop",
    productSlug: "aventurine-bracelet",
    productName: "Green Aventurine Bracelet",
    rating: 5
  },
  {
    id: 10,
    comment: "The energized Gauri Shanker Rudraksha brings peace and harmony, helping me stay balanced every day.",
    customerName: "Arvind kumar",
    customerProfilePic: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    productImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=200&auto=format&fit=crop",
    productSlug: "gauri-shanker-rudraksha",
    productName: "Gauri Shanker Rudraksha",
    rating: 5
  }
];

interface TestimonialCardProps {
  review: HandpickedReview;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ review }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  const handleProductClick = () => {
    // Navigate to product page
    window.location.href = `/product/${review.productSlug}`;
  };

  return (
    <div className="flex flex-col w-[320px] flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group cursor-pointer">
      
      <div className="p-5 flex-1 flex flex-col">
        {/* Customer Profile Section */}
        <div className="flex items-center mb-4">
          <img 
            src={review.customerProfilePic} 
            alt={`${review.customerName} profile`}
            className="w-12 h-12 rounded-full object-cover border-2 border-orange-100" 
          />
          <div className="ml-3 flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">{review.customerName}</h4>
            <div className="flex mt-1">
              {renderStars(review.rating)}
            </div>
          </div>
        </div>
        
        {/* Comment */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4 flex-1">
          "{review.comment}"
        </p>
        
        {/* Product Link Bar at Bottom */}
        <div 
          className="bg-orange-50 rounded-lg p-3 border border-orange-100 group-hover:bg-orange-100 transition-colors duration-300"
          onClick={handleProductClick}
        >
          <div className="flex items-center space-x-3">
            <img 
              src={review.productImage} 
              alt={review.productName}
              className="w-8 h-8 rounded-md object-cover ring-1 ring-orange-200" 
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-xs group-hover:text-orange-600 transition-colors">
                {review.productName}
              </p>
              <p className="text-orange-600 text-xs font-medium">
                View Product →
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TestimonialCarousel: React.FC = () => {
  // Create seamless loop by tripling the array
  const infiniteReviews = [...handpickedReviews, ...handpickedReviews, ...handpickedReviews];

  return (
    <div className="py-4 bg-transparent w-full overflow-hidden">
      {/* Header */}
      <div className="w-full px-4 text-center mb-6">
        <h2 className="text-3xl md:text-2 font-bold mb-2">
          Loved by our <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">spiritual community</span>
        </h2>
        <p className="mt-2 text-l text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Discover the divine experiences of thousands who have found their spiritual path 
          with our authentic Rudraksha, gemstones, and sacred spiritual products.
        </p>
      </div>

      {/* Main Carousel - Full Width Seamless Scroll */}
      <div className="w-full">
        {/* Testimonial Cards - Infinite Smooth Scroll */}
        <div className="flex animate-infinite-scroll">
          {infiniteReviews.map((review, index) => (
            <div key={`${review.id}-${index}`} className="mx-3 flex-shrink-0">
              <TestimonialCard review={review} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes infinite-scroll {
          0% { 
            transform: translateX(0); 
          }
          100% { 
            transform: translateX(-33.333%); 
          }
        }
        
        .animate-infinite-scroll {
          animation: infinite-scroll 45s linear infinite;
          width: max-content;
        }
        
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};