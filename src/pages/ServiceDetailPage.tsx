import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ContentItem } from '@/types';
import Spinner from '@/components/shared/Spinner';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SEO from '@/components/shared/SEO';
import Button from '@/components/shared/Button';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
// --- 1. IMPORT THE BOOKING MODAL ---
import BookingModal from '@/components/shared/BookingModal';

// This API call is your working version and remains unchanged.
const fetchServiceBySlug = async (slug: string) => {
    const { data } = await api.get(`/content/product/${slug}`);
    return data as ContentItem;
}

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  // --- 2. ADD STATE TO CONTROL THE MODAL ---
  const [isModalOpen, setModalOpen] = useState(false);

  const { data: service, isLoading, isError } = useQuery({
    queryKey: ['serviceDetail', slug],
    queryFn: () => fetchServiceBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Spinner /></div>;
  if (isError || !service) return <Navigate to="/not-found" replace />;
  
  const imageArray: string[] = JSON.parse(service.images || '[]');
  const finalPrice = service.salePrice || service.price || 0;

  return (
    <>
      <SEO title={service.name} description={service.description} imageUrl={imageArray[0]} />
      <div className="bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' }, 
              { label: 'Services', href: '/services' },
              { label: service.name }
            ]} 
          />
          <div className="mt-8 max-w-5xl mx-auto">
            {/* --- 3. UPDATED LAYOUT --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white p-8 rounded-lg shadow-lg border">
              {/* Image Column (with size constraints for a narrower look) */}
              <div className="flex items-center justify-center">
                <img src={imageArray[0]} alt={service.name} className="w-full max-w-sm rounded-lg object-cover aspect-square"/>
              </div>
              
              {/* Details Column */}
              <div className="flex flex-col justify-center">
                <h1 className="font-sans text-4xl font-bold text-text-main">{service.name}</h1>
                <p className="text-lg text-gray-600 mt-2">{service.description}</p>
                 <div className="flex items-baseline gap-3 my-4">
                  <p className="text-3xl font-bold text-primary">{formatCurrency(finalPrice)}</p>
                  {service.salePrice && service.price && <p className="text-xl text-gray-400 line-through">{formatCurrency(service.price)}</p>}
                </div>
                
                {/* --- 4. UPDATED BUTTON LOGIC --- */}
                {/* The "Book Now" button now opens the modal */}
                <Button size="lg" onClick={() => setModalOpen(true)} className="mt-4">Book Now</Button>
                
                {/* --- 5. NEW "DETAILS REQUIRED" SECTION --- */}
                <div className="mt-8 border-t pt-6">
                    <h3 className="font-sans font-bold text-lg text-text-main">Consultation Details Required</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        To provide an accurate reading, we will need the following information:
                    </p>
                    <ul className="space-y-3 mt-4">
                        <li className="flex items-center gap-3">
                            <User size={18} className="text-primary"/>
                            <span className="text-gray-700">Your Full Name</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Calendar size={18} className="text-primary"/>
                            <span className="text-gray-700">Date of Birth</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Clock size={18} className="text-primary"/>
                            <span className="text-gray-700">Time of Birth</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <MapPin size={18} className="text-primary"/>
                            <span className="text-gray-700">Place of Birth</span>
                        </li>
                    </ul>
                </div>
              </div>
            </div>
             {service.content && (
              <div className="prose max-w-none text-gray-700 mt-8">
                <p>{service.content}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* --- 6. RENDER THE MODAL --- */}
      {/* This component is now part of your page, controlled by the `isModalOpen` state */}
      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        serviceName={service.name} 
      />
    </>
  );
}

