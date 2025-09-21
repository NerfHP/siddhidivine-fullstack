import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import UserRegistrationForm from '@/components/shared/UserRegistrationForm';
import { ShieldCheck, Gift, LockOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';

// Validation schemas
const phoneSchema = z.object({ 
  phone: z.string()
    .min(10, 'Enter a valid 10-digit number')
    .max(10, 'Enter a valid 10-digit number')
    .regex(/^[0-9]+$/, 'Phone number should contain only digits')
});

const otpSchema = z.object({ 
  otp: z.string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^[0-9]+$/, 'OTP should contain only digits')
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

// API function for Firebase login
const verifyFirebaseLogin = async (firebaseToken: string) => {
  const { data } = await api.post('/auth/firebase-login', { firebaseToken });
  return data;
};

// Global declaration for reCAPTCHA
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

// Step types for the login flow
type LoginStep = 'enterPhone' | 'enterOtp' | 'userRegistration';

interface LoginResponse {
  user: any;
  tokens: any;
  isNewUser?: boolean;
  needsRegistration?: boolean;
}

export default function LoginPopup() {
  const { isLoginPopupOpen, closeLoginPopup, login } = useAuth();
  const [step, setStep] = useState<LoginStep>('enterPhone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset: resetPhoneForm 
  } = useForm<PhoneFormData>({ 
    resolver: zodResolver(phoneSchema) 
  });

  const { 
    register: otpRegister, 
    handleSubmit: handleOtpSubmit, 
    formState: { errors: otpErrors }, 
    reset: resetOtpForm 
  } = useForm<OtpFormData>({ 
    resolver: zodResolver(otpSchema) 
  });

  // Firebase login mutation
  const verificationMutation = useMutation({
    mutationFn: verifyFirebaseLogin,
    onSuccess: (data: LoginResponse) => {
      if (data.isNewUser || data.needsRegistration) {
        // New user needs to complete registration
        setNewUserId(data.user.id);
        setStep('userRegistration');
      } else {
        // Existing user - direct login
        login(data);
        toast.success('Welcome back!');
        handleClose();
      }
    },
    onError: (error: any) => {
      console.error('Backend verification error:', error);
      toast.error('Login verification failed. Please try again.');
    },
  });

  // Clean up reCAPTCHA on component unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  // Setup reCAPTCHA verifier
  const setupRecaptcha = () => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            toast.error('Security verification expired. Please try again.');
          }
        });
      }
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      toast.error('Security setup failed. Please refresh and try again.');
    }
  };

  // Handle phone number submission
  const onPhoneSubmit = async (data: PhoneFormData) => {
    setIsSendingOtp(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      
      if (!appVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      const fullPhoneNumber = `+91${data.phone}`;
      console.log('Sending OTP to:', fullPhoneNumber);
      
      const result = await signInWithPhoneNumber(firebaseAuth, fullPhoneNumber, appVerifier);
      
      setConfirmationResult(result);
      setPhoneNumber(data.phone);
      setStep('enterOtp');
      toast.success('OTP sent successfully!');
      
    } catch (error: any) {
      console.error("Firebase OTP Error:", error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please try again later.');
      } else if (error.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number format.');
      } else if (error.code === 'auth/quota-exceeded') {
        toast.error('SMS quota exceeded. Please try again later.');
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP submission
  const onOtpSubmit = async (data: OtpFormData) => {
    if (!confirmationResult) {
      toast.error("Please request an OTP first.");
      return;
    }

    try {
      console.log('Verifying OTP:', data.otp);
      const result = await confirmationResult.confirm(data.otp);
      const user = result.user;
      const firebaseToken = await user.getIdToken();
      
      console.log('Firebase authentication successful');
      // Send Firebase token to backend for verification
      verificationMutation.mutate(firebaseToken);
      
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      if (error.code === 'auth/invalid-verification-code') {
        toast.error('Invalid OTP. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        toast.error('OTP has expired. Please request a new one.');
        setStep('enterPhone');
      } else {
        toast.error('OTP verification failed. Please try again.');
      }
    }
  };

  // Handle resending OTP
  const handleResendOTP = async () => {
    if (!phoneNumber) {
      toast.error('Please enter phone number first.');
      return;
    }

    setIsSendingOtp(true);
    try {
      // Clear previous reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }

      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const fullPhoneNumber = `+91${phoneNumber}`;
      
      const result = await signInWithPhoneNumber(firebaseAuth, fullPhoneNumber, appVerifier!);
      setConfirmationResult(result);
      toast.success('OTP resent successfully!');
      
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle successful registration
  const handleRegistrationSuccess = (userData: { user: any; tokens: any }) => {
    login(userData);
    toast.success('Registration completed! Welcome to Siddhi Divine!');
    handleClose();
  };

  // Handle popup close
  const handleClose = () => {
    resetPhoneForm();
    resetOtpForm();
    setStep('enterPhone');
    setPhoneNumber('');
    setConfirmationResult(null);
    setNewUserId(null);
    
    // Clean up reCAPTCHA
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = undefined;
    }
    
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
            className="relative w-full max-w-4xl bg-[#4A2425] rounded-xl shadow-2xl overflow-hidden grid md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={handleClose} 
              className="absolute top-2 right-2 text-white/50 hover:text-white z-20"
            >
              <X size={24} />
            </button>
            
            {/* Left side - Benefits */}
            <div className="hidden md:flex flex-col justify-center p-8 text-white">
              <h2 className="font-sans text-3xl font-bold">
                {step === 'userRegistration' ? 'Complete Your Journey' : 'Login & Avail Best Offers!'}
              </h2>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg">
                  <ShieldCheck size={32} className="text-yellow-400 shrink-0"/>
                  <div>
                    <h3 className="font-semibold">100% Authentic Products</h3>
                    <p className="text-sm text-white/80">All products are tested by Govt. certified labs.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg">
                  <LockOpen size={32} className="text-yellow-400 shrink-0"/>
                  <div>
                    <h3 className="font-semibold">Unlock Your Harmony</h3>
                    <p className="text-sm text-white/80">Effortless access to personalized guidance.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg">
                  <Gift size={32} className="text-yellow-400 shrink-0"/>
                  <div>
                    <h3 className="font-semibold">Exclusive Discounts</h3>
                    <p className="text-sm text-white/80">Registered users get exclusive discounts.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Forms */}
            <div className="bg-white p-8 md:rounded-l-xl">
              <div className="w-full max-w-sm mx-auto">
                <AnimatePresence mode="wait">
                  {step === 'enterPhone' && (
                    <motion.div 
                      key="phone" 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }} 
                      className="space-y-4"
                    >
                      <h3 className="font-bold text-xl text-center">Unlock Exclusive Discounts</h3>
                      <p className="text-sm text-gray-600 text-center">Enter your mobile number to get started</p>
                      
                      <form onSubmit={handleSubmit(onPhoneSubmit)} className="space-y-4">
                        <label className="block">
                          <span className="text-sm font-medium text-gray-700">Mobile Number</span>
                          <div className="mt-1 relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+91</span>
                            <Input 
                              id="phone" 
                              type="tel" 
                              placeholder="10-digit number"
                              className="pl-12"
                              {...register('phone')} 
                              error={errors.phone?.message} 
                            />
                          </div>
                        </label>
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          isLoading={isSendingOtp}
                        >
                          {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
                        </Button>
                      </form>
                    </motion.div>
                  )}
                  
                  {step === 'enterOtp' && (
                    <motion.div 
                      key="otp" 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }} 
                      className="space-y-4"
                    >
                      <h3 className="font-bold text-xl text-center">Enter OTP</h3>
                      <p className="text-sm text-gray-600 text-center">
                        We've sent a 6-digit code to +91{phoneNumber}
                      </p>
                      
                      <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-4">
                        <label className="block">
                          <span className="text-sm font-medium text-gray-700">One Time Password</span>
                          <Input 
                            id="otp" 
                            type="text" 
                            placeholder="6-digit OTP"
                            maxLength={6}
                            {...otpRegister('otp')} 
                            error={otpErrors.otp?.message} 
                          />
                        </label>
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          isLoading={verificationMutation.isPending}
                        >
                          {verificationMutation.isPending ? 'Verifying...' : 'Verify & Login'}
                        </Button>
                        
                        <div className="flex justify-between items-center text-sm">
                          <button 
                            type="button" 
                            onClick={() => setStep('enterPhone')} 
                            className="text-primary hover:underline"
                          >
                            Change Number
                          </button>
                          <button 
                            type="button" 
                            onClick={handleResendOTP}
                            disabled={isSendingOtp}
                            className="text-primary hover:underline disabled:opacity-50"
                          >
                            {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                  
                  {step === 'userRegistration' && newUserId && (
                    <motion.div 
                      key="registration"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <UserRegistrationForm
                        userId={newUserId}
                        phoneNumber={phoneNumber}
                        onSuccess={handleRegistrationSuccess}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <p className="text-center text-xs text-gray-500 mt-6">
                  By continuing, you agree to our{' '}
                  <Link to="/terms" className="underline">Terms</Link> and{' '}
                  <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}