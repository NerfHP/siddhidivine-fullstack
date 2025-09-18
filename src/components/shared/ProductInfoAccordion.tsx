import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

// The data for our accordion sections
const accordionData = [
  {
    id: 'made-in-india',
    title: '100% Made in India',
    content: () => (
      <p>
        Your purchase supports fulfilling employment and financial independence in India. 
        This impact extends from our craftspeople to their families, providing well-being 
        and prosperity for generations to come.
      </p>
    ),
  },
  {
    id: 'return-exchange',
    title: 'Return & Exchange',
    content: () => (
      <p>
        We're not relaxed until you are – your satisfaction is our priority. If your 
        divine positive energy is not right for you, we offer a straightforward{' '}
        <Link to="/returns-policy" className="text-primary hover:underline font-medium">
          returns & exchanges policy
        </Link>.
      </p>
    ),
  },
  {
    id: 'donation',
    title: 'Siddhi Divine Donation',
    content: () => (
      <>
        <h4 className="font-bold text-text-main mb-1">Small Actions, Big Changes</h4>
        <p>
          At Siddhi Divine, every purchase welcomes divine energy into your life and supports 
          our efforts to care for our cows. With each order, you're contributing to help 
          with cow shelters.
        </p>
      </>
    ),
  },
  {
    id: 'care-guidelines',
    title: 'Care Guidelines',
    content: () => (
      <ul className="list-disc pl-5 space-y-2">
        <li>Protect your divine spiritual accessories from dishwashing soap, lotions, perfumes, silver cleaner, and other harsh chemicals.</li>
        <li>Your divine spiritual accessories should be the final accessory you put on and the first one you remove.</li>
        <li>When not worn, store separately in a moisture-free zip-lock bag.</li>
      </ul>
    ),
  },
];

// Reusable Accordion Item Component
const AccordionItem = ({ item, isOpen, onClick }: { item: typeof accordionData[0], isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-4 text-left font-medium text-text-main"
      >
        <span>{item.title}</span>
        <ChevronDown
          className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          size={20}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-gray-600 prose prose-sm max-w-none">
              <item.content />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Accordion Component
export default function ProductInfoAccordion() {
  // State to track which accordion item is open. 'made-in-india' is open by default.
  const [openAccordion, setOpenAccordion] = useState<string | null>('made-in-india');

  const handleToggle = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="w-full">
      {accordionData.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openAccordion === item.id}
          onClick={() => handleToggle(item.id)}
        />
      ))}
    </div>
  );
}
