'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

import {
  User,
  MapPin,
  Sprout,
  Phone,
  Mail,
  Save,
  Shield,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Languages,
  Palette,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE = `${API_URL}/api/v1`;

/* ----------------------------- Safe fetch utils ---------------------------- */
async function safeFetch(url, { signal, timeoutMs = 15000, ...options } = {}) {
  const makeTimeoutSignal = () =>
    typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
      ? AbortSignal.timeout(timeoutMs)
      : null;

  const timeoutSignal = makeTimeoutSignal();
  let controller;
  let combinedSignal = signal;

  if (!combinedSignal && !timeoutSignal) {
    controller = new AbortController();
    combinedSignal = controller.signal;
    setTimeout(() => {
      try { controller.abort('timeout'); } catch {}
    }, timeoutMs);
  } else if (timeoutSignal && signal) {
    controller = new AbortController();
    const onAbort = () => controller.abort(signal.reason ?? 'aborted');
    signal.addEventListener('abort', onAbort, { once: true });
    timeoutSignal.addEventListener('abort', onAbort, { once: true });
    combinedSignal = controller.signal;
  } else if (timeoutSignal && !signal) {
    combinedSignal = timeoutSignal;
  }

  try {
    const res = await fetch(url, { ...options, signal: combinedSignal, cache: 'no-store' });
    if (!res.ok) {
      let msg = `Request failed with status ${res.status}`;
      try {
        const j = await res.json();
        if (j?.message) msg = j.message;
      } catch {}
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return res;
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    console.error(`safeFetch error for ${url}:`, err);
    throw err;
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch (e) {
    console.error('Invalid JSON response', e);
    return null;
  }
}

/* --------------------------------- Page ----------------------------------- */
export default function FarmerProfilePage() {
  const router = useRouter();
  const { user, token } = useAuth?.() || { user: null, token: null };
  const { theme, setTheme } = useTheme?.() || { theme: 'dark', setTheme: () => {} };
  const { language, setLanguage } = useLanguage?.() || { language: 'en', setLanguage: () => {} };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  const isMounted = useRef(true);

  const [profile, setProfile] = useState({
    id: null,
    username: '',
    email: '',
    phone: '',
    role: 'farmer',
    district: '',
    aez: '',
    farm_size_acres: '',
    preferred_language: language || 'en',
    preferred_theme: theme || 'dark',
  });

  const isAuthed = !!user?.id;
  const authHeaders = useMemo(() => {
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }, [token]);

  // Connectivity check & cleanup
  useEffect(() => {
    isMounted.current = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/users`, { method: 'HEAD', cache: 'no-store' });
        setIsConnected(res.ok);
      } catch {
        setIsConnected(false);
      }
    })();
    return () => { isMounted.current = false; };
  }, []);

  const showStatus = useCallback((variant, message) => {
    if (!isMounted.current) return;
    setStatus({ variant, message });
    const t = setTimeout(() => {
      if (isMounted.current) setStatus(null);
    }, 3500);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  // Load profile (abort-safe)
  useEffect(() => {
    if (!isAuthed) {
      router.push('/login');
      return;
    }

    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await safeFetch(`${API_BASE}/users/${user.id}`, {
          headers: authHeaders,
          signal: ac.signal,
        });
        const data = await safeJson(res);

        if (ac.signal.aborted) return;

        setProfile((p) => ({
          ...p,
          id: data?.id ?? user.id,
          username: data?.username ?? '',
          email: data?.email ?? '',
          phone: data?.phone ?? '',
          role: data?.role ?? 'farmer',
          district: data?.district ?? '',
          aez: data?.aez ?? '',
          farm_size_acres: data?.farm_size_acres ?? '',
          preferred_language: data?.preferred_language ?? (language || 'en'),
          preferred_theme: data?.preferred_theme ?? (theme || 'dark'),
        }));
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setError(err.message || 'Could not load your profile');
        showStatus('error', 'Could not load your profile. Please try again.');
        if (user) {
          setProfile((p) => ({
            ...p,
            id: user.id,
            username: user.username || '',
            email: user.email || '',
            role: user.role || 'farmer',
          }));
        }
      } finally {
        if (!ac.signal.aborted && isMounted.current) setLoading(false);
      }
    })();

    return () => ac.abort('route change');
  }, [isAuthed, user?.id, authHeaders, router, language, theme, showStatus]);

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      showStatus('error', 'Cannot save changes: API is currently unavailable');
      return;
    }
    try {
      setSaving(true);
      setError(null);

      const payload = {
        username: profile.username,
        email: profile.email,
        phone: profile.phone,
        district: profile.district,
        aez: profile.aez,
        farm_size_acres: profile.farm_size_acres === '' ? null : Number(profile.farm_size_acres),
        preferred_language: profile.preferred_language,
        preferred_theme: profile.preferred_theme,
      };

      const ac = new AbortController();
      const res = await safeFetch(`${API_BASE}/users/${profile.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(payload),
        signal: ac.signal,
      });
      await safeJson(res);

      if (setLanguage && profile.preferred_language) setLanguage(profile.preferred_language);
      if (setTheme && profile.preferred_theme) setTheme(profile.preferred_theme);

      showStatus('success', 'Profile updated successfully.');
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setError(err.message || 'Failed to save profile');
      showStatus('error', err.message || 'Failed to save profile.');
    } finally {
      if (isMounted.current) setSaving(false);
    }
  };

  // Change password
  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm_password: '' });

  const submitPassword = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      showStatus('error', 'Cannot change password: API is currently unavailable');
      return;
    }
    if (!pw.new_password || pw.new_password.length < 6) {
      showStatus('error', 'New password must be at least 6 characters.');
      return;
    }
    if (pw.new_password !== pw.confirm_password) {
      showStatus('error', 'New password and confirmation do not match.');
      return;
    }

    try {
      setPwSaving(true);
      setError(null);

      const ac = new AbortController();
      const res = await safeFetch(`${API_BASE}/users/${profile.id}/password`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          current_password: pw.current_password,
          new_password: pw.new_password,
        }),
        signal: ac.signal,
      });
      await safeJson(res);

      setPw({ current_password: '', new_password: '', confirm_password: '' });
      showStatus('success', 'Password changed successfully.');
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setError(err.message || 'Failed to change password');
      showStatus('error', err.message || 'Failed to change password.');
    } finally {
      if (isMounted.current) setPwSaving(false);
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-200">
        <Loader2 className="animate-spin" />
        <p>Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900/60 transition"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </Link>
          <div className="ml-auto text-sm text-slate-400">
            {profile.role === 'farmer' ? (
              <span className="inline-flex items-center gap-1">
                <Leaf size={14} /> Farmer Profile
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <User size={14} /> {profile.role}
              </span>
            )}
          </div>
        </div>

        {/* API Status Indicator */}
        {!isConnected && (
          <div className="mb-4 border-l-4 border-yellow-500 p-4 rounded bg-yellow-900/30">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-300">
                  API connection unavailable. Some features may be limited.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-800">
              <User size={28} className="text-slate-300" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold">{profile.username || 'Unnamed Farmer'}</h1>
              <p className="text-slate-400 text-sm sm:text-base">{profile.email || '—'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || loading || !isConnected}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-4 py-2 transition"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Status */}
          {status && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                status.variant === 'success'
                  ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-700/40'
                  : 'bg-rose-600/15 text-rose-300 border border-rose-700/40'
              }`}
            >
              {status.variant === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{status.message}</span>
            </div>
          )}

          {/* Global error message */}
          {error && !status && (
            <div className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm bg-rose-600/15 text-rose-300 border border-rose-700/40">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Basic & Farm */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/40">
              <header className="flex items-center gap-2 border-b border-slate-800 px-5 py-3">
                <User size={18} className="text-slate-300" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Basic Information
                </h2>
              </header>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Username"
                  name="username"
                  placeholder="e.g., Sunil Perera"
                  value={profile.username}
                  onChange={handleChange}
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  icon={<Mail size={16} />}
                  placeholder="you@example.com"
                  value={profile.email}
                  onChange={handleChange}
                />
                <Field
                  label="Phone"
                  name="phone"
                  icon={<Phone size={16} />}
                  placeholder="+94 7X XXX XXXX"
                  value={profile.phone}
                  onChange={handleChange}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Preferred Language"
                    name="preferred_language"
                    icon={<Languages size={16} />}
                    value={profile.preferred_language}
                    onChange={handleChange}
                    options={[
                      { label: 'English', value: 'en' },
                      { label: 'සිංහල (Sinhala)', value: 'si' },
                      { label: 'தமிழ் (Tamil)', value: 'ta' },
                    ]}
                  />
                  <Select
                    label="Theme"
                    name="preferred_theme"
                    icon={<Palette size={16} />}
                    value={profile.preferred_theme}
                    onChange={handleChange}
                    options={[
                      { label: 'Dark', value: 'dark' },
                      { label: 'Light', value: 'light' },
                      { label: 'System', value: 'system' },
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* Farm Details */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/40">
              <header className="flex items-center gap-2 border-b border-slate-800 px-5 py-3">
                <Sprout size={18} className="text-slate-300" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Farm Details
                </h2>
              </header>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="District"
                  name="district"
                  icon={<MapPin size={16} />}
                  placeholder="e.g., Kegalle"
                  value={profile.district}
                  onChange={handleChange}
                />
                <Field
                  label="Agro-Ecological Zone (AEZ)"
                  name="aez"
                  placeholder="e.g., WM1a, WL2b"
                  value={profile.aez}
                  onChange={handleChange}
                />
                <Field
                  label="Farm Size (acres)"
                  name="farm_size_acres"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 1.5"
                  value={profile.farm_size_acres}
                  onChange={handleChange}
                />
              </div>
            </section>
          </div>

          {/* Right: Security */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/40">
              <header className="flex items-center gap-2 border-b border-slate-800 px-5 py-3">
                <Shield size={18} className="text-slate-300" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Security
                </h2>
              </header>

              <form onSubmit={submitPassword} className="p-5 space-y-4">
                <PasswordField
                  label="Current Password"
                  name="current_password"
                  value={pw.current_password}
                  onChange={(e) => setPw({ ...pw, current_password: e.target.value })}
                />
                <PasswordField
                  label="New Password"
                  name="new_password"
                  value={pw.new_password}
                  onChange={(e) => setPw({ ...pw, new_password: e.target.value })}
                />
                <PasswordField
                  label="Confirm New Password"
                  name="confirm_password"
                  value={pw.confirm_password}
                  onChange={(e) => setPw({ ...pw, confirm_password: e.target.value })}
                />

                <button
                  type="submit"
                  disabled={pwSaving || !isConnected}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 transition"
                >
                  {pwSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Update Password
                </button>

                <p className="text-xs text-slate-400 pt-1">
                  Use at least 6 characters. Avoid reusing passwords across sites.
                </p>
              </form>
            </section>

            {/* Mini helper card */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="font-medium mb-2">Tips</h3>
              <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                <li>Keep your district and AEZ up to date for better crop advice.</li>
                <li>You can change language and theme in "Basic Information".</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Loading blanket */}
        {loading && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-4 flex items-center gap-3">
              <Loader2 className="animate-spin" />
              <span>Loading profile…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Subcomponents ------------------------------ */
function Field({ label, name, value, onChange, placeholder, type = 'text', icon, ...rest }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-slate-400 mb-1">{label}</span>
      <div className="relative">
        {icon && <span className="absolute left-3 top-2.5 text-slate-500">{icon}</span>}
        <input
          type={type}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 outline-none px-3 py-2 placeholder:text-slate-600
            ${icon ? 'pl-9' : ''}`}
          {...rest}
        />
      </div>
    </label>
  );
}

function Select({ label, name, value, onChange, options, icon }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-slate-400 mb-1">{label}</span>
      <div className="relative">
        {icon && <span className="absolute left-3 top-2.5 text-slate-500">{icon}</span>}
        <select
          name={name}
          value={value ?? ''}
          onChange={onChange}
          className={`w-full rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 outline-none px-3 py-2
            ${icon ? 'pl-9' : ''}`}
        >
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function PasswordField({ label, name, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-slate-400 mb-1">{label}</span>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder="•••••••"
          className="w-full rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 outline-none px-3 py-2"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </label>
  );
}
