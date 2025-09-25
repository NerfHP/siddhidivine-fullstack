import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Truck, CheckCircle, Lightbulb, LoaderCircle } from 'lucide-react';
import SEO from '../components/shared/SEO';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../types';
// --- MODIFIED: Import the specific createOrder function ---
import { createOrder } from '../lib/api';
import api from '../lib/api'; // Keep this for the payment/create-order call
import toast from 'react-hot-toast';
// --- ADDED: Import the useUser hook to get the logged-in user ---
import { useUser } from '@clerk/clerk-react';

// --- CONFIGURATION FOR YOUR STORE ---
const SHIPPING_COST = 50.00;
const FREE_SHIPPING_THRESHOLD = 1000;
const TAX_RATE = 0.05;
// ------------------------------------

// --- MODIFIED: Removed the email field from the validation schema ---
const shippingSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  address: z.string().min(5, "A valid address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().regex(/^\d{6}$/, "Must be a 6-digit zip code"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit mobile number"),
});
type ShippingFormData = z.infer<typeof shippingSchema>;


// --- ADDED: Safe Image Parsing Helper to prevent crashes ---
const getFirstImage = (images: string | unknown): string => {
  const placeholder = 'https://placehold.co/100x100/f0f0f0/a0a0a0?text=Image';
  if (typeof images !== 'string' || images.trim() === '') return placeholder;
  try {
    const parsedImages = JSON.parse(images);
    if (Array.isArray(parsedImages) && parsedImages.length > 0 && typeof parsedImages[0] === 'string') {
      return parsedImages[0];
    }
  } catch (e) {
    console.error("Failed to parse images JSON string:", images, e);
  }
  return placeholder;
};

