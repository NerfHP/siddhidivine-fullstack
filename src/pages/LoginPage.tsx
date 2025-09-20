import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/shared/SEO';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { useAuth } from '@/hooks/useAuth';
import Alert from '@/components/shared/Alert';
import { Mail, Phone } from 'lucide-react';

// --- Zod Schemas for Validation ---
const emailLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const mobileSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(10),
});

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits').max(6),
});

type EmailLoginFormData = z.infer<typeof emailLoginSchema>;
type MobileFormData = z.infer<typeof mobileSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

// --- API Mutation Functions ---
// NOTE: These assume you have corresponding backend endpoints.
const loginWithEmail = async (data: EmailLoginFormData) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

const sendOtp = async (data: MobileFormData) => {
  const response = await api.post('/auth/send-otp', data);
  return response.data;
};

const verifyOtp = async (data: { phone: string; otp: string }) => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
}

// --- Google SVG Icon Component ---
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.988,36.635,44,30.836,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  const [otpStep, setOtpStep] = useState<'enterPhone' | 'enterOtp'>('enterPhone');
  const [phoneNumber, setPhoneNumber] = useState('');

  // --- React Hook Form instances ---
  const { register: emailRegister, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm<EmailLoginFormData>({
    resolver: zodResolver(emailLoginSchema),
  });
  const { register: mobileRegister, handleSubmit: handleMobileSubmit, formState: { errors: mobileErrors } } = useForm<MobileFormData>({
    resolver: zodResolver(mobileSchema),
  });
  const { register: otpRegister, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  // --- Tanstack Query Mutations ---
  const emailMutation = useMutation({
    mutationFn: loginWithEmail,
    onSuccess: (data) => {
      login(data);
      toast.success('Logged in successfully!');
      navigate('/account');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed.');
    }
  });

  const otpSendMutation = useMutation({
      mutationFn: sendOtp,
      onSuccess: () => {
          toast.success('OTP sent to your mobile!');
          setOtpStep('enterOtp');
      },
      onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to send OTP.');
      }
  });

  const otpVerifyMutation = useMutation({
      mutationFn: verifyOtp,
      onSuccess: (data) => {
          login(data);
          toast.success('Logged in successfully!');
          navigate('/account');
      },
      onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Invalid OTP.');
      }
  });

  // --- Submission Handlers ---
  const onEmailSubmit = (data: EmailLoginFormData) => emailMutation.mutate(data);
  const onMobileSubmit = (data: MobileFormData) => {
    setPhoneNumber(data.phone);
    otpSendMutation.mutate(data);
  };
  const onOtpSubmit = (data: OtpFormData) => {
    otpVerifyMutation.mutate({ phone: phoneNumber, otp: data.otp });
  };
  const handleGoogleLogin = () => {
    // This should redirect to your backend's Google OAuth endpoint
    // Example: window.location.href = `${api.defaults.baseURL}/auth/google`;
    toast.success('Redirecting to Google Sign-In...');
  };

  return (
    <>
      <SEO title="Login / Register" description="Log in or register for a Siddhi Divine account." />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-center font-sans text-4xl font-bold text-secondary">Sign In or Create Account</h1>
          
          <div className="mt-8 space-y-4">
             {/* Google Login */}
            <Button variant="outline" className="w-full flex items-center justify-center" onClick={handleGoogleLogin}>
                <GoogleIcon />
                Continue with Google
            </Button>

            <div className="flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            {/* Login Forms Card */}
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border">
              {/* Tabs */}
              <div className="flex border-b mb-6">
                <button 
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 font-semibold text-center flex items-center justify-center gap-2 ${loginMethod === 'email' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                >
                  <Mail size={18} /> Email
                </button>
                <button
                  onClick={() => setLoginMethod('mobile')}
                  className={`flex-1 py-2 font-semibold text-center flex items-center justify-center gap-2 ${loginMethod === 'mobile' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                >
                  <Phone size={18} /> Mobile
                </button>
              </div>

              {/* Email Form */}
              {loginMethod === 'email' && (
                <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-6">
                  {emailMutation.isError && <Alert type="error" message={emailMutation.error.response?.data?.message || "An error occurred."} />}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <Input id="email" type="email" {...emailRegister('email')} error={emailErrors.email?.message} className="mt-1" />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <Input id="password" type="password" {...emailRegister('password')} error={emailErrors.password?.message} className="mt-1" />
                  </div>
                  <Button type="submit" className="w-full" isLoading={emailMutation.isPending}>Continue with Email</Button>
                </form>
              )}

              {/* Mobile Form */}
              {loginMethod === 'mobile' && (
                <div>
                  {otpStep === 'enterPhone' ? (
                    <form onSubmit={handleMobileSubmit(onMobileSubmit)} className="space-y-6">
                      <p className="text-sm text-center text-gray-500">We will send you a one-time password (OTP).</p>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                        <Input id="phone" type="tel" placeholder="10-digit number" {...mobileRegister('phone')} error={mobileErrors.phone?.message} className="mt-1" />
                      </div>
                      <Button type="submit" className="w-full" isLoading={otpSendMutation.isPending}>Send OTP</Button>
                    </form>
                  ) : (
                    <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-6">
                      <p className="text-sm text-center text-gray-500">Enter the OTP sent to <strong>{phoneNumber}</strong>.</p>
                       <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
                        <Input id="otp" type="text" placeholder="6-digit OTP" {...otpRegister('otp')} error={otpErrors.otp?.message} className="mt-1" />
                      </div>
                      <Button type="submit" className="w-full" isLoading={otpVerifyMutation.isPending}>Verify & Continue</Button>
                       <button type="button" onClick={() => setOtpStep('enterPhone')} className="text-sm text-center w-full text-primary hover:underline">
                        Change Number
                       </button>
                    </form>
                  )}
                </div>
              )}

            </div>
            <p className="text-center text-xs text-gray-500 mt-6">
              By continuing, you agree to Siddhi Divine's <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
