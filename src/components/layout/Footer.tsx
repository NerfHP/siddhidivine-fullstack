import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Facebook, Instagram, Linkedin, Twitter, Youtube, Mail } from 'lucide-react';
import logo from '@/assets/LOGO.png';

// --- Data for Links (cleaner code) ---
const quickLinks = [
  { to: '/track-order', text: 'Track Your Order' },
  { to: '/bestsellers', text: 'Best Sellers' },
  { to: '/contact', text: 'Contact Us' },
  { to: '/about', text: 'About Us' },
  { to: '/faqs', text: 'FAQs' },
];

const policyLinks = [
  { to: '/terms-and-conditions', text: 'Terms and Conditions' },
  { to: '/privacy-policy', text: 'Privacy Policy' },
  { to: '/shipping-policy', text: 'Shipping Policy' },
  { to: '/returns-policy', text: 'Refund and Exchange' },
];

const socialLinks = [
  { href: 'https://facebook.com', icon: <Facebook size={18} /> },
  { href: 'https://instagram.com', icon: <Instagram size={18} /> },
  { href: 'https://linkedin.com', icon: <Linkedin size={18} /> },
  { href: 'https://twitter.com', icon: <Twitter size={18} /> },
  { href: 'https://youtube.com', icon: <Youtube size={18} /> },
];

export default function Footer() {
  const [visible, setVisible] = useState(false);

  // --- Scroll-to-top button logic from your .jsx file ---
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // --- Link style with underline animation from your .jsx file ---
  const linkClass =
    "relative inline-block hover:text-primary transition " +
    "after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[2px] " +
    "after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-200 hover:after:scale-x-100";

  return (
    <footer className="relative bg-secondary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
             <Link to="/" className="flex items-center gap-2">
               <img src={logo} alt="Siddhi Aura Logo" className="h-10 w-10 bg-white rounded-full p-1" />
               <span className="text-xl font-bold font-sans">Siddhi Divine</span>
             </Link>
             <p className="text-sm text-gray-300">
               Discover authentic spiritual and healing stones rooted in Vedic tradition at Siddhi Divine.
             </p>
             <p className="text-sm text-gray-300">
               Head Office – Sector-3, Madhav Puram, Meerut, Delhi Road, India
             </p>
             <p className="text-sm text-gray-300">
               <a href="mailto:support@siddhidivine.com" className="text-sm text-gray-300 hover:text-primary transition">
               support@siddhidivine.com
             </a>  
              </p>
           </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-primary-light mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-primary-light mb-4">Policies</h3>
            <ul className="space-y-2 text-sm">
              {policyLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-primary-light mb-4">Get our exclusive offers</h3>
            <form className="flex mb-3">
              <input
                type="email"
                placeholder="Your email"
                className="w-full p-2 rounded-l-md border-none text-black focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <button className="bg-primary text-white px-4 rounded-r-md hover:bg-primary-dark transition">
                →
              </button>
            </form>
            <div className="flex space-x-3 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 border border-gray-600 rounded-full hover:bg-primary hover:border-primary transition"
                >
                  {social.icon}
                </a>
              ))}
              <a 
                href="mailto:support@siddhiaurastones.com"
                className="p-2 border border-gray-600 rounded-full hover:bg-primary hover:border-primary transition"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

        </div>
        <div className="text-center mt-8 border-t border-gray-700 pt-4 text-sm text-gray-400">
          © {new Date().getFullYear()} Siddhi Divine World. All Rights Reserved.
        </div>
      </div>
      
      {/* Floating Scroll to Top Button */}
      {visible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-secondary text-white rounded-full shadow-lg border border-gray-600 hover:bg-primary transition"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </footer>
  );
}