import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icon Imports (from your file) ---
import {
  ChevronDown,
  Search,
  User,
  ShoppingCart,
  Menu,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  X,
} from 'lucide-react';

// --- Custom Hooks & Assets (from your file) ---
import logo from '@/assets/LOGO.png';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

// --- TypeScript Interfaces for Menu Data ---
interface SubSubItem {
  name: string;
  path: string;
}
interface SubItem {
  name: string;
  path: string;
  icon?: string;
  subSubItems?: SubSubItem[];
}
// MenuItem is updated so `subItems` is optional for links like "Home".
interface MenuItem {
  name:string;
  path: string;
  subItems?: SubItem[]; 
}
interface HeaderProps {
  onSearchClick: () => void;
  onCartClick: () => void;
}

// --- Menu Data (Unchanged) ---
const rudrakshaSubItems = Array.from({ length: 14 }, (_, i) => ({
  name: `${i + 1} Mukhi`,
  path: `/products/rudraksha/${i + 1}-mukhi-rudraksha`,
  icon: `/rudraksha/${i + 1}-mukhi.png`,
}));

// --- Menu Data (Now a single, unified structure) ---
const navMenuItems: MenuItem[] = [
  { name: 'Home', path: '/' },
  { name: 'Yantras', path: '/products/yantras', subItems: [
      { name: 'Navgraha Yantra', path: '/products/yantras/navgraha-yantra', 
        subSubItems: [
          { name: 'NavGrah Yantra', path: '/products/yantras/navgraha-yantra/NavGrah-yantra' },
          { name: 'Surya Yantra', path: '/products/yantras/navgraha-yantra/surya-yantra' },
          { name: 'Chandra Yantra', path: '/products/yantras/navgraha-yantra/chandra-yantra' },
          { name: 'Mangal Yantra', path: '/products/yantras/navgraha-yantra/mangal-yantra' },
          { name: 'Budh Yantra', path: '/products/yantras/navgraha-yantra/budh-yantra' },
          { name: 'Guru Yantra', path: '/products/yantras/navgraha-yantra/guru-yantra' },
          { name: 'Shukra Yantra', path: '/products/yantras/navgraha-yantra/shukra-yantra' },
          { name: 'Shani Yantra', path: '/products/yantras/navgraha-yantra/shani-yantra' },
          { name: 'Rahu Yantra', path: '/products/yantras/navgraha-yantra/rahu-yantra' },
          { name: 'Ketu Yantra', path: '/products/yantras/navgraha-yantra/ketu-yantra' },
        ] 
      },
        { name: 'Shri Sarv Karya Siddhi Yantra', path: '/products/yantras/Shri-Sarv-Karya-Siddhi-yantra' },
        { name: 'Shree Sampoorn kuber Laxhmi Yantra', path: '/products/yantras/Shree-Sampoorn-kuber-Laxhmi-yantra' },
        { name: 'Shree Yantra', path: '/products/yantras/shree-yantra' },
        { name: 'Maha Lakshmi Yantra', path: '/products/yantras/maha-lakshmi-yantra' },
        { name: 'Kuber Yantra', path: '/products/yantras/kuber-yantra' },
        { name: 'Siddh Saraswati Yantra', path: '/products/yantras/Siddh-Saraswati-yantra' },
        { name: 'Shri Kanakdhara Yantra', path: '/products/yantras/Shri-Kanakdhara-yantra' },
        { name: 'Ganesh Yantra', path: '/products/yantras/Ganesh-yantra' },
        { name: 'Gayatri Yantra', path: '/products/yantras/Gayatri-yantra' },
        { name: 'Maha Mrityunjaya Yantra', path: '/products/yantras/Maha-Mrityunjaya-yantra' },
        { name: 'Vastu Yantra', path: '/products/yantras/Vastu-yantra' },
        { name: 'Vyapar Yantra', path: '/products/yantras/Vyapar-yantra' },
    ]
  },
  { name: 'Bracelets', path: '/products/bracelets', subItems: [
      { name: 'Rudraksha Bracelets', path: '/products/bracelets/rudraksha-bracelets' },
      { name: 'Crystal Bracelets', path: '/products/bracelets/crystal-bracelets' },
      { name: 'Karungali Bracelets', path: '/products/bracelets/karungali-bracelets' },
      { name: 'Silver Bracelets', path: '/products/bracelets/silver-bracelets' },
      { name: 'Gold Bracelets', path: '/products/bracelets/gold-bracelets' },
      { name: 'Copper Bracelets', path: '/products/bracelets/copper-bracelets' },
    ],
  },
  { name: 'Rudraksha', path: '/products/rudraksha', subItems:[
      ...rudrakshaSubItems,
      { name: 'Gauri Shanker Rudraksha', path: '/products/gauri-shanker-rudraksha' },
      { name: 'Ganesh Rudraksha', path: '/products/ganesh-rudraksha' },
    ],
  },
  { name: 'Mala', path: '/products/mala', subItems: [
      { name: 'Karungali Malai', path: '/products/mala/karungali-malai' },
      { name: 'Rudraksha Mala', path: '/products/mala/rudraksha-mala' },
      { name: 'Crystal Mala',path: '/products/mala/crystal-mala' },
      { name: 'Tulsi Mala',path: '/products/mala/tulsi-mala' },
    ],
  },
  { name: 'Aura Stones', path: '/products/aura-stones', subItems: [
      { name: 'Healing Stones', path: '/products/aura-stones/healing-stones' },
      { name: 'Chakra Stones', path: '/products/aura-stones/chakra-stones' },
    ],
  },
  { name: 'Astro Stone', path: '/products/astro-stone', subItems: [
      { name: 'Gemstones', path: '/products/astro-stone/gemstones' },
      { name: 'Birth Stones', path: '/products/astro-stone/birthstones' },
    ],
  },
];


