'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
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

// Translations for the profile page
const translations = {
  en: {
    // Page title and buttons
    title: "User Profile",
    editProfile: "Edit Profile",
    cancelEdit: "Cancel Edit",
    saveChanges: "Save Changes",
    
    // Alerts
    loadingError: "Failed to fetch profile data. Please try again later.",
    updateError: "Failed to update profile. Please try again.",
    updateSuccess: "Profile updated successfully!",
    loginRequired: "You need to be logged in to view your profile.",
    
    // Profile information section
    profileInfo: {
      title: "Profile Information",
      subtitle: "Personal details and farm information.",
      username: "Username",
      usernameCannotChange: "Username cannot be changed.",
      email: "Email address",
      emailCannotChange: "Email cannot be changed.",
      fullName: "Full name",
      location: "Location",
      locationPlaceholder: "e.g., Kandy, Central Province",
      farmSize: "Farm size (hectares)",
      farmSizePlaceholder: "e.g., 2.5",
      joined: "Joined"
    },
    
    // Activity summary section
    activitySummary: {
      title: "Activity Summary",
      subtitle: "Overview of your crop analysis activities.",
      totalAnalyses: "Total analyses",
      uniqueDistricts: "Unique districts",
      mostAnalyzedDistrict: "Most analyzed district",
      mostRecentAnalysis: "Most recent analysis",
      noData: "No data available"
    },
    
    // Chart sections
    charts: {
      cropRecommendations: {
        title: "Crop Recommendations",
        subtitle: "Distribution of recommended crops."
      },
      soilTypes: {
        title: "Soil Types Analyzed",
        subtitle: "Distribution of soil types in your analyses."
      },
      labels: {
        vegetables: "Vegetables",
        cereals: "Cereals",
        fruits: "Fruits",
        other: "Other",
        redYellowPodzolic: "Red Yellow Podzolic",
        reddishBrownEarth: "Reddish Brown Earth",
        alluvial: "Alluvial"
      }
    }
  },
  
  si: {
    // Page title and buttons
    title: "පරිශීලක පැතිකඩ",
    editProfile: "පැතිකඩ සංස්කරණය කරන්න",
    cancelEdit: "සංස්කරණය අවලංගු කරන්න",
    saveChanges: "වෙනස්කම් සුරකින්න",
    
    // Alerts
    loadingError: "පැතිකඩ දත්ත ලබා ගැනීමට අසමත් විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.",
    updateError: "පැතිකඩ යාවත්කාලීන කිරීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.",
    updateSuccess: "පැතිකඩ සාර්ථකව යාවත්කාලීන කරන ලදී!",
    loginRequired: "ඔබගේ පැතිකඩ බැලීමට ඔබ පුරනය වී සිටිය යුතුය.",
    
    // Profile information section
    profileInfo: {
      title: "පැතිකඩ තොරතුරු",
      subtitle: "පුද්ගලික විස්තර සහ ගොවිපොළ තොරතුරු.",
      username: "පරිශීලක නාමය",
      usernameCannotChange: "පරිශීලක නාමය වෙනස් කළ නොහැක.",
      email: "විද්‍යුත් තැපැල් ලිපිනය",
      emailCannotChange: "විද්‍යුත් තැපෑල වෙනස් කළ නොහැක.",
      fullName: "සම්පූර්ණ නම",
      location: "ස්ථානය",
      locationPlaceholder: "උදා., මහනුවර, මධ්‍යම පළාත",
      farmSize: "ගොවිපොළ ප්‍රමාණය (හෙක්ටයාර)",
      farmSizePlaceholder: "උදා., 2.5",
      joined: "සම්බන්ධ වූ දිනය"
    },
    
    // Activity summary section
    activitySummary: {
      title: "ක්‍රියාකාරකම් සාරාංශය",
      subtitle: "ඔබගේ බෝග විශ්ලේෂණ ක්‍රියාකාරකම් පිළිබඳ දළ විශ්ලේෂණය.",
      totalAnalyses: "මුළු විශ්ලේෂණ",
      uniqueDistricts: "අනන්‍ය දිස්ත්‍රික්ක",
      mostAnalyzedDistrict: "වැඩිපුරම විශ්ලේෂණය කළ දිස්ත්‍රික්කය",
      mostRecentAnalysis: "නවතම විශ්ලේෂණය",
      noData: "දත්ත නොමැත"
    },
    
    // Chart sections
    charts: {
      cropRecommendations: {
        title: "බෝග නිර්දේශ",
        subtitle: "නිර්දේශිත බෝග වල ව්‍යාප්තිය."
      },
      soilTypes: {
        title: "විශ්ලේෂණය කළ පස් වර්ග",
        subtitle: "ඔබගේ විශ්ලේෂණයන්හි පස් වර්ග ව්‍යාප්තිය."
      },
      labels: {
        vegetables: "එළවළු",
        cereals: "ධාන්‍ය",
        fruits: "පලතුරු",
        other: "වෙනත්",
        redYellowPodzolic: "රතු-කහ පොඩ්සොලික්",
        reddishBrownEarth: "රතු දුඹුරු පස",
        alluvial: "මිටියාවත පස්"
      }
    }
  },
  
  ta: {
    // Page title and buttons
    title: "பயனர் சுயவிவரம்",
    editProfile: "சுயவிவரத்தைத் திருத்து",
    cancelEdit: "திருத்துவதை ரத்துசெய்",
    saveChanges: "மாற்றங்களை சேமி",
    
    // Alerts
    loadingError: "சுயவிவர தரவைப் பெற முடியவில்லை. பிறகு மீண்டும் முயற்சிக்கவும்.",
    updateError: "சுயவிவரத்தைப் புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    updateSuccess: "சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!",
    loginRequired: "உங்கள் சுயவிவரத்தைப் பார்க்க நீங்கள் உள்நுழைந்திருக்க வேண்டும்.",
    
    // Profile information section
    profileInfo: {
      title: "சுயவிவர தகவல்",
      subtitle: "தனிப்பட்ட விவரங்கள் மற்றும் பண்ணை தகவல்.",
      username: "பயனர்பெயர்",
      usernameCannotChange: "பயனர்பெயரை மாற்ற முடியாது.",
      email: "மின்னஞ்சல் முகவரி",
      emailCannotChange: "மின்னஞ்சலை மாற்ற முடியாது.",
      fullName: "முழு பெயர்",
      location: "இருப்பிடம்",
      locationPlaceholder: "எ.கா., கண்டி, மத்திய மாகாணம்",
      farmSize: "பண்ணை அளவு (ஹெக்டேர்)",
      farmSizePlaceholder: "எ.கா., 2.5",
      joined: "சேர்ந்த தேதி"
    },
    
    // Activity summary section
    activitySummary: {
      title: "செயல்பாட்டு சுருக்கம்",
      subtitle: "உங்கள் பயிர் பகுப்பாய்வு செயல்பாடுகளின் கண்ணோட்டம்.",
      totalAnalyses: "மொத்த பகுப்பாய்வுகள்",
      uniqueDistricts: "தனித்துவமான மாவட்டங்கள்",
      mostAnalyzedDistrict: "அதிகம் பகுப்பாய்வு செய்யப்பட்ட மாவட்டம்",
      mostRecentAnalysis: "சமீபத்திய பகுப்பாய்வு",
      noData: "தரவு இல்லை"
    },
    
    // Chart sections
    charts: {
      cropRecommendations: {
        title: "பயிர் பரிந்துரைகள்",
        subtitle: "பரிந்துரைக்கப்பட்ட பயிர்களின் விநியோகம்."
      },
      soilTypes: {
        title: "பகுப்பாய்வு செய்யப்பட்ட மண் வகைகள்",
        subtitle: "உங்கள் பகுப்பாய்வுகளில் மண் வகைகளின் விநியோகம்."
      },
      labels: {
        vegetables: "காய்கறிகள்",
        cereals: "தானியங்கள்",
        fruits: "பழங்கள்",
        other: "மற்றவை",
        redYellowPodzolic: "சிவப்பு மஞ்சள் போட்சோலிக்",
        reddishBrownEarth: "சிவப்பு பழுப்பு நிலம்",
        alluvial: "வண்டல் மண்"
      }
    }
  }
};

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme.name === 'dark';
  
  const [trans, setTrans] = useState(translations.en);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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
        setError(trans.loadingError);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, trans.loadingError]);

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
      
      setSuccess(trans.updateSuccess);
      setEditMode(false);
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError(trans.updateError);
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for crop types with theme-aware colors and translated labels
  const cropTypesData = {
    labels: [
      trans.charts.labels.vegetables, 
      trans.charts.labels.cereals, 
      trans.charts.labels.fruits, 
      trans.charts.labels.other
    ],
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

  // Prepare chart data for soil types with theme-aware colors and translated labels
  const soilTypesData = {
    labels: [
      trans.charts.labels.redYellowPodzolic, 
      trans.charts.labels.reddishBrownEarth, 
      trans.charts.labels.alluvial, 
      trans.charts.labels.other
    ],
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
                <p 
                  className="text-sm" 
                  style={{ 
                    ...getTextStyle({ color: isDark ? '#FACC15' : '#854D0E' }),
                    ...contentStyle
                  }}
                >
                  {trans.loginRequired}
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
          <h1 
            className="text-2xl font-bold" 
            style={{ 
              ...getTextStyle({ color: theme.colors.text }),
              ...contentStyle
            }}
          >
            {trans.title}
          </h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: theme.colors.primary,
              borderColor: 'transparent'
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span style={contentStyle}>
              {editMode ? trans.cancelEdit : trans.editProfile}
            </span>
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
                <p 
                  className="text-sm" 
                  style={{ 
                    ...getTextStyle({ color: isDark ? '#86EFAC' : '#15803D' }),
                    ...contentStyle
                  }}
                >
                  {success}
                </p>
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
                <h2 
                  className="text-lg leading-6 font-medium" 
                  style={{ 
                    ...getTextStyle({ color: theme.colors.text }),
                    ...contentStyle
                  }}
                >
                  {trans.profileInfo.title}
                </h2>
                <p 
                  className="mt-1 max-w-2xl text-sm" 
                  style={{ 
                    ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                    ...contentStyle
                  }}
                >
                  {trans.profileInfo.subtitle}
                </p>
              </div>
              
              {editMode ? (
                <div className="border-t px-4 py-5 sm:p-0" style={{ borderColor: theme.colors.border }}>
                  <form onSubmit={handleSubmit}>
                    <dl className="sm:divide-y sm:divide-gray-200" style={{ 
                      divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }}>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt 
                          className="text-sm font-medium flex items-center" 
                          style={{ 
                            ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                            ...contentStyle
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          {trans.profileInfo.username}
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
                          <p 
                            className="mt-1 text-xs" 
                            style={{ 
                              ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }),
                              ...contentStyle
                            }}
                          >
                            {trans.profileInfo.usernameCannotChange}
                          </p>
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt 
                          className="text-sm font-medium flex items-center" 
                          style={{ 
                            ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                            ...contentStyle
                          }}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          {trans.profileInfo.email}
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
                          <p 
                            className="mt-1 text-xs" 
                            style={{ 
                              ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }),
                              ...contentStyle
                            }}
                          >
                            {trans.profileInfo.emailCannotChange}
                          </p>
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt 
                          className="text-sm font-medium flex items-center" 
                          style={{ 
                            ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                            ...contentStyle
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          {trans.profileInfo.fullName}
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
                        <dt 
                          className="text-sm font-medium flex items-center" 
                          style={{ 
                            ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                            ...contentStyle
                          }}
                        >
                          <Map className="mr-2 h-4 w-4" />
                          {trans.profileInfo.location}
                        </dt>
                        <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                          <input
                            type="text"
                            name="location"
                            value={userData.location}
                            onChange={handleChange}
                            placeholder={trans.profileInfo.locationPlaceholder}
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
                        <dt 
                          className="text-sm font-medium flex items-center" 
                          style={{ 
                            ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                            ...contentStyle
                          }}
                        >
                          <Map className="mr-2 h-4 w-4" />
                          {trans.profileInfo.farmSize}
                        </dt>
                        <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ color: theme.colors.text }}>
                          <input
                            type="number"
                            name="farmSize"
                            value={userData.farmSize}
                            onChange={handleChange}
                            placeholder={trans.profileInfo.farmSizePlaceholder}
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
                            <span style={{ ...contentStyle, ...getTextStyle() }}>
                              {trans.saveChanges}
                            </span>
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
                      <dt 
                        className="text-sm font-medium flex items-center" 
                        style={{ 
                          ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                          ...contentStyle
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {trans.profileInfo.username}
                      </dt>
                      <dd 
                        className="mt-1 text-sm sm:mt-0 sm:col-span-2" 
                        style={{ 
                          ...getTextStyle({ color: theme.colors.text }),
                          ...contentStyle
                        }}
                      >
                        {userData.username}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt 
                        className="text-sm font-medium flex items-center" 
                        style={{ 
                          ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                          ...contentStyle
                        }}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        {trans.profileInfo.email}
                      </dt>
                      <dd 
                        className="mt-1 text-sm sm:mt-0 sm:col-span-2" 
                        style={{ 
                          ...getTextStyle({ color: theme.colors.text }),
                          ...contentStyle
                        }}
                      >
                        {userData.email}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt 
                        className="text-sm font-medium flex items-center" 
                        style={{ 
                          ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                          ...contentStyle
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {trans.profileInfo.fullName}
                      </dt>
                      <dd 
                        className="mt-1 text-sm sm:mt-0 sm:col-span-2" 
                        style={{ 
                          ...getTextStyle({ color: theme.colors.text }),
                          ...contentStyle
                        }}
                      >
                        {userData.name || '-'}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt 
                        className="text-sm font-medium flex items-center" 
                        style={{ 
                          ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                          ...contentStyle
                        }}
                      >
                        <Map className="mr-2 h-4 w-4" />
                        {trans.profileInfo.location}
                      </dt>
                      <dd 
                        className="mt-1 text-sm sm:mt-0 sm:col-span-2" 
                        style={{ 
                          ...getTextStyle({ color: theme.colors.text }),
                          ...contentStyle
                        }}
                      >
                        {userData.location || '-'}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt 
                        className="text-sm font-medium flex items-center" 
                        style={{ 
                          ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                          ...contentStyle
                        }}
                      >
                        <Map className="mr-2 h-4 w-4" />
                        {trans.profileInfo.farmSize}
                      </dt>
                      <dd 
                        className="mt-1 text-sm sm:mt-0 sm:col-span-2" 
                        style={{ 
                          ...getTextStyle({ color: theme.colors.text }),
                          ...contentStyle
                        }}
                      >
                        {userData.farmSize ? `${userData.farmSize} hectares` : '-'}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt 
                        className="text-sm font-medium flex items-center" 
                        style={{ 
                          ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                          ...contentStyle
                        }}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {trans.profileInfo.joined}
                      </dt>
                      <dd 
                        className="mt-1 text-sm sm:mt-0 sm:col-span-2" 
                        style={{ 
                          ...getTextStyle({ color: theme.colors.text }),
                          ...contentStyle
                        }}
                      >
                        {user.created_at 
                          ? new Date(user.created_at).toLocaleDateString() 
                          : '-'}
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
                <h2 
                  className="text-lg leading-6 font-medium" 
                  style={{ 
                    ...getTextStyle({ color: theme.colors.text }),
                    ...contentStyle
                  }}
                >
                  {trans.activitySummary.title}
                </h2>
                <p 
                  className="mt-1 max-w-2xl text-sm" 
                  style={{ 
                    ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                    ...contentStyle
                  }}
                >
                  {trans.activitySummary.subtitle}
                </p>
              </div>
              <div className="border-t px-4 py-5 sm:p-0" style={{ borderColor: theme.colors.border }}>
                <dl className="sm:divide-y" style={{ 
                  divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }}>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt 
                      className="text-sm font-medium" 
                      style={{ 
                        ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                        ...contentStyle
                      }}
                    >
                      {trans.activitySummary.totalAnalyses}
                    </dt>
                    <dd 
                      className="mt-1 text-sm sm:mt-0 sm:col-span-2" 
                      style={{ 
                        ...getTextStyle({ color: theme.colors.text }),
                        ...contentStyle
                      }}
                    >
                      {soilRecords.length}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt 
                      className="text-sm font-medium" 
                      style={{ 
                        ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                        ...contentStyle
                      }}
                    >
                      {trans.activitySummary.uniqueDistricts}
                    </dt>
                    <dd 
                      className="mt-1 text-sm sm:mt-0 sm:col-span-2" 
                      style={{ 
                        ...getTextStyle({ color: theme.colors.text }),
                        ...contentStyle
                      }}
                    >
                      {new Set(soilRecords.map(record => record.district)).size}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt 
                      className="text-sm font-medium" 
                      style={{ 
                        ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                        ...contentStyle
                      }}
                    >
                      {trans.activitySummary.mostAnalyzedDistrict}
                    </dt>
                    <dd 
                      className="mt-1 text-sm sm:mt-0 sm:col-span-2" 
                      style={{ 
                        ...getTextStyle({ color: theme.colors.text }),
                        ...contentStyle
                      }}
                    >
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
                    <dt 
                      className="text-sm font-medium" 
                      style={{ 
                        ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                        ...contentStyle
                      }}
                    >
                      {trans.activitySummary.mostRecentAnalysis}
                    </dt>
                    <dd 
                      className="mt-1 text-sm sm:mt-0 sm:col-span-2" 
                      style={{ 
                        ...getTextStyle({ color: theme.colors.text }),
                        ...contentStyle
                      }}
                    >
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
                <h2 
                  className="text-lg leading-6 font-medium flex items-center" 
                  style={{ 
                    ...getTextStyle({ color: theme.colors.text }),
                    ...contentStyle
                  }}
                >
                  <BarChart className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                  {trans.charts.cropRecommendations.title}
                </h2>
                <p 
                  className="mt-1 max-w-2xl text-sm" 
                  style={{ 
                    ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                    ...contentStyle
                  }}
                >
                  {trans.charts.cropRecommendations.subtitle}
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
                  <p 
                    className="text-center" 
                    style={{ 
                      ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                      ...contentStyle
                    }}
                  >
                    {trans.activitySummary.noData}
                  </p>
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
                <h2 
                  className="text-lg leading-6 font-medium flex items-center" 
                  style={{ 
                    ...getTextStyle({ color: theme.colors.text }),
                    ...contentStyle
                  }}
                >
                  <BarChart className="mr-2 h-5 w-5" style={{ color: '#8B5A2B' }} />
                  {trans.charts.soilTypes.title}
                </h2>
                <p 
                  className="mt-1 max-w-2xl text-sm" 
                  style={{ 
                    ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                    ...contentStyle
                  }}
                >
                  {trans.charts.soilTypes.subtitle}
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
                  <p 
                    className="text-center" 
                    style={{ 
                      ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }),
                      ...contentStyle
                    }}
                  >
                    {trans.activitySummary.noData}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}