// --- Sub-Components ---
const ProgressIndicator = ({ step, setStep }: { step: number; setStep: (newStep: number) => void }) => {
  const steps = ['Shipping', 'Payment', 'Confirmation'];
  return (
    <div className="flex items-center justify-center space-x-4 mb-12">
      {steps.map((label, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <button
              onClick={() => step > index + 1 && setStep(index + 1)}
              disabled={step <= index + 1}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${step > index + 1 ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600' : step === index + 1 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              {step > index + 1 ? <CheckCircle size={20} /> : index + 1}
            </button>
            <p className={`mt-2 text-xs font-semibold ${step > index + 1 ? 'cursor-pointer' : ''} ${step >= index + 1 ? 'text-gray-800' : 'text-gray-400'}`}>{label}</p>
          </div>
          {index < steps.length - 1 && <div className={`flex-1 h-1 ${step > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
};

const OrderSummary = ({ items, totals }: { items: CartItem[], totals: { subtotal: number, shipping: number, tax: number, total: number } }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-4 border-b pb-3">Order Summary</h3>
        {items.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Your cart is empty.</p>
        ) : (
        <>
            <div className="space-y-3">
                {/* --- ERROR FIX: Added a check to ensure 'items' is an array before mapping --- */}
                {Array.isArray(items) && items.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={getFirstImage(item.images)} alt={item.name} className="w-12 h-12 object-cover rounded-md bg-gray-100" />
                            <div>
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="text-sm font-semibold">₹{(item.salePrice || item.price || 0).toLocaleString('en-IN')}</p>
                    </div>
                ))}
            </div>
            {totals.subtotal < FREE_SHIPPING_THRESHOLD && totals.subtotal > 0 && (
              <div className="text-center text-xs text-green-700 bg-green-50 p-3 rounded-md my-4 border border-green-200">
                Add <strong>₹{(FREE_SHIPPING_THRESHOLD - totals.subtotal).toLocaleString('en-IN')}</strong> more for <strong>FREE delivery!</strong>
              </div>
            )}
            <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{totals.subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className={totals.shipping === 0 ? 'text-green-600 font-semibold' : ''}>{totals.shipping === 0 ? 'FREE' : `₹${totals.shipping.toLocaleString('en-IN')}`}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Taxes (5%)</span><span>₹{totals.tax.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t"><span >Total</span><span>₹{totals.total.toLocaleString('en-IN')}</span></div>
            </div>
        </>
        )}
    </div>
);

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingDetails, setShippingDetails] = useState<ShippingFormData | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const navigate = useNavigate();

  const { cartItems, subtotal, clearCart } = useCart();
  // --- ADDED: Get authenticated user details from Clerk ---
  const { user, isLoaded } = useUser();

  const totals = useMemo(() => {
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [subtotal]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ShippingFormData>({ resolver: zodResolver(shippingSchema) });

  // --- ADDED: Pre-fill the form with user data when it loads ---
  useEffect(() => {
    if (isLoaded && user) {
        reset({
            fullName: user.fullName || '',
            phone: user.primaryPhoneNumber?.phoneNumber.slice(3) || '', // Assumes +91 prefix to remove
        });
    }
  }, [isLoaded, user, reset]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { // Cleanup function to remove script on component unmount
        if (document.body.contains(script)) {
            document.body.removeChild(script);
        }
    }
  }, []);

  const onShippingSubmit = (data: ShippingFormData) => {
    setShippingDetails(data);
    setStep(2);
  };
  
  // --- MODIFIED: Uses the new createOrder function and secure user data ---
  const handlePlaceOrder = async (paymentResponse?: { razorpay_payment_id: string }) => {
    if (!shippingDetails) return;
    try {
      const orderPayload = {
        shippingDetails,
        cartItems: cartItems.map(item => ({ 
            id: item.id, 
            quantity: item.quantity, 
            // --- FIX APPLIED HERE: Provide a fallback of 0 if price is null/undefined ---
            price: item.price ?? 0, 
            salePrice: item.salePrice 
        })),
        total: totals.total,
        paymentId: paymentResponse?.razorpay_payment_id
      };
      // --- FIX APPLIED: The newOrder variable is now used ---
      const newOrder = await createOrder(orderPayload);
      setOrderId(newOrder.id); // Store the new order ID
      toast.success("Order placed! Check your email for a receipt.");
      clearCart();
      setStep(3);
    } catch (error) {
      toast.error("There was an issue saving your order.");
    }
  };
  
  const handleProceedToPayment = async () => {
    if (!shippingDetails || !user) return;
    setIsProcessingPayment(true);
    try {
      const { data: order } = await api.post('/payment/create-order', { amount: totals.total });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Siddhi Divine",
        description: "Order Payment",
        order_id: order.id,
        handler: (response: any) => { handlePlaceOrder(response); },
        // --- MODIFIED: Prefill data now comes securely from the Clerk user object ---
        prefill: { 
            name: shippingDetails.fullName, 
            email: user.primaryEmailAddress?.emailAddress, 
            contact: shippingDetails.phone 
        },
        theme: { color: "#c0392b" }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Could not connect to payment gateway.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-3 rounded-r-lg mb-6 flex items-center gap-3">
                <Lightbulb size={20} />
                <p className="text-xs font-medium">Your name and phone may be pre-filled from your account.</p>
            </div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><Truck size={24} /> Shipping Details</h2>
            <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-4">
                <div><input {...register('fullName')} placeholder="Full Name" className="w-full p-3 border rounded-md" /><p className="text-red-500 text-xs mt-1">{errors.fullName?.message}</p></div>
                {/* --- REMOVED: Email input is no longer needed --- */}
                <div><input {...register('address')} placeholder="Street Address" className="w-full p-3 border rounded-md" /><p className="text-red-500 text-xs mt-1">{errors.address?.message}</p></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><input {...register('city')} placeholder="City" className="w-full p-3 border rounded-md" /><p className="text-red-500 text-xs mt-1">{errors.city?.message}</p></div>
                    <div><input {...register('state')} placeholder="State" className="w-full p-3 border rounded-md" /><p className="text-red-500 text-xs mt-1">{errors.state?.message}</p></div>
                    <div><input {...register('zipCode')} placeholder="Zip Code" className="w-full p-3 border rounded-md" /><p className="text-red-500 text-xs mt-1">{errors.zipCode?.message}</p></div>
                </div>
                <div><input {...register('phone')} placeholder="Mobile Number" className="w-full p-3 border rounded-md" /><p className="text-red-500 text-xs mt-1">{errors.phone?.message}</p></div>
                <button type="submit" className="w-full bg-red-500 text-white font-bold py-3 rounded-md hover:bg-red-600">Proceed to Payment</button>
            </form>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <h2 className="text-2xl font-semibold mb-6">Confirm and Pay</h2>
             <div className="space-y-4 bg-gray-50 p-4 rounded-md border mb-6">
               <div>
                 <h4 className="font-semibold text-sm text-gray-500">Shipping To:</h4>
                 <p className="text-sm">{shippingDetails?.fullName}, {shippingDetails?.address}</p>
               </div>
             </div>
             <p className="text-sm text-gray-600 mb-6">Clicking "Pay Securely" will open the Razorpay window where you can choose UPI, Paytm, PhonePe, or Card options.</p>
             <div className="flex items-center justify-between gap-4 mt-8">
               <button onClick={() => setStep(1)} type="button" className="text-sm font-semibold text-gray-600 hover:text-black">← Edit Shipping</button>
               <button onClick={handleProceedToPayment} disabled={isProcessingPayment} className="w-1/2 bg-green-500 text-white font-bold py-3 rounded-md hover:bg-green-600 flex items-center justify-center gap-2 disabled:bg-gray-400">
                  {isProcessingPayment ? <LoaderCircle size={16} className="animate-spin" /> : <Lock size={16}/>}
                  Pay Securely
               </button>
             </div>
          </motion.div>
        );
      case 3:
          return (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold">Thank You!</h2>
                <p className="text-gray-600 mt-2">Your order has been placed successfully.</p>
                {/* --- ADDED: Display the order ID --- */}
                {orderId && <p className="text-sm text-gray-500 mt-2">Order ID: {orderId}</p>}
                <p className="text-gray-600">A confirmation receipt has been sent to your email.</p>
                <button onClick={() => navigate('/')} className="mt-8 bg-red-500 text-white font-bold py-3 px-6 rounded-md hover:bg-red-600">
                    Continue Shopping
                </button>
            </motion.div>
          );
      default:
        return null;
    }
  };

  return (
    <>
      <SEO title="Checkout" description="Complete your purchase securely." />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <Link to="/" className="text-2xl font-bold font-sans mb-8 block text-center">Siddhi Divine Checkout</Link>
          <div className="max-w-4xl mx-auto">
            <ProgressIndicator step={step} setStep={setStep} />
            <div className={`grid grid-cols-1 ${step === 3 ? '' : 'md:grid-cols-2'} gap-8 lg:gap-12`}>
              <div className={`bg-white p-6 sm:p-8 rounded-lg shadow-md border ${step === 3 ? 'md:col-span-2' : ''}`}>
                <AnimatePresence mode="wait">
                    {renderStep()}
                </AnimatePresence>
              </div>
              <div className={step === 3 ? 'hidden' : 'md:order-first'}>
                <OrderSummary items={cartItems} totals={totals} />
              </div>
            </div>
              <p className="text-xs text-gray-400 text-center mt-8 flex items-center justify-center gap-1"><Lock size={12}/> Secure Checkout Guaranteed</p>
          </div>
        </div>
      </div>
    </>
  );
}
