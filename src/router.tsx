import { createBrowserRouter } from 'react-router-dom';
import React, { Suspense } from 'react';
import RootLayout from './components/layout/RootLayout';
import HomePage from './pages/HomePage';
import Spinner from './components/shared/Spinner';
import NotFoundPage from './pages/NotFoundPage';
import ErrorPage from './pages/ErrorPage';

// --- ADMIN IMPORTS ---
import AdminRoute from '@/components/shared/AdminRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import ProductsAdminPage from '@/pages/admin/ProductsAdminPage';

// Lazy load pages for better performance
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'));
const ServicesPage = React.lazy(() => import('./pages/ServicesPage'));
const ServiceDetailPage = React.lazy(() => import('./pages/ServiceDetailPage'));
const BlogPage = React.lazy(() => import('./pages/BlogPage'));
const ArticleDetailPage = React.lazy(() => import('./pages/ArticleDetailPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const AccountPage = React.lazy(() => import('./pages/AccountPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const TrackOrderPage = React.lazy(() => import('./pages/TrackOrderPage'));
const BestsellersPage = React.lazy(() => import('./pages/BestsellersPage'));
const FaqsPage = React.lazy(() => import('./pages/FaqsPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const ShippingPolicyPage = React.lazy(() => import('./pages/ShippingPolicyPage'));
const ReturnsPolicyPage = React.lazy(() => import('./pages/ReturnsPolicyPage'));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex h-96 items-center justify-center">
        <Spinner />
      </div>
    }
  >
    {children}
  </Suspense>
);
export default SuspenseWrapper;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },

      // --- Main Routes for Products & Categories ---
      {
        path: 'products',
        children: [
          {
            index: true, // /products
            element: <SuspenseWrapper><ProductsPage /></SuspenseWrapper>,
          },
          {
            // Category browsing (any depth)
            path: '*',
            element: <SuspenseWrapper><CategoryPage /></SuspenseWrapper>,
          },
        ]
      },
      {
        // Product detail route moved to singular base to avoid slug collision with top-level categories
        path: 'product/:productSlug',
        element: <SuspenseWrapper><ProductDetailPage /></SuspenseWrapper>,
      },
      
      // --- Other Application Routes ---
      {
        path: 'services',
        element: <SuspenseWrapper><ServicesPage /></SuspenseWrapper>,
      },
      {
        path: 'services/:slug',
        element: <SuspenseWrapper><ServiceDetailPage /></SuspenseWrapper>,
      },
      {
        path: 'blog',
        element: <SuspenseWrapper><BlogPage /></SuspenseWrapper>,
      },
      {
        path: 'blog/:slug',
        element: <SuspenseWrapper><ArticleDetailPage /></SuspenseWrapper>,
      },
      {
        path: 'about',
        element: <SuspenseWrapper><AboutPage /></SuspenseWrapper>,
      },
      {
        path: 'contact',
        element: <SuspenseWrapper><ContactPage /></SuspenseWrapper>,
      },
      {
        path: 'account',
        element: <SuspenseWrapper><AccountPage /></SuspenseWrapper>,
      },
      {
        path: 'cart',
        element: <SuspenseWrapper><CartPage /></SuspenseWrapper>,
      },
      {
        path: 'checkout',
        element: <SuspenseWrapper><CheckoutPage /></SuspenseWrapper>,
      },
      {
        path: 'returns-policy',
        element: <SuspenseWrapper><ReturnsPolicyPage /></SuspenseWrapper>,
      },
      {
        path: 'Terms-and-Conditions',
        element: <SuspenseWrapper><TermsPage /></SuspenseWrapper>,
      },
      {
        path: 'Privacy-Policy',
        element: <SuspenseWrapper><PrivacyPolicyPage /></SuspenseWrapper>,
      },
      {
        path: 'Shipping-Policy',
        element: <SuspenseWrapper><ShippingPolicyPage /></SuspenseWrapper>,
      },      
      {
        path: 'track-order',
        element: <SuspenseWrapper><TrackOrderPage /></SuspenseWrapper>,
      },
      {
        path: 'bestsellers',
        element: <SuspenseWrapper><BestsellersPage /></SuspenseWrapper>,
      },
      {
        path: 'faqs',
        element: <SuspenseWrapper><FaqsPage /></SuspenseWrapper>,
      },

      // --- Catch-All 404 Route ---
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // --- ADMIN ROUTE SETUP ---
  {
    path: '/admin',
    element: <AdminRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <ProductsAdminPage /> },
          { path: 'products', element: <ProductsAdminPage /> },
        ],
      },
    ],
  },
]);
