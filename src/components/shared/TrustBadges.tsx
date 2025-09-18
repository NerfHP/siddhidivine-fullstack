import { ShieldCheck, Zap, Globe, Gem, Truck, Clock, CreditCard } from 'lucide-react';

const trustData = [
    {
        icon: Truck,
        title: 'Free Shipping',
        subtitle: 'Free Shipping all over India.',
    },
    {
        icon: Clock,
        title: '24/7 Support',
        subtitle: 'Available 24 x 7',
    },
    {
        icon: CreditCard,
        title: '100% Secure payments',
        subtitle: 'COD / UPI / CARDS',
    },
    {
        // For the Indian flag, we use a custom SVG component
        icon: () => (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_105_2)">
                    <path d="M0 8C0 3.58172 3.58172 0 8 0H40C44.4183 0 48 3.58172 48 8V40C48 44.4183 44.4183 48 40 48H8C3.58172 48 0 44.4183 0 40V8Z" fill="#F0F0F0"/>
                    <path d="M0 32H48V40C48 44.4183 44.4183 48 40 48H8C3.58172 48 0 44.4183 0 40V32Z" fill="#6DA544"/>
                    <path d="M0 8C0 3.58172 3.58172 0 8 0H40C44.4183 0 48 3.58172 48 8V16H0V8Z" fill="#FF9811"/>
                    <path d="M24 28C26.2091 28 28 26.2091 28 24C28 21.7909 26.2091 20 24 20C21.7909 20 20 21.7909 20 24C20 26.2091 21.7909 28 24 28Z" stroke="#0052B4" strokeWidth="2"/>
                    <path d="M24 24L24 20" stroke="#0052B4" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M24 24L21.8787 25.2225" stroke="#0052B4" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M24 24L20 24" stroke="#0052B4" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M24 24L21.8787 22.7775" stroke="#0052B4" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M24 24L24 28" stroke="#0052B4" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M24 24L26.1213 22.7775" stroke="#0052B4" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M24 24L28 24" stroke="#0052B4" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M24 24L26.1213 25.2225" stroke="#0052B4" strokeWidth="1.5" strokeLinecap="round"/>
                </g>
                <defs><clipPath id="clip0_105_2"><rect width="48" height="48" rx="8" fill="white"/></clipPath></defs>
            </svg>
        ),
        title: 'MADE IN INDIA',
        subtitle: 'Proudly Made in India',
    },
];

export default function TrustBadges() {
    return (
        <div className="bg-background">
            <div className="container mx-auto px-9 py-8">
                {/* THE FIX: Replaced the grid with a more robust flexbox layout.
                    `justify-around` ensures equal spacing between items and at the ends.
                    It stacks vertically on mobile (`flex-col`) and becomes a row on larger screens (`md:flex-row`).
                */}
                <div className="flex flex-col md:flex-row items-center justify-around gap-9 md:gap-4">
                    {trustData.map((badge) => {
                        const Icon = badge.icon;
                        
                        return (
                            <div 
                                key={badge.title} 
                                className="flex flex-row items-center gap-4 text-left"
                            >
                                <Icon className="h-12 w-12 text-gray-500 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-text-main">{badge.title}</h3>
                                    <p className="text-sm text-gray-500">{badge.subtitle}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}


          {/* Trust Signals Section (Unchanged) */}
          <section className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center border-t border-gray-200 pt-16">
                  <div className="flex flex-col items-center">
                      <ShieldCheck size={40} className=" text-primary mb-3" />
                      <h3 className="font-bold text-lg text-text-main">Lab-Certified Purity</h3>
                      <p className="text-sm text-gray-600">Every Rudraksha and gemstone is 100% authentic and certified.</p>
                  </div>
                  <div className="flex flex-col items-center">
                      <Zap size={40} className="text-primary mb-3" />
                      <h3 className="font-bold text-lg text-text-main">Energized & Blessed</h3>
                      <p className="text-sm text-gray-600">Our products are spiritually energized to unlock their full potential.</p>
                  </div>
                  <div className="flex flex-col items-center">
                      <Globe size={40} className="text-primary mb-3" />
                      <h3 className="font-bold text-lg text-text-main">Worldwide Shipping</h3>
                      <p className="text-sm text-gray-600">We deliver spiritual wellness to your doorstep, wherever you are.</p>
                  </div>
                  <div className="flex flex-col items-center">
                      <Gem size={40} className="text-primary mb-3" />
                      <h3 className="font-bold text-lg text-text-main">Authentic Sourcing</h3>
                      <p className="text-sm text-gray-600">Sourced directly from Nepal and Indonesia for the highest quality.</p>
                  </div>
              </div>
          </section>
