import { NavLink, Outlet } from 'react-router-dom';
import { Package, ShoppingCart, Star, HelpCircle } from 'lucide-react'; // Corrected icon import

const adminNavItems = [
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle }, // Corrected icon usage
];

/**
 * A layout component for the admin dashboard.
 * It includes a sidebar for navigation and a main content area
 * where the different admin pages will be rendered.
 */
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-white border-r">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-4 px-2">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

