'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  BarChart2, 
  FileText, 
  Settings, 
  LogOut,
  AlertTriangle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Navigation Item Component
const NavItem = ({ href, icon: Icon, label, active }) => {
  return (
    <Link 
      href={href} 
      className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-white ${
        active ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch the logged-in user from localStorage or an API
  useEffect(() => {
    const getUserFromLocalStorage = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Check if user is admin
          const userLevel = parsedUser.userlevel?.toLowerCase();
          if (userLevel !== 'admin') {
            setError('You do not have admin access privileges');
            setTimeout(() => {
              router.push('/dashboard');
            }, 3000);
          }
        } else {
          setError('User not authenticated');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Error loading user data');
      } finally {
        setLoading(false);
      }
    };
    
    getUserFromLocalStorage();
  }, [router]);
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };
  
  // If there's an error or loading, show a message
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="spinner h-12 w-12 border-4 border-t-indigo-600 border-r-transparent border-b-indigo-600 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center text-red-600 mb-4">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-bold">Access Error</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-gray-500 mb-4">Redirecting you to the appropriate page...</p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center text-red-600 mb-4">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-bold">Authentication Required</h2>
          </div>
          <p className="text-gray-600 mb-4">You need to log in to access the admin panel.</p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-indigo-800 text-white z-10 shadow-lg">
        <div className="flex items-center justify-center h-16 border-b border-indigo-700">
          <h1 className="text-xl font-bold">Smart Crop</h1>
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-6">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              {user.username?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <h2 className="text-sm font-medium">{user.username || 'Admin User'}</h2>
              <p className="text-xs text-indigo-300">{user.email || 'admin@example.com'}</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <NavItem 
              href="/admin/dashboard" 
              icon={Home} 
              label="Dashboard" 
              active={pathname === '/admin/dashboard'} 
            />
            <NavItem 
              href="/admin/users" 
              icon={Users} 
              label="Users" 
              active={pathname === '/admin/users'} 
            />
            <NavItem 
              href="/admin/predictions" 
              icon={BarChart2} 
              label="Predictions" 
              active={pathname === '/admin/predictions'} 
            />
            <NavItem 
              href="/admin/resources" 
              icon={FileText} 
              label="Resources" 
              active={pathname === '/admin/resources'} 
            />
            <NavItem 
              href="/admin/settings" 
              icon={Settings} 
              label="Settings" 
              active={pathname === '/admin/settings'} 
            />
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg hover:bg-indigo-700 text-indigo-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="ml-64 flex-1">
        {children}
      </div>
    </div>
  );
}