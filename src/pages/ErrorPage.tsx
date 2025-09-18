import { useRouteError, Link } from 'react-router-dom';
import SEO from '@/components/shared/SEO';

export default function ErrorPage() {
  const error = useRouteError() as any;

  // This will help us find the original problem
  console.error("--- ORIGINAL ERROR CAUGHT BY BOUNDARY ---", error);

  return (
    <>
      <SEO title="Error" description="An unexpected error has occurred." />
      <div id="error-page" className="flex min-h-screen flex-col items-center justify-center text-center">
        <h1 className="font-sans text-4xl font-bold">Oops!</h1>
        <p className="mt-4 text-lg">Sorry, an unexpected error has occurred.</p>
        <p className="mt-2 text-gray-500">
          <i>{error.statusText || error.message}</i>
        </p>
        {/* Using a plain, safe Link component instead of our custom Button */}
        <Link 
          to="/" 
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Go back home
        </Link>
      </div>
    </>
  );
}