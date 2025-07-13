'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
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

// Translations for the registration page
const translations = {
  en: {
    title: "Create your account",
    subtitle: "Or sign in to your existing account",
    steps: {
      account: "Account",
      profile: "Profile"
    },
    form: {
      username: {
        label: "Username",
        placeholder: "Choose a username",
        errors: {
          required: "Username is required",
          short: "Username must be at least 3 characters"
        }
      },
      email: {
        label: "Email address",
        placeholder: "you@example.com",
        errors: {
          required: "Email is required",
          invalid: "Please enter a valid email address"
        }
      },
      password: {
        label: "Password",
        placeholder: "Create a secure password",
        hint: "Password should be at least 8 characters with upper & lowercase letters, numbers, and symbols",
        errors: {
          required: "Password is required",
          short: "Password must be at least 8 characters",
          weak: "Please use a stronger password"
        },
        strength: {
          veryWeak: "Very weak",
          weak: "Weak",
          fair: "Fair",
          good: "Good",
          strong: "Strong"
        }
      },
      confirmPassword: {
        label: "Confirm Password",
        placeholder: "Confirm your password",
        errors: {
          mismatch: "Passwords do not match"
        }
      },
      fullName: {
        label: "Full Name",
        placeholder: "Your full name (optional)"
      },
      location: {
        label: "Location",
        placeholder: "District, Province (optional)"
      },
      farmSize: {
        label: "Farm Size (hectares)",
        placeholder: "e.g., 2.5 (optional)"
      },
      terms: {
        label: "I agree to the",
        termsLink: "Terms and Conditions",
        privacyLink: "Privacy Policy",
        errors: {
          required: "You must accept the Terms and Conditions"
        }
      },
      buttons: {
        continue: "Continue",
        back: "Back",
        create: "Create Account",
        creating: "Creating account..."
      }
    },
    footer: {
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign in",
      disclaimer: "By creating an account, you agree to our Terms of Service and Privacy Policy."
    },
    errors: {
      general: "Registration failed. Please try again."
    }
  },
  si: {
    title: "ඔබගේ ගිණුම සාදන්න",
    subtitle: "හෝ ඔබගේ පවතින ගිණුමට පිවිසෙන්න",
    steps: {
      account: "ගිණුම",
      profile: "පැතිකඩ"
    },
    form: {
      username: {
        label: "පරිශීලක නාමය",
        placeholder: "පරිශීලක නාමයක් තෝරන්න",
        errors: {
          required: "පරිශීලක නාමය අවශ්‍යයි",
          short: "පරිශීලක නාමය අවම වශයෙන් අක්ෂර 3ක් විය යුතුය"
        }
      },
      email: {
        label: "විද්‍යුත් තැපැල් ලිපිනය",
        placeholder: "ඔබ@උදාහරණය.com",
        errors: {
          required: "විද්‍යුත් තැපෑල අවශ්‍යයි",
          invalid: "කරුණාකර වලංගු විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න"
        }
      },
      password: {
        label: "මුරපදය",
        placeholder: "ආරක්ෂිත මුරපදයක් සාදන්න",
        hint: "මුරපදය අවම වශයෙන් අක්ෂර 8ක් විය යුතු අතර ඉහළ සහ පහළ අකුරු, අංක සහ සංකේත අඩංගු විය යුතුය",
        errors: {
          required: "මුරපදය අවශ්‍යයි",
          short: "මුරපදය අවම වශයෙන් අක්ෂර 8ක් විය යුතුය",
          weak: "කරුණාකර වඩාත් ශක්තිමත් මුරපදයක් භාවිතා කරන්න"
        },
        strength: {
          veryWeak: "ඉතා දුර්වලයි",
          weak: "දුර්වලයි",
          fair: "සාධාරණයි",
          good: "හොඳයි",
          strong: "ශක්තිමත්"
        }
      },
      confirmPassword: {
        label: "මුරපදය තහවුරු කරන්න",
        placeholder: "ඔබගේ මුරපදය තහවුරු කරන්න",
        errors: {
          mismatch: "මුරපද නොගැලපේ"
        }
      },
      fullName: {
        label: "සම්පූර්ණ නම",
        placeholder: "ඔබගේ සම්පූර්ණ නම (විකල්ප)"
      },
      location: {
        label: "ස්ථානය",
        placeholder: "දිස්ත්‍රික්කය, පළාත (විකල්ප)"
      },
      farmSize: {
        label: "ගොවිපොළ ප්‍රමාණය (හෙක්ටයාර)",
        placeholder: "උදා., 2.5 (විකල්ප)"
      },
      terms: {
        label: "මම එකඟ වෙමි",
        termsLink: "නියමයන් සහ කොන්දේසි",
        privacyLink: "පෞද්ගලිකත්ව ප්‍රතිපත්තිය",
        errors: {
          required: "ඔබ නියමයන් සහ කොන්දේසි පිළිගත යුතුයි"
        }
      },
      buttons: {
        continue: "ඉදිරියට",
        back: "ආපසු",
        create: "ගිණුම සාදන්න",
        creating: "ගිණුම සාදමින්..."
      }
    },
    footer: {
      alreadyHaveAccount: "දැනටමත් ගිණුමක් තිබේද?",
      signIn: "පිවිසෙන්න",
      disclaimer: "ගිණුමක් සෑදීමෙන්, ඔබ අපගේ සේවා කොන්දේසි සහ පෞද්ගලිකත්ව ප්‍රතිපත්තියට එකඟ වේ."
    },
    errors: {
      general: "ලියාපදිංචිය අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න."
    }
  },
  ta: {
    title: "உங்கள் கணக்கை உருவாக்கவும்",
    subtitle: "அல்லது உங்கள் ஏற்கனவே உள்ள கணக்கில் உள்நுழையவும்",
    steps: {
      account: "கணக்கு",
      profile: "சுயவிவரம்"
    },
    form: {
      username: {
        label: "பயனர்பெயர்",
        placeholder: "ஒரு பயனர்பெயரைத் தேர்ந்தெடுக்கவும்",
        errors: {
          required: "பயனர்பெயர் தேவை",
          short: "பயனர்பெயர் குறைந்தது 3 எழுத்துக்கள் இருக்க வேண்டும்"
        }
      },
      email: {
        label: "மின்னஞ்சல் முகவரி",
        placeholder: "நீங்கள்@உதாரணம்.com",
        errors: {
          required: "மின்னஞ்சல் தேவை",
          invalid: "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்"
        }
      },
      password: {
        label: "கடவுச்சொல்",
        placeholder: "ஒரு பாதுகாப்பான கடவுச்சொல்லை உருவாக்கவும்",
        hint: "கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் பெரிய & சிறிய எழுத்துக்கள், எண்கள் மற்றும் சின்னங்களுடன் இருக்க வேண்டும்",
        errors: {
          required: "கடவுச்சொல் தேவை",
          short: "கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் இருக்க வேண்டும்",
          weak: "தயவுசெய்து வலுவான கடவுச்சொல்லைப் பயன்படுத்தவும்"
        },
        strength: {
          veryWeak: "மிகவும் பலவீனமானது",
          weak: "பலவீனமானது",
          fair: "நியாயமானது",
          good: "நல்லது",
          strong: "வலுவானது"
        }
      },
      confirmPassword: {
        label: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
        placeholder: "உங்கள் கடவுச்சொல்லை உறுதிப்படுத்தவும்",
        errors: {
          mismatch: "கடவுச்சொற்கள் பொருந்தவில்லை"
        }
      },
      fullName: {
        label: "முழு பெயர்",
        placeholder: "உங்கள் முழு பெயர் (விருப்பமானது)"
      },
      location: {
        label: "இருப்பிடம்",
        placeholder: "மாவட்டம், மாகாணம் (விருப்பமானது)"
      },
      farmSize: {
        label: "பண்ணை அளவு (ஹெக்டேர்)",
        placeholder: "எ.கா., 2.5 (விருப்பமானது)"
      },
      terms: {
        label: "நான் ஒப்புக்கொள்கிறேன்",
        termsLink: "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
        privacyLink: "தனியுரிமைக் கொள்கை",
        errors: {
          required: "விதிமுறைகள் மற்றும் நிபந்தனைகளை ஏற்றுக்கொள்ள வேண்டும்"
        }
      },
      buttons: {
        continue: "தொடரவும்",
        back: "பின்னால்",
        create: "கணக்கை உருவாக்கவும்",
        creating: "கணக்கை உருவாக்குகிறது..."
      }
    },
    footer: {
      alreadyHaveAccount: "ஏற்கனவே ஒரு கணக்கு உள்ளதா?",
      signIn: "உள்நுழைக",
      disclaimer: "கணக்கை உருவாக்குவதன் மூலம், எங்கள் சேவை விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கைக்கு நீங்கள் ஒப்புக்கொள்கிறீர்கள்."
    },
    errors: {
      general: "பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்."
    }
  }
};