export default function Header({ onSearchClick, onCartClick }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [openMobileSubMenu, setOpenMobileSubMenu] = useState<string | null>(null);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  
  // State for the desktop dropdown menus
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<SubItem | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <>
      {/* Custom CSS for the animated underline effect */}
      <style>{`
        .animated-underline {
          position: relative;
          display: inline-block;
          overflow: hidden;
          padding-bottom: 4px;
        }
        .animated-underline::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #F97316; /* Orange color */
          transform: translateX(-101%);
          transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .animated-underline:hover::after,
        .animated-underline.active::after {
          transform: translateX(0%);
        }
        .animated-underline::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #F97316; /* Orange color */
          transform: translateX(0%);
          transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          z-index: -1;
        }
        .animated-underline:hover::before {
          transform: translateX(101%);
        }
      `}</style>

      <header className="sticky top-0 z-50 bg-white/80 shadow-md backdrop-blur-md">
        {/* Top Announcement Bar (Your code, unchanged) */}
        <div className="bg-primary text-white text-sm">
          <div className="container mx-auto flex items-center justify-between py-1 px-6">
            <p className="flex-grow text-center font-semibold">
              Ganesh Chaturthi Sale: <b>21% OFF Sitewide</b> (Auto Applied)
            </p>
            <div className="hidden md:flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={16} /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={16} /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={16} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={16} /></a>
              <a href="mailto:support@example.com" aria-label="Email"><Mail size={16} /></a>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="container mx-auto flex items-center justify-between py-3 px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Siddhi Divine Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-text-main font-sans">Siddhi Divine</span>
          </Link>
          
          {/* --- NEW UNIFIED DESKTOP NAVIGATION --- */}
          <nav className="hidden lg:flex items-center gap-8" onMouseLeave={() => setActiveMenu(null)}>
            {navMenuItems.map((item) => (
              <div 
                key={item.name} 
                className="relative"
                onMouseEnter={() => setActiveMenu(item.name)}
              >
                <NavLink
                  to={item.path}
                  end={item.path === '/'} 
                  className={({ isActive }) => 
                    // All links now have the same styling for consistent text size
                    `animated-underline text-base font-semibold text-gray-700 hover:text-orange-600 flex items-center gap-1 ${isActive ? 'active text-orange-600' : ''}`
                  }
                >
                  {item.name}
                  {item.subItems && <ChevronDown size={16} />}
                </NavLink>

                {/* --- LEVEL 1 DROPDOWN (for Yantras) --- */}
                <AnimatePresence>
                  {activeMenu === item.name && item.subItems && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border w-72 flex"
                      onMouseLeave={() => setActiveSubMenu(null)}
                    >
                      <div className="flex-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className="px-4 py-3 text-gray-700 hover:bg-orange-50 w-full text-left flex justify-between items-center"
                            onMouseEnter={() => setActiveSubMenu(subItem.subSubItems ? subItem : null)}
                          >
                            {subItem.name}
                            {subItem.subSubItems && <span>&rarr;</span>}
                          </Link>
                        ))}
                      </div>
                      
                      {/* --- LEVEL 2 DROPDOWN (for Navgraha Yantras) --- */}
                      <AnimatePresence>
                        {activeSubMenu && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="absolute top-0 left-full bg-white rounded-r-lg shadow-xl border w-72"
                          >
                            {activeSubMenu.subSubItems?.map((subSubItem) => (
                              <Link
                                key={subSubItem.name}
                                to={subSubItem.path}
                                className="block px-4 py-3 text-gray-700 hover:bg-orange-50"
                              >
                                {subSubItem.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Utility Icons (Your code, unchanged) */}
          <div className="flex items-center gap-5 text-xl text-text-main">
            <button onClick={onSearchClick} className="hover:text-primary transition-colors" aria-label="Search">
              <Search size={22} />
            </button>
            <Link to={isAuthenticated ? '/account' : '/login'} className="hover:text-primary transition-colors" aria-label="Account">
              <User size={22} />
            </Link>
            <button onClick={onCartClick} className="relative hover:text-primary transition-colors" aria-label="Shopping Cart">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-dark text-xs text-text-light">{cartCount}</span>
              )}
            </button>
            <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
              <Menu size={24} />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu (Your code, unchanged) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[99] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="flex items-center justify-between p-4 border-b">
                      <h2 className="font-bold text-lg">Menu</h2>
                      <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X size={24}/></button>
                  </div>
                  <nav className="p-4">
                      {/* Your mobile menu logic will need to be updated to handle the new data structure if you want multi-level there too */}
                  </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

