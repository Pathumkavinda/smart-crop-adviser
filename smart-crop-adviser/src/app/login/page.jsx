'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import ThemeWrapper from '@/components/ThemeWrapper';

// No direct API calls here anymore — we call useAuth().login
const translations = {
  en: {
    title: "Sign in to Smart Crop Adviser",
    createAccount: "Or create a new account",
    emailLabel: "Email address",
    emailPlaceholder: "Enter your email",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot your password?",
    signIn: "Sign in",
    signingIn: "Signing in...",
    newUser: "New to Smart Crop Adviser?",
    createAccountButton: "Create an account",
    errors: {
      invalidCredentials: "Invalid email or password",
      generalError: "Failed to sign in. Please try again."
    }
  },
  si: {
    title: "ස්මාර්ට් බෝග උපදේශකට පිවිසෙන්න",
    createAccount: "හෝ නව ගිණුමක් සාදන්න",
    emailLabel: "විද්‍යුත් තැපැල් ලිපිනය",
    emailPlaceholder: "ඔබගේ විද්‍යුත් තැපෑල ඇතුළත් කරන්න",
    passwordLabel: "මුරපදය",
    passwordPlaceholder: "ඔබගේ මුරපදය ඇතුළත් කරන්න",
    rememberMe: "මාව මතක තබා ගන්න",
    forgotPassword: "මුරපදය අමතක වුණා ද?",
    signIn: "පිවිසෙන්න",
    signingIn: "පිවිසෙමින්...",
    newUser: "ස්මාර්ට් බෝග උපදේශකයට අලුත් ද?",
    createAccountButton: "ගිණුමක් සාදන්න",
    errors: {
      invalidCredentials: "වලංගු නොවන විද්‍යුත් තැපෑල හෝ මුරපදය",
      generalError: "පිවිසීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න."
    }
  },
  ta: {
    title: "ஸ்மார்ட் பயிர் ஆலோசகரில் உள்நுழைக",
    createAccount: "அல்லது புதிய கணக்கை உருவாக்கவும்",
    emailLabel: "மின்னஞ்சல் முகவரி",
    emailPlaceholder: "உங்கள் மின்னஞ்சலை உள்ளிடவும்",
    passwordLabel: "கடவுச்சொல்",
    passwordPlaceholder: "உங்கள் கடவுச்சொல்லை உள்ளிடவும்",
    rememberMe: "என்னை நினைவில் வைக்கவும்",
    forgotPassword: "கடவுச்சொல்லை மறந்துவிட்டீர்களா?",
    signIn: "உள்நுழைக",
    signingIn: "உள்நுழைகிறது...",
    newUser: "ஸ்மார்ட் பயிர் ஆலோசகருக்கு புதியவரா?",
    createAccountButton: "கணக்கை உருவாக்கவும்",
    errors: {
      invalidCredentials: "தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்",
      generalError: "உள்நுழைய முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
    }
  }
};

const IconLeaf = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M11 20A7 7 0 0 1 4 13c0-3.4 2.2-6.2 5.2-7.2A7 7 0 0 0 16 13c0 3.4-2.2 6.2-5.2 7.2"/>
    <path d="M15.5 9.5a4 4 0 0 0-6.5 4.5"/>
    <path d="M22 12c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2s10 4.5 10 10z"/>
  </svg>
);

const IconMail = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const IconLock = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const IconEye = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const IconEyeOff = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
    <line x1="2" x2="22" y1="2" y2="22"></line>
  </svg>
);

const AlertTriangle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <path d="M12 9v4"></path>
    <path d="M12 17h.01"></path>
  </svg>
);

