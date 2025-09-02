'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart2, TrendingUp, Users, PieChart, Calendar, ArrowUpRight, FileText, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminDashboard() {
  const router = useRouter();
  const [summaryData, setSummaryData] = useState({
    users: { total: 0, byRole: {} },
    predictions: { total: 0, recent: [] },
    files: { total: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch summary data from various endpoints
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch users count and group by role
        const usersPromise = fetch(`${API_URL}/api/v1/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
          return res.json();
        });

        // Fetch predictions
        const predictionsPromise = fetch(`${API_URL}/api/v1/predictions?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch predictions: ${res.status}`);
          return res.json();
        });

        // Fetch user files count (only if the endpoint exists)
        let filesData = { total: 0 };
        try {
          const filesResponse = await fetch(`${API_URL}/api/v1/user-files?limit=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (filesResponse.ok) {
            const filesJson = await filesResponse.json();
            filesData = { total: filesJson.meta?.total || 0 };
          }
        } catch (fileErr) {
          console.log('Files endpoint may not be available:', fileErr);
          // Continue without files data
        }

        // Wait for main promises to resolve
        const [usersData, predictionsData] = await Promise.all([
          usersPromise, predictionsPromise
        ]);

        // Process users data to group by role
        const usersByRole = {};
        usersData.data.forEach(user => {
          const role = user.userlevel || 'unknown';
          usersByRole[role] = (usersByRole[role] || 0) + 1;
        });

        setSummaryData({
          users: { 
            total: usersData.meta.total || usersData.data.length, 
            byRole: usersByRole 
          },
          predictions: { 
            total: predictionsData.meta?.total || predictionsData.data.length,
            recent: predictionsData.data || []
          },
          files: filesData
        });
      } catch (err) {
        console.error('Error fetching summary data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [router]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="spinner h-12 w-12 border-4 border-t-indigo-600 border-r-transparent border-b-indigo-600 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading dashboard data...</p>
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
          <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-gray-500">Admin dashboard overview of system activity and metrics</p>
        </div>

        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-600 mx-auto max-w-4xl my-8">
            <h2 className="text-lg font-semibold flex items-center">
              <RefreshCw className="w-5 h-5 mr-2" />
              Error Loading Dashboard
            </h2>
            <p className="mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Users Stat */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Users</p>
                <h3 className="text-2xl font-bold">{summaryData.users.total}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">User Types</span>
              </div>
              <div className="space-y-2">
                {Object.entries(summaryData.users.byRole || {}).map(([role, count]) => (
                  <div key={role} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getRoleColor(role)} mr-2`}></div>
                      <span className="capitalize">{role}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => router.push('/admin/users')}
                className="text-indigo-600 text-sm hover:text-indigo-800 flex items-center"
              >
                View All Users
              </button>
            </div>
          </div>

          {/* Predictions Stat */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Predictions</p>
                <h3 className="text-2xl font-bold">{summaryData.predictions.total}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <BarChart2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Recent prediction analysis across all crops and regions
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => router.push('/admin/predictions')}
                className="text-indigo-600 text-sm hover:text-indigo-800 flex items-center"
              >
                View All Predictions
              </button>
            </div>
          </div>

          {/* Files Stat */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Files</p>
                <h3 className="text-2xl font-bold">{summaryData.files.total}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Uploaded files and resources across the system
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => router.push('/admin/resources')}
                className="text-indigo-600 text-sm hover:text-indigo-800 flex items-center"
              >
                Manage Resources
              </button>
            </div>
          </div>
        </div>

        {/* Recent Predictions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Recent Predictions</h2>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summaryData.predictions.recent.length > 0 ? (
                    summaryData.predictions.recent.map((prediction) => (
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
                          <div className="text-sm text-gray-900">User #{prediction.user_id}</div>
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
                            onClick={() => router.push(`/admin/predictions?id=${prediction.id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No recent predictions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3">
              <button 
                onClick={() => router.push('/admin/predictions')}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                View All Predictions
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// Helper function to get color for user role
function getRoleColor(role) {
  const colors = {
    admin: 'bg-red-500',
    farmer: 'bg-green-500',
    adviser: 'bg-blue-500',
    agent: 'bg-purple-500',
  };
  
  return colors[role.toLowerCase()] || 'bg-gray-500';
}