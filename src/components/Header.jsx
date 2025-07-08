// src/components/Header.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
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
  UserPlus,
  Moon,
  Sun,
  Globe,
  ChevronDown
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { language, setLanguage, translations } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const isDark = theme.name === 'dark';
  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);
  
  // Handle scroll event to change header style when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsLangMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Check if a link is active
  const isActive = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'si', name: 'සිංහල' },
    { code: 'ta', name: 'தமிழ்' }
  ];

  // Handle language change
  const handleLanguageChange = (code) => {
    setLanguage(code);
    setIsLangMenuOpen(false);
  };

  // Navigation links
  const navLinks = [
    { href: '/', label: translations?.nav?.home || 'Home', icon: <Home className="h-4 w-4" /> },
    { href: '/adviser', label: translations?.nav?.adviser || 'Adviser', icon: <Leaf className="h-4 w-4" /> },
    { href: '/dashboard', label: translations?.nav?.dashboard || 'Dashboard', icon: <BarChart className="h-4 w-4" /> },
    { href: '/history', label: translations?.nav?.history || 'History', icon: <History className="h-4 w-4" /> },
    { href: '/info', label: translations?.nav?.info || 'Information', icon: <Info className="h-4 w-4" /> }
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isDark 
          ? (isScrolled ? 'shadow-md' : 'backdrop-blur-sm')
          : (isScrolled ? 'shadow-md' : 'backdrop-blur-sm')
      }`}
      style={{
        backgroundColor: isScrolled 
          ? theme.colors.navBg 
          : `${theme.colors.navBg}cc`, // Add transparency
        color: theme.colors.navText,
        borderBottom: `1px solid ${theme.colors.border}`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Leaf 
                  className="h-8 w-8" 
                  style={{ color: theme.colors.primary }}
                />
                <span 
                  className="ml-2 text-xl font-bold"
                  style={{ color: theme.colors.text }}
                >
                  {translations?.brand || 'Smart Crop Adviser'}
                </span>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                  style={{ 
                    backgroundColor: isActive(link.href) 
                      ? isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' 
                      : 'transparent',
                    color: isActive(link.href)
                      ? theme.colors.primary
                      : theme.colors.text
                  }}
                >
                  <span className="mr-1.5">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User menu, theme toggle, and language selector (desktop) */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors duration-200 flex items-center justify-center"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.colors.text
              }}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="p-2 rounded-md transition-colors duration-200 flex items-center"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.colors.text
                }}
              >
                <Globe className="h-5 w-5" />
                <span className="ml-1 text-sm font-medium hidden md:inline">
                  {languages.find(lang => lang.code === language)?.name || 'English'}
                </span>
                <ChevronDown className="ml-1 h-4 w-4 opacity-75" />
              </button>
              
              {isLangMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-40 rounded-md shadow-lg py-1 ring-1 ring-opacity-5 focus:outline-none"
                  style={{ 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    color: theme.colors.text
                  }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200"
                      style={{ 
                        backgroundColor: language === lang.code 
                          ? isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' 
                          : 'transparent',
                        color: language === lang.code
                          ? theme.colors.primary
                          : theme.colors.text
                      }}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Auth Links - Conditional Rendering */}
            {user ? (
              <div className="relative ml-3" ref={userMenuRef}>
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-sm rounded-md px-3 py-2 transition-colors duration-200"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      color: theme.colors.text
                    }}
                  >
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center mr-2"
                      style={{ 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.primary + '22' // Add transparency
                      }}
                    >
                      <User 
                        className="h-5 w-5" 
                        style={{ color: theme.colors.primary }}
                      />
                    </div>
                    <span className="font-medium">{user.name || user.username || 'User'}</span>
                    <ChevronDown className="ml-1 h-4 w-4 opacity-75" />
                  </button>
                </div>
                
                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 focus:outline-none"
                    style={{ 
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.text
                    }}
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm transition-colors duration-200"
                      style={{ color: theme.colors.text }}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      {translations?.nav?.profile || 'Your Profile'}
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm transition-colors duration-200"
                      style={{ color: theme.colors.text }}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      {translations?.nav?.dashboard || 'Dashboard'}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200"
                      style={{ color: theme.colors.text }}
                    >
                      {translations?.auth?.logout || 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/login"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: theme.colors.text
                  }}
                >
                  <LogIn className="mr-1.5 h-4 w-4" />
                  {translations?.auth?.login || 'Login'}
                </Link>
                
                <Link 
                  href="/register"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white transition-colors duration-200"
                  style={{ 
                    backgroundColor: theme.colors.primary,
                    color: '#ffffff'
                  }}
                >
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  {translations?.auth?.register || 'Sign Up'}
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden space-x-2">
            {/* Theme Toggle (Mobile) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors duration-200"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.colors.text
              }}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md transition-colors duration-200"
              style={{ color: theme.colors.text }}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
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
        {/* User info when logged in (Mobile) */}
        {user && (
          <div className="px-4 py-3" style={{ backgroundColor: theme.colors.navBg }}>
            <div className="flex items-center">
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.primary + '22' // Add transparency
                }}
              >
                <User 
                  className="h-6 w-6" 
                  style={{ color: theme.colors.primary }}
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium" style={{ color: theme.colors.text }}>
                  {user.name || user.username || 'User'}
                </div>
                {user.email && (
                  <div className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation Links (Mobile) */}
        <div className="pt-2 pb-3 space-y-1" style={{ backgroundColor: theme.colors.navBg }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-base font-medium transition-colors duration-200"
              style={{ 
                backgroundColor: isActive(link.href) 
                  ? isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' 
                  : 'transparent',
                color: isActive(link.href)
                  ? theme.colors.primary
                  : theme.colors.text
              }}
            >
              <div className="flex items-center">
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </div>
            </Link>
          ))}
          
          {/* Profile link when logged in */}
          {user && (
            <Link
              href="/profile"
              className="block px-3 py-2 text-base font-medium transition-colors duration-200"
              style={{ 
                backgroundColor: isActive('/profile') 
                  ? isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' 
                  : 'transparent',
                color: isActive('/profile')
                  ? theme.colors.primary
                  : theme.colors.text
              }}
            >
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                <span>{translations?.nav?.profile || 'Profile'}</span>
              </div>
            </Link>
          )}
        </div>
        
        {/* Auth Buttons (Mobile) */}
        <div 
          className="pt-4 pb-3 border-t"
          style={{ 
            backgroundColor: theme.colors.navBg,
            borderColor: theme.colors.border
          }}
        >
          {user ? (
            <div className="px-4">
              <button
                onClick={logout}
                className="flex items-center w-full px-3 py-2 text-base font-medium rounded-md transition-colors duration-200"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.colors.text
                }}
              >
                <LogOut className="mr-2 h-5 w-5" />
                <span>{translations?.auth?.logout || 'Sign out'}</span>
              </button>
            </div>
          ) : (
            <div className="px-4 space-y-2">
              <Link 
                href="/login"
                className="flex items-center justify-center w-full px-3 py-2 text-base font-medium rounded-md transition-colors duration-200"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.colors.text
                }}
              >
                <LogIn className="mr-2 h-5 w-5" />
                <span>{translations?.auth?.login || 'Login'}</span>
              </Link>
              
              <Link 
                href="/register"
                className="flex items-center justify-center w-full px-3 py-2 text-base font-medium rounded-md text-white transition-colors duration-200"
                style={{ 
                  backgroundColor: theme.colors.primary,
                  color: '#ffffff'
                }}
              >
                <UserPlus className="mr-2 h-5 w-5" />
                <span>{translations?.auth?.register || 'Sign Up'}</span>
              </Link>
            </div>
          )}
        </div>
        
        {/* Language Selector (Mobile) */}
        <div 
          className="px-4 py-2 border-t"
          style={{ 
            backgroundColor: theme.colors.navBg,
            borderColor: theme.colors.border
          }}
        >
          <p 
            className="text-sm font-medium"
            style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
          >
            {translations?.language?.select || 'Language'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="px-3 py-1 text-sm rounded-md transition-colors duration-200"
                style={{ 
                  backgroundColor: language === lang.code 
                    ? theme.colors.primary 
                    : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: language === lang.code 
                    ? '#ffffff' 
                    : theme.colors.text
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}