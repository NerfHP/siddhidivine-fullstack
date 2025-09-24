import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import { useCart } from '@/hooks/useCart';
import logo from '@/assets/LOGO.png';


// --- Icon Imports (from your file) ---
import {
  ChevronDown, Search, User, ShoppingCart, Menu, Facebook,
  Instagram, Youtube, Linkedin, Mail, X,
} from 'lucide-react';

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

// --- Menu Data ---
// Helper to generate 1-14 Mukhi Rudraksha items with local images
const rudrakshaSubItems = Array.from({ length: 21 }, (_, i) => ({
  name: `${i + 1} Mukhi`,
  path: `/products/rudraksha/${i + 1}-mukhi-rudraksha`,
  icon: `/rudraksha/${i + 1}-mukhi.png`,
}));

const navMenuItems: MenuItem[] = [
  { name: 'Home', path: '/' },
  { name: 'Yantras', path: '/products/yantras', subItems: [
      { name: 'Navgraha Yantra', path: '/products/yantras/navgraha-yantra',
        subSubItems: [
          { name: 'NavGrah Yantra', path: '/products/yantras/navgraha-yantra/navgrah-yantra' },
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
    ],
  },
  { name: 'Rudraksha', path: '/products/rudraksha' /* Sub-items handled by custom dropdown */ },
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
  { name: 'Gemstones', path: '/products/gemstones', subItems: [
      { name: 'Ruby (Manikya)', path: '/products/gemstones/ruby' },
      { name: 'Pearl (Moti)', path: '/products/gemstones/pearl' },
      { name: 'Red Coral (Moonga)', path: '/products/gemstones/red-coral' },
      { name: 'Emerald (Panna)', path: '/products/gemstones/emerald' },
      { name: 'Yellow Sapphire (Pukhraj)', path: '/products/gemstones/yellow-sapphire' },
      { name: 'Diamond (Heera)', path: '/products/gemstones/diamond' },
      { name: 'Blue Sapphire (Neelam)', path: '/products/gemstones/blue-sapphire' },
      { name: 'Hessonite (Gomedh)', path: '/products/gemstones/hessonite' },
      { name: 'Cat,s Eye (Lehsunia)', path: '/products/gemstones/cat-eye' },
    ],
  },
];

// --- Rudraksha Dropdown Component (Updated) ---
const RudrakshaDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const mukhiItems = rudrakshaSubItems; // 1-14 Mukhi
  const specialItems = [
    { name: 'Gauri Shankar Rudraksha', path: '/products/gauri-shankar-rudraksha', icon: '/rudraksha/gauri-shankar.png' },
    { name: 'Garbh Gauri Rudraksha', path: '/products/garbh-gauri-rudraksha', icon: '/rudraksha/ganesh-gauri.png' },
    { name: 'Ganesh Rudraksha', path: '/products/ganesh-rudraksha', icon: '/rudraksha/ganesh.png' },
  ];

  // Split Mukhi items into two columns for the grid
  const half = Math.ceil(mukhiItems.length / 2);
  const firstMukhiColumn = mukhiItems.slice(0, half);
  const secondMukhiColumn = mukhiItems.slice(half);


  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <NavLink
        to="/products/rudraksha"
        className={({ isActive }) =>
          `text-base font-semibold text-gray-700 hover:text-orange-600 flex items-center gap-1.5 transition-colors duration-300 py-4 ${isActive ? 'text-orange-600' : ''}`
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
            className="absolute top-full left-0 -ml-4 mt-0 bg-white rounded-lg shadow-xl border w-max"
          >
            <div className="p-4">
                <h3 className="px-2 pb-2 text-sm font-bold text-gray-500 uppercase tracking-wider">Mukhi Rudraksha</h3>
                <div className="grid grid-cols-2 gap-x-6">
                  {/* First Column */}
                  <div className="space-y-1">
                    {firstMukhiColumn.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className="text-glow flex items-center gap-3 p-2 rounded-md text-gray-700 hover:text-orange-600 hover:bg-orange-50 whitespace-nowrap"
                      >
                        <img src={subItem.icon} alt={subItem.name} className="w-8 h-8 object-contain" />
                        <span>{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                  {/* Second Column */}
                  <div className="space-y-1">
                    {secondMukhiColumn.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className="text-glow flex items-center gap-3 p-2 rounded-md text-gray-700 hover:text-orange-600 hover:bg-orange-50 whitespace-nowrap"
                      >
                        <img src={subItem.icon} alt={subItem.name} className="w-8 h-8 object-contain" />
                        <span>{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <hr className="my-3"/>

                <h3 className="px-2 pb-2 text-sm font-bold text-gray-500 uppercase tracking-wider">More Rudraksha</h3>
                 <div className="space-y-1">
                    {specialItems.map((subItem) => (
                        <Link
                            key={subItem.name}
                            to={subItem.path}
                            className="text-glow flex items-center gap-3 p-2 rounded-md text-gray-700 hover:text-orange-600 hover:bg-orange-50 whitespace-nowrap"
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


// --- Main Header Component (Updated) ---
export default function Header({ onSearchClick = () => {}, onCartClick = () => {} }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [openMobileSubMenu, setOpenMobileSubMenu] = useState<string | null>(null);
  const location = useLocation();
  
  const { cartCount } = useCart();

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
      <style>{`
        .text-glow {
          transition: text-shadow 0.3s ease-in-out;
        }
        .text-glow:hover {
          text-shadow: 0 0 8px rgba(249, 115, 22, 0.7);
        }
      `}</style>

      <header className="sticky top-0 z-50 bg-white/80 shadow-md backdrop-blur-md">
        {/* Top Announcement Bar */}
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
        <div className="container mx-auto flex items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Siddhi Divine Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-text-main font-sans">Siddhi Divine</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8" onMouseLeave={() => {setActiveMenu(null); setActiveSubMenu(null)}}>
            {navMenuItems.map((item) => {
              // Render special Rudraksha dropdown
              if (item.name === 'Rudraksha') {
                return <RudrakshaDropdown key={item.name} />;
              }
              // Render standard nav items
              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => { setActiveMenu(item.name); setActiveSubMenu(null); }}
                >
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `text-base font-semibold text-gray-700 hover:text-orange-600 flex items-center gap-1.5 transition-colors duration-300 py-4 ${isActive ? 'text-orange-600' : ''}`
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

                  {/* --- LEVEL 1 DROPDOWN (Yantras, etc.) --- */}
                  <AnimatePresence>
                    {activeMenu === item.name && item.subItems && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 -ml-4 mt-0 bg-white rounded-lg shadow-xl border w-max flex"
                        onMouseLeave={() => setActiveSubMenu(null)}
                      >
                        <div className="p-2">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.path}
                              className="text-glow px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md w-full text-left flex justify-between items-center whitespace-nowrap"
                              onMouseEnter={() => setActiveSubMenu(subItem.subSubItems ? subItem : null)}
                            >
                              {subItem.name}
                              {subItem.subSubItems && <ChevronDown size={12} className="-rotate-90" />}
                            </Link>
                          ))}
                        </div>

                        {/* --- LEVEL 2 DROPDOWN (Navgraha Yantras) --- */}
                        <AnimatePresence>
                          {activeSubMenu && activeSubMenu.subSubItems && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                              className="bg-white rounded-r-lg shadow-xl border-l w-max"
                            >
                               <div className="p-2">
                                  {activeSubMenu.subSubItems?.map((subSubItem) => (
                                    <Link
                                      key={subSubItem.name}
                                      to={subSubItem.path}
                                      className="text-glow block px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md whitespace-nowrap"
                                    >
                                      {subSubItem.name}
                                    </Link>
                                  ))}
                               </div>
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

          {/* Utility Icons */}
          <div className="flex items-center gap-5 text-xl text-text-main">
            <button onClick={onSearchClick} className="hover:text-primary transition-colors" aria-label="Search">
              <Search size={22} />
            </button>
              {/* --- NEW: Clerk Authentication Controls --- */}
              {/* This component will only render its children if the user is signed IN */}
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>

              {/* This component will only render its children if the user is signed OUT */}
              <SignedOut>
                {/* This component wraps your button and will open Clerk's beautiful login modal */}
                <SignInButton mode="modal">
                  <button className="hover:text-primary transition-colors" aria-label="Login">
                    <User size={22} />
                  </button>
                </SignInButton>
              </SignedOut>
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

        {/* Mobile Menu */}
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
                      {(navMenuItems.filter(i => i.name !== 'Home' && i.name !== 'Rudraksha')).map(item => (
                          <div key={item.name} className="border-b">
                                <div
                                  onClick={() => {
                                      if(!item.subItems) return;
                                      setOpenMobileSubMenu(openMobileSubMenu === item.name ? null : item.name)
                                  }}
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

