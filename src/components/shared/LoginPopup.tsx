import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { ShieldCheck, Gift, Repeat, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase'; // Your real Firebase config import

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
      grecaptcha: any; // This tells TypeScript to expect the grecaptcha object
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

  // This effect reliably sets up the reCAPTCHA verifier as soon as the popup opens
  useEffect(() => {
    if (isLoginPopupOpen) {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => { /* reCAPTCHA solved */ }
        });
      }
    }
  }, [isLoginPopupOpen]);

  const verificationMutation = useMutation({
    mutationFn: verifyFirebaseLogin,
    onSuccess: (data) => {
        login(data);
        toast.success('Logged in successfully!');
        handleClose();
    },
    onError: () => toast.error('Our backend verification failed. Please try again.'),
  });

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setIsSendingOtp(true);
    try {
      if (!window.recaptchaVerifier) {
        throw new Error("reCAPTCHA verifier not initialized.");
      }
      const appVerifier = window.recaptchaVerifier;
      const fullPhoneNumber = `+91${data.phone}`; // Assuming Indian numbers
      
      const result = await signInWithPhoneNumber(firebaseAuth, fullPhoneNumber, appVerifier);
      setConfirmationResult(result);
      setPhoneNumber(data.phone);
      setStep('enterOtp');
      toast.success('OTP sent successfully!');
    } catch (error) {
      console.error("Firebase OTP Error:", error);
      toast.error('Failed to send OTP. Please try again later.');
      // Reset the verifier if it fails
      window.recaptchaVerifier?.render().then(widgetId => {
          window.grecaptcha.reset(widgetId); // FIX: Call grecaptcha from the window object
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onOtpSubmit = async (data: OtpFormData) => {
    if (!confirmationResult) return toast.error("Please request an OTP first.");
    try {
      const result = await confirmationResult.confirm(data.otp);
      const user = result.user;
      const firebaseToken = await user.getIdToken();
      verificationMutation.mutate(firebaseToken);
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    }
  };
  
  const handleClose = () => {
    reset();
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
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg"><Repeat size={32} className="text-yellow-400 shrink-0"/><div><h3 className="font-semibold">No Questions Asked Returns</h3><p className="text-sm text-white/80">A hassle-free 7 day return policy.</p></div></div>
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg"><Gift size={32} className="text-yellow-400 shrink-0"/><div><h3 className="font-semibold">Exclusive Discounts</h3><p className="text-sm text-white/80">Registered users get exclusive discounts.</p></div></div>
                </div>
            </div>
            <div className="bg-white p-8 md:rounded-l-xl"><div className="w-full max-w-sm mx-auto">
                <AnimatePresence mode="wait">
                  {step === 'enterPhone' ? (
                    <motion.div key="phone" exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <h3 className="font-bold text-xl text-center">Unlock Exclusive Discounts</h3>
                      <form onSubmit={handleSubmit(onPhoneSubmit)} className="space-y-4">
                        {/* --- FIX for 'label' prop --- */}
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Enter Mobile Number</label>
                          <Input id="phone" type="tel" placeholder="10-digit number" {...register('phone')} error={errors.phone?.message} className="mt-1" />
                        </div>
                        <Button type="submit" className="w-full" isLoading={isSendingOtp}>Continue</Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <h3 className="font-bold text-xl text-center">Enter OTP</h3>
                      <p className="text-center text-sm text-gray-600">Sent to <strong>+91 {phoneNumber}</strong></p>
                      <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-4">
                        {/* --- FIX for 'label' prop --- */}
                        <div>
                           <label htmlFor="otp" className="block text-sm font-medium text-gray-700">One Time Password</label>
                           <Input id="otp" type="text" placeholder="6-digit OTP" {...otpRegister('otp')} error={otpErrors.otp?.message} className="mt-1" />
                        </div>
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

