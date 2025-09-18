import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
type AvailabilityOption = 'In Stock' | 'Out of Stock';

interface FilterBarProps {
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  availability: AvailabilityOption[];
  setAvailability: (value: AvailabilityOption[]) => void;
}

export default function FilterBar({ sortBy, setSortBy, availability, setAvailability }: FilterBarProps) {
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const availabilityRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (availabilityRef.current && !availabilityRef.current.contains(event.target as Node)) {
        setIsAvailabilityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [availabilityRef]);

  const handleAvailabilityChange = (option: AvailabilityOption) => {
    const newAvailability = availability.includes(option)
      ? availability.filter(item => item !== option)
      : [...availability, option];
    setAvailability(newAvailability);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center border-t border-b py-4 gap-4">
      {/* Filters on the left */}
      <div className="flex gap-4">
        {/* --- NEW CUSTOM AVAILABILITY DROPDOWN --- */}
        <div className="relative" ref={availabilityRef}>
          <button 
            onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)} 
            className="flex items-center gap-2 border px-4 py-2 rounded-md hover:border-gray-500 transition-colors w-40 justify-between"
          >
            <span>
              Availability 
              {availability.length > 0 && <span className="text-primary font-bold ml-1">({availability.length})</span>}
            </span>
            <ChevronDown size={16} className={`transition-transform ${isAvailabilityOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isAvailabilityOpen && (
            <div className="absolute top-full mt-2 w-56 bg-white border rounded-md shadow-lg z-10 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">{availability.length} selected</span>
                <button onClick={() => setAvailability([])} className="text-sm text-primary hover:underline">Reset</button>
              </div>
              <div className="space-y-2">
                <label htmlFor="in-stock" className="flex items-center cursor-pointer">
                  <input type="checkbox" id="in-stock" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" checked={availability.includes('In Stock')} onChange={() => handleAvailabilityChange('In Stock')} />
                  <span className="ml-2 text-sm">In stock</span>
                </label>
                <label htmlFor="out-of-stock" className="flex items-center cursor-pointer">
                  <input type="checkbox" id="out-of-stock" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" checked={availability.includes('Out of Stock')} onChange={() => handleAvailabilityChange('Out of Stock')} />
                  <span className="ml-2 text-sm">Out of stock</span>
                </label>
              </div>
            </div>
          )}
        </div>
        {/* You can add more filter buttons here, like for 'Price' */}
      </div>

      {/* Sorting on the right */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort-by" className="text-sm font-medium">Sort by:</label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary pr-8"
        >
          <option value="featured">Best selling</option>
          <option value="price-asc">Price, low to high</option>
          <option value="price-desc">Price, high to low</option>
          <option value="name-asc">Alphabetically, A-Z</option>
          <option value="name-desc">Alphabetically, Z-A</option>
        </select>
      </div>
    </div>
  );
}