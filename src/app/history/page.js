'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Custom SVG Icons (same as in your crop adviser page)
const IconHistory = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path>
    <path d="M12 7v5l3 3"></path>
  </svg>
);

const IconLeaf = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13c0-3.4 2.2-6.2 5.2-7.2A7 7 0 0 0 16 13c0 3.4-2.2 6.2-5.2 7.2"/>
    <path d="M15.5 9.5a4 4 0 0 0-6.5 4.5"/>
    <path d="M22 12c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2s10 4.5 10 10z"/>
  </svg>
);

const IconMapPin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const IconMoon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);

const IconSun = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41 1.41"/>
    <path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);

// Main History component
export default function HistoryPage() {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
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

  // Detect theme preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-green-50 to-blue-50 text-gray-800'
      }`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2">Loading your soil test history...</p>
        </div>
      </div>
    );
  }

  // Render authentication error
  if (!isAuthenticated && error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-green-50 to-blue-50 text-gray-800'
      }`}>
        <div className={`max-w-md w-full p-6 rounded-lg shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 className="text-xl font-semibold mt-2">Authentication Error</h2>
          </div>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {error}. Redirecting to login...
          </p>
          <button 
            onClick={() => router.push('/login')} 
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-green-50 to-blue-50 text-gray-800'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div
          className={`rounded-lg shadow-lg p-6 mb-6 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 text-green-500">
                <IconHistory />
              </div>
              <h1 className="text-3xl font-bold">Soil Test History</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/"
                className={`px-4 py-2 rounded-md transition ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Back to Dashboard
              </Link>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {theme === 'dark' ? <IconSun /> : <IconMoon />}
              </button>
            </div>
          </div>
          <p
            className={`mt-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            View your past soil tests and crop recommendations
          </p>
        </div>

        {/* History Cards */}
        <div className="space-y-6">
          {historyData.length === 0 ? (
            <div 
              className={`rounded-lg shadow-lg p-6 border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <p className="text-center py-8">No soil test history found. Start by adding a soil test on the main dashboard.</p>
            </div>
          ) : (
            historyData.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-lg shadow-lg p-6 border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <h2 className={`text-xl font-semibold ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      Soil Test #{entry.id}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <div className="h-4 w-4 text-blue-500">
                        <IconCalendar />
                      </div>
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        {formatDate(entry.date)}
                      </span>
                      <div className="h-4 w-4 text-blue-500 ml-2">
                        <IconMapPin />
                      </div>
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        {entry.district}, {entry.agroZone}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {entry.season} Season
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {entry.soilType}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Soil Parameters */}
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <h3 className={`text-md font-medium mb-3 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Soil Parameters
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          pH Level:
                        </span>
                        <p className="font-medium">{entry.pH}</p>
                      </div>
                      <div>
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Nitrogen (N):
                        </span>
                        <p className="font-medium">{entry.nitrogen} ppm</p>
                      </div>
                      <div>
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Phosphorus (P):
                        </span>
                        <p className="font-medium">{entry.phosphorus} ppm</p>
                      </div>
                      <div>
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Potassium (K):
                        </span>
                        <p className="font-medium">{entry.potassium} ppm</p>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Crops */}
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <h3 className={`text-md font-medium mb-3 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Recommended Crops
                    </h3>
                    <div className="space-y-2">
                      {entry.recommendations.map((crop, index) => (
                        <div 
                          key={index}
                          className={`flex items-center gap-2 py-1.5 px-3 rounded-lg ${
                            theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'
                          }`}
                        >
                          <div className="h-4 w-4 text-green-500">
                            <IconLeaf />
                          </div>
                          <span className={`text-sm ${
                            theme === 'dark' ? 'text-green-300' : 'text-green-800'
                          }`}>
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
                    className={`text-sm px-4 py-2 rounded-md transition ${
                      theme === 'dark'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}