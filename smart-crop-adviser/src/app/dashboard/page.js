'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  Leaf, BarChart, Calendar, CloudRain, ArrowRight, Users as UsersIcon,
  Map as MapIcon, AlertTriangle, User, Shield, Bell, Inbox, Plus, Edit2, X
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import MessagesPanel from '@/components/MessagesPanel';
import Request from '@/components/Request';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------
const RAW_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = RAW_API.replace(/\/+$/, ''); // strip trailing slash

// Target page for Documents-for-Advisors (adjust if your route is different)
const DOCS_PATH = '/adviser/documents';

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------
const getActiveSeason = (d = new Date()) => {
  const m = d.getMonth() + 1; // 1..12
  if (m >= 5 && m <= 9) return 'Yala';
  if (m === 12 || m === 1 || m === 2) return 'Maha';
  if (m === 3 || m === 4) return 'First Inter-monsoon';
  return 'Second Inter-monsoon';
};

// Notification persistence helpers
const getViewedNotifications = () => {
  try {
    const viewed = localStorage.getItem('viewedNotifications');
    return viewed ? JSON.parse(viewed) : [];
  } catch {
    return [];
  }
};

const setViewedNotifications = (notificationIds) => {
  try {
    localStorage.setItem('viewedNotifications', JSON.stringify(notificationIds));
  } catch {
    // Ignore localStorage errors
  }
};

const markNotificationsAsViewed = (notifications) => {
  const currentViewed = getViewedNotifications();
  const newViewed = [...new Set([...currentViewed, ...notifications.map(n => n.id)])];
  setViewedNotifications(newViewed);
};

const filterUnviewedNotifications = (notifications) => {
  const viewedIds = getViewedNotifications();
  return notifications.filter(n => !viewedIds.includes(n.id));
};

const safeJSON = async (res) => { try { return await res.json(); } catch { return null; } };
const authHeader = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

const getUserId = (authUser) => {
  if (authUser?.id) return Number(authUser.id);
  if (typeof window !== 'undefined') {
    const local = Number(localStorage.getItem('userId'));
    if (Number.isFinite(local) && local > 0) return local;
  }
  return null;
};

const hasAgentAccess = (user) => {
  if (!user) return false;
  const role = (user.userlevel || user.role || '').toString().toLowerCase();
  return role === 'agent' || role === 'admin' || role === 'adviser';
};

const pickAgentIdFromRow = (row) => {
  const keys = ['agent_id', 'adviser_id', 'advisor_id', 'created_by', 'createdBy', 'made_by', 'madeBy'];
  for (const k of keys) if (row?.[k] != null) return Number(row[k]);
  return null;
};

const shapeFarmer = (u) => ({
  id: u.id ?? u.user_id ?? u._id,
  name: u.name ?? u.fullname ?? u.username ?? u.email ?? `User ${u.id ?? ''}`,
  email: u.email ?? '',
  userlevel: (u.userlevel ?? u.role ?? '').toString().toLowerCase(),
  district: u.district ?? u.address ?? '—',
  avatar: u.avatar ?? u.photo_url ?? null,
});

// Normalize a PredictionHistory row for soil table
const shapeSoilRow = (r) => ({
  id: r.id ?? r._id ?? r.record_id ?? Math.random(),
  district: r.district ?? '—',
  created_at: r.created_at ?? r.updated_at ?? r.date ?? new Date().toISOString(),
  ph: Number(r.soil_ph_level ?? r.ph ?? 0),
  nitrogen: Number(r.nitrogen ?? 0),
  phosphorus: Number(r.phosphate ?? r.phosphorus ?? 0),
  potassium: Number(r.potassium ?? 0),
  user_id: r.user_id ?? null,
  agentId: pickAgentIdFromRow(r),
});

// Normalize for recommendation history card
const shapeRecoRow = (r) => ({
  id: r.id ?? r._id ?? r.prediction_id ?? Math.random(),
  cropName: r.crop_name ?? r.recommended_crop ?? 'Unknown crop',
  score: Number(r.score ?? 0),
  district: r.district ?? '—',
  created_at: r.created_at ?? r.updated_at ?? new Date().toISOString(),
  agentId: pickAgentIdFromRow(r),
});

