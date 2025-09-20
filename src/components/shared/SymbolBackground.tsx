import React, { useRef, useEffect } from 'react';

// --- List of the 24 Hindu Symbol PNGs ---
// These paths assume your 'images' folder is in the 'public' directory of your project.
const SYMBOL_IMAGE_URLS = [
  'images/symbols/om.png', 'images/symbols/shiv-shakti-star.png', 
  'images/symbols/asta-lakshmi-star.png', 'images/symbols/bindi.png',
  'images/symbols/swastika.png', 'images/symbols/trishula.png',
  'images/symbols/namaste.png', 'images/symbols/diya.png',
  'images/symbols/lotus.png', 'images/symbols/kalasha.png',
  'images/symbols/shanka.png', 'images/symbols/kundalini.png',
  'images/symbols/sri-yantra.png', 'images/symbols/nataraja.png',
  'images/symbols/kalpavrishka.png', 'images/symbols/tripundra.png',
  'images/symbols/mudras.png', 'images/symbols/chakras.png',
  'images/symbols/rudraksha.png', 'images/symbols/trishakti.png',
  'images/symbols/nandi.png', 'images/symbols/tulsi.png',
  'images/symbols/kalachakra.png', 'images/symbols/hansa.png',
];

// Number of symbols to have on screen at any given time
const NUM_SYMBOLS = 8;

/**
 * Represents a single falling symbol particle in the animation.
 * It manages its own position, speed, rotation, and appearance.
 */
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
    
    // Set initial random properties. The 'true' flag spreads them across the screen on first load.
    this.reset(true); 
  }

  /**
   * Resets the symbol to the top of the screen with new random properties.
   * This is the core of the infinite loop effect.
   * @param {boolean} isInitial - If true, randomize Y position across the screen. Otherwise, start just above the screen.
   */
  reset(isInitial = false) {
    const aspectRatio = this.image.width / this.image.height;
    this.width = Math.random() * 30 + 40; // Random size between 40px and 70px
    this.height = this.width / aspectRatio;
    
    this.x = Math.random() * this.canvasWidth;
    this.y = isInitial 
      ? Math.random() * this.canvasHeight // Spread symbols vertically on first load
      : -this.height; // Start just above the visible screen on subsequent loops
      
    this.speed = Math.random() * 1 + 0.5; // Random falling speed
    this.rotation = Math.random() * Math.PI * 2; // Random initial angle
    this.rotationSpeed = (Math.random() - 0.5) * 0.01; // Random rotation speed and direction
    this.alpha = 1; // Reset to fully visible
  }

  /**
   * Updates the symbol's state for the current animation frame.
   * Moves it, rotates it, and handles fading.
   */
  update() {
    this.y += this.speed;
    this.rotation += this.rotationSpeed;

    // --- Fading Logic ---
    // Start fading out when the symbol is in the bottom 25% of the screen.
    const fadeZoneStart = this.canvasHeight * 0.75;
    if (this.y > fadeZoneStart) {
      const distanceIntoZone = this.y - fadeZoneStart;
      const fadeZoneHeight = this.canvasHeight - fadeZoneStart;
      this.alpha = 1 - (distanceIntoZone / fadeZoneHeight);
    } else {
      this.alpha = 1;
    }
    
    // If the symbol has moved completely off the bottom, reset it to the top.
    if (this.y > this.canvasHeight + this.height) {
      this.reset();
    }
  }

  /**
   * Draws the symbol onto the canvas context.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0.01) return; // Don't draw if it's practically invisible

    ctx.save();
    // Translate the canvas origin to the center of the symbol for proper rotation
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    
    // Apply opacity and the glowing effect
    ctx.globalAlpha = this.alpha;
    ctx.shadowBlur = 15;
    ctx.shadowColor = `rgba(255, 223, 0, ${0.7 * this.alpha})`; // A warm, golden glow

    // Draw the image centered on the new, rotated origin
    ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.restore();
  }
}

// --- The React Component ---
const SymbolBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use a ref to store the symbols array to prevent re-creation on re-renders
  const symbolsRef = useRef<Symbol[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // --- Image Preloading ---
    let loadedImages = 0;
    const images: HTMLImageElement[] = [];
    SYMBOL_IMAGE_URLS.forEach(src => {
      const img = new Image();
      // FIX: Use a root-relative path. This is the standard way to access files in the 'public' folder.
      img.src = `/${src}`;
      img.onload = () => {
        loadedImages++;
        if (loadedImages === SYMBOL_IMAGE_URLS.length) {
          // Once all images are loaded, initialize the symbols and start the animation
          init();
          animate();
        }
      };
       img.onerror = () => {
        console.error(`Failed to load image: ${img.src}`);
      };
      images.push(img);
    });

    /**
     * Initializes or re-initializes the canvas and symbols. Called on load and on window resize.
     */
    const init = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        symbolsRef.current = []; // Clear any existing symbols
        for (let i = 0; i < NUM_SYMBOLS; i++) {
            // Pick a random image for each of the 8 symbol instances
            const randomImage = images[Math.floor(Math.random() * images.length)];
            symbolsRef.current.push(new Symbol(randomImage, canvas.clientWidth, canvas.clientHeight));
        }
    };

    /**
     * The main animation loop.
     */
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      symbolsRef.current.forEach(s => {
        s.update();
        s.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      init(); // Re-initialize the animation to fit the new screen size
    };

    window.addEventListener('resize', handleResize);

    // --- Cleanup Function ---
    // This runs when the component unmounts to prevent memory leaks
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: -1, 
        backgroundColor: '#0F041A' // A dark background makes the glow effect more vibrant
      }} 
    />
  );
};

export default SymbolBackground;

