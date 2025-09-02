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
  History as HistoryIcon,
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

  // ✅ Prevent hydration mismatch: render only after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isDark = theme.name === 'dark';
  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  // Scroll effect (client-only)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Outside click close
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsLangMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'si', name: 'සිංහල' },
    { code: 'ta', name: 'தமிழ்' }
  ];

  const handleLanguageChange = (code) => {
    setLanguage(code);
    setIsLangMenuOpen(false);
  };

  // Role-aware paths
  const getHistoryPath = (role) => {
    switch (role) {
      case 'admin': return '/admin/predictions';
      case 'agent': return '/adviser/history'; // change to '/dashboard/history' if that's your adviser route
      case 'researcher': return '/research/history';
      default: return '/profile/history'; // farmer / default
    }
  };

  const getProfilePath = () => {
    if (!user) return '/login';
    const role = user.userlevel;
    return role === 'admin' ? '/admin/profile'
      : role === 'agent' ? '/adviser/profile'
      : role === 'researcher' ? '/research/profile'
      : '/profile';
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    const role = user.userlevel;
    return role === 'admin' ? '/admin/dashboard'
      : role === 'agent' ? '/dashboard'
      : role === 'researcher' ? '/research/dashboard'
      : '/profile/Dashboard';
  };

  const getLocalizedFontSize = (defaultSize) => {
    if (language === 'ta') return '0.7rem';
    if (language === 'si') return '0.8rem';
    return defaultSize;
  };
  const getLanguageOptionFontSize = (langCode) => {
    if (langCode === 'ta') return '0.7rem';
    if (langCode === 'si') return '0.8rem';
    return undefined;
  };

  const getNavLinks = () => {
    const baseLinks = [
      { href: '/', label: translations?.nav?.home || 'Home', icon: <Home className="h-4 w-4" /> },
    ];

    if (!user) {
      return [
        ...baseLinks,
        { href: '/info', label: translations?.nav?.info || 'Information', icon: <Info className="h-4 w-4" /> }
      ];
    }

    const userRole = user.userlevel;

    const dashboardLink = {
      href: getDashboardPath(),
      label: translations?.nav?.dashboard || 'Dashboard',
      icon: <BarChart className="h-4 w-4" />
    };

    const historyLink = {
      href: getHistoryPath(userRole),
      label: translations?.nav?.history || 'History',
      icon: <HistoryIcon className="h-4 w-4" />
    };

    const authLinks = [
      dashboardLink,
      historyLink,
      { href: '/info', label: translations?.nav?.info || 'Information', icon: <Info className="h-4 w-4" /> }
    ];

    if (userRole === 'admin') {
      return [
        ...baseLinks,
        { href: '/adviser', label: translations?.nav?.adviser || 'Adviser', icon: <Leaf className="h-4 w-4" /> },
        ...authLinks
      ];
    }

    return [...baseLinks, ...authLinks];
  };

  // ✅ Don’t render until mounted to avoid SSR/client style drift
  if (!mounted) {
    return (
      <header
        className="sticky top-0 z-50 h-16"
        aria-hidden
      />
    );
  }

  const navLinks = getNavLinks();

  return (
    <header
      // ✅ Allow React to ignore dynamic mismatches here if any remain
      suppressHydrationWarning
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isDark ? (isScrolled ? 'shadow-md' : 'backdrop-blur-sm') : (isScrolled ? 'shadow-md' : 'backdrop-blur-sm')
      }`}
      style={{
        backgroundColor: isScrolled ? theme.colors.navBg : `${theme.colors.navBg}cc`,
        color: theme.colors.navText,
        borderBottom: `1px solid ${theme.colors.border}`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand + Desktop Nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Leaf className="h-8 w-8" style={{ color: theme.colors.primary }} />
                <span
                  className="ml-2 text-xl font-bold"
                  style={{ color: theme.colors.text, fontSize: getLocalizedFontSize('1rem') }}
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
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                  style={{
                    backgroundColor: isActive(link.href)
                      ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                      : 'transparent',
                    color: isActive(link.href) ? theme.colors.primary : theme.colors.text,
                    fontSize: getLocalizedFontSize('0.875rem')
                  }}
                >
                  <span className="mr-1.5">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop: Theme, Language, User menu */}
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
                  color: theme.colors.text,
                  fontSize: getLocalizedFontSize('0.875rem')
                }}
              >
                <Globe className="h-5 w-5" />
                <span
                  className="ml-1 text-sm font-medium hidden md:inline"
                  style={{ fontSize: getLocalizedFontSize('0.875rem') }}
                >
                  {languages.find((l) => l.code === language)?.name || 'English'}
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
                        backgroundColor:
                          language === lang.code
                            ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                            : 'transparent',
                        color: language === lang.code ? theme.colors.primary : theme.colors.text,
                        fontSize: getLanguageOptionFontSize(lang.code)
                      }}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth-dependent */}
            {user ? (
              <div className="relative ml-3" ref={userMenuRef}>
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-sm rounded-md px-3 py-2 transition-colors duration-200"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      color: theme.colors.text,
                      fontSize: getLocalizedFontSize('0.875rem')
                    }}
                  >
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center mr-2"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.primary + '22'
                      }}
                    >
                      <User className="h-5 w-5" style={{ color: theme.colors.primary }} />
                    </div>
                    <span className="font-medium">{user.name || user.username || user.full_name || 'User'}</span>
                    <ChevronDown className="ml-1 h-4 w-4 opacity-75" />
                  </button>
                </div>

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
                      href={getProfilePath()}
                      className="block px-4 py-2 text-sm transition-colors duration-200"
                      style={{ color: theme.colors.text, fontSize: getLocalizedFontSize('0.875rem') }}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      {translations?.nav?.profile || 'Your Profile'}
                    </Link>
                    <Link
                      href={getDashboardPath()}
                      className="block px-4 py-2 text-sm transition-colors duration-200"
                      style={{ color: theme.colors.text, fontSize: getLocalizedFontSize('0.875rem') }}
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
                      style={{ color: theme.colors.text, fontSize: getLocalizedFontSize('0.875rem') }}
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
                    color: theme.colors.text,
                    fontSize: getLocalizedFontSize('0.875rem')
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
                    color: '#ffffff',
                    fontSize: getLocalizedFontSize('0.875rem')
                  }}
                >
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  {translations?.auth?.register || 'Sign Up'}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Theme toggle + burger */}
          <div className="flex items-center sm:hidden space-x-2">
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

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md transition-colors duration-200"
              style={{ color: theme.colors.text }}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        {/* Logged-in user info */}
        {user && (
          <div className="px-4 py-3" style={{ backgroundColor: theme.colors.navBg }}>
            <div className="flex items-center">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.primary + '22'
                }}
              >
                <User className="h-6 w-6" style={{ color: theme.colors.primary }} />
              </div>
              <div className="ml-3">
                <div
                  className="text-base font-medium"
                  style={{ color: theme.colors.text, fontSize: getLocalizedFontSize('1rem') }}
                >
                  {user.name || user.username || user.full_name || 'User'}
                </div>
                {user.email && (
                  <div
                    className="text-sm"
                    style={{
                      color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                      fontSize: getLocalizedFontSize('0.875rem')
                    }}
                  >
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile nav links */}
        <div className="pt-2 pb-3 space-y-1" style={{ backgroundColor: theme.colors.navBg }}>
          {getNavLinks().map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-base font-medium transition-colors duration-200"
              style={{
                backgroundColor: isActive(link.href)
                  ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                  : 'transparent',
                color: isActive(link.href) ? theme.colors.primary : theme.colors.text,
                fontSize: getLocalizedFontSize('1rem')
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
              href={getProfilePath()}
              className="block px-3 py-2 text-base font-medium transition-colors duration-200"
              style={{
                backgroundColor: isActive(getProfilePath())
                  ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                  : 'transparent',
                color: isActive(getProfilePath()) ? theme.colors.primary : theme.colors.text,
                fontSize: getLocalizedFontSize('1rem')
              }}
            >
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                <span>{translations?.nav?.profile || 'Profile'}</span>
              </div>
            </Link>
          )}
        </div>

        {/* Mobile auth buttons */}
        <div
          className="pt-4 pb-3 border-t"
          style={{ backgroundColor: theme.colors.navBg, borderColor: theme.colors.border }}
        >
          {user ? (
            <div className="px-4">
              <button
                onClick={logout}
                className="flex items-center w-full px-3 py-2 text-base font-medium rounded-md transition-colors duration-200"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.colors.text,
                  fontSize: getLocalizedFontSize('1rem')
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
                  color: theme.colors.text,
                  fontSize: getLocalizedFontSize('1rem')
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
                  color: '#ffffff',
                  fontSize: getLocalizedFontSize('1rem')
                }}
              >
                <UserPlus className="mr-2 h-5 w-5" />
                <span>{translations?.auth?.register || 'Sign Up'}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile language selector */}
        <div
          className="px-4 py-2 border-t"
          style={{ backgroundColor: theme.colors.navBg, borderColor: theme.colors.border }}
        >
          <p
            className="text-sm font-medium"
            style={{
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              fontSize: getLocalizedFontSize('0.875rem')
            }}
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
                  backgroundColor:
                    language === lang.code
                      ? theme.colors.primary
                      : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                  color: language === lang.code ? '#ffffff' : theme.colors.text,
                  fontSize: getLanguageOptionFontSize(lang.code)
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
