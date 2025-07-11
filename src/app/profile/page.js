'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '@/context/ThemeContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import {
  User,
  Calendar,
  Mail,
  Map,
  BarChart,
  Settings,
  Save,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';
  const [soilRecords, setSoilRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    name: '',
    location: '',
    farmSize: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch soil records from API
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await fetch('/api/soil', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        setSoilRecords(data.data || []);
        
        // Initialize user data with current user info
        if (user) {
          setUserData({
            username: user.username,
            email: user.email,
            name: user.full_name || '',
            location: user.location || '',
            farmSize: user.farm_size || '',
          });
        }
      } catch (err) {
        setError('Failed to fetch profile data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // In a real app, you would update the user profile via API
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: userData.name,
          location: userData.location,
          farm_size: userData.farmSize
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for crop types with theme-aware colors
  const cropTypesData = {
    labels: ['Vegetables', 'Cereals', 'Fruits', 'Other'],
    datasets: [
      {
        data: [12, 8, 5, 2],
        backgroundColor: [
          isDark ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 0.6)',
          isDark ? 'rgba(54, 162, 235, 0.8)' : 'rgba(54, 162, 235, 0.6)',
          isDark ? 'rgba(255, 159, 64, 0.8)' : 'rgba(255, 159, 64, 0.6)',
          isDark ? 'rgba(153, 102, 255, 0.8)' : 'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for soil types with theme-aware colors
  const soilTypesData = {
    labels: ['Red Yellow Podzolic', 'Reddish Brown Earth', 'Alluvial', 'Other'],
    datasets: [
      {
        data: [15, 6, 4, 2],
        backgroundColor: [
          isDark ? 'rgba(255, 99, 132, 0.8)' : 'rgba(255, 99, 132, 0.6)',
          isDark ? 'rgba(255, 159, 64, 0.8)' : 'rgba(255, 159, 64, 0.6)',
          isDark ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 0.6)',
          isDark ? 'rgba(153, 102, 255, 0.8)' : 'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options with theme-aware colors
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme.colors.text,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: theme.colors.border,
        borderWidth: 1
      }
    }
  };

  if (loading) {
    return (
      <ThemeWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
        </div>
      </ThemeWrapper>
    );
  }

  if (!user) {
    return (
      <ThemeWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-md p-4" style={{ 
            backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : '#FEF9C3',
            borderLeftWidth: '4px',
            borderLeftColor: isDark ? '#EAB308' : '#CA8A04'
          }}>
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5" style={{ color: isDark ? '#FACC15' : '#CA8A04' }} />
              </div>
              <div className="ml-3">
                <p className="text-sm" style={{ color: isDark ? '#FACC15' : '#854D0E' }}>
                  You need to be logged in to view your profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.text }}>User Profile</h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: theme.colors.primary,
              borderColor: 'transparent'
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            {editMode ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md" style={{ 
            backgroundColor: isDark ? 'rgba(220, 38, 38, 0.2)' : '#FEF2F2',
            borderLeftWidth: '4px',
            borderLeftColor: isDark ? '#EF4444' : '#DC2626'
          }}>
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5" style={{ color: isDark ? '#F87171' : '#DC2626' }} />
              </div>
              <div className="ml-3">
                <p className="text-sm" style={{ color: isDark ? '#F87171' : '#B91C1C' }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-md" style={{ 
            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#F0FDF4',
            borderLeftWidth: '4px',
            borderLeftColor: isDark ? '#4ADE80' : '#22C55E'
          }}>
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5" style={{ color: isDark ? '#86EFAC' : '#22C55E' }} />
              </div>
              <div className="ml-3">
                <p className="text-sm" style={{ color: isDark ? '#86EFAC' : '#15803D' }}>{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="md:col-span-2">
            <div className="shadow overflow-hidden sm:rounded-lg" style={{ 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}>
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium" style={{ color: theme.colors.text }}>Profile Information</h2>
                <p className="mt-1 max-w-2xl text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                  Personal details and farm information.
                </p>
              </div>
              
              {editMode ? (
                <div className="border-t px-4 py-5 sm:p-0" style={{ borderColor: theme.colors.border }}>
                  <form onSubmit={handleSubmit}>
                    <dl className="sm:divide-y sm:divide-gray-200" style={{ 
                      divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }}>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium flex items-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          <User className="mr-2 h-4 w-4" />
                          Username
                        </dt>
                        <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                          <input
                            type="text"
                            name="username"
                            value={userData.username}
                            onChange={handleChange}
                            className="max-w-lg block w-full shadow-sm sm:max-w-xs sm:text-sm rounded-md"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                              color: theme.colors.text,
                              borderWidth: '1px',
                              padding: '0.5rem 0.75rem'
                            }}
                            disabled
                          />
                          <p className="mt-1 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>Username cannot be changed.</p>
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium flex items-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          <Mail className="mr-2 h-4 w-4" />
                          Email address
                        </dt>
                        <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                          <input
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            className="max-w-lg block w-full shadow-sm sm:max-w-xs sm:text-sm rounded-md"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                              color: theme.colors.text,
                              borderWidth: '1px',
                              padding: '0.5rem 0.75rem'
                            }}
                            disabled
                          />
                          <p className="mt-1 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>Email cannot be changed.</p>
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium flex items-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          <User className="mr-2 h-4 w-4" />
                          Full name
                        </dt>
                        <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                          <input
                            type="text"
                            name="name"
                            value={userData.name}
                            onChange={handleChange}
                            className="max-w-lg block w-full shadow-sm sm:max-w-xs sm:text-sm rounded-md"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                              color: theme.colors.text,
                              borderWidth: '1px',
                              padding: '0.5rem 0.75rem'
                            }}
                          />
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium flex items-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          <Map className="mr-2 h-4 w-4" />
                          Location
                        </dt>
                        <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                          <input
                            type="text"
                            name="location"
                            value={userData.location}
                            onChange={handleChange}
                            placeholder="e.g., Kandy, Central Province"
                            className="max-w-lg block w-full shadow-sm sm:max-w-xs sm:text-sm rounded-md"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                              color: theme.colors.text,
                              borderWidth: '1px',
                              padding: '0.5rem 0.75rem'
                            }}
                          />
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium flex items-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          <Map className="mr-2 h-4 w-4" />
                          Farm size (hectares)
                        </dt>
                        <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                          <input
                            type="number"
                            name="farmSize"
                            value={userData.farmSize}
                            onChange={handleChange}
                            placeholder="e.g., 2.5"
                            className="max-w-lg block w-full shadow-sm sm:max-w-xs sm:text-sm rounded-md"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                              color: theme.colors.text,
                              borderWidth: '1px',
                              padding: '0.5rem 0.75rem'
                            }}
                          />
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium">
                          
                        </dt>
                        <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                          <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{ 
                              backgroundColor: theme.colors.primary,
                              borderColor: 'transparent'
                            }}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </button>
                        </dd>
                      </div>
                    </dl>
                  </form>
                </div>
              ) : (
                <div className="border-t px-4 py-5 sm:p-0" style={{ borderColor: theme.colors.border }}>
                  <dl className="sm:divide-y" style={{ 
                    divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }}>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium flex items-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        <User className="mr-2 h-4 w-4" />
                        Username
                      </dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                        {userData.username}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium flex items-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email address
                      </dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                        {userData.email}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium flex items-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        <User className="mr-2 h-4 w-4" />
                        Full name
                      </dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                        {userData.name || '-'}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium flex items-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        <Map className="mr-2 h-4 w-4" />
                        Location
                      </dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                        {userData.location || '-'}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium flex items-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        <Map className="mr-2 h-4 w-4" />
                        Farm size
                      </dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                        {userData.farmSize ? `${userData.farmSize} hectares` : '-'}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium flex items-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Joined
                      </dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                        {user.created_at 
                          ? new Date(user.created_at).toLocaleDateString() 
                          : 'Unknown'}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>

            {/* Activity Summary */}
            <div className="shadow overflow-hidden sm:rounded-lg mt-6" style={{ 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}>
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium" style={{ color: theme.colors.text }}>Activity Summary</h2>
                <p className="mt-1 max-w-2xl text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                  Overview of your crop analysis activities.
                </p>
              </div>
              <div className="border-t px-4 py-5 sm:p-0" style={{ borderColor: theme.colors.border }}>
                <dl className="sm:divide-y" style={{ 
                  divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }}>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Total analyses</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                      {soilRecords.length}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Unique districts</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                      {new Set(soilRecords.map(record => record.district)).size}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Most analyzed district</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                      {soilRecords.length > 0 
                        ? Object.entries(
                            soilRecords.reduce((acc, record) => {
                              acc[record.district] = (acc[record.district] || 0) + 1;
                              return acc;
                            }, {})
                          ).sort((a, b) => b[1] - a[1])[0][0]
                        : '-'}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Most recent analysis</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                      {soilRecords.length > 0 
                        ? new Date(
                            Math.max(...soilRecords.map(record => new Date(record.created_at)))
                          ).toLocaleDateString()
                        : '-'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div>
            {/* Crop Types Chart */}
            <div className="shadow overflow-hidden sm:rounded-lg mb-6" style={{ 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}>
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium flex items-center" style={{ color: theme.colors.text }}>
                  <BarChart className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                  Crop Recommendations
                </h2>
                <p className="mt-1 max-w-2xl text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                  Distribution of recommended crops.
                </p>
              </div>
              <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
                {soilRecords.length > 0 ? (
                  <div className="h-64 flex justify-center">
                    <Doughnut 
                      data={cropTypesData} 
                      options={chartOptions}
                    />
                  </div>
                ) : (
                  <p className="text-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>No data available</p>
                )}
              </div>
            </div>

            {/* Soil Types Chart */}
            <div className="shadow overflow-hidden sm:rounded-lg" style={{ 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}>
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium flex items-center" style={{ color: theme.colors.text }}>
                  <BarChart className="mr-2 h-5 w-5" style={{ color: '#8B5A2B' }} />
                  Soil Types Analyzed
                </h2>
                <p className="mt-1 max-w-2xl text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                  Distribution of soil types in your analyses.
                </p>
              </div>
              <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
                {soilRecords.length > 0 ? (
                  <div className="h-64 flex justify-center">
                    <Doughnut 
                      data={soilTypesData} 
                      options={chartOptions}
                    />
                  </div>
                ) : (
                  <p className="text-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>No data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}