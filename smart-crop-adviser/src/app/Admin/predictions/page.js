'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, AlertTriangle, ChevronLeft, ChevronRight, Eye, Calendar, ArrowUpRight, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminPredictions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for predictions list
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    user_id: '',
    crop_name: '',
    date_from: '',
    date_to: ''
  });
  
  // Prediction detail view
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Check if we should load a specific prediction
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      fetchPredictionById(id);
    }
  }, [searchParams]);

  // Fetch a specific prediction by ID
  const fetchPredictionById = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/predictions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prediction details');
      }

      const data = await response.json();
      if (data && data.success) {
        setSelectedPrediction(data.data);
        setShowDetail(true);
      } else {
        throw new Error('Prediction not found');
      }
    } catch (err) {
      console.error('Error fetching prediction:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch predictions with filters and pagination
  const fetchPredictions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Build query params - use the standard API endpoint
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      // Add any active filters that the API supports
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.crop_name) params.append('crop_name', filters.crop_name);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      // Using the standard predictions endpoint, not admin-specific
      const response = await fetch(`${API_URL}/api/v1/predictions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }

      const data = await response.json();
      // Adjust to match the standard API response format
      if (data.success && data.data) {
        setPredictions(data.data);
        setTotal(data.meta?.total || data.data.length);
      } else {
        setPredictions([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, router]);

  // Load predictions on initial render and when dependencies change
  useEffect(() => {
    // Only fetch list if we're not showing a detail view
    if (!showDetail) {
      fetchPredictions();
    }
  }, [fetchPredictions, showDetail]);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when applying filters
    fetchPredictions();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      user_id: '',
      crop_name: '',
      date_from: '',
      date_to: ''
    });
    setPage(1);
    fetchPredictions();
  };

  // View prediction details
  const viewPredictionDetails = (prediction) => {
    setSelectedPrediction(prediction);
    setShowDetail(true);
    
    // Update URL to include prediction ID
    const url = new URL(window.location.href);
    url.searchParams.set('id', prediction.id);
    window.history.pushState({}, '', url.toString());
  };

  // Back to list view
  const backToList = () => {
    setShowDetail(false);
    setSelectedPrediction(null);
    
    // Remove id from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url.toString());
  };

  // Render prediction detail view
  if (showDetail && selectedPrediction) {
    return (
      <AdminLayout>
        <div className="p-6">
          <button 
            onClick={backToList}
            className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Predictions List
          </button>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Prediction #{selectedPrediction.id}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Created on {formatDate(selectedPrediction.created_at)}
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">User Information</h3>
                  {selectedPrediction.user ? (
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                          {selectedPrediction.user.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{selectedPrediction.user.username}</p>
                          <p className="text-xs text-gray-500">{selectedPrediction.user.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">User ID:</p>
                          <p className="font-medium">{selectedPrediction.user.id}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">User Level:</p>
                          <p className="font-medium capitalize">{selectedPrediction.user.userlevel}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500">User ID: {selectedPrediction.user_id || 'Unknown'}</p>
                      <button 
                        onClick={() => router.push(`/admin/users?id=${selectedPrediction.user_id}`)}
                        className="mt-2 text-indigo-600 text-sm flex items-center"
                      >
                        View User Details <ArrowUpRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Prediction Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Prediction Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Crop Name:</p>
                      <p className="font-medium text-green-600">{selectedPrediction.crop_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Prediction ID:</p>
                      <p className="font-medium">#{selectedPrediction.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Created:</p>
                      <p className="font-medium">{formatDate(selectedPrediction.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Updated:</p>
                      <p className="font-medium">{formatDate(selectedPrediction.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Soil Parameters */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Soil Parameters</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-xs text-gray-500">Nitrogen (N)</p>
                      <p className="text-lg font-semibold">{selectedPrediction.n || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-xs text-gray-500">Phosphorus (P)</p>
                      <p className="text-lg font-semibold">{selectedPrediction.p || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-xs text-gray-500">Potassium (K)</p>
                      <p className="text-lg font-semibold">{selectedPrediction.k || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-xs text-gray-500">pH Level</p>
                      <p className="text-lg font-semibold">{selectedPrediction.ph || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* Additional parameters if available */}
                  {(selectedPrediction.temperature || selectedPrediction.humidity || selectedPrediction.rainfall) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {selectedPrediction.temperature && (
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <p className="text-xs text-gray-500">Temperature</p>
                          <p className="text-lg font-semibold">{selectedPrediction.temperature}</p>
                        </div>
                      )}
                      {selectedPrediction.humidity && (
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <p className="text-xs text-gray-500">Humidity</p>
                          <p className="text-lg font-semibold">{selectedPrediction.humidity}</p>
                        </div>
                      )}
                      {selectedPrediction.rainfall && (
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <p className="text-xs text-gray-500">Rainfall</p>
                          <p className="text-lg font-semibold">{selectedPrediction.rainfall}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => router.push(`/admin/users?id=${selectedPrediction.user_id}`)}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  View User
                </button>
                <button
                  onClick={backToList}
                  className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Prediction History</h1>
          <p className="text-gray-500">View and filter all crop prediction records</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow mb-6">
          <form onSubmit={applyFilters} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  id="user_id"
                  name="user_id"
                  placeholder="Filter by user ID"
                  className="border border-gray-300 rounded-md w-full px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filters.user_id}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div>
                <label htmlFor="crop_name" className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                <input
                  type="text"
                  id="crop_name"
                  name="crop_name"
                  placeholder="Filter by crop name"
                  className="border border-gray-300 rounded-md w-full px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filters.crop_name}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div>
                <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  id="date_from"
                  name="date_from"
                  className="border border-gray-300 rounded-md w-full px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filters.date_from}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div>
                <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  id="date_to"
                  name="date_to"
                  className="border border-gray-300 rounded-md w-full px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filters.date_to}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Reset
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
              >
                <Filter className="h-4 w-4 mr-1" />
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Prediction List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="spinner h-10 w-10 border-4 border-t-indigo-600 border-r-transparent border-b-indigo-600 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading predictions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-lg shadow p-6 text-red-800">
            <h3 className="font-semibold flex items-center mb-2">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Error Loading Predictions
            </h3>
            <p>{error}</p>
            <button 
              onClick={fetchPredictions}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        ) : predictions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No predictions found matching your criteria.</p>
            <button 
              onClick={resetFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soil Parameters</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {predictions.map((prediction) => (
                    <tr key={prediction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{prediction.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-xs text-green-800">{prediction.crop_name?.charAt(0)?.toUpperCase() || '?'}</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{prediction.crop_name || 'Unknown'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {prediction.user ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{prediction.user.username}</div>
                            <div className="text-xs text-gray-500">{prediction.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">User #{prediction.user_id}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                            N: {prediction.n || '?'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-1">
                            P: {prediction.p || '?'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mr-1">
                            K: {prediction.k || '?'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            pH: {prediction.ph || '?'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(prediction.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => viewPredictionDetails(prediction)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {total > limit && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                      <span className="font-medium">{total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Page numbers - simplified to save space */}
                      {Array.from({ length: Math.min(5, Math.ceil(total / limit)) }).map((_, index) => {
                        const pageNum = index + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border ${
                              page === pageNum
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            } text-sm font-medium`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      {Math.ceil(total / limit) > 5 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      )}
                      
                      {Math.ceil(total / limit) > 5 && (
                        <button
                          onClick={() => setPage(Math.ceil(total / limit))}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            page === Math.ceil(total / limit)
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                        >
                          {Math.ceil(total / limit)}
                        </button>
                      )}
                      
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page >= Math.ceil(total / limit)}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          page >= Math.ceil(total / limit) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}