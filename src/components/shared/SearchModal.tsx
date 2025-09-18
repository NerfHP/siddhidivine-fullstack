import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, LoaderCircle, CornerUpLeft } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { ContentItem } from '@/types';

// Helper to get the first image safely
const getFirstImage = (imagesJson: string | null | undefined): string => {
  try {
    if (!imagesJson) return 'https://placehold.co/100x100/FDFBF5/E2E8F0?text=...';
    const images = JSON.parse(imagesJson);
    return images[0] || 'https://placehold.co/100x100/FDFBF5/E2E8F0?text=...';
  } catch (e) {
    return 'https://placehold.co/100x100/FDFBF5/E2E8F0?text=...';
  }
};

// Result item component with highlighting
const SearchResultItem = ({ item, query, isHighlighted, onClick }: { item: ContentItem, query: string, isHighlighted: boolean, onClick: () => void }) => {
    const highlightMatch = (text: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <span key={i} className="text-red-500">{part}</span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const path = item.type === 'PRODUCT' ? `/product/${item.slug}` : `/blog/${item.slug}`;

    return (
        <Link to={path} onClick={onClick} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${isHighlighted ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
            <img src={getFirstImage(item.images)} alt={item.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
            <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">{highlightMatch(item.name)}</p>
                <p className="text-xs text-gray-500 truncate">{highlightMatch(item.description)}</p>
            </div>
        </Link>
    );
};

// Main Search Modal
export default function SearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { query, setQuery, results, isLoading } = useSearch();
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();

  useEffect(() => {
    // Reset search when modal opens/closes
    setQuery('');
    setActiveIndex(-1);
  }, [isOpen, setQuery]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev === results.length - 1 ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex > -1) {
        e.preventDefault();
        const item = results[activeIndex];
        const path = item.type === 'PRODUCT' ? `/product/${item.slug}` : `/blog/${item.slug}`;
        navigate(path);
        onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-[99] pt-16 md:pt-24"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center border-b border-gray-200">
              <Search className="h-5 w-5 text-gray-400 mx-4" />
              <input
                type="text"
                placeholder="Search for products, articles, and more..."
                className="w-full py-4 text-base focus:outline-none"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {isLoading && <LoaderCircle className="h-5 w-5 text-gray-400 mx-4 animate-spin" />}
            </div>
            
            <div className="p-2 max-h-[60vh] overflow-y-auto">
                {results && results.length > 0 && (
                    <div className="space-y-1">
                        {results.map((item, index) => (
                            <SearchResultItem key={item.id} item={item} query={query} isHighlighted={index === activeIndex} onClick={onClose} />
                        ))}
                    </div>
                )}
                {query && !isLoading && results?.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No results found for "{query}"</p>
                )}
                {!query && !isLoading && (
                    <p className="text-center text-gray-500 py-8">Start typing to find what you're looking for.</p>
                )}
            </div>
            
            <div className="bg-gray-50 text-xs text-gray-500 p-2 rounded-b-lg flex items-center justify-between">
                <span>Navigate with <kbd className="font-sans font-semibold">↑</kbd> <kbd className="font-sans font-semibold">↓</kbd></span>
                <span>Select with <CornerUpLeft className="inline h-3 w-3" /></span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
