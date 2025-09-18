import { Link } from 'react-router-dom';
import { ContentItem } from '@/types';
import { ArrowRight } from 'lucide-react';

interface ArticleCardProps {
  article: ContentItem;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const imageUrl = JSON.parse(article.images || '[]')[0] || 'https://picsum.photos/800/600';
  
  return (
    <Link to={`/blog/${article.slug}`} className="group block overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-lg">
      <div className="overflow-hidden">
        <img src={imageUrl} alt={article.name} className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <h3 className="font-sans text-lg font-bold text-text-main group-hover:text-primary transition-colors">{article.name}</h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2 h-10">{article.description}</p>
        <div className="mt-4 flex items-center text-sm font-bold text-primary">
          <span>Read More</span>
          <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}