'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Leaf, 
  Menu, 
  X, 
  LogOut, 
  User, 
  BarChart, 
  History, 
  Info, 
  Home, 
  LogIn, 
  UserPlus 
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event to change header style when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Check if a link is active
  const isActive = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Leaf className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Smart Crop Adviser</span>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-green-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Home className="mr-1 h-4 w-4" />
                Home
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/dashboard') 
                        ? 'border-green-500 text-gray-900' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <BarChart className="mr-1 h-4 w-4" />
                    Dashboard
                  </Link>
                  
                  <Link
                    href="/adviser"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/adviser') 
                        ? 'border-green-500 text-gray-900' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Leaf className="mr-1 h-4 w-4" />
                    Adviser
                  </Link>
                  
                  <Link
                    href="/history"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/history') 
                        ? 'border-green-500 text-gray-900' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <History className="mr-1 h-4 w-4" />
                    History
                  </Link>
                </>
              ) : null}
              
              <Link
                href="/info"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/info') 
                    ? 'border-green-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Info className="mr-1 h-4 w-4" />
                Information
              </Link>
            </nav>
          </div>
          
          {/* User menu (desktop) */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="relative ml-3">
                <div className="flex">
                  <Link
                    href="/profile"
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                      isActive('/profile')
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User className="mr-1.5 h-4 w-4" />
                    Profile
                  </Link>
                  
                  <button
                    onClick={logout}
                    className="ml-2 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="mr-1.5 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/login"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Login
                </Link>
                
                <Link 
                  href="/register"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/') 
                ? 'border-green-500 text-green-700 bg-green-50' 
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Home
            </div>
          </Link>
          
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/dashboard') 
                    ? 'border-green-500 text-green-700 bg-green-50' 
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5" />
                  Dashboard
                </div>
              </Link>
              
              <Link
                href="/adviser"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/adviser') 
                    ? 'border-green-500 text-green-700 bg-green-50' 
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center">
                  <Leaf className="mr-2 h-5 w-5" />
                  Adviser
                </div>
              </Link>
              
              <Link
                href="/history"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/history') 
                    ? 'border-green-500 text-green-700 bg-green-50' 
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  History
                </div>
              </Link>
            </>
          ) : null}
          
          <Link
            href="/info"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/info') 
                ? 'border-green-500 text-green-700 bg-green-50' 
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center">
              <Info className="mr-2 h-5 w-5" />
              Information
            </div>
          </Link>
        </div>
        
        {/* Mobile user menu */}
        <div className="pt-4 pb-3 border-t border-gray-200">
          {user ? (
            <div className="space-y-1">
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-gray-500">Signed in as</p>
                <p className="text-sm font-bold text-gray-900">{user.username}</p>
              </div>
              
              <Link
                href="/profile"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/profile') 
                    ? 'border-green-500 text-green-700 bg-green-50' 
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile
                </div>
              </Link>
              
              <button
                onClick={logout}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              >
                <div className="flex items-center">
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </div>
              </button>
            </div>
          ) : (
            <div className="px-4 py-2 space-y-2">
              <Link 
                href="/login"
                className="block text-base font-medium text-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center justify-center">
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </div>
              </Link>
              
              <Link 
                href="/register"
                className="block text-base font-medium text-center rounded-md px-4 py-2 text-white bg-green-600 hover:bg-green-700"
              >
                <div className="flex items-center justify-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Sign Up
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}