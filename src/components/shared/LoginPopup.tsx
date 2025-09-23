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
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';

// --- Zod Validation Schemas ---
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().length(10, 'Enter a valid 10-digit number').regex(/^[0-9]+$/, 'Invalid number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  address: z.string().min(10, 'Address is required'),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function LoginPopup() {
  const { isLoginPopupOpen, closeLoginPopup, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'signup' | 'login' | 'forgotPassword'>('signup');

  const { register: signupRegister, handleSubmit: handleSignupSubmit, formState: { errors: signupErrors }, reset: resetSignupForm } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });
  const { register: loginRegister, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors }, reset: resetLoginForm } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const { register: forgotPasswordRegister, handleSubmit: handleForgotPasswordSubmit, formState: { errors: forgotPasswordErrors }, reset: resetForgotPasswordForm } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) });

  // --- API MUTATIONS ---
  const backendLoginMutation = useMutation({ mutationFn: (firebaseToken: string) => api.post('/auth/firebase-login', { firebaseToken }), onSuccess: (response) => { login(response.data); toast.success('Welcome back!'); handleClose(); }, onError: (error: any) => { toast.error(error.response?.data?.message || 'Login failed.'); }, });
  const backendRegisterMutation = useMutation({ mutationFn: (data: { firebaseToken: string, userData: Omit<SignupFormData, 'confirmPassword'> }) => api.post('/auth/register', data), onSuccess: (response) => { login(response.data); toast.success('Registration successful! Please check your email to verify your account.'); handleClose(); }, onError: (error: any) => { toast.error(error.response?.data?.message || 'Registration failed.'); } });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
        await sendPasswordResetEmail(firebaseAuth, data.email);
        return data.email;
    },
    onSuccess: (email) => {
        toast.success(`Password reset link sent to ${email}`);
        setActiveTab('login');
    },
    onError: (error) => {
        console.error("Forgot Password Error:", error);
        toast.error('Could not send password reset email. Please try again.');
    }
  });

  // --- Firebase Logic ---
  const onSignup = async (data: SignupFormData) => {
    const { confirmPassword, ...userData } = data;
    try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, userData.email, userData.password);
        const firebaseUser = userCredential.user;
        await sendEmailVerification(firebaseUser);
        const firebaseToken = await firebaseUser.getIdToken();
        backendRegisterMutation.mutate({ firebaseToken, userData });
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            toast.error('This email is already registered. Please login instead.');
        } else {
            toast.error('Could not create account. Please try again.');
        }
    }
  };
  
  const onLogin = async (data: LoginFormData) => {
    try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, data.email, data.password);
        const firebaseToken = await userCredential.user.getIdToken();
        backendLoginMutation.mutate(firebaseToken);
    } catch (error: any) {
        toast.error('Incorrect email or password.');
    }
  };

  const onForgotPassword = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  }

  // --- UI Handlers ---
  const handleClose = () => {
    resetSignupForm(); resetLoginForm(); resetForgotPasswordForm();
    setActiveTab('signup');
    closeLoginPopup();
  };

  return (
    <AnimatePresence>
      {isLoginPopupOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative w-full max-w-4xl bg-[#4A2425] rounded-xl shadow-2xl overflow-hidden grid md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleClose} className="absolute top-2 right-2 text-white/50 hover:text-white z-20"><X size={24} /></button>
            <div className="hidden md:flex flex-col justify-center p-8 text-white">
              <h2 className="font-sans text-3xl font-bold">Unlock Your Harmony</h2>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg"><ShieldCheck size={32} className="text-yellow-400 shrink-0"/><div><h3 className="font-semibold">100% Authentic Products</h3><p className="text-sm text-white/80">Certified by Govt. labs.</p></div></div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg"><LockOpen size={32} className="text-yellow-400 shrink-0"/><div><h3 className="font-semibold">Secure & Easy Login</h3><p className="text-sm text-white/80">Free email & password login.</p></div></div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg"><Gift size={32} className="text-yellow-400 shrink-0"/><div><h3 className="font-semibold">Exclusive Discounts</h3><p className="text-sm text-white/80">Special offers for registered users.</p></div></div>
              </div>
            </div>
            <div className="bg-white p-8 md:rounded-l-xl">
              <div className="w-full max-w-sm mx-auto">
                {activeTab !== 'forgotPassword' && (
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg mb-6">
                        <button onClick={() => setActiveTab('signup')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'signup' ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>Sign Up</button>
                        <button onClick={() => setActiveTab('login')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'login' ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>Login</button>
                    </div>
                )}
                
                <AnimatePresence mode="wait">
                  {activeTab === 'signup' && (
                    <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-3">
                        <h3 className="font-bold text-xl text-center">Create Your Account</h3>
                        <div><label className="text-sm font-medium text-gray-700" htmlFor="name">Full Name</label><Input id="name" type="text" {...signupRegister('name')} error={signupErrors.name?.message} /></div>
                        <div><label className="text-sm font-medium text-gray-700" htmlFor="email-signup">Email Address</label><Input id="email-signup" type="email" {...signupRegister('email')} error={signupErrors.email?.message} /></div>
                        <div><label className="text-sm font-medium text-gray-700" htmlFor="phone-signup">Mobile Number</label><div className="relative"><span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">+91</span><Input id="phone-signup" type="tel" className="pl-12" {...signupRegister('phone')} error={signupErrors.phone?.message} /></div></div>
                        <div><label className="text-sm font-medium text-gray-700" htmlFor="password-signup">Create Password</label><Input id="password-signup" type="password" {...signupRegister('password')} error={signupErrors.password?.message} /></div>
                        <div><label className="text-sm font-medium text-gray-700" htmlFor="confirm-password">Confirm Password</label><Input id="confirm-password" type="password" {...signupRegister('confirmPassword')} error={signupErrors.confirmPassword?.message} /></div>
                        <div><label className="text-sm font-medium text-gray-700" htmlFor="address">Address</label><Input id="address" type="text" {...signupRegister('address')} error={signupErrors.address?.message} /></div>
                        <Button type="submit" className="w-full !mt-5" isLoading={backendRegisterMutation.isPending}>Create Account</Button>
                      </form>
                    </motion.div>
                  )}

                  {activeTab === 'login' && (
                     <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                            <h3 className="font-bold text-xl text-center">Welcome Back!</h3>
                            <div><label className="text-sm font-medium text-gray-700" htmlFor="email-login">Email Address</label><Input id="email-login" type="email" {...loginRegister('email')} error={loginErrors.email?.message} /></div>
                            <div><label className="text-sm font-medium text-gray-700" htmlFor="password-login">Password</label><Input id="password-login" type="password" {...loginRegister('password')} error={loginErrors.password?.message} /></div>
                            <div className="text-right"><button type="button" onClick={() => setActiveTab('forgotPassword')} className="text-sm font-medium text-primary hover:underline">Forgot Password?</button></div>
                            <Button type="submit" className="w-full" isLoading={backendLoginMutation.isPending}>Login</Button>
                        </form>
                    </motion.div>
                  )}

                  {activeTab === 'forgotPassword' && (
                     <motion.div key="forgotPassword" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <form onSubmit={handleForgotPasswordSubmit(onForgotPassword)} className="space-y-4">
                            <h3 className="font-bold text-xl text-center">Reset Password</h3>
                            <p className="text-sm text-center text-gray-600">Enter your email and we'll send you a link to reset your password.</p>
                            <div><label className="text-sm font-medium text-gray-700" htmlFor="email-forgot">Email Address</label><Input id="email-forgot" type="email" {...forgotPasswordRegister('email')} error={forgotPasswordErrors.email?.message} /></div>
                            <Button type="submit" className="w-full" isLoading={forgotPasswordMutation.isPending}>Send Reset Link</Button>
                             <div className="text-center"><button type="button" onClick={() => setActiveTab('login')} className="text-sm font-medium text-primary hover:underline">Back to Login</button></div>
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

