'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, Save, Trash2, AlertCircle, CheckCircle2, Eye, EyeOff,
  User, Building2, Phone, Mail, Shield, Lock, X, Info, ArrowLeft
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* -------------------------------------------------------------------------- */
/*                               Inline UI Helpers                             */
/* -------------------------------------------------------------------------- */

function Toast({ toast, onClose }) {
  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      icon: 'text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-900 dark:text-emerald-100',
      progress: 'bg-emerald-500'
    },
    error: {
      bg: 'bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20',
      border: 'border-rose-200 dark:border-rose-800/50',
      icon: 'text-rose-600 dark:text-rose-400',
      text: 'text-rose-900 dark:text-rose-100',
      progress: 'bg-rose-500'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      border: 'border-blue-200 dark:border-blue-800/50',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-900 dark:text-blue-100',
      progress: 'bg-blue-500'
    }
  }[toast.type || 'info'];

  return (
    <div className={`pointer-events-auto w-full sm:w-[420px] rounded-xl border shadow-lg overflow-hidden backdrop-blur-sm ${styles.bg} ${styles.border}`} role="status" aria-live="polite">
      <div className="p-4 flex gap-3 items-start">
        <div className={`mt-0.5 ${styles.icon}`}>
          {toast.type === 'success' && <CheckCircle2 size={20} />}
          {toast.type === 'error' && <AlertCircle size={20} />}
          {toast.type !== 'success' && toast.type !== 'error' && <Info size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          {toast.title && <div className={`font-semibold text-sm ${styles.text}`}>{toast.title}</div>}
          <div className={`text-sm ${styles.text} opacity-90`}>{toast.message}</div>
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
          <div className={`h-full ${styles.progress} transition-all duration-100 ease-linear`} style={{ width: `${toast.progress}%` }} />
        </div>
      )}
    </div>
  );
}

