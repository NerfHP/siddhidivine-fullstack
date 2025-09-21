import React, { useRef, useEffect, useCallback } from 'react';

const NUM_SYMBOLS = 15; // Further reduced for performance

// Curated spiritual and astrological symbols only
const UNICODE_SYMBOLS = [
  'ॐ', '🕉️', '🪔', '🙏', '☸️', '🌟', '✨', '💫', '🌙', '☀️', '⭐', '🔮'
];

class OptimizedSymbol {
  symbol: string;
  x: number = 0;
  y: number = 0;
  size: number = 0;
  speed: number = 0;
  rotation: number = 0;
  rotationSpeed: number = 0;
  alpha: number = 1;
  color: string;
  canvasWidth: number;
  canvasHeight: number;
  horizontalSpeed: number = 0;
  isVisible: boolean = true;

  constructor(symbol: string, canvasWidth: number, canvasHeight: number) {
    this.symbol = symbol;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.color = `hsl(${Math.random() * 80 + 20}, ${70 + Math.random() * 30}%, ${60 + Math.random() * 20}%)`;
    this.reset(true);
  }

  reset(isInitial = false) {
    this.size = Math.random() * 40 + 20;
    this.x = Math.random() * (this.canvasWidth + 200) - 100;
    
    if (isInitial) {
      this.y = Math.random() * this.canvasHeight;
    } else {
      this.y = -this.size - Math.random() * 300;
    }
    
    this.speed = Math.random() * 2 + 0.5;
    this.horizontalSpeed = (Math.random() - 0.5) * 0.5;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.alpha = 1;
    this.isVisible = true;
  }

  updateCanvasSize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  update() {
    this.y += this.speed;
    this.x += this.horizontalSpeed;
    this.rotation += this.rotationSpeed;

    // Skip expensive calculations if not visible
    this.isVisible = (this.x > -this.size && this.x < this.canvasWidth + this.size && 
                     this.y > -this.size && this.y < this.canvasHeight + this.size);

    if (!this.isVisible && this.y > this.canvasHeight + 100) {
      this.reset();
      return;
    }

    // Simple wrap without complex calculations
    if (this.x > this.canvasWidth + 100) this.x = -100;
    if (this.x < -100) this.x = this.canvasWidth + 100;

    // Simplified fade
    this.alpha = this.y > this.canvasHeight - 50 ? 
      Math.max(0, 1 - ((this.y - (this.canvasHeight - 50)) / 50)) : 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isVisible || this.alpha <= 0.01) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    ctx.globalAlpha = this.alpha;
    // Minimal shadow for better performance
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    
    ctx.fillStyle = this.color;
    ctx.font = `${this.size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, 0, 0);
    
    ctx.restore();
  }
}

interface SymbolBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  symbolCount?: number;
  pauseOnScroll?: boolean;
}

const OptimizedSymbolBackground: React.FC<SymbolBackgroundProps> = ({ 
  className,
  style,
  symbolCount = NUM_SYMBOLS,
  pauseOnScroll = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const symbolsRef = useRef<OptimizedSymbol[]>([]);
  const animationFrameRef = useRef<number>();
  const isScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const lastFrameTimeRef = useRef<number>(0);

  // Performance monitoring
  const fpsRef = useRef<number>(60);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);

  // Throttled scroll handler
  const handleScroll = useCallback(() => {
    if (!pauseOnScroll) return;
    
    isScrollingRef.current = true;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 150);
  }, [pauseOnScroll]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Optimize canvas for performance
    ctx.imageSmoothingEnabled = false;

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;
      
      symbolsRef.current = [];
      const actualSymbolCount = Math.min(symbolCount, 40); // Cap symbols for performance
      
      for (let i = 0; i < actualSymbolCount; i++) {
        const randomSymbol = UNICODE_SYMBOLS[Math.floor(Math.random() * UNICODE_SYMBOLS.length)];
        const symbol = new OptimizedSymbol(randomSymbol, rect.width, rect.height);
        symbolsRef.current.push(symbol);
      }
    };

    const animate = (currentTime: number) => {
      if (!ctx || !canvas) return;

      // Frame rate limiting for smooth scrolling
      const deltaTime = currentTime - lastFrameTimeRef.current;
      const targetFPS = isScrollingRef.current ? 30 : 60;
      const frameInterval = 1000 / targetFPS;

      if (deltaTime < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTimeRef.current = currentTime;

      // FPS monitoring
      frameCountRef.current++;
      if (currentTime - lastFpsUpdateRef.current >= 1000) {
        fpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = currentTime;
      }

      // Adaptive quality based on performance
      const lowPerformance = fpsRef.current < 30;
      const symbolsToUpdate = lowPerformance ? 
        symbolsRef.current.slice(0, Math.floor(symbolsRef.current.length * 0.7)) : 
        symbolsRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Batch operations for better performance
      symbolsToUpdate.forEach(symbol => {
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

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      } else {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    init();
    animationFrameRef.current = requestAnimationFrame(animate);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [symbolCount, handleScroll]);

  return (
    <canvas 
      ref={canvasRef}
      className={className}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: -1, 
        backgroundColor: '#FDFBF5',
        pointerEvents: 'none',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        perspective: 1000,
        ...style
      }} 
    />
  );
};

export default OptimizedSymbolBackground;