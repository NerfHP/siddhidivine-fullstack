// src/components/ShiftingNav.tsx

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, NavLink, useLocation, Location } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

// --- TypeScript Interfaces ---
interface SubItem {
  name: string;
  path: string;
  icon?: string;
}

interface MenuItem {
  name: string;
  path: string;
  subItems: SubItem[];
}

// --- Main ShiftingNav Component ---
export const ShiftingNav = ({ menuItems }: { menuItems: MenuItem[] }) => {
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [popoverLeft, setPopoverLeft] = useState<number | null>(null);
  
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (selectedTab !== null && navRef.current) {
      const tabEl = document.getElementById(`shift-tab-${selectedTab}`);
      const navEl = navRef.current;
      if (tabEl) {
        const tabRect = tabEl.getBoundingClientRect();
        const navRect = navEl.getBoundingClientRect();
        const left = tabRect.left - navRect.left;
        setPopoverLeft(left);
      }
    }
  }, [selectedTab]);

  const handleSetSelected = (val: number | null) => {
    if (typeof selectedTab === 'number' && typeof val === 'number') {
      setDirection(selectedTab > val ? 'right' : 'left');
    } else if (val === null) {
      setDirection(null);
    }
    setSelectedTab(val);
  };
  
  const tabs = menuItems.map((item, i) => ({
    id: i,
    title: item.name,
    path: item.path,
    content: () => <DropdownContent parentName={item.name} subItems={item.subItems} />,
  }));

  return (
    <nav 
      ref={navRef}
      onMouseLeave={() => {
        handleSetSelected(null);
        setPopoverLeft(null);
      }}
      className="hidden lg:flex items-center gap-8 relative"
    >
      <NavLink 
        to="/" 
        className={({isActive}) => 
          `flex items-center gap-1 relative font-medium transition-colors hover:text-primary ${
            isActive ? 'text-primary' : 'text-text-main'
          }`
        }
      >
        Home
      </NavLink>

      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          selected={selectedTab}
          handleSetSelected={handleSetSelected}
          tab={tab}
          location={location}
        />
      ))}

      <AnimatePresence>
        {selectedTab !== null && popoverLeft !== null && (
          <Content
            direction={direction}
            selectedTab={tabs[selectedTab]}
            left={popoverLeft}
          />
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Sub-components ---

const Tab = ({ tab, handleSetSelected, selected, location }: { tab: any; handleSetSelected: (id: number) => void; selected: number | null; location: Location }) => {
  const isActive = location.pathname.startsWith(tab.path);
  return (
    <div
      id={`shift-tab-${tab.id}`}
      onMouseEnter={() => handleSetSelected(tab.id)}
      className="relative"
    >
      <Link 
        to={tab.path} 
        className={`flex items-center gap-1 font-medium transition-colors hover:text-primary ${
          isActive || selected === tab.id ? 'text-primary' : 'text-text-main'
        }`}
      >
        <span>{tab.title}</span>
        <ChevronDown
          size={14}
          className={`mt-0.5 transition-transform ${selected === tab.id ? 'rotate-180' : ''}`}
        />
      </Link>
    </div>
  );
};

const Content = ({ selectedTab, direction, left }: { selectedTab: any; direction: string | null; left: number }) => {
  return (
    <motion.div
      id="overlay-content"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      // FIX #1: Reduced margin-top from mt-4 to mt-2 to lessen the gap
      className="absolute top-full mt-2 w-auto rounded-lg border border-gray-200 bg-white shadow-lg"
      style={{ left: left }}
    >
      <Bridge />
      <Nub selectedId={selectedTab.id} />
      <div className="overflow-hidden rounded-lg">
        <motion.div
          initial={{ opacity: 0, x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="p-4"
        >
          <selectedTab.content />
        </motion.div>
      </div>
    </motion.div>
  );
};

const DropdownContent = ({ subItems, parentName }: { subItems: SubItem[], parentName: string }) => {
    const isRudraksha = parentName === 'Rudraksha';
    const containerClass = isRudraksha ? 'grid grid-cols-2 gap-x-6 gap-y-2' : 'flex flex-col';
    return (
        <div className={containerClass}>
            {subItems.map((subItem) => (
                <Link
                    key={subItem.name}
                    to={subItem.path}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-orange-50 w-full whitespace-nowrap"
                >
                    {subItem.icon && <img src={subItem.icon} alt={subItem.name} className="w-6 h-6 object-contain"/>}
                    <span>{subItem.name}</span>
                </Link>
            ))}
        </div>
    );
};

// FIX #2: Adjusted the invisible "Bridge" to match the new, smaller gap
const Bridge = () => <div className="absolute -top-2 left-0 right-0 h-2" />;

const Nub = ({ selectedId }: { selectedId: number }) => {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const moveNub = () => {
      const hoveredTab = document.getElementById(`shift-tab-${selectedId}`);
      const overlayContent = document.getElementById('overlay-content');
      if (!hoveredTab || !overlayContent) return;
      const tabRect = hoveredTab.getBoundingClientRect();
      const { left: contentLeft } = overlayContent.getBoundingClientRect();
      const tabCenter = tabRect.left + tabRect.width / 2 - contentLeft;
      setLeft(tabCenter);
    };
    moveNub();
    window.addEventListener('resize', moveNub);
    return () => window.removeEventListener('resize', moveNub);
  }, [selectedId]);
  return (
    <motion.span
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
      animate={{ left }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      // FIX #3: Resized the pointer to fit perfectly in the new gap without overlapping
      className="absolute top-0 h-2 w-2 -translate-x-1/2 -translate-y-full rounded-t-sm bg-white border-t border-l border-r border-gray-200"
    />
  );
};