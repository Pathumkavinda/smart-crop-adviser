'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@/context/ThemeContext';
import ThemeWrapper from '@/components/ThemeWrapper';
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
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';
  const [soilRecord, setSoilRecord] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);

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
        borderColor: isDark ? '#818CF8' : '#6366F1', 
        backgroundColor: isDark ? '#818CF8' : '#6366F1',
        tension: 0.4,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: theme.colors.border,
        borderWidth: 1
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { 
          display: true, 
          text: 'kg/ha',
          color: theme.colors.text
        },
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
        return {
          bg: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
          text: isDark ? '#86EFAC' : '#16A34A'
        };
      case 'Good':
        return {
          bg: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
          text: isDark ? '#93C5FD' : '#2563EB'
        };
      case 'Fair':
        return {
          bg: isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.1)',
          text: isDark ? '#FDE68A' : '#D97706'
        };
      default:
        return {
          bg: isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)',
          text: isDark ? '#D1D5DB' : '#4B5563'
        };
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
  
  if (error) {
    return (
      <ThemeWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-md p-4" style={{ 
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
          <div className="mt-4">
            <Link
              href="/history"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Link>
          </div>
        </div>
      </ThemeWrapper>
    );
  }
  
  if (!soilRecord) {
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
                <p className="text-sm" style={{ color: isDark ? '#FACC15' : '#854D0E' }}>Record not found.</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/history"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Link>
          </div>
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
              <Leaf className="h-8 w-8" style={{ color: theme.colors.primary }} />
              <h1 className="text-3xl font-bold" style={{ color: theme.colors.text }}>Soil Analysis Record</h1>
            </div>
            <div className="flex space-x-2">
              <Link
                href="/history"
                className="p-2 rounded-full transition"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.colors.text
                }}
                title="Back to History"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <button
                onClick={handlePrint}
                className="p-2 rounded-full transition"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.colors.text
                }}
                title="Print Record"
              >
                <Printer className="h-5 w-5" />
              </button>
              <button
                onClick={() => setDeleteModal(true)}
                className="p-2 rounded-full transition"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: '#EF4444'
                }}
                title="Delete Record"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Calendar className="h-5 w-5 mr-2" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} />
            <p style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
              {new Date(soilRecord.created_at).toLocaleDateString()} - {soilRecord.district}, {soilRecord.agro_zone}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendations Section */}
          <div className="space-y-6">
            {/* Crop Recommendations */}
            <div className="rounded-lg shadow-lg p-6 border" style={{ 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                <Leaf className="h-5 w-5" style={{ color: theme.colors.primary }} />
                Recommended Crops
              </h2>
              <div className="space-y-3">
                {recommendations.crops.map((crop, index) => {
                  const colorStyle = getSuitabilityColor(crop.suitability);
                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-4"
                      style={{ 
                        borderColor: theme.colors.border,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium" style={{ color: theme.colors.text }}>
                          {crop.name}
                        </h3>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: colorStyle.bg,
                            color: colorStyle.text
                          }}
                        >
                          {crop.suitability}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        {crop.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nutrient Chart */}
            <div className="rounded-lg shadow-lg p-6 border" style={{ 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Nutrient Levels
              </h2>
              <div className="h-64">
                <Line
                  data={nutrientChartData}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-6">
            {/* Fertilizer Recommendations */}
            {recommendations.fertilizers.length > 0 && (
              <div className="rounded-lg shadow-lg p-6 border" style={{ 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border
              }}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                  <Droplets className="h-5 w-5 text-blue-500" />
                  Fertilizer Recommendations
                </h2>
                <div className="space-y-4">
                  {recommendations.fertilizers.map((fertilizer, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-lg"
                      style={{ 
                        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                        color: isDark ? '#93C5FD' : '#2563EB'
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mt-0.5" />
                      <span className="text-sm">
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
              <div className="rounded-lg shadow-lg p-6 border" style={{ 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border
              }}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Soil Considerations
                </h2>
                <div className="space-y-2">
                  {recommendations.soil_issues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-lg"
                      style={{ 
                        backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.1)',
                        color: isDark ? '#FDBA74' : '#C2410C'
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">
                          {issue.issue}
                        </span>
                        <span
                          className="ml-2 px-1.5 py-0.5 text-xs rounded"
                          style={{ 
                            backgroundColor: issue.severity === 'High'
                              ? isDark ? 'rgba(220, 38, 38, 0.5)' : 'rgba(220, 38, 38, 0.2)'
                              : isDark ? 'rgba(234, 179, 8, 0.5)' : 'rgba(234, 179, 8, 0.2)',
                            color: issue.severity === 'High'
                              ? isDark ? '#FCA5A5' : '#B91C1C'
                              : isDark ? '#FDE68A' : '#B45309'
                          }}
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
              <div className="rounded-lg shadow-lg p-6 border" style={{ 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border
              }}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                  <Thermometer className="h-5 w-5" style={{ color: theme.colors.primary }} />
                  Management Tips
                </h2>
                <div className="space-y-2">
                  {recommendations.management_tips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-lg"
                      style={{ 
                        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                        color: isDark ? '#86EFAC' : '#16A34A'
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mt-0.5" />
                      <div>
                        <span className="text-sm">
                          {tip.tip}
                        </span>
                        {tip.crop_type && (
                          <span
                            className="ml-2 px-1.5 py-0.5 text-xs rounded"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.2)',
                              color: isDark ? '#A7F3D0' : '#065F46'
                            }}
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
            <div className="rounded-lg shadow-lg p-6 border" style={{ 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                <MapPin className="h-5 w-5 text-purple-500" />
                Soil Parameters
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    District:
                  </span>
                  <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>
                    {soilRecord.district}
                  </span>
                </div>
                <div>
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Zone:
                  </span>
                  <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>
                    {soilRecord.agro_zone || '-'}
                  </span>
                </div>
                <div>
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Season:
                  </span>
                  <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>
                    {soilRecord.season}
                  </span>
                </div>
                <div>
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Land Area:
                  </span>
                  <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>
                    {soilRecord.land_area || 0} ha
                  </span>
                </div>
                <div>
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Soil Type:
                  </span>
                  <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>
                    {soilRecord.soil_type}
                  </span>
                </div>
                <div>
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Soil pH:
                  </span>
                  <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>
                    {soilRecord.ph}
                  </span>
                </div>
                <div>
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Nitrogen:
                  </span>
                  <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>
                    {soilRecord.nitrogen} kg/ha
                  </span>
                </div>
                <div>
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Phosphorus:
                  </span>
                  <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>
                    {soilRecord.phosphorus} kg/ha
                  </span>
                </div>
                <div>
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Potassium:
                  </span>
                  <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Link>
          <button
            onClick={() => setDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90"
            style={{ backgroundColor: '#EF4444' }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Record
          </button>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-10">
          <div className="max-w-md w-full p-6 rounded-lg shadow-xl" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border
          }}>
            <h3 className="text-lg font-medium" style={{ color: theme.colors.text }}>Delete Record</h3>
            <p className="mt-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                  color: theme.colors.text,
                  borderWidth: '1px',
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
                }}
                onClick={() => setDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm hover:opacity-90"
                style={{ backgroundColor: '#EF4444' }}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ThemeWrapper>
  );
}