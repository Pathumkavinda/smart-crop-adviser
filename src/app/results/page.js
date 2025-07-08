'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Leaf,
  MapPin,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Droplets,
  Thermometer,
  ArrowLeft,
  Download,
  Printer,
  Sun
} from 'lucide-react';

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState('light');
  
  // In Next.js, we can't pass complex state through router.
  // Instead, we can store it in sessionStorage when navigating from the adviser page,
  // and retrieve it here. Alternative: use a global state management solution.
  
  // Get data from session storage if available
  const [recommendations, setRecommendations] = useState(null);
  const [soilData, setSoilData] = useState(null);
  const [weather, setWeather] = useState(null);
  
  useEffect(() => {
    // Retrieve data from sessionStorage
    const sessionData = sessionStorage.getItem('analysisResults');
    if (sessionData) {
      const parsedData = JSON.parse(sessionData);
      setRecommendations(parsedData.recommendations);
      setSoilData(parsedData.soilData);
      setWeather(parsedData.weather);
    } else {
      // If no data is available, redirect to adviser page
      router.push('/adviser');
    }
    
    // Set theme based on system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, [router]);
  
  // Prepare nutrient chart data
  const nutrientChartData = {
    labels: ['Nitrogen', 'Phosphorus', 'Potassium'],
    datasets: [
      {
        label: 'Current Levels (kg/ha)',
        data: [
          soilData?.nitrogen || 0,
          soilData?.phosphorus || 0,
          soilData?.potassium || 0,
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
  
  // If no data, show loading
  if (!recommendations || !soilData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
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
              <h1 className="text-3xl font-bold">Crop Recommendations</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push('/adviser')}
                className={`p-2 rounded-full transition ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title="Back to Adviser"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handlePrint}
                className={`p-2 rounded-full transition ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title="Print Results"
              >
                <Printer className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p
            className={`mt-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Analysis results for {soilData.district}, {soilData.agro_zone} zone
          </p>
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
                Nutrient Levels Overview
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

            {/* Weather Information */}
            {weather && (
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
                  <Sun className="h-5 w-5 text-yellow-500" /> Weather in {soilData.district}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Temperature:
                    </span>
                    <span className="ml-2 font-medium">{weather.temperature}°C</span>
                  </div>
                  <div>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Wind Speed:
                    </span>
                    <span className="ml-2 font-medium">{weather.windspeed} m/s</span>
                  </div>
                  <div>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Precipitation:
                    </span>
                    <span className="ml-2 font-medium">{weather.precipitation} mm</span>
                  </div>
                  {weather.humidity && (
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Humidity:
                      </span>
                      <span className="ml-2 font-medium">{weather.humidity}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Additional Information Section */}
          <div className="space-y-6">
            {/* Fertilizer Calculator */}
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
                        {fertilizer.fertilizer} → For {soilData.land_area || 0} ha:{" "}
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

            {/* Current Conditions Summary */}
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
                Analysis Parameters
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
                    {soilData.district}
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
                    {soilData.agro_zone || '-'}
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
                    {soilData.season}
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
                    {soilData.land_area || 0} ha
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
                    {soilData.soil_type}
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
                    {soilData.ph}
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
                    {soilData.nitrogen} kg/ha
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
                    {soilData.phosphorus} kg/ha
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
                    {soilData.potassium} kg/ha
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="mt-8 flex justify-between">
          <Link
            href="/adviser"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Adviser
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
}