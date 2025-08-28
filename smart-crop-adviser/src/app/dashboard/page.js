'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  Leaf, BarChart, Calendar, Map, CloudRain, ArrowRight, Users as UsersIcon,
  MessageSquare, Paperclip, Send, Image, FileText, X, User, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import ThemeWrapper from '@/components/ThemeWrapper';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------
const RAW_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = RAW_API.replace(/\/+$/, ''); // strip trailing slash

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

const safeJSON = async (res) => {
  try { return await res.json(); } catch { return null; }
};

const getToken = () =>
  (typeof window !== 'undefined') ? localStorage.getItem('token') : null;

const getAdviserId = () => {
  if (typeof window === 'undefined') return 1;
  const fromLocal = Number(localStorage.getItem('userId'));
  return Number.isFinite(fromLocal) && fromLocal > 0 ? fromLocal : 1; // fallback -> 1
};

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [farmers, setFarmers] = useState([]);
  const [soilRecords, setSoilRecords] = useState([]);
  const [recoHistory, setRecoHistory] = useState([]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  const [messages, setMessages] = useState([]);
  const [messagesFetched, setMessagesFetched] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [roomMessages, setRoomMessages] = useState([]);
  const [roomFetched, setRoomFetched] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const adviserId = getAdviserId();

  // ---------------------------------------------------------
  // Fetchers
  // ---------------------------------------------------------
  const fetchFarmers = useCallback(async () => {
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/v1/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Users HTTP ' + res.status);
      const data = await safeJSON(res);
      const rows = (data?.data ?? data ?? []).filter(Boolean);
      const onlyFarmers = rows.filter(u => String(u.userlevel ?? '').toLowerCase() === 'farmer');
      return onlyFarmers;
    } catch (e) {
      console.error('fetchFarmers:', e);
      setError('Failed to load farmers.');
      return [];
    }
  }, []);

  const fetchSoilRecords = useCallback(async () => {
    const token = getToken();
    try {
      // Use your existing predictions endpoints
      let res = await fetch(`${API_URL}/api/v1/predictions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      // Optional fallback to /history if you have it wired
      if (!res.ok) {
        res = await fetch(`${API_URL}/api/v1/predictions/history`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      }
      if (!res.ok) throw new Error('Predictions HTTP ' + res.status);

      const data = await safeJSON(res);
      const rows = (data?.data ?? data ?? []).filter(Boolean);

      // Normalize
      return rows.map((r) => ({
        id: r.id ?? r._id ?? r.record_id ?? r.prediction_id ?? Math.random(),
        district: r.district ?? r.location ?? '—',
        created_at: r.created_at ?? r.date ?? r.updated_at ?? new Date().toISOString(),
        ph: Number(r.ph ?? r.soil_ph_level ?? r.soil_ph ?? r.ph_value ?? 0),
        nitrogen: Number(r.nitrogen ?? r.nitrogen_ppm ?? r.n ?? 0),
        phosphorus: Number(r.phosphorus ?? r.phosphorus_ppm ?? r.phosphate ?? r.p ?? 0),
        potassium: Number(r.potassium ?? r.potassium_ppm ?? r.k ?? 0),
      }));
    } catch (e) {
      console.error('fetchSoilRecords:', e);
      setError('Failed to load soil records.');
      return [];
    }
  }, []);

  const fetchRecommendationHistory = useCallback(async () => {
    const token = getToken();
    try {
      let res = await fetch(`${API_URL}/api/v1/predictions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        res = await fetch(`${API_URL}/api/v1/predictions/history`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      }
      if (!res.ok) throw new Error('Predictions HTTP ' + res.status);

      const data = await safeJSON(res);
      const rows = (data?.data ?? data ?? []).filter(Boolean);

      return rows.map((r) => ({
        id: r.id ?? r._id ?? r.prediction_id ?? Math.random(),
        cropName: r.crop_name ?? r.predicted_crop ?? r.crop ?? 'Unknown crop',
        score: Number(r.confidence ?? r.score ?? r.ml_score ?? 0),
        district: r.district ?? r.location ?? '—',
        created_at: r.created_at ?? r.date ?? r.updated_at ?? new Date().toISOString(),
        soilRecord: {
          id: r.soil_id ?? r.record_id ?? r.id ?? Math.random(),
          district: r.district ?? '—',
          ph: Number(r.soil_ph_level ?? r.soil_ph ?? r.ph ?? 0),
          nitrogen: Number(r.nitrogen ?? r.nitrogen_ppm ?? 0),
          phosphorus: Number(r.phosphorus ?? r.phosphorus_ppm ?? r.phosphate ?? 0),
          potassium: Number(r.potassium ?? r.potassium_ppm ?? 0),
        }
      }));
    } catch (e) {
      console.error('fetchRecommendationHistory:', e);
      setError('Failed to load recommendation history.');
      return [];
    }
  }, []);

  // Messages API
  const fetchThread = useCallback(async (adviserId, farmerId, page = 1, limit = 30) => {
    if (!adviserId || !farmerId) return [];
    const token = getToken();
    try {
      const url = `${API_URL}/api/v1/messages/thread?userA=${adviserId}&userB=${farmerId}&page=${page}&limit=${limit}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Thread HTTP ' + res.status);
      const data = await safeJSON(res);
      return (data?.data ?? data ?? []).filter(Boolean);
    } catch (e) {
      console.error('fetchThread:', e);
      return [];
    }
  }, []);

  const fetchRoomMessages = useCallback(async (room = 'advice-room', page = 1, limit = 30) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/v1/messages/room/${room}?page=${page}&limit=${limit}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Room HTTP ' + res.status);
      const data = await safeJSON(res);
      return (data?.data ?? data ?? []).filter(Boolean);
    } catch (e) {
      console.error('fetchRoomMessages:', e);
      return [];
    }
  }, []);

  const markDelivered = useCallback(async (messageId) => {
    if (!messageId) return false;
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/v1/messages/${messageId}/delivered`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return res.ok;
    } catch (e) {
      console.error('markDelivered:', e);
      return false;
    }
  }, []);

  const markRead = useCallback(async (messageId) => {
    if (!messageId) return false;
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/v1/messages/${messageId}/read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return res.ok;
    } catch (e) {
      console.error('markRead:', e);
      return false;
    }
  }, []);

  const uploadFile = useCallback(async (file) => {
    const token = getToken();
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_URL}/api/v1/files/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd
    });
    if (!res.ok) return null;
    const data = await safeJSON(res);
    return data?.data ?? null;
  }, []);

  const sendMessage = useCallback(async (receiverId, content, localAttachments = []) => {
    const token = getToken();
    try {
      // Upload attachments first
      const uploaded = [];
      for (const att of localAttachments) {
        const meta = await uploadFile(att.file);
        if (meta) {
          const url = meta.url || (meta.filename ? `${API_URL}/uploads/${meta.filename}` : null);
          uploaded.push({
            id: meta.id,
            name: att.name,
            type: att.type,
            url
          });
        } else {
          uploaded.push({ name: att.name, type: att.type });
        }
      }

      // Send message
      const res = await fetch(`${API_URL}/api/v1/messages`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_id: receiverId,     // <— adjust if your API expects a different key
          content,
          attachments: uploaded
        })
      });
      if (!res.ok) throw new Error('Send message HTTP ' + res.status);
      const data = await safeJSON(res);
      return { success: true, message: data?.data ?? null, attachments: uploaded };
    } catch (e) {
      console.error('sendMessage:', e);
      return { success: false };
    }
  }, [uploadFile]);

  // ---------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      const [farmerRows, soilRows, historyRows] = await Promise.all([
        fetchFarmers(),
        fetchSoilRecords(),
        fetchRecommendationHistory()
      ]);
      setFarmers(farmerRows);
      setSoilRecords(soilRows);
      setRecoHistory(historyRows);
      setLoading(false);
    })();
  }, [fetchFarmers, fetchSoilRecords, fetchRecommendationHistory]);

  // Optional: preload room messages (advice-room) for a sidebar view if needed
  useEffect(() => {
    (async () => {
      const msgs = await fetchRoomMessages('advice-room', 1, 30);
      setRoomMessages(msgs);
      setRoomFetched(true);
    })();
  }, [fetchRoomMessages]);

  // ---------------------------------------------------------
  // Derived
  // ---------------------------------------------------------
  const activeSeasonText = useMemo(() => getActiveSeason(new Date()), []);
  const activeFarmersCount = farmers.length;
  const totalAnalyses = soilRecords.length;

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
        },
        {
          label: 'Nitrogen (ppm)',
          data: top.map(r => r.nitrogen ?? 0),
          backgroundColor: isDark ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Phosphorus (ppm)',
          data: top.map(r => r.phosphorus ?? 0),
          backgroundColor: isDark ? 'rgba(255, 159, 64, 0.8)' : 'rgba(255, 159, 64, 0.6)',
        },
        {
          label: 'Potassium (ppm)',
          data: top.map(r => r.potassium ?? 0),
          backgroundColor: isDark ? 'rgba(153, 102, 255, 0.8)' : 'rgba(153, 102, 255, 0.6)',
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
        labels: { color: theme.colors.text }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: theme.colors.border,
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        ticks: { color: theme.colors.text }
      },
      x: {
        grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        ticks: { color: theme.colors.text }
      }
    }
  }), [isDark, theme.colors]);

  // ---------------------------------------------------------
  // Messaging UI logic
  // ---------------------------------------------------------
  const handleFarmerSelect = async (farmer) => {
    if (!farmer) return;
    if (selectedFarmer?.id === farmer.id) return;
    setSelectedFarmer(farmer);
    setMessagesFetched(false);

    // Load thread
    const data = await fetchThread(adviserId, farmer.id, 1, 30);
    setMessages(data);

    // Mark server states (delivered + read) best-effort
    for (const m of data) {
      if (!m?.id) continue;
      // If message is inbound to adviser, mark delivered/read
      const sentToAdviser = Number(m.receiver_id ?? m.to_id ?? m.receiverId) === adviserId;
      if (sentToAdviser) {
        await markDelivered(m.id);
        await markRead(m.id);
      }
    }

    setMessagesFetched(true);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const groupedMessages = useMemo(() => {
    const groups = {};
    for (const m of messages) {
      const d = new Date(m.timestamp ?? m.created_at ?? m.sent_at ?? Date.now());
      const key = d.toDateString();
      (groups[key] = groups[key] || []).push(m);
    }
    return groups;
  }, [messages]);

  const handleAttachmentClick = () => fileInputRef.current?.click();

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const mapped = files.map(file => {
      const type = file.type.startsWith('image/')
        ? 'image'
        : file.type === 'application/pdf'
          ? 'pdf'
          : 'file';
      return {
        file,
        name: file.name,
        type,
        previewUrl: type === 'image' ? URL.createObjectURL(file) : null
      };
    });
    setAttachments(prev => [...prev, ...mapped]);
    e.target.value = '';
  };

  const removeAttachment = (i) => {
    setAttachments(prev => {
      const copy = [...prev];
      const item = copy[i];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      copy.splice(i, 1);
      return copy;
    });
  };

  const handleSendMessage = async () => {
    if (!selectedFarmer || (!messageInput.trim() && attachments.length === 0)) return;
    setMessageLoading(true);
    const res = await sendMessage(selectedFarmer.id, messageInput, attachments);
    if (res.success) {
      const serverMsg = res.message;
      const newMsg = serverMsg || {
        id: Date.now(),
        sender_id: adviserId,
        receiver_id: selectedFarmer.id,
        content: messageInput,
        timestamp: new Date().toISOString(),
        attachments: (res.attachments || []).map(a => ({ type: a.type, name: a.name, url: a.url }))
      };
      setMessages(prev => [...prev, newMsg]);
      setMessageInput('');
      setAttachments([]);
      setNotification('Message sent');
      setTimeout(() => setNotification(null), 2500);
    } else {
      setNotification('Failed to send (check API)');
      setTimeout(() => setNotification(null), 3000);
    }
    setMessageLoading(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  return (
    <ThemeWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0" style={{ color: theme.colors.text }}>Adviser Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'dashboard' ? 'text-white' : 'hover:opacity-80'}`}
              style={{
                backgroundColor: activeTab === 'dashboard' ? theme.colors.primary : 'transparent',
                color: activeTab === 'dashboard' ? 'white' : theme.colors.text
              }}>
              <BarChart className="h-5 w-5 inline-block mr-1" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('farmers')}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'farmers' ? 'text-white' : 'hover:opacity-80'}`}
              style={{
                backgroundColor: activeTab === 'farmers' ? theme.colors.primary : 'transparent',
                color: activeTab === 'farmers' ? 'white' : theme.colors.text
              }}>
              <UsersIcon className="h-5 w-5 inline-block mr-1" />
              <span className="hidden sm:inline">Farmers</span>
            </button>

            <Link
              href="/adviser"
              className="inline-flex items-center px-4 py-2 rounded-md text-white hover:opacity-90"
              style={{ backgroundColor: theme.colors.primary }}>
              New Analysis <ArrowRight size={16} className="ml-2" />
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

        {notification && (
          <div className="fixed top-20 right-4 p-3 rounded-md shadow-lg z-50"
               style={{ backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : '#f0fdf4', color: isDark ? '#86efac' : '#22c55e' }}>
            <p className="flex items-center"><CheckCircle className="h-5 w-5 mr-2" />{notification}</p>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-6">
              {/* Total Analyses */}
              <div className="overflow-hidden shadow rounded-lg" style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
                <div className="p-5 flex items-center">
                  <Leaf className="h-6 w-6" style={{ color: theme.colors.primary }} />
                  <div className="ml-5">
                    <div className="text-sm opacity-70">Total Analyses</div>
                    <div className="text-lg font-semibold">{totalAnalyses}</div>
                  </div>
                </div>
              </div>

              {/* Regions */}
              <div className="overflow-hidden shadow rounded-lg" style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
                <div className="p-5 flex items-center">
                  <Map className="h-6 w-6" style={{ color: '#3b82f6' }} />
                  <div className="ml-5">
                    <div className="text-sm opacity-70">Regions Analyzed</div>
                    <div className="text-lg font-semibold">{new Set(soilRecords.map(s => s.district)).size}</div>
                  </div>
                </div>
              </div>

              {/* Last Analysis Date */}
              <div className="overflow-hidden shadow rounded-lg" style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
                <div className="p-5 flex items-center">
                  <Calendar className="h-6 w-6" style={{ color: '#8b5cf6' }} />
                  <div className="ml-5">
                    <div className="text-sm opacity-70">Last Analysis</div>
                    <div className="text-lg font-semibold">
                      {soilRecords.length
                        ? new Date([...soilRecords].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0].created_at).toLocaleDateString()
                        : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Season */}
              <div className="overflow-hidden shadow rounded-lg" style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
                <div className="p-5 flex items-center">
                  <CloudRain className="h-6 w-6" style={{ color: '#eab308' }} />
                  <div className="ml-5">
                    <div className="text-sm opacity-70">Active Season (Today)</div>
                    <div className="text-lg font-semibold">{activeSeasonText}</div>
                  </div>
                </div>
              </div>

              {/* Active Farmers */}
              <div className="overflow-hidden shadow rounded-lg" style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
                <div className="p-5 flex items-center">
                  <UsersIcon className="h-6 w-6" style={{ color: '#ec4899' }} />
                  <div className="ml-5">
                    <div className="text-sm opacity-70">Active Farmers</div>
                    <div className="text-lg font-semibold">{activeFarmersCount}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Soil Data Chart */}
            <div className="shadow rounded-lg p-6 mb-6" style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium">Recent Soil Analysis</h2>
                <BarChart className="h-5 w-5" style={{ opacity: 0.6 }} />
              </div>
              {soilRecords.length ? (
                <div className="h-80">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              ) : (
                <p className="opacity-70">No soil records yet.</p>
              )}
            </div>

            {/* Latest Soil Records (no stray whitespace in <tr>) */}
            <div className="shadow rounded-lg p-6 mb-6" style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
              <h2 className="text-lg font-medium mb-4">Latest Soil Records</h2>
              {soilRecords.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b" style={{ borderColor: theme.colors.border }}>
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">District</th>
                        <th className="py-2 pr-4">pH</th>
                        <th className="py-2 pr-4">Nitrogen (ppm)</th>
                        <th className="py-2 pr-4">Phosphorus (ppm)</th>
                        <th className="py-2 pr-4">Potassium (ppm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...soilRecords]
                        .sort((a,b)=> new Date(b.created_at)-new Date(a.created_at))
                        .slice(0,10)
                        .map(row => (
                          <tr key={row.id} className="border-b" style={{ borderColor: theme.colors.border }}>
                            <td className="py-2 pr-4">{new Date(row.created_at).toLocaleDateString()}</td>
                            <td className="py-2 pr-4">{row.district}</td>
                            <td className="py-2 pr-4">{row.ph ?? '—'}</td>
                            <td className="py-2 pr-4">{row.nitrogen ?? '—'}</td>
                            <td className="py-2 pr-4">{row.phosphorus ?? '—'}</td>
                            <td className="py-2 pr-4">{row.potassium ?? '—'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="opacity-70">No soil records found.</p>
              )}
            </div>

            {/* Recommendation History */}
            <div className="shadow rounded-lg p-6" style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Recommendation History</h2>
                <Leaf className="h-5 w-5" style={{ color: theme.colors.primary }} />
              </div>
              {recoHistory.length ? (
                <div className="space-y-3">
                  {[...recoHistory]
                    .sort((a,b)=> new Date(b.created_at)-new Date(a.created_at))
                    .slice(0,8)
                    .map(rec => (
                      <div key={rec.id}
                        className="border rounded-lg p-4"
                        style={{ borderColor: theme.colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                        <div className="flex justify-between">
                          <h3 className="font-medium">{rec.cropName}</h3>
                          <span className="px-2 py-1 rounded-full text-xs"
                                style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)', color: isDark ? '#93C5FD' : '#2563EB' }}>
                            Score: {Number(rec.score || 0).toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm opacity-80">
                          <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>District: {rec.district}</span>
                        </div>
                      </div>
                  ))}
                  <div className="text-center mt-3">
                    <Link href="/history" className="text-sm" style={{ color: theme.colors.primary }}>
                      View all history <ArrowRight size={16} className="inline ml-1" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="opacity-70">No recommendation history found.</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'farmers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            {/* Farmers List */}
            <div className="lg:col-span-1 overflow-hidden shadow rounded-lg"
                 style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
              <div className="p-4 border-b" style={{ borderColor: theme.colors.border }}>
                <h2 className="text-lg font-medium">Farmers</h2>
                <p className="text-sm opacity-70">Chat with assigned farmers</p>
              </div>
              <div className="divide-y" style={{ borderColor: theme.colors.border }}>
                {farmers.map((farmer) => (
                  <button key={farmer.id}
                          onClick={() => handleFarmerSelect(farmer)}
                          className="w-full p-4 text-left hover:opacity-90 flex items-center"
                          style={{
                            backgroundColor: selectedFarmer?.id === farmer.id
                              ? (isDark ? 'rgba(74,222,128,0.1)' : 'rgba(76,175,80,0.06)') : 'transparent',
                            borderLeftWidth: selectedFarmer?.id === farmer.id ? 4 : 0,
                            borderLeftColor: theme.colors.primary
                          }}>
                    <div className="h-10 w-10 rounded-full mr-3 flex items-center justify-center"
                         style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                      {farmer.avatar
                        ? <img src={farmer.avatar} alt={farmer.name} className="h-10 w-10 rounded-full" />
                        : <User className="h-6 w-6" style={{ opacity: 0.6 }} />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{farmer.name ?? farmer.username ?? `User ${farmer.id}`}</div>
                      <div className="text-xs opacity-70">{farmer.district ?? farmer.address ?? '—'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="lg:col-span-2 overflow-hidden shadow rounded-lg"
                 style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
              {selectedFarmer ? (
                <div className="flex flex-col h-[calc(100vh-250px)]">
                  {/* Header */}
                  <div className="p-4 border-b flex items-center" style={{ borderColor: theme.colors.border }}>
                    <div className="h-10 w-10 rounded-full mr-3 flex items-center justify-center"
                         style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                      <User className="h-6 w-6" style={{ opacity: 0.6 }} />
                    </div>
                    <div>
                      <div className="font-medium">{selectedFarmer.name ?? selectedFarmer.username}</div>
                      <div className="text-xs opacity-70">{selectedFarmer.district ?? '—'}</div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}>
                    {!messagesFetched ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-b-2 rounded-full" style={{ borderColor: theme.colors.primary }} />
                      </div>
                    ) : Object.keys(groupedMessages).length ? (
                      Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date} className="mb-6">
                          <div className="flex justify-center mb-3">
                            <div className="px-2 py-1 rounded-full text-xs"
                                 style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                              {date}
                            </div>
                          </div>
                          {msgs.map((m) => {
                            const mine = Number(m.sender_id ?? m.from_id ?? m.senderId) === adviserId;
                            const ts = m.timestamp ?? m.created_at ?? m.sent_at ?? new Date().toISOString();
                            const atts = m.attachments ?? m.files ?? [];
                            return (
                              <div key={m.id ?? Math.random()} className={`mb-3 flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                <div className="rounded-lg px-4 py-2 max-w-[80%]"
                                     style={{
                                       backgroundColor: mine
                                         ? (isDark ? 'rgba(74,222,128,0.2)' : 'rgba(76,175,80,0.1)')
                                         : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                                     }}>
                                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                                  {!!atts.length && (
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                      {atts.map((a, i) => (
                                        <a key={i}
                                           href={a.url || (a.filename ? `${API_URL}/uploads/${a.filename}` : undefined)}
                                           target="_blank" rel="noreferrer"
                                           className="p-2 rounded-md flex items-center"
                                           style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)' }}>
                                          {a.type === 'image'
                                            ? <Image className="h-5 w-5 mr-2" />
                                            : a.type === 'pdf'
                                              ? <FileText className="h-5 w-5 mr-2" />
                                              : <Paperclip className="h-5 w-5 mr-2" />}
                                          <span className="text-sm truncate">{a.name ?? a.filename ?? 'attachment'}</span>
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                  <div className="text-right mt-1 text-xs opacity-60">{formatTime(ts)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <MessageSquare className="h-12 w-12 mb-3" style={{ opacity: 0.2 }} />
                        <p className="opacity-70">No messages yet.</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Composer */}
                  <div className="p-3 border-t" style={{ borderColor: theme.colors.border }}>
                    <div className="flex">
                      <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message…"
                        rows={3}
                        className="flex-1 resize-none rounded-md px-3 py-2 mr-2"
                        style={{
                          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                          border: `1px solid ${theme.colors.border}`,
                          color: theme.colors.text
                        }}
                      />
                      <div className="flex flex-col gap-2 w-40">
                        <button onClick={() => fileInputRef.current?.click()}
                                className="p-2 rounded-md"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: theme.colors.text }}>
                          <Paperclip className="h-5 w-5 inline mr-2" /> Attach
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          multiple
                          accept="image/*,application/pdf"
                          onChange={onFiles}
                        />
                        <button onClick={handleSendMessage}
                                disabled={messageLoading || (!messageInput.trim() && attachments.length === 0)}
                                className="p-2 rounded-md text-white"
                                style={{ backgroundColor: theme.colors.primary, opacity: messageLoading ? 0.7 : 1 }}>
                          {messageLoading ? 'Sending…' : (<><Send className="h-5 w-5 inline mr-2" /> Send</>)}
                        </button>
                      </div>
                    </div>

                    {/* Attachments Preview */}
                    {!!attachments.length && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {attachments.map((att, i) => (
                          <div key={i} className="relative p-2 rounded-md flex items-center"
                               style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
                            {att.type === 'image'
                              ? (<div className="h-10 w-10 rounded-md mr-2 overflow-hidden">
                                  {att.previewUrl && <img src={att.previewUrl} alt={att.name} className="h-full w-full object-cover" />}
                                 </div>)
                              : att.type === 'pdf'
                                ? <FileText className="h-10 w-10 mr-2" />
                                : <Paperclip className="h-10 w-10 mr-2" />}
                            <span className="text-sm mr-6 max-w-[120px] truncate">{att.name}</span>
                            <button onClick={() => removeAttachment(i)}
                                    className="absolute top-1 right-1 p-1 rounded-full"
                                    style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)' }}>
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[calc(100vh-250px)] flex flex-col items-center justify-center">
                  <MessageSquare className="h-16 w-16 mb-3" style={{ opacity: 0.15 }} />
                  <h3 className="text-xl font-medium">Select a Farmer</h3>
                  <p className="opacity-70">Choose a farmer from the list to start a conversation.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ThemeWrapper>
  );
}
