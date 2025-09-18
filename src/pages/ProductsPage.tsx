import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ContentItem } from '@/types';
import Card from '@/components/shared/Card';
import Spinner from '@/components/shared/Spinner';
import Alert from '@/components/shared/Alert';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SEO from '@/components/shared/SEO';
import FilterBar from '@/components/shared/FilterBar';

const fetchAllProducts = async (sortBy: string, availability: string[]) => {
  const params = new URLSearchParams({ sortBy, availability: availability.join(',') });
  const { data } = await api.get(`/content/products?${params.toString()}`);
  return data as ContentItem[];
};

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState('featured');
  const [availability, setAvailability] = useState<string[]>([]);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['allProducts', sortBy, availability],
    queryFn: () => fetchAllProducts(sortBy, availability),
  });

  return (
    <>
      <SEO 
        title="All Products"
        description="Explore our complete collection of spiritual products."
      />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Products' }]} />
        <div className="mt-4 text-center border-b pb-4">
          <h1 className="font-sans text-4xl font-bold">All Products</h1>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">Discover our complete collection of authentic spiritual items, from powerful yantras to healing crystals and traditional malas.</p>
        </div>
        
        <div className="my-8">
          <FilterBar
            sortBy={sortBy as any}
            setSortBy={setSortBy as any}
            availability={availability as any}
            setAvailability={setAvailability}
          />
        </div>

        {isLoading && (
          <div className="flex h-64 items-center justify-center"><Spinner /></div>
        )}

        {error && (
          <div className="mt-8"><Alert type="error" message="Failed to load products. Please try again later." /></div>
        )}

        {products && (
          products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <Card key={product.id} item={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">No products found with the selected filters.</p>
            </div>
          )
        )}
      </div>
    </>
  );
}
