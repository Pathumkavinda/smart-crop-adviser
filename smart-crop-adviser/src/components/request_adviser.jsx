'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  UserPlus, CalendarPlus, Send, Loader2, CheckCircle2, AlertCircle,
  CalendarClock, MapPin, MessageSquare, User, Trash2, RefreshCw
} from 'lucide-react';

/* ----------------------------------------------------------------------------
   API utils (kept resilient with fallbacks)
---------------------------------------------------------------------------- */
const RAW_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE = RAW_API.replace(/\/+$/, '');
const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
const authHeader = (token) => (token ? { Authorization: `Bearer ${token}` } : {});
const safeJSON = async (res) => { try { return await res.json(); } catch { return null; } };

// normalize arrays like {data:[…]}, {rows:[…]}, or plain […]
const toArray = (body) => {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== 'object') return [];
  const keys = ['data', 'items', 'results', 'rows', 'records', 'list', 'users'];
  for (const k of keys) {
    if (Array.isArray(body[k])) return body[k];
    if (body[k] && typeof body[k] === 'object' && Array.isArray(body[k].rows)) return body[k].rows;
  }
  return [];
};

// GET list (first success)
async function firstList(urls, headers) {
  for (const url of urls) {
    try {
      const r = await fetch(url, { headers });
      if (!r.ok) continue;
      return toArray(await safeJSON(r));
    } catch { /* try next */ }
  }
  return [];
}

// POST (first success)
async function firstPost(urls, payload, headers) {
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(headers || {}) },
        body: JSON.stringify(payload),
      });
      if (!r.ok) continue;
      return await safeJSON(r);
    } catch { /* try next */ }
  }
  return null;
}

// DELETE (first success)
async function firstDelete(urls, headers) {
  for (const url of urls) {
    try {
      const r = await fetch(url, { method: 'DELETE', headers });
      if (!r.ok) continue;
      return true;
    } catch { /* try next */ }
  }
  return false;
}

/* ----------------------------------------------------------------------------
   Helpers
---------------------------------------------------------------------------- */
function addMinutes(iso, mins = 30) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString();
}

function formatDT(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString();
}