export default function Login() {
  const router = useRouter();
  const { login, user, error: authError } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme.name === 'dark';

  const [trans, setTrans] = useState(translations.en);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setTrans(translations[language] || translations.en);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 300);
  }, [language]);

  // already logged in? go straight to the correct dashboard
  useEffect(() => {
    if (user?.userlevel) redirectBasedOnRole(user.userlevel);
    const justLoggedOut = localStorage.getItem('loggedOut');
    if (justLoggedOut === 'true') {
      setFormData({ email: '', password: '' });
      setRememberMe(false);
      localStorage.removeItem('loggedOut');
    }
  }, [user]);

  const contentStyle = { opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.3s ease-in-out' };
  const getTextStyle = (base = {}) => ({ ...base, lineHeight: language === 'si' ? 1.7 : language === 'ta' ? 1.8 : 1.5 });

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'admin':      router.push('/admin/dashboard'); break;
      case 'agent':      router.push('/dashboard'); break;
      case 'researcher': router.push('/research/dashboard'); break;
      case 'farmer':
      default:           router.push('/profile/Dashboard');
    }
  };

  const handleChange = (e) => {
    if (localError) setLocalError('');
    if (authError)  setLocalError(''); // clear local error display if context error changes
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    const result = await login({ email: formData.email, password: formData.password });

    setLoading(false);
    if (!result.ok) {
      setLocalError(result.error || trans.errors.generalError);
      return;
    }

    // Optionally persist email for remember-me
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    // Immediate redirect — no refresh and no delay
    redirectBasedOnRole(result.user.userlevel);
  };

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setFormData((s) => ({ ...s, email: remembered }));
      setRememberMe(true);
    }
  }, []);

  const errorToShow = localError || authError;

  return (
    <ThemeWrapper>
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom right, #0f172a, #1e293b)'
            : 'linear-gradient(to bottom right, #f0f9f4, #e6f0fd)'
        }}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <IconLeaf className={`h-8 w-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold"
              style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
            {trans.title}
          </h2>
          <p className="mt-2 text-center text-sm"
             style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
            {trans.createAccount.split(' ')[0]}{' '}
            <Link href="/register" style={{ color: theme.colors.primary }} className="font-medium hover:underline">
              {trans.createAccount.split(' ').slice(1).join(' ')}
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10"
               style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
            {errorToShow && (
              <div className={`mb-4 border-l-4 p-4 rounded ${isDark ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-500'}`} style={contentStyle}>
                <div className="flex">
                  <div className="flex-shrink-0"><AlertTriangle className="h-5 w-5" style={{ color: isDark ? '#F87171' : '#DC2626' }} /></div>
                  <div className="ml-3">
                    <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`} style={getTextStyle()}>
                      {errorToShow}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium"
                       style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                  {trans.emailLabel}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconMail className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="email" name="email" type="email" autoComplete="email" required
                    value={formData.email} onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                      color: theme.colors.text,
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border
                    }}
                    placeholder={trans.emailPlaceholder}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium"
                       style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                  {trans.passwordLabel}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconLock className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="password" name="password" type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password" required
                    value={formData.password} onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-10 py-2 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                      color: theme.colors.text,
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border
                    }}
                    placeholder={trans.passwordPlaceholder}
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword((s) => !s)}>
                    {showPassword
                      ? <IconEyeOff className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      : <IconEye    className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me" name="remember-me" type="checkbox"
                    checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : theme.colors.border, accentColor: theme.colors.primary }}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm"
                         style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                    {trans.rememberMe}
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" style={{ ...getTextStyle({ color: theme.colors.primary }), ...contentStyle }} className="font-medium hover:underline">
                    {trans.forgotPassword}
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit" disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                    loading ? 'bg-opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'
                  }`}
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {loading ? trans.signingIn : trans.signIn}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border }}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2"
                        style={{ backgroundColor: theme.colors.card, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', ...contentStyle, ...getTextStyle() }}>
                    {trans.newUser}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/register"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors"
                      style={{ backgroundColor: isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)', color: theme.colors.primary, ...contentStyle }}>
                  <span style={getTextStyle()}>{translations.en.createAccountButton}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
