// In client/src/pages/CategoryPage.tsx

import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ContentItem, Category } from '@/types'; 
import Card from '@/components/shared/Card';
import Spinner from '@/components/shared/Spinner';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SEO from '@/components/shared/SEO';
import FilterBar from '@/components/shared/FilterBar';

// This page now only expects a clear, simple category response.
interface CategoryResponse {
  category: Category;
  items: ContentItem[];
  breadcrumbs: Category[];
}

// We use a dedicated API endpoint just for category data.
const fetchCategoryData = async (path: string, sortBy: string, availability: string[]) => {
  const params = new URLSearchParams({ sortBy, availability: availability.join(',') });
  const { data } = await api.get(`/content/category-data/${path}?${params.toString()}`);
  return data as CategoryResponse;
};

export default function CategoryPage() {
  const params = useParams();
  // The '*' captures the full category path, e.g., "yantras/navgraha-yantra"
  const categoryPath = params['*'];

  const [sortBy, setSortBy] = useState('featured');
  const [availability, setAvailability] = useState<string[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['categoryPage', categoryPath, sortBy, availability],
    queryFn: () => fetchCategoryData(categoryPath!, sortBy, availability),
    enabled: !!categoryPath,
  });

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Spinner /></div>;
  if (error) return <Navigate to="/not-found" replace />;
  if (!data) return null;

  // NO MORE CONDITIONAL LOGIC! This component is now simple and error-free.
  const { category, items, breadcrumbs } = data;

  // This breadcrumb logic is now reliable.
  const breadcrumbItems = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      ...breadcrumbs.map((bc, index) => {
          const path = breadcrumbs.slice(0, index + 1).map(p => p.slug).join('/');
          return { label: bc.name, href: `/products/${path}` };
      }), 
  ];

  return (
    <>
      <SEO title={category.name} description={category.description || `Browse our collection of ${category.name}.`} />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mt-4 text-center border-b pb-4">
            <h1 className="font-sans text-4xl font-bold">{category.name}</h1>
            {category.description && <p className="mt-2 text-gray-600 max-w-2xl mx-auto">{category.description}</p>}
        </div>
        
        <FilterBar
          sortBy={sortBy as any}
          setSortBy={setSortBy as any}
          availability={availability as any}
          setAvailability={setAvailability}
        />
        {items.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => <Card key={item.id} item={item} />)}
          </div>
        ) : (
          <p className="mt-8 text-center text-gray-500">No products found in this category.</p>
        )}
      </div>
    </>
  );
}

