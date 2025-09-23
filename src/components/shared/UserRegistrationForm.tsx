import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Button from './Button';
import Input from './Input';
import { motion } from 'framer-motion';
import { User } from '../../types';

// --- UPDATED: Registration schema now includes password fields ---
const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  alternativePhone: z.string().optional().or(z.literal('')),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface UserRegistrationFormProps {
  userId: string;
  phoneNumber: string;
  onSuccess: (userData: { user: User; tokens: any }) => void;
}

// The API function now expects the password in the data
const completeRegistration = async (userId: string, data: Omit<RegistrationFormData, 'confirmPassword'>) => {
  const response = await api.post(`/auth/complete-registration/${userId}`, data);
  return response.data;
};

export default function UserRegistrationForm({ 
  userId, 
  phoneNumber, 
  onSuccess 
}: UserRegistrationFormProps) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const registrationMutation = useMutation({
    mutationFn: (data: Omit<RegistrationFormData, 'confirmPassword'>) => completeRegistration(userId, data),
    onSuccess: (data) => {
      toast.success('Registration completed successfully!');
      onSuccess(data);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    const { confirmPassword, ...submitData } = data;
    registrationMutation.mutate({
        ...submitData,
        alternativePhone: submitData.alternativePhone || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="font-bold text-xl text-gray-900">Complete Your Profile</h3>
        <p className="text-sm text-gray-600">
          Welcome! Please fill in your details to complete your registration.
        </p>
        <p className="text-xs text-gray-500">Phone: +91{phoneNumber}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name, Email, Address inputs remain the same... */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
          <Input type="text" placeholder="Enter your full name" {...register('name')} error={errors.name?.message} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
          <Input type="email" placeholder="Enter your email address" {...register('email')} error={errors.email?.message} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
          <textarea placeholder="Enter your full address" rows={3} className="flex w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm" {...register('address')} />
          {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>}
        </div>

        {/* --- NEW: Password Fields --- */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Create Password <span className="text-red-500">*</span></label>
            <Input type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
            <Input type="password" placeholder="••••••••" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
        </div>
        
        {/* Alternative Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Alternative Phone (Optional)</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+91</span>
            <Input type="tel" placeholder="10-digit number" className="pl-12" {...register('alternativePhone')} error={errors.alternativePhone?.message} />
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={registrationMutation.isPending}>
          {registrationMutation.isPending ? 'Completing Registration...' : 'Complete Registration'}
        </Button>
      </form>
    </motion.div>
  );
}

