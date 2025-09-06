'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { 
  Home, 
  Users, 
  BarChart2, 
  FileText, 
  Settings, 
  LogOut,
  AlertTriangle,
  Menu,
  X,
  Sun,
  Moon,
  User
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Navigation Item Component
const NavItem = ({ href, icon: Icon, label, active, collapsed }) => {
  return (
    <Link 
      href={href} 
      className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-white transition-all duration-200 ${
        active ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
      title={collapsed ? label : ''}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className={`transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
        {label}
      </span>
    </Link>
  );
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex transition-colors duration-300">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 bg-indigo-800 text-white z-50 shadow-lg transition-all duration-300
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 border-b border-indigo-700 px-4">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold">Smart Crop</h1>
          )}
          <div className="flex items-center space-x-2">
            {/* Desktop Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block p-1 rounded hover:bg-indigo-700 transition-colors"
            >
              {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
            {/* Mobile Close */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-indigo-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* User Info */}
          <div className={`flex items-center space-x-2 mb-6 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {user.username?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h2 className="text-sm font-medium truncate">{user.username || 'Admin User'}</h2>
                <p className="text-xs text-indigo-300 truncate">{user.email || 'admin@example.com'}</p>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="space-y-1">
            <NavItem 
              href="/admin/dashboard" 
              icon={Home} 
              label="Dashboard" 
              active={pathname === '/admin/dashboard'}
              collapsed={sidebarCollapsed}
            />
            <NavItem 
              href="/admin/users" 
              icon={Users} 
              label="Users" 
              active={pathname === '/admin/users'}
              collapsed={sidebarCollapsed}
            />
            <NavItem 
              href="/admin/predictions" 
              icon={BarChart2} 
              label="Predictions" 
              active={pathname === '/admin/predictions'}
              collapsed={sidebarCollapsed}
            />
            <NavItem 
              href="/admin/resources" 
              icon={FileText} 
              label="Resources" 
              active={pathname === '/admin/resources'}
              collapsed={sidebarCollapsed}
            />
            <NavItem 
              href="/admin/settings" 
              icon={Settings} 
              label="Settings" 
              active={pathname === '/admin/settings'}
              collapsed={sidebarCollapsed}
            />
          </nav>
        </div>
        
        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button 
            onClick={handleLogout}
            className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg hover:bg-indigo-700 text-indigo-200 transition-all duration-200 ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`
        flex-1 transition-all duration-300
        ${sidebarCollapsed ? 'ml-16' : 'ml-0 lg:ml-64'}
      `}>
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Welcome back, {user?.username || 'Admin'}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={theme.name === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme.name === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {/* Settings Link */}
              <Link
                href="/admin/settings"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </Link>
              {/* User Profile Link */}
              <Link
                href="/admin/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Profile"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Crop Admin</h1>
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={theme.name === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme.name === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {/* Settings Link */}
              <Link
                href="/admin/settings"
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
          {children}
        </div>
      </div>
    </div>
  );
}