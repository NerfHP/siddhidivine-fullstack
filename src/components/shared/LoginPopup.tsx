import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';
import Input from './Input';
import UserRegistrationForm from './UserRegistrationForm';
import { ShieldCheck, Gift, LockOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth as firebaseAuth } from '../../lib/firebase';
import { User } from '../../types';

// Schemas remain the same...
const phoneSchema = z.object({ phone: z.string().length(10, 'Enter a valid 10-digit number').regex(/^[0-9]+$/, 'Invalid number'), });
const otpSchema = z.object({ otp: z.string().length(6, 'OTP must be 6 digits').regex(/^[0-9]+$/, 'Invalid OTP'), });
const loginSchema = z.object({ phone: z.string().length(10, 'Enter a valid 10-digit number').regex(/^[0-9]+$/, 'Invalid number'), password: z.string().min(6, 'Password must be at least 6 characters'), });
type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type LoginFormData = z.infer<typeof loginSchema>;
interface LoginResponse { user: User; tokens: any; isNewUser?: boolean; }
declare global { interface Window { recaptchaVerifier?: RecaptchaVerifier; } }

export default function LoginPopup() {
  const { isLoginPopupOpen, closeLoginPopup, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  const [signupStep, setSignupStep] = useState<'enterPhone' | 'enterOtp' | 'register'>('enterPhone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const { register: phoneRegister, handleSubmit: handlePhoneSubmit, formState: { errors: phoneErrors }, reset: resetPhoneForm } = useForm<PhoneFormData>({ resolver: zodResolver(phoneSchema) });
  const { register: otpRegister, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors }, reset: resetOtpForm } = useForm<OtpFormData>({ resolver: zodResolver(otpSchema) });
  const { register: loginRegister, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors }, reset: resetLoginForm } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const loginMutation = useMutation({ mutationFn: (data: LoginFormData) => api.post('/auth/login', data), onSuccess: (response) => { login(response.data); toast.success('Welcome back!'); handleClose(); }, onError: (error: any) => { toast.error(error.response?.data?.message || 'Invalid credentials. Please try again.'); }, });
  const firebaseVerifyMutation = useMutation({ mutationFn: (token: string) => api.post('/auth/firebase-login', { firebaseToken: token }), onSuccess: (response) => { const data = response.data as LoginResponse; if (data.isNewUser) { setNewUserId(data.user.id); setPhoneNumber(data.user.phone); setSignupStep('register'); } else { login(data); toast.success('Welcome back!'); handleClose(); } }, onError: (error: any) => { toast.error(error.response?.data?.message || 'Verification failed.'); }, });

  useEffect(() => { return () => { window.recaptchaVerifier?.clear(); }; }, []);

  const setupRecaptcha = () => {
    console.log("Attempting to set up reCAPTCHA...");
    if (window.recaptchaVerifier) {
      console.log("Clearing existing reCAPTCHA verifier.");
      window.recaptchaVerifier.clear();
    }
    try {
      // REFINED: Check if the container exists before initializing
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (!recaptchaContainer) {
          console.error("reCAPTCHA container not found in the DOM.");
          toast.error("Security component failed to load. Please refresh.");
          return false;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainer, {
        'size': 'invisible', 'expired-callback': () => toast.error('Security check expired. Please try again.'),
      });
      console.log("reCAPTCHA verifier created successfully.");
      return true;
    } catch (error) {
        console.error("reCAPTCHA setup error:", error);
        toast.error("Could not start security check. Please refresh the page.")
        return false;
    }
  };

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setIsSendingOtp(true);
    if (!setupRecaptcha()) {
        setIsSendingOtp(false);
        return;
    }

    try {
      const fullPhoneNumber = `+91${data.phone}`;
      const appVerifier = window.recaptchaVerifier!;
      console.log("Rendering reCAPTCHA and sending OTP...");
      const result = await signInWithPhoneNumber(firebaseAuth, fullPhoneNumber, appVerifier);
      setConfirmationResult(result);
      setPhoneNumber(data.phone);
      setSignupStep('enterOtp');
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error("Firebase OTP Error:", error);
      toast.error('Failed to send OTP. Please check the number and try again.');
    } finally {
        setIsSendingOtp(false);
    }
  };

  const onOtpSubmit = async (data: OtpFormData) => { if (!confirmationResult) return toast.error('Please request an OTP first.'); try { const result = await confirmationResult.confirm(data.otp); const token = await result.user.getIdToken(); firebaseVerifyMutation.mutate(token); } catch (error) { toast.error('Invalid OTP. Please try again.'); } };
  const onPasswordLogin = (data: LoginFormData) => { loginMutation.mutate(data); };
  const handleRegistrationSuccess = (data: { user: any; tokens: any }) => { login(data); toast.success('Registration successful! Welcome.'); handleClose(); };
  const handleClose = () => { resetPhoneForm(); resetOtpForm(); resetLoginForm(); setActiveTab('signup'); setSignupStep('enterPhone'); window.recaptchaVerifier?.clear(); closeLoginPopup(); };

  return (
    <AnimatePresence>
      {isLoginPopupOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative w-full max-w-4xl bg-[#4A2425] rounded-xl shadow-2xl overflow-hidden grid md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleClose} className="absolute top-2 right-2 text-white/50 hover:text-white z-20"><X size={24} /></button>
            <div id="recaptcha-container"></div> {/* The container now has no 'hidden' class to ensure it's always available */}
            <div className="hidden md:flex flex-col justify-center p-8 text-white">
              <h2 className="font-sans text-3xl font-bold">Unlock Your Harmony</h2>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg"><ShieldCheck size={32} className="text-yellow-400 shrink-0"/><div><h3 className="font-semibold">100% Authentic Products</h3><p className="text-sm text-white/80">Certified by Govt. labs.</p></div></div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg"><LockOpen size={32} className="text-yellow-400 shrink-0"/><div><h3 className="font-semibold">Secure & Easy Login</h3><p className="text-sm text-white/80">Password and OTP options.</p></div></div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg"><Gift size={32} className="text-yellow-400 shrink-0"/><div><h3 className="font-semibold">Exclusive Discounts</h3><p className="text-sm text-white/80">Special offers for registered users.</p></div></div>
              </div>
            </div>
            <div className="bg-white p-8 md:rounded-l-xl">
              <div className="w-full max-w-sm mx-auto">
                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg mb-6">
                  <button onClick={() => setActiveTab('signup')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'signup' ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>Sign Up</button>
                  <button onClick={() => setActiveTab('login')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'login' ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>Login</button>
                </div>
                <AnimatePresence mode="wait">
                  {activeTab === 'signup' && (
                    <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {signupStep === 'enterPhone' && (
                        <form onSubmit={handlePhoneSubmit(onPhoneSubmit)} className="space-y-4">
                          <h3 className="font-bold text-xl text-center">Create Your Account</h3>
                          <div><label htmlFor="phone-signup" className="text-sm font-medium text-gray-700">Mobile Number</label><div className="relative mt-1"><span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+91</span><Input id="phone-signup" type="tel" placeholder="10-digit number" className="pl-12" {...phoneRegister('phone')} error={phoneErrors.phone?.message} /></div></div>
                          <Button type="submit" className="w-full" isLoading={isSendingOtp}>Send OTP</Button>
                        </form>
                      )}
                      {signupStep === 'enterOtp' && (
                        <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-4">
                           <h3 className="font-bold text-xl text-center">Enter OTP</h3>
                           <p className="text-sm text-gray-600 text-center">Sent to +91{phoneNumber}</p>
                           <div><label htmlFor="otp" className="text-sm font-medium text-gray-700">One Time Password</label><Input id="otp" type="text" placeholder="6-digit OTP" {...otpRegister('otp')} error={otpErrors.otp?.message} /></div>
                           <Button type="submit" className="w-full" isLoading={firebaseVerifyMutation.isPending}>Verify & Continue</Button>
                           <button type="button" onClick={() => setSignupStep('enterPhone')} className="text-sm text-primary hover:underline w-full text-center mt-2">Change Number</button>
                        </form>
                      )}
                      {signupStep === 'register' && newUserId && (
                        <div>
                          <h3 className="font-bold text-xl text-center">Complete Your Profile</h3>
                          <UserRegistrationForm userId={newUserId} phoneNumber={phoneNumber} onSuccess={handleRegistrationSuccess} />
                        </div>
                      )}
                    </motion.div>
                  )}
                  {activeTab === 'login' && (
                     <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <form onSubmit={handleLoginSubmit(onPasswordLogin)} className="space-y-4">
                            <h3 className="font-bold text-xl text-center">Welcome Back!</h3>
                            <div><label htmlFor="phone-login" className="text-sm font-medium text-gray-700">Mobile Number</label><div className="relative mt-1"><span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+91</span><Input id="phone-login" type="tel" placeholder="10-digit number" className="pl-12" {...loginRegister('phone')} error={loginErrors.phone?.message} /></div></div>
                            <div><label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label><Input id="password" type="password" placeholder="••••••••" {...loginRegister('password')} error={loginErrors.password?.message} /></div>
                            <Button type="submit" className="w-full" isLoading={loginMutation.isPending}>Login</Button>
                        </form>
                    </motion.div>
                  )}
                </AnimatePresence>
                 <p className="text-center text-xs text-gray-500 mt-6">By continuing, you agree to our{' '}<Link to="/terms" className="underline">Terms</Link> and{' '}<Link to="/privacy-policy" className="underline">Privacy Policy</Link>.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

