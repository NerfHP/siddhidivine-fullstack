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
interface MenuItem {
  name:string;
  path: string;
  subItems?: SubItem[]; 
}
interface HeaderProps {
  onSearchClick: () => void;
  onCartClick: () => void;
}

// --- Menu Data (Unchanged from your version) ---
const rudrakshaSubItems = Array.from({ length: 14 }, (_, i) => ({
  name: `${i + 1} Mukhi`,
  path: `/products/rudraksha/${i + 1}-mukhi-rudraksha`,
  icon: `/rudraksha/${i + 1}-mukhi.png`,
}));

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

// --- NEW SPECIALIZED DROPDOWN FOR RUDRAKSHA ---
const RudrakshaDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  // This logic splits your items into two columns, just like your old code
  const half = Math.ceil((rudrakshaSubItems.length + 2) / 2); // +2 for Gauri Shankar & Ganesh
  const allRudrakshaItems = [
      ...rudrakshaSubItems,
      { name: 'Gauri Shanker Rudraksha', path: '/products/gauri-shanker-rudraksha', icon: '/rudraksha/gauri-shanker.png' },
      { name: 'Ganesh Rudraksha', path: '/products/ganesh-rudraksha', icon: '/rudraksha/ganesh.png' },
  ];
  const firstColumn = allRudrakshaItems.slice(0, half);
  const secondColumn = allRudrakshaItems.slice(half);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <NavLink
        to="/products/rudraksha"
        className={({ isActive }) => 
          `text-base font-semibold text-gray-700 hover:text-orange-600 flex items-center gap-1.5 transition-colors ${isActive ? 'text-orange-600' : ''}`
        }
      >
        Rudraksha
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} />
        </motion.div>
      </NavLink>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border p-4"
            style={{ width: '32rem' }} // A wider dropdown for the two-column layout
          >
            <div className="grid grid-cols-2 gap-x-6">
              {/* First Column */}
              <div className="space-y-1">
                {firstColumn.map((subItem) => (
                  <Link
                    key={subItem.name}
                    to={subItem.path}
                    className="text-glow flex items-center gap-3 p-2 rounded-md text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  >
                    <img src={subItem.icon} alt={subItem.name} className="w-8 h-8 object-contain" />
                    <span>{subItem.name}</span>
                  </Link>
                ))}
              </div>
              {/* Second Column */}
              <div className="space-y-1">
                {secondColumn.map((subItem) => (
                  <Link
                    key={subItem.name}
                    to={subItem.path}
                    className="text-glow flex items-center gap-3 p-2 rounded-md text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  >
                    <img src={subItem.icon} alt={subItem.name} className="w-8 h-8 object-contain" />
                    <span>{subItem.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
      {/* --- NEW: CUSTOM CSS FOR TEXT GLOW EFFECT --- */}
      <style>{`
        .text-glow {
          transition: text-shadow 0.3s ease-in-out;
        }
        .text-glow:hover {
          text-shadow: 0 0 8px rgba(249, 115, 22, 0.7); /* Orange glow */
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
          
          <nav className="hidden lg:flex items-center gap-8" onMouseLeave={() => setActiveMenu(null)}>
            {navMenuItems.map((item) => {
              // THIS IS THE KEY LOGIC
              // If the item is "Rudraksha", we render our special component.
              if (item.name === 'Rudraksha') {
                return <RudrakshaDropdown key={item.name} />;
              }

              // Otherwise, we render the normal navigation link and dropdown.
              return (
                <div 
                  key={item.name} 
                  className="relative"
                  onMouseEnter={() => setActiveMenu(item.name)}
                >
                  <NavLink
                    to={item.path}
                    end={item.path === '/'} 
                    className={({ isActive }) => 
                      `text-base font-semibold text-gray-700 hover:text-orange-600 flex items-center gap-1.5 transition-colors ${isActive ? 'text-orange-600' : ''}`
                    }
                  >
                    {item.name}
                    {item.subItems && (
                      <motion.div
                        animate={{ rotate: activeMenu === item.name ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    )}
                  </NavLink>

                  {/* --- LEVEL 1 DROPDOWN (for Yantras, etc.) --- */}
                  <AnimatePresence>
                    {activeMenu === item.name && item.subItems && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, pointerEvents: 'none' }}
                        animate={{ opacity: 1, y: 0, pointerEvents: 'auto' }}
                        exit={{ opacity: 0, y: 10, pointerEvents: 'none' }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border w-72 flex"
                        onMouseLeave={() => setActiveSubMenu(null)}
                      >
                        <div className="flex-1 py-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.path}
                              className="text-glow px-4 py-2 text-gray-700 hover:text-orange-600 w-full text-left flex justify-between items-center"
                              onMouseEnter={() => setActiveSubMenu(subItem.subSubItems ? subItem : null)}
                            >
                              {subItem.name}
                              {subItem.subSubItems && <span className="text-xs">&rarr;</span>}
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
                              transition={{ duration: 0.2 }}
                              className="absolute top-0 left-full bg-white rounded-r-lg shadow-xl border w-72 py-1"
                            >
                              {activeSubMenu.subSubItems?.map((subSubItem) => (
                                <Link
                                  key={subSubItem.name}
                                  to={subSubItem.path}
                                  className="text-glow block px-4 py-2 text-gray-700 hover:text-orange-600"
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
              );
            })}
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
        
        {/* Mobile Menu (Your code, now updated for multi-level) */}
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
                className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                      <h2 className="font-bold text-lg">Menu</h2>
                      <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X size={24}/></button>
                  </div>
                  <nav className="p-4">
                      <NavLink to="/" className={({isActive}) => `block py-2 px-3 rounded-md ${isActive ? 'bg-background font-bold' : ''}`}>Home</NavLink>
                      {navMenuItems.slice(1).map(item => ( // Slice to exclude Home, which is already there
                          <div key={item.name} className="border-b">
                              <div
                                  onClick={() => setOpenMobileSubMenu(openMobileSubMenu === item.name ? null : item.name)}
                                  className="flex items-center justify-between py-2 px-3"
                              >
                                  <Link to={item.path} className="-ml-3 p-3 flex-grow">{item.name}</Link>
                                  {item.subItems && item.subItems.length > 0 && <ChevronDown size={20} className={`transition-transform ${openMobileSubMenu === item.name ? 'rotate-180' : ''}`} />}
                              </div>
                              <AnimatePresence>
                                {openMobileSubMenu === item.name && item.subItems && item.subItems.length > 0 && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="pl-4 overflow-hidden"
                                    >
                                        {item.subItems.map(subItem => (
                                          // Here you could add another level of dropdown for mobile if desired
                                          <NavLink key={subItem.name} to={subItem.path} className={({isActive}) => `block py-2 px-3 rounded-md text-sm ${isActive ? 'bg-background font-bold' : ''}`}>
                                              {subItem.name}
                                          </NavLink>
                                        ))}
                                    </motion.div>
                                )}
                              </AnimatePresence>
                          </div>
                      ))}
                  </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

