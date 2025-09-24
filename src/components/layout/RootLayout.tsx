import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '../shared/CartDrawer';
import { ReactLenis } from '@studio-freight/react-lenis'; 
import ParticleBackground from '../shared/ParticleBackground';
import SearchModal from '../shared/SearchModal'; // Using the correct import path for the new modal
import WhatsAppPopup from '@/components/shared/WhatsAppPopup';

export default function RootLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <ReactLenis root options={{ lerp: 0.08 }}>
      <div className="relative min-h-screen bg-transparent">
        {/* Your animated background remains behind everything */}
        <ParticleBackground />

        {/* Your main content wrapper */}
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header
            onSearchClick={() => setIsSearchOpen(true)}
            onCartClick={() => setIsCartOpen(true)}
          />
          <main className="flex-grow">
            <Outlet />
          </main>
          <Footer />
          <WhatsAppPopup phoneNumber="918433180979" />
        </div>

        {/* The old search modal UI has been completely replaced with our new, powerful component */}
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        
        {/* Your existing CartDrawer remains unchanged */}
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </ReactLenis>
  );
}

