import React from 'react';
import { Link } from 'react-router-dom';
import { ContentItem } from '../../types'; // Assuming types are in src/types

// --- Placeholder Components to resolve build errors ---

// A simple spinner placeholder
const Spinner = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
);

// A placeholder Button component that handles the `asChild` prop
const Button = ({ asChild = false, children, variant, size, className, ...props }: any) => {
  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ...props,
      className: `${className} ${child.props.className || ''}`,
    });
  }
  return <button className={className} {...props}>{children}</button>;
};
// --- End of Placeholder Components ---


// Define the props the component will accept
interface ServicesSectionProps {
  featuredData: { services: ContentItem[] } | undefined;
  isFeaturedLoading: boolean;
  handleAddToCart: (item: ContentItem) => void;
  formatCurrency: (amount: number) => string;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({
  featuredData,
  isFeaturedLoading,
  handleAddToCart,
  formatCurrency,
}) => {
  // Extract the single featured service if it exists
  const featuredService = featuredData?.services?.[0];

  return (
    <>
      {/* CSS for the button animations, kept from previous version */}
      <style>
        {`
          @keyframes pulse-glow {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 1rem rgba(249, 115, 22, 0.5);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 2rem rgba(249, 115, 22, 0.8);
            }
          }

          .animate-pulse-glow {
            animation: pulse-glow 2.5s infinite ease-in-out;
          }
        `}
      </style>
      <section className="py-16 md:py-24 bg-orange-50/50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 relative inline-block">
            Our Services
            <span className="block h-1 w-24 bg-orange-500 mx-auto mt-4"></span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Connect with ancient traditions through our expert services.
          </p>

          {isFeaturedLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : featuredService ? (
            // Using the new, improved single-item layout with dynamic data
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-4xl mx-auto border border-gray-100 overflow-hidden relative">
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-12 w-48 h-48 opacity-20">
                  <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 0 L125 50 L150 25 L175 75 L200 50 L150 100 L175 150 L125 125 L100 200 L75 125 L25 175 L50 100 L0 50 L25 75 L50 25 L75 50 Z" stroke="#F87171" strokeWidth="2" strokeDasharray="4 4"/>
                  </svg>
              </div>
              <div className="absolute -bottom-12 -right-10 w-48 h-48 opacity-20">
                  <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M50 0 L75 50 L100 25 L125 75 L150 50 L100 100 L125 150 L75 125 L50 200 L25 125 L-25 175 L0 100 L-50 50 L-25 75 L0 25 L25 50 Z" stroke="#F87171" strokeWidth="2" strokeDasharray="4 4"/>
                  </svg>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="w-full md:w-2/5 flex-shrink-0">
                  <img
                    src={JSON.parse(featuredService.images || '[]')[0] || '/images/placeholder.png'}
                    alt={featuredService.name}
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
                <div className="w-full md:w-3/5 text-center md:text-left">
                  <h3 className="text-3xl font-bold text-gray-800 mb-3">
                    {featuredService.name}
                  </h3>
                  <p className="text-gray-600 mb-5">
                    {featuredService.description}
                  </p>
                  <div className="flex items-baseline justify-center md:justify-start gap-3 mb-6">
                     {featuredService.salePrice && (
                       <span className="text-4xl font-extrabold text-gray-900">{formatCurrency(featuredService.salePrice)}</span>
                     )}
                    <span className={`text-xl font-medium ${featuredService.salePrice ? 'text-red-500 line-through' : 'text-gray-900'}`}>
                      {formatCurrency(featuredService.price || 0)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => handleAddToCart(featuredService)}
                      className="w-full text-center bg-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
                    >
                      Book Now
                    </button>
                    <Button asChild size="md" variant="outline" className="w-full bg-transparent border-2 border-orange-500 text-orange-500 font-bold py-3 px-6 rounded-lg hover:bg-orange-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition-all duration-300">
                       <Link to={`/services/${featuredService.slug}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
             // Fallback for no services or if you want to display multiple cards in the future
            <p className="text-gray-600">No featured services available at the moment.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default ServicesSection;

