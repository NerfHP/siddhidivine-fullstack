import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import SEO from '@/components/shared/SEO';
import Button from '@/components/shared/Button';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

// This declares the KwikPass object on the window for TypeScript
declare global {
  interface Window {
    kwikpass: any;
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // This hook runs when the page loads. It checks if KwikPass has redirected the user back.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const kwikpassToken = params.get('kwikpass-token');

    if (kwikpassToken) {
      // A token from KwikPass was found in the URL.
      // Now, we must send it to our own backend for secure verification.
      api.post('/auth/kwikpass-verify', { token: kwikpassToken })
        .then(response => {
          // Our backend verified the token and sent back our own session token (JWT).
          login(response.data);
          toast.success('Logged in successfully!');
          navigate('/account'); // Redirect to the user's account page
        })
        .catch(() => {
          toast.error('Login verification failed. Please try again.');
          // Clean the token from the URL
          navigate('/login', { replace: true });
        });
    }
  }, [location, login, navigate]);

  // This function is called when the user clicks the login button.
  const handleKwikpassLogin = () => {
    if (window.kwikpass) {
      // This triggers the KwikPass popup.
      window.kwikpass.login();
    } else {
      toast.error('Login service is currently unavailable. Please try again later.');
    }
  };

  return (
    <>
      <SEO title="Login / Signup" description="Log in or sign up for a Siddhi Divine account with a secure OTP." />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-sm mx-auto text-center">
          <h1 className="text-center font-sans text-4xl font-bold text-secondary">Welcome to Siddhi Divine</h1>
          <p className="mt-4 text-center text-gray-600">
            Sign in or create an account instantly with a secure, one-time password.
          </p>
          
          <div className="mt-8">
            <Button 
              size="lg" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleKwikpassLogin}
            >
              Login or Signup with Mobile OTP
            </Button>
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-6">
            By continuing, you agree to our <a href="/terms" className="underline">Terms</a> and <a href="/privacy-policy" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </>
  );
}