// ---------------------------------------------------------
// Add / Edit Modal (Prediction History)
// ---------------------------------------------------------
function EditRecordModal({ open, onClose, onSave, initial, theme, farmers }) {
  const [form, setForm] = useState(() => ({
    id: initial?.id ?? null,
    user_id: initial?.user_id ?? '',
    district: initial?.district ?? '',
    soil_ph_level: initial?.ph ?? '',
    nitrogen: initial?.nitrogen ?? '',
    phosphate: initial?.phosphorus ?? '',
    potassium: initial?.potassium ?? '',
  }));

  useEffect(() => {
    if (open) {
      setForm({
        id: initial?.id ?? null,
        user_id: initial?.user_id ?? '',
        district: initial?.district ?? '',
        soil_ph_level: initial?.ph ?? '',
        nitrogen: initial?.nitrogen ?? '',
        phosphate: initial?.phosphorus ?? '',
        potassium: initial?.potassium ?? '',
      });
    }
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-lg shadow-lg p-6"
           style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {form.id ? 'Update Record' : 'Add Record'}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:opacity-80">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm opacity-70">Farmer</label>
            <select
              value={form.user_id}
              onChange={(e) => setForm((s) => ({ ...s, user_id: e.target.value }))}
              className="mt-1 w-full border rounded px-3 py-2 bg-transparent"
              style={{ borderColor: theme.colors.border }}>
              <option value="">— Select —</option>
              {farmers.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} {f.district ? `(${f.district})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm opacity-70">District</label>
            <input
              value={form.district}
              onChange={(e) => setForm((s) => ({ ...s, district: e.target.value }))}
              className="mt-1 w-full border rounded px-3 py-2 bg-transparent"
              style={{ borderColor: theme.colors.border }}
              placeholder="e.g., Kandy"
            />
          </div>

          <div>
            <label className="text-sm opacity-70">pH</label>
            <input
              type="number" step="0.01"
              value={form.soil_ph_level}
              onChange={(e) => setForm((s) => ({ ...s, soil_ph_level: e.target.value }))}
              className="mt-1 w-full border rounded px-3 py-2 bg-transparent"
              style={{ borderColor: theme.colors.border }}
              placeholder="e.g., 6.5"
            />
          </div>
          <div>
            <label className="text-sm opacity-70">Nitrogen (ppm)</label>
            <input
              type="number"
              value={form.nitrogen}
              onChange={(e) => setForm((s) => ({ ...s, nitrogen: e.target.value }))}
              className="mt-1 w-full border rounded px-3 py-2 bg-transparent"
              style={{ borderColor: theme.colors.border }}
              placeholder="e.g., 20"
            />
          </div>
          <div>
            <label className="text-sm opacity-70">Phosphorus (ppm)</label>
            <input
              type="number"
              value={form.phosphate}
              onChange={(e) => setForm((s) => ({ ...s, phosphate: e.target.value }))}
              className="mt-1 w-full border rounded px-3 py-2 bg-transparent"
              style={{ borderColor: theme.colors.border }}
              placeholder="e.g., 15"
            />
          </div>
          <div>
            <label className="text-sm opacity-70">Potassium (ppm)</label>
            <input
              type="number"
              value={form.potassium}
              onChange={(e) => setForm((s) => ({ ...s, potassium: e.target.value }))}
              className="mt-1 w-full border rounded px-3 py-2 bg-transparent"
              style={{ borderColor: theme.colors.border }}
              placeholder="e.g., 120"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose}
                  className="px-4 py-2 rounded-md hover:opacity-80"
                  style={{ backgroundColor: 'transparent', color: theme.colors.text, border: `1px solid ${theme.colors.border}` }}>
            Cancel
          </button>
          <button onClick={() => onSave(form)}
                  className="px-4 py-2 rounded-md text-white"
                  style={{ backgroundColor: theme.colors.primary }}>
            {form.id ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// Select Farmer Modal (for Documents-for-Advisors)
// ---------------------------------------------------------
function SelectFarmerModal({ open, onClose, onConfirm, farmers, theme }) {
  const [farmerId, setFarmerId] = useState('');

  useEffect(() => { if (open) setFarmerId(''); }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg shadow-lg p-6"
           style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Farmer Profile</h3>
          <button onClick={onClose} className="p-1 rounded hover:opacity-80">
            <X size={18} />
          </button>
        </div>

        <label className="text-sm opacity-70">Farmer</label>
        <select
          value={farmerId}
          onChange={(e) => setFarmerId(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2 bg-transparent"
          style={{ borderColor: theme.colors.border }}
        >
          <option value="">— Select —</option>
          {farmers.map(f => (
            <option key={f.id} value={String(f.id)}>
              {f.name} {f.district ? `(${f.district})` : ''}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md hover:opacity-80"
            style={{ backgroundColor: 'transparent', color: theme.colors.text, border: `1px solid ${theme.colors.border}` }}
          >
            Cancel
          </button>
          <button
            disabled={!farmerId}
            onClick={() => onConfirm(farmerId)}
            className="px-4 py-2 rounded-md text-white disabled:opacity-60"
            style={{ backgroundColor: theme.colors.primary }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// Component
// ---------------------------------------------------------
export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';
  const { user: authUser } = useAuth();
  const router = useRouter();

  const userId = getUserId(authUser);
  const userHasAccess = hasAgentAccess(authUser);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agentInfo, setAgentInfo] = useState(null);

  // GLOBAL data (ALL rows from DB)
  const [soilRecords, setSoilRecords] = useState([]);
  const [recoHistory, setRecoHistory] = useState([]);

  // Chat (farmers)
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastUpdated, setLastUpdated] = useState(null);

  // UI table paging
  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [soilRecords]);

  // Notifications & Requests
  const [showNotif, setShowNotif] = useState(false);
  const [showReq, setShowReq] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);

  // Add / Edit Modal
  const [showEdit, setShowEdit] = useState(false);
  const [editInitial, setEditInitial] = useState(null);

  // NEW: Select Farmer modal state
  const [showSelectFarmer, setShowSelectFarmer] = useState(false);

  useEffect(() => {
    if (authUser && !userHasAccess) router.push('/unauthorized');
  }, [authUser, userHasAccess, router]);

  // Update notification counts when data changes
  const unviewedNotifications = useMemo(() => filterUnviewedNotifications(notifications), [notifications]);
  const unviewedRequests = useMemo(() => filterUnviewedNotifications(requests), [requests]);
  
  useEffect(() => {
    setNotificationCount(unviewedNotifications.length);
  }, [unviewedNotifications]);

  useEffect(() => {
    setRequestCount(unviewedRequests.length);
  }, [unviewedRequests]);

  // ---------------------------------------------------------
  // Fetchers
  // ---------------------------------------------------------
  const fetchAgentInfo = useCallback(async () => {
    if (!userId) return null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      const res = await fetch(`${API_URL}/api/v1/users/${userId}`, { headers: authHeader(token) });
      if (!res.ok) throw new Error('User info HTTP ' + res.status);
      const body = await safeJSON(res);
      const userData = body?.data ?? body;
      if (!userData) throw new Error('No user data returned');
      return {
        id: userData.id,
        name: userData.name ?? userData.username ?? userData.email,
        userlevel: (userData.userlevel ?? userData.role ?? '').toLowerCase(),
        district: userData.district ?? userData.address ?? 'Unknown',
      };
    } catch (e) {
      console.error('fetchAgentInfo:', e);
      return null;
    }
  }, [userId]);

  const fetchFarmers = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      // Try to get farmers by userlevel filter
      let res = await fetch(`${API_URL}/api/v1/users?userlevel=farmer`, { headers: authHeader(token) });
      
      // If that fails, get all users and filter on client side
      if (!res.ok) res = await fetch(`${API_URL}/api/v1/users`, { headers: authHeader(token) });
      if (!res.ok) throw new Error('Users HTTP ' + res.status);
      
      const body = await safeJSON(res);
      const raw = (body?.data ?? body ?? []).filter(Boolean);
      return raw.map(shapeFarmer).filter((u) => u.userlevel === 'farmer');
    } catch (e) {
      console.error('fetchFarmers:', e);
      setError('Failed to load farmers.');
      return [];
    }
  }, []);

  /**
   * Fetch **ALL** PredictionHistory rows from DB (no agent filter).
   * Using only the known endpoints from the backend.
   */
  const fetchAllPredictionHistory = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Try the main predictions endpoint
    try {
      const res = await fetch(`${API_URL}/api/v1/predictions?limit=1000`, { 
        headers: authHeader(token)
      });
      
      if (res.ok) {
        const body = await safeJSON(res);
        const rows = (body?.data ?? body ?? []).filter(Boolean);
        if (rows.length) return rows;
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }

    // If no success, return empty array
    return [];
  }, []);

  // Fetch pending appointments as notifications
  const fetchNotifications = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      // Using appointments endpoint to show notifications of upcoming/recent appointments
      const res = await fetch(`${API_URL}/api/v1/appointments?limit=5`, { 
        headers: authHeader(token)
      });
      
      if (!res.ok) return [];
      
      const body = await safeJSON(res);
      const appointments = (body?.data ?? body?.items ?? body ?? []).filter(Boolean);
      
      // Format appointments as notifications
      return appointments.map(appt => ({
        id: appt.id,
        title: `Appointment: ${appt.subject || 'Consultation'}`,
        message: `${new Date(appt.appointment_date).toLocaleString()} with ${appt.farmer?.username || 'a farmer'}`,
        created_at: appt.created_at,
        type: 'appointment'
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }, []);

  // Fetch pending appointment requests
  const fetchRequests = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      // Get pending appointments as requests
      const res = await fetch(`${API_URL}/api/v1/appointments?appointment_status=pending`, { 
        headers: authHeader(token)
      });
      
      if (!res.ok) return [];
      
      const body = await safeJSON(res);
      const pendingAppointments = (body?.data ?? body?.items ?? body ?? []).filter(Boolean);
      
      return pendingAppointments;
    } catch (error) {
      console.error('Error fetching requests:', error);
      return [];
    }
  }, []);

  // ---------------------------------------------------------
  // Initial load — **GLOBAL** data for dashboard
  // ---------------------------------------------------------
  useEffect(() => {
    if (!userId || !userHasAccess) return;

    let alive = true;
    (async () => {
      setLoading(true);
      setError('');

      const [agent, allRows, farmerRows, notifs, reqs] = await Promise.all([
        fetchAgentInfo(),
        fetchAllPredictionHistory(),
        fetchFarmers(),
        fetchNotifications(),
        fetchRequests()
      ]);

      if (!alive) return;

      if (!agent) {
        setError('Failed to load agent information');
        setLoading(false);
        return;
      }
      setAgentInfo(agent);

      // shape global rows
      const soils = allRows.map(shapeSoilRow);
      const recs = allRows.map(shapeRecoRow);

      setSoilRecords(soils);
      setRecoHistory(recs);
      setFarmers(farmerRows);
      setNotifications(notifs);
      setRequests(reqs);
      setLoading(false);
      setLastUpdated(new Date());
    })();

    return () => { alive = false; };
  }, [fetchAgentInfo, fetchAllPredictionHistory, fetchFarmers, fetchNotifications, fetchRequests, userId, userHasAccess]);

  // ---------------------------------------------------------
  // Auto-refresh (every 30s + on tab focus) — GLOBAL
  // ---------------------------------------------------------
  useEffect(() => {
    if (!userId || !agentInfo) return;

    let alive = true;
    let timerId = null;

    const refreshAll = async () => {
      try {
        const [allRows, farmerRows, notifs, reqs] = await Promise.all([
          fetchAllPredictionHistory(),
          fetchFarmers(),
          fetchNotifications(),
          fetchRequests()
        ]);
        if (!alive) return;

        setSoilRecords(allRows.map(shapeSoilRow));
        setRecoHistory(allRows.map(shapeRecoRow));
        setFarmers(farmerRows);
        setNotifications(notifs);
        setRequests(reqs);
        setLastUpdated(new Date());
      } catch (e) {
        console.error('Auto refresh:', e);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshAll();
    };

    timerId = setInterval(refreshAll, 30_000);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      alive = false;
      if (timerId) clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchAllPredictionHistory, fetchFarmers, fetchNotifications, fetchRequests, userId, agentInfo]);

  // ---------------------------------------------------------
  // Add / Update — saves, then reloads **ALL**
  // ---------------------------------------------------------
  const saveRecord = useCallback(async (form) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const payload = {
      user_id: form.user_id ? Number(form.user_id) : null,
      district: form.district || null,
      soil_ph_level: form.soil_ph_level !== '' ? Number(form.soil_ph_level) : null,
      nitrogen: form.nitrogen !== '' ? Number(form.nitrogen) : null,
      phosphate: form.phosphate !== '' ? Number(form.phosphate) : null,
      potassium: form.potassium !== '' ? Number(form.potassium) : null,
    };

    try {
      let res;
      if (form.id) {
        res = await fetch(`${API_URL}/api/v1/predictions/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeader(token) },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/api/v1/predictions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader(token) },
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) throw new Error(`Save HTTP ${res.status}`);

      // Reload **ALL** rows after save
      const allRows = await fetchAllPredictionHistory();
      setSoilRecords(allRows.map(shapeSoilRow));
      setRecoHistory(allRows.map(shapeRecoRow));
      setLastUpdated(new Date());

      setShowEdit(false);
      setEditInitial(null);
    } catch (e) {
      console.error('saveRecord:', e);
      setError('Failed to save record.');
    }
  }, [fetchAllPredictionHistory]);

  // ---------------------------------------------------------
  // NEW: Confirm handler for Documents-for-Advisors flow
  // ---------------------------------------------------------
  const handleSelectFarmerConfirm = useCallback((farmerIdStr) => {
    const farmerId = Number(farmerIdStr);
    const farmer = farmers.find(f => Number(f.id) === farmerId);
    if (!farmer) return;

    try {
      localStorage.setItem('adviser_docs_selected_farmer', JSON.stringify({
        id: farmer.id,
        name: farmer.name,
        email: farmer.email,
        district: farmer.district,
        avatar: farmer.avatar,
      }));
    } catch {}

    // Navigate to Documents page
    router.push(`${DOCS_PATH}?farmerId=${encodeURIComponent(farmer.id)}`);
  }, [farmers, router]);

  // Handle notification button click
  const handleNotificationClick = () => {
    setShowNotif(true);
    markNotificationsAsViewed(unviewedNotifications);
    setNotificationCount(0); // Clear count when viewed
  };

  // Handle request button click  
  const handleRequestClick = () => {
    setShowReq(true);
    markNotificationsAsViewed(unviewedRequests);
    setRequestCount(0); // Clear count when viewed
  };

  // Handle individual notification click for navigation
  const handleNotificationItemClick = (notification) => {
    // Navigate based on notification type
    switch (notification.type) {
      case 'appointment':
        setActiveTab('requests');
        setShowNotif(false);
        break;
      default:
        // For other types, just close the panel
        setShowNotif(false);
        break;
    }
  };

  // Handle individual request click for navigation
  const handleRequestItemClick = (request) => {
    // Navigate to the appropriate section for requests
    setActiveTab('requests');
    setShowReq(false);
  };

  // ---------------------------------------------------------
  // Derived
  // ---------------------------------------------------------
  const activeSeasonText = useMemo(() => getActiveSeason(new Date()), []);
  const totalAnalyses = soilRecords.length; // ALL rows
  const regionsAnalyzed = useMemo(
    () => new Set(soilRecords.map(s => s.district)).size,
    [soilRecords]
  );
  const lastAnalysisDate = useMemo(() => {
    if (!soilRecords.length) return '—';
    const latest = [...soilRecords].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return new Date(latest.created_at).toLocaleDateString();
  }, [soilRecords]);

  const activeFarmersCount = farmers.length;

  // chart: last 5 records (from ALL rows)
  const chartData = useMemo(() => {
    const top = soilRecords
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    return {
      labels: top.map(r => `${r.district} (${new Date(r.created_at).toLocaleDateString()})`),
      datasets: [
        {
          label: 'pH',
          data: top.map(r => r.ph ?? 0),
          backgroundColor: isDark ? 'rgba(54, 162, 235, 0.8)' : 'rgba(54, 162, 235, 0.6)',
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Nitrogen (ppm)',
          data: top.map(r => r.nitrogen ?? 0),
          backgroundColor: isDark ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 0.6)',
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Phosphorus (ppm)',
          data: top.map(r => r.phosphorus ?? 0),
          backgroundColor: isDark ? 'rgba(255, 159, 64, 0.8)' : 'rgba(255, 159, 64, 0.6)',
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Potassium (ppm)',
          data: top.map(r => r.potassium ?? 0),
          backgroundColor: isDark ? 'rgba(153, 102, 255, 0.8)' : 'rgba(153, 102, 255, 0.6)',
          borderRadius: 6,
          borderSkipped: false,
        }
      ]
    };
  }, [soilRecords, isDark]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { 
          color: theme.colors.text,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20
        }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: theme.colors.border,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        intersect: false,
        mode: 'index'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { 
          color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          drawBorder: false
        },
        ticks: { 
          color: theme.colors.text,
          padding: 10
        }
      },
      x: {
        grid: { 
          color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          drawBorder: false
        },
        ticks: { 
          color: theme.colors.text,
          padding: 10,
          maxRotation: 45
        }
      }
    },
    elements: {
      bar: {
        borderWidth: 2,
        borderColor: 'transparent'
      }
    }
  }), [isDark, theme.colors]);

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  if (loading) {
    return (
      <ThemeWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.colors.primary }} />
        </div>
      </ThemeWrapper>
    );
  }

  if (!agentInfo) {
    return (
      <ThemeWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="p-4 rounded-md" style={{
            backgroundColor: isDark ? 'rgba(220,38,38,0.2)' : '#FEF2F2',
            color: isDark ? '#F87171' : '#B91C1C'
          }}>
            <p className="flex items-center"><AlertTriangle className="h-5 w-5 mr-2" />
              You need agent privileges to access this dashboard. Please log in with an agent account.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 rounded-md text-white"
              style={{ backgroundColor: theme.colors.primary }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: theme.colors.text }}>
                Agent Dashboard
              </h1>
              <div className="flex items-center text-sm opacity-70 mb-2">
                <Shield className="h-4 w-4 mr-1" />
                <span>Logged in as: {agentInfo.name} ({agentInfo.userlevel})</span>
              </div>
              {lastUpdated && (
                <div className="text-xs opacity-60">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          
          {/* Buttons Row */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={async () => {
                const [allRows, farmerRows, notifs, reqs] = await Promise.all([
                  fetchAllPredictionHistory(),
                  fetchFarmers(),
                  fetchNotifications(),
                  fetchRequests()
                ]);
                setSoilRecords(allRows.map(shapeSoilRow));
                setRecoHistory(allRows.map(shapeRecoRow));
                setFarmers(farmerRows);
                setNotifications(notifs);
                setRequests(reqs);
                setLastUpdated(new Date());
              }}
              className="px-3 py-2 rounded-md hover:opacity-90 transition-all duration-200 font-medium"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: theme.colors.text }}
            >
              Refresh
            </button>

            <button
              onClick={() => setShowSelectFarmer(true)}
              className="px-3 py-2 rounded-md text-white flex items-center gap-1 hover:opacity-90 transition-all duration-200 font-medium shadow-lg"
              style={{ backgroundColor: theme.colors.primary }}>
              <Plus size={16} /> <span className="hidden sm:inline">Add Record</span>
            </button>

            <button
              onClick={handleNotificationClick}
              className="px-3 py-2 rounded-md flex items-center gap-2 hover:opacity-90 transition-all duration-200 font-medium relative"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: theme.colors.text }}
            >
              <Bell size={18} />
              <span className="hidden sm:inline">Notifications</span>
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 text-xs px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold"
                      style={{ backgroundColor: theme.colors.primary, color: 'white' }}>
                  {notificationCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-md transition-all duration-200 font-medium ${activeTab === 'dashboard' ? 'text-white shadow-lg' : 'hover:opacity-80'}`}
              style={{
                backgroundColor: activeTab === 'dashboard' ? theme.colors.primary : 'transparent',
                color: activeTab === 'dashboard' ? 'white' : theme.colors.text
              }}>
              <BarChart className="h-5 w-5 inline-block mr-1" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('farmers')}
              className={`px-4 py-2 rounded-md transition-all duration-200 font-medium ${activeTab === 'farmers' ? 'text-white shadow-lg' : 'hover:opacity-80'}`}
              style={{
                backgroundColor: activeTab === 'farmers' ? theme.colors.primary : 'transparent',
                color: activeTab === 'farmers' ? 'white' : theme.colors.text
              }}>
              <UsersIcon className="h-5 w-5 inline-block mr-1" />
              <span className="hidden sm:inline">Farmers</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-md transition-all duration-200 font-medium ${activeTab === 'requests' ? 'text-white shadow-lg' : 'hover:opacity-80'}`}
              style={{
                backgroundColor: activeTab === 'requests' ? theme.colors.primary : 'transparent',
                color: activeTab === 'requests' ? 'white' : theme.colors.text
              }}>
              <Inbox className="h-5 w-5 inline-block mr-1" />
              <span className="hidden sm:inline">Requests</span>
            </button>

            <Link
              href="/adviser"
              className="inline-flex items-center px-4 py-2 rounded-md text-white hover:opacity-90 transition-all duration-200 font-medium shadow-lg"
              style={{ backgroundColor: theme.colors.primary }}>
              <span className="hidden sm:inline">New Analysis</span>
              <span className="sm:hidden">Analysis</span>
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md" style={{
            backgroundColor: isDark ? 'rgba(220,38,38,0.2)' : '#FEF2F2',
            color: isDark ? '#F87171' : '#B91C1C'
          }}>
            <p className="flex items-center"><AlertTriangle className="h-5 w-5 mr-2" />{error}</p>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-6">
              <div className="overflow-hidden shadow-lg rounded-xl p-5 transition-transform hover:scale-105" 
                   style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
                <div className="flex items-center">
                  <div className="p-3 rounded-full" style={{ backgroundColor: `${theme.colors.primary}20` }}>
                    <Leaf className="h-6 w-6" style={{ color: theme.colors.primary }} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm opacity-70 font-medium">Total Analyses</div>
                    <div className="text-2xl font-bold">{totalAnalyses}</div>
                  </div>
                </div>
              </div>
              <div className="overflow-hidden shadow-lg rounded-xl p-5 transition-transform hover:scale-105" 
                   style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
                <div className="flex items-center">
                  <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                    <MapIcon className="h-6 w-6" style={{ color: '#3b82f6' }} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm opacity-70 font-medium">Regions Analyzed</div>
                    <div className="text-2xl font-bold">{regionsAnalyzed}</div>
                  </div>
                </div>
              </div>
              <div className="overflow-hidden shadow-lg rounded-xl p-5 transition-transform hover:scale-105" 
                   style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
                <div className="flex items-center">
                  <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                    <Calendar className="h-6 w-6" style={{ color: '#8b5cf6' }} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm opacity-70 font-medium">Last Analysis</div>
                    <div className="text-2xl font-bold">{lastAnalysisDate}</div>
                  </div>
                </div>
              </div>
              <div className="overflow-hidden shadow-lg rounded-xl p-5 transition-transform hover:scale-105" 
                   style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
                <div className="flex items-center">
                  <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)' }}>
                    <CloudRain className="h-6 w-6" style={{ color: '#eab308' }} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm opacity-70 font-medium">Active Season</div>
                    <div className="text-lg font-bold">{getActiveSeason(new Date())}</div>
                  </div>
                </div>
              </div>
              <div className="overflow-hidden shadow-lg rounded-xl p-5 transition-transform hover:scale-105" 
                   style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
                <div className="flex items-center">
                  <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)' }}>
                    <UsersIcon className="h-6 w-6" style={{ color: '#ec4899' }} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm opacity-70 font-medium">Active Farmers</div>
                    <div className="text-2xl font-bold">{activeFarmersCount}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Soil Data Chart (ALL rows) */}
            <div className="shadow-lg rounded-xl p-6 mb-6 transition-transform hover:scale-[1.01]" 
                 style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Soil Analysis</h2>
                <div className="p-2 rounded-full" style={{ backgroundColor: `${theme.colors.primary}20` }}>
                  <BarChart className="h-5 w-5" style={{ color: theme.colors.primary }} />
                </div>
              </div>
              {soilRecords.length ? (
                <div className="h-80">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              ) : (
                <p className="opacity-70 text-center py-8">No soil records yet.</p>
              )}
            </div>

            {/* Latest Soil Records — ALL rows (show-more UI only) */}
            <div className="shadow-lg rounded-xl p-6 mb-6" 
                 style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Latest Soil Records</h2>
                {soilRecords.length > 0 && (
                  <span className="text-sm opacity-70 bg-opacity-50 px-3 py-1 rounded-full font-medium"
                        style={{ backgroundColor: `${theme.colors.primary}20`, color: theme.colors.primary }}>
                    Showing {Math.min(visibleCount, soilRecords.length)} of {soilRecords.length}
                  </span>
                )}
              </div>

              {soilRecords.length ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left border-b-2" style={{ borderColor: theme.colors.border }}>
                          <th className="py-3 pr-4 font-semibold">Date</th>
                          <th className="py-3 pr-4 font-semibold">District</th>
                          <th className="py-3 pr-4 font-semibold">pH</th>
                          <th className="py-3 pr-4 font-semibold">Nitrogen (ppm)</th>
                          <th className="py-3 pr-4 font-semibold">Phosphorus (ppm)</th>
                          <th className="py-3 pr-4 font-semibold">Potassium (ppm)</th>
                          <th className="py-3 pr-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...soilRecords]
                          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                          .slice(0, visibleCount)
                          .map(row => (
                            <tr key={row.id} 
                                className="border-b hover:bg-opacity-50 transition-colors duration-200" 
                                style={{ 
                                  borderColor: theme.colors.border,
                                  '--tw-bg-opacity': '0.05',
                                  backgroundColor: isDark ? 'rgba(255,255,255,var(--tw-bg-opacity))' : 'rgba(0,0,0,var(--tw-bg-opacity))'
                                }}>
                              <td className="py-3 pr-4 font-medium">{new Date(row.created_at).toLocaleDateString()}</td>
                              <td className="py-3 pr-4">{row.district}</td>
                              <td className="py-3 pr-4">{row.ph ?? '—'}</td>
                              <td className="py-3 pr-4">{row.nitrogen ?? '—'}</td>
                              <td className="py-3 pr-4">{row.phosphorus ?? '—'}</td>
                              <td className="py-3 pr-4">{row.potassium ?? '—'}</td>
                              <td className="py-3 pr-4">
                                <button
                                  onClick={() => { setEditInitial(row); setShowEdit(true); }}
                                  className="px-3 py-1.5 rounded-md flex items-center gap-1 hover:opacity-90 transition-all duration-200 font-medium"
                                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: theme.colors.text }}>
                                  <Edit2 size={14} /> <span className="hidden sm:inline">Edit</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {visibleCount < soilRecords.length && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                        className="px-6 py-2 rounded-md text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        Show More
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="opacity-70 text-center py-8">No soil records found.</p>
              )}
            </div>

            {/* Recommendation History — from ALL rows */}
            <div className="shadow-lg rounded-xl p-6" 
                 style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recommendation History</h2>
                <div className="p-2 rounded-full" style={{ backgroundColor: `${theme.colors.primary}20` }}>
                  <Leaf className="h-5 w-5" style={{ color: theme.colors.primary }} />
                </div>
              </div>
              {recoHistory.length ? (
                <div className="space-y-4">
                  {[...recoHistory]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 12)
                    .map(rec => (
                      <div key={rec.id}
                           className="border-2 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                           style={{ 
                             borderColor: theme.colors.border, 
                             backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' 
                           }}>
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">{rec.cropName}</h3>
                          <span className="px-3 py-1.5 rounded-full text-sm font-bold"
                                style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)', color: isDark ? '#93C5FD' : '#2563EB' }}>
                            Score: {Number(rec.score || 0).toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-3 text-sm opacity-80 flex items-center gap-3">
                          <span className="font-medium">{new Date(rec.created_at).toLocaleDateString()}</span>
                          <span className="w-1 h-1 rounded-full bg-current opacity-50"></span>
                          <span>District: {rec.district}</span>
                        </div>
                      </div>
                    ))}
                  <div className="text-center mt-6">
                    <Link href="/adviser/history" 
                          className="inline-flex items-center text-sm font-medium hover:opacity-80 transition-colors duration-200" 
                          style={{ color: theme.colors.primary }}>
                      View all history <ArrowRight size={16} className="inline ml-2" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="opacity-70 text-center py-8">No recommendation history found.</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'farmers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            {/* Farmers List */}
            <div className="lg:col-span-1 overflow-hidden shadow-lg rounded-xl"
                 style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
              <div className="p-6 border-b" style={{ borderColor: theme.colors.border }}>
                <h2 className="text-xl font-semibold">Farmers</h2>
                <p className="text-sm opacity-70 mt-1">Chat with assigned farmers</p>
              </div>
              <div className="divide-y" style={{ borderColor: theme.colors.border }}>
                {farmers.map((farmer) => (
                  <button key={farmer.id}
                          onClick={() => setSelectedFarmer(farmer)}
                          className="w-full p-4 text-left hover:opacity-90 flex items-center transition-all duration-200"
                          style={{
                            backgroundColor: selectedFarmer?.id === farmer.id
                              ? (isDark ? 'rgba(74,222,128,0.1)' : 'rgba(76,175,80,0.06)') : 'transparent',
                            borderLeftWidth: selectedFarmer?.id === farmer.id ? 4 : 0,
                            borderLeftColor: theme.colors.primary
                          }}>
                    <div className="h-12 w-12 rounded-full mr-3 flex items-center justify-center overflow-hidden"
                         style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                      {farmer.avatar
                        ? <img src={farmer.avatar} alt={farmer.name} className="h-12 w-12 rounded-full object-cover" />
                        : <User className="h-6 w-6" style={{ opacity: 0.6 }} />}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{farmer.name}</div>
                      <div className="text-sm opacity-70">{farmer.district}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat (separate component) */}
            <div className="lg:col-span-2">
              <MessagesPanel
                apiUrl={API_URL}
                adviserId={agentInfo.id}
                selectedFarmer={selectedFarmer}
              />
            </div>
          </div>
        )}

        {/* New Requests Tab */}
        {activeTab === 'requests' && (
          <div className="mt-2">
            <Request />
          </div>
        )}
      </div>

      {/* Modals / Panels */}
      <EditRecordModal
        open={showEdit}
        onClose={() => { setShowEdit(false); setEditInitial(null); }}
        onSave={saveRecord}
        initial={editInitial}
        theme={theme}
        farmers={farmers}
      />

      {/* NEW: Select Farmer for Documents-for-Advisors */}
      <SelectFarmerModal
        open={showSelectFarmer}
        onClose={() => setShowSelectFarmer(false)}
        onConfirm={handleSelectFarmerConfirm}
        farmers={farmers}
        theme={theme}
      />

      <SlideOver
        open={showNotif}
        onClose={() => setShowNotif(false)}
        title="Notifications"
        items={unviewedNotifications}
        theme={theme}
        emptyText="No new notifications."
        onItemClick={handleNotificationItemClick}
      />

      <SlideOver
        open={showReq}
        onClose={() => setShowReq(false)}
        title="Appointment Requests"
        items={unviewedRequests}
        theme={theme}
        emptyText="No new appointment requests."
        onItemClick={handleRequestItemClick}
      />
    </ThemeWrapper>
  );
}

