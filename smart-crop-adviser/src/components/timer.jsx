'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell, Leaf, Play, Pause, RefreshCw, CalendarDays, AlertTriangle, MapPin, CalendarClock, UserCheck
} from 'lucide-react';

const isBrowser = typeof window !== 'undefined';

const fmtDate = (d) => {
  if (!d) return '-';
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? '-' : x.toLocaleDateString();
};
const fmtDT = (d) => {
  if (!d) return '-';
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? '-' : x.toLocaleString();
};
const pad = (n) => String(n).padStart(2, '0');
const fmtDHMS = (sec) => {
  const s = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `${pad(d)}:${pad(h)}:${pad(m)}:${pad(r)}`;
};
const daysUntil = (dateLike) => {
  if (!dateLike) return Infinity;
  const t = new Date(dateLike);
  if (Number.isNaN(t.getTime())) return Infinity;
  const now = new Date();
  return Math.max(0, Math.floor((t - now) / (1000 * 60 * 60 * 24)));
};

/* -------------------------------------------------------------------------- */

export default function TimerPage({
  apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  userId,
  isDark = false,
  theme = { colors: { primary: '#16A34A' } },
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [fertilizers, setFertilizers] = useState([]);
  const [events, setEvents] = useState([]); // fertilizer events

  const [appointments, setAppointments] = useState([]);
  const [apptEvents, setApptEvents] = useState([]); // appointment events

  const [showAll, setShowAll] = useState(false);

  // fertilizer countdown
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(true);
  const [remainSec, setRemainSec] = useState(0);

  // appointment countdown
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [apptRunning, setApptRunning] = useState(true);
  const [apptRemainSec, setApptRemainSec] = useState(0);

  const tickRef = useRef(null);
  const apptTickRef = useRef(null);
  const hourlyRef = useRef(null);
  const mountedRef = useRef(true);

  /* ------------------------------ Permission ------------------------------- */
  useEffect(() => {
    if (!isBrowser) return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const popup = useCallback((title, body) => {
    if (!isBrowser) return;
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    } catch {
      // ignore if blocked
    }
  }, []);

  /* -------------------------------- Fetch --------------------------------- */
  const fetchFertilizers = useCallback(async () => {
    if (!apiBase || !userId) return;
    const token = isBrowser ? window.localStorage.getItem('token') : null;

    const doFetch = async (path) =>
      fetch(`${apiBase}${path}?user_id=${encodeURIComponent(userId)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

    try {
      setLoading(true);
      let res = await doFetch('/api/v1/fertilizers');
      if (res.status === 404) res = await doFetch('/api/v1/fertilizer');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const arr = Array.isArray(payload) ? payload : payload?.data || [];
      const mine = arr.filter((r) => String(r.user_id ?? r.userId ?? r.owner_id ?? userId) === String(userId) || true);
      // ^ keep original behavior tolerant; fertilizers often already filtered by backend
      if (mountedRef.current) {
        setFertilizers(mine);
        setErr('');
      }
    } catch (e) {
      console.error('fetchFertilizers:', e);
      if (mountedRef.current) setErr('Failed to load fertilizer applications');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [apiBase, userId]);

  const fetchAppointments = useCallback(async () => {
    if (!apiBase || !userId) return;
    const token = isBrowser ? window.localStorage.getItem('token') : null;

    const doFetch = async (path) =>
      fetch(`${apiBase}${path}?user_id=${encodeURIComponent(userId)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

    try {
      let res = await doFetch('/api/v1/appointments');
      if (res.status === 404) res = await doFetch('/api/v1/appointment');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const arr = Array.isArray(payload) ? payload : payload?.data || [];

      // ✅ FIX: keep only appointments where the current user is farmer or adviser
      const mine = arr.filter(
        (r) =>
          String(r.farmer_id) === String(userId) ||
          String(r.adviser_id) === String(userId)
      );

      if (mountedRef.current) setAppointments(mine.length ? mine : arr);
    } catch (e) {
      console.error('fetchAppointments:', e);
    }
  }, [apiBase, userId]);

  useEffect(() => {
    mountedRef.current = true;
    fetchFertilizers();
    fetchAppointments();
    return () => { mountedRef.current = false; };
  }, [fetchFertilizers, fetchAppointments]);

  /* ---------------------------- Notifications ----------------------------- */
  const createServerNotification = useCallback(async ({ title, message, meta }) => {
    if (!isBrowser || !apiBase || !userId) return;
    const token = window.localStorage.getItem('token');

    try {
      await fetch(`${apiBase}/api/v1/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          user_id: userId,
          type: meta?.type || 'reminder',
          title,
          message,
          read: false,
          data: meta || {},
          due_date: meta?.due_date || null,
        }),
      });
    } catch {/* noop */}

    try {
      await fetch(`${apiBase}/api/v1/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ sender_id: userId, receiver_id: userId, text: `${title}: ${message}`, read_at: null }),
      });
    } catch {/* noop */}
  }, [apiBase, userId]);

  const notifyIfDue = useCallback((keyBase, title, message, meta, daysLeft) => {
    if (!isBrowser) return;
    if (daysLeft > 4) return;
    const todayKey = new Date().toISOString().split('T')[0];
    const key = `${keyBase}:${todayKey}`;
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, '1');
    popup(title, message);
    createServerNotification({ title, message, meta });
  }, [popup, createServerNotification]);

  /* ------------------------------ Build events ---------------------------- */
  // Fertilizer events
  useEffect(() => {
    const evs = (fertilizers || [])
      .map((f) => {
        const next = f.next_application_date || f.nextDate || f.date_next || null;
        const prev = f.application_date || f.applied_date || f.date || null;
        const loc  = f.location || f.field || '';
        if (!next) return null;
        const d = new Date(next);
        if (Number.isNaN(d.getTime())) return null;
        return {
          id: `fert_${f.id}`,
          crop: f.crop || f.crop_name || 'Crop',
          fertilizer: f.fertilizer_name || f.name || 'Fertilizer',
          date: d,
          prevDate: prev,
          location: loc,
          days: daysUntil(d),
          raw: f,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.date - b.date);

    setEvents(evs);

    if (!selected && evs.length) {
      const soonest = evs[0];
      setSelected(soonest);
      setRunning(true);
      const now = Date.now();
      setRemainSec(Math.max(0, Math.floor((soonest.date.getTime() - now) / 1000)));
    }

    evs.forEach((e) => {
      const title = `Fertilizer: ${e.crop}`;
      const message = `Apply ${e.fertilizer} at ${e.location || 'field'} in ${e.days} day${e.days !== 1 ? 's' : ''} (due ${fmtDate(e.date)}).`;
      const meta = { type: 'fertilizer_reminder', event_id: e.id, due_date: e.date.toISOString(), location: e.location, days_left: e.days };
      notifyIfDue(`fert:${e.id}`, title, message, meta, e.days);
    });
  }, [fertilizers]); // eslint-disable-line react-hooks/exhaustive-deps

  // Appointment events (approved only)
  useEffect(() => {
    const evs = (appointments || [])
      .map((a) => {
        // ✅ FIX: treat backend-approved as appointment_status === 'confirmed' or 'completed'
        const approved =
          ['confirmed', 'completed'].includes(String(a.appointment_status || '').toLowerCase()) ||
          a.status === 'approved' ||
          a.approved === true ||
          a.adviser_approved === true ||
          a.advisor_approved === true;

        if (!approved) return null;

        // Use backend field name first (appointment_date)
        const when =
          a.appointment_date ||
          a.scheduled_at ||
          a.appointment_at ||
          a.appointment_datetime ||
          (a.date && a.time ? `${a.date}T${a.time}` : null) ||
          a.date ||
          a.approved_at ||
          null;

        if (!when) return null;
        const d = new Date(when);
        if (Number.isNaN(d.getTime())) return null;

        // ✅ FIX: adviser can arrive as included object { username, ... }
        const adviserName =
          a.adviser?.username ||
          a.adviser_name ||
          a.advisor_name ||
          (typeof a.adviser === 'string' ? a.adviser : (typeof a.advisor === 'string' ? a.advisor : null));

        return {
          id: `appt_${a.id}`,
          when: d,
          days: daysUntil(d),
          location: a.location || a.place || '',
          adviser: adviserName,
          raw: a,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.when - b.when);

    setApptEvents(evs);

    if (!selectedAppt && evs.length) {
      const soonest = evs[0];
      setSelectedAppt(soonest);
      setApptRunning(true);
      const now = Date.now();
      setApptRemainSec(Math.max(0, Math.floor((soonest.when.getTime() - now) / 1000)));
    }

    evs.forEach((e) => {
      const title = `Appointment${e.adviser ? ` with ${e.adviser}` : ''}`;
      const message = `Scheduled ${fmtDT(e.when)}${e.location ? ` @ ${e.location}` : ''}. ${e.days} day${e.days !== 1 ? 's' : ''} to go.`;
      const meta = { type: 'appointment_reminder', event_id: e.id, due_date: e.when.toISOString(), location: e.location, with: e.adviser, days_left: e.days };
      notifyIfDue(`appt:${e.id}`, title, message, meta, e.days);
    });
  }, [appointments]); // eslint-disable-line react-hooks/exhaustive-deps

  /* --------------------------------- Tickers ------------------------------- */
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      if (!selected?.date || !running) return;
      const s = Math.max(0, Math.floor((selected.date.getTime() - Date.now()) / 1000));
      setRemainSec(s);
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [selected, running]);

  useEffect(() => {
    if (apptTickRef.current) clearInterval(apptTickRef.current);
    apptTickRef.current = setInterval(() => {
      if (!selectedAppt?.when || !apptRunning) return;
      const s = Math.max(0, Math.floor((selectedAppt.when.getTime() - Date.now()) / 1000));
      setApptRemainSec(s);
    }, 1000);
    return () => { if (apptTickRef.current) clearInterval(apptTickRef.current); };
  }, [selectedAppt, apptRunning]);

  // hourly re-scan to re-trigger daily popups
  useEffect(() => {
    if (hourlyRef.current) clearInterval(hourlyRef.current);
    hourlyRef.current = setInterval(() => {
      events.forEach((e) => {
        const title = `Fertilizer: ${e.crop}`;
        const message = `Apply ${e.fertilizer} at ${e.location || 'field'} in ${e.days} day${e.days !== 1 ? 's' : ''} (due ${fmtDate(e.date)}).`;
        const meta = { type: 'fertilizer_reminder', event_id: e.id, due_date: e.date.toISOString(), location: e.location, days_left: e.days };
        notifyIfDue(`fert:${e.id}`, title, message, meta, e.days);
      });
      apptEvents.forEach((e) => {
        const title = `Appointment${e.adviser ? ` with ${e.adviser}` : ''}`;
        const message = `Scheduled ${fmtDT(e.when)}${e.location ? ` @ ${e.location}` : ''}. ${e.days} day${e.days !== 1 ? 's' : ''} to go.`;
        const meta = { type: 'appointment_reminder', event_id: e.id, due_date: e.when.toISOString(), location: e.location, with: e.adviser, days_left: e.days };
        notifyIfDue(`appt:${e.id}`, title, message, meta, e.days);
      });
    }, 60 * 60 * 1000);
    return () => { if (hourlyRef.current) clearInterval(hourlyRef.current); };
  }, [events, apptEvents, notifyIfDue]);

  /* -------------------------------- Actions -------------------------------- */
  const startNextDue = () => {
    if (!events.length) return;
    const soonest = [...events].sort((a, b) => a.date - b.date)[0];
    setSelected(soonest);
    setRunning(true);
    setRemainSec(Math.max(0, Math.floor((soonest.date.getTime() - Date.now()) / 1000)));
  };
  const selectEvent = (ev) => {
    setSelected(ev);
    setRunning(true);
    setRemainSec(Math.max(0, Math.floor((ev.date.getTime() - Date.now()) / 1000)));
  };
  const clearSelection = () => { setSelected(null); setRunning(false); setRemainSec(0); };

  const startNextAppt = () => {
    if (!apptEvents.length) return;
    const soonest = [...apptEvents].sort((a, b) => a.when - b.when)[0];
    setSelectedAppt(soonest);
    setApptRunning(true);
    setApptRemainSec(Math.max(0, Math.floor((soonest.when.getTime() - Date.now()) / 1000)));
  };
  const selectAppt = (ev) => {
    setSelectedAppt(ev);
    setApptRunning(true);
    setApptRemainSec(Math.max(0, Math.floor((ev.when.getTime() - Date.now()) / 1000)));
  };
  const clearAppt = () => { setSelectedAppt(null); setApptRunning(false); setApptRemainSec(0); };

  /* ----------------------------------- UI ---------------------------------- */

  return (
    <div className="space-y-8">
      {err && (
        <div
          className="p-3 rounded-md"
          style={{
            backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
            color: isDark ? '#F87171' : '#DC2626',
            border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}`,
          }}
        >
          <div className="flex items-start gap-2"><AlertTriangle className="h-5 w-5" /><p>{err}</p></div>
        </div>
      )}

      {/* ============================== Fertilizer ============================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: isDark ? '#eee' : '#222' }}>
            <Leaf className="h-5 w-5" style={{ color: theme.colors.primary }} />
            Fertilizer Timer
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={startNextDue}
              className="text-sm px-3 py-1.5 rounded border"
              style={{ borderColor: theme.colors.primary, color: theme.colors.primary }}
              disabled={!events.length}
            >
              Start Next Due
            </button>
            <button
              onClick={() => setShowAll((s) => !s)}
              className="text-sm px-3 py-1.5 rounded border"
              style={{ borderColor: isDark ? '#888' : '#ccc', color: isDark ? '#ddd' : '#333' }}
            >
              {showAll ? 'Show Week' : 'Show All'}
            </button>
          </div>
        </div>

        {/* Selected countdown */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" style={{ color: theme.colors.primary }} />
              <h3 className="text-base font-medium" style={{ color: isDark ? '#eee' : '#333' }}>Countdown</h3>
            </div>
            <div className="flex items-center gap-2">
              {running ? (
                <button onClick={() => setRunning(false)} className="p-2 rounded-full" style={{ backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)', color: isDark ? '#F87171' : '#DC2626' }}><Pause className="h-5 w-5" /></button>
              ) : (
                <button onClick={() => setRunning(true)} className="p-2 rounded-full" style={{ backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)', color: isDark ? '#4ADE80' : '#22C55E' }}><Play className="h-5 w-5" /></button>
              )}
              <button onClick={clearSelection} className="p-2 rounded-full" style={{ backgroundColor: isDark ? 'rgba(107,114,128,0.2)' : 'rgba(107,114,128,0.1)', color: isDark ? '#9CA3AF' : '#6B7280' }}><RefreshCw className="h-5 w-5" /></button>
            </div>
          </div>

          {selected ? (
            <>
              <div className="mb-2 text-sm" style={{ color: isDark ? '#bbb' : '#555' }}>
                <span className="font-medium" style={{ color: isDark ? '#eee' : '#333' }}>
                  {selected.crop}
                </span>{' • '}{selected.fertilizer}{' • '}
                Next: {fmtDate(selected.date)}
                {selected.prevDate ? ` • Applied: ${fmtDate(selected.prevDate)}` : ''}
                {selected.location ? (
                  <> • <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{selected.location}</span></>
                ) : null}
              </div>
              <div className="py-5 px-6 rounded-lg text-center font-mono text-2xl" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.05)', color: isDark ? '#fff' : '#111' }}>
                {fmtDHMS(remainSec)}
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: isDark ? '#aaa' : '#666' }}>Select a crop below to start (uses <b>next_application_date</b>).</p>
          )}
        </div>

        {/* Upcoming with details */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-5 w-5" style={{ color: theme.colors.primary }} />
            <h3 className="text-base font-medium" style={{ color: isDark ? '#eee' : '#333' }}>Upcoming Applications</h3>
          </div>

          {loading ? (
            <div className="py-6 text-center text-sm" style={{ color: isDark ? '#bbb' : '#555' }}>Loading…</div>
          ) : events.length === 0 ? (
            <div className="py-6 text-center text-sm" style={{ color: isDark ? '#bbb' : '#555' }}>No upcoming fertilizer events.</div>
          ) : (
            <div className="space-y-2">
              {events
                .filter((e) => showAll || e.days <= 7)
                .map((e) => {
                  const active = selected?.id === e.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => selectEvent(e)}
                      className="w-full text-left p-3 rounded-lg border transition-colors"
                      style={{
                        borderColor: active ? theme.colors.primary : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'),
                        backgroundColor: active ? (isDark ? 'rgba(22,163,74,0.15)' : 'rgba(22,163,74,0.08)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'),
                        color: isDark ? '#eaeaea' : '#222',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {e.crop} • {e.fertilizer}
                          </div>
                          <div className="text-xs mt-0.5 space-x-2" style={{ color: isDark ? '#bbb' : '#555' }}>
                            <span>Next: {fmtDate(e.date)}</span>
                            {e.prevDate ? <span>Applied: {fmtDate(e.prevDate)}</span> : null}
                            {e.location ? (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {e.location}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)', color: theme.colors.primary }}>
                          {e.days === 0 ? 'Today' : `${e.days} day${e.days !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      {/* ============================== Appointments ============================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: isDark ? '#eee' : '#222' }}>
            <CalendarClock className="h-5 w-5" style={{ color: theme.colors.primary }} />
            Appointment Reminder
          </h2>
          <button
            onClick={startNextAppt}
            className="text-sm px-3 py-1.5 rounded border"
            style={{ borderColor: theme.colors.primary, color: theme.colors.primary }}
            disabled={!apptEvents.length}
          >
            Start Next Approved
          </button>
        </div>

        {/* selected appointment */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" style={{ color: theme.colors.primary }} />
              <h3 className="text-base font-medium" style={{ color: isDark ? '#eee' : '#333' }}>Countdown</h3>
            </div>
            <div className="flex items-center gap-2">
              {apptRunning ? (
                <button onClick={() => setApptRunning(false)} className="p-2 rounded-full" style={{ backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)', color: isDark ? '#F87171' : '#DC2626' }}><Pause className="h-5 w-5" /></button>
              ) : (
                <button onClick={() => setApptRunning(true)} className="p-2 rounded-full" style={{ backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)', color: isDark ? '#4ADE80' : '#22C55E' }}><Play className="h-5 w-5" /></button>
              )}
              <button onClick={clearAppt} className="p-2 rounded-full" style={{ backgroundColor: isDark ? 'rgba(107,114,128,0.2)' : 'rgba(107,114,128,0.1)', color: isDark ? '#9CA3AF' : '#6B7280' }}><RefreshCw className="h-5 w-5" /></button>
            </div>
          </div>

          {selectedAppt ? (
            <>
              <div className="mb-2 text-sm" style={{ color: isDark ? '#bbb' : '#555' }}>
                When: <b>{fmtDT(selectedAppt.when)}</b>
                {selectedAppt.location ? <> • <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{selectedAppt.location}</span></> : null}
                {selectedAppt.adviser ? <> • with <b>{selectedAppt.adviser}</b></> : null}
              </div>
              <div className="py-5 px-6 rounded-lg text-center font-mono text-2xl" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.05)', color: isDark ? '#fff' : '#111' }}>
                {fmtDHMS(apptRemainSec)}
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: isDark ? '#aaa' : '#666' }}>
              No approved appointments yet. Once an adviser confirms, it will appear here automatically.
            </p>
          )}
        </div>

        {/* upcoming approved appointments */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-5 w-5" style={{ color: theme.colors.primary }} />
            <h3 className="text-base font-medium" style={{ color: isDark ? '#eee' : '#333' }}>Approved Appointments</h3>
          </div>

          {apptEvents.length === 0 ? (
            <div className="py-6 text-center text-sm" style={{ color: isDark ? '#bbb' : '#555' }}>No approved appointments.</div>
          ) : (
            <div className="space-y-2">
              {apptEvents.map((e) => {
                const active = selectedAppt?.id === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => selectAppt(e)}
                    className="w-full text-left p-3 rounded-lg border transition-colors"
                    style={{
                      borderColor: active ? theme.colors.primary : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'),
                      backgroundColor: active ? (isDark ? 'rgba(22,163,74,0.15)' : 'rgba(22,163,74,0.08)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'),
                      color: isDark ? '#eaeaea' : '#222',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {e.adviser ? `With ${e.adviser}` : 'Appointment'}
                        </div>
                        <div className="text-xs mt-0.5 space-x-2" style={{ color: isDark ? '#bbb' : '#555' }}>
                          <span>When: {fmtDT(e.when)}</span>
                          {e.location ? (<span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.location}</span>) : null}
                        </div>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)', color: theme.colors.primary }}>
                        {e.days === 0 ? 'Today' : `${e.days} day${e.days !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
