import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/components/shared/Spinner';

/**
 * A route guard component for the admin dashboard.
 * - It checks if the user is authenticated and has the 'admin' role.
 * - While checking, it shows a loading spinner.
 * - If the user is not an admin, it redirects them to the homepage.
 * - If the user is an admin, it renders the nested admin page.
 */
export default function AdminRoute() {
  const { user, loading } = useAuth();

  // Show a loading spinner while the authentication state is being determined.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If the user is not authenticated or is not an admin, redirect to the homepage.
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // If the user is an authenticated admin, render the requested admin page.
  return <Outlet />;
}
