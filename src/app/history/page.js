'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import { 
  Clock, // For history icon
  Leaf, 
  MapPin,
  Calendar,
  Moon,
  Sun,
  AlertTriangle
} from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.name === 'dark';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState('');

  // Check authentication status and fetch history data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // You would replace this with your actual auth check
        const response = await fetch('/api/auth/check');
        
        if (!response.ok) {
          throw new Error('Authentication required');
        }
        
        setIsAuthenticated(true);
        fetchHistoryData();
      } catch (error) {
        console.error('Authentication error:', error.message);
        setError(error.message);
        setIsAuthenticated(false);
        setIsLoading(false);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch history data
  const fetchHistoryData = async () => {
    try {
      // You would replace this with your actual data fetching
      const response = await fetch('/api/soil-history');
      
      if (!response.ok) {
        throw new Error('Failed to fetch history data');
      }
      
      // For demonstration, I'll create mock data since we don't have the actual API
      // In a real implementation, you would use: const data = await response.json();
      const mockData = [
        {
          id: 1,
          date: '2025-06-10',
          district: 'Colombo',
          agroZone: 'WL1a',
          season: 'Yala',
          soilType: 'Red Yellow Podzolic',
          pH: 6.2,
          nitrogen: 28,
          phosphorus: 19,
          potassium: 210,
          recommendations: ['Tomato - Maheshi', 'Tomato - Thilina', 'Maize - Pacific 984']
        },
        {
          id: 2,
          date: '2025-05-15',
          district: 'Kandy',
          agroZone: 'WM1a',
          season: 'Yala',
          soilType: 'Reddish Brown Earth',
          pH: 5.8,
          nitrogen: 32,
          phosphorus: 22,
          potassium: 195,
          recommendations: ['Potato - Granola', 'Carrot - New Kuroda', 'Tomato - Maheshi']
        },
        {
          id: 3,
          date: '2025-03-20',
          district: 'Hambantota',
          agroZone: 'DL1a',
          season: 'Maha',
          soilType: 'Reddish Brown Earth',
          pH: 6.5,
          nitrogen: 35,
          phosphorus: 24,
          potassium: 220,
          recommendations: ['Big Onion - Hybrid 62', 'Red Onion - Vethalan', 'Maize - Arjun']
        }
      ];
      
      setHistoryData(mockData);
      setIsLoading(false);
    } catch (error) {
      console.error('Data fetch error:', error.message);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Format date to locale string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <ThemeWrapper className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" 
               style={{ borderColor: theme.colors.primary }} 
               role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2" style={{ color: theme.colors.text }}>Loading your soil test history...</p>
        </div>
      </ThemeWrapper>
    );
  }

  // Render authentication error
  if (!isAuthenticated && error) {
    return (
      <ThemeWrapper className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 rounded-lg shadow-lg" style={{ 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border
        }}>
          <div className="text-center mb-4">
            <AlertTriangle size={48} className="mx-auto" style={{ color: '#EF4444' }} />
            <h2 className="text-xl font-semibold mt-2" style={{ color: theme.colors.text }}>Authentication Error</h2>
          </div>
          <p className="mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
            {error}. Redirecting to login...
          </p>
          <button 
            onClick={() => router.push('/login')} 
            className="w-full py-2 px-4 rounded-md hover:opacity-90 transition duration-200 font-medium text-white"
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
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="rounded-lg shadow-lg p-6 mb-6" style={{ 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8" style={{ color: theme.colors.primary }} />
              <h1 className="text-3xl font-bold" style={{ color: theme.colors.text }}>Soil Test History</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/"
                className="px-4 py-2 rounded-md transition"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.colors.text
                }}
              >
                Back to Dashboard
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full transition"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#FACC15' : theme.colors.text
                }}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <p style={{ 
            marginTop: '0.5rem',
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
          }}>
            View your past soil tests and crop recommendations
          </p>
        </div>

        {/* History Cards */}
        <div className="space-y-6">
          {historyData.length === 0 ? (
            <div className="rounded-lg shadow-lg p-6 border" style={{ 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }}>
              <p className="text-center py-8" style={{ color: theme.colors.text }}>
                No soil test history found. Start by adding a soil test on the main dashboard.
              </p>
            </div>
          ) : (
            historyData.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg shadow-lg p-6 border"
                style={{ 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border
                }}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: theme.colors.text }}>
                      Soil Test #{entry.id}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <Calendar className="h-4 w-4" style={{ color: '#3B82F6' }} />
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                        {formatDate(entry.date)}
                      </span>
                      <MapPin className="h-4 w-4 ml-2" style={{ color: '#3B82F6' }} />
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                        {entry.district}, {entry.agroZone}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ 
                      backgroundColor: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
                      color: isDark ? '#C4B5FD' : '#7C3AED'
                    }}>
                      {entry.season} Season
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ 
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                      color: isDark ? '#93C5FD' : '#2563EB'
                    }}>
                      {entry.soilType}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Soil Parameters */}
                  <div className="p-4 rounded-lg" style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                  }}>
                    <h3 className="text-md font-medium mb-3" style={{ color: theme.colors.text }}>
                      Soil Parameters
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                          pH Level:
                        </span>
                        <p className="font-medium" style={{ color: theme.colors.text }}>{entry.pH}</p>
                      </div>
                      <div>
                        <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                          Nitrogen (N):
                        </span>
                        <p className="font-medium" style={{ color: theme.colors.text }}>{entry.nitrogen} ppm</p>
                      </div>
                      <div>
                        <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                          Phosphorus (P):
                        </span>
                        <p className="font-medium" style={{ color: theme.colors.text }}>{entry.phosphorus} ppm</p>
                      </div>
                      <div>
                        <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                          Potassium (K):
                        </span>
                        <p className="font-medium" style={{ color: theme.colors.text }}>{entry.potassium} ppm</p>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Crops */}
                  <div className="p-4 rounded-lg" style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                  }}>
                    <h3 className="text-md font-medium mb-3" style={{ color: theme.colors.text }}>
                      Recommended Crops
                    </h3>
                    <div className="space-y-2">
                      {entry.recommendations.map((crop, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 py-1.5 px-3 rounded-lg"
                          style={{ 
                            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                            color: isDark ? '#86EFAC' : '#16A34A'
                          }}
                        >
                          <Leaf className="h-4 w-4" style={{ color: theme.colors.primary }} />
                          <span className="text-sm">
                            {crop}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => router.push(`/detail/${entry.id}`)}
                    className="text-sm px-4 py-2 rounded-md transition text-white"
                    style={{ backgroundColor: isDark ? '#3B82F6' : '#2563EB' }}
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ThemeWrapper>
  );
}