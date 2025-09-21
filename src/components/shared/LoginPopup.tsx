import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { ShieldCheck, Gift, LockOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase'; // This is your real Firebase config import

// Zod schemas for validation
const phoneSchema = z.object({ phone: z.string().min(10, 'Enter a valid 10-digit number').max(10) });
const otpSchema = z.object({ otp: z.string().min(6, 'OTP must be 6 digits').max(6) });

type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

// API mutation for your backend verification
const verifyFirebaseLogin = async (firebaseToken: string) => {
    const { data } = await api.post('/auth/firebase-login', { firebaseToken });
    return data;
};

// This is a TypeScript workaround for the Firebase reCAPTCHA verifier
declare global {
    interface Window {
      recaptchaVerifier?: RecaptchaVerifier;
    }
}

export default function LoginPopup() {
  const { isLoginPopupOpen, closeLoginPopup, login } = useAuth();
  const [step, setStep] = useState<'enterPhone' | 'enterOtp'>('enterPhone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PhoneFormData>({ resolver: zodResolver(phoneSchema) });
  const { register: otpRegister, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors }, reset } = useForm<OtpFormData>({ resolver: zodResolver(otpSchema) });

  const verificationMutation = useMutation({
    mutationFn: verifyFirebaseLogin,
    onSuccess: (data) => {
        login(data);
        toast.success('Logged in successfully!');
        handleClose();
    },
    onError: () => toast.error('Our backend verification failed. Please try again.'),
  });
  
  // This sets up the invisible reCAPTCHA that Firebase requires for security
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      // The 'recaptcha-container' is the ID of the div you will add to your index.html
      window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => { /* reCAPTCHA solved, allow sign-in */ }
      });
    }
  };

  // This function is called when the user submits their phone number
  const onPhoneSubmit = async (data: PhoneFormData) => {
    setIsSendingOtp(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const fullPhoneNumber = `+91${data.phone}`; // Assuming Indian numbers
      
      const result = await signInWithPhoneNumber(firebaseAuth, fullPhoneNumber, appVerifier);
      
      setConfirmationResult(result);
      setPhoneNumber(data.phone);
      setStep('enterOtp');
      toast.success('OTP sent successfully!');
    } catch (error) {
      console.error("Firebase OTP Error:", error);
      toast.error('Failed to send OTP. Please check the number or try again later.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // This function is called when the user submits the OTP
  const onOtpSubmit = async (data: OtpFormData) => {
    if (!confirmationResult) return toast.error("Please request an OTP first.");
    try {
      const result = await confirmationResult.confirm(data.otp);
      const user = result.user;
      const firebaseToken = await user.getIdToken();
      // The OTP is correct. Now, send the Firebase token to your own backend for final verification.
      verificationMutation.mutate(firebaseToken);
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    }
  };
  
  const handleClose = () => {
    reset(); // Resets the OTP form
    setStep('enterPhone');
    closeLoginPopup();
  };
  
  return (
    <AnimatePresence>
      {isLoginPopupOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="relative w-full max-w-3xl bg-[#4A2425] rounded-xl shadow-2xl overflow-hidden grid md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={handleClose} className="absolute top-2 right-2 text-white/50 hover:text-white z-20"><X size={24} /></button>
            <div className="hidden md:flex flex-col justify-center p-8 text-white">
                <h2 className="font-sans text-3xl font-bold">Login & Avail Best Offers!</h2>
                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg"><ShieldCheck size={32} className="text-yellow-400 shrink-0"/><div><h3 className="font-semibold">100% Authentic Products</h3><p className="text-sm text-white/80">All products are tested by Govt. certified labs.</p></div></div>
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg"><LockOpen size={32} className="text-yellow-400 shrink-0"/><div><h3 className="font-semibold">Unlock Your Harmony</h3><p className="text-sm text-white/80">Effortless access to personalized guidance.</p></div></div>
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg"><Gift size={32} className="text-yellow-400 shrink-0"/><div><h3 className="font-semibold">Exclusive Discounts</h3><p className="text-sm text-white/80">Registered users get exclusive discounts.</p></div></div>
                </div>
            </div>
            <div className="bg-white p-8 md:rounded-l-xl"><div className="w-full max-w-sm mx-auto">
                <AnimatePresence mode="wait">
                  {step === 'enterPhone' ? (
                    <motion.div key="phone" exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <h3 className="font-bold text-xl text-center">Unlock Exclusive Discounts</h3>
                      <form onSubmit={handleSubmit(onPhoneSubmit)} className="space-y-4">
                        <label className="block">
                          <span className="text-sm font-medium text-gray-700">Enter Mobile Number</span>
                          <Input id="phone" type="tel" placeholder="10-digit number" {...register('phone')} error={errors.phone?.message} />
                        </label>
                        <Button type="submit" className="w-full" isLoading={isSendingOtp}>Continue</Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div key="otp" exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <h3 className="font-bold text-xl text-center">Enter One Time Password</h3>
                      <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-4">
                        <label className="block">
                          <span className="text-sm font-medium text-gray-700">One Time Password</span>
                          <Input id="otp" type="text" placeholder="6-digit OTP" {...otpRegister('otp')} error={otpErrors.otp?.message} />
                        </label>
                        <Button type="submit" className="w-full" isLoading={verificationMutation.isPending}>Verify & Login</Button>
                        <button type="button" onClick={() => setStep('enterPhone')} className="text-sm text-center w-full text-primary hover:underline">Change Number</button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="text-center text-xs text-gray-500 mt-6">By continuing, you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.</p>
            </div></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

