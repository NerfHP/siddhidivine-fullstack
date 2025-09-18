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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const registerUser = async (data: RegisterFormData) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      login(data);
      toast.success('Account created successfully!');
      navigate('/account');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    }
  });

  const onSubmit = (data: RegisterFormData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <SEO title="Register" description="Create a new account with Siddhi Divine." />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-center font-sans text-4xl font-bold text-secondary">Create Account</h1>
          <p className="mt-4 text-center text-gray-600">
            Join our community to start your journey.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md">
            {mutation.isError && <Alert type="error" message={mutation.error.response?.data?.message || "An error occurred."} />}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <Input id="name" {...register('name')} error={errors.name?.message} className="mt-1" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <Input id="email" type="email" {...register('email')} error={errors.email?.message} className="mt-1" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <Input id="password" type="password" {...register('password')} error={errors.password?.message} className="mt-1" />
            </div>
            <Button type="submit" className="w-full" isLoading={mutation.isPending}>
              Create Account
            </Button>
            <p className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}