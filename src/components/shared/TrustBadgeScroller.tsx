import React from 'react';
import { ShieldCheck, Zap, Globe, Gem, Truck, Clock, CreditCard, RefreshCw, Leaf } from 'lucide-react';

// --- A reusable type for our trust badges ---
type TrustBadge = {
  icon: React.ElementType;
  title: string;
  subtitle: string;
};

// --- Configuration with Titles and Subtitles ---
const TRUST_DATA_ROW_1: TrustBadge[] = [
    { icon: ShieldCheck, title: "Lab-Certified Purity", subtitle: "100% authentic & certified" },
    { icon: Zap, title: "Energized & Blessed", subtitle: "Unlocking full potential" },
    { icon: Globe, title: "Worldwide Shipping", subtitle: "Delivered to your doorstep" },
    { icon: Gem, title: "Authentic Sourcing", subtitle: "From Nepal & Indonesia" },
    { icon: RefreshCw, title: "Easy Returns", subtitle: "Hassle-free process" },
];

const TRUST_DATA_ROW_2: TrustBadge[] = [
    { icon: Truck, title: 'Free Shipping', subtitle: 'On all orders over ₹1000' },
    { icon: Clock, title: '24/7 Support', subtitle: 'We are here to help' },
    { icon: CreditCard, title: '100% Secure Payments', subtitle: 'UPI / Cards / Wallets' },
    { icon: () => ( // Custom SVG for the Indian flag
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      title: 'Proudly Made in India',
      subtitle: 'Supporting local artisans'
    },
    {
      icon: Leaf,
      title: 'Ethical Sourcing',
      subtitle: 'Respect for nature & people'
    }
];
// --------------------

const Scroller = ({ badges, direction = 'left' }: { badges: TrustBadge[], direction?: 'left' | 'right' }) => {
    const extendedBadges = [...badges, ...badges];

    return (
        <div className="w-full overflow-hidden">
            <div className={`flex items-center animate-scroll-${direction}`}>
                {extendedBadges.map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                        <div key={index} className="flex-shrink-0 w-1/4 flex items-center justify-center gap-4 p-4">
                            <Icon className="w-10 h-10 text-yellow-600 flex-shrink-0" />
                            <div className="text-left">
                                <h3 className="text-base font-bold text-gray-800 whitespace-nowrap">{badge.title}</h3>
                                <p className="text-sm text-gray-500 whitespace-nowrap">{badge.subtitle}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default function TrustBadgeScroller() {
    return (
        <section className="bg-gray-50 py-16 sm:py-0 border-y">
            <style>
                {`
                    @keyframes scroll-left {
                        0% { transform: translateX(0%); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-scroll-left {
                        animation: scroll-left 60s linear infinite;
                    }
                    
                    @keyframes scroll-right {
                        0% { transform: translateX(-50%); }
                        100% { transform: translateX(0%); }
                    }
                    .animate-scroll-right {
                        animation: scroll-right 60s linear infinite;
                    }
                `}
            </style>
            <div className="relative flex flex-col gap-6">
                <Scroller badges={TRUST_DATA_ROW_1} direction="left" />
                <Scroller badges={TRUST_DATA_ROW_2} direction="right" />
            </div>
        </section>
    );
}

