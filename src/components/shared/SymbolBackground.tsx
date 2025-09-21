import React, { useRef, useEffect, useState } from 'react';

// List of Hindu Symbol PNGs
const SYMBOL_IMAGE_URLS = [
  '/images/symbols/om.png',
  '/images/symbols/shiv-shakti-star.png', 
  '/images/symbols/asta-lakshmi-star.png',
  '/images/symbols/bindi.png',
  '/images/symbols/swastika.png',
  '/images/symbols/trishula.png',
  '/images/symbols/namaste.png',
  '/images/symbols/diya.png',
  '/images/symbols/lotus.png',
  '/images/symbols/kalasha.png',
  '/images/symbols/shanka.png',
  '/images/symbols/kundalini.png',
  '/images/symbols/sri-yantra.png',
  '/images/symbols/nataraja.png',
  '/images/symbols/kalpavrishka.png',
  '/images/symbols/tripundra.png',
  '/images/symbols/mudras.png',
  '/images/symbols/chakras.png',
  '/images/symbols/rudraksha.png',
  '/images/symbols/trishakti.png',
  '/images/symbols/nandi.png',
  '/images/symbols/tulsi.png',
  '/images/symbols/kalachakra.png',
  '/images/symbols/hansa.png',
];

const NUM_SYMBOLS = 8;

class Symbol {
  image: HTMLImageElement;
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  speed: number = 0;
  rotation: number = 0;
  rotationSpeed: number = 0;
  alpha: number = 1;
  canvasWidth: number;
  canvasHeight: number;

  constructor(image: HTMLImageElement, canvasWidth: number, canvasHeight: number) {
    this.image = image;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.reset(true);
  }

  reset(isInitial = false) {
    if (!this.image.complete || this.image.naturalWidth === 0) {
      console.warn('Image not loaded properly:', this.image.src);
      return;
    }

    const aspectRatio = this.image.naturalWidth / this.image.naturalHeight;
    this.width = Math.random() * 30 + 40;
    this.height = this.width / aspectRatio;
    
    this.x = Math.random() * (this.canvasWidth - this.width);
    this.y = isInitial 
      ? Math.random() * this.canvasHeight
      : -this.height;
      
    this.speed = Math.random() * 1 + 0.5;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.01;
    this.alpha = 1;
  }

  updateCanvasSize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  update() {
    this.y += this.speed;
    this.rotation += this.rotationSpeed;

    const fadeZoneStart = this.canvasHeight * 0.75;
    if (this.y > fadeZoneStart) {
      const distanceIntoZone = this.y - fadeZoneStart;
      const fadeZoneHeight = this.canvasHeight - fadeZoneStart;
      this.alpha = Math.max(0, 1 - (distanceIntoZone / fadeZoneHeight));
    } else {
      this.alpha = 1;
    }
    
    if (this.y > this.canvasHeight + this.height) {
      this.reset();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0.01 || !this.image.complete) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    
    ctx.globalAlpha = this.alpha;
    ctx.shadowBlur = 15;
    ctx.shadowColor = `rgba(255, 223, 0, ${0.7 * this.alpha})`;

    try {
      ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    } catch (error) {
      console.error('Error drawing image:', error, this.image.src);
    }
    
    ctx.restore();
  }
}

interface SymbolBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
}

const SymbolBackground: React.FC<SymbolBackgroundProps> = ({ className, style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const symbolsRef = useRef<Symbol[]>([]);
  const animationFrameRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setError('Canvas element not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Could not get canvas context');
      return;
    }

    // Image preloading with better error handling
    let loadedImages = 0;
    let failedImages = 0;
    const images: HTMLImageElement[] = [];
    
    const checkAllImagesLoaded = () => {
      if (loadedImages + failedImages === SYMBOL_IMAGE_URLS.length) {
        if (loadedImages === 0) {
          setError('No images could be loaded. Please check your image paths.');
          setIsLoading(false);
          return;
        }
        
        console.log(`Loaded ${loadedImages}/${SYMBOL_IMAGE_URLS.length} images successfully`);
        setIsLoading(false);
        init();
        animate();
      }
    };

    // Load images
    SYMBOL_IMAGE_URLS.forEach((src, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Handle CORS if needed
      
      img.onload = () => {
        loadedImages++;
        setLoadedCount(loadedImages);
        console.log(`Loaded image ${loadedImages}/${SYMBOL_IMAGE_URLS.length}: ${src}`);
        checkAllImagesLoaded();
      };
      
      img.onerror = (e) => {
        failedImages++;
        console.error(`Failed to load image: ${src}`, e);
        checkAllImagesLoaded();
      };
      
      img.src = src;
      images.push(img);
    });

    const init = () => {
      if (!canvas || !ctx) return;
      
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.scale(dpr, dpr);
      
      // Filter out failed images
      const validImages = images.filter(img => img.complete && img.naturalWidth > 0);
      
      if (validImages.length === 0) {
        setError('No valid images available for animation');
        return;
      }

      symbolsRef.current = [];
      for (let i = 0; i < NUM_SYMBOLS; i++) {
        const randomImage = validImages[Math.floor(Math.random() * validImages.length)];
        const symbol = new Symbol(randomImage, rect.width, rect.height);
        symbolsRef.current.push(symbol);
      }
      
      console.log(`Initialized ${symbolsRef.current.length} symbols`);
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      symbolsRef.current.forEach(symbol => {
        symbol.update();
        symbol.draw(ctx);
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      const rect = canvas?.getBoundingClientRect();
      if (rect) {
        symbolsRef.current.forEach(symbol => {
          symbol.updateCanvasSize(rect.width, rect.height);
        });
        init();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (error) {
    return (
      <div 
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          backgroundColor: '#0F041A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          ...style
        }}
      >
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            backgroundColor: '#0F041A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px'
          }}
        >
          Loading symbols... ({loadedCount}/{SYMBOL_IMAGE_URLS.length})
        </div>
      )}
      <canvas 
        ref={canvasRef}
        className={className}
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: -1, 
          backgroundColor: '#FDFBF5',
          display: isLoading ? 'none' : 'block',
          ...style
        }} 
      />
    </>
  );
};

export default SymbolBackground;