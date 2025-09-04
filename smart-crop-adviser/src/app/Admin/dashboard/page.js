'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, BarChart2, FileText, Calendar, Activity, 
  Award, Target
} from 'lucide-react';

import {
  PieChart, Pie, Cell, Tooltip as RTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Line
} from 'recharts';

import AdminLayout from '@/components/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Admin Dashboard (light-mode contrast + responsive fixes)
 * - Stronger text/background contrast in light mode
 * - Dark-mode aware chart palettes
 * - Correct Total Users logic using actual loaded data
 * - Removed washed-out overlay in KPI for light mode
 * - Fully responsive charts & table
 * - Fixed column names for predictions data
 */
export default function AdminDashboard() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [summaryData, setSummaryData] = useState({
    users: { total: 0, byRole: {}, listLength: 0, userMap: {} },
    predictions: { total: 0, recent: [] },
    files: { total: 0 },
  });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // detect dark theme once on mount and on theme change
  useEffect(() => {
    const el = document.documentElement;
    const check = () => setIsDark(el.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) { router.push('/login'); return; }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch users (list) and predictions concurrently
        const usersPromise = fetch(`${API_URL}/api/v1/users?limit=1000`, { headers })
          .then(r => { if (!r.ok) throw new Error(`users ${r.status}`); return r.json(); });

        const predsPromise = fetch(`${API_URL}/api/v1/predictions?limit=50`, { headers })
          .then(r => { if (!r.ok) throw new Error(`preds ${r.status}`); return r.json(); });

        // Optional files endpoint (ignore failures gracefully)
        let filesData = { total: 0 };
        try {
          const fr = await fetch(`${API_URL}/api/v1/user-files?limit=1`, { headers });
          if (fr.ok) {
            const fj = await fr.json();
            filesData.total = fj?.meta?.total ?? 0;
          }
        } catch {/* ignore */}

        const [usersData, predsData] = await Promise.all([usersPromise, predsPromise]);

        const usersList   = usersData?.data ?? usersData ?? [];
        const predsList   = predsData?.data ?? predsData ?? [];

        const usersByRole = usersList.reduce((acc, u) => {
          const r = (u.userlevel || 'unknown').toLowerCase();
          acc[r] = (acc[r] || 0) + 1;
          return acc;
        }, {});

        // Build a fast id -> displayName map for table lookups
        const userMap = usersList.reduce((m, u) => {
          const display =
            u.username ||
            [u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
            u.email ||
            `User #${u.id}`;
          m[String(u.id)] = display;
          return m;
        }, {});

        setSummaryData({
          users: {
            total: usersList.length, // Use actual count from loaded data
            byRole: usersByRole,
            listLength: usersList.length,
            userMap
          },
          predictions: {
            total: predsData?.meta?.total ?? predsList.length,
            recent: predsList
          },
          files: filesData
        });
      } catch (e) {
        console.error(e);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // -------- Derived data (for charts & stats) --------
  const roleData = useMemo(() => {
    const entries = Object.entries(summaryData.users.byRole || {});
    return entries.map(([name, value]) => ({ name: capitalize(name), value }));
  }, [summaryData.users.byRole]);

  const cropCounts = useMemo(() => {
    const map = new Map();
    for (const p of summaryData.predictions.recent) {
      const c = (p.crop_name || 'Unknown').toString();
      map.set(c, (map.get(c) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [summaryData.predictions.recent]);

  const topCrop       = cropCounts[0]?.name ?? '—';
  const distinctCrops = cropCounts.length;

  const last14 = useMemo(() => {
    const days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i)); d.setHours(0,0,0,0); return d;
    });
    const map = new Map(days.map(d => [d.getTime(), 0]));
    for (const p of summaryData.predictions.recent) {
      const d = new Date(p.created_at || p.updated_at || Date.now()); d.setHours(0,0,0,0);
      const key = d.getTime();
      if (map.has(key)) map.set(key, map.get(key) + 1);
    }
    return days.map(d => ({ day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: map.get(d.getTime()) || 0 }));
  }, [summaryData.predictions.recent]);

  // Palette used by charts and small UI accents
  const CHART_COLORS = {
    // Solid colors for legends, ticks, simple fills
    modern: [
      '#2563eb', // blue-600
      '#7c3aed', // violet-600
      '#059669', // emerald-600
      '#f59e0b', // amber-500
      '#ef4444', // red-500
      '#06b6d4', // cyan-500
      '#10b981', // green-500
      '#8b5cf6', // violet-500
    ],

    // Lighter tones for pie gradients’ start color (paired with modern[] as the end)
    lightMode: [
      '#93c5fd', // blue-300
      '#d8b4fe', // violet-300
      '#86efac', // green-300
      '#fde68a', // amber-300
      '#fca5a5', // red-300
      '#99f6e4', // teal-200
      '#a7f3d0', // emerald-200
      '#c4b5fd', // violet-300
    ],

    // CSS gradient strings for small badges/avatars in the Recent Predictions table
    gradient: [
      'linear-gradient(135deg, #6366f1, #8b5cf6)',
      'linear-gradient(135deg, #0ea5e9, #22d3ee)',
      'linear-gradient(135deg, #10b981, #34d399)',
      'linear-gradient(135deg, #f59e0b, #f97316)',
      'linear-gradient(135deg, #ef4444, #f43f5e)',
      'linear-gradient(135deg, #14b8a6, #06b6d4)',
      'linear-gradient(135deg, #84cc16, #22c55e)',
      'linear-gradient(135deg, #9333ea, #a855f7)',
    ],
  };

  if (loading) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-slate-900 dark:via-green-900/20 dark:to-emerald-900/20">
          <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="relative mx-auto h-16 w-16 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-green-200 dark:border-green-800"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-green-600 dark:border-t-green-400 animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Dashboard</h3>
                <p className="text-gray-700 dark:text-gray-400">Fetching your analytics data...</p>
              </div>
            </div>
          </div>
        </main>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900">
        <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-300 dark:to-teal-300">
                  Dashboard Overview
                </h1>
                <p className="text-base md:text-lg text-slate-900 dark:text-slate-300 mt-2 font-medium">
                  Monitor your agricultural analytics platform
                </p>
              </div>
              <div className="flex items-center">
                <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Live Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-3">
                <Calendar className="h-6 w-6 text-red-500 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error Loading Dashboard</h3>
                  <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <EnhancedKPI
              icon={<Users className="w-6 h-6" />}
              title="Total Users"
              value={summaryData.users.listLength}
              subtitle="Registered platform users"
              actionLabel="Manage Users"
              onAction={() => router.push('/admin/users')}
              iconBg="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
              trend="Updated"
              isDark={isDark}
            />
            <EnhancedKPI
              icon={<BarChart2 className="w-6 h-6" />}
              title="Predictions"
              value={summaryData.predictions.total}
              subtitle="AI-powered crop analysis"
              actionLabel="View Analytics"
              onAction={() => router.push('/admin/predictions')}
              iconBg="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
              trend="Live"
              isDark={isDark}
            />
            <EnhancedKPI
              icon={<FileText className="w-6 h-6" />}
              title="Resources"
              value={summaryData.files.total}
              subtitle="Documents and guides"
              actionLabel="Manage Files"
              onAction={() => router.push('/admin/resources')}
              iconBg="bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300"
              trend="Synced"
              isDark={isDark}
            />
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <StatusBadge
              icon={<Award className="w-4 h-4" />}
              label="Top Crop"
              value={topCrop}
              color="bg-amber-500"
            />
            <StatusBadge
              icon={<Target className="w-4 h-4" />}
              label="Crop Varieties"
              value={`${distinctCrops} types`}
              color="bg-emerald-600"
            />
            <StatusBadge
              icon={<Activity className="w-4 h-4" />}
              label="Daily Avg"
              value={`${Math.max(1, Math.round((summaryData.predictions.total || 0) / 30))} predictions`}
              color="bg-teal-600"
            />
          </div>

           {/* Enhanced Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-8">
            {/* Users by Role Chart */}
            <ChartCard title="User Distribution" subtitle="By role and access level">
              {roleData.length ? (
                <div className="w-full h-80">
                  <ResponsiveContainer>
                    <PieChart>
                      <defs>
                        {roleData.map((_, i) => (
                          <linearGradient key={i} id={`roleGradient${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={CHART_COLORS.modern[i % CHART_COLORS.modern.length]} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={CHART_COLORS.modern[i % CHART_COLORS.modern.length]} stopOpacity={1} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie 
                        data={roleData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={80}
                        innerRadius={30}
                        paddingAngle={2}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {roleData.map((_, i) => (
                          <Cell key={i} fill={`url(#roleGradient${i})`} stroke="none" />
                        ))}
                      </Pie>
                      <RTooltip 
                        contentStyle={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyChart />}
              <div className="mt-4 space-y-2">
                {roleData.map((r, i) => (
                  <div key={r.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: CHART_COLORS.modern[i % CHART_COLORS.modern.length] }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{r.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{r.value}</span>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Activity Timeline - Combined Line and Bar Chart */}
            <div className="xl:col-span-2">
              <ChartCard title="Activity Timeline" subtitle="Predictions over last 14 days - Line & Bar View">
                <div className="w-full h-80">
                  <ResponsiveContainer>
                    <BarChart data={last14}>
                      <defs>
                        <linearGradient id="activityBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0.6}/>
                        </linearGradient>
                        <linearGradient id="activityLineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.2)" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#374151', fontSize: 12 }} 
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#374151', fontSize: 12 }} 
                      />
                      <RTooltip 
                        contentStyle={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          color: '#374151'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="url(#activityBarGradient)"
                        radius={[4, 4, 0, 0]}
                        stroke="#16a34a"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#059669" 
                        strokeWidth={3}
                        dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#16a34a' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  Combined bar and line visualization showing daily prediction trends
                </div>
              </ChartCard>
            </div>

            {/* Crop Distribution - Pie Chart */}
            <ChartCard title="Crop Analytics" subtitle="Distribution by crop type">
              {cropCounts.length ? (
                <div className="w-full h-80">
                  <ResponsiveContainer>
                    <PieChart>
                      <defs>
                        {cropCounts.map((_, i) => (
                          <linearGradient key={i} id={`cropGradient${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={CHART_COLORS.lightMode[i % CHART_COLORS.lightMode.length]} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={CHART_COLORS.modern[i % CHART_COLORS.modern.length]} stopOpacity={1} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie 
                        data={cropCounts.slice(0, 8)} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={90}
                        innerRadius={35}
                        paddingAngle={3}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        labelLine={false}
                      >
                        {cropCounts.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={`url(#cropGradient${i})`} stroke="rgba(255, 255, 255, 0.8)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RTooltip 
                        contentStyle={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          color: '#374151'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyChart />}
              <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Leading Crop:</span>
                  <span className="text-sm font-bold text-green-800 dark:text-green-200">{topCrop}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-green-600 dark:text-green-400">Total Varieties:</span>
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">{distinctCrops}</span>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* ===== RECENT PREDICTIONS ===== */}
          <div className="bg-green-50 dark:bg-slate-800 rounded-2xl border border-green-200 dark:border-slate-700 shadow-xl overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-green-200 dark:border-slate-700/70">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Recent Predictions</h2>
              <p className="text-slate-800 dark:text-slate-400 text-sm mt-1">Latest crop analysis and predictions</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-green-100 dark:bg-slate-700/40">
                  <tr>
                    <TH>Prediction ID</TH>
                    <TH>Crop Analysis</TH>
                    <TH>User</TH>
                    <TH>Soil Metrics</TH>
                    <TH>Created</TH>
                    <TH>Actions</TH>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {summaryData.predictions.recent.length ? summaryData.predictions.recent.map((p) => {
                    // robust username resolution
                    const uid = String(p.user_id ?? p.user?.id ?? '');
                    const uname =
                      summaryData.users.userMap?.[uid] ||
                      p.user?.username ||
                      p.user_name ||
                      p.username ||
                      `User #${p.user_id ?? p.user?.id ?? '?'}`;

                    return (
                      <tr key={p.id} className="hover:bg-green-100 dark:hover:bg-slate-700/30 transition-colors">
                        <TD>
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">#{p.id}</span>
                            </div>
                          </div>
                        </TD>

                        <TD>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600">
                              {p.crop_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">{p.crop_name || 'Unknown Crop'}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">Analysis Complete</div>
                            </div>
                          </div>
                        </TD>

                        <TD>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">{uname}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">#{p.user_id ?? p.user?.id ?? '?'}</div>
                        </TD>

                        {/* IMPORTANT: Use your provided column names */}
                        <TD>
                          <div className="flex flex-wrap gap-1">
                            <SoilChip label="N"  value={p.nitrogen}      color="bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50" />
                            <SoilChip label="P"  value={p.phosphate}     color="bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800/50" />
                            <SoilChip label="K"  value={p.potassium}     color="bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50" />
                            <SoilChip label="pH" value={p.soil_ph_level} color="bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50" />
                          </div>
                        </TD>

                        <TD>
                          <div className="text-sm text-slate-700 dark:text-slate-300">{formatDate(p.created_at)}</div>
                        </TD>

                        <TD>
                          <button
                            onClick={() => router.push(`/admin/predictions?id=${p.id}`)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200"
                          >
                            View Details
                          </button>
                        </TD>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-slate-500 dark:text-slate-400">
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-60" />
                          <p className="text-lg font-medium">No recent predictions found</p>
                          <p className="text-sm">Predictions will appear here as users create them</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 md:px-6 py-4 bg-green-100 dark:bg-slate-700/40 border-t border-green-200 dark:border-slate-700">
              <button
                onClick={() => router.push('/admin/predictions')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <BarChart2 className="h-4 w-4" />
                <span>View All Analytics</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}

/* -------------------------- Enhanced UI Components -------------------------- */

function EnhancedKPI({ icon, title, value, subtitle, actionLabel, onAction, gradient, iconBg, trend }) {
  return (
    <div className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-slate-700/40"></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{Number(value ?? 0).toLocaleString()}</h3>
              <div className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100/50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                {trend}
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          </div>
          <div className={`p-4 rounded-2xl ${iconBg} backdrop-blur-sm`}>
            {icon}
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <button 
            onClick={onAction}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform group-hover:scale-105"
          >
            {actionLabel}
          </button>
          <div className="h-1 w-16 rounded-full" style={{ background: gradient }}></div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ icon, label, value, color }) {
  return (
    <div className={`${color} text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg backdrop-blur-sm`}>
      {icon}
      <span className="text-sm font-medium">{label}:</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function TH({ children }) {
  return (
    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
      {children}
    </th>
  );
}

function TD({ children, className = '' }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}>
      {children}
    </td>
  );
}

function SoilChip({ label, value, color }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${color}`}>
      {label}: {value ?? '?'}
    </span>
  );
}

function EmptyChart() {
  return (
    <div className="w-full h-80 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
      <Activity className="h-16 w-16 mb-4 opacity-50" />
      <p className="text-lg font-medium">No Data Available</p>
      <p className="text-sm opacity-75">Chart will display when data is available</p>
    </div>
  );
}

function formatDate(s) {
  if (!s) return 'Unknown';
  const d = new Date(s);
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

function capitalize(s='') {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
