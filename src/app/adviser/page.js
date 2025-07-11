'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
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
  Moon, 
  Sun 
} from 'lucide-react';

// Dynamically import the ChartComponent to avoid SSR issues
const ChartComponent = dynamic(
  () => import('./ChartComponent'),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div> }
);

export default function CropAdviserPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.name === 'dark';
  const [soilData, setSoilData] = useState({
    soilType: '',
    pH: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    district: '',
    agroZone: '',
    season: '',
    landArea: '',
  });
  const [recommendations, setRecommendations] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  // Sri Lankan districts and their agro-ecological zones
  const districts = {
    Colombo: ['WL1a', 'WL2a', 'WL2b'],
    Gampaha: ['WL1a', 'WL2a', 'WL2b'],
    Kalutara: ['WL2a', 'WL2b', 'WL3'],
    Kandy: ['WM1a', 'WM1b', 'WM2a', 'WM2b'],
    Matale: ['WM1a', 'WM1b', 'WM2a', 'WM3'],
    NuwaraEliya: ['WU1', 'WU2a', 'WU2b', 'WU3'],
    Galle: ['WL3', 'WL4'],
    Matara: ['WL3', 'WL4'],
    Hambantota: ['DL1a', 'DL1b', 'DL3'],
    Jaffna: ['DL1a', 'DL1b'],
    Kilinochchi: ['DL1b', 'DL2a'],
    Mannar: ['DL2a', 'DL2b'],
    Vavuniya: ['DL1b', 'DL2b'],
    Mullaitivu: ['DL1b', 'DL2a'],
    Batticaloa: ['DL2a', 'DL3'],
    Ampara: ['DL1b', 'DL3'],
    Trincomalee: ['DL1b', 'DL2a'],
    Kurunegala: ['IM1a', 'IM1b', 'IM2a'],
    Puttalam: ['DL1b', 'IM1c'],
    Anuradhapura: ['DL1b', 'DL1c'],
    Polonnaruwa: ['DL1b', 'DL1c'],
    Badulla: ['IM2a', 'IM2b', 'IM3a'],
    Moneragala: ['DL3', 'IM3b'],
    Ratnapura: ['WM2b', 'WM3', 'WL3'],
    Kegalle: ['WM2a', 'WM2b', 'WL2b'],
  };

  const soilTypes = [
    'Red Yellow Podzolic',
    'Reddish Brown Earth',
    'Red-Yellow Latosols',
    'Low Humic Gley',
    'Alluvial',
    'Regosols',
    'Grumusols',
    'Solodized Solonetz',
  ];
  const seasons = ['Yala', 'Maha', 'Intermonsoon'];

  // District → Latitude & Longitude mapping for Sri Lanka
  const districtCoordinates = {
    Colombo: { lat: 6.9271, lon: 79.8605 },
    Gampaha: { lat: 7.0486, lon: 79.6284 },
    Kalutara: { lat: 6.5945, lon: 79.9326 },
    Kandy: { lat: 7.2906, lon: 80.6350 },
    Matale: { lat: 7.4667, lon: 80.6167 },
    NuwaraEliya: { lat: 6.9528, lon: 80.7935 },
    Galle: { lat: 6.0535, lon: 80.2205 },
    Matara: { lat: 5.9500, lon: 80.5667 },
    Hambantota: { lat: 6.1333, lon: 81.3500 },
    Jaffna: { lat: 9.6615, lon: 80.0255 },
    Kilinochchi: { lat: 9.3333, lon: 80.0667 },
    Mannar: { lat: 8.9586, lon: 79.8947 },
    Vavuniya: { lat: 8.7578, lon: 80.0778 },
    Mullaitivu: { lat: 9.2578, lon: 81.2578 },
    Batticaloa: { lat: 7.7172, lon: 81.7022 },
    Ampara: { lat: 7.2917, lon: 81.8417 },
    Trincomalee: { lat: 8.5833, lon: 81.2167 },
    Kurunegala: { lat: 7.4800, lon: 80.3583 },
    Puttalam: { lat: 8.0400, lon: 80.0417 },
    Anuradhapura: { lat: 8.3114, lon: 80.4036 },
    Polonnaruwa: { lat: 7.8500, lon: 81.0700 },
    Badulla: { lat: 6.9833, lon: 81.0500 },
    Moneragala: { lat: 6.8833, lon: 81.3500 },
    Ratnapura: { lat: 6.6994, lon: 80.3847 },
    Kegalle: { lat: 7.2500, lon: 80.3667 },
  };

  const getCropRecommendations = (data) => {
    const crops = [];
    const soilIssues = [];
    const fertilizers = [];
    const managementTips = [];

    const ph = parseFloat(data.pH);
    if (ph < 5.5) {
      soilIssues.push('Soil is too acidic - consider liming before planting');
    } else if (ph > 7.5) {
      soilIssues.push('Soil is alkaline - may affect nutrient availability');
    }

    const n = parseInt(data.nitrogen);
    const p = parseInt(data.phosphorus);
    const k = parseInt(data.potassium);

    if (n < 20) fertilizers.push('Apply nitrogen fertilizer (Urea) - 50-100 kg/ha');
    if (p < 15) fertilizers.push('Apply phosphorus fertilizer (TSP) - 25-50 kg/ha');
    if (k < 150) fertilizers.push('Apply potassium fertilizer (MOP) - 30-60 kg/ha');

    const targetCrops = [
      {
        name: 'Potato - Granola',
        optimalPH: [5.8, 6.5],
        nRequirement: 40,
        pRequirement: 25,
        kRequirement: 250,
        seasons: ['Maha'],
        zones: ['WU1', 'WU2a', 'WM1a', 'IM2a'],
        soilTypes: ['Red Yellow Podzolic', 'Red-Yellow Latosols'],
      },
      {
        name: 'Potato - Desiree',
        optimalPH: [5.8, 6.5],
        nRequirement: 35,
        pRequirement: 22,
        kRequirement: 240,
        seasons: ['Maha'],
        zones: ['WU1', 'WU2a', 'WM1a', 'IM2a'],
        soilTypes: ['Red Yellow Podzolic', 'Red-Yellow Latosols'],
      },
      {
        name: 'Big Onion - Hybrid 62',
        optimalPH: [6.0, 7.0],
        nRequirement: 30,
        pRequirement: 20,
        kRequirement: 200,
        seasons: ['Maha', 'Yala'],
        zones: ['DL1a', 'DL1b', 'DL2a', 'IM1a', 'IM1b'],
        soilTypes: ['Reddish Brown Earth', 'Alluvial', 'Red Yellow Podzolic'],
      },
      {
        name: 'Big Onion - Bhima Shakti',
        optimalPH: [6.0, 7.0],
        nRequirement: 28,
        pRequirement: 18,
        kRequirement: 190,
        seasons: ['Maha', 'Yala'],
        zones: ['DL1a', 'DL1b', 'DL2a', 'IM1a', 'IM1b'],
        soilTypes: ['Reddish Brown Earth', 'Alluvial', 'Red Yellow Podzolic'],
      },
      {
        name: 'Red Onion - Vethalan',
        optimalPH: [6.0, 7.0],
        nRequirement: 25,
        pRequirement: 18,
        kRequirement: 180,
        seasons: ['Maha', 'Yala'],
        zones: ['DL1a', 'DL1b', 'WL2a', 'IM1a'],
        soilTypes: ['Reddish Brown Earth', 'Alluvial', 'Red Yellow Podzolic'],
      },
      {
        name: 'Red Onion - LKRON 1',
        optimalPH: [6.0, 7.0],
        nRequirement: 22,
        pRequirement: 16,
        kRequirement: 170,
        seasons: ['Maha', 'Yala'],
        zones: ['DL1a', 'DL1b', 'WL2a', 'IM1a'],
        soilTypes: ['Reddish Brown Earth', 'Alluvial', 'Red Yellow Podzolic'],
      },
      {
        name: 'Carrot - New Kuroda',
        optimalPH: [6.0, 6.8],
        nRequirement: 20,
        pRequirement: 15,
        kRequirement: 160,
        seasons: ['Maha'],
        zones: ['WU1', 'WU2a', 'WM1a', 'WM1b'],
        soilTypes: ['Red Yellow Podzolic', 'Red-Yellow Latosols'],
      },
      {
        name: 'Carrot - Chantenay',
        optimalPH: [6.0, 6.8],
        nRequirement: 18,
        pRequirement: 12,
        kRequirement: 150,
        seasons: ['Maha'],
        zones: ['WU1', 'WU2a', 'WM1a', 'WM1b'],
        soilTypes: ['Red Yellow Podzolic', 'Red-Yellow Latosols'],
      },
      {
        name: 'Tomato - Maheshi',
        optimalPH: [6.0, 7.0],
        nRequirement: 45,
        pRequirement: 30,
        kRequirement: 220,
        seasons: ['Maha', 'Yala'],
        zones: ['WM1a', 'WM1b', 'WM2a', 'IM1a', 'IM1b'],
        soilTypes: ['Red Yellow Podzolic', 'Reddish Brown Earth', 'Alluvial'],
      },
      {
        name: 'Tomato - Thilina',
        optimalPH: [6.0, 7.0],
        nRequirement: 42,
        pRequirement: 28,
        kRequirement: 210,
        seasons: ['Maha', 'Yala'],
        zones: ['WM1a', 'WM1b', 'WM2a', 'IM1a', 'IM1b'],
        soilTypes: ['Red Yellow Podzolic', 'Reddish Brown Earth', 'Alluvial'],
      },
      {
        name: 'Maize - Pacific 984',
        optimalPH: [6.0, 7.0],
        nRequirement: 50,
        pRequirement: 30,
        kRequirement: 200,
        seasons: ['Maha', 'Yala'],
        zones: ['DL1b', 'DL2a', 'IM1a', 'IM1b', 'WL2a'],
        soilTypes: ['Reddish Brown Earth', 'Alluvial', 'Red Yellow Podzolic'],
      },
      {
        name: 'Maize - Arjun',
        optimalPH: [6.0, 7.0],
        nRequirement: 48,
        pRequirement: 28,
        kRequirement: 190,
        seasons: ['Maha', 'Yala'],
        zones: ['DL1b', 'DL2a', 'IM1a', 'IM1b', 'WL2a'],
        soilTypes: ['Reddish Brown Earth', 'Alluvial', 'Red Yellow Podzolic'],
      },
    ];

    targetCrops.forEach((crop) => {
      let suitability = 'Fair';
      let reasons = [];
      let score = 0;
      if (ph >= crop.optimalPH[0] && ph <= crop.optimalPH[1]) {
        score += 2;
        reasons.push('Optimal soil pH');
      } else if (ph < crop.optimalPH[0] - 0.5 || ph > crop.optimalPH[1] + 0.5) {
        reasons.push('pH needs adjustment');
      } else {
        score += 1;
        reasons.push('Acceptable pH range');
      }
      if (n >= crop.nRequirement) score += 1;
      if (p >= crop.pRequirement) score += 1;
      if (k >= crop.kRequirement) score += 1;
      if (crop.seasons.includes(data.season)) score += 2;
      if (crop.zones.includes(data.agroZone)) score += 2;
      if (crop.soilTypes.includes(data.soilType)) score += 1;
      if (score >= 7) suitability = 'Excellent';
      else if (score >= 5) suitability = 'Good';
      else if (score >= 3) suitability = 'Fair';
      else suitability = 'Poor';
      crops.push({
        name: crop.name,
        suitability,
        reason: reasons.join(', '),
        score,
      });

      if (crop.name.includes('Big Onion') || crop.name.includes('Red Onion')) {
        if (data.season === 'Yala')
          managementTips.push('Onions: Ensure adequate irrigation during dry season');
        managementTips.push('Onions: Apply organic matter 2-3 weeks before planting');
        if (crop.name.includes('Hybrid 62'))
          managementTips.push('Hybrid 62: High yielding variety, suitable for export markets');
        if (crop.name.includes('Bhima Shakti'))
          managementTips.push('Bhima Shakti: Stores well, good for local markets');
        if (crop.name.includes('Vethalan'))
          managementTips.push('Vethalan: Traditional variety, excellent taste and color');
        if (crop.name.includes('LKRON 1'))
          managementTips.push('LKRON 1: Disease resistant variety developed locally');
      }
      if (crop.name.includes('Potato')) {
        if (data.agroZone && data.agroZone.startsWith('WU'))
          managementTips.push('Potato: Ideal conditions in up-country - plant during cool months');
        managementTips.push('Potato: Hill up soil around plants for better tuber development');
        if (crop.name.includes('Granola'))
          managementTips.push('Granola: Good for processing, high dry matter content');
        if (crop.name.includes('Desiree'))
          managementTips.push('Desiree: Red skin variety, excellent for table use');
      }
      if (crop.name.includes('Carrot')) {
        managementTips.push('Carrot: Requires deep, well-drained soil for proper root development');
        if (crop.name.includes('New Kuroda'))
          managementTips.push('New Kuroda: Japanese variety, good for fresh market');
        if (crop.name.includes('Chantenay'))
          managementTips.push('Chantenay: Short, broad variety, suitable for heavy soils');
      }
      if (crop.name.includes('Tomato')) {
        managementTips.push('Tomato: Requires staking and regular pruning for best yields');
        managementTips.push('Tomato: Apply mulch to conserve moisture and prevent diseases');
        if (crop.name.includes('Maheshi'))
          managementTips.push('Maheshi: High yielding F1 hybrid, good disease resistance');
        if (crop.name.includes('Thilina'))
          managementTips.push('Thilina: Determinate variety, suitable for mechanical harvesting');
      }
      if (crop.name.includes('Maize')) {
        managementTips.push('Maize: Plant at proper spacing for optimal yield');
        if (crop.name.includes('Pacific 984'))
          managementTips.push('Pacific 984: High yielding hybrid, good grain quality');
        if (crop.name.includes('Arjun'))
          managementTips.push('Arjun: Drought tolerant variety, suitable for rainfed cultivation');
      }
    });

    crops.sort((a, b) => b.score - a.score);
    return {
      crops: crops.slice(0, 8),
      soilIssues,
      fertilizers,
      managementTips: [...new Set(managementTips)],
    };
  };

  const handleSubmit = () => {
    const recs = getCropRecommendations(soilData);
    setRecommendations(recs);
  };

  const getSuitabilityStyle = (suitability) => {
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

  // Fetch live weather using Open-Meteo (free, no API key)
  useEffect(() => {
    const fetchWeather = async () => {
      if (!soilData.district) return;
      setLoadingWeather(true);
      setWeatherError('');
      setWeather(null);

      const coords = districtCoordinates[soilData.district];
      if (!coords) {
        setWeatherError('Location not supported');
        setLoadingWeather(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=temperature_2m,precipitation`
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        setWeather({
          temperature: data.current_weather?.temperature ?? 0,
          windspeed: data.current_weather?.windspeed ?? 0,
          precipitation: data.hourly?.precipitation?.[0] ?? 0,
        });
      } catch (err) {
        console.error('Weather fetch error:', err.message);
        setWeatherError('Could not fetch weather data.');
        setWeather(null);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [soilData.district]);

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
              <h1 className="text-3xl font-bold" style={{ color: theme.colors.text }}>Smart Crop Adviser Dashboard</h1>
            </div>
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
          <p style={{ 
            marginTop: '0.5rem',
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
          }}>
            Get personalized crop recommendations based on your soil conditions, location, and season
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="rounded-lg shadow-lg p-6 border" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border
          }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Soil & Location Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    Soil Type
                  </label>
                  <select
                    value={soilData.soilType}
                    onChange={(e) => setSoilData({ ...soilData, soilType: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                  >
                    <option value="" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }}>Select Soil Type</option>
                    {soilTypes.map((type) => (
                      <option key={type} value={type} style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    Soil pH Level
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="3"
                    max="10"
                    value={soilData.pH}
                    onChange={(e) => setSoilData({ ...soilData, pH: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                    placeholder="e.g., 6.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    Nitrogen (N) ppm
                  </label>
                  <input
                    type="number"
                    value={soilData.nitrogen}
                    onChange={(e) => setSoilData({ ...soilData, nitrogen: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                    placeholder="e.g., 25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    Phosphorus (P) ppm
                  </label>
                  <input
                    type="number"
                    value={soilData.phosphorus}
                    onChange={(e) => setSoilData({ ...soilData, phosphorus: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                    placeholder="e.g., 18"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    Potassium (K) ppm
                  </label>
                  <input
                    type="number"
                    value={soilData.potassium}
                    onChange={(e) => setSoilData({ ...soilData, potassium: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                    placeholder="e.g., 200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    District
                  </label>
                  <select
                    value={soilData.district}
                    onChange={(e) => setSoilData({ ...soilData, district: e.target.value, agroZone: '' })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                  >
                    <option value="" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }}>Select District</option>
                    {Object.keys(districts).map((district) => (
                      <option key={district} value={district} style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    Agro-ecological Zone
                  </label>
                  <select
                    value={soilData.agroZone}
                    onChange={(e) => setSoilData({ ...soilData, agroZone: e.target.value })}
                    disabled={!soilData.district}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: isDark ? '#ffffff' : '#000000',
                      opacity: !soilData.district ? 0.5 : 1,
                      cursor: !soilData.district ? 'not-allowed' : 'default'
                    }}
                  >
                    <option value="" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }}>Select Zone</option>
                    {soilData.district &&
                      districts[soilData.district].map((zone) => (
                        <option key={zone} value={zone} style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }}>
                          {zone}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    Cultivation Season
                  </label>
                  <select
                    value={soilData.season}
                    onChange={(e) => setSoilData({ ...soilData, season: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                  >
                    <option value="" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }}>Select Season</option>
                    {seasons.map((season) => (
                      <option key={season} value={season} style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }}>
                        {season}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    Land Area (hectares)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={soilData.landArea}
                    onChange={(e) => setSoilData({ ...soilData, landArea: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                    placeholder="e.g., 2.5"
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-2 px-4 rounded-md hover:opacity-90 transition duration-200 font-medium text-white"
                style={{ backgroundColor: theme.colors.primary }}
              >
                Get Crop Recommendations
              </button>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-6">
            {recommendations && (
              <>
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
                      const colorStyle = getSuitabilityStyle(crop.suitability);
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
                    Nutrient Levels Overview
                  </h2>
                  <ChartComponent
                    data={{
                      labels: ['Nitrogen', 'Phosphorus', 'Potassium'],
                      datasets: [
                        {
                          label: 'Current Levels',
                          data: [
                            parseInt(soilData.nitrogen) || 0,
                            parseInt(soilData.phosphorus) || 0,
                            parseInt(soilData.potassium) || 0,
                          ],
                          borderColor: isDark ? '#818CF8' : '#6366F1',
                          backgroundColor: isDark ? '#818CF8' : '#6366F1',
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
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
                          title: { display: true, text: 'ppm' },
                        },
                      },
                    }}
                  />
                </div>

                {/* Fertilizer Calculator */}
                {recommendations.fertilizers.length > 0 && (
                  <div className="rounded-lg shadow-lg p-6 border" style={{ 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border
                  }}>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                      <Droplets className="h-5 w-5 text-blue-500" />
                      Fertilizer Quantity Calculator
                    </h2>
                    <div className="space-y-4">
                      {recommendations.fertilizers.map((fertilizer, index) => {
                        const match = fertilizer.match(/(\d+)-(\d+) kg\/ha/);
                        const minRate = parseInt(match?.[1] || 0);
                        const maxRate = parseInt(match?.[2] || 0);
                        const landArea = parseFloat(soilData.landArea) || 0;
                        const minTotal = (minRate * landArea).toFixed(1);
                        const maxTotal = (maxRate * landArea).toFixed(1);

                        return (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 rounded-lg"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                              color: isDark ? '#93C5FD' : '#2563EB'
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">
                              {fertilizer} → For {soilData.landArea || 0} ha:{" "}
                              <strong>{minTotal}-{maxTotal} kg</strong> total needed
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Weather Section */}
                {soilData.district && (
                  <div className="rounded-lg shadow-lg p-6 border" style={{ 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border
                  }}>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                      <Sun className="h-5 w-5 text-yellow-500" /> 
                      Live Weather in {soilData.district}
                    </h2>
                    {loadingWeather && <p style={{ color: theme.colors.text }}>Loading weather...</p>}
                    {weatherError && <p style={{ color: '#EF4444' }}>{weatherError}</p>}
                    {weather && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Temperature:</span>
                          <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>{weather.temperature}°C</span>
                        </div>
                        <div>
                          <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Wind Speed:</span>
                          <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>{weather.windspeed} m/s</span>
                        </div>
                        <div>
                          <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Precipitation:</span>
                          <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>{weather.precipitation} mm</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Soil Issues */}
                {recommendations.soilIssues.length > 0 && (
                  <div className="rounded-lg shadow-lg p-6 border" style={{ 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border
                  }}>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Soil Considerations
                    </h2>
                    <div className="space-y-2">
                      {recommendations.soilIssues.map((issue, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 rounded-lg"
                          style={{ 
                            backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.1)',
                            color: isDark ? '#FDBA74' : '#C2410C'
                          }}
                        >
                          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            {issue}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Management Tips */}
                {recommendations.managementTips && recommendations.managementTips.length > 0 && (
                  <div className="rounded-lg shadow-lg p-6 border" style={{ 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border
                  }}>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                      <Thermometer className="h-5 w-5" style={{ color: theme.colors.primary }} />
                      Management Tips
                    </h2>
                    <div className="space-y-2">
                      {recommendations.managementTips.map((tip, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 rounded-lg"
                          style={{ 
                            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                            color: isDark ? '#86EFAC' : '#16A34A'
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            {tip}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Current Conditions Summary */}
            {soilData.district && (
              <div className="rounded-lg shadow-lg p-6 border" style={{ 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border
              }}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                  <MapPin className="h-5 w-5 text-purple-500" />
                  Current Conditions
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      District:
                    </span>
                    <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>
                      {soilData.district}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      Zone:
                    </span>
                    <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>
                      {soilData.agroZone || '-'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      Season:
                    </span>
                    <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>
                      {soilData.season}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      Land Area:
                    </span>
                    <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>
                      {soilData.landArea || 0} ha
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}