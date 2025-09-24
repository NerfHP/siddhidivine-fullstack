import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react'; // --- NEW: Import the useUser hook from Clerk ---
import Spinner from '@/components/shared/Spinner';

/**
 * A route guard component for the admin dashboard, now powered by Clerk.
 * - It checks if the user's data has been loaded.
 * - It verifies that the user is not only signed in but also has the 'admin' role
 * in their public metadata.
 * - If the user is not an admin, it redirects them to the homepage.
 */
export default function AdminRoute() {
  // Get the user object and the loading state from Clerk's useUser hook.
  const { user, isLoaded } = useUser();

  // While Clerk is checking the user's session, show a loading spinner.
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // After loading, check if the user is signed in and if their public metadata
  // contains the role 'admin'.
  if (!user || user.publicMetadata?.role !== 'admin') {
    // If not an admin, redirect them to the homepage.
    return <Navigate to="/" replace />;
  }

  // If the user is a verified admin, render the nested admin pages.
  return <Outlet />;
}