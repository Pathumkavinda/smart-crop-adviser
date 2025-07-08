'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the ChartComponent to avoid SSR issues
const ChartComponent = dynamic(
  () => import('./ChartComponent'),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div> }
);

// Custom SVG Icons
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

const IconBarChart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="20" y2="10"/>
    <line x1="18" x2="18" y1="20" y2="4"/>
    <line x1="6" x2="6" y1="20" y2="16"/>
  </svg>
);

const IconAlertTriangle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>
);

const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <path d="m9 11 3 3L22 4"/>
  </svg>
);

const IconDroplets = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>
  </svg>
);

const IconThermometer = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
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

export default function CropAdviserPage() {
  const [theme, setTheme] = useState('light'); // Default theme
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
                <IconLeaf />
              </div>
              <h1 className="text-3xl font-bold">Smart Crop Adviser Dashboard</h1>
            </div>
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
          <p
            className={`mt-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Get personalized crop recommendations based on your soil conditions, location, and season
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
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
              <div className="h-5 w-5 text-blue-500"><IconBarChart /></div>
              Soil & Location Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Soil Type
                  </label>
                  <select
                    value={soilData.soilType}
                    onChange={(e) =>
                      setSoilData({ ...soilData, soilType: e.target.value })
                    }
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                    }`}
                  >
                    <option value="">Select Soil Type</option>
                    {soilTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Soil pH Level
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="3"
                    max="10"
                    value={soilData.pH}
                    onChange={(e) => setSoilData({ ...soilData, pH: e.target.value })}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                    }`}
                    placeholder="e.g., 6.5"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Nitrogen (N) ppm
                  </label>
                  <input
                    type="number"
                    value={soilData.nitrogen}
                    onChange={(e) =>
                      setSoilData({ ...soilData, nitrogen: e.target.value })
                    }
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                    }`}
                    placeholder="e.g., 25"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Phosphorus (P) ppm
                  </label>
                  <input
                    type="number"
                    value={soilData.phosphorus}
                    onChange={(e) =>
                      setSoilData({ ...soilData, phosphorus: e.target.value })
                    }
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                    }`}
                    placeholder="e.g., 18"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Potassium (K) ppm
                  </label>
                  <input
                    type="number"
                    value={soilData.potassium}
                    onChange={(e) =>
                      setSoilData({ ...soilData, potassium: e.target.value })
                    }
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                    }`}
                    placeholder="e.g., 200"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    District
                  </label>
                  <select
                    value={soilData.district}
                    onChange={(e) =>
                      setSoilData({ ...soilData, district: e.target.value, agroZone: '' })
                    }
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                    }`}
                  >
                    <option value="">Select District</option>
                    {Object.keys(districts).map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Agro-ecological Zone
                  </label>
                  <select
                    value={soilData.agroZone}
                    onChange={(e) =>
                      setSoilData({ ...soilData, agroZone: e.target.value })
                    }
                    disabled={!soilData.district}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${
                      !soilData.district
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    } ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                    }`}
                  >
                    <option value="">Select Zone</option>
                    {soilData.district &&
                      districts[soilData.district].map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Cultivation Season
                  </label>
                  <select
                    value={soilData.season}
                    onChange={(e) =>
                      setSoilData({ ...soilData, season: e.target.value })
                    }
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                    }`}
                  >
                    <option value="">Select Season</option>
                    {seasons.map((season) => (
                      <option key={season} value={season}>
                        {season}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Land Area (hectares)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={soilData.landArea}
                    onChange={(e) =>
                      setSoilData({ ...soilData, landArea: e.target.value })
                    }
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                    }`}
                    placeholder="e.g., 2.5"
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 font-medium"
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
                    <div className="h-5 w-5 text-green-500"><IconLeaf /></div>
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

                {/* Nutrient Chart - UPDATED */}
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
                    <div className="h-5 w-5 text-purple-500"><IconBarChart /></div>
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
                          borderColor: '#6366F1', 
                          backgroundColor: '#6366F1',
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
                    theme={theme}
                  />
                </div>

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
                      <div className="h-5 w-5 text-blue-500"><IconDroplets /></div>
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
                            className={`flex items-start gap-2 p-3 rounded-lg ${
                              theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                            }`}
                          >
                            <div className="h-4 w-4 mt-0.5 flex-shrink-0 flex-grow-0">
                              <IconCheckCircle className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                            </div>
                            <span
                              className={`text-sm ${
                                theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                              }`}
                            >
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
                  <div className={`rounded-lg shadow-lg p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                      <div className="h-5 w-5 text-yellow-500"><IconSun /></div> 
                      Live Weather in {soilData.district}
                    </h2>
                    {loadingWeather && <p>Loading weather...</p>}
                    {weatherError && <p className="text-red-500">{weatherError}</p>}
                    {weather && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Temperature:</span>
                          <span className="ml-2 font-medium">{weather.temperature}°C</span>
                        </div>
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Wind Speed:</span>
                          <span className="ml-2 font-medium">{weather.windspeed} m/s</span>
                        </div>
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Precipitation:</span>
                          <span className="ml-2 font-medium">{weather.precipitation} mm</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Soil Issues */}
                {recommendations.soilIssues.length > 0 && (
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
                      <div className="h-5 w-5 text-orange-500"><IconAlertTriangle /></div>
                      Soil Considerations
                    </h2>
                    <div className="space-y-2">
                      {recommendations.soilIssues.map((issue, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-2 p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-50'
                          }`}
                        >
                          <div className="h-4 w-4 mt-0.5 flex-shrink-0 flex-grow-0">
                            <IconAlertTriangle className={`${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                          </div>
                          <span
                            className={`text-sm ${
                              theme === 'dark' ? 'text-orange-300' : 'text-orange-800'
                            }`}
                          >
                            {issue}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Management Tips */}
                {recommendations.managementTips && recommendations.managementTips.length > 0 && (
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
                      <div className="h-5 w-5 text-green-500"><IconThermometer /></div>
                      Management Tips
                    </h2>
                    <div className="space-y-2">
                      {recommendations.managementTips.map((tip, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-2 p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'
                          }`}
                        >
                          <div className="h-4 w-4 mt-0.5 flex-shrink-0 flex-grow-0">
                            <IconCheckCircle className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                          </div>
                          <span
                            className={`text-sm ${
                              theme === 'dark' ? 'text-green-300' : 'text-green-800'
                            }`}
                          >
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
                  <div className="h-5 w-5 text-purple-500"><IconMapPin /></div>
                  Current Conditions
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
                      {soilData.agroZone || '-'}
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
                      {soilData.landArea || 0} ha
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}