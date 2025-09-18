import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

import SEO from "@/components/shared/SEO";
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const submitContactForm = async (data: ContactFormData) => {
  const response = await api.post('/form/contact', data);
  return response.data;
};

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const mutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: () => {
      toast.success('Your message has been sent successfully!');
      reset();
    },
    onError: () => {
      toast.error('Failed to send message. Please try again later.');
    }
  });

  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <SEO 
        title="Contact Us"
        description="Get in touch with us for any inquiries, support, or feedback. We are here to help you on your spiritual journey."
      />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <h1 className="text-center font-sans text-4xl font-bold text-secondary">Contact Us</h1>
          <p className="mt-4 text-center text-lg text-gray-600">
            Have a question or need assistance? Fill out the form below.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <Input
                id="name"
                {...register('name')}
                error={errors.name?.message}
                className="mt-1"
              />
            </div>
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
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                id="message"
                rows={4}
                {...register('message')}
                className={`mt-1 flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${errors.message ? 'border-red-500' : ''}`}
              />
              {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
            </div>
            <Button type="submit" className="w-full" isLoading={mutation.isPending}>
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}