function ToastViewport({ toasts, dismiss }) {
  return (
    <div className="fixed top-4 right-4 z-[90] space-y-2 w-full sm:w-auto pointer-events-none">
      {toasts.map(t => <Toast key={t.id} toast={t} onClose={dismiss} />)}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  const show = useCallback((t) => {
    const id = Math.random().toString(36).slice(2, 8);
    const toast = { id, type: t.type ?? 'info', title: t.title, message: t.message, progress: 100 };
    setToasts(prev => [...prev, toast]);
    const duration = t.duration ?? 4000;
    const start = Date.now();
    const tick = () => {
      const left = Math.max(0, 100 - ((Date.now() - start) / duration) * 100);
      setToasts(prev => prev.map(x => x.id === id ? { ...x, progress: left } : x));
      if (left > 0) requestAnimationFrame(tick);
      else dismiss(id);
    };
    requestAnimationFrame(tick);
    return id;
  }, [dismiss]);
  return { toasts, show, dismiss };
}

function ConfirmDialog({ open, title, description, confirmText, cancelText, onConfirm, onCancel, children }) {
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
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
              </div>
            </div>
            {children}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 font-medium">
                {cancelText}
              </button>
              <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
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
    title: 'Admin Profile',
    subtitle: 'Manage administrator account information & security',
    back: 'Back',
    toDashboard: 'Admin Dashboard',
    signInNeeded: 'Please sign in to view your profile.',
    loading: 'Loading your profile…',
    personalInfo: 'Personal Information',
    fullName: 'Full name',
    fullNamePh: 'Enter full name',
    email: 'Email',
    emailPh: 'admin@example.com',
    phone: 'Phone',
    phonePh: '+94 77 123 4567',
    titleLbl: 'Title',
    titlePh: 'e.g., Agricultural Officer',
    org: 'Organization',
    orgPh: 'Department / Company',
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
    confirmDesc: 'This will permanently delete this admin and all associated data. This action cannot be undone. Type DELETE to confirm.',
    confirm: 'Delete permanently',
    cancel: 'Cancel',
    typeDelete: 'Please type DELETE to confirm.',
    // validation
    vNameRequired: 'Full name is required',
    vEmailRequired: 'Email is required',
    vEmailBad: 'Please enter a valid email',
    vPwLen: 'Password must be at least 8 characters',
  },
  si: {
    title: 'පරිපාලක පැතිකඩ',
    subtitle: 'පරිපාලක ගිණුම් තොරතුරු සහ ආරක්ෂාව කළමනාකරණය කරන්න',
    back: 'ආපසු',
    toDashboard: 'පරිපාලක පුවරුව',
    signInNeeded: 'පැතිකඩ බැලීමට කරුණාකර ලොග් වන්න.',
    loading: 'පැතිකඩ පූරණය වෙමින්…',
    personalInfo: 'පුද්ගලික තොරතුරු',
    fullName: 'සම්පූර්ණ නාමය',
    fullNamePh: 'සම්පූර්ණ නාමය ඇතුලත් කරන්න',
    email: 'විද්‍යුත් තැපෑල',
    emailPh: 'admin@example.com',
    phone: 'දුරකථන',
    phonePh: '+94 77 123 4567',
    titleLbl: 'හිඳුම',
    titlePh: 'උදා: කෘෂි නිලධාරී',
    org: 'ආයතනය',
    orgPh: 'දෙපාර්තමේන්තුව / සමාගම',
    security: 'ආරක්ෂක සැකසුම්',
    newPassword: 'නව මුරපදය (විකල්ප)',
    pwPh: 'වත්මන් මුරපදය තබා ගැනීමට හිස්ව තබන්න',
    pwReq: 'මහත්/කුඩා අකුරු, ඉලක්කම්, විශේෂ ලකුණු විය යුතුය.',
    pwKeep: 'හිස් නම් මුරපදය වෙනස් නොවේ.',
    save: 'වෙනස්කම් සුරකින්න',
    saving: 'සුරකිමින්…',
    delete: 'ගිණුම මකන්න',
    deleting: 'මකාහරිනුයේ…',
    signedInAs: 'ලොග් වී ඇත්තේ',
    role: 'භූමිකාව',
    successUpdate: 'පැතිකඩ යාවත්කාලීන ചെയ്തു!',
    errLoad: 'පැතිකඩ පූරණය අසාර්ථකයි.',
    errUpdate: 'යාවත්කාලීන කිරීම අසාර්ථකයි.',
    errDelete: 'මකා දැමීම අසාර්ථකයි.',
    confirmTitle: 'ගිණුම මකා දැමීම තහවුරු කරන්න',
    confirmDesc: 'මෙයින් පරිපාලක ගිණුම සහ දත්ත ස්ථිරවම මකා දමයි. තහවුරු කිරීමට DELETE ටයිප් කරන්න.',
    confirm: 'ස්ථිරවම මකන්න',
    cancel: 'අවලංගු කරන්න',
    typeDelete: 'තහවුරු කිරීමට DELETE යන්න.',
    vNameRequired: 'සම්පූර්ණ නාමය අවශ්‍යයි',
    vEmailRequired: 'විද්‍යුත් තැපෑල අවශ්‍යයි',
    vEmailBad: 'වලංගු විද්‍යුත් තැපෑලක් යොදන්න',
    vPwLen: 'මුරපදය අකුරු 8කට වැඩියි විය යුතුය',
  },
  ta: {
    title: 'நிர்வாகி சுயவிவரம்',
    subtitle: 'நிர்வாகிக் கணக்கு தகவல் & பாதுகாப்பை நிர்வகிக்கவும்',
    back: 'பின்',
    toDashboard: 'நிர்வாக தளம்',
    signInNeeded: 'சுயவிவரத்தைப் பார்க்க உள்நுழைக.',
    loading: 'சுயவிவரம் ஏற்றுகிறது…',
    personalInfo: 'தனிப்பட்ட தகவல்',
    fullName: 'முழுப் பேர்',
    fullNamePh: 'முழுப் பெயரை உள்ளிடவும்',
    email: 'மின்னஞ்சல்',
    emailPh: 'admin@example.com',
    phone: 'தொலைபேசி',
    phonePh: '+94 77 123 4567',
    titleLbl: 'பதவி',
    titlePh: 'எ.கா., விவசாய அதிகாரி',
    org: 'அமைப்பு',
    orgPh: 'துறை / நிறுவனம்',
    security: 'பாதுகாப்பு அமைப்புகள்',
    newPassword: 'புதிய கடவுச்சொல் (விருப்பம்)',
    pwPh: 'தற்போதைய கடவுச்சொல்லை வைக்க காலியாக விடவும்',
    pwReq: 'பெரிய/சிறிய எழுத்து, எண்கள், சின்னங்கள் இருக்க வேண்டும்.',
    pwKeep: 'காலியாக விட்டால் கடவுச்சொல் மாறாது.',
    save: 'மாற்றங்களைச் சேமிக்கவும்',
    saving: 'சேமிக்கிறது…',
    delete: 'கணக்கை நீக்கு',
    deleting: 'நீக்குகிறது…',
    signedInAs: 'உள்நுழைந்தவர்',
    role: 'பாத்திரம்',
    successUpdate: 'சுயவிவரம் புதுப்பிக்கப்பட்டது!',
    errLoad: 'சுயவிவரம் ஏற்ற முடியவில்லை.',
    errUpdate: 'புதுப்பிப்பு தோல்வி.',
    errDelete: 'நீக்கல் தோல்வி.',
    confirmTitle: 'கணக்கை நீக்கலை உறுதிப்படுத்தவும்',
    confirmDesc: 'இது நிர்வாகக் கணக்கை நிரந்தரமாக நீக்கும். உறுதிப்படுத்த DELETE என type செய்யவும்.',
    confirm: 'நிரந்தரமாக நீக்கு',
    cancel: 'ரத்து',
    typeDelete: 'உறுதிப்படுத்த DELETE என type செய்யவும்.',
    vNameRequired: 'முழுப் பெயர் தேவையானது',
    vEmailRequired: 'மின்னஞ்சல் தேவையானது',
    vEmailBad: 'செல்லுபடியாகும் மின்னஞ்சலை உள்ளிடவும்',
    vPwLen: 'கடவுச்சொல் குறைந்தது 8 எழுத்துகள்',
  },
};

