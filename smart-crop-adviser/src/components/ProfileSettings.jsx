'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import {
  Loader2, Save, Trash2, AlertCircle, CheckCircle2, Eye, EyeOff,
  User, MapPin, Ruler, Lock, Shield, Globe2, X, Info
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* -------------------------------------------------------------------------- */
/*                               Inline UI Helpers                             */
/* -------------------------------------------------------------------------- */

// Enhanced toast system with better styling
function Toast({ toast, onClose }) {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
          border: 'border-emerald-200 dark:border-emerald-800/50',
          icon: 'text-emerald-600 dark:text-emerald-400',
          text: 'text-emerald-900 dark:text-emerald-100',
          progress: 'bg-emerald-500'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20',
          border: 'border-rose-200 dark:border-rose-800/50',
          icon: 'text-rose-600 dark:text-rose-400',
          text: 'text-rose-900 dark:text-rose-100',
          progress: 'bg-rose-500'
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
          border: 'border-blue-200 dark:border-blue-800/50',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-900 dark:text-blue-100',
          progress: 'bg-blue-500'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`pointer-events-auto w-full sm:w-[420px] rounded-xl border shadow-lg overflow-hidden backdrop-blur-sm ${styles.bg} ${styles.border}`}
      role="status"
      aria-live="polite"
    >
      <div className="p-4 flex gap-3 items-start">
        <div className={`mt-0.5 ${styles.icon}`}>
          {toast.type === 'success' && <CheckCircle2 size={20} />}
          {toast.type === 'error' && <AlertCircle size={20} />}
          {toast.type === 'info' && <Info size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <div className={`font-semibold text-sm ${styles.text}`}>
              {toast.title}
            </div>
          )}
          <div className={`text-sm ${styles.text} opacity-90`}>
            {toast.message}
          </div>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className={`${styles.text} opacity-60 hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded`}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
      {toast.progress !== undefined && (
        <div className="h-1 w-full bg-black/10 dark:bg-white/10">
          <div
            className={`h-full ${styles.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${toast.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ToastViewport({ toasts, dismiss }) {
  return (
    <div className="fixed top-4 right-4 z-[90] space-y-2 w-full sm:w-auto pointer-events-none">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onClose={dismiss} />
      ))}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  
  const show = useCallback((t) => {
    const id = Math.random().toString(36).slice(2, 8);
    const toast = { 
      id, 
      type: t.type ?? 'info', 
      title: t.title, 
      message: t.message, 
      progress: 100 
    };
    setToasts(prev => [...prev, toast]);
    
    const duration = t.duration ?? 4000;
    const startTime = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      
      setToasts(prev => 
        prev.map(x => x.id === id ? { ...x, progress: remaining } : x)
      );
      
      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      } else {
        dismiss(id);
      }
    };
    
    requestAnimationFrame(updateProgress);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}

// Enhanced confirm dialog
function ConfirmDialog({ open, title, description, confirmText, cancelText, onConfirm, onCancel }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-md">
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg">
                <Trash2 size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 font-medium"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   i18n                                      */
/* -------------------------------------------------------------------------- */

const UI_STRINGS = {
  en: {
    title: 'Profile Settings',
    subtitle: 'Manage your account information and preferences',
    signInNeeded: 'Please sign in to view your profile.',
    loading: 'Loading your profile…',
    personalInfo: 'Personal Information',
    username: 'Username',
    usernamePh: 'Enter your username',
    location: 'Location',
    locationPh: 'District / City / Address',
    land: 'Land Size (hectares)',
    landPh: 'e.g., 2.5',
    landHelp: 'Use decimals for fractions (e.g., 1.25). Leave empty if not applicable.',
    security: 'Security Settings',
    newPassword: 'New Password (optional)',
    pwPh: 'Leave blank to keep current password',
    pwReq: 'Password should contain uppercase, lowercase, numbers, and special characters.',
    pwKeep: "If left blank, your password won't be changed.",
    save: 'Save Changes',
    saving: 'Saving...',
    delete: 'Delete Account',
    deleting: 'Deleting...',
    signedInAs: 'Signed in as',
    role: 'Role',
    successUpdate: 'Profile updated successfully!',
    errLoad: 'Failed to load profile. Please try again.',
    errUpdate: 'Update failed. Please try again.',
    errDelete: 'Delete failed. Please try again.',
    confirmTitle: 'Confirm account deletion',
    confirmDesc:
      'This will permanently delete your account and all associated data. This action cannot be undone. Type DELETE to confirm.',
    confirm: 'Delete permanently',
    cancel: 'Cancel',
    typeDelete: 'Please type DELETE to confirm.',
    weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong',
    // validation
    vUserRequired: 'Username is required',
    vUserShort: 'Username must be at least 3 characters',
    vLocRequired: 'Location is required',
    vLandPos: 'Land size must be a positive number',
    vPwLen: 'Password must be at least 8 characters',
  },
  si: {
    title: 'පැතිකඩ සැකසුම්',
    subtitle: 'ඔබගේ ගිණුම් තොරතුරු සහ අභිරුචි කළමනාකරණය කරන්න',
    signInNeeded: 'ඔබගේ පැතිකඩ බැලීමට කරුණාකර ලොග් වන්න.',
    loading: 'ඔබගේ පැතිකඩ පූරණය වෙමින්…',
    personalInfo: 'පුද්ගලික තොරතුරු',
    username: 'පරිශීලක නාමය',
    usernamePh: 'ඔබගේ පරිශීලක නාමය ඇතුලත් කරන්න',
    location: 'ස්ථානය',
    locationPh: 'ජිලාව / නගරය / ලිපිනය',
    land: 'ඝණ අක්කර (hectares)',
    landPh: 'උදා: 2.5',
    landHelp: 'භාගයන් සඳහා දශම භාවිතා කරන්න (උදා: 1.25). නොගැලපේ නම් හිස්ව තබන්න.',
    security: 'ආරක්ෂක සැකසුම්',
    newPassword: 'නව මුරපදය (විකල්ප)',
    pwPh: 'වත්මන් මුරපදය තබා ගැනීමට හිස්ව තබන්න',
    pwReq: 'මහත් අකුරු, කුඩා අකුරු, ඉලක්කම් සහ විශේෂ ලකුණු තිබිය යුතුය.',
    pwKeep: 'හිස්ව තබන්නේ නම්, මුරපදය වෙනස් නොවේ.',
    save: 'වෙනස්කම් සුරකින්න',
    saving: 'සුරකිමින්…',
    delete: 'ගිණුම මකන්න',
    deleting: 'මකාහරිනුයේ…',
    signedInAs: 'ලොග් වී ඇත',
    role: 'භූමිකාව',
    successUpdate: 'පැතිකඩ සාර්ථකව යාවත්කාලින කළා!',
    errLoad: 'පැතිකඩ පූරණය අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
    errUpdate: 'යාවත්කාලීන කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
    errDelete: 'මකා දැමීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
    confirmTitle: 'ගිණුම මකාදැමීම තහවුරු කරන්න',
    confirmDesc:
      'මෙය ඔබගේ ගිණුම සහ සියලු දත්ත ස්ථිරවම මකා දමයි. මෙය පෙරවත් නොහැක. තහවුරු කිරීමට DELETE ටයිප් කරන්න.',
    confirm: 'ස්ථිරවම මකන්න',
    cancel: 'අවලංගු',
    typeDelete: 'තහවුරු කිරීමට කරුණාකර DELETE යන්න.',
    weak: 'දුර්වල', fair: 'මධ්‍යස්ථ', good: 'හොඳ', strong: 'වලිමත්',
    vUserRequired: 'පරිශීලක නාමය අවශ්‍යයි',
    vUserShort: 'පරිශීලක නාමය අකුරු 3කට වඩා විය යුතුය',
    vLocRequired: 'ස්ථානය අවශ්‍යයි',
    vLandPos: 'බිම් ප්‍රමාණය ධන සංඛ්‍යාවකින් විය යුතුය',
    vPwLen: 'මුරපදය අකුරු 8කට වඩා විය යුතුය',
  },
  ta: {
    title: 'சுயவிவர அமைப்புகள்',
    subtitle: 'உங்கள் கணக்கு தகவல்களையும் முன்னுரிமைகளையும் நிர்வகிக்கவும்',
    signInNeeded: 'உங்கள் சுயவிவரத்தைப் பார்க்க உள்நுழைக.',
    loading: 'உங்கள் சுயவிவரம் ஏற்றப்படுகிறது…',
    personalInfo: 'தனிப்பட்ட தகவல்',
    username: 'பயனர் பெயர்',
    usernamePh: 'உங்கள் பயனர் பெயரை உள்ளிடவும்',
    location: 'இடம்',
    locationPh: 'மாவட்டம் / நகரம் / முகவரி',
    land: 'நில அளவு (ஹெக்டேயர்)',
    landPh: 'உ.து., 2.5',
    landHelp: 'பாகங்களுக்குத் தசம எண் பயன்படுத்தவும் (உ.து., 1.25). தேவையில்லை என்றால் காலியாக விடவும்.',
    security: 'பாதுகாப்பு அமைப்புகள்',
    newPassword: 'புதிய கடவுச்சொல் (விருப்பம்)',
    pwPh: 'தற்போதைய கடவுச்சொல்லை வைக்க காலியாக விடவும்',
    pwReq: 'பெரிய/சிறிய எழுத்து, எண்கள், சிறப்பு குறிகள் கொண்டிருக்க வேண்டும்.',
    pwKeep: 'காலியாக விட்டால் கடவுச்சொல் மாற்றப்படாது.',
    save: 'மாற்றங்களைச் சேமிக்கவும்',
    saving: 'சேமிக்கிறது…',
    delete: 'கணக்கை நீக்கு',
    deleting: 'நீக்கப்படுகிறது…',
    signedInAs: 'உள்நுழைந்தவர்',
    role: 'பாத்திரம்',
    successUpdate: 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!',
    errLoad: 'சுயவிவரம் ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    errUpdate: 'புதுப்பிப்பு தோல்வி. மீண்டும் முயற்சிக்கவும்.',
    errDelete: 'நீக்குதல் தோல்வி. மீண்டும் முயற்சிக்கவும்.',
    confirmTitle: 'கணக்கை நீக்கலை உறுதிப்படுத்தவும்',
    confirmDesc:
      'இது உங்கள் கணக்கையும் அனைத்து தரவையும் நிரந்தரமாக நீக்கும். இது மாற்றமுடியாது. உறுதிப்படுத்த DELETE என type செய்யவும்.',
    confirm: 'நிரந்தரமாக நீக்கு',
    cancel: 'ரத்து',
    typeDelete: 'உறுதிப்படுத்த DELETE என தயவுசெய்து type செய்யவும்.',
    weak: 'பலவீனமான', fair: 'சராசரி', good: 'நன்று', strong: 'வலுவான',
    vUserRequired: 'பயனர் பெயர் தேவை',
    vUserShort: 'பயனர் பெயர் குறைந்தது 3 எழுத்துகள் இருக்க வேண்டும்',
    vLocRequired: 'இடம் தேவை',
    vLandPos: 'நில அளவு நேர்ம எண் ஆக இருக்க வேண்டும்',
    vPwLen: 'கடவுச்சொல் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும',
  },
};

/* -------------------------------------------------------------------------- */
/*                             Component: ProfileSettings                      */
/* -------------------------------------------------------------------------- */

export default function ProfileSettings() {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = (typeof theme === 'string' ? theme : theme?.name) === 'dark';

  // Language context with graceful fallback to English
  const langCtx = useLanguage();
  const activeLang = langCtx?.language || 'en';
  const t = useMemo(() => UI_STRINGS[activeLang] || UI_STRINGS.en, [activeLang]);

  const { toasts, show, dismiss } = useToasts();

  const [form, setForm] = useState({
    username: '',
    address: '',
    landsize: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  const userId = user?.id;

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return t.weak;
    if (passwordStrength < 50) return t.fair;
    if (passwordStrength < 75) return t.good;
    return t.strong;
  };

  const validateForm = () => {
    const errors = {};
    if (!form.username?.trim()) errors.username = t.vUserRequired;
    else if (form.username.length < 3) errors.username = t.vUserShort;

    if (!form.address?.trim()) errors.address = t.vLocRequired;

    if (form.landsize && (isNaN(form.landsize) || Number(form.landsize) <= 0)) {
      errors.landsize = t.vLandPos;
    }
    if (form.password && form.password.length < 8) {
      errors.password = t.vPwLen;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'landsize') {
      const v = value.replace(/[^\d.]/g, '');
      setForm((f) => ({ ...f, [name]: v }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const fetchMe = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to load profile');
      const userData = data.data;
      setForm({
        username: userData.username || '',
        address: userData.address || '',
        landsize: userData.landsize != null ? String(userData.landsize) : '',
        password: '',
      });
    } catch (err) {
      show({ type: 'error', message: t.errLoad });
    } finally {
      setLoading(false);
    }
  }, [userId, show, t.errLoad]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const onSave = async () => {
    if (!userId || !validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        username: form.username?.trim(),
        address: form.address?.trim(),
        landsize: form.landsize === '' ? null : Number(form.landsize),
      };
      if (form.password && form.password.trim().length > 0) {
        payload.password = form.password.trim();
      }
      const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Update failed');

      show({ type: 'success', message: t.successUpdate });
      if (setUser && data.data) setUser(data.data);
      setForm((f) => ({ ...f, password: '' }));
      setPasswordStrength(0);
    } catch (err) {
      show({ type: 'error', message: t.errUpdate });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    setDeleteText('');
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteText !== 'DELETE') {
      show({ type: 'error', message: t.typeDelete });
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Delete failed');

      show({ type: 'success', message: 'Account deleted.' });
      if (logout) logout();
      router.replace('/');
    } catch (err) {
      show({ type: 'error', message: t.errDelete });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (!userId) {
    return (
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <AlertCircle size={18} />
          <span>{t.signInNeeded}</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
          <span className="text-lg">{t.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Toasts */}
      <ToastViewport toasts={toasts} dismiss={dismiss} />

      {/* Header Section */}
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className={`p-6 rounded-2xl border ${isDark ? 'border-slate-700 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-100' : 'border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 text-slate-900'}`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`p-8 rounded-2xl border ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'} space-y-8`}>
          {/* Personal Information */}
          <div className="space-y-6">
            <div className={`flex items-center gap-2 pb-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <User size={20} className="text-indigo-500" />
              <h3 className="text-lg font-semibold">{t.personalInfo}</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Username */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <User size={16} />
                  {t.username}
                </label>
                <input
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder={t.usernamePh}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? `bg-slate-800 ${validationErrors.username ? 'border border-red-500' : 'border border-slate-700'}`
                      : `bg-white ${validationErrors.username ? 'border border-rose-400' : 'border border-slate-300'}`
                  }`}
                />
                {validationErrors.username && (
                  <p className="text-rose-500 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {validationErrors.username}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <MapPin size={16} />
                  {t.location}
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  placeholder={t.locationPh}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? `bg-slate-800 ${validationErrors.address ? 'border border-red-500' : 'border border-slate-700'}`
                      : `bg-white ${validationErrors.address ? 'border border-rose-400' : 'border border-slate-300'}`
                  }`}
                />
                {validationErrors.address && (
                  <p className="text-rose-500 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {validationErrors.address}
                  </p>
                )}
              </div>

              {/* Land size */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Ruler size={16} />
                  {t.land}
                </label>
                <input
                  name="landsize"
                  value={form.landsize}
                  onChange={onChange}
                  placeholder={t.landPh}
                  inputMode="decimal"
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? `bg-slate-800 ${validationErrors.landsize ? 'border border-red-500' : 'border border-slate-700'}`
                      : `bg-white ${validationErrors.landsize ? 'border border-rose-400' : 'border border-slate-300'}`
                  }`}
                />
                {validationErrors.landsize && (
                  <p className="text-rose-500 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {validationErrors.landsize}
                  </p>
                )}
                <p className={isDark ? 'text-xs text-slate-400' : 'text-xs text-slate-500'}>
                  {t.landHelp}
                </p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-6">
            <div className={`flex items-center gap-2 pb-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <Shield size={20} className="text-indigo-500" />
              <h3 className="text-lg font-semibold">{t.security}</h3>
            </div>

            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Lock size={16} />
                {t.newPassword}
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={onChange}
                  placeholder={t.pwPh}
                  className={`w-full px-4 py-3 pr-12 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? `bg-slate-800 ${validationErrors.password ? 'border border-red-500' : 'border border-slate-700'}`
                      : `bg-white ${validationErrors.password ? 'border border-rose-400' : 'border border-slate-300'}`
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {form.password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded-full h-2`}>
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <span className={isDark ? 'text-xs text-slate-300' : 'text-xs text-slate-600'}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <p className={isDark ? 'text-xs text-slate-400' : 'text-xs text-slate-500'}>
                    {t.pwReq}
                  </p>
                </div>
              )}

              {!form.password && (
                <p className={isDark ? 'text-xs text-slate-400' : 'text-xs text-slate-500'}>
                  {t.pwKeep}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 font-medium text-white"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>{saving ? t.saving : t.save}</span>
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 font-medium text-white"
            >
              {deleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
              <span>{deleting ? t.deleting : t.delete}</span>
            </button>
          </div>

          {/* Account Info Footer */}
          <div className={`pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className={`flex flex-col sm:flex-row sm:items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span>{t.signedInAs}</span>
              <span className={isDark ? 'text-slate-200 font-medium' : 'text-slate-900 font-medium'}>{user?.email}</span>
              <span className="hidden sm:inline">•</span>
              <span className="capitalize bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md text-xs font-medium">
                {user?.userlevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={t.confirmTitle}
        description={t.confirmDesc}
        confirmText={t.confirm}
        cancelText={t.cancel}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
      {confirmOpen && (
        <div className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md">
            <div className="mt-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xl">
              <label className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Type <span className="font-mono font-semibold">DELETE</span>:
              </label>
              <input
                className={`mt-2 w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                }`}
                value={deleteText}
                onChange={e => setDeleteText(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
