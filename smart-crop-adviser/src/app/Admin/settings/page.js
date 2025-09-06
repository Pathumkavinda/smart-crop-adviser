'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import {
  User, Mail, Phone, Lock, Save, ArrowLeft, AlertCircle, CheckCircle2, Eye, EyeOff
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Simple Toast Component
function Toast({ message, type, onClose }) {
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const iconColor = isSuccess ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${bgColor} ${textColor} shadow-lg max-w-sm`}>
      <div className="flex items-center gap-2">
        {isSuccess ? <CheckCircle2 className={`w-5 h-5 ${iconColor}`} /> : <AlertCircle className={`w-5 h-5 ${iconColor}`} />}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>
    </div>
  );
}

// Translation strings
const UI_STRINGS = {
  en: {
    title: 'Admin Settings',
    subtitle: 'Manage your profile and account settings',
    back: 'Back to Dashboard',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    email: 'Email Address',
    emailPlaceholder: 'Enter your email',
    phone: 'Phone Number',
    phonePlaceholder: 'Enter your phone number',
    security: 'Security',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    passwordPlaceholder: 'Enter password',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    successMessage: 'Settings updated successfully!',
    errorMessage: 'Failed to update settings. Please try again.',
    validation: {
      nameRequired: 'Full name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email address',
      phoneInvalid: 'Please enter a valid phone number',
      passwordMismatch: 'Passwords do not match',
      passwordLength: 'Password must be at least 8 characters'
    }
  },
  si: {
    title: 'පරිපාලක සැකසුම්',
    subtitle: 'ඔබේ පැතිකඩ සහ ගිණුම් සැකසුම් කළමනාකරණය කරන්න',
    back: 'පුවරුවට ආපසු',
    personalInfo: 'පුද්ගලික තොරතුරු',
    fullName: 'සම්පූර්ණ නාමය',
    fullNamePlaceholder: 'ඔබේ සම්පූර්ණ නාමය ඇතුලත් කරන්න',
    email: 'විද්‍යුත් තැපෑල',
    emailPlaceholder: 'ඔබේ විද්‍යුත් තැපෑල ඇතුලත් කරන්න',
    phone: 'දුරකථන අංකය',
    phonePlaceholder: 'ඔබේ දුරකථන අංකය ඇතුලත් කරන්න',
    security: 'ආරක්ෂාව',
    currentPassword: 'වත්මන් මුරපදය',
    newPassword: 'නව මුරපදය',
    confirmPassword: 'නව මුරපදය තහවුරු කරන්න',
    passwordPlaceholder: 'මුරපදය ඇතුලත් කරන්න',
    saveChanges: 'වෙනස්කම් සුරකින්න',
    saving: 'සුරකිමින්...',
    successMessage: 'සැකසුම් සාර්ථකව යාවත්කාලීන කරන ලදී!',
    errorMessage: 'සැකසුම් යාවත්කාලීන කිරීම අසාර්ථකයි. කරුණාකර නැවත උත්සාහ කරන්න.',
    validation: {
      nameRequired: 'සම්පූර්ණ නාමය අවශ්‍යයි',
      emailRequired: 'විද්‍යුත් තැපෑල අවශ්‍යයි',
      emailInvalid: 'කරුණාකර වලංගු විද්‍යුත් තැපෑලක් ඇතුලත් කරන්න',
      phoneInvalid: 'කරුණාකර වලංගු දුරකථන අංකයක් ඇතුලත් කරන්න',
      passwordMismatch: 'මුරපද නොගැලපේ',
      passwordLength: 'මුරපදය අකුරු 8කට වැඩියි විය යුතුය'
    }
  },
  ta: {
    title: 'நிர்வாகி அமைப்புகள்',
    subtitle: 'உங்கள் சுயவிவரம் மற்றும் கணக்கு அமைப்புகளை நிர்வகிக்கவும்',
    back: 'டாஷ்போர்டுக்கு திரும்பு',
    personalInfo: 'தனிப்பட்ட தகவல்',
    fullName: 'முழுப் பெயர்',
    fullNamePlaceholder: 'உங்கள் முழுப் பெயரை உள்ளிடவும்',
    email: 'மின்னஞ்சல் முகவரி',
    emailPlaceholder: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
    phone: 'தொலைபேசி எண்',
    phonePlaceholder: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
    security: 'பாதுகாப்பு',
    currentPassword: 'தற்போதைய கடவுச்சொல்',
    newPassword: 'புதிய கடவுச்சொல்',
    confirmPassword: 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    passwordPlaceholder: 'கடவுச்சொல்லை உள்ளிடவும்',
    saveChanges: 'மாற்றங்களைச் சேமிக்கவும்',
    saving: 'சேமிக்கிறது...',
    successMessage: 'அமைப்புகள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன!',
    errorMessage: 'அமைப்புகளை புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    validation: {
      nameRequired: 'முழுப் பெயர் தேவையானது',
      emailRequired: 'மின்னஞ்சல் தேவையானது',
      emailInvalid: 'செல்லுபடியாகும் மின்னஞ்சல் முகவரியை உள்ளிடவும்',
      phoneInvalid: 'செல்லுபடியாகும் தொலைபேசி எண்ணை உள்ளிடவும்',
      passwordMismatch: 'கடவுச்சொற்கள் பொருந்தவில்லை',
      passwordLength: 'கடவுச்சொல் குறைந்தது 8 எழுத்துகள்'
    }
  }
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';
  
  const langCtx = useLanguage();
  const activeLang = langCtx?.language || 'en';
  const t = UI_STRINGS[activeLang] || UI_STRINGS.en;

  // State management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Load user data
  const loadUserData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/users/${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const userData = data.data;
          setFormData({
            name: userData.name || userData.full_name || userData.username || '',
            email: userData.email || '',
            phone: userData.phone || userData.phone_number || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setToast({ message: t.errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user?.id, t.errorMessage]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t.validation.nameRequired;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t.validation.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.validation.emailInvalid;
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t.validation.phoneInvalid;
    }
    
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = t.validation.passwordLength;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = t.validation.passwordMismatch;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Save settings
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null
      };
      
      // Only include password if new password is provided
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
        updateData.currentPassword = formData.currentPassword;
      }
      
      const response = await fetch(`${API_URL}/api/v1/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setToast({ message: t.successMessage, type: 'success' });
          
          // Update user context
          if (setUser && data.data) {
            setUser(data.data);
          }
          
          // Clear password fields
          setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }));
        } else {
          setToast({ message: data.message || t.errorMessage, type: 'error' });
        }
    } else {
        setToast({ message: t.errorMessage, type: 'error' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setToast({ message: t.errorMessage, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Close toast
  const closeToast = () => {
    setToast(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-8">
            {/* Personal Information Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.personalInfo}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.fullName}
                    </label>
                    <input
                      type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t.fullNamePlaceholder}
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.name 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                  </div>

                {/* Email */}
                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.email}
                    </label>
                      <input
                        type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t.emailPlaceholder}
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.email 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                    </div>

                {/* Phone */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t.phonePlaceholder}
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.phone 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                  )}
                  </div>
                </div>
              </div>

            {/* Security Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.security}</h2>
                    </div>
              
              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.currentPassword}
                  </label>
                  <div className="relative">
                      <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder={t.passwordPlaceholder}
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.newPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder={t.passwordPlaceholder}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.newPassword 
                          ? 'border-red-300 dark:border-red-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
                  )}
              </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.confirmPassword}
                    </label>
                    <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder={t.passwordPlaceholder}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.confirmPassword 
                          ? 'border-red-300 dark:border-red-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
              
            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t.saving}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t.saveChanges}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
