import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ContentItem } from '@/types';
import Card from '@/components/shared/Card';
import Spinner from '@/components/shared/Spinner';
import Alert from '@/components/shared/Alert';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SEO from '@/components/shared/SEO';

const fetchBestsellers = async () => {
  // THE FIX: This now uses the correct API path, just like your working HomePage.
  const { data } = await api.get('/content/bestsellers');
  return data as ContentItem[];
};

export default function BestsellersPage() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['bestsellersPage'],
    queryFn: fetchBestsellers,
  });

  return (
    <>
      <SEO 
        title="Best Sellers"
        description="Explore our most popular and highly-rated spiritual products, loved by our community."
      />
      <div className="bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Best Sellers' }]} />
          <div className="mt-4 text-center border-b pb-4">
            <h1 className="font-sans text-4xl font-bold text-text-main">Best Sellers</h1>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">Discover the spiritual items most cherished by the Siddhi Divine community.</p>
          </div>
          
          <div className="my-8">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center"><Spinner /></div>
            ) : error ? (
              <Alert type="error" message="Failed to load best sellers. Please try again." />
            ) : (
              products && products.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <Card key={product.id} item={product} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-16">No best selling products found at the moment.</p>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}

