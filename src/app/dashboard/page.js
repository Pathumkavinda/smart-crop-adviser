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
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Nitrogen (kg/ha)',
        data: soilRecords.slice(0, 5).map(record => record.nitrogen),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Phosphorus (kg/ha)',
        data: soilRecords.slice(0, 5).map(record => record.phosphorus),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
      },
      {
        label: 'Potassium (kg/ha)',
        data: soilRecords.slice(0, 5).map(record => record.potassium),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/adviser"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          New Analysis
          <ArrowRight size={16} className="ml-2" />
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Analyses
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {soilRecords.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Map className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Regions Analyzed
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {new Set(soilRecords.map(record => record.district)).size}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Last Analysis
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
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

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CloudRain className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Season
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
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
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Soil Analysis</h2>
          <BarChart className="h-5 w-5 text-gray-400" />
        </div>
        {soilRecords.length > 0 ? (
          <div className="h-80">
            <Bar 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        ) : (
          <p className="text-gray-500">No soil analysis data available. Start by creating a new analysis.</p>
        )}
      </div>

      {/* Recent Recommendations */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Recommendations</h2>
          <Leaf className="h-5 w-5 text-green-600" />
        </div>
        {recentRecommendations.length > 0 ? (
          <div className="space-y-4">
            {recentRecommendations.map((rec) => (
              <div key={rec.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900">{rec.cropName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rec.suitability === 'Excellent' ? 'bg-green-100 text-green-800' :
                    rec.suitability === 'Good' ? 'bg-blue-100 text-blue-800' :
                    rec.suitability === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {rec.suitability}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <span>Score: {rec.score.toFixed(1)}/10</span>
                  <span className="mx-2">•</span>
                  <span>District: {rec.soilRecord.district}</span>
                  <span className="mx-2">•</span>
                  <span>Season: {rec.soilRecord.season}</span>
                </div>
                <div className="mt-2">
                  <Link
                    href={`/history/${rec.soilRecord.id}`}
                    className="text-sm text-green-600 hover:text-green-500"
                  >
                    View full details
                  </Link>
                </div>
              </div>
            ))}
            <div className="mt-4 text-center">
              <Link
                href="/history"
                className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-500"
              >
                View all history
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No recommendations available. Start by creating a new soil analysis.</p>
        )}
      </div>
    </div>
  );
}