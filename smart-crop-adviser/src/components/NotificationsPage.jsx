'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  Bell, MessageSquare, Paperclip, FileText, BarChart3,
  CheckCircle2, Clock, Loader2, RefreshCw, Filter, Eye, ArrowLeft,
  CircleX
} from 'lucide-react';

/* --------------------------------- Config --------------------------------- */

const RAW_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE = RAW_API.replace(/\/+$/, ''); // strip trailing slashes

const getToken = () =>
  (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

const authHeader = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

const safeJSON = async (res) => {
  try { return await res.json(); } catch { return null; }
};

/* ------------------------------ Helper utils ------------------------------ */

const toArray = (body) => {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== 'object') return [];
  const keys = ['items', 'data', 'results', 'list', 'rows', 'records', 'notifications'];
  for (const k of keys) if (Array.isArray(body[k])) return body[k];
  return [];
};

// Try a list of URLs; return the first that responds OK and produces an array.
// Silently skip 404s/network/parse errors (prevents console spam).
async function firstList(candidates, headers) {
  for (const url of candidates) {
    try {
      const r = await fetch(url, { headers, cache: 'no-store' });
      if (!r.ok) continue; // 404 or other -> try next
      const body = await safeJSON(r);
      return toArray(body);
    } catch { /* ignore */ }
  }
  return [];
}

const localReadKey = (type, id) => `notif_read:${type}:${id}`;
const isLocallyRead = (type, id) => {
  try { 
    const key = localReadKey(type, id);
    const value = localStorage.getItem(key);
    return !!value;
  } catch { 
    return false; 
  }
};
const setLocallyRead = (type, id, read = true) => {
  try {
    const key = localReadKey(type, id);
    if (read) {
      localStorage.setItem(key, String(Date.now()));
    } else {
      localStorage.removeItem(key);
    }
  } catch { /* ignore */ }
};

// Helper function to clear all read states (for debugging)
const clearAllReadStates = () => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('notif_read:')) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
  } catch { /* ignore */ }
};

function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';

  const now = new Date();
  const diffMs = now - dt;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay < 1) {
    if (diffHour < 1) return diffMin < 1 ? 'Just now' : `${diffMin}m ago`;
    return `${diffHour}h ago`;
  } else if (diffDay < 7) {
    return `${diffDay}d ago`;
  }
  return dt.toLocaleDateString();
}

