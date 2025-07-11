'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import { 
  Leaf, 
  Mail, 
  Lock, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Map, 
  Info
} from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';
  
  // Auth context would normally be used here
  const { register, error: authError, setError: setAuthError, user } = { 
    register: async () => {}, 
    error: '', 
    setError: () => {},
    user: null
  };
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    location: '',
    farmSize: '',
    termsAccepted: false
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formStep, setFormStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: ''
  });
  const [error, setError] = useState('');

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData({ ...formData, [name]: val });
    
    // Clear validation errors when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
    
    // Check password strength
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };
  
  const checkPasswordStrength = (password) => {
    // Password strength criteria
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Calculate score (0-4)
    let score = [hasMinLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length - 1;
    score = Math.max(0, Math.min(score, 4)); // Clamp between 0-4
    
    // Define message based on score
    let message = '';
    if (score === 0) message = 'Very weak';
    else if (score === 1) message = 'Weak';
    else if (score === 2) message = 'Fair';
    else if (score === 3) message = 'Good';
    else message = 'Strong';
    
    setPasswordStrength({ score, message });
  };

  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength.score < 2) {
      errors.password = 'Please use a stronger password';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep2 = () => {
    const errors = {};
    
    if (!formData.termsAccepted) {
      errors.termsAccepted = 'You must accept the Terms and Conditions';
    }
    
    // Optional fields don't need validation
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setFormStep(2);
    }
  };
  
  const handlePrevStep = () => {
    setFormStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formStep === 1) {
      handleNextStep();
      return;
    }
    
    // Validate form step 2
    if (!validateStep2()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Prepare registration data (excluding confirmPassword and termsAccepted)
      const { confirmPassword, termsAccepted, ...registrationData } = formData;
      
      // In a real app, you would actually register the user here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success and redirect
      router.push('/login?registered=true');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
      // Stay on current step
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeWrapper>
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{ 
        background: isDark 
          ? 'linear-gradient(to bottom right, #0f172a, #1e293b)' 
          : 'linear-gradient(to bottom right, #f0f9f4, #e6f0fd)'
      }}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
              isDark ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <Leaf size={32} className={`${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: theme.colors.text }}>
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
            Or{' '}
            <Link href="/login" style={{ color: theme.colors.primary }} className="font-medium hover:underline">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border
          }}>
            {/* Registration progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    formStep >= 1 
                      ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-600' 
                      : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <span className="mt-1 text-xs" style={{ color: theme.colors.text }}>Account</span>
                </div>
                <div className={`h-1 flex-1 mx-2 ${
                  formStep >= 2 
                    ? isDark ? 'bg-green-900/50' : 'bg-green-200'
                    : isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    formStep >= 2 
                      ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-600'
                      : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <span className="mt-1 text-xs" style={{ color: theme.colors.text }}>Profile</span>
                </div>
              </div>
            </div>
            
            {error && (
              <div className={`mb-4 border-l-4 p-4 rounded ${
                isDark ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-500'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-400'}`} />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Step 1: Account Information */}
              {formStep === 1 && (
                <>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium" style={{ color: theme.colors.text }}>
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={formData.username}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                          validationErrors.username ? 'border-red-300' : ''
                        }`}
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                          color: theme.colors.text,
                          borderColor: validationErrors.username 
                            ? 'rgb(252, 165, 165)' 
                            : isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border
                        }}
                        placeholder="Choose a username"
                      />
                    </div>
                    {validationErrors.username && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.username}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium" style={{ color: theme.colors.text }}>
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                          validationErrors.email ? 'border-red-300' : ''
                        }`}
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                          color: theme.colors.text,
                          borderColor: validationErrors.email 
                            ? 'rgb(252, 165, 165)' 
                            : isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border
                        }}
                        placeholder="you@example.com"
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium" style={{ color: theme.colors.text }}>
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-10 pr-10 py-2 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                          validationErrors.password ? 'border-red-300' : ''
                        }`}
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                          color: theme.colors.text,
                          borderColor: validationErrors.password 
                            ? 'rgb(252, 165, 165)' 
                            : isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border
                        }}
                        placeholder="Create a secure password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        ) : (
                          <Eye className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        )}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                passwordStrength.score === 0 ? 'bg-red-500' :
                                passwordStrength.score === 1 ? 'bg-orange-500' :
                                passwordStrength.score === 2 ? 'bg-yellow-500' :
                                passwordStrength.score === 3 ? 'bg-green-500' :
                                'bg-green-600'
                              }`}
                              style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                            ></div>
                          </div>
                          <span className={`ml-2 text-xs ${
                            passwordStrength.score <= 1 ? 'text-red-600' :
                            passwordStrength.score === 2 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {passwordStrength.message}
                          </span>
                        </div>
                        <p className="mt-1 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                          Password should be at least 8 characters with upper & lowercase letters, numbers, and symbols
                        </p>
                      </div>
                    )}
                    {validationErrors.password && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: theme.colors.text }}>
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-10 pr-10 py-2 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                          validationErrors.confirmPassword ? 'border-red-300' : ''
                        }`}
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                          color: theme.colors.text,
                          borderColor: validationErrors.confirmPassword 
                            ? 'rgb(252, 165, 165)' 
                            : isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border
                        }}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        ) : (
                          <Eye className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        )}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                    )}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors hover:bg-opacity-90"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              
              {/* Step 2: Personal Information */}
              {formStep === 2 && (
                <>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium" style={{ color: theme.colors.text }}>
                      Full Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                          color: theme.colors.text,
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border
                        }}
                        placeholder="Your full name (optional)"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium" style={{ color: theme.colors.text }}>
                      Location
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Map className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                          color: theme.colors.text,
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border
                        }}
                        placeholder="District, Province (optional)"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="farmSize" className="block text-sm font-medium" style={{ color: theme.colors.text }}>
                      Farm Size (hectares)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        id="farmSize"
                        name="farmSize"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.farmSize}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                          color: theme.colors.text,
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border
                        }}
                        placeholder="e.g., 2.5 (optional)"
                      />
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="termsAccepted"
                        name="termsAccepted"
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                        className={`h-4 w-4 rounded ${
                          validationErrors.termsAccepted ? 'border-red-300' : ''
                        }`}
                        style={{ 
                          borderColor: validationErrors.termsAccepted
                            ? 'rgb(252, 165, 165)'
                            : isDark ? 'rgba(255,255,255,0.2)' : theme.colors.border,
                          accentColor: theme.colors.primary
                        }}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="termsAccepted" style={{ color: theme.colors.text }}>
                        I agree to the <a href="/terms" style={{ color: theme.colors.primary }} className="font-medium hover:underline">Terms and Conditions</a> and <a href="/privacy" style={{ color: theme.colors.primary }} className="font-medium hover:underline">Privacy Policy</a> <span className="text-red-500">*</span>
                      </label>
                      {validationErrors.termsAccepted && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.termsAccepted}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors"
                      style={{ 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                        color: theme.colors.text,
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'
                      }`}
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border }}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2" style={{ 
                    backgroundColor: theme.colors.card,
                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                  }}>
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
                    color: theme.colors.primary
                  }}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}