// ---------------------------------------------------------
// Slide-over panel (Notifications / Requests)
// ---------------------------------------------------------
function SlideOver({ open, onClose, title, items, theme, emptyText, onItemClick }) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full max-w-md shadow-2xl transition-transform
                       ${open ? 'translate-x-0' : 'translate-x-full'}`}
           style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
        <div className="p-4 border-b flex items-center justify-between"
             style={{ borderColor: theme.colors.border }}>
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:opacity-80">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-56px)]">
          {!items?.length ? (
            <p className="opacity-70 text-center py-8">{emptyText}</p>
          ) : items.map((it) => (
            <button
              key={it.id ?? Math.random()}
              onClick={() => onItemClick?.(it)}
              className="w-full text-left border-2 rounded-xl p-3 hover:shadow-md hover:bg-opacity-5 hover:bg-current transition-all duration-200 cursor-pointer"
              style={{ 
                borderColor: theme.colors.border, 
                backgroundColor: 'transparent'
              }}>
              <div className="text-sm font-semibold">{it.title ?? it.subject ?? it.type ?? 'Item'}</div>
              <div className="text-xs opacity-70 mt-1">{it.message ?? it.note ?? it.description ?? ''}</div>
              <div className="text-xs opacity-60 mt-2 font-medium">{it.created_at ? new Date(it.created_at).toLocaleString() : ''}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}