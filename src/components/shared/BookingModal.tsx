import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, Clock, MapPin } from 'lucide-react';
import Button from './Button';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
}

export default function BookingModal({ isOpen, onClose, serviceName }: BookingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-sans text-xl font-bold text-text-main">Booking for {serviceName}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body with Form */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please provide the following details for an accurate consultation. This information will be kept strictly confidential.
              </p>
              <form className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" id="fullName" placeholder="Your full name" className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                   <div className="mt-1 relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="date" id="dob" className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label htmlFor="tob" className="block text-sm font-medium text-gray-700">Time of Birth</label>
                   <div className="mt-1 relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="time" id="tob" className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label htmlFor="pob" className="block text-sm font-medium text-gray-700">Place of Birth (City, Country)</label>
                   <div className="mt-1 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" id="pob" placeholder="e.g., Meerut, India" className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <Button onClick={onClose} size="lg">Submit Details & Proceed</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
