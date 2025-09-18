import React, { useRef, useEffect } from 'react';

// --- List of the 24 Hindu Symbol PNGs ---
const SYMBOL_IMAGE_URLS = [
  '/images/symbols/om.png', '/images/symbols/shiv-shakti-star.png', 
  '/images/symbols/asta-lakshmi-star.png', '/images/symbols/bindi.png',
  '/images/symbols/swastika.png', '/images/symbols/trishula.png',
  '/images/symbols/namaste.png', '/images/symbols/diya.png',
  '/images/symbols/lotus.png', '/images/symbols/kalasha.png',
  '/images/symbols/shanka.png', '/images/symbols/kundalini.png',
  '/images/symbols/sri-yantra.png', '/images/symbols/nataraja.png',
  '/images/symbols/kalpavrishka.png', '/images/symbols/tripundra.png',
  '/images/symbols/mudras.png', '/images/symbols/chakras.png',
  '/images/symbols/rudraksha.png', '/images/symbols/trishakti.png',
  '/images/symbols/nandi.png', '/images/symbols/tulsi.png',
  '/images/symbols/kalachakra.png', '/images/symbols/hansa.png',
];

// --- Symbol Class ---
class Symbol {
  x: number; y: number; homeX: number; homeY: number; width: number; height: number;
  image: HTMLImageElement; alpha: number; targetAlpha: number;
  
  constructor(image: HTMLImageElement, initialX: number, initialY: number, isInitiallyVisible: boolean) {
    this.image = image; this.homeX = initialX; this.homeY = initialY; this.x = initialX; this.y = initialY;
    this.alpha = isInitiallyVisible ? 1 : 0; this.targetAlpha = this.alpha;
    const aspectRatio = image.width / image.height;
    this.width = Math.random() * 50 + 80; // Random size
    this.height = this.width / aspectRatio;
  }

  fadeIn() { this.targetAlpha = 1; }
  fadeOut() { this.targetAlpha = 0; }
  
  update(mouseX: number | null, mouseY: number | null) {
    if (Math.abs(this.targetAlpha - this.alpha) > 0.01) { this.alpha += (this.targetAlpha - this.alpha) * 0.02; } 
    else { this.alpha = this.targetAlpha; }
    
    let targetX = this.homeX; let targetY = this.homeY;
    const repelRadius = 200; const maxRepelDist = 40;

    if (mouseX !== null && mouseY !== null) {
      const dx = this.x + this.width / 2 - mouseX; const dy = this.y + this.height / 2 - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if(distance < repelRadius) {
        const force = (repelRadius - distance) / repelRadius;
        const angle = Math.atan2(dy, dx);
        targetX += Math.cos(angle) * force * maxRepelDist;
        targetY += Math.sin(angle) * force * maxRepelDist;
      }
    }
    this.x += (targetX - this.x) * 0.05; this.y += (targetY - this.y) * 0.05;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.shadowBlur = 20;
    ctx.shadowColor = `rgba(220, 38, 38, ${0.7 * this.alpha})`;
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    ctx.restore();
  }
}

// --- The React Component ---
const SymbolBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    let symbols: Symbol[] = [];
    let animationFrameId: number; let swapInterval: number;
    const mouse = { x: null as number | null, y: null as number | null };

    // --- Image Preloading ---
    let loadedImages = 0;
    const images: HTMLImageElement[] = [];
    SYMBOL_IMAGE_URLS.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loadedImages++;
            if (loadedImages === SYMBOL_IMAGE_URLS.length) {
                init(); // Start animation only after all images are loaded
            }
        };
        images.push(img);
    });

    const init = () => {
      const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      const numToCreate = 16;
      let availableImages = [...images].sort(() => 0.5 - Math.random());
      symbols = [];
      const placedPositions: { x: number; y: number; width: number; height: number }[] = [];

      for (let i = 0; i < SYMBOL_IMAGE_URLS.length; i++) {
        const isVisible = i < numToCreate;
        const image = availableImages[i];
        
        let x = 0, y = 0, width = 0, height = 0, overlaps = true, attempts = 0;
        const tempSymbol = new Symbol(image, 0, 0, true);
        width = tempSymbol.width;
        height = tempSymbol.height;

        if (isVisible) {
            while (overlaps && attempts < 100) {
              x = Math.random() * (window.innerWidth - width);
              y = Math.random() * (window.innerHeight - height);
              overlaps = placedPositions.some(p => x < p.x + p.width && x + width > p.x && y < p.y + p.height && y + height > p.y);
              if (!overlaps) break;
              attempts++;
            }
            placedPositions.push({ x, y, width, height });
        } else {
            x = -width * 2; y = -height * 2; // Start hidden ones off-screen
        }
        symbols.push(new Symbol(image, x, y, isVisible));
      }
    };

    const replaceSymbol = () => {
        const visible = symbols.filter(s => s.targetAlpha === 1);
        const hidden = symbols.filter(s => s.targetAlpha === 0);
        if (visible.length > 0 && hidden.length > 0) {
            const toHide = visible[Math.floor(Math.random() * visible.length)];
            const toShow = hidden[Math.floor(Math.random() * hidden.length)];

            // Find a new non-overlapping position for the incoming symbol
            const currentPositions = visible.filter(s => s !== toHide).map(s => ({ x: s.homeX, y: s.homeY, width: s.width, height: s.height }));
            let x = 0, y = 0, width = toShow.width, height = toShow.height, overlaps = true, attempts = 0;
            while (overlaps && attempts < 100) {
              x = Math.random() * (window.innerWidth - width);
              y = Math.random() * (window.innerHeight - height);
              overlaps = currentPositions.some(p => x < p.x + p.width && x + width > p.x && y < p.y + p.height && y + height > p.y);
              if (!overlaps) break;
              attempts++;
            }
            toShow.homeX = x; toShow.homeY = y; toShow.x = x; toShow.y = y;
            
            toHide.fadeOut();
            toShow.fadeIn();
        }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      symbols.forEach(s => { s.update(mouse.x, mouse.y); s.draw(ctx); });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => { init(); };
    const handleMouseMove = (event: MouseEvent) => { mouse.x = event.clientX; mouse.y = event.clientY; };
    const handleMouseOut = () => { mouse.x = null; mouse.y = null; }

    // Start animation only after images are loaded (handled by onload)
    animate();
    swapInterval = setInterval(replaceSymbol, 3000) as unknown as number;

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(swapInterval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, backgroundColor: '#FDFBF5' }} 
    />
  );
};

export default SymbolBackground;

