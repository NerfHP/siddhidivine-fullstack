import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ContentItem } from '@/types';
import Spinner from '@/components/shared/Spinner';
import Alert from '@/components/shared/Alert';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SEO from '@/components/shared/SEO';
import Button from '@/components/shared/Button';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'react-router-dom';

// This function fetches all services from your database
const fetchAllServices = async () => {
  const { data } = await api.get('/content/services');
  return data as ContentItem[];
};

export default function ServicesPage() {
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['allServices'],
    queryFn: fetchAllServices,
  });

  return (
    <>
      <SEO 
        title="Spiritual Services"
        description="Book our authentic spiritual services, including pujas and astrology consultations, performed by experienced experts."
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
      <div className="bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Services' }]} />
          <div className="mt-4 text-center border-b pb-4">
              <h1 className="font-sans text-4xl font-bold text-text-main">Our Services</h1>
              <p className="mt-2 text-gray-600 max-w-2xl mx-auto">Connect with ancient traditions through our expert services.</p>
          </div>
          
          {isLoading ? (
            <div className="flex h-64 items-center justify-center"><Spinner /></div>
          ) : error ? (
            <div className="mt-8"><Alert type="error" message="Failed to load services. Please try again later." /></div>
          ) : (
            services && (
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                  {services.map((service) => (
                    <div key={service.id} className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg border">
                      <div className="grid sm:grid-cols-2 gap-6 items-center">
                        <div>
                          <img 
                            src={JSON.parse(service.images || '[]')[0]} 
                            alt={service.name}
                            className="w-full rounded-lg object-cover aspect-square"
                          />
                        </div>
                        <div className="text-center sm:text-left flex flex-col h-full">
                          <div className="flex-grow">
                            <h2 className="font-sans text-2xl font-bold text-text-main">{service.name}</h2>
                            <p className="text-gray-600 mt-2 text-sm">{service.description}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                              {service.salePrice && (
                                <p className="text-2xl font-bold text-primary-dark">{formatCurrency(service.salePrice)}</p>
                              )}
                              <p className={`text-xl ${service.salePrice ? 'text-gray-500 line-through' : 'font-bold text-primary-dark'}`}>
                                {formatCurrency(service.price || 0)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-6">
                            <Button asChild size="lg" className="w-full animate-pulse-glow">
                              <Link to={`/services/${service.slug}`}>Book Now</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            )
          )}
        </div>
      </div>
    </>
  );
}

