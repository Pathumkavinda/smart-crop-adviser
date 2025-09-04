'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Filter, X, AlertTriangle, ChevronLeft, ChevronRight, Eye,
  ArrowUpRight, RefreshCw
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useTheme } from '@/context/ThemeContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Admin Predictions - Same styling and NO crop-name filter
 * Theme is fully controlled by the global ThemeContext (navbar toggle).
 */
export default function AdminPredictions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme?.name === 'dark';

  // ---- THEME TOKENS (from global theme only) ----
  const themeClasses = useMemo(() => ({
    background: isDark ? 'bg-[#0b1220]' : 'bg-gray-50',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    card: isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-gray-200',
    cardDarker: isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-gray-50 border-gray-200',
    input: isDark ? 'bg-slate-900 text-gray-100 border-slate-600 placeholder-slate-400' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-400',
    button: isDark ? 'bg-slate-900 border-slate-600 text-gray-200 hover:bg-slate-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
    tableHeader: isDark ? 'bg-slate-800/80' : 'bg-gray-50',
    tableRow: isDark ? 'hover:bg-slate-800/60 divide-slate-700' : 'hover:bg-gray-50 divide-gray-200',
    textSecondary: isDark ? 'text-slate-400' : 'text-gray-600',
    textAccent: isDark ? 'text-indigo-400' : 'text-indigo-600'
  }), [isDark]);

  // ---- DATA STATE ----
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  // Filters (username + date range ONLY; crop removed)
  const [filters, setFilters] = useState({
    username: '',
    date_from: '',
    date_to: ''
  });

  // Detail
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Inline user info panel (detail)
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [detailUserLoading, setDetailUserLoading] = useState(false);
  const [detailUserError, setDetailUserError] = useState('');

  // Endpoint fallbacks for lists/details
  const LIST_ENDPOINTS = useMemo(
    () => [
      `${API_URL}/api/v1/predictions`,
      `${API_URL}/api/v1/predictions/history`,
      `${API_URL}/api/v1/prediction-history`,
      `${API_URL}/api/v1/predictions/all`
    ],
    []
  );
  const detailEndpointsFor = useCallback(
    (id) => [
      `${API_URL}/api/v1/predictions/${id}`,
      `${API_URL}/api/v1/prediction-history/${id}`,
    ],
    []
  );

  const authHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Redirect if not authed
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) router.push('/login');
  }, [router]);

  // Deep-link detail by id
  useEffect(() => {
    const id = searchParams?.get('id');
    if (id) fetchPredictionById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ============================ FETCH: DETAIL ============================ */
  const fetchPredictionById = useCallback(
    async (id) => {
      try {
        setError(null);
        setLoading(true);
        setUserPanelOpen(false);
        setDetailUser(null);

        const endpoints = detailEndpointsFor(id);
        let found = null;
        for (const url of endpoints) {
          const res = await fetch(url, { headers: { ...authHeaders() } });
          if (!res.ok) continue;
          const data = await res.json();
          const normalized = normalizeDetailResponse(data);
          if (normalized) { found = normalized; break; }
        }
        if (!found) throw new Error('Prediction not found');

        setSelectedPrediction(found);
        setShowDetail(true);

        // Ensure full user record (userlevel/address/landsize/dates)
        if (found.user) {
          setDetailUser(found.user);
        } else if (found.user_id) {
          const u = await safeFetchUserById(found.user_id, authHeaders);
          if (u) setDetailUser(u);
        }
      } catch (err) {
        console.error('Error fetching prediction by id:', err);
        setError(err.message || 'Failed to load prediction');
      } finally {
        setLoading(false);
      }
    },
    [authHeaders, detailEndpointsFor]
  );

  const safeFetchUserById = async (userId, authHeadersFn) => {
    const headers = { ...authHeadersFn() };
    const tryJSON = async (url) => {
      const res = await fetch(url, { headers });
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      return data?.data || data?.user || data;
    };

    try {
      setDetailUserLoading(true);
      setDetailUserError('');

      // 1) /users/:id
      let u = await tryJSON(`${API_URL}/api/v1/users/${userId}`);
      if (u?.id) return u;

      // 2) /users?id=:id
      u = await tryJSON(`${API_URL}/api/v1/users?id=${userId}`);
      if (u?.id) return u;

      // 3) list then find
      const list = await tryJSON(`${API_URL}/api/v1/users?limit=1000`);
      const rows = Array.isArray(list?.data) ? list.data : Array.isArray(list) ? list : [];
      const found = rows.find((r) => String(r.id) === String(userId));
      return found || null;
    } catch (e) {
      setDetailUserError('Failed to load user info.');
      return null;
    } finally {
      setDetailUserLoading(false);
    }
  };

  /* ============================ FETCH: LIST ============================= */
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (filters.username) params.set('username', filters.username);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    return `?${params.toString()}`;
  }, [page, limit, filters]);

  const fetchPredictions = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError(null);

        const query = buildQuery();
        let list = null;
        let metaTotal = 0;

        for (const base of LIST_ENDPOINTS) {
          const url = `${base}${query}`;
          const res = await fetch(url, { headers: { ...authHeaders() }, signal });
          if (!res.ok) continue;
          const data = await res.json();
          const normalized = normalizeListResponse(data);
          if (normalized.items.length > 0 || normalized.total !== 0 || Array.isArray(data)) {
            list = normalized.items;
            metaTotal = normalized.total;
            break;
          }
        }

        // Client-side fallback by username only
        const filtered = (() => {
          if (!filters.username) return list || [];
          const term = filters.username.trim().toLowerCase();
          return (list || []).filter((it) => {
            const un = it?.user?.username ?? it?.username ?? it?.user_name ?? '';
            return String(un).toLowerCase().includes(term);
          });
        })();

        setPredictions(filtered);
        setTotal(metaTotal || filtered.length);
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.error('Error fetching predictions:', err);
          setError(err.message || 'Failed to fetch predictions');
        }
      } finally {
        setLoading(false);
      }
    },
    [LIST_ENDPOINTS, buildQuery, authHeaders, filters.username]
  );

  // Re-fetch whenever pagination/filters change (and not in detail)
  useEffect(() => {
    if (showDetail) return;
    const controller = new AbortController();
    fetchPredictions(controller.signal);
    return () => controller.abort();
  }, [fetchPredictions, showDetail, page, limit, filters]);

  // Filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ username: '', date_from: '', date_to: '' });
    setPage(1);
  };

  // Detail toggles
  const viewPredictionDetails = (prediction) => {
    setSelectedPrediction(prediction);
    setShowDetail(true);
    setUserPanelOpen(false);
    setDetailUser(prediction?.user || null);
    setDetailUserError('');
    if (!prediction?.user && prediction?.user_id) {
      safeFetchUserById(prediction.user_id, authHeaders).then((u) => u && setDetailUser(u));
    }
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('id', prediction?.id);
      window.history.pushState({}, '', url.toString());
    }
  };

  const backToList = () => {
    setShowDetail(false);
    setSelectedPrediction(null);
    setUserPanelOpen(false);
    setDetailUser(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.pushState({}, '', url.toString());
    }
  };

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 20)));
  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total || predictions.length || 0);

  /* ============================== RENDER: DETAIL ============================== */
  if (showDetail && selectedPrediction) {
    const u = detailUser || selectedPrediction?.user || null;
    const userLevel = (u?.userlevel || selectedPrediction?.userlevel || '').toString().toLowerCase();

    return (
      <AdminLayout>
        <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} px-4 md:px-6 lg:px-8 py-6`}>
          <button
            onClick={backToList}
            className={`mb-6 inline-flex items-center ${themeClasses.textAccent} hover:text-indigo-300`}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Predictions List
          </button>

          <div className={`${themeClasses.card} rounded-2xl border shadow-2xl overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold">Prediction #{selectedPrediction?.id}</h2>
              <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
                Created on {formatDate(selectedPrediction?.created_at)}
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Information */}
                <div className={`${themeClasses.cardDarker} p-4 rounded-xl border`}>
                  <h3 className="text-lg font-medium mb-3">User Information</h3>
                  {u ? (
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-900/50 flex items-center justify-center text-indigo-200 font-semibold text-sm">
                          {(u?.username?.charAt(0) || '?').toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{u?.username}</p>
                          <p className={`text-xs ${themeClasses.textSecondary}`}>{u?.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <InfoKV label="User ID" value={u?.id ?? selectedPrediction?.user_id ?? '—'} themeClasses={themeClasses} />
                        <div>
                          <p className={themeClasses.textSecondary}>User Level:</p>
                          <span className={`mt-1 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${levelPill(userLevel)}`}>
                            {u?.userlevel || selectedPrediction?.userlevel || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className={themeClasses.textSecondary}>User ID: {selectedPrediction?.user_id ?? 'Unknown'}</p>
                      {!!selectedPrediction?.user_id && (
                        <button
                          onClick={async () => {
                            setUserPanelOpen(true);
                            const fetched = await safeFetchUserById(selectedPrediction.user_id, authHeaders);
                            if (fetched) setDetailUser(fetched);
                          }}
                          className={`mt-2 ${themeClasses.textAccent} text-sm inline-flex items-center hover:underline`}
                        >
                          Load User <ArrowUpRight className="ml-1 h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Prediction Information (includes location) */}
                <div className={`${themeClasses.cardDarker} p-4 rounded-xl border`}>
                  <h3 className="text-lg font-medium mb-3">Prediction Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoKV label="Crop Name" value={selectedPrediction?.crop_name || selectedPrediction?.crop || 'Not specified'} strong themeClasses={themeClasses} />
                    <InfoKV label="Prediction ID" value={`#${selectedPrediction?.id}`} themeClasses={themeClasses} />
                    <InfoKV label="District" value={selectedPrediction?.district || 'Not specified'} themeClasses={themeClasses} />
                    <InfoKV label="Soil Type" value={selectedPrediction?.soil_type || 'Not specified'} themeClasses={themeClasses} />
                    <InfoKV label="Agro-Ecological Zone" value={selectedPrediction?.agro_ecological_zone || 'Not specified'} themeClasses={themeClasses} />
                    <InfoKV label="Cultivate Season" value={selectedPrediction?.cultivate_season || 'Not specified'} themeClasses={themeClasses} />
                    <InfoKV label="Created" value={formatDate(selectedPrediction?.created_at)} themeClasses={themeClasses} />
                    <InfoKV label="Updated" value={formatDate(selectedPrediction?.updated_at)} themeClasses={themeClasses} />
                  </div>
                </div>
              </div>

              {/* Soil Parameters */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Soil Parameters</h3>
                <div className={`${themeClasses.cardDarker} p-4 rounded-xl border`}>
                  {(() => { const s = extractSoil(selectedPrediction); return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['n','p','k','ph'].map((key) => (
                        <Metric key={key} label={labelFor(key)} value={fmtSoilVal(s[key])} themeClasses={themeClasses} />
                      ))}
                    </div>
                  ); })()}

                  {(() => { const s = extractSoil(selectedPrediction); return (
                    (s.temperature !== null || s.humidity !== null || s.rainfall !== null) ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {s.temperature !== null && <Metric label="Temperature" value={fmtSoilVal(s.temperature)} themeClasses={themeClasses} />}
                        {s.humidity !== null && <Metric label="Humidity" value={fmtSoilVal(s.humidity)} themeClasses={themeClasses} />}
                        {s.rainfall !== null && <Metric label="Rainfall" value={fmtSoilVal(s.rainfall)} themeClasses={themeClasses} />}
                      </div>
                    ) : null
                  ); })()}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      const next = !userPanelOpen;
                      setUserPanelOpen(next);
                      if (next && selectedPrediction?.user_id) {
                        const fetched = await safeFetchUserById(selectedPrediction.user_id, authHeaders);
                        if (fetched) setDetailUser(fetched);
                      }
                    }}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium ${themeClasses.button}`}
                  >
                    {userPanelOpen ? 'Hide User' : 'View User'}
                  </button>
                  {!!selectedPrediction?.user_id && (
                    <button
                      onClick={() => router.push(`/admin/users?id=${selectedPrediction?.user_id}`)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium ${themeClasses.button}`}
                    >
                      Open User Page
                    </button>
                  )}
                </div>

                <button
                  onClick={backToList}
                  className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                >
                  Back to List
                </button>
              </div>

              {/* Inline User Info Panel */}
              {userPanelOpen && (
                <div className={`mt-6 ${themeClasses.card} rounded-2xl border shadow-xl overflow-hidden`}>
                  <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                    <h3 className="text-lg font-semibold">User Details</h3>
                  </div>
                  <div className="p-6">
                    {detailUserLoading ? (
                      <p className={`text-sm ${themeClasses.textSecondary}`}>Loading user...</p>
                    ) : detailUserError ? (
                      <p className="text-sm text-red-400">{detailUserError}</p>
                    ) : detailUser ? (
                      <UserDetailsCard user={detailUser} themeClasses={themeClasses} />
                    ) : (
                      <p className={`text-sm ${themeClasses.textSecondary}`}>No user information available.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  /* =============================== RENDER: LIST ============================== */
  return (
    <AdminLayout>
      <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} px-4 md:px-6 lg:px-8 py-6`}>
        {/* Header (no page-level theme toggle) */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Prediction History</h1>
            <p className={themeClasses.textSecondary}>View and filter all crop prediction records</p>
          </div>
        </div>

        {/* Filter Bar (USERNAME + DATE RANGE ONLY) */}
        <div className={`${themeClasses.card} rounded-2xl border shadow-2xl mb-6 overflow-hidden`}>
          <form onSubmit={applyFilters} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput
                id="username" name="username" label="Username"
                placeholder="Filter by username"
                value={filters.username} onChange={handleFilterChange}
                themeClasses={themeClasses}
              />
              <DateInput id="date_from" name="date_from" label="Date From" value={filters.date_from} onChange={handleFilterChange} themeClasses={themeClasses} />
              <DateInput id="date_to" name="date_to" label="Date To" value={filters.date_to} onChange={handleFilterChange} themeClasses={themeClasses} />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className={`inline-flex items-center justify-center px-4 py-2 rounded-lg border ${themeClasses.button}`}
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        {loading ? (
          <div className={`${themeClasses.card} rounded-2xl border shadow-2xl p-8 text-center`}>
            <div className="h-10 w-10 border-4 border-t-indigo-600 border-r-transparent border-b-indigo-600 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={themeClasses.textSecondary}>Loading predictions...</p>
          </div>
        ) : error ? (
          <div className={`${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} rounded-2xl border shadow-2xl p-6 ${isDark ? 'text-red-200' : 'text-red-700'}`}>
            <h3 className="font-semibold flex items-center mb-2">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Error Loading Predictions
            </h3>
            <p className="mb-2">{error}</p>
            <button
              onClick={() => {
                const controller = new AbortController();
                fetchPredictions(controller.signal);
              }}
              className="mt-2 px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 inline-flex items-center shadow-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        ) : predictions.length === 0 ? (
          <div className={`${themeClasses.card} rounded-2xl border shadow-2xl p-8 text-center`}>
            <p className={`${themeClasses.textSecondary} mb-4`}>No predictions found matching your criteria.</p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={`${themeClasses.card} rounded-2xl border shadow-2xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-200'}`}>
                <thead className={`${themeClasses.tableHeader} sticky top-0 z-10`}>
                  <tr>
                    <Th themeClasses={themeClasses}>ID</Th>
                    <Th themeClasses={themeClasses}>Crop</Th>
                    <Th themeClasses={themeClasses}>User</Th>
                    <Th themeClasses={themeClasses}>Location</Th>
                    <Th themeClasses={themeClasses}>Soil Parameters</Th>
                    <Th themeClasses={themeClasses}>Date</Th>
                    <ThRight themeClasses={themeClasses}>Actions</ThRight>
                  </tr>
                </thead>
                <tbody className={`bg-transparent divide-y ${themeClasses.tableRow}`}>
                  {predictions.map((prediction) => (
                    <tr key={prediction?.id} className={`${themeClasses.tableRow} transition-colors`}>
                      <Td themeClasses={themeClasses}>
                        <span className={`text-sm ${themeClasses.textSecondary}`}>#{prediction?.id}</span>
                      </Td>

                      <Td themeClasses={themeClasses}>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-900/40 flex items-center justify-center">
                            <span className="text-xs text-green-200">
                              {(prediction?.crop_name?.[0] || prediction?.crop?.[0] || '?').toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">
                              {prediction?.crop_name || prediction?.crop || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </Td>

                      <Td themeClasses={themeClasses}>
                        {prediction?.user ? (
                          <div>
                            <div className="text-sm font-medium">
                              {prediction?.user?.username}
                            </div>
                            <div className={`text-xs ${themeClasses.textSecondary}`}>{prediction?.user?.email}</div>
                          </div>
                        ) : (
                          <span className={`text-sm ${themeClasses.textSecondary}`}>
                            {prediction?.username ? prediction.username : `User #${prediction?.user_id}`}
                          </span>
                        )}
                      </Td>

                      <Td themeClasses={themeClasses}>
                        <div className="text-sm">
                          <div className="font-medium">{prediction?.district || 'Not specified'}</div>
                          <div className={`text-xs ${themeClasses.textSecondary}`}>
                            {prediction?.agro_ecological_zone || 'Zone not specified'}
                          </div>
                          <div className={`text-xs ${themeClasses.textSecondary}`}>
                            {prediction?.soil_type || 'Soil type not specified'}
                          </div>
                        </div>
                      </Td>

                      <Td themeClasses={themeClasses}>
                        <div className={`text-sm ${themeClasses.text}`}>
                          {(() => { const s = extractSoil(prediction); return (
                            <>
                              <Chip label={`N: ${fmtSoilVal(s.n)}`} color="blue" />
                              <Chip label={`P: ${fmtSoilVal(s.p)}`} color="green" />
                              <Chip label={`K: ${fmtSoilVal(s.k)}`} color="yellow" />
                              <Chip label={`pH: ${fmtSoilVal(s.ph)}`} color="purple" />
                            </>
                          ); })()}
                        </div>
                      </Td>

                      <Td themeClasses={themeClasses}>
                        <span className={`text-sm ${themeClasses.textSecondary}`}>{formatDate(prediction?.created_at)}</span>
                      </Td>

                      <TdRight themeClasses={themeClasses}>
                        <button
                          onClick={() => viewPredictionDetails(prediction)}
                          className={`${themeClasses.textAccent} hover:text-indigo-300 inline-flex items-center justify-end`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </TdRight>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-200'} px-4 py-3 flex items-center justify-between border-t`}>
                <div className="hidden sm:block">
                  <p className={`text-sm ${themeClasses.text}`}>
                    Showing <span className="font-medium">{startIdx}</span> to{' '}
                    <span className="font-medium">{endIdx}</span> of{' '}
                    <span className="font-medium">{total || predictions.length}</span> results
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden md:block">
                    <select
                      value={limit}
                      onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
                      className={`border rounded-md text-sm p-1 ${themeClasses.input}`}
                    >
                      {[10, 20, 30, 50, 100].map(n => (
                        <option key={n} value={n}>{n} per page</option>
                      ))}
                    </select>
                  </div>

                  <PageBtn disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} position="left" themeClasses={themeClasses}>
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </PageBtn>

                  {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNum
                            ? 'z-10 bg-indigo-900/40 border-indigo-500 text-indigo-200'
                            : `${themeClasses.button}`
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && (
                    <>
                      <span className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${themeClasses.button}`}>
                        ...
                      </span>
                      <button
                        onClick={() => setPage(totalPages)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === totalPages
                            ? 'z-10 bg-indigo-900/40 border-indigo-500 text-indigo-200'
                            : `${themeClasses.button}`
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <PageBtn disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} position="right" themeClasses={themeClasses}>
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </PageBtn>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

/* --------------------------------- Helpers -------------------------------- */

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  try {
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return d.toISOString();
  }
}

function labelFor(key) {
  const map = { n: 'Nitrogen (N)', p: 'Phosphorus (P)', k: 'Potassium (K)', ph: 'pH Level' };
  return map[key] || key;
}

// Normalize list responses from various backends
function normalizeListResponse(data) {
  if (Array.isArray(data)) return { items: data, total: data.length };
  if (data?.success && Array.isArray(data?.data)) return { items: data.data, total: data?.meta?.total ?? data.data.length };
  if (Array.isArray(data?.data?.rows)) return { items: data.data.rows, total: data.data.total ?? data.data.rows.length };
  if (Array.isArray(data?.rows)) return { items: data.rows, total: data.total ?? data.rows.length };
  if (Array.isArray(data?.items)) return { items: data.items, total: data.total ?? data.items.length };
  if (data && typeof data === 'object') {
    const vals = Object.values(data).find(Array.isArray) || [];
    return { items: Array.isArray(vals) ? vals : [], total: (Array.isArray(vals) ? vals.length : 0) };
  }
  return { items: [], total: 0 };
}

// Normalize detail response
function normalizeDetailResponse(data) {
  if (!data) return null;
  if (data?.success && data?.data) return data.data;
  if (data?.prediction) return data.prediction;
  if (data?.item) return data.item;
  if (data?.data?.item) return data.data.item;
  if (data?.id) return data;
  return null;
}

/** Extract soil params (aligned to typical prediction_history columns) */
function extractSoil(pred) {
  if (!pred || typeof pred !== 'object') {
    return { n: null, p: null, k: null, ph: null, temperature: null, humidity: null, rainfall: null };
  }
  const direct = {
    n: pred.n ?? pred.N ?? pred.nitrogen ?? pred.Nitrogen ?? pred.N_value ?? null,
    p: pred.p ?? pred.P ?? pred.phosphorus ?? pred.Phosphorus ?? pred.phosphate ?? null,
    k: pred.k ?? pred.K ?? pred.potassium ?? pred.Potassium ?? pred.K_value ?? null,
    ph: pred.ph ?? pred.pH ?? pred.PH ?? pred.soil_ph ?? pred.soilPH ?? pred.soil_ph_level ?? null,
    temperature: pred.temperature ?? pred.temp ?? pred.soil_temp ?? null,
    humidity: pred.humidity ?? pred.avg_humidity ?? pred.soil_humidity ?? null,
    rainfall: pred.rainfall ?? pred.avg_rainfall ?? pred.rain ?? pred.precipitation ?? null,
  };

  const hasDirect = ['n','p','k','ph','temperature','humidity','rainfall']
    .some((k) => direct[k] !== null && direct[k] !== undefined);
  if (hasDirect) return direct;

  const candidates = [
    pred.input_data, pred.inputs, pred.params, pred.parameters, pred.soil,
    pred.meta?.input, pred.data, pred.payload,
  ].filter(Boolean);

  const out = { ...direct };
  for (const obj of candidates) {
    if (!obj || typeof obj !== 'object') continue;
    out.n = out.n ?? obj.n ?? obj.N ?? obj.nitrogen ?? obj.Nitrogen ?? obj.N_value ?? null;
    out.p = out.p ?? obj.p ?? obj.P ?? obj.phosphorus ?? obj.Phosphorus ?? obj.phosphate ?? null;
    out.k = out.k ?? obj.k ?? obj.K ?? obj.potassium ?? obj.Potassium ?? obj.K_value ?? null;
    out.ph = out.ph ?? obj.ph ?? obj.pH ?? obj.PH ?? obj.soil_ph ?? obj.soilPH ?? obj.soil_ph_level ?? null;
    out.temperature = out.temperature ?? obj.temperature ?? obj.temp ?? obj.soil_temp ?? null;
    out.humidity = out.humidity ?? obj.humidity ?? obj.avg_humidity ?? obj.soil_humidity ?? null;
    out.rainfall = out.rainfall ?? obj.rainfall ?? obj.avg_rainfall ?? obj.rain ?? obj.precipitation ?? null;
  }
  return out;
}

function fmtSoilVal(v) {
  if (v === null || v === undefined || v === '') return '?';
  const num = Number(v);
  return Number.isFinite(num) ? String(num) : String(v);
}

/* ------------------------------- Small UI Bits ------------------------------ */

function Th({ children, themeClasses }) {
  return (
    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider`}>
      {children}
    </th>
  );
}

function ThRight({ children, themeClasses }) {
  return (
    <th scope="col" className={`px-6 py-3 text-right text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider`}>
      {children}
    </th>
  );
}

function Td({ children, themeClasses }) {
  return <td className={`px-6 py-4 whitespace-nowrap text-left text-sm ${themeClasses.text}`}>{children}</td>;
}

function TdRight({ children, themeClasses }) {
  return <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${themeClasses.text}`}>{children}</td>;
}

function Chip({ label, color }) {
  const colorMap = {
    blue: 'bg-blue-900/40 text-blue-200',
    green: 'bg-green-900/40 text-green-200',
    yellow: 'bg-yellow-900/40 text-yellow-200',
    purple: 'bg-purple-900/40 text-purple-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-1 ${colorMap[color] || ''}`}>
      {label}
    </span>
  );
}

function TextInput({ id, name, label, value, onChange, placeholder, themeClasses }) {
  return (
    <div>
      <label htmlFor={id} className={`block text-sm font-medium ${themeClasses.text} mb-1`}>
        {label}
      </label>
      <input
        type="text"
        id={id}
        name={name}
        placeholder={placeholder}
        className={`border rounded-lg w-full px-3 py-2 ${themeClasses.input} focus:ring-indigo-500 focus:border-indigo-500`}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function DateInput({ id, name, label, value, onChange, themeClasses }) {
  return (
    <div>
      <label htmlFor={id} className={`block text-sm font-medium ${themeClasses.text} mb-1`}>
        {label}
      </label>
      <input
        type="date"
        id={id}
        name={name}
        className={`border rounded-lg w-full px-3 py-2 ${themeClasses.input} focus:ring-indigo-500 focus:border-indigo-500`}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function PageBtn({ children, disabled, onClick, position, themeClasses }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center px-2 py-2 ${
        position === 'left' ? 'rounded-l-md' : position === 'right' ? 'rounded-r-md' : ''
      } border text-sm font-medium ${
        disabled ? `${themeClasses.textSecondary} cursor-not-allowed` : `${themeClasses.button}`
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------- Tiny bits -------------------------------- */

function InfoKV({ label, value, strong = false, themeClasses }) {
  return (
    <div>
      <p className={themeClasses.textSecondary}>{label}:</p>
      <p className={`mt-1 ${strong ? 'font-semibold text-green-300' : `font-medium ${themeClasses.text}`}`}>
        {value ?? '—'}
      </p>
    </div>
  );
}

function Metric({ label, value, themeClasses }) {
  return (
    <div className={`${themeClasses.cardDarker} p-3 rounded-lg shadow-sm border`}>
      <p className={`text-xs ${themeClasses.textSecondary}`}>{label}</p>
      <p className={`text-lg font-semibold ${themeClasses.text}`}>{value}</p>
    </div>
  );
}

function levelPill(level) {
  const map = {
    admin: 'bg-red-900/40 text-red-200',
    advisor: 'bg-purple-900/40 text-purple-200',
    researcher: 'bg-blue-900/40 text-blue-200',
    farmer: 'bg-green-900/40 text-green-200',
    agent: 'bg-amber-900/40 text-amber-200',
  };
  return map[level] || 'bg-slate-700 text-gray-100';
}

function UserDetailsCard({ user, themeClasses }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoKV label="Username" value={user?.username} strong themeClasses={themeClasses} />
      <div>
        <p className={themeClasses.textSecondary}>User Level:</p>
        <span className={`mt-1 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${levelPill((user?.userlevel || '').toLowerCase())}`}>
          {user?.userlevel || '—'}
        </span>
      </div>
      <InfoKV label="Email" value={user?.email} themeClasses={themeClasses} />
      <InfoKV label="Address" value={user?.address || '—'} themeClasses={themeClasses} />
      <InfoKV label="Land Size (ha)" value={user?.landsize ?? '—'} themeClasses={themeClasses} />
      <InfoKV label="Created" value={formatDate(user?.created_at || user?.createdAt)} themeClasses={themeClasses} />
      <InfoKV label="Updated" value={formatDate(user?.updated_at || user?.updatedAt)} themeClasses={themeClasses} />
      <InfoKV label="ID" value={`#${user?.id}`} themeClasses={themeClasses} />
    </div>
  );
}
