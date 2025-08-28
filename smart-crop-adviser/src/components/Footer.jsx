// src/components/Footer.jsx
'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  Leaf, 
  Heart, 
  ExternalLink, 
  Facebook, 
  Twitter, 
  Instagram, 
  Github  // Changed from GitHub to Github
} from 'lucide-react';

export default function Footer() {
  const { theme } = useTheme();
  const { language, translations } = useLanguage();
  const isDark = theme.name === 'dark';
  const currentYear = new Date().getFullYear();
  


  // Social links
  const socialLinks = [
    { 
      href: 'https://www.facebook.com', 
      label: 'Facebook', 
      icon: <Facebook className="h-6 w-6" /> 
    },
    { 
      href: 'https://www.instagram.com', 
      label: 'Instagram', 
      icon: <Instagram className="h-6 w-6" /> 
    },
    { 
      href: 'https://twitter.com', 
      label: 'Twitter', 
      icon: <Twitter className="h-6 w-6" /> 
    },
    { 
      href: 'https://github.com', 
      label: 'GitHub', 
      icon: <Github className="h-6 w-6" /> // Using Github (lowercase 'h')
    }
  ];

  return (
    <footer 
      className="border-t"
      style={{ 
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        borderColor: theme.colors.border
      }}
    >
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
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
        
        
        <div className="mt-8 flex justify-center space-x-6">
          {socialLinks.map((social) => (
            <a 
              key={social.label}
              href={social.href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="transition-colors duration-200"
              style={{ 
                color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
              }}
              aria-label={social.label}
            >
              <span className="sr-only">{social.label}</span>
              {social.icon}
            </a>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p 
            className="text-base"
            style={{ 
              color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
            }}
          >
            &copy; {currentYear} Smart Crop Adviser. All rights reserved.
          </p>
          <p className="mt-2 text-sm flex items-center justify-center">
            <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              Made with 
            </span>
            <Heart className="h-4 w-4 text-red-500 mx-1" />
            <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              for Sri Lankan farmers
            </span>
          </p>
          <p className="mt-1 text-sm">
            <Link 
              href="/terms" 
              className="transition-colors duration-200"
              style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
            >
              Terms of Service
            </Link> | 
            <Link 
              href="/privacy" 
              className="transition-colors duration-200 ml-2"
              style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}