export default function Register() {
  const router = useRouter();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme.name === 'dark';
  
  const [trans, setTrans] = useState(translations.en);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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
    if (score === 0) message = trans.form.password.strength.veryWeak;
    else if (score === 1) message = trans.form.password.strength.weak;
    else if (score === 2) message = trans.form.password.strength.fair;
    else if (score === 3) message = trans.form.password.strength.good;
    else message = trans.form.password.strength.strong;
    
    setPasswordStrength({ score, message });
  };

  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = trans.form.username.errors.required;
    } else if (formData.username.length < 3) {
      errors.username = trans.form.username.errors.short;
    }
    
    if (!formData.email.trim()) {
      errors.email = trans.form.email.errors.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = trans.form.email.errors.invalid;
    }
    
    if (!formData.password) {
      errors.password = trans.form.password.errors.required;
    } else if (formData.password.length < 8) {
      errors.password = trans.form.password.errors.short;
    } else if (passwordStrength.score < 2) {
      errors.password = trans.form.password.errors.weak;
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = trans.form.confirmPassword.errors.mismatch;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep2 = () => {
    const errors = {};
    
    if (!formData.termsAccepted) {
      errors.termsAccepted = trans.form.terms.errors.required;
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
      setError(error.message || trans.errors.general);
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
          <h2 
            className="mt-6 text-center text-3xl font-extrabold" 
            style={{ ...contentStyle, ...getTextStyle({ color: theme.colors.text }) }}
          >
            {trans.title}
          </h2>
          <p 
            className="mt-2 text-center text-sm" 
            style={{ 
              ...contentStyle, 
              ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }) 
            }}
          >
            {trans.subtitle.split(' ')[0]}{' '}
            <Link 
              href="/login" 
              style={{ color: theme.colors.primary }} 
              className="font-medium hover:underline"
            >
              {trans.subtitle.split(' ').slice(1).join(' ')}
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
                  <span 
                    className="mt-1 text-xs" 
                    style={{ ...contentStyle, ...getTextStyle({ color: theme.colors.text }) }}
                  >
                    {trans.steps.account}
                  </span>
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
                  <span 
                    className="mt-1 text-xs" 
                    style={{ ...contentStyle, ...getTextStyle({ color: theme.colors.text }) }}
                  >
                    {trans.steps.profile}
                  </span>
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
                    <p 
                      className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}
                      style={{ ...contentStyle, ...getTextStyle() }}
                    >
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Step 1: Account Information */}
              {formStep === 1 && (
                <>
                  <div>
                    <label 
                      htmlFor="username" 
                      className="block text-sm font-medium" 
                      style={{ ...contentStyle, ...getTextStyle({ color: theme.colors.text }) }}
                    >
                      {trans.form.username.label} <span className="text-red-500">*</span>
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
                        placeholder={trans.form.username.placeholder}
                      />
                    </div>
                    {validationErrors.username && (
                      <p 
                        className="mt-2 text-sm text-red-600" 
                        style={{ ...contentStyle, ...getTextStyle() }}
                      >
                        {validationErrors.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-sm font-medium" 
                      style={{ ...contentStyle, ...getTextStyle({ color: theme.colors.text }) }}
                    >
                      {trans.form.email.label} <span className="text-red-500">*</span>
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
                        placeholder={trans.form.email.placeholder}
                      />
                    </div>
                    {validationErrors.email && (
                      <p 
                        className="mt-2 text-sm text-red-600" 
                        style={{ ...contentStyle, ...getTextStyle() }}
                      >
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label 
                      htmlFor="password" 
                      className="block text-sm font-medium" 
                      style={{ ...contentStyle, ...getTextStyle({ color: theme.colors.text }) }}
                    >
                      {trans.form.password.label} <span className="text-red-500">*</span>
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
                        placeholder={trans.form.password.placeholder}
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
                      <div className="mt-2" style={contentStyle}>
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
                          <span 
                            className={`ml-2 text-xs ${
                              passwordStrength.score <= 1 ? 'text-red-600' :
                              passwordStrength.score === 2 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}
                            style={getTextStyle()}
                          >
                            {passwordStrength.message}
                          </span>
                        </div>
                        <p 
                          className="mt-1 text-xs" 
                          style={{ 
                            ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }) 
                          }}
                        >
                          {trans.form.password.hint}
                        </p>
                      </div>
                    )}
                    {validationErrors.password && (
                      <p 
                        className="mt-2 text-sm text-red-600" 
                        style={{ ...contentStyle, ...getTextStyle() }}
                      >
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label 
                      htmlFor="confirmPassword" 
                      className="block text-sm font-medium" 
                      style={{ ...contentStyle, ...getTextStyle({ color: theme.colors.text }) }}
                    >
                      {trans.form.confirmPassword.label} <span className="text-red-500">*</span>
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
                        placeholder={trans.form.confirmPassword.placeholder}
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
                      <p 
                        className="mt-2 text-sm text-red-600" 
                        style={{ ...contentStyle, ...getTextStyle() }}
                      >
                        {validationErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors hover:bg-opacity-90"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <span style={{ ...contentStyle, ...getTextStyle() }}>
                        {trans.form.buttons.continue}
                      </span>
                    </button>
                  </div>
                </>
              )}
              
              {/* Step 2: Personal Information */}
              {formStep === 2 && (
                <>
                  <div>
                    <label 
                      htmlFor="fullName" 
                      className="block text-sm font-medium" 
                      style={{ ...contentStyle, ...getTextStyle({ color: theme.colors.text }) }}
                    >
                      {trans.form.fullName.label}
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
                        placeholder={trans.form.fullName.placeholder}
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      htmlFor="location" 
                      className="block text-sm font-medium" 
                      style={{ ...contentStyle, ...getTextStyle({ color: theme.colors.text }) }}
                    >
                      {trans.form.location.label}
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
                        placeholder={trans.form.location.placeholder}
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      htmlFor="farmSize" 
                      className="block text-sm font-medium" 
                      style={{ ...contentStyle, ...getTextStyle({ color: theme.colors.text }) }}
                    >
                      {trans.form.farmSize.label}
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
                        placeholder={trans.form.farmSize.placeholder}
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
                      <label 
                        htmlFor="termsAccepted" 
                        style={{ ...contentStyle, ...getTextStyle({ color: theme.colors.text }) }}
                      >
                        {trans.form.terms.label}{' '}
                        <a 
                          href="/terms" 
                          style={{ color: theme.colors.primary }} 
                          className="font-medium hover:underline"
                        >
                          {trans.form.terms.termsLink}
                        </a>{' '}
                        {language === 'en' ? 'and' : language === 'si' ? 'සහ' : 'மற்றும்'}{' '}
                        <a 
                          href="/privacy" 
                          style={{ color: theme.colors.primary }} 
                          className="font-medium hover:underline"
                        >
                          {trans.form.terms.privacyLink}
                        </a>{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      {validationErrors.termsAccepted && (
                        <p 
                          className="mt-1 text-sm text-red-600" 
                          style={{ ...contentStyle, ...getTextStyle() }}
                        >
                          {validationErrors.termsAccepted}
                        </p>
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
                      <span style={{ ...contentStyle, ...getTextStyle() }}>
                        {trans.form.buttons.back}
                      </span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'
                      }`}
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <span style={{ ...contentStyle, ...getTextStyle() }}>
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {trans.form.buttons.creating}
                          </>
                        ) : (
                          trans.form.buttons.create
                        )}
                      </span>
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
                  <span 
                    className="px-2" 
                    style={{ 
                      backgroundColor: theme.colors.card,
                      color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                      ...contentStyle,
                      ...getTextStyle()
                    }}
                  >
                    {trans.footer.alreadyHaveAccount}
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
                  <span style={{ ...contentStyle, ...getTextStyle() }}>
                    {trans.footer.signIn}
                  </span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p 
              className="text-xs" 
              style={{ 
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                ...contentStyle,
                ...getTextStyle()
              }}
            >
              {trans.footer.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}