'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import ThemeWrapper from '@/components/ThemeWrapper';

// Icons
import {
  Clock,
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  Loader,
  FileText,
  BarChart3 as BarChart,
  XCircle,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

// API URL (matches your style)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();

  const isDark = useMemo(() => theme?.name === 'dark', [theme]);
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // ----- helpers -----
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '—';
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return {
          bg: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)',
          text: isDark ? '#4ADE80' : '#16A34A'
        };
      case 'pending':
        return {
          bg: isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.1)',
          text: isDark ? '#FACC15' : '#D97706'
        };
      case 'failed':
        return {
          bg: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
          text: isDark ? '#F87171' : '#DC2626'
        };
      default:
        return {
          bg: isDark ? 'rgba(107,114,128,0.2)' : 'rgba(107,114,128,0.1)',
          text: isDark ? '#D1D5DB' : '#6B7280'
        };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'prediction':
        return <BarChart className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'login':
        return <Clock className="h-5 w-5" />;
      case 'profile_update':
        return <RefreshCw className="h-5 w-5" />;
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  // ----- mock data fallback (dev) -----
  const generateMockHistoryData = useCallback(() => {
    const types = ['prediction', 'document', 'login', 'profile_update', 'message'];
    const statuses = ['completed', 'pending', 'failed'];

    return Array.from({ length: 25 }).map((_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const created_at = new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      ).toISOString();

      const base = {
        id: i + 1,
        user_id: user?.id || 1,
        type,
        title: `History item ${i + 1}`,
        description: `This is a mock history item for development.`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        created_at
      };

      if (type === 'prediction') {
        return {
          ...base,
          crop_name: ['Paddy', 'Maize', 'Potato', 'Chili'][Math.floor(Math.random() * 4)],
          suitability_score: Math.random(),
          district: ['Colombo', 'Kandy', 'Jaffna', 'Galle'][Math.floor(Math.random() * 4)]
        };
      }
      if (type === 'document') {
        return {
          ...base,
          document_type: 'PDF',
          file_size: '1.2 MB',
          document_url: '#'
        };
      }
      if (type === 'login') {
        return {
          ...base,
          ip_address: '192.168.1.1',
          browser: 'Chrome 98.0.4758.102',
          location: 'Colombo, Sri Lanka'
        };
      }
      return base;
    });
  }, [user]);

  // ----- mapping server predictions -> history items -----
  const mapPredictionsToHistory = (list) =>
    (list || []).map((p) => {
      const created =
        p.created_at || p.createdAt || p.updated_at || p.updatedAt || new Date().toISOString();

      const titleBits = [];
      if (p.district) titleBits.push(p.district);
      if (p.crop_name) titleBits.push(p.crop_name);
      const title = titleBits.length ? `Prediction • ${titleBits.join(' • ')}` : 'Prediction';

      return {
        id: p.id,
        user_id: p.user_id,
        type: 'prediction',
        title,
        description:
          'Crop suitability prediction created from your inputs. Open to view the details.',
        status: 'completed',
        created_at: created,
        // pass through fields for details view
        ...p
      };
    });

  // ----- fetch from existing backend routes -----
  const fetchHistoryData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    const base = `${API_URL}/api/v1`;

    // 1) Try /predictions?user_id=<id>
    const tryEndpoints = [
      `${base}/predictions?user_id=${encodeURIComponent(user.id)}`,
      // 2) Try /predictions/user/<id>
      `${base}/predictions/user/${encodeURIComponent(user.id)}`
    ];

    let finalData = [];

    for (const url of tryEndpoints) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        // Some backends return 200 {success:false} — guard both
        if (res.ok) {
          const json = await res.json();
          const list =
            json?.data ||
            json?.rows ||
            json?.items ||
            (Array.isArray(json) ? json : []);
          if (Array.isArray(list) && list.length >= 0) {
            finalData = mapPredictionsToHistory(list);
            break;
          }
        }
      } catch (e) {
        // ignore and try next endpoint
      }
    }

    // Fallback to mock data if nothing came back
    if (!finalData.length) {
      finalData = generateMockHistoryData();
    }

    setHistory(finalData);
    setFilteredHistory(finalData);
    setTotalPages(Math.ceil(finalData.length / itemsPerPage));
    setCurrentPage(1);
    setLoading(false);
  }, [API_URL, user, itemsPerPage, generateMockHistoryData]);

  // ----- effects -----
  useEffect(() => {
    if (!authLoading) {
      if (user) fetchHistoryData();
      else setLoading(false);
    }
  }, [authLoading, user, fetchHistoryData]);

  useEffect(() => {
    if (!history.length) return;

    let filtered = [...history];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (it) =>
          it.title?.toLowerCase().includes(q) ||
          it.description?.toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all') {
      filtered = filtered.filter((it) => it.type === filterType);
    }

    setFilteredHistory(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [searchTerm, filterType, history, itemsPerPage]);

  // ----- pagination helpers -----
  const currentItems = useMemo(() => {
    const end = currentPage * itemsPerPage;
    const start = end - itemsPerPage;
    return filteredHistory.slice(start, end);
  }, [filteredHistory, currentPage, itemsPerPage]);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // ----- render -----
  if (authLoading) {
    return (
      <ThemeWrapper>
        <div className="flex justify-center items-center h-64">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: theme.colors.primary }}
          />
        </div>
      </ThemeWrapper>
    );
  }

  if (!user) {
    return (
      <ThemeWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            className="rounded-md p-4 mb-6"
            style={{
              backgroundColor: isDark ? 'rgba(234,179,8,0.2)' : '#FEF9C3',
              borderLeftWidth: 4,
              borderLeftColor: isDark ? '#EAB308' : '#CA8A04'
            }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle
                  className="h-5 w-5"
                  style={{ color: isDark ? '#FACC15' : '#CA8A04' }}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm" style={{ color: isDark ? '#FACC15' : '#854D0E' }}>
                  You need to be logged in to view your history.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90"
            style={{ backgroundColor: theme.colors.primary }}
          >
            Go to Login
          </button>
        </div>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/profile/Dashboard')}
              className="mr-4 p-2 rounded-full hover:bg-opacity-10"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.colors.text
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
              Activity History
            </h1>
          </div>
        </div>

        {error && !showDetails && (
          <div
            className="mb-6 p-4 rounded-md"
            style={{
              backgroundColor: isDark ? 'rgba(220,38,38,0.2)' : '#FEF2F2',
              borderLeftWidth: 4,
              borderLeftColor: isDark ? '#EF4444' : '#DC2626'
            }}
          >
            <div className="flex">
              <AlertTriangle
                className="h-5 w-5"
                style={{ color: isDark ? '#F87171' : '#DC2626' }}
              />
              <div className="ml-3">
                <p className="text-sm" style={{ color: isDark ? '#F87171' : '#B91C1C' }}>
                  {error}
                </p>
                <button
                  className="mt-2 text-xs underline"
                  style={{ color: isDark ? '#F87171' : '#DC2626' }}
                  onClick={fetchHistoryData}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {!showDetails ? (
          <>
            {/* Search & Filter */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full rounded-md shadow-sm sm:text-sm"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: theme.colors.text,
                    borderWidth: 1,
                    padding: '0.5rem 0.75rem'
                  }}
                />
              </div>

              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 block w-full rounded-md shadow-sm sm:text-sm"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: theme.colors.text,
                    borderWidth: 1,
                    padding: '0.5rem 0.75rem'
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="prediction">Predictions</option>
                  <option value="document">Documents</option>
                  <option value="login">Logins</option>
                  <option value="profile_update">Profile Updates</option>
                  <option value="message">Messages</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div
              className="shadow overflow-hidden sm:rounded-lg"
              style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }}
            >
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader className="animate-spin h-8 w-8" style={{ color: theme.colors.primary }} />
                </div>
              ) : filteredHistory.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table
                      className="min-w-full divide-y"
                      style={{
                        divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                      }}
                    >
                      <thead>
                        <tr>
                          {['Type', 'Title', 'Date', 'Status', 'Actions'].map((h, i) => (
                            <th
                              key={i}
                              scope="col"
                              className={`px-6 py-3 ${i === 4 ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider`}
                              style={{
                                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody
                        className="divide-y"
                        style={{
                          divideColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                        }}
                      >
                        {currentItems.map((item) => {
                          const statusColor = getStatusColor(item.status);
                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-opacity-10 hover:bg-gray-200 transition-colors duration-150"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center">
                                  <div
                                    className="p-2 rounded-full mr-2"
                                    style={{
                                      backgroundColor: isDark
                                        ? 'rgba(255,255,255,0.1)'
                                        : 'rgba(0,0,0,0.05)'
                                    }}
                                  >
                                    {getTypeIcon(item.type)}
                                  </div>
                                  <span className="capitalize">{item.type?.replace('_', ' ')}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">{item.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {formatDate(item.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                                  style={{
                                    backgroundColor: statusColor.bg,
                                    color: statusColor.text
                                  }}
                                >
                                  {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setShowDetails(true);
                                  }}
                                  className="hover:opacity-90"
                                  style={{ color: theme.colors.primary }}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div
                      className="px-4 py-3 flex items-center justify-between border-t sm:px-6"
                      style={{ borderColor: theme.colors.border }}
                    >
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm" style={{ color: theme.colors.text }}>
                            Showing{' '}
                            <span className="font-medium">
                              {(currentPage - 1) * itemsPerPage + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                              {Math.min(currentPage * itemsPerPage, filteredHistory.length)}
                            </span>{' '}
                            of <span className="font-medium">{filteredHistory.length}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                              onClick={() => paginate(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium"
                              style={{
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                color:
                                  currentPage === 1
                                    ? isDark
                                      ? 'rgba(255,255,255,0.3)'
                                      : 'rgba(0,0,0,0.3)'
                                    : theme.colors.text
                              }}
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>

                            {Array.from({ length: totalPages }).map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => paginate(idx + 1)}
                                className="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                                style={{
                                  backgroundColor:
                                    currentPage === idx + 1
                                      ? theme.colors.primary
                                      : isDark
                                      ? 'rgba(255,255,255,0.05)'
                                      : '#fff',
                                  borderColor: isDark
                                    ? 'rgba(255,255,255,0.2)'
                                    : 'rgba(0,0,0,0.2)',
                                  color: currentPage === idx + 1 ? '#fff' : theme.colors.text
                                }}
                              >
                                {idx + 1}
                              </button>
                            ))}

                            <button
                              onClick={() => paginate(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium"
                              style={{
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                color:
                                  currentPage === totalPages
                                    ? isDark
                                      ? 'rgba(255,255,255,0.3)'
                                      : 'rgba(0,0,0,0.3)'
                                    : theme.colors.text
                              }}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10">
                  <XCircle
                    className="mx-auto h-10 w-10 mb-4"
                    style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                  />
                  <p className="text-lg font-medium mb-2" style={{ color: theme.colors.text }}>
                    No history found
                  </p>
                  <p
                    className="text-sm mb-4"
                    style={{
                      color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                    }}
                  >
                    {searchTerm || filterType !== 'all'
                      ? 'Try adjusting your search or filter'
                      : 'Your activity history will appear here'}
                  </p>

                  {(searchTerm || filterType !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterType('all');
                      }}
                      className="inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md"
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        color: theme.colors.text
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          // ----- Details view -----
          selectedItem && (
            <div
              className="shadow sm:rounded-lg overflow-hidden"
              style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }}
            >
              <div
                className="px-4 py-5 sm:px-6 flex justify-between items-center border-b"
                style={{ borderColor: theme.colors.border }}
              >
                <div className="flex items-center">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="mr-4 p-2 rounded-full hover:bg-opacity-10"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      color: theme.colors.text
                    }}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h3 className="text-lg leading-6 font-medium" style={{ color: theme.colors.text }}>
                    {selectedItem.title}
                  </h3>
                </div>

                <div className="flex-shrink-0">
                  <span
                    className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                    style={{
                      backgroundColor: getStatusColor(selectedItem.status).bg,
                      color: getStatusColor(selectedItem.status).text
                    }}
                  >
                    {selectedItem.status?.charAt(0).toUpperCase() + selectedItem.status?.slice(1)}
                  </span>
                </div>
              </div>

              <div className="px-4 py-5 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-6">
                      <h4
                        className="text-xs font-medium uppercase tracking-wider mb-2"
                        style={{
                          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                        }}
                      >
                        Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 p-1">{getTypeIcon(selectedItem.type)}</div>
                          <div className="ml-3">
                            <p
                              className="text-xs font-medium"
                              style={{
                                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                              }}
                            >
                              Type
                            </p>
                            <p className="text-sm capitalize" style={{ color: theme.colors.text }}>
                              {selectedItem.type?.replace('_', ' ')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex-shrink-0 p-1">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <p
                              className="text-xs font-medium"
                              style={{
                                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                              }}
                            >
                              Date
                            </p>
                            <p className="text-sm" style={{ color: theme.colors.text }}>
                              {formatDate(selectedItem.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4
                        className="text-xs font-medium uppercase tracking-wider mb-2"
                        style={{
                          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                        }}
                      >
                        Description
                      </h4>
                      <p className="text-sm" style={{ color: theme.colors.text }}>
                        {selectedItem.description || 'No description available.'}
                      </p>
                    </div>
                  </div>

                  <div
                    className="bg-opacity-10 rounded-lg p-4"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)'
                    }}
                  >
                    <h4
                      className="text-xs font-medium uppercase tracking-wider mb-4"
                      style={{
                        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                      }}
                    >
                      Additional Information
                    </h4>

                    {selectedItem.type === 'prediction' && (
                      <div className="space-y-3">
                        <div>
                          <p
                            className="text-xs font-medium mb-1"
                            style={{
                              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                            }}
                          >
                            Crop
                          </p>
                          <p className="text-sm" style={{ color: theme.colors.text }}>
                            {selectedItem.crop_name || 'Not specified'}
                          </p>
                        </div>

                        <div>
                          <p
                            className="text-xs font-medium mb-1"
                            style={{
                              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                            }}
                          >
                            District / AEZ / Season
                          </p>
                          <p className="text-sm" style={{ color: theme.colors.text }}>
                            {[selectedItem.district, selectedItem.agro_ecological_zone, selectedItem.cultivate_season]
                              .filter(Boolean)
                              .join(' • ') || '—'}
                          </p>
                        </div>

                        <div>
                          <p
                            className="text-xs font-medium mb-1"
                            style={{
                              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                            }}
                          >
                            Soil
                          </p>
                          <p className="text-sm" style={{ color: theme.colors.text }}>
                            {selectedItem.soil_type
                              ? `${selectedItem.soil_type} (pH ${selectedItem.soil_ph_level ?? '—'})`
                              : '—'}
                          </p>
                        </div>

                        <div>
                          <p
                            className="text-xs font-medium mb-1"
                            style={{
                              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                            }}
                          >
                            N • P • K
                          </p>
                          <p className="text-sm" style={{ color: theme.colors.text }}>
                            {[
                              selectedItem.nitrogen != null ? `N ${selectedItem.nitrogen}` : null,
                              selectedItem.phosphate != null ? `P ${selectedItem.phosphate}` : null,
                              selectedItem.potassium != null ? `K ${selectedItem.potassium}` : null
                            ]
                              .filter(Boolean)
                              .join(' • ') || '—'}
                          </p>
                        </div>

                        <div>
                          <p
                            className="text-xs font-medium mb-1"
                            style={{
                              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                            }}
                          >
                            Suitability Score
                          </p>
                          <div
                            className="w-full h-2 rounded-full overflow-hidden"
                            style={{
                              backgroundColor: isDark
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.1)'
                            }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.round(
                                  ((selectedItem.suitability_score ?? 0.6) * 100)
                                )}%`,
                                backgroundColor: theme.colors.primary
                              }}
                            />
                          </div>
                          <p
                            className="mt-1 text-right text-xs"
                            style={{
                              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                            }}
                          >
                            {Math.round((selectedItem.suitability_score ?? 0.6) * 100)}%
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedItem.type === 'document' && (
                      <div className="space-y-3">
                        <div>
                          <p
                            className="text-xs font-medium mb-1"
                            style={{
                              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                            }}
                          >
                            Document Type
                          </p>
                          <p className="text-sm" style={{ color: theme.colors.text }}>
                            {selectedItem.document_type || 'PDF'}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-xs font-medium mb-1"
                            style={{
                              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                            }}
                          >
                            File Size
                          </p>
                          <p className="text-sm" style={{ color: theme.colors.text }}>
                            {selectedItem.file_size || '—'}
                          </p>
                        </div>

                        {selectedItem.document_url ? (
                          <div className="mt-4">
                            <a
                              href={selectedItem.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white"
                              style={{ backgroundColor: theme.colors.primary }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Document
                            </a>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {selectedItem.type === 'login' && (
                      <div className="space-y-3">
                        <div>
                          <p
                            className="text-xs font-medium mb-1"
                            style={{
                              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                            }}
                          >
                            IP Address
                          </p>
                          <p className="text-sm" style={{ color: theme.colors.text }}>
                            {selectedItem.ip_address || '—'}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-xs font-medium mb-1"
                            style={{
                              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                            }}
                          >
                            Browser
                          </p>
                          <p className="text-sm" style={{ color: theme.colors.text }}>
                            {selectedItem.browser || '—'}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-xs font-medium mb-1"
                            style={{
                              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                            }}
                          >
                            Location
                          </p>
                          <p className="text-sm" style={{ color: theme.colors.text }}>
                            {selectedItem.location || '—'}
                          </p>
                        </div>
                      </div>
                    )}

                    {!(selectedItem.type === 'prediction' ||
                      selectedItem.type === 'document' ||
                      selectedItem.type === 'login') && (
                      <div className="text-center py-4">
                        <p
                          className="text-sm"
                          style={{
                            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                          }}
                        >
                          No additional information available for this activity type.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </ThemeWrapper>
  );
}
