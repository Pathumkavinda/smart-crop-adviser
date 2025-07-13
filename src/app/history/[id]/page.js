'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
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

// Translations for the history detail page
const translations = {
  en: {
    title: "Soil Analysis Record",
    backToHistory: "Back to History",
    printRecord: "Print Record",
    deleteRecord: "Delete Record",
    recordNotFound: "Record not found.",
    loadingError: "Failed to fetch record data. Please try again later.",
    sections: {
      recommendedCrops: "Recommended Crops",
      nutrientLevels: "Nutrient Levels",
      fertilizerRecommendations: "Fertilizer Recommendations",
      soilConsiderations: "Soil Considerations",
      managementTips: "Management Tips",
      soilParameters: "Soil Parameters"
    },
    soilParams: {
      district: "District:",
      zone: "Zone:",
      season: "Season:",
      landArea: "Land Area:",
      soilType: "Soil Type:",
      soilPh: "Soil pH:",
      nitrogen: "Nitrogen:",
      phosphorus: "Phosphorus:",
      potassium: "Potassium:"
    },
    misc: {
      ha: "ha",
      kgHa: "kg/ha",
      forHa: "For",
      totalNeeded: "kg total needed",
      viewFullDetails: "View Full Details"
    },
    deleteModal: {
      title: "Delete Record",
      message: "Are you sure you want to delete this record? This action cannot be undone.",
      cancel: "Cancel",
      confirm: "Delete",
      success: "Record deleted successfully"
    }
  },
  si: {
    title: "පස් විශ්ලේෂණ වාර්තාව",
    backToHistory: "ඉතිහාසයට ආපසු",
    printRecord: "වාර්තාව මුද්‍රණය කරන්න",
    deleteRecord: "වාර්තාව මකන්න",
    recordNotFound: "වාර්තාව හමු නොවීය.",
    loadingError: "වාර්තා දත්ත ලබා ගැනීමට අසමත් විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.",
    sections: {
      recommendedCrops: "නිර්දේශිත බෝග",
      nutrientLevels: "පෝෂක මට්ටම්",
      fertilizerRecommendations: "පොහොර නිර්දේශ",
      soilConsiderations: "පස් සැලකිලි",
      managementTips: "කළමනාකරණ ඉඟි",
      soilParameters: "පසෙහි පරාමිතීන්"
    },
    soilParams: {
      district: "දිස්ත්‍රික්කය:",
      zone: "කලාපය:",
      season: "කන්නය:",
      landArea: "ඉඩම් ප්‍රමාණය:",
      soilType: "පස් වර්ගය:",
      soilPh: "පස් pH අගය:",
      nitrogen: "නයිට්‍රජන්:",
      phosphorus: "පොස්පරස්:",
      potassium: "පොටෑසියම්:"
    },
    misc: {
      ha: "හෙක්ටයාර",
      kgHa: "කි.ග්‍රෑ/හෙක්ටයාර",
      forHa: "සඳහා",
      totalNeeded: "කි.ග්‍රෑ මුළු අවශ්‍යතාවය",
      viewFullDetails: "සම්පූර්ණ විස්තර බලන්න"
    },
    deleteModal: {
      title: "වාර්තාව මකන්න",
      message: "ඔබට මෙම වාර්තාව මැකීමට අවශ්‍ය බව විශ්වාසද? මෙම ක්‍රියාව අහෝසි කළ නොහැක.",
      cancel: "අවලංගු කරන්න",
      confirm: "මකන්න",
      success: "වාර්තාව සාර්ථකව මකා දමන ලදී"
    }
  },
  ta: {
    title: "மண் பகுப்பாய்வு பதிவு",
    backToHistory: "வரலாற்றுக்குத் திரும்பு",
    printRecord: "பதிவை அச்சிடு",
    deleteRecord: "பதிவை நீக்கு",
    recordNotFound: "பதிவு காணப்படவில்லை.",
    loadingError: "பதிவு தரவைப் பெற முடியவில்லை. பிறகு மீண்டும் முயற்சிக்கவும்.",
    sections: {
      recommendedCrops: "பரிந்துரைக்கப்பட்ட பயிர்கள்",
      nutrientLevels: "ஊட்டச்சத்து அளவுகள்",
      fertilizerRecommendations: "உர பரிந்துரைகள்",
      soilConsiderations: "மண் கருத்துகள்",
      managementTips: "மேலாண்மை குறிப்புகள்",
      soilParameters: "மண் அளவுருக்கள்"
    },
    soilParams: {
      district: "மாவட்டம்:",
      zone: "மண்டலம்:",
      season: "பருவம்:",
      landArea: "நில பரப்பளவு:",
      soilType: "மண் வகை:",
      soilPh: "மண் pH:",
      nitrogen: "நைட்ரஜன்:",
      phosphorus: "பாஸ்பரஸ்:",
      potassium: "பொட்டாசியம்:"
    },
    misc: {
      ha: "ஹெக்டேர்",
      kgHa: "கிலோ/ஹெக்டேர்",
      forHa: "க்கு",
      totalNeeded: "கிலோ மொத்தம் தேவை",
      viewFullDetails: "முழு விவரங்களைக் காண்க"
    },
    deleteModal: {
      title: "பதிவை நீக்கு",
      message: "இந்த பதிவை நீக்க விரும்புகிறீர்களா? இந்த செயலை செயல்தவிர்க்க முடியாது.",
      cancel: "ரத்து செய்",
      confirm: "நீக்கு",
      success: "பதிவு வெற்றிகரமாக நீக்கப்பட்டது"
    }
  }
};

