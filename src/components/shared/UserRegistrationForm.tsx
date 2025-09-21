import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { motion } from 'framer-motion';
import { User, UserRegistrationData } from '@/types';

// Registration form validation schema
const registrationSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name should only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must not exceed 100 characters'),
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must not exceed 200 characters'),
  alternativePhone: z.string()
    .regex(/^[0-9]{10}$/, 'Alternative phone must be 10 digits')
    .optional()
    .or(z.literal('')),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface UserRegistrationFormProps {
  userId: string;
  phoneNumber: string;
  onSuccess: (userData: { user: User; tokens: any }) => void;
}

const completeRegistration = async (userId: string, data: UserRegistrationData) => {
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
    defaultValues: {
      name: '',
      email: '',
      address: '',
      alternativePhone: '',
    }
  });

  const registrationMutation = useMutation({
    mutationFn: (data: UserRegistrationData) => completeRegistration(userId, data),
    onSuccess: (data) => {
      toast.success('Registration completed successfully!');
      onSuccess(data);
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    // Convert empty string to undefined for alternativePhone
    const submitData = {
      ...data,
      alternativePhone: data.alternativePhone || undefined,
    };
    registrationMutation.mutate(submitData);
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
        <p className="text-xs text-gray-500">
          Phone: +91{phoneNumber}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </span>
            <Input
              type="text"
              placeholder="Enter your full name"
              {...register('name')}
              error={errors.name?.message}
            />
          </label>
        </div>

        {/* Email */}
        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </span>
            <Input
              type="email"
              placeholder="Enter your email address"
              {...register('email')}
              error={errors.email?.message}
            />
          </label>
        </div>

        {/* Address */}
        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </span>
            <textarea
              placeholder="Enter your full address"
              rows={3}
              className="flex w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              {...register('address')}
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
            )}
          </label>
        </div>

        {/* Alternative Phone */}
        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Alternative Phone Number (Optional)
            </span>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+91</span>
              <Input
                type="tel"
                placeholder="10-digit number"
                className="pl-12"
                {...register('alternativePhone')}
                error={errors.alternativePhone?.message}
              />
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          isLoading={registrationMutation.isPending}
        >
          {registrationMutation.isPending ? 'Completing Registration...' : 'Complete Registration'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          By completing registration, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </motion.div>
  );
}