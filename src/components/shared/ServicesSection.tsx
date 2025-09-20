import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

// Path updated to reflect your /public/images folder structure
const kundaliImage = '/images/kundali-prediction.png';

const ServiceCard = () => {
  return (
    <>
      {/* CSS for the button animations */}
      <style>
        {`
          @keyframes pulse-glow {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 1rem rgba(249, 115, 22, 0.5);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 2rem rgba(249, 115, 22, 0.8);
            }
          }

          .animate-pulse-glow {
            animation: pulse-glow 2.5s infinite ease-in-out;
          }
        `}
      </style>
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-4xl mx-auto border border-gray-100 overflow-hidden relative">
          {/* Decorative background elements */}
          <div className="absolute -top-10 -left-12 w-48 h-48 opacity-20">
              <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 0 L125 50 L150 25 L175 75 L200 50 L150 100 L175 150 L125 125 L100 200 L75 125 L25 175 L50 100 L0 50 L25 75 L50 25 L75 50 Z" stroke="#F87171" strokeWidth="2" strokeDasharray="4 4"/>
              </svg>
          </div>
           <div className="absolute -bottom-12 -right-10 w-48 h-48 opacity-20">
              <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0 L75 50 L100 25 L125 75 L150 50 L100 100 L125 150 L75 125 L50 200 L25 125 L-25 175 L0 100 L-50 50 L-25 75 L0 25 L25 50 Z" stroke="#F87171" strokeWidth="2" strokeDasharray="4 4"/>
              </svg>
          </div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Image Section */}
          <div className="w-full md:w-2/5 flex-shrink-0">
            <img
              src={kundaliImage}
              alt="Kundali Prediction"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>

          {/* Details Section */}
          <div className="w-full md:w-3/5 text-center md:text-left">
            <h3 className="text-3xl font-bold text-gray-800 mb-3">
              Kundali Prediction
            </h3>
            <p className="text-gray-600 mb-5">
              Book an online Kundali prediction session with expert astrologers.
            </p>

            {/* Pricing */}
            <div className="flex items-baseline justify-center md:justify-start gap-3 mb-6">
              <span className="text-4xl font-extrabold text-gray-900">₹1,500.00</span>
              <span className="text-xl font-medium text-red-500 line-through">₹2,100.00</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* UPDATED: Changed button to a Link and added animation class */}
              <Link
                to="/services/kundali-prediction" // You can change this path
                className="w-full text-center bg-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
              >
                Book Now
              </Link>
              <button className="w-full bg-transparent border-2 border-orange-500 text-orange-500 font-bold py-3 px-6 rounded-lg hover:bg-orange-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition-all duration-300">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function ServicesSection() {
  return (
    <section className="py-16 md:py-24 bg-orange-50/50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 relative inline-block">
          Our Services
           <span className="block h-1 w-24 bg-orange-500 mx-auto mt-4"></span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          Connect with ancient traditions through our expert services.
        </p>
        <ServiceCard />
      </div>
    </section>
  );
}