/* -------------------------------------------------------------------------- */
/*                           Component: AdminProfilePage                       */
/* -------------------------------------------------------------------------- */

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = (typeof theme === 'string' ? theme : theme?.name) === 'dark';

  const langCtx = useLanguage();
  const activeLang = langCtx?.language || 'en';
  const t = useMemo(() => UI_STRINGS[activeLang] || UI_STRINGS.en, [activeLang]);

  const { toasts, show, dismiss } = useToasts();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    organization: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  const userId = user?.id;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name?.trim()) errors.name = t.vNameRequired;
    if (!form.email?.trim()) errors.email = t.vEmailRequired;
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = t.vEmailBad;
    if (form.password && form.password.length < 8) errors.password = t.vPwLen;
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchMe = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/users/${userId}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to load');
      const u = data.data || {};
      setForm({
        name: u.name || u.full_name || u.username || '',
        email: u.email || '',
        phone: u.phone || u.phone_number || '',
        title: u.title || u.job_title || '',
        organization: u.organization || u.org || u.company || '',
        password: '',
      });
    } catch {
      show({ type: 'error', message: t.errLoad });
    } finally {
      setLoading(false);
    }
  }, [userId, show, t.errLoad]);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const onSave = async () => {
    if (!userId || !validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name?.trim(),
        email: form.email?.trim(),
        phone: form.phone?.trim() || null,
        title: form.title?.trim() || null,
        organization: form.organization?.trim() || null,
      };
      if (form.password?.trim()) payload.password = form.password.trim();

      const res = await fetch(`${API_URL}/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Update failed');

      show({ type: 'success', message: t.successUpdate });
      if (setUser && data.data) setUser(data.data);
      setForm((f) => ({ ...f, password: '' }));
    } catch {
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
      const res = await fetch(`${API_URL}/api/v1/users/${userId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Delete failed');
      show({ type: 'success', message: 'Account deleted.' });
      logout?.();
      router.replace('/');
    } catch {
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
      <ToastViewport toasts={toasts} dismiss={dismiss} />

      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'border-slate-700 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-100' : 'border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 text-slate-900'}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <ArrowLeft size={16} />
                {t.back}
              </button>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
                <User size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t.title}</h1>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t.subtitle}</p>
              </div>
            </div>
            <Link
              href="/admin/dashboard"
              className="text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-black/5 dark:hover:bg-white/10"
            >
              {t.toDashboard}
            </Link>
          </div>
        </div>

        {/* Card */}
        <div className={`p-8 rounded-2xl border ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'} space-y-8`}>
          {/* Personal Info */}
          <div className="space-y-6">
            <div className={`flex items-center gap-2 pb-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <User size={20} className="text-indigo-500" />
              <h3 className="text-lg font-semibold">{t.personalInfo}</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Full name */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <User size={16} />
                  {t.fullName}
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder={t.fullNamePh}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? `bg-slate-800 ${validationErrors.name ? 'border border-red-500' : 'border border-slate-700'}`
                           : `bg-white ${validationErrors.name ? 'border border-rose-400' : 'border border-slate-300'}`
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-rose-500 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Mail size={16} />
                  {t.email}
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder={t.emailPh}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? `bg-slate-800 ${validationErrors.email ? 'border border-red-500' : 'border border-slate-700'}`
                           : `bg-white ${validationErrors.email ? 'border border-rose-400' : 'border border-slate-300'}`
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-rose-500 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Phone size={16} />
                  {t.phone}
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder={t.phonePh}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-300'
                  }`}
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Shield size={16} />
                  {t.titleLbl}
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  placeholder={t.titlePh}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-300'
                  }`}
                />
              </div>

              {/* Organization */}
              <div className="space-y-2 lg:col-span-2">
                <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Building2 size={16} />
                  {t.org}
                </label>
                <input
                  name="organization"
                  value={form.organization}
                  onChange={onChange}
                  placeholder={t.orgPh}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-6">
            <div className={`flex items-center gap-2 pb-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <Lock size={20} className="text-indigo-500" />
              <h3 className="text-lg font-semibold">{t.security}</h3>
            </div>

            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Shield size={16} />
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
                    isDark ? `bg-slate-800 ${validationErrors.password ? 'border border-red-500' : 'border border-slate-700'}`
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
              {!form.password && <p className={isDark ? 'text-xs text-slate-400' : 'text-xs text-slate-500'}>{t.pwKeep}</p>}
              {validationErrors.password && (
                <p className="text-rose-500 text-sm flex items-center gap-1">
                  <AlertCircle size={14} />
                  {validationErrors.password}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
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

          {/* Footer */}
          <div className={`pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className={`flex flex-col sm:flex-row sm:items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span>{t.signedInAs}</span>
              <span className={isDark ? 'text-slate-200 font-medium' : 'text-slate-900 font-medium'}>{user?.email}</span>
              <span className="hidden sm:inline">•</span>
              <span className="capitalize bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md text-xs font-medium">
                {user?.userlevel || 'admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title={t.confirmTitle}
        description={t.confirmDesc}
        confirmText={t.confirm}
        cancelText={t.cancel}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      >
        <div className="mt-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
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
      </ConfirmDialog>
    </>
  );
}
