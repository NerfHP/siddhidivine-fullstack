import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import SEO from "@/components/shared/SEO";
import Button from "@/components/shared/Button";
import toast from "react-hot-toast";
import { User, Package, BookUser, ShieldCheck, LogOut } from "lucide-react";

// Define the type for the active view
type AccountView = 'profile' | 'orders' | 'addresses' | 'security';

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  // State to manage which section of the account is being viewed
  const [activeView, setActiveView] = useState<AccountView>('orders');

  if (!isAuthenticated) {
    // Redirect to login if the user is not authenticated
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate("/");
  };
  
  // Helper function to render the correct view based on state
  const renderActiveView = () => {
    switch (activeView) {
      case 'profile':
        return <ProfileDetailsView />;
      case 'orders':
        return <OrderHistoryView />;
      case 'addresses':
        return <ManageAddressesView />;
      case 'security':
        return <AccountSecurityView />;
      default:
        return <OrderHistoryView />;
    }
  };

  return (
    <>
      <SEO title="My Account" description="Manage your Siddhi Divine account details." />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* --- Left Sidebar Navigation --- */}
          <aside className="md:w-1/4">
            <div className="p-4 bg-white rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-4 border-b pb-4">
                 <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                   {user?.name?.charAt(0).toUpperCase()}
                 </div>
                 <div>
                    <h2 className="font-bold text-text-main">{user?.name}</h2>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                 </div>
              </div>
              <nav className="flex flex-col space-y-2">
                <NavItem icon={Package} label="My Orders" view="orders" activeView={activeView} setActiveView={setActiveView} />
                <NavItem icon={User} label="Profile Details" view="profile" activeView={activeView} setActiveView={setActiveView} />
                <NavItem icon={BookUser} label="Manage Addresses" view="addresses" activeView={activeView} setActiveView={setActiveView} />
                <NavItem icon={ShieldCheck} label="Account Security" view="security" activeView={activeView} setActiveView={setActiveView} />
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-primary transition-colors">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </aside>
          
          {/* --- Main Content Area --- */}
          <main className="flex-1">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md min-h-[400px]">
              {renderActiveView()}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// --- Reusable Navigation Item Component ---
const NavItem = ({ icon: Icon, label, view, activeView, setActiveView }: { icon: React.ElementType, label: string, view: AccountView, activeView: AccountView, setActiveView: (view: AccountView) => void }) => {
  const isActive = activeView === view;
  return (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors text-left ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
};

// --- Component for Order History View ---
const OrderHistoryView = () => (
  <div>
    <h1 className="font-sans text-3xl font-bold text-secondary mb-6">My Orders</h1>
    <div className="text-center py-16 text-gray-500">
      <Package size={48} className="mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
      <p>Your past orders will appear here. Start shopping to place your first order!</p>
    </div>
  </div>
);

// --- Component for Profile Details View ---
const ProfileDetailsView = () => {
    const { user } = useAuth();
    // In a real app, you'd use state for these fields
    return (
        <div>
            <h1 className="font-sans text-3xl font-bold text-secondary mb-6">Profile Details</h1>
            <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" id="fullName" defaultValue={user?.name || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" id="email" value={user?.email || ''} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" id="phone" defaultValue={user?.phone || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                </div>
                <div className="pt-4">
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </div>
    );
};

// --- Component for Manage Addresses View ---
const ManageAddressesView = () => (
    <div>
        <h1 className="font-sans text-3xl font-bold text-secondary mb-6">Manage Addresses</h1>
        <div className="text-center py-16 text-gray-500">
            <BookUser size={48} className="mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Saved Addresses</h3>
            <p>Add a new address to make your checkout process faster.</p>
            <Button className="mt-4">Add New Address</Button>
        </div>
    </div>
);

// --- Component for Account Security View ---
const AccountSecurityView = () => (
    <div>
        <h1 className="font-sans text-3xl font-bold text-secondary mb-6">Account Security</h1>
        <div className="space-y-4">
            <p className="text-gray-600">For your security, we recommend changing your password periodically. A password reset link will be sent to your registered email address.</p>
            <Button variant="secondary">Change Password</Button>
        </div>
    </div>
);
