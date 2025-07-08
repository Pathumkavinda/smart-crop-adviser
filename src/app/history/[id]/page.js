'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import {
  Leaf,
  MapPin,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Droplets,
  Thermometer,
  Calendar,
  ArrowLeft,
  Printer,
  Trash2,
} from 'lucide-react';

export default function HistoryDetail({ params }) {
  const id = params.id;
  const router = useRouter();
  const [soilRecord, setSoilRecord] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [theme, setTheme] = useState('light');

  // Load record data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, fetch from API
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await fetch(`/api/soil/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch record');
        }
        
        const data = await response.json();
        setSoilRecord(data.data);
        
        // Fetch recommendations
        // In a real app, you would fetch actual recommendations from the API
        // For now, we'll use a mock response
        const mockRecommendations = {
          crops: [
            {
              name: "Potato - Granola",
              suitability: "Excellent",
              reason: "Optimal soil pH and nutrients",
              score: 8.7
            },
            {
              name: "Big Onion - Hybrid 62",
              suitability: "Good",
              reason: "Suitable for your soil type and region",
              score: 7.5
            },
            {
              name: "Tomato - Thilina",
              suitability: "Good",
              reason: "Matches your agro-ecological zone",
              score: 7.2
            },
            {
              name: "Maize - Pacific 984",
              suitability: "Fair",
              reason: "Adequate conditions but not optimal",
              score: 6.3
            }
          ],
          soil_issues: [
            {
              issue: "Phosphorus level is somewhat low",
              severity: "Medium"
            }
          ],
          fertilizers: [
            {
              fertilizer: "Triple Super Phosphate (0-46-0)",
              amount_per_hectare: "25-50 kg/ha",
              total_amount: 37.5 * (data.data.land_area || 1)
            }
          ],
          management_tips: [
            {
              tip: "Apply organic matter 2-3 weeks before planting",
              crop_type: "General"
            },
            {
              tip: "Implement crop rotation to prevent soil depletion",
              crop_type: "General"
            },
            {
              tip: "Monitor soil moisture carefully during dry periods",
              crop_type: "General"
            }
          ]
        };
        
        setRecommendations(mockRecommendations);
      } catch (err) {
        setError('Failed to fetch record data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set theme based on system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, [id]);
  
  // Prepare chart data
  const nutrientChartData = {
    labels: ['Nitrogen', 'Phosphorus', 'Potassium'],
    datasets: [
      {
        label: 'Current Levels (kg/ha)',
        data: [
          soilRecord?.nitrogen || 0,
          soilRecord?.phosphorus || 0,
          soilRecord?.potassium || 0,
        ],
        borderColor: '#6366F1', 
        backgroundColor: '#6366F1',
        tension: 0.4,
      },
    ],
  };
  
  // Handle printing
  const handlePrint = () => {
    window.print();
  };
  
  // Handle delete
  const handleDelete = async () => {
    try {
      // In a real app, you would delete the record via API
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`/api/soil/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete record');
      }
      
      // Show success message
      alert('Record deleted successfully');
      
      // Navigate back to history page
      router.push('/history');
    } catch (err) {
      setError('Failed to delete record. Please try again later.');
      console.error(err);
    }
  };
  
  // Helper function for suitability colors
  const getSuitabilityColor = (suitability) => {
    switch (suitability) {
      case 'Excellent':
        return theme === 'dark'
          ? 'text-green-400 bg-green-900/30'
          : 'text-green-600 bg-green-100';
      case 'Good':
        return theme === 'dark'
          ? 'text-blue-400 bg-blue-900/30'
          : 'text-blue-600 bg-blue-100';
      case 'Fair':
        return theme === 'dark'
          ? 'text-yellow-400 bg-yellow-900/30'
          : 'text-yellow-600 bg-yellow-100';
      default:
        return theme === 'dark'
          ? 'text-gray-400 bg-gray-800'
          : 'text-gray-600 bg-gray-100';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/history"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Link>
        </div>
      </div>
    );
  }
  
  if (!soilRecord) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Record not found.</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/history"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Link>
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
              <Leaf className="h-8 w-8 text-green-500" />
              <h1 className="text-3xl font-bold">Soil Analysis Record</h1>
            </div>
            <div className="flex space-x-2">
              <Link
                href="/history"
                className={`p-2 rounded-full transition ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title="Back to History"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <button
                onClick={handlePrint}
                className={`p-2 rounded-full transition ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title="Print Record"
              >
                <Printer className="h-5 w-5" />
              </button>
              <button
                onClick={() => setDeleteModal(true)}
                className={`p-2 rounded-full transition text-red-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title="Delete Record"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {new Date(soilRecord.created_at).toLocaleDateString()} - {soilRecord.district}, {soilRecord.agro_zone}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendations Section */}
          <div className="space-y-6">
            {/* Crop Recommendations */}
            <div
              className={`rounded-lg shadow-lg p-6 border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}
              >
                <Leaf className="h-5 w-5 text-green-500" />
                Recommended Crops
              </h2>
              <div className="space-y-3">
                {recommendations.crops.map((crop, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}
                      >
                        {crop.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSuitabilityColor(
                          crop.suitability
                        )}`}
                      >
                        {crop.suitability}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {crop.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrient Chart */}
            <div
              className={`rounded-lg shadow-lg p-6 border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}
              >
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Nutrient Levels
              </h2>
              <div className="h-64">
                <Line
                  data={nutrientChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'kg/ha' },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-6">
            {/* Fertilizer Recommendations */}
            {recommendations.fertilizers.length > 0 && (
              <div
                className={`rounded-lg shadow-lg p-6 border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <h2
                  className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                  }`}
                >
                  <Droplets className="h-5 w-5 text-blue-500" />
                  Fertilizer Recommendations
                </h2>
                <div className="space-y-4">
                  {recommendations.fertilizers.map((fertilizer, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                      }`}
                    >
                      <CheckCircle
                        className={`h-4 w-4 mt-0.5 ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                        }`}
                      >
                        {fertilizer.fertilizer} → For {soilRecord.land_area || 0} ha:{" "}
                        <strong>{fertilizer.total_amount?.toFixed(1) || "N/A"} kg</strong> total needed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soil Issues */}
            {recommendations.soil_issues.length > 0 && (
              <div
                className={`rounded-lg shadow-lg p-6 border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <h2
                  className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                  }`}
                >
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Soil Considerations
                </h2>
                <div className="space-y-2">
                  {recommendations.soil_issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-50'
                      }`}
                    >
                      <AlertTriangle
                        className={`h-4 w-4 mt-0.5 ${
                          theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                        }`}
                      />
                      <div>
                        <span
                          className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-orange-300' : 'text-orange-800'
                          }`}
                        >
                          {issue.issue}
                        </span>
                        <span
                          className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                            issue.severity === 'High'
                              ? theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                              : theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {issue.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Management Tips */}
            {recommendations.management_tips && recommendations.management_tips.length > 0 && (
              <div
                className={`rounded-lg shadow-lg p-6 border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <h2
                  className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                  }`}
                >
                  <Thermometer className="h-5 w-5 text-green-500" />
                  Management Tips
                </h2>
                <div className="space-y-2">
                  {recommendations.management_tips.map((tip, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'
                      }`}
                    >
                      <CheckCircle
                        className={`h-4 w-4 mt-0.5 ${
                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`}
                      />
                      <div>
                        <span
                          className={`text-sm ${
                            theme === 'dark' ? 'text-green-300' : 'text-green-800'
                          }`}
                        >
                          {tip.tip}
                        </span>
                        {tip.crop_type && (
                          <span
                            className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                              theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-200 text-green-800'
                            }`}
                          >
                            {tip.crop_type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soil Parameters */}
            <div
              className={`rounded-lg shadow-lg p-6 border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}
              >
                <MapPin className="h-5 w-5 text-purple-500" />
                Soil Parameters
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    District:
                  </span>
                  <span
                    className={`ml-2 font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {soilRecord.district}
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Zone:
                  </span>
                  <span
                    className={`ml-2 font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {soilRecord.agro_zone || '-'}
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Season:
                  </span>
                  <span
                    className={`ml-2 font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {soilRecord.season}
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Land Area:
                  </span>
                  <span
                    className={`ml-2 font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {soilRecord.land_area || 0} ha
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Soil Type:
                  </span>
                  <span
                    className={`ml-2 font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {soilRecord.soil_type}
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Soil pH:
                  </span>
                  <span
                    className={`ml-2 font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {soilRecord.ph}
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Nitrogen:
                  </span>
                  <span
                    className={`ml-2 font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {soilRecord.nitrogen} kg/ha
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Phosphorus:
                  </span>
                  <span
                    className={`ml-2 font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {soilRecord.phosphorus} kg/ha
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Potassium:
                  </span>
                  <span
                    className={`ml-2 font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {soilRecord.potassium} kg/ha
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="mt-8 flex justify-between">
          <Link
            href="/history"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Link>
          <button
            onClick={() => setDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Record
          </button>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-10">
          <div className={`max-w-md w-full p-6 rounded-lg shadow-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Delete Record</h3>
            <p className={`mt-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                onClick={() => setDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}