import { Link } from 'react-router-dom';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const imageUrl = category.image || 'https://picsum.photos/600/600';

  return (
    <Link to={`/products/${category.slug}`} className="group relative block overflow-hidden rounded-lg">
      <img
        src={imageUrl}
        alt={category.name}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <h3 className="text-white text-2xl font-bold font-sans text-center p-4">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}