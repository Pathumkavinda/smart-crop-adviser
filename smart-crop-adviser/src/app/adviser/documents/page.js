'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { User, ArrowLeft, FileText } from 'lucide-react';

// ✅ Import the real component (already rewired to /api/v1/user-files)
import DocumentsForAdvisers from '@/components/document-for-adviser';

const RAW_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = RAW_API.replace(/\/+$/, '');

const authHeader = (token) => (token ? { Authorization: `Bearer ${token}` } : {});
const safeJSON = async (res) => { try { return await res.json(); } catch { return null; } };

export default function DocumentsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { user: authUser } = useAuth();

  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState('');

  const farmerIdParam = useMemo(() => {
    const fid = params?.get('farmerId');
    return fid ? Number(fid) : null;
  }, [params]);

  // Try load from localStorage first, then fetch by URL param
  useEffect(() => {
    let isAlive = true;
    (async () => {
      setLoading(true);
      setFetchErr('');

      // 1) Try cache
      let cached = null;
      try {
        const raw = localStorage.getItem('adviser_docs_selected_farmer');
        if (raw) cached = JSON.parse(raw);
      } catch {}

      if (cached && (!farmerIdParam || Number(cached?.id) === farmerIdParam)) {
        if (!isAlive) return;
        setFarmer(cached);
        setLoading(false);
        return;
      }

      // 2) If we have a farmerId in URL, try to fetch that profile
      if (farmerIdParam) {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          // Prefer direct fetch; fallback to list then filter
          let res = await fetch(`${API_URL}/api/v1/users/${farmerIdParam}`, { headers: authHeader(token) });
          if (!res.ok) {
            res = await fetch(`${API_URL}/api/v1/users?userlevel=farmer`, { headers: authHeader(token) });
          }
          if (res.ok) {
            const body = await safeJSON(res);
            const data = body?.data ?? body ?? [];
            const found = Array.isArray(data)
              ? data.find(u => Number(u.id ?? u.user_id ?? u._id) === farmerIdParam)
              : data;

            if (found) {
              const shaped = {
                id: found.id ?? found.user_id ?? found._id,
                name: found.name ?? found.fullname ?? found.username ?? found.email ?? `User ${found.id ?? ''}`,
                email: found.email ?? '',
                district: found.district ?? found.address ?? '—',
                avatar: found.avatar ?? found.photo_url ?? null,
              };
              try { localStorage.setItem('adviser_docs_selected_farmer', JSON.stringify(shaped)); } catch {}
              if (!isAlive) return;
              setFarmer(shaped);
              setLoading(false);
              return;
            }
          }
          throw new Error('Farmer not found');
        } catch (e) {
          console.error('fetch farmer by id:', e);
          if (!isAlive) return;
          setFetchErr('Could not load the selected farmer profile.');
          setLoading(false);
          return;
        }
      }

      // 3) Neither cache nor URL param — show hint
      if (!isAlive) return;
      setLoading(false);
    })();

    return () => { isAlive = false; };
  }, [farmerIdParam]);

  const TopBar = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="px-3 py-2 rounded-md hover:opacity-90"
          style={{ backgroundColor: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
        >
          <ArrowLeft size={16} className="inline mr-1" /> Back
        </button>
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.text }}>Documents for Advisers</h1>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col">
        {TopBar}
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.colors.primary }} />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {TopBar}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Farmer banner / selector hint */}
        <div
          className="rounded-lg shadow p-4"
          style={{ backgroundColor: theme.colors.card, color: theme.colors.text, border: `1px solid ${theme.colors.border}` }}
        >
          {farmer ? (
            <div className="flex items-center">
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
              >
                {farmer.avatar
                  ? <img src={farmer.avatar} alt={farmer.name} className="h-12 w-12 rounded-full object-cover" />
                  : <User size={24} style={{ opacity: 0.6 }} />}
              </div>
              <div className="ml-4">
                <div className="font-semibold">{farmer.name}</div>
                <div className="text-sm opacity-70">
                  {farmer.email || '—'} {farmer.district ? ` • ${farmer.district}` : ''}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => {
                    try { localStorage.removeItem('adviser_docs_selected_farmer'); } catch {}
                    window.location.href = '/adviser?pick=1';
                  }}
                  className="px-3 py-2 rounded-md hover:opacity-90"
                  style={{ backgroundColor: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
                >
                  Change Farmer
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm">
                No farmer selected. Please go back and click <strong>Add Record</strong> to choose a farmer profile.
              </div>
              <Link
                href="/adviser"
                className="inline-flex items-center px-3 py-2 rounded-md text-white hover:opacity-90"
                style={{ backgroundColor: theme.colors.primary }}
              >
                Go to Adviser Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Documents component area */}
        <div
          className="rounded-lg shadow p-4"
          style={{ backgroundColor: theme.colors.card, color: theme.colors.text, border: `1px solid ${theme.colors.border}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={18} />
              <h2 className="text-lg font-semibold">Farmer Documents</h2>
            </div>
            {fetchErr && (
              <div className="text-sm px-2 py-1 rounded"
                   style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}>
                {fetchErr}
              </div>
            )}
          </div>

          {/* ✅ Real component mounted here (Adviser has full CRUD) */}
          <DocumentsForAdvisers
            adviserId={authUser?.id}
            farmerId={farmer?.id}
            farmer={farmer}
            apiBase={API_URL}
            readOnly={false}
          />
        </div>
      </div>
    </div>
  );
}