export default function HistoryDetail({ params }) {
  const id = params.id;
  const router = useRouter();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme.name === 'dark';
  
  const [trans, setTrans] = useState(translations.en);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [soilRecord, setSoilRecord] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);

  // Update translations when language changes with a transition effect
  useEffect(() => {
    if (language) {
      setIsTransitioning(true);
      setTimeout(() => {
        setTrans(translations[language] || translations.en);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 300);
    }
  }, [language]);

  // Inline styles for language transition
  const contentStyle = {
    opacity: isTransitioning ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
  };

  // Utility function to apply language-specific line height adjustments
  const getTextStyle = (baseStyle = {}) => {
    const langLineHeight = language === 'si' ? 1.7 : language === 'ta' ? 1.8 : 1.5;
    return {
      ...baseStyle,
      lineHeight: langLineHeight,
      transition: 'all 0.3s ease'
    };
  };

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
        setError(trans.loadingError);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, trans.loadingError]);
  
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
      alert(trans.deleteModal.success);
      
      // Navigate back to history page
      router.push('/history');
    } catch (err) {
      setError(trans.loadingError);
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

  // Function to translate suitability
  const translateSuitability = (suitability) => {
    const suitabilityTranslations = {
      'Excellent': {
        si: 'විශිෂ්ට',
        ta: 'சிறந்தது'
      },
      'Good': {
        si: 'හොඳයි',
        ta: 'நல்லது'
      },
      'Fair': {
        si: 'සාධාරණයි',
        ta: 'நியாயமானது'
      }
    };
    
    if (language === 'en') return suitability;
    
    return suitabilityTranslations[suitability]?.[language] || suitability;
  };
  
  // Function to translate severity
  const translateSeverity = (severity) => {
    const severityTranslations = {
      'High': {
        si: 'ඉහළ',
        ta: 'உயர்'
      },
      'Medium': {
        si: 'මධ්‍යම',
        ta: 'நடுத்தர'
      },
      'Low': {
        si: 'අඩු',
        ta: 'குறைந்த'
      }
    };
    
    if (language === 'en') return severity;
    
    return severityTranslations[severity]?.[language] || severity;
  };
  
  // Function to translate crop type
  const translateCropType = (cropType) => {
    const cropTypeTranslations = {
      'General': {
        si: 'සාමාන්‍ය',
        ta: 'பொது'
      }
    };
    
    if (language === 'en') return cropType;
    
    return cropTypeTranslations[cropType]?.[language] || cropType;
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
                <p 
                  className="text-sm" 
                  style={{ 
                    ...getTextStyle({ color: isDark ? '#F87171' : '#B91C1C' }),
                    ...contentStyle
                  }}
                >
                  {error}
                </p>
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
              <span style={{ ...contentStyle, ...getTextStyle() }}>
                {trans.backToHistory}
              </span>
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
                <p 
                  className="text-sm" 
                  style={{ 
                    ...getTextStyle({ color: isDark ? '#FACC15' : '#854D0E' }),
                    ...contentStyle
                  }}
                >
                  {trans.recordNotFound}
                </p>
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
              <span style={{ ...contentStyle, ...getTextStyle() }}>
                {trans.backToHistory}
              </span>
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
              <h1 
                className="text-3xl font-bold" 
                style={{ 
                  ...getTextStyle({ color: theme.colors.text }),
                  ...contentStyle
                }}
              >
                {trans.title}
              </h1>
            </div>
            <div className="flex space-x-2">
              <Link
                href="/history"
                className="p-2 rounded-full transition"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.colors.text
                }}
                title={trans.backToHistory}
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
                title={trans.printRecord}
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
                title={trans.deleteRecord}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Calendar className="h-5 w-5 mr-2" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} />
            <p 
              style={{ 
                ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }),
                ...contentStyle
              }}
            >
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
              <h2 
                className="text-xl font-semibold mb-4 flex items-center gap-2" 
                style={{ 
                  ...getTextStyle({ color: theme.colors.text }),
                  ...contentStyle
                }}
              >
                <Leaf className="h-5 w-5" style={{ color: theme.colors.primary }} />
                {trans.sections.recommendedCrops}
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
                        <h3 
                          className="font-medium" 
                          style={{ 
                            ...getTextStyle({ color: theme.colors.text }),
                            ...contentStyle
                          }}
                        >
                          {crop.name}
                        </h3>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: colorStyle.bg,
                            color: colorStyle.text
                          }}
                        >
                          <span style={{ ...contentStyle, ...getTextStyle() }}>
                            {translateSuitability(crop.suitability)}
                          </span>
                        </span>
                      </div>
                      <p 
                        className="text-sm" 
                        style={{ 
                          ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                          ...contentStyle
                        }}
                      >
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
              <h2 
                className="text-xl font-semibold mb-4 flex items-center gap-2" 
                style={{ 
                  ...getTextStyle({ color: theme.colors.text }),
                  ...contentStyle
                }}
              >
                <BarChart3 className="h-5 w-5 text-purple-500" />
                {trans.sections.nutrientLevels}
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
                <h2 
                  className="text-xl font-semibold mb-4 flex items-center gap-2" 
                  style={{ 
                    ...getTextStyle({ color: theme.colors.text }),
                    ...contentStyle
                  }}
                >
                  <Droplets className="h-5 w-5 text-blue-500" />
                  {trans.sections.fertilizerRecommendations}
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
                      <span 
                        className="text-sm"
                        style={{ ...contentStyle, ...getTextStyle() }}
                      >
                        {fertilizer.fertilizer} → {trans.misc.forHa} {soilRecord.land_area || 0} {trans.misc.ha}:{" "}
                        <strong>{fertilizer.total_amount?.toFixed(1) || "N/A"} {trans.misc.totalNeeded}</strong>
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
                <h2 
                  className="text-xl font-semibold mb-4 flex items-center gap-2" 
                  style={{ 
                    ...getTextStyle({ color: theme.colors.text }),
                    ...contentStyle
                  }}
                >
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  {trans.sections.soilConsiderations}
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
                        <span 
                          className="text-sm font-medium"
                          style={{ ...contentStyle, ...getTextStyle() }}
                        >
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
                          <span style={{ ...contentStyle, ...getTextStyle() }}>
                            {translateSeverity(issue.severity)}
                          </span>
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
                <h2 
                  className="text-xl font-semibold mb-4 flex items-center gap-2" 
                  style={{ 
                    ...getTextStyle({ color: theme.colors.text }),
                    ...contentStyle
                  }}
                >
                  <Thermometer className="h-5 w-5" style={{ color: theme.colors.primary }} />
                  {trans.sections.managementTips}
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
                        <span 
                          className="text-sm"
                          style={{ ...contentStyle, ...getTextStyle() }}
                        >
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
                            <span style={{ ...contentStyle, ...getTextStyle() }}>
                              {translateCropType(tip.crop_type)}
                            </span>
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
              <h2 
                className="text-xl font-semibold mb-4 flex items-center gap-2" 
                style={{ 
                  ...getTextStyle({ color: theme.colors.text }),
                  ...contentStyle
                }}
              >
                <MapPin className="h-5 w-5 text-purple-500" />
                {trans.sections.soilParameters}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span 
                    style={{ 
                      ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                      ...contentStyle
                    }}
                  >
                    {trans.soilParams.district}
                  </span>
                  <span 
                    className="ml-2 font-medium" 
                    style={{ 
                      ...getTextStyle({ color: theme.colors.text }),
                      ...contentStyle
                    }}
                  >
                    {soilRecord.district}
                  </span>
                </div>
                <div>
                  <span 
                    style={{ 
                      ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                      ...contentStyle
                    }}
                  >
                    {trans.soilParams.zone}
                  </span>
                  <span 
                    className="ml-2 font-medium" 
                    style={{ 
                      ...getTextStyle({ color: theme.colors.text }),
                      ...contentStyle
                    }}
                  >
                    {soilRecord.agro_zone || '-'}
                  </span>
                </div>
                <div>
                  <span 
                    style={{ 
                      ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                      ...contentStyle
                    }}
                  >
                    {trans.soilParams.season}
                  </span>
                  <span 
                    className="ml-2 font-medium" 
                    style={{ 
                      ...getTextStyle({ color: theme.colors.text }),
                      ...contentStyle
                    }}
                  >
                    {soilRecord.season}
                  </span>
                </div>
                <div>
                  <span 
                    style={{ 
                      ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                      ...contentStyle
                    }}
                  >
                    {trans.soilParams.landArea}
                  </span>
                  <span 
                    className="ml-2 font-medium" 
                    style={{ 
                      ...getTextStyle({ color: theme.colors.text }),
                      ...contentStyle
                    }}
                  >
                    {soilRecord.land_area || 0} {trans.misc.ha}
                  </span>
                </div>
                <div>
                  <span 
                    style={{ 
                      ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                      ...contentStyle
                    }}
                  >
                    {trans.soilParams.soilType}
                  </span>
                  <span 
                    className="ml-2 font-medium" 
                    style={{ 
                      ...getTextStyle({ color: theme.colors.text }),
                      ...contentStyle
                    }}
                  >
                    {soilRecord.soil_type}
                  </span>
                </div>
                <div>
                  <span 
                    style={{ 
                      ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                      ...contentStyle
                    }}
                  >
                    {trans.soilParams.soilPh}
                  </span>
                  <span 
                    className="ml-2 font-medium" 
                    style={{ 
                      ...getTextStyle({ color: theme.colors.text }),
                      ...contentStyle
                    }}
                  >
                    {soilRecord.ph}
                  </span>
                </div>
                <div>
                  <span 
                    style={{ 
                      ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                      ...contentStyle
                    }}
                  >
                    {trans.soilParams.nitrogen}
                  </span>
                  <span 
                    className="ml-2 font-medium" 
                    style={{ 
                      ...getTextStyle({ color: theme.colors.text }),
                      ...contentStyle
                    }}
                  >
                    {soilRecord.nitrogen} {trans.misc.kgHa}
                  </span>
                </div>
                <div>
                  <span 
                    style={{ 
                      ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                      ...contentStyle
                    }}
                  >
                    {trans.soilParams.phosphorus}
                  </span>
                  <span 
                    className="ml-2 font-medium" 
                    style={{ 
                      ...getTextStyle({ color: theme.colors.text }),
                      ...contentStyle
                    }}
                  >
                    {soilRecord.phosphorus} {trans.misc.kgHa}
                  </span>
                </div>
                <div>
                  <span 
                    style={{ 
                      ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                      ...contentStyle
                    }}
                  >
                    {trans.soilParams.potassium}
                  </span>
                  <span 
                    className="ml-2 font-medium" 
                    style={{ 
                      ...getTextStyle({ color: theme.colors.text }),
                      ...contentStyle
                    }}
                  >
                    {soilRecord.potassium} {trans.misc.kgHa}
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
            <span style={{ ...contentStyle, ...getTextStyle() }}>
              {trans.backToHistory}
            </span>
          </Link>
          <button
            onClick={() => setDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90"
            style={{ backgroundColor: '#EF4444' }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span style={{ ...contentStyle, ...getTextStyle() }}>
              {trans.deleteRecord}
            </span>
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
            <h3 
              className="text-lg font-medium" 
              style={{ 
                ...getTextStyle({ color: theme.colors.text }),
                ...contentStyle
              }}
            >
              {trans.deleteModal.title}
            </h3>
            <p 
              className="mt-2" 
              style={{ 
                ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }),
                ...contentStyle
              }}
            >
              {trans.deleteModal.message}
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
                <span style={{ ...contentStyle, ...getTextStyle() }}>
                  {trans.deleteModal.cancel}
                </span>
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm hover:opacity-90"
                style={{ backgroundColor: '#EF4444' }}
                onClick={handleDelete}
              >
                <span style={{ ...contentStyle, ...getTextStyle() }}>
                  {trans.deleteModal.confirm}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ThemeWrapper>
  );
}