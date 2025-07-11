'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { 
  Leaf, 
  BarChart, 
  Calendar, 
  Map, 
  CloudRain, 
  ArrowRight 
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import ThemeWrapper from '@/components/ThemeWrapper';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';
  const [soilRecords, setSoilRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentRecommendations, setRecentRecommendations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, fetch from API
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
        
        // Get most recent soil records for chart
        const sortedRecords = [...(data.data || [])].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        // For demonstration, we'll create mock recommendations
        // In a real app, you'd fetch these from the API
        if (sortedRecords.length > 0) {
          setRecentRecommendations([
            {
              id: 1,
              soilRecord: sortedRecords[0],
              cropName: "Potato - Granola",
              suitability: "Excellent",
              score: 8.7
            },
            {
              id: 2,
              soilRecord: sortedRecords[0],
              cropName: "Big Onion - Hybrid 62",
              suitability: "Good",
              score: 7.5
            },
            {
              id: 3,
              soilRecord: sortedRecords[0],
              cropName: "Tomato - Thilina",
              suitability: "Good",
              score: 7.2
            }
          ]);
        }
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data from soil records
  const chartData = {
    labels: soilRecords.slice(0, 5).map(record => 
      `${record.district} (${new Date(record.created_at).toLocaleDateString()})`
    ),
    datasets: [
      {
        label: 'pH',
        data: soilRecords.slice(0, 5).map(record => record.ph),
        backgroundColor: isDark ? 'rgba(54, 162, 235, 0.8)' : 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Nitrogen (kg/ha)',
        data: soilRecords.slice(0, 5).map(record => record.nitrogen),
        backgroundColor: isDark ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Phosphorus (kg/ha)',
        data: soilRecords.slice(0, 5).map(record => record.phosphorus),
        backgroundColor: isDark ? 'rgba(255, 159, 64, 0.8)' : 'rgba(255, 159, 64, 0.6)',
      },
      {
        label: 'Potassium (kg/ha)',
        data: soilRecords.slice(0, 5).map(record => record.potassium),
        backgroundColor: isDark ? 'rgba(153, 102, 255, 0.8)' : 'rgba(153, 102, 255, 0.6)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.colors.text
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: theme.colors.border,
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme.colors.text
        }
      },
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme.colors.text
        }
      }
    },
  };

  const getSuitabilityStyle = (suitability) => {
    switch (suitability) {
      case 'Excellent':
        return isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
      case 'Good':
        return isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'Fair':
        return isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      default:
        return isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800';
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

  return (
    <ThemeWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.text }}>Dashboard</h1>
          <Link
            href="/adviser"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: theme.colors.primary,
              borderColor: 'transparent'
            }}
          >
            New Analysis
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md" style={{ 
            backgroundColor: isDark ? 'rgba(220, 38, 38, 0.2)' : '#FEF2F2',
            color: isDark ? '#F87171' : '#B91C1C'
          }}>
            <p>{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="overflow-hidden shadow rounded-lg" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Leaf className="h-6 w-6" style={{ color: theme.colors.primary }} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium truncate" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      Total Analyses
                    </dt>
                    <dd>
                      <div className="text-lg font-medium" style={{ color: theme.colors.text }}>
                        {soilRecords.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden shadow rounded-lg" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Map className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium truncate" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      Regions Analyzed
                    </dt>
                    <dd>
                      <div className="text-lg font-medium" style={{ color: theme.colors.text }}>
                        {new Set(soilRecords.map(record => record.district)).size}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden shadow rounded-lg" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium truncate" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      Last Analysis
                    </dt>
                    <dd>
                      <div className="text-lg font-medium" style={{ color: theme.colors.text }}>
                        {soilRecords.length > 0
                          ? new Date(soilRecords[0].created_at).toLocaleDateString()
                          : 'No data'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden shadow rounded-lg" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CloudRain className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium truncate" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      Active Season
                    </dt>
                    <dd>
                      <div className="text-lg font-medium" style={{ color: theme.colors.text }}>
                        {soilRecords.length > 0
                          ? soilRecords[0].season
                          : 'N/A'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Soil Data Chart */}
        <div className="shadow rounded-lg p-6 mb-6" style={{ 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          color: theme.colors.text
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium" style={{ color: theme.colors.text }}>Recent Soil Analysis</h2>
            <BarChart className="h-5 w-5" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} />
          </div>
          {soilRecords.length > 0 ? (
            <div className="h-80">
              <Bar 
                data={chartData} 
                options={chartOptions}
              />
            </div>
          ) : (
            <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              No soil analysis data available. Start by creating a new analysis.
            </p>
          )}
        </div>

        {/* Recent Recommendations */}
        <div className="shadow rounded-lg p-6" style={{ 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          color: theme.colors.text
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium" style={{ color: theme.colors.text }}>Recent Recommendations</h2>
            <Leaf className="h-5 w-5" style={{ color: theme.colors.primary }} />
          </div>
          {recentRecommendations.length > 0 ? (
            <div className="space-y-4">
              {recentRecommendations.map((rec) => (
                <div 
                  key={rec.id} 
                  className="border rounded-lg p-4 hover:opacity-90 transition" 
                  style={{ 
                    borderColor: theme.colors.border,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                  }}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium" style={{ color: theme.colors.text }}>{rec.cropName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSuitabilityStyle(rec.suitability)}`}>
                      {rec.suitability}
                    </span>
                  </div>
                  <div className="mt-2 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    <span>Score: {rec.score.toFixed(1)}/10</span>
                    <span className="mx-2">•</span>
                    <span>District: {rec.soilRecord.district}</span>
                    <span className="mx-2">•</span>
                    <span>Season: {rec.soilRecord.season}</span>
                  </div>
                  <div className="mt-2">
                    <Link
                      href={`/history/${rec.soilRecord.id}`}
                      className="text-sm hover:opacity-80"
                      style={{ color: theme.colors.primary }}
                    >
                      View full details
                    </Link>
                  </div>
                </div>
              ))}
              <div className="mt-4 text-center">
                <Link
                  href="/history"
                  className="inline-flex items-center text-sm font-medium hover:opacity-80"
                  style={{ color: theme.colors.primary }}
                >
                  View all history
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          ) : (
            <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              No recommendations available. Start by creating a new soil analysis.
            </p>
          )}
        </div>
      </div>
    </ThemeWrapper>
  );
}