function bytes(n) {
  if (n == null) return '';
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

// Try to resolve a usable download/view URL for a file payload.
function resolveFileURL(apiBase, doc, type) {
  const c = doc.raw || doc;
  const candidates = [
    c.file_url, c.url, c.download_url, c.public_url, c.link, c.href, c.path, c.filepath,
  ].filter(Boolean);

  if (candidates.length > 0) {
    const first = String(candidates[0]);
    if (/^https?:\/\//i.test(first)) return first;
    return `${apiBase}/${first.replace(/^\/+/, '')}`;
  }
  if (type === 'message_file') return `${apiBase}/api/v1/files/${doc.id}/download`;
  if (type === 'user_file') return `${apiBase}/api/v1/user-files/${doc.id}/download`;
  return null;
}

/* ----------------------------- Main component ----------------------------- */

export default function NotificationsPage({
  apiBase = API_BASE,
  pageSize = 30,
  farmerOnly = true,
  dashboardUrl = '/profile/Dashboard',
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const isDark = theme.name === 'dark';

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const border = { border: `1px solid ${theme.colors.border}` };
  const canSee = !!user?.id;

  /* ------------------------------- Fetchers ------------------------------- */

  const fetchMessages = useCallback(async () => {
    if (!user?.id) return [];
    const token = getToken();
    const headers = authHeader(token);

    // Use the correct backend route structure
    const list = await firstList([
      `${apiBase}/api/v1/messages/user/${encodeURIComponent(user.id)}?page=1&limit=200`,
      `${apiBase}/api/v1/messages/user/${encodeURIComponent(user.id)}`,
    ], headers);

    return list.map(m => ({
      _type: 'message',
      id: m.id,
      sender_id: m.sender_id ?? m.senderId ?? null,
      receiver_id: m.receiver_id ?? m.receiverId ?? null,
      text: m.text ?? m.body ?? '',
      delivered_at: m.delivered_at ?? null,
      read_at: m.read_at ?? m.readAt ?? null,
      created_at: m.created_at ?? m.createdAt ?? m.timestamp ?? null,
      updated_at: m.updated_at ?? m.updatedAt ?? null,
      files_count: Array.isArray(m.files) ? m.files.length : (m.files_count ?? 0),
      raw: m,
    }));
  }, [apiBase, user?.id]);

  const fetchMessageFiles = useCallback(async (messageIds = []) => {
    if (!user?.id) return [];
    const token = getToken();
    const headers = authHeader(token);

    // Since there's no direct endpoint for message files by receiver,
    // we'll skip this for now or implement it differently
    // The backend files.js only has upload endpoints
    return [];
  }, [apiBase, user?.id]);

  const fetchUserFiles = useCallback(async () => {
    if (!user?.id) return [];
    const token = getToken();
    const headers = authHeader(token);

    // Use the correct backend route structure
    const list = await firstList([
      `${apiBase}/api/v1/user-files/farmer/${encodeURIComponent(user.id)}?limit=200`,
      `${apiBase}/api/v1/user-files?farmer_id=${encodeURIComponent(user.id)}&limit=200`,
      `${apiBase}/api/v1/user-files?limit=200`,
    ], headers);

    return list.map(u => ({
      _type: 'user_file',
      id: u.id,
      farmer_id: u.farmer_id ?? u.farmerId ?? null,
      adviser_id: u.adviser_id ?? u.adviserId ?? null,
      original_name: u.original_name ?? u.name ?? 'file',
      stored_name: u.stored_name ?? null,
      size_bytes: u.size_bytes ?? u.size ?? null,
      category: u.category ?? null,
      notes: u.notes ?? null,
      created_at: u.created_at ?? u.createdAt ?? null,
      updated_at: u.updated_at ?? u.updatedAt ?? null,
      delivered_at: null,
      read_at: null,
      public_url: u.public_url ?? null,
      raw: u,
    }));
  }, [apiBase, user?.id]);

  const fetchPredictions = useCallback(async () => {
    if (!user?.id) return [];
    const token = getToken();
    const headers = authHeader(token);

    // Use the correct backend route structure
    const list = await firstList([
      `${apiBase}/api/v1/predictions/user/${encodeURIComponent(user.id)}?page=1&limit=200`,
      `${apiBase}/api/v1/predictions?user_id=${encodeURIComponent(user.id)}&limit=200`,
    ], headers);

    return list.map(p => ({
      _type: 'prediction',
      id: p.id,
      user_id: p.user_id ?? p.userId ?? null,
      crop_name: p.crop_name ?? p.predicted_crop ?? 'Crop',
      suitability_score: p.suitability_score ?? p.confidence ?? null,
      created_at: p.created_at ?? p.createdAt ?? null,
      updated_at: p.updated_at ?? p.updatedAt ?? null,
      delivered_at: null,
      read_at: null,
      raw: p,
    }));
  }, [apiBase, user?.id]);

  const loadAll = useCallback(async () => {
    if (!user?.id) { setItems([]); setLoading(false); return; }
    setLoading(true);
    setErr('');
    try {
      const [msgs, ufiles, preds] = await Promise.all([
        fetchMessages(),
        fetchUserFiles(),
        fetchPredictions(),
      ]);
      const mfiles = await fetchMessageFiles((msgs ?? []).map(m => m.id).filter(Boolean));
      const all = [...msgs, ...mfiles, ...ufiles, ...preds]
        .map(x => ({ ...x, created_at: x.created_at ?? x.updated_at ?? x.delivered_at ?? x.read_at ?? null }))
        .sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0));
      setItems(all);
    } catch (e) {
      // keep quiet to avoid noise; show compact UI error if needed
      setErr('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchMessages, fetchUserFiles, fetchPredictions, fetchMessageFiles]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filtered = useMemo(() => {
    let arr = items;
    if (filter === 'unread') {
      arr = items.filter(item => {
        if (item._type === 'message') {
          return !item.read_at; // Message is unread if no backend read_at
        } else {
          return !isLocallyRead(item._type, item.id); // File/prediction unread if not marked locally
        }
      });
    } else if (filter === 'messages') {
      arr = items.filter(x => x._type === 'message');
    } else if (filter === 'files') {
      arr = items.filter(x => x._type === 'message_file');
    } else if (filter === 'user_files') {
      arr = items.filter(x => x._type === 'user_file');
    } else if (filter === 'predictions') {
      arr = items.filter(x => x._type === 'prediction');
    }
    return arr.slice(0, page * pageSize);
  }, [items, filter, page, pageSize]);

  // Fixed: Only mark as read when actually accessing content
  function openItem(item) {
    // Navigate to the content without marking as read immediately
    if (item._type === 'message') {
      // Messages should be marked as read by the messages component when actually viewed
      router.push(`${dashboardUrl}?section=messages&messageId=${encodeURIComponent(item.id)}`);
      return;
    }
    
    if (item._type === 'prediction') {
      // Don't auto-mark predictions as read - let user do it manually
      router.push(`${dashboardUrl}?section=predictionHistory&predictionId=${encodeURIComponent(item.id)}`);
      return;
    }
    
    if (item._type === 'message_file' || item._type === 'user_file') {
      const url = resolveFileURL(apiBase, item, item._type);
      if (url) {
        // Only mark as read when actually opening/downloading the file
        markAsRead(item);
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  }

  // Explicit read status toggle
  async function toggleReadStatus(item, event) {
    event?.stopPropagation();
    
    const currentlyRead = isRead(item);
    
    try {
      if (item._type === 'message') {
        const token = getToken();
        const headers = { 'Content-Type': 'application/json', ...authHeader(token) };

        if (!currentlyRead) {
          // Mark as read
          await fetch(`${apiBase}/api/v1/messages/${item.id}/read`, { 
            method: 'PATCH', 
            headers 
          }).catch(() => {});
        }
        // Note: Backend doesn't seem to have "unread" endpoint
      } else {
        // For non-message items, toggle local read status
        setLocallyRead(item._type, item.id, !currentlyRead);
      }

      setItems(prev => prev.map(x => {
        if (x._type === item._type && x.id === item.id) {
          if (x._type === 'message') {
            return { ...x, read_at: currentlyRead ? null : (x.read_at || new Date().toISOString()) };
          }
          return { ...x };
        }
        return x;
      }));
    } catch {
      // Fallback to local storage
      setLocallyRead(item._type, item.id, !currentlyRead);
    }
  }

  async function markAsRead(item) {
    try {
      if (item._type === 'message') {
        const token = getToken();
        const headers = { 'Content-Type': 'application/json', ...authHeader(token) };

        // Try the correct backend endpoint for marking message as read
        await fetch(`${apiBase}/api/v1/messages/${item.id}/read`, { 
          method: 'PATCH', 
          headers 
        }).catch(() => {});
      } else {
        setLocallyRead(item._type, item.id, true);
      }

      setItems(prev => prev.map(x => {
        if (x._type === item._type && x.id === item.id) {
          if (x._type === 'message') return { ...x, read_at: x.read_at || new Date().toISOString() };
          return { ...x };
        }
        return x;
      }));
    } catch {
      setLocallyRead(item._type, item.id, true);
    }
  }

  // Mark all as read functionality
  const markAllAsRead = async () => {
    const unreadItems = items.filter(item => {
      if (item._type === 'message') {
        return !item.read_at; // Message unread if no read_at
      } else {
        return !isLocallyRead(item._type, item.id); // File/prediction unread if not marked locally
      }
    });

    for (const item of unreadItems) {
      if (item._type === 'message') {
        try {
          const token = getToken();
          const headers = { 'Content-Type': 'application/json', ...authHeader(token) };
          await fetch(`${apiBase}/api/v1/messages/${item.id}/read`, { 
            method: 'PATCH', 
            headers 
          }).catch(() => {});
        } catch {}
      } else {
        // Mark files and predictions as read locally
        setLocallyRead(item._type, item.id, true);
      }
    }

    // Update all items to read status in state
    setItems(prev => prev.map(item => ({
      ...item,
      read_at: item._type === 'message' ? (item.read_at || new Date().toISOString()) : item.read_at
    })));
  };

  // Debug function to clear all read states (useful for testing)
  const clearAllRead = () => {
    if (window.confirm('Clear all read states? This will mark all files and predictions as unread.')) {
      clearAllReadStates();
      // Refresh the page state
      setItems(prev => prev.map(item => ({
        ...item,
        // Don't modify message read_at as that comes from backend
      })));
    }
  };

  function isRead(item) {
    if (item._type === 'message') {
      // Messages are read if they have a read_at timestamp from the backend
      return !!item.read_at;
    } else {
      // Files and predictions are read only if explicitly marked in localStorage
      return isLocallyRead(item._type, item.id);
    }
  }

  function getIconForType(type) {
    switch (type) {
      case 'message': return <MessageSquare className="h-5 w-5" />;
      case 'message_file': return <Paperclip className="h-5 w-5" />;
      case 'user_file': return <FileText className="h-5 w-5" />;
      case 'prediction': return <BarChart3 className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  }

  function getIconColorForType(type) {
    switch (type) {
      case 'message': return isDark ? '#60A5FA' : '#3B82F6'; // Blue
      case 'message_file': return isDark ? '#F472B6' : '#EC4899'; // Pink
      case 'user_file': return isDark ? '#34D399' : '#10B981'; // Green
      case 'prediction': return isDark ? '#FBBF24' : '#F59E0B'; // Amber
      default: return isDark ? '#A78BFA' : '#8B5CF6'; // Purple
    }
  }

  function getIconBgForType(type) {
    const color = getIconColorForType(type);
    return `${color}15`; // ~15% alpha
  }

  const ItemTitle = ({ item }) => {
    if (item._type === 'message') {
      return (
        <div className="font-medium" style={{ color: theme.colors.text }}>
          New message
          {item.sender_id && <span className="text-sm opacity-75"> from #{item.sender_id}</span>}
        </div>
      );
    }
    if (item._type === 'message_file') {
      return (
        <div className="font-medium" style={{ color: theme.colors.text }}>
          New message attachment
          <span className="block text-sm mt-0.5 opacity-90">{item.original_name}</span>
        </div>
      );
    }
    if (item._type === 'user_file') {
      return (
        <div className="font-medium" style={{ color: theme.colors.text }}>
          New file uploaded
          <span className="block text-sm mt-0.5 opacity-90">
            {item.original_name} {item.category && <span className="opacity-75">({item.category})</span>}
          </span>
        </div>
      );
    }
    if (item._type === 'prediction') {
      return (
        <div className="font-medium" style={{ color: theme.colors.text }}>
          New prediction result
          <span className="block text-sm mt-0.5 opacity-90">{item.crop_name}</span>
        </div>
      );
    }
    return <div className="font-medium" style={{ color: theme.colors.text }}>Notification</div>;
  };

  const ItemContent = ({ item }) => {
    if (item._type === 'message' && item.text) {
      const preview = item.text.length > 100 ? `${item.text.slice(0, 100)}...` : item.text;
      return (
        <div className="mt-1 text-sm opacity-80" style={{ color: theme.colors.text }}>
          {preview}
        </div>
      );
    }
    if ((item._type === 'message_file' || item._type === 'user_file') && item.size_bytes) {
      return (
        <div className="mt-1 text-sm opacity-70" style={{ color: theme.colors.text }}>
          Size: {bytes(item.size_bytes)}
        </div>
      );
    }
    if (item._type === 'prediction' && item.suitability_score !== null && item.suitability_score !== undefined) {
      const score = Math.round(item.suitability_score * 100);
      let color;
      if (score > 70) color = isDark ? '#4ADE80' : '#22C55E';
      else if (score > 40) color = isDark ? '#FBBF24' : '#F59E0B';
      else color = isDark ? '#F87171' : '#EF4444';

      return (
        <div className="mt-1 text-sm flex items-center gap-2" style={{ color: theme.colors.text }}>
          <span className="opacity-70">Suitability:</span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden max-w-[100px]">
            <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
          </div>
          <span style={{ color }}>{score}%</span>
        </div>
      );
    }
    return null;
  };

  const unreadCount = useMemo(() => {
    return items.filter(item => {
      if (item._type === 'message') {
        return !item.read_at; // Message is unread if no read_at timestamp
      } else {
        return !isLocallyRead(item._type, item.id); // File/prediction is unread if not in localStorage
      }
    }).length;
  }, [items]);

  async function refresh() {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }

  const FilterDropdown = () => (
    <div className="relative">
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          color: theme.colors.text,
        }}
      >
        <Filter className="h-4 w-4" />
        <select
          value={filter}
          onChange={e => { setPage(1); setFilter(e.target.value); }}
          className="appearance-none bg-transparent border-0 p-0 pr-6 focus:outline-none text-sm"
          style={{ color: theme.colors.text }}
        >
          <option value="all">All notifications</option>
          <option value="unread">Unread only</option>
          <option value="messages">Messages</option>
          <option value="files">Message Attachments</option>
          <option value="user_files">Farmer/Adviser Files</option>
          <option value="predictions">Predictions</option>
        </select>
      </div>
    </div>
  );

  if (!canSee) {
    return (
      <div
        className="p-8 text-center rounded-lg"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.text,
        }}
      >
        <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-medium mb-2">Sign in to view notifications</h3>
        <p className="text-sm opacity-75">You must be logged in to access your notifications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Back */}
        <button
          onClick={() => router.push('/profile/Dashboard')}
          className="flex items-center gap-1 px-3 py-1.5 rounded mr-3 transition-colors"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            color: theme.colors.text,
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex items-center gap-3 flex-1">
          <div
            className="p-2 rounded-full"
            style={{
              backgroundColor: isDark ? 'rgba(147,51,234,0.15)' : 'rgba(147,51,234,0.1)',
              color: isDark ? '#C084FC' : '#9333EA',
            }}
          >
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: theme.colors.text }}>Notifications</h2>
            {!loading && (
              <div className="text-xs opacity-75" style={{ color: theme.colors.text }}>
                {items.length} total • {unreadCount} unread
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FilterDropdown />
          
          {/* Mark All as Read */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm"
              style={{
                backgroundColor: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.05)',
                border: `1px solid ${isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)'}`,
                color: isDark ? '#4ADE80' : '#22C55E',
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark all read ({unreadCount})
            </button>
          )}
          
          {/* Debug: Clear Read States */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={clearAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm"
              style={{
                backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)',
                border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)'}`,
                color: isDark ? '#F87171' : '#EF4444',
              }}
              title="Development only: Clear all read states"
            >
              <CircleX className="h-4 w-4" />
              Clear Read
            </button>
          )}
          
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              color: theme.colors.text,
            }}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error display */}
      {err && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {err}
        </div>
      )}

      {/* List */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
          boxShadow: isDark ? '0 4px 6px -1px rgba(0,0,0,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
        }}
      >
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin opacity-40" style={{ color: theme.colors.primary }} />
            <p className="text-sm opacity-75" style={{ color: theme.colors.text }}>Loading notifications...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-25" style={{ color: theme.colors.text }} />
            <p className="text-sm opacity-75" style={{ color: theme.colors.text }}>You don't have any notifications yet.</p>
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            {filtered.map((item) => {
              const read = isRead(item);
              const iconColor = getIconColorForType(item._type);
              const iconBg = getIconBgForType(item._type);

              return (
                <li
                  key={`${item._type}:${item.id}`}
                  className="p-4 cursor-pointer transition-colors duration-150 relative"
                  style={{
                    backgroundColor: !read
                      ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(249,250,251,1)')
                      : 'transparent',
                  }}
                  onClick={() => openItem(item)}
                  role="button"
                >
                  {!read && (
                    <span
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                  )}

                  <div className="flex items-start gap-4 pl-1">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: iconBg, color: iconColor }}
                    >
                      {getIconForType(item._type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <ItemTitle item={item} />
                      <ItemContent item={item} />

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <div className="flex items-center text-xs opacity-60" style={{ color: theme.colors.text }}>
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(item.created_at)}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => toggleReadStatus(item, e)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: read
                                ? (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)')
                                : (isDark ? 'rgba(156,163,175,0.15)' : 'rgba(156,163,175,0.1)'),
                              border: `1px solid ${read
                                ? (isDark ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.2)')
                                : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                              color: read
                                ? (isDark ? '#4ADE80' : '#22C55E')
                                : theme.colors.text,
                            }}
                          >
                            {read ? <CircleX className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            {read ? 'Mark unread' : 'Mark read'}
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); openItem(item); }}
                            className="p-1 rounded opacity-70 hover:opacity-100"
                            style={{ color: theme.colors.text }}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Load more */}
      {filtered.length < items.length && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-5 py-2 rounded-full text-sm transition-colors"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              color: theme.colors.text,
            }}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

/* ----------------------- Bell with badge (exported) ----------------------- */

export function NotificationBell({
  apiBase = API_BASE,
  className = '',
  onClick,
}) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const loadCount = useCallback(async () => {
    if (!user?.id) { setCount(0); return; }
    const token = getToken();
    const headers = authHeader(token);

    // Get messages, user files, and predictions
    const [msgs, ufiles, preds] = await Promise.all([
      firstList([
        `${apiBase}/api/v1/messages/user/${encodeURIComponent(user.id)}?page=1&limit=100`,
      ], headers),
      firstList([
        `${apiBase}/api/v1/user-files/farmer/${encodeURIComponent(user.id)}?limit=100`,
        `${apiBase}/api/v1/user-files?farmer_id=${encodeURIComponent(user.id)}&limit=100`,
      ], headers),
      firstList([
        `${apiBase}/api/v1/predictions/user/${encodeURIComponent(user.id)}?page=1&limit=100`,
        `${apiBase}/api/v1/predictions?user_id=${encodeURIComponent(user.id)}&limit=100`,
      ], headers),
    ]);

    // Count unread items using the same logic as the main component
    let unreadCount = 0;

    // Unread messages (those without read_at from backend)
    const msgUnread = (msgs || []).filter(m => !m.read_at && !m.readAt).length;
    unreadCount += msgUnread;

    // Unread user files (those not marked as read locally)
    const ufileUnread = (ufiles || []).filter(u => !isLocallyRead('user_file', u.id)).length;
    unreadCount += ufileUnread;

    // Unread predictions (those not marked as read locally)
    const predUnread = (preds || []).filter(p => !isLocallyRead('prediction', p.id)).length;
    unreadCount += predUnread;

    setCount(unreadCount);
  }, [apiBase, user?.id]);

  useEffect(() => { loadCount(); }, [loadCount]);

  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center justify-center ${className}`}
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] leading-4 text-white bg-rose-600 text-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}