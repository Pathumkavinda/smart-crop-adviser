'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
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

/* ----------------------------------------------------------------------------
   Component
---------------------------------------------------------------------------- */
export default function RequestAdviser({
  apiBase = API_BASE,
  defaultDurationMin = 30,
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme.name === 'dark';

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
      setError('Failed to load adviser data.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadAdvisers, loadAppointments]);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ------------------------------------------------------------------------
     Submit: create appointment using backend schema
     POST /api/v1/appointments
  ------------------------------------------------------------------------ */
  async function handleSubmit(e) {
    e?.preventDefault?.();
    setOk('');
    setError('');

    if (!user?.id) { setError('Please log in.'); return; }
    if (!adviserId) { setError('Please choose an advisor.'); return; }
    if (!startsAt) { setError('Please pick a date & time.'); return; }

    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime()) || start.getTime() <= Date.now()) {
      setError('Please select a future date & time (days ahead).');
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

      setOk('Appointment request sent.');
      setSubject('');
      setMessage('');
      setStartsAt('');
      setDurationMin(defaultDurationMin);
      setLocation('');
      await loadAppointments();
    } catch (e) {
      console.error(e);
      setError('Failed to send request. Please try again.');
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
      setOk('Appointment cancelled.');
      setAppointments(prev => prev.filter(a => a.id !== apptId));
    } else {
      setError('Unable to cancel appointment.');
    }
  }

  async function refresh() {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }

  if (!user?.id) {
    return (
      <div className="p-6 text-sm rounded-md" style={border}>
        Please log in to contact an adviser.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" style={{ color: theme.colors.primary }} />
          <h2 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
            Contact Adviser & Appointments
          </h2>
          {loading && <Loader2 className="h-4 w-4 animate-spin" style={{ color: theme.colors.primary }} />}
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded"
          style={{ background: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
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
          <span>{error || ok}</span>
        </div>
      )}

      {/* Request form */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg p-4" style={border}>
        {/* Adviser select */}
        <label className="block text-sm font-medium" style={{ color: theme.colors.text }}>
          Choose an Advisor (Agents only)
        </label>
        <select
          value={adviserId}
          onChange={(e) => setAdviserId(e.target.value)}
          required
          className="w-full px-3 py-2 rounded"
          style={{ background: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
        >
          <option value="" disabled>Choose an advisor…</option>
          {advisers.map(a => (
            <option key={a.id} value={a.id} style={{ color: 'initial' }}>
              {a.name} — {a.state || 'N/A'} — {a.gmail || 'no Gmail'}
            </option>
          ))}
        </select>

        {/* Subject + date/time (future only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Soil test review"
              className="w-full px-3 py-2 rounded"
              style={{ background: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
              Appointment Start (future only)
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
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>Duration (minutes)</label>
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
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>Location (optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Farm, office, video link…"
              className="w-full px-3 py-2 rounded"
              style={{ background: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>Message</label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share context, questions, or preparation notes…"
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
            Make Appointment
          </button>
          <span className="text-xs" style={muted}>
            Appointments must be scheduled for future dates/times only.
          </span>
        </div>
      </form>

      {/* Upcoming appointments */}
      <div className="rounded-lg overflow-hidden" style={border}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
          <CalendarClock className="h-5 w-5" style={{ color: theme.colors.primary }} />
          <h3 className="font-medium" style={{ color: theme.colors.text }}>Your Appointments</h3>
        </div>

        {loading ? (
          <div className="p-6 text-sm flex items-center gap-2" style={muted}>
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-6 text-sm" style={muted}>No appointments yet.</div>
        ) : (
          <ul className="divide-y" style={{ borderColor: theme.colors.border }}>
            {appointments
              .sort((a,b) => new Date(a.starts_at || 0) - new Date(b.starts_at || 0))
              .map(a => (
                <li key={a.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium" style={{ color: theme.colors.text }}>
                        {a.title}
                      </div>
                      <div className="text-xs flex items-center gap-4" style={muted}>
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
                            <User className="h-3.5 w-3.5" /> {a.adviser_name ? `Adviser ${a.adviser_name}` : `Adviser #${a.adviser_id}`}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" /> {a.status || 'scheduled'}
                        </span>
                      </div>
                      {a.notes && <div className="text-xs" style={{ color: theme.colors.text }}>{a.notes}</div>}
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => cancelAppointment(a.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm hover:opacity-80"
                        style={{ border: `1px solid ${theme.colors.border}`, color: isDark ? '#f87171' : '#b91c1c' }}
                        title="Cancel appointment"
                      >
                        <Trash2 className="h-4 w-4" /> Cancel
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
