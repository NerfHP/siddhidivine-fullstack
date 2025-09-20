import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShieldCheck, Gift, Repeat, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import React from 'react';

// --- PLACEHOLDERS to fix preview errors ---
// NOTE: These are only for the preview. Your actual project will use your real components.

const api = {
  post: async (url: string, data: any) => {
    console.log(`Mock API POST to ${url}`, data);
    if (url.includes('send-otp')) return Promise.resolve({ data: { message: 'OTP Sent!' } });
    return Promise.resolve({ data: { user: { name: 'Test User' }, token: 'fake-token' } });
  }
};

const toast = {
  success: (message: string) => console.log('SUCCESS:', message),
  error: (message: string) => console.error('ERROR:', message),
};

const useAuth = () => ({
  isLoginPopupOpen: true, // Keep popup open for preview
  closeLoginPopup: () => console.log('closeLoginPopup called'),
  login: (data: any) => console.log('Auth login called with:', data),
});

const Button = ({ children, isLoading, ...props }: any) => (
  <button {...props} disabled={isLoading} className="w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50">
    {isLoading ? 'Loading...' : children}
  </button>
);

// --- FIX APPLIED HERE ---
const Input = ({ error, label, ...props }: any) => (
  <div>
    <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">{label}</label>
    <input {...props} className={`w-full p-2 mt-1 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`} />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const queryClient = new QueryClient();

// --- YOUR REAL COMPONENT CODE STARTS HERE ---

// Zod schemas for validation
const phoneSchema = z.object({ phone: z.string().min(10, 'Enter a valid 10-digit number').max(10) });
const otpSchema = z.object({ otp: z.string().min(6, 'OTP must be 6 digits').max(6) });

type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

// API mutation functions (these assume you have the backend endpoints ready)
const sendOtp = async (data: PhoneFormData) => api.post('/auth/send-otp', data);
const verifyOtp = async (data: { phone: string; otp: string }) => api.post('/auth/verify-otp', data);

function LoginPopup() {
  const { isLoginPopupOpen, closeLoginPopup, login } = useAuth();
  const [step, setStep] = useState<'enterPhone' | 'enterOtp'>('enterPhone');
  const [phoneNumber, setPhoneNumber] = useState('');

  const { register: phoneRegister, handleSubmit: handlePhoneSubmit, formState: { errors: phoneErrors } } = useForm<PhoneFormData>({ resolver: zodResolver(phoneSchema) });
  const { register: otpRegister, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors }, reset: resetOtp } = useForm<OtpFormData>({ resolver: zodResolver(otpSchema) });

  const handleSuccess = (data: any) => {
    login(data);
    toast.success('Logged in successfully!');
    handleClose();
  };

  const sendOtpMutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: (_, variables) => {
      setPhoneNumber(variables.phone);
      setStep('enterOtp');
      toast.success('OTP sent to your mobile!');
    },
    onError: () => toast.error('Failed to send OTP. Please try again.'),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: handleSuccess,
    onError: () => toast.error('Invalid OTP. Please try again.'),
  });

  const onPhoneSubmit = (data: PhoneFormData) => sendOtpMutation.mutate(data);
  const onOtpSubmit = (data: OtpFormData) => verifyOtpMutation.mutate({ phone: phoneNumber, otp: data.otp });
  
  const handleClose = () => {
    resetOtp();
    setStep('enterPhone');
    closeLoginPopup();
  };

  return (
    <AnimatePresence>
      {isLoginPopupOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="relative w-full max-w-3xl bg-[#4A2425] rounded-xl shadow-2xl overflow-hidden grid md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={handleClose} className="absolute top-2 right-2 text-white/50 hover:text-white transition-colors z-20"><X size={24} /></button>
            
            {/* Left Panel - Info */}
            <div className="hidden md:flex flex-col justify-center p-8 text-white">
                <h2 className="font-sans text-3xl font-bold">Login & Avail Best Offers!</h2>
                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg">
                        <ShieldCheck size={32} className="text-yellow-400 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold">100% Authentic Products</h3>
                            <p className="text-sm text-white/80">All products are tested by Govt. certified labs.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg">
                        <Repeat size={32} className="text-yellow-400 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold">No Questions Asked Returns</h3>
                            <p className="text-sm text-white/80">A hassle-free 7 day return policy.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg">
                        <Gift size={32} className="text-yellow-400 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold">Exclusive Discounts</h3>
                            <p className="text-sm text-white/80">Registered users get exclusive discounts.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="bg-white p-8 md:rounded-l-xl">
              <div className="w-full max-w-sm mx-auto">
                <AnimatePresence mode="wait">
                  {step === 'enterPhone' ? (
                    <motion.div
                      key="enterPhone"
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="font-bold text-xl text-center">Unlock Exclusive Discounts</h3>
                      <form onSubmit={handlePhoneSubmit(onPhoneSubmit)} className="space-y-4">
                        <Input id="phone" type="tel" label="Enter Mobile Number" placeholder="10-digit number" {...phoneRegister('phone')} error={phoneErrors.phone?.message} />
                        <Button type="submit" className="w-full" isLoading={sendOtpMutation.isPending}>Continue</Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="enterOtp"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="font-bold text-xl text-center">Enter OTP</h3>
                      <p className="text-center text-sm text-gray-600">Sent to <strong>+91 {phoneNumber}</strong></p>
                      <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-4">
                        <Input id="otp" type="text" label="One Time Password" placeholder="6-digit OTP" {...otpRegister('otp')} error={otpErrors.otp?.message} />
                        <Button type="submit" className="w-full" isLoading={verifyOtpMutation.isPending}>Verify & Login</Button>
                         <button type="button" onClick={() => setStep('enterPhone')} className="text-sm text-center w-full text-primary hover:underline">
                            Change Number
                         </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="text-center text-xs text-gray-500 mt-6">
                    By continuing, you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}