'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import {
  Lock,
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Moon,
  Sun
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.name === 'dark';
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setValidationError('');
    setErrorMessage('');
    
    // Validate email
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, this would be an API call to your backend
      // For demonstration, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, let's simulate a successful request
      // In a real app, you'd handle the API response here
      setStatus('success');
      
      // You could redirect after some time:
      // setTimeout(() => router.push('/login'), 3000);
    } catch (error) {
      console.error('Password reset request error:', error);
      setStatus('error');
      setErrorMessage('Failed to process your request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeWrapper className="min-h-screen">
      <div className="max-w-md mx-auto px-4 py-12">
        {/* Header with Theme Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition"
            style={{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              color: theme.colors.text
            }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun /> : <Moon />}
          </button>
        </div>
        
        {/* Main Content */}
        <div
          className="rounded-lg shadow-lg p-8 border"
          style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}
        >
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: isDark ? 'rgba(74, 222, 128, 0.2)' : 'rgba(74, 222, 128, 0.1)' }}
            >
              <div className="h-8 w-8" style={{ color: theme.colors.primary }}>
                <Lock />
              </div>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: theme.colors.text }}>Forgot Your Password?</h1>
            <p
              className="mt-2"
              style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
            >
              Enter your email and we'll send you instructions to reset your password
            </p>
          </div>
          
          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: isDark ? 'rgba(74, 222, 128, 0.2)' : 'rgba(74, 222, 128, 0.1)' }}
              >
                <div className="h-8 w-8" style={{ color: theme.colors.primary }}>
                  <CheckCircle />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text }}>Check Your Email</h2>
              <p style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="block w-full text-center py-3 rounded-md transition"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: theme.colors.text
                  }}
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                  style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                      borderColor: validationError 
                        ? '#EF4444' 
                        : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: theme.colors.text,
                      borderWidth: '1px',
                    }}
                    placeholder="yourname@example.com"
                  />
                </div>
                {validationError && (
                  <p className="mt-2 text-sm" style={{ color: isDark ? '#F87171' : '#DC2626' }}>{validationError}</p>
                )}
              </div>
              
              {status === 'error' && (
                <div className="p-3 mb-4 rounded-md" style={{ 
                  backgroundColor: isDark ? 'rgba(220, 38, 38, 0.2)' : '#FEF2F2',
                  color: isDark ? '#F87171' : '#B91C1C' 
                }}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{errorMessage}</p>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white py-2 px-4 rounded-md hover:opacity-90 transition duration-200 font-medium flex items-center justify-center ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                style={{ backgroundColor: theme.colors.primary }}
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-r-transparent rounded-full animate-spin mr-2"></span>
                    Processing...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
              
              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm hover:opacity-80"
                  style={{ color: theme.colors.primary }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </ThemeWrapper>
  );
}