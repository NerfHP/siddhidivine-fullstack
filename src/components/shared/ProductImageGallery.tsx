import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  // State to track the currently displayed image index
  const [currentIndex, setCurrentIndex] = useState(0);
  // State to control the lightbox (enlarged view)
  const [isLightboxOpen, setLightboxOpen] = useState(false);

  // --- Navigation Functions ---
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // --- Autoplay Logic ---
  useEffect(() => {
    // Start an interval to change the image every 5 seconds (5000 milliseconds)
    const timer = setInterval(() => {
      goToNext();
    }, 5000);

    // This is a cleanup function that runs when the component is removed.
    // It's crucial to clear the interval to prevent memory leaks.
    return () => {
      clearInterval(timer);
    };
  }, [currentIndex]); // The effect re-runs if the index changes, resetting the timer

  // --- Handlers for Lightbox ---
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Main Image Display */}
      <div className="relative border bg-white rounded-lg p-4 shadow-sm aspect-square">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${productName} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover rounded-md cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => openLightbox(currentIndex)}
          />
        </AnimatePresence>

        {/* Navigation Arrows for Main Carousel */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md transition"
              aria-label="Previous Image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md transition"
              aria-label="Next Image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto p-1">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-20 h-20 flex-shrink-0 rounded-md border-2 transition',
                currentIndex === index ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover rounded" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal for Enlarged View */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={closeLightbox}
          >
            <div className="relative w-full h-full max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                 <motion.img
                    key={currentIndex}
                    src={images[currentIndex]}
                    alt={`${productName} - Image ${currentIndex + 1}`}
                    className="w-full h-full object-contain"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                 />
              </AnimatePresence>

              {/* Close Button for Lightbox */}
              <button
                onClick={closeLightbox}
                className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition"
                aria-label="Close"
              >
                <X size={28} />
              </button>

              {/* Navigation Arrows for Lightbox */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition"
                    aria-label="Next Image"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
