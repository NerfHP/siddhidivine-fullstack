import { Link } from 'react-router-dom';
import Button from '@/components/shared/Button';
import SEO from '@/components/shared/SEO';

export default function NotFoundPage() {
  return (
    <>
      <SEO title="404 - Not Found" description="The page you are looking for does not exist." />
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="mt-4 font-sans text-3xl font-bold text-secondary">
          Page Not Found
        </h2>
        <p className="mt-2 text-gray-600">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Go back home</Link>
        </Button>
      </div>
    </>
  );
}