'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
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

// Translations for the forgot password page
const translations = {
  en: {
    title: "Forgot Your Password?",
    subtitle: "Enter your email and we'll send you instructions to reset your password",
    form: {
      emailLabel: "Email Address",
      emailPlaceholder: "yourname@example.com",
      resetButton: "Reset Password",
      processing: "Processing...",
      validation: {
        emailRequired: "Email is required",
        emailInvalid: "Please enter a valid email address"
      }
    },
    success: {
      title: "Check Your Email",
      message: "We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.",
      returnToLogin: "Return to Login"
    },
    error: {
      general: "Failed to process your request. Please try again later."
    },
    backToLogin: "Back to Login"
  },
  si: {
    title: "ඔබගේ මුරපදය අමතක වුණා ද?",
    subtitle: "ඔබගේ විද්‍යුත් තැපෑල ඇතුළත් කරන්න, අපි ඔබගේ මුරපදය යළි පිහිටුවීමට උපදෙස් එවන්නෙමු",
    form: {
      emailLabel: "විද්‍යුත් තැපැල් ලිපිනය",
      emailPlaceholder: "ඔබගේනම@උදාහරණය.com",
      resetButton: "මුරපදය යළි පිහිටුවන්න",
      processing: "සකසමින්...",
      validation: {
        emailRequired: "විද්‍යුත් තැපෑල අවශ්‍යයි",
        emailInvalid: "කරුණාකර වලංගු විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න"
      }
    },
    success: {
      title: "ඔබගේ විද්‍යුත් තැපෑල පරීක්ෂා කරන්න",
      message: "අපි <strong>{email}</strong> වෙත මුරපදය යළි පිහිටුවීමේ සබැඳියක් යවා ඇත. කරුණාකර ඔබගේ ඇතුළත් ලිපි පරීක්ෂා කර උපදෙස් අනුගමනය කරන්න.",
      returnToLogin: "පිවිසුමට ආපසු යන්න"
    },
    error: {
      general: "ඔබගේ ඉල්ලීම සැකසීමට අසමත් විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න."
    },
    backToLogin: "පිවිසුමට ආපසු යන්න"
  },
  ta: {
    title: "உங்கள் கடவுச்சொல்லை மறந்துவிட்டீர்களா?",
    subtitle: "உங்கள் மின்னஞ்சலை உள்ளிடவும், நாங்கள் உங்கள் கடவுச்சொல்லை மீட்டமைக்க வழிமுறைகளை அனுப்புவோம்",
    form: {
      emailLabel: "மின்னஞ்சல் முகவரி",
      emailPlaceholder: "உங்கள்பெயர்@உதாரணம்.com",
      resetButton: "கடவுச்சொல்லை மீட்டமை",
      processing: "செயலாக்குகிறது...",
      validation: {
        emailRequired: "மின்னஞ்சல் தேவை",
        emailInvalid: "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்"
      }
    },
    success: {
      title: "உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்",
      message: "நாங்கள் <strong>{email}</strong> க்கு கடவுச்சொல் மீட்டமைப்பு இணைப்பை அனுப்பியுள்ளோம். உங்கள் இன்பாக்ஸைச் சரிபார்த்து வழிமுறைகளைப் பின்பற்றவும்.",
      returnToLogin: "உள்நுழைவுக்குத் திரும்பு"
    },
    error: {
      general: "உங்கள் கோரிக்கையை செயலாக்க முடியவில்லை. பிறகு மீண்டும் முயற்சிக்கவும்."
    },
    backToLogin: "உள்நுழைவுக்குத் திரும்பு"
  }
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme.name === 'dark';
  
  const [trans, setTrans] = useState(translations.en);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  // Update translations when language changes with a transition effect
  useEffect(() => {
    if (language) {
      setIsTransitioning(true);
      setTimeout(() => {
        setTrans(translations[language] || translations.en);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 300);
    }
  }, [language]);

  // Inline styles for language transition
  const contentStyle = {
    opacity: isTransitioning ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
  };

  // Utility function to apply language-specific line height adjustments
  const getTextStyle = (baseStyle = {}) => {
    const langLineHeight = language === 'si' ? 1.7 : language === 'ta' ? 1.8 : 1.5;
    return {
      ...baseStyle,
      lineHeight: langLineHeight,
      transition: 'all 0.3s ease'
    };
  };

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
      setValidationError(trans.form.validation.emailRequired);
      return;
    }
    
    if (!validateEmail(email)) {
      setValidationError(trans.form.validation.emailInvalid);
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
      setErrorMessage(trans.error.general);
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
            <h1 
              className="text-2xl font-bold" 
              style={{ 
                ...getTextStyle({ color: theme.colors.text }),
                ...contentStyle
              }}
            >
              {trans.title}
            </h1>
            <p
              className="mt-2"
              style={{ 
                ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }),
                ...contentStyle
              }}
            >
              {trans.subtitle}
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
              <h2 
                className="text-xl font-semibold mb-2" 
                style={{ 
                  ...getTextStyle({ color: theme.colors.text }),
                  ...contentStyle
                }}
              >
                {trans.success.title}
              </h2>
              <p 
                style={{ 
                  ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }),
                  ...contentStyle
                }}
                dangerouslySetInnerHTML={{ 
                  __html: trans.success.message.replace('{email}', email) 
                }}
              />
              <div className="mt-6">
                <Link
                  href="/login"
                  className="block w-full text-center py-3 rounded-md transition"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: theme.colors.text
                  }}
                >
                  <span style={{ ...contentStyle, ...getTextStyle() }}>
                    {trans.success.returnToLogin}
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                  style={{ 
                    ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }),
                    ...contentStyle
                  }}
                >
                  {trans.form.emailLabel}
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
                    placeholder={trans.form.emailPlaceholder}
                  />
                </div>
                {validationError && (
                  <p 
                    className="mt-2 text-sm" 
                    style={{ 
                      ...getTextStyle({ color: isDark ? '#F87171' : '#DC2626' }),
                      ...contentStyle
                    }}
                  >
                    {validationError}
                  </p>
                )}
              </div>
              
              {status === 'error' && (
                <div className="p-3 mb-4 rounded-md" style={{ 
                  backgroundColor: isDark ? 'rgba(220, 38, 38, 0.2)' : '#FEF2F2',
                  color: isDark ? '#F87171' : '#B91C1C' 
                }}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p 
                      className="text-sm"
                      style={{ 
                        ...getTextStyle(),
                        ...contentStyle
                      }}
                    >
                      {errorMessage}
                    </p>
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
                <span style={{ ...contentStyle, ...getTextStyle() }}>
                  {isSubmitting ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-white border-r-transparent rounded-full animate-spin mr-2"></span>
                      {trans.form.processing}
                    </>
                  ) : (
                    trans.form.resetButton
                  )}
                </span>
              </button>
              
              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm hover:opacity-80"
                  style={{ color: theme.colors.primary }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span style={{ ...contentStyle, ...getTextStyle() }}>
                    {trans.backToLogin}
                  </span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </ThemeWrapper>
  );
}