// datetime-local accepts "YYYY-MM-DDThh:mm"
function toLocalInputValue(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

// Extract a state-ish field from a user row
function pickState(u) {
  return (
    u.state ??
    u.state_name ??
    u.region ??
    u.province ??
    u.district ??
    u.address_state ??
    u.address ??
    ''
  );
}

// Extract "user level" from various fields; return a string
function pickUserLevel(u) {
  return (
    u.userlevel ??
    u.userLevel ??
    u.user_level ??
    u.level ??
    u.role_name ??
    u.roleTitle ??
    u.role ??
    u.userType ??
    ''
  );
}

// Translations
const translations = {
  en: {
    header: {
      title: 'Contact Adviser & Appointments',
      refresh: 'Refresh',
      loginRequired: 'Please log in to contact an adviser.'
    },
    form: {
      adviserSelect: {
        label: 'Choose an Advisor (Agents only)',
        placeholder: 'Choose an advisor…',
        option: '{name} — {state} — {gmail}'
      },
      subject: {
        label: 'Subject',
        placeholder: 'e.g., Soil test review'
      },
      appointmentStart: {
        label: 'Appointment Start (future only)'
      },
      duration: {
        label: 'Duration (minutes)'
      },
      location: {
        label: 'Location (optional)',
        placeholder: 'Farm, office, video link…'
      },
      message: {
        label: 'Message',
        placeholder: 'Share context, questions, or preparation notes…'
      },
      submit: 'Make Appointment',
      note: 'Appointments must be scheduled for future dates/times only.'
    },
    appointments: {
      title: 'Your Appointments',
      loading: 'Loading…',
      empty: 'No appointments yet.',
      cancel: 'Cancel',
      adviser: 'Adviser',
      adviser_id: 'Adviser #{id}'
    },
    messages: {
      success: 'Appointment request sent.',
      cancelSuccess: 'Appointment cancelled.',
      loginError: 'Please log in.',
      adviserError: 'Please choose an advisor.',
      dateError: 'Please select a future date & time (days ahead).',
      submitError: 'Failed to send request. Please try again.',
      cancelError: 'Unable to cancel appointment.',
      loadError: 'Failed to load adviser data.'
    }
  },
  si: {
    header: {
      title: 'උපදේශක සම්බන්ධ කරගැනීම සහ හමුවීම්',
      refresh: 'යළි පූරණය කරන්න',
      loginRequired: 'උපදේශකයෙකු සම්බන්ධ කර ගැනීමට කරුණාකර පුරනය වන්න.'
    },
    form: {
      adviserSelect: {
        label: 'උපදේශකයෙකු තෝරන්න (නියෝජිතයින් පමණි)',
        placeholder: 'උපදේශකයෙකු තෝරන්න…',
        option: '{name} — {state} — {gmail}'
      },
      subject: {
        label: 'මාතෘකාව',
        placeholder: 'උදා., පස පරීක්ෂාව සමාලෝචනය'
      },
      appointmentStart: {
        label: 'හමුවීම ආරම්භය (අනාගතය පමණි)'
      },
      duration: {
        label: 'කාල සීමාව (මිනිත්තු)'
      },
      location: {
        label: 'ස්ථානය (විකල්ප)',
        placeholder: 'ගොවිපොළ, කාර්යාලය, වීඩියෝ සබැඳිය…'
      },
      message: {
        label: 'පණිවිඩය',
        placeholder: 'සන්දර්භය, ප්‍රශ්න, හෝ සූදානම් සටහන් බෙදාගන්න…'
      },
      submit: 'හමුවීමක් ලබාගන්න',
      note: 'හමුවීම් අනාගත දින/වේලාවන් සඳහා පමණක් සැලසුම් කළ යුතුය.'
    },
    appointments: {
      title: 'ඔබගේ හමුවීම්',
      loading: 'පූරණය වෙමින්…',
      empty: 'තවම හමුවීම් නැත.',
      cancel: 'අවලංගු කරන්න',
      adviser: 'උපදේශක',
      adviser_id: 'උපදේශක #{id}'
    },
    messages: {
      success: 'හමුවීම් ඉල්ලීම යවා ඇත.',
      cancelSuccess: 'හමුවීම අවලංගු කරන ලදී.',
      loginError: 'කරුණාකර පුරනය වන්න.',
      adviserError: 'කරුණාකර උපදේශකයෙකු තෝරන්න.',
      dateError: 'කරුණාකර අනාගත දිනයක් සහ වේලාවක් තෝරන්න (දින කිහිපයක් ඉදිරියෙන්).',
      submitError: 'ඉල්ලීම යැවීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.',
      cancelError: 'හමුවීම අවලංගු කිරීමට නොහැකි විය.',
      loadError: 'උපදේශක දත්ත පූරණය කිරීමට අසමත් විය.'
    }
  },
  ta: {
    header: {
      title: 'ஆலோசகரை தொடர்புகொள்ளவும் & சந்திப்புகள்',
      refresh: 'புதுப்பிக்க',
      loginRequired: 'ஆலோசகரை தொடர்புகொள்ள தயவுசெய்து உள்நுழையவும்.'
    },
    form: {
      adviserSelect: {
        label: 'ஆலோசகரைத் தேர்ந்தெடுக்கவும் (முகவர்கள் மட்டும்)',
        placeholder: 'ஆலோசகரைத் தேர்ந்தெடுக்கவும்…',
        option: '{name} — {state} — {gmail}'
      },
      subject: {
        label: 'தலைப்பு',
        placeholder: 'எ.கா., மண் பரிசோதனை மதிப்பாய்வு'
      },
      appointmentStart: {
        label: 'சந்திப்பு தொடக்கம் (எதிர்காலம் மட்டும்)'
      },
      duration: {
        label: 'கால அளவு (நிமிடங்கள்)'
      },
      location: {
        label: 'இடம் (விருப்பத்தேர்வு)',
        placeholder: 'பண்ணை, அலுவலகம், வீடியோ இணைப்பு…'
      },
      message: {
        label: 'செய்தி',
        placeholder: 'சூழல், கேள்விகள், அல்லது தயாரிப்பு குறிப்புகளைப் பகிரவும்…'
      },
      submit: 'சந்திப்பு ஏற்படுத்த',
      note: 'சந்திப்புகள் எதிர்கால தேதிகள்/நேரங்களுக்கு மட்டுமே திட்டமிடப்பட வேண்டும்.'
    },
    appointments: {
      title: 'உங்கள் சந்திப்புகள்',
      loading: 'ஏற்றுகிறது…',
      empty: 'இதுவரை சந்திப்புகள் இல்லை.',
      cancel: 'ரத்துசெய்',
      adviser: 'ஆலோசகர்',
      adviser_id: 'ஆலோசகர் #{id}'
    },
    messages: {
      success: 'சந்திப்பு கோரிக்கை அனுப்பப்பட்டது.',
      cancelSuccess: 'சந்திப்பு ரத்து செய்யப்பட்டது.',
      loginError: 'தயவுசெய்து உள்நுழையவும்.',
      adviserError: 'தயவுசெய்து ஒரு ஆலோசகரைத் தேர்ந்தெடுக்கவும்.',
      dateError: 'தயவுசெய்து எதிர்கால தேதி & நேரத்தைத் தேர்ந்தெடுக்கவும் (நாட்கள் முன்னதாக).',
      submitError: 'கோரிக்கையை அனுப்ப முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
      cancelError: 'சந்திப்பை ரத்து செய்ய முடியவில்லை.',
      loadError: 'ஆலோசகர் தரவை ஏற்ற முடியவில்லை.'
    }
  }
};

/* ----------------------------------------------------------------------------
   Component
---------------------------------------------------------------------------- */
export default function RequestAdviser({
  apiBase = API_BASE,
  defaultDurationMin = 30,
  language // Add language prop
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme.name === 'dark';
  
  // Get language from context if available, or use prop, or default to English
  const { language: contextLanguage } = useLanguage();
  const currentLanguage = language || contextLanguage || 'en';
  
  // Get translations for the current language
  const trans = translations[currentLanguage] || translations.en;
  
  // Text styling for different languages
  const getTextStyle = (s = {}) => ({ 
    ...s, 
    lineHeight: currentLanguage === 'si' ? 1.7 : currentLanguage === 'ta' ? 1.8 : 1.5 
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  // Data
  const [advisers, setAdvisers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Form state
  const [adviserId, setAdviserId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [startsAt, setStartsAt] = useState(''); // datetime-local
  const [durationMin, setDurationMin] = useState(defaultDurationMin);
  const [location, setLocation] = useState('');

  const border = { border: `1px solid ${theme.colors.border}` };
  const muted = { color: isDark ? '#a1a1aa' : '#52525b' };

  // --- FUTURE ONLY: min selectable ts (rounded to next minute)
  const minDateInput = useMemo(() => {
    const t = new Date();
    t.setSeconds(0, 0);
    t.setMinutes(t.getMinutes() + 1); // next minute so it's strictly future
    return toLocalInputValue(t);
  }, []);

  // Require: user, adviser, and a FUTURE datetime
  const canSubmit = useMemo(() => {
    if (!user?.id || !adviserId || !startsAt) return false;
    const sel = new Date(startsAt);
    return sel.getTime() > Date.now();
  }, [user?.id, adviserId, startsAt]);

  /* ------------------------------------------------------------------------
     Load Agents (advisers)
  ------------------------------------------------------------------------ */
  const loadAdvisers = useCallback(async () => {
    const token = getToken();
    const headers = authHeader(token);

    const lists = await Promise.all([
      firstList([
        `${apiBase}/api/v1/users?userlevel=Agent`,
        `${apiBase}/api/v1/users?user_level=Agent`,
        `${apiBase}/api/v1/users?level=Agent`,
        `${apiBase}/api/v1/users?role=Agent`,
        `${apiBase}/api/users?userlevel=Agent`,
        `${apiBase}/users?userlevel=Agent`,
      ], headers),
      firstList([
        `${apiBase}/api/v1/users`,
        `${apiBase}/api/users`,
        `${apiBase}/users`,
      ], headers),
    ]);

    const combined = [...(lists[0] || []), ...(lists[1] || [])];

    // Unique by id and filter to "Agent" in any user-level field
    const dedup = new Map();
    for (const u of combined) {
      if (!u || !u.id) continue;
      if (!dedup.has(u.id)) dedup.set(u.id, u);
    }

    const filtered = Array.from(dedup.values()).filter((u) => {
      const lvl = String(pickUserLevel(u) || '').toLowerCase();
      return lvl === 'agent' || lvl.includes('agent');
    });

    const mapped = filtered.map(u => {
      const email = u.email || u.gmail || '';
      const gmail = /@gmail\.com$/i.test(email) ? email : ''; // show only gmail in label
      return {
        id: u.id,
        name: u.name || u.full_name || u.username || `#${u.id}`,
        email,
        gmail,
        state: pickState(u),
      };
    });

    setAdvisers(mapped);
  }, [apiBase]);

  /* ------------------------------------------------------------------------
     Load Appointments (aligned to backend)
     Backend fields: subject, appointment_date, duration_minutes, location,
                     message, appointment_status (+ farmer/adviser includes).
     Routes: GET /api/v1/appointments?user_id=ID OR /api/v1/appointments/user/:ID
  ------------------------------------------------------------------------ */
  const loadAppointments = useCallback(async () => {
    if (!user?.id) { setAppointments([]); return; }

    const token = getToken();
    const headers = authHeader(token);

    const list = await firstList([
      `${apiBase}/api/v1/appointments?user_id=${encodeURIComponent(user.id)}`,
      `${apiBase}/api/appointments?user_id=${encodeURIComponent(user.id)}`,
      `${apiBase}/appointments?user_id=${encodeURIComponent(user.id)}`,
      `${apiBase}/api/v1/appointments/user/${encodeURIComponent(user.id)}`, // extra fallback
      `${apiBase}/api/v1/users/${encodeURIComponent(user.id)}/appointments`,
    ], headers);

    const mapped = list.map(a => {
      const startISO = a.appointment_date ?? a.starts_at ?? null;
      const dur = Number(a.duration_minutes ?? 30);
      return {
        id: a.id,
        user_id: user.id,
        adviser_id: a.adviser_id ?? a.adviser?.id ?? a.adviserId ?? null,
        adviser_name: a.adviser?.username ?? a.adviser?.email ?? null,
        title: a.subject ?? a.title ?? 'Appointment',
        notes: a.message ?? a.notes ?? '',
        starts_at: startISO,
        ends_at: startISO ? addMinutes(startISO, dur) : null,
        location: a.location ?? '',
        status: a.appointment_status ?? a.status ?? 'pending',
      };
    });

    setAppointments(mapped);
  }, [apiBase, user?.id]);

  const loadAll = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadAdvisers(), loadAppointments()]);
    } catch (e) {
      console.error(e);
      setError(trans.messages.loadError);
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadAdvisers, loadAppointments, trans.messages.loadError]);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ------------------------------------------------------------------------
     Submit: create appointment using backend schema
     POST /api/v1/appointments
  ------------------------------------------------------------------------ */
  async function handleSubmit(e) {
    e?.preventDefault?.();
    setOk('');
    setError('');

    if (!user?.id) { setError(trans.messages.loginError); return; }
    if (!adviserId) { setError(trans.messages.adviserError); return; }
    if (!startsAt) { setError(trans.messages.dateError); return; }

    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime()) || start.getTime() <= Date.now()) {
      setError(trans.messages.dateError);
      return;
    }

    setSubmitting(true);

    try {
      const token = getToken();
      const headers = authHeader(token);

      // 1) Best-effort adviser message (optional)
      const selectedAdviser = advisers.find(a => String(a.id) === String(adviserId));
      const text = [
        subject ? `Subject: ${subject}` : '',
        `Requested time: ${start.toLocaleString()} (${durationMin} min)`,
        location ? `Location: ${location}` : '',
        selectedAdviser?.state ? `Adviser State: ${selectedAdviser.state}` : '',
        selectedAdviser?.gmail ? `Adviser Gmail: ${selectedAdviser.gmail}` : '',
        message ? `\n${message}` : '',
      ].filter(Boolean).join('\n');

      await firstPost(
        [
          `${apiBase}/api/v1/messages`,
          `${apiBase}/api/messages`,
          `${apiBase}/messages`,
        ],
        {
          sender_id: user.id,
          receiver_id: adviserId,
          text,
          category: 'appointment_request',
        },
        headers
      );

      // 2) Create appointment (MATCHES BACKEND FIELDS)
      await firstPost(
        [
          `${apiBase}/api/v1/appointments`,
          `${apiBase}/api/appointments`,
          `${apiBase}/appointments`,
        ],
        {
          farmer_id: user.id,
          adviser_id: adviserId,
          subject: subject || 'Adviser Appointment',
          appointment_date: start.toISOString(),
          duration_minutes: Number(durationMin || defaultDurationMin),
          location,
          message,
          appointment_status: 'pending',
        },
        headers
      );

      setOk(trans.messages.success);
      setSubject('');
      setMessage('');
      setStartsAt('');
      setDurationMin(defaultDurationMin);
      setLocation('');
      await loadAppointments();
    } catch (e) {
      console.error(e);
      setError(trans.messages.submitError);
    } finally {
      setSubmitting(false);
    }
  }

  /* ------------------------------------------------------------------------
     Cancel: DELETE /api/v1/appointments/:id
  ------------------------------------------------------------------------ */
  async function cancelAppointment(apptId) {
    setError('');
    setOk('');
    const token = getToken();
    const headers = authHeader(token);
    const ok = await firstDelete([
      `${apiBase}/api/v1/appointments/${apptId}`,
      `${apiBase}/api/appointments/${apptId}`,
      `${apiBase}/appointments/${apptId}`,
    ], headers);
    if (ok) {
      setOk(trans.messages.cancelSuccess);
      setAppointments(prev => prev.filter(a => a.id !== apptId));
    } else {
      setError(trans.messages.cancelError);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }

  if (!user?.id) {
    return (
      <div className="p-6 text-sm rounded-md" style={{...border, ...getTextStyle()}}>
        {trans.header.loginRequired}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" style={{ color: theme.colors.primary }} />
          <h2 className="text-lg font-semibold" style={{ ...getTextStyle(), color: theme.colors.text }}>
            {trans.header.title}
          </h2>
          {loading && <Loader2 className="h-4 w-4 animate-spin" style={{ color: theme.colors.primary }} />}
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded"
          style={{ background: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span style={getTextStyle()}>{trans.header.refresh}</span>
        </button>
      </div>

      {/* Alerts */}
      {(ok || error) && (
        <div
          className="rounded-md px-4 py-3 text-sm flex items-start gap-2"
          style={{
            border: `1px solid ${error ? '#ef4444' : '#22c55e'}`,
            background: isDark ? (error ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)') : (error ? '#fee2e2' : '#dcfce7'),
            color: isDark ? (error ? '#fca5a5' : '#86efac') : (error ? '#991b1b' : '#166534'),
          }}
        >
          {error ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          <span style={getTextStyle()}>{error || ok}</span>
        </div>
      )}

      {/* Request form */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg p-4" style={border}>
        {/* Adviser select */}
        <label className="block text-sm font-medium" style={{ ...getTextStyle(), color: theme.colors.text }}>
          {trans.form.adviserSelect.label}
        </label>
        <select
          value={adviserId}
          onChange={(e) => setAdviserId(e.target.value)}
          required
          className="w-full px-3 py-2 rounded"
          style={{ background: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
        >
          <option value="" disabled>{trans.form.adviserSelect.placeholder}</option>
          {advisers.map(a => (
            <option key={a.id} value={a.id} style={{ color: 'initial' }}>
              {trans.form.adviserSelect.option
                .replace('{name}', a.name)
                .replace('{state}', a.state || 'N/A')
                .replace('{gmail}', a.gmail || 'no Gmail')}
            </option>
          ))}
        </select>

        {/* Subject + date/time (future only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: theme.colors.text }}>
              {trans.form.subject.label}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={trans.form.subject.placeholder}
              className="w-full px-3 py-2 rounded"
              style={{ background: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: theme.colors.text }}>
              {trans.form.appointmentStart.label}
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              min={minDateInput}
              required
              className="w-full px-3 py-2 rounded"
              style={{ background: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: theme.colors.text }}>
              {trans.form.duration.label}
            </label>
            <input
              type="number"
              min={5}
              step={5}
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className="w-full px-3 py-2 rounded"
              style={{ background: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: theme.colors.text }}>
              {trans.form.location.label}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={trans.form.location.placeholder}
              className="w-full px-3 py-2 rounded"
              style={{ background: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: theme.colors.text }}>
            {trans.form.message.label}
          </label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={trans.form.message.placeholder}
            className="w-full px-3 py-2 rounded resize-y"
            style={{ background: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-white disabled:opacity-60"
            style={{ background: theme.colors.primary }}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span style={getTextStyle()}>{trans.form.submit}</span>
          </button>
          <span className="text-xs" style={{...muted, ...getTextStyle()}}>
            {trans.form.note}
          </span>
        </div>
      </form>

      {/* Upcoming appointments */}
      <div className="rounded-lg overflow-hidden" style={border}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
          <CalendarClock className="h-5 w-5" style={{ color: theme.colors.primary }} />
          <h3 className="font-medium" style={{ ...getTextStyle(), color: theme.colors.text }}>
            {trans.appointments.title}
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-sm flex items-center gap-2" style={{...muted, ...getTextStyle()}}>
            <Loader2 className="h-4 w-4 animate-spin" /> {trans.appointments.loading}
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-6 text-sm" style={{...muted, ...getTextStyle()}}>{trans.appointments.empty}</div>
        ) : (
          <ul className="divide-y" style={{ borderColor: theme.colors.border }}>
            {appointments
              .sort((a,b) => new Date(a.starts_at || 0) - new Date(b.starts_at || 0))
              .map(a => (
                <li key={a.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium" style={{ ...getTextStyle(), color: theme.colors.text }}>
                        {a.title}
                      </div>
                      <div className="text-xs flex items-center gap-4" style={{...muted, ...getTextStyle()}}>
                        <span className="inline-flex items-center gap-1">
                          <CalendarPlus className="h-3.5 w-3.5" /> {formatDT(a.starts_at)}{a.ends_at ? ` – ${formatDT(a.ends_at)}` : ''}
                        </span>
                        {a.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {a.location}
                          </span>
                        )}
                        {(a.adviser_name || a.adviser_id) && (
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3.5 w-3.5" /> {a.adviser_name ? 
                              `${trans.appointments.adviser} ${a.adviser_name}` : 
                              trans.appointments.adviser_id.replace('{id}', a.adviser_id)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" /> {a.status || 'scheduled'}
                        </span>
                      </div>
                      {a.notes && (
                        <div className="text-xs" style={{ ...getTextStyle(), color: theme.colors.text }}>
                          {a.notes}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => cancelAppointment(a.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm hover:opacity-80"
                        style={{ border: `1px solid ${theme.colors.border}`, color: isDark ? '#f87171' : '#b91c1c' }}
                        title={trans.appointments.cancel}
                      >
                        <Trash2 className="h-4 w-4" /> 
                        <span style={getTextStyle()}>{trans.appointments.cancel}</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}