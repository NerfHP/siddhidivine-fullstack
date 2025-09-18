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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const loginUser = async (data: LoginFormData) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data);
      toast.success('Logged in successfully!');
      navigate('/account');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    }
  });

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <SEO title="Login" description="Log in to your Siddhi Divine account." />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-center font-sans text-4xl font-bold text-secondary">Login</h1>
          <p className="mt-4 text-center text-gray-600">
            Welcome back! Access your account.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md">
            {mutation.isError && <Alert type="error" message={mutation.error.response?.data?.message || "An error occurred."} />}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                error={errors.password?.message}
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" isLoading={mutation.isPending}>
              Login
            </Button>
            <p className="text-center text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}