'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import {
  Leaf, BarChart3, AlertTriangle, CheckCircle, Droplets, Moon, Sun,
  Loader2, AlertCircle, Info, Download, Users, Search, FileText, Sun as SunIcon
} from 'lucide-react';

// Lazy chart
const ChartComponent = dynamic(() => import('./ChartComponent'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div>
});

// ------------------------------------
// API BASES (configure via env vars)
// ------------------------------------
const CORE_API = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1';
const ML_API   = process.env.NEXT_PUBLIC_ML_API_URL   || 'http://localhost:8000';

// ----------------------
// Model Status Widget
// ----------------------
const ModelStatusIndicator = () => {
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';

  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        setLoading(true);

        const [healthRes, infoRes] = await Promise.all([
          fetch(`${ML_API}/health`),
          fetch(`${ML_API}/model-info`)
        ]);

        if (!healthRes.ok) throw new Error(`ML /health ${healthRes.status}`);
        if (!infoRes.ok)   throw new Error(`ML /model-info ${infoRes.status}`);

        const health = await healthRes.json();
        const info   = await infoRes.json();

        setModelInfo({
          model_type: info.model_type ?? 'Unknown',
          model_accuracy: info.model_accuracy ?? 0,
          training_date: info.training_date ?? 'Unknown',
          test_mode: !!health.test_mode,
          crops_supported: info.crops_supported ?? []
        });
        setError('');
      } catch (e) {
        console.error('Model status error:', e);
        setError('Could not connect to ML service');
      } finally {
        setLoading(false);
      }
    };
    fetchModelInfo();
  }, []);

  return (
    <div className="rounded-lg shadow-lg p-6 border mb-6" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
        <BarChart3 className="h-5 w-5 text-purple-500" />
        ML Model Status
        {loading && <Loader2 className="h-4 w-4 animate-spin text-purple-500 ml-2" />}
      </h2>

      {error ? (
        <div className="p-3 rounded-lg" style={{
          backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
          color: isDark ? '#F87171' : '#DC2626'
        }}>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-medium">Connection Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      ) : modelInfo ? (
        <div className="space-y-4">
          {modelInfo.test_mode && (
            <div className="p-3 rounded-lg" style={{
              backgroundColor: isDark ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.1)',
              color: isDark ? '#FDBA74' : '#EA580C'
            }}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">API is running in Test Mode</p>
                  <p className="text-sm">The ML model is not properly loaded. Predictions may not be accurate.</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Model Type:</span>
              <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>{modelInfo.model_type}</span>
            </div>
            <div>
              <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Accuracy:</span>
              <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>{modelInfo.model_accuracy}%</span>
            </div>
            <div>
              <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Training Date:</span>
              <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>{modelInfo.training_date}</span>
            </div>
            <div>
              <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Status:</span>
              <span className="ml-2 font-medium" style={{ color: modelInfo.test_mode ? '#F59E0B' : '#10B981' }}>
                {modelInfo.test_mode ? 'Test Mode' : 'Production Ready'}
              </span>
            </div>
          </div>

          {!!modelInfo.crops_supported?.length && (
            <div>
              <p className="mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Supported Crops:</p>
              <div className="flex flex-wrap gap-2">
                {modelInfo.crops_supported.map((c, i) => (
                  <span key={i} className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)', color: isDark ? '#6EE7B7' : '#059669' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.colors.primary }} />
        </div>
      )}
    </div>
  );
};

export default function CropAdviserPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.name === 'dark';

  // ----------------------
  // STATE
  // ----------------------
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingFarmers, setLoadingFarmers] = useState(false);

  const [soilData, setSoilData] = useState({
    soilType: '', pH: '', nitrogen: '', phosphorus: '', potassium: '',
    district: '', agroZone: '', season: '', landArea: '',
    // NEW: user-provided averages
    avgHumidity: '',           // %
    avgRainfall: ''            // mm
  });

  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  const [modelState, setModelState] = useState({ loaded: false, testMode: false, error: null });

  // ----------------------
  // FETCH FARMERS
  // ----------------------
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setLoadingFarmers(true);

        let res = await fetch(`${CORE_API}/users?userlevel=farmer`);
        if (!res.ok) {
          // fallback to /users (then filter)
          res = await fetch(`${CORE_API}/users`);
        }
        if (!res.ok) throw new Error(`Users HTTP ${res.status}`);

        const data = await res.json();
        const rows = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

        const onlyFarmers = rows
          .filter(u => (u.userlevel?.toString()?.toLowerCase?.() || '') === 'farmer')
          .map(u => ({
            id: u.id,
            name: u.username || u.name || `User ${u.id}`,
            district: u.district || u.address || '',
            mobile: u.mobile || u.phone || ''
          }));

        setFarmers(onlyFarmers);
      } catch (e) {
        console.error('Failed to fetch farmers:', e);
        setFarmers([]);
      } finally {
        setLoadingFarmers(false);
      }
    };
    fetchFarmers();
  }, []);

  // ----------------------
  // ML HEALTH (UI only)
  // ----------------------
  useEffect(() => {
    const checkModelStatus = async () => {
      try {
        const res = await fetch(`${ML_API}/health`);
        if (!res.ok) {
          setModelState({ loaded: false, testMode: true, error: `ML /health ${res.status}` });
          return;
        }
        const data = await res.json();
        setModelState({
          loaded: !!data.model_loaded,
          testMode: !!data.test_mode,
          error: data.test_mode ? 'API is in test mode - predictions may not be accurate' : null
        });
      } catch (e) {
        console.error('ML health error:', e);
        setModelState({ loaded: false, testMode: true, error: 'Could not connect to ML service' });
      }
    };
    checkModelStatus();
  }, []);

  // ----------------------
  // STATIC LISTS
  // ----------------------
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

  const soilTypeMapping = {
    'Red Yellow Podzolic': 'Red Yellow Podzolic (RYP)',
    'Reddish Brown Earth': 'Reddish Brown Earth (RBE)',
    'Red-Yellow Latosols': 'Red-Yellow Latosols',
    'Low Humic Gley': 'Low Humic Gley (LHG)',
    'Alluvial': 'Alluvial',
    'Regosols': 'Regosols',
    'Grumusols': 'Grumusols',
    'Solodized Solonetz': 'Solodized Solonetz',
    'Non-Calcic Brown': 'Non-Calcic Brown (NCB)'
  };
  const soilTypes = Object.keys(soilTypeMapping);
  const seasons = ['Yala', 'Maha', 'Intermonsoon'];

  const districtCoordinates = {
    Colombo: { lat: 6.9271, lon: 79.8605 },
    Gampaha: { lat: 7.0486, lon: 79.6284 },
    Kalutara: { lat: 6.5945, lon: 79.9326 },
    Kandy: { lat: 7.2906, lon: 80.6350 },
    Matale: { lat: 7.4667, lon: 80.6167 },
    NuwaraEliya: { lat: 6.9528, lon: 80.7935 },
    Galle: { lat: 6.0535, lon: 80.2205 },
    Matara: { lat: 5.95, lon: 80.5667 },
    Hambantota: { lat: 6.1333, lon: 81.35 },
    Jaffna: { lat: 9.6615, lon: 80.0255 },
    Kilinochchi: { lat: 9.3333, lon: 80.0667 },
    Mannar: { lat: 8.9586, lon: 79.8947 },
    Vavuniya: { lat: 8.7578, lon: 80.0778 },
    Mullaitivu: { lat: 9.2578, lon: 81.2578 },
    Batticaloa: { lat: 7.7172, lon: 81.7022 },
    Ampara: { lat: 7.2917, lon: 81.8417 },
    Trincomalee: { lat: 8.5833, lon: 81.2167 },
    Kurunegala: { lat: 7.48, lon: 80.3583 },
    Puttalam: { lat: 8.04, lon: 80.0417 },
    Anuradhapura: { lat: 8.3114, lon: 80.4036 },
    Polonnaruwa: { lat: 7.85, lon: 81.07 },
    Badulla: { lat: 6.9833, lon: 81.05 },
    Moneragala: { lat: 6.8833, lon: 81.35 },
    Ratnapura: { lat: 6.6994, lon: 80.3847 },
    Kegalle: { lat: 7.25, lon: 80.3667 },
  };

  // ----------------------
  // HELPERS
  // ----------------------
  const debounce = (fn, ms) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };

  const getSuitabilityFromConfidence = (confidence) => {
    if (confidence >= 80) return 'Excellent';
    if (confidence >= 65) return 'Good';
    if (confidence >= 45) return 'Fair';
    return 'Poor';
  };

  const getSuitabilityStyle = (s) => {
    if (s === 'Excellent') return { bg: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)', text: isDark ? '#86EFAC' : '#16A34A' };
    if (s === 'Good')      return { bg: isDark ? 'rgba(59,130,246,0.2)': 'rgba(59,130,246,0.1)', text: isDark ? '#93C5FD' : '#2563EB' };
    if (s === 'Fair')      return { bg: isDark ? 'rgba(234,179,8,0.2)' : 'rgba(234,179,8,0.1)', text: isDark ? '#FDE68A' : '#D97706' };
    return                    { bg: isDark ? 'rgba(107,114,128,0.2)': 'rgba(107,114,128,0.1)', text: isDark ? '#D1D5DB' : '#4B5563' };
  };

  // ----------------------
  // WEATHER (no hardcoded fallbacks)
  // ----------------------
  useEffect(() => {
    const fetchWeather = async () => {
      if (!soilData.district) return;
      setLoadingWeather(true); setWeatherError(''); setWeather(null);

      const coords = districtCoordinates[soilData.district];
      if (!coords) { setWeatherError('Location not supported'); setLoadingWeather(false); return; }

      try {
        const r = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=temperature_2m,precipitation`
        );
        if (!r.ok) throw new Error(`Weather ${r.status}`);
        const d = await r.json();

        const w = {};
        if (typeof d.current_weather?.temperature === 'number') w.temperature = d.current_weather.temperature;
        if (typeof d.current_weather?.windspeed   === 'number') w.windspeed   = d.current_weather.windspeed;
        if (Array.isArray(d.hourly?.precipitation) && typeof d.hourly.precipitation[0] === 'number') {
          w.precipitation = d.hourly.precipitation[0];
        }
        setWeather(Object.keys(w).length ? w : null);
      } catch (e) {
        console.error('Weather fetch error:', e);
        setWeatherError('Could not fetch weather data.');
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
  }, [soilData.district]);

  // ----------------------
  // RECOMMENDATIONS (UI)
  // ----------------------
  const generateRecommendations = (mlResult, inputData) => {
    const fertilizers = [];
    const soilIssues = [];
    const managementTips = [];

    const ph = Number(inputData.pH);
    const n  = Number(inputData.nitrogen);
    const p  = Number(inputData.phosphorus);
    const k  = Number(inputData.potassium);

    if (!Number.isNaN(ph)) {
      if (ph < 5.5) soilIssues.push('Soil is too acidic - consider liming before planting');
      else if (ph > 7.5) soilIssues.push('Soil is alkaline - may affect nutrient availability');
    }

    if (!Number.isNaN(n) && n < 20)   fertilizers.push('Apply nitrogen fertilizer (Urea) - 50-100 kg/ha');
    if (!Number.isNaN(p) && p < 15)   fertilizers.push('Apply phosphorus fertilizer (TSP) - 25-50 kg/ha');
    if (!Number.isNaN(k) && k < 150)  fertilizers.push('Apply potassium fertilizer (MOP) - 30-60 kg/ha');

    const predictedCrop = (mlResult.predicted_crop || '').toLowerCase();
    const cropTips = {
      potato: ['Hill up soil around plants', 'Plant during cool months'],
      onion:  ['Apply organic matter early', 'Raised beds improve drainage'],
      tomato: ['Stake & prune for yield', 'Mulch to conserve moisture'],
      carrot: ['Deep, well-drained soil', 'Avoid fresh manure'],
      maize:  ['Correct spacing matters', 'Split nitrogen doses'],
      rice:   ['Maintain field water', 'Weed early and often'],
      cabbage:['Add calcium for tipburn', 'Scout for cabbage worms'],
      chili:  ['Prune for bushy plants', 'Avoid overwatering'],
      cucumber:['Provide trellis support', 'Harvest regularly'],
      eggplant:['Needs warm full sun', 'Support heavy fruit'],
      lettuce:['Prefers cooler temps', 'Harvest in morning'],
      bean:   ['Fixes nitrogen in soil', 'Don’t disturb roots'],
    };
    Object.entries(cropTips).forEach(([c, tips]) => {
      if (predictedCrop.includes(c)) tips.forEach(t => managementTips.push(`${c[0].toUpperCase()+c.slice(1)}: ${t}`));
    });
    if (!managementTips.length) {
      managementTips.push('Ensure proper plant spacing');
      managementTips.push('Monitor moisture during dry spells');
      managementTips.push('Scout pests/diseases regularly');
    }

    return {
      mlResult,
      fertilizers,
      soilIssues,
      managementTips,
      crops: (mlResult.top_3_predictions || []).map(pred => ({
        name: pred.crop,
        suitability: getSuitabilityFromConfidence(pred.probability),
        confidence: pred.probability
      }))
    };
  };

  // Save prediction (backend). Now uses user-entered avgHumidity/avgRainfall if provided.
  const savePredictionToBackend = async (farmerId, mlResult) => {
    const userAvgHumidity = soilData.avgHumidity !== '' ? Number(soilData.avgHumidity) : null;
    const userAvgRainfall = soilData.avgRainfall !== '' ? Number(soilData.avgRainfall) : null;

    const payload = {
      user_id: farmerId,
      avg_humidity: userAvgHumidity, // user input (percent). Keep null if not provided.
      temp: typeof weather?.temperature === 'number' ? weather.temperature : null,
      avg_rainfall: userAvgRainfall ?? (typeof weather?.precipitation === 'number' ? weather.precipitation : null),
      land_area: soilData.landArea ? Number(soilData.landArea) : null,
      soil_type: soilTypeMapping[soilData.soilType] || soilData.soilType || null,
      soil_ph_level: soilData.pH ? Number(soilData.pH) : null,
      nitrogen: soilData.nitrogen ? Number(soilData.nitrogen) : null,
      phosphate: soilData.phosphorus ? Number(soilData.phosphorus) : null,
      potassium: soilData.potassium ? Number(soilData.potassium) : null,
      district: soilData.district || null,
      agro_ecological_zone: soilData.agroZone || null,
      cultivate_season: soilData.season || null,
      crop_name: mlResult.predicted_crop || null
    };

    const res = await fetch(`${CORE_API}/predictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Save prediction failed: ${t}`);
    }
    return res.json();
  };

  // ----------------------
  // PREDICTION (NO HARDCODED INPUTS)
  // ----------------------
  const getCropPrediction = async (data) => {
    // Required fields
    if (!data.soilType || !data.pH || !data.nitrogen || !data.phosphorus || !data.potassium || !data.agroZone || !data.season) {
      return;
    }
    setLoading(true); setError('');

    try {
      // Build ML request with ONLY provided values
      const apiData = {
        soil_type: soilTypeMapping[data.soilType] || data.soilType,
        soil_ph: Number(data.pH),
        nitrogen_ppm: Number(data.nitrogen),
        phosphorus_ppm: Number(data.phosphorus),
        potassium_ppm: Number(data.potassium),
        agro_ecological_zone: data.agroZone,
        cultivation_season: data.season
      };

      // Optional fields (user input takes priority)
      if (data.district) apiData.district = data.district;
      if (data.landArea && !Number.isNaN(Number(data.landArea))) apiData.land_area_hectares = Number(data.landArea);

      // NEW: avg_humidity / avg_rainfall (if user provided)
      if (data.avgHumidity !== '' && !Number.isNaN(Number(data.avgHumidity))) {
        apiData.avg_humidity = Number(data.avgHumidity); // percent
      }
      // Rainfall: prefer user entry; else use live weather if available
      if (data.avgRainfall !== '' && !Number.isNaN(Number(data.avgRainfall))) {
        apiData.avg_rainfall = Number(data.avgRainfall); // mm
      } else if (typeof weather?.precipitation === 'number') {
        apiData.avg_rainfall = weather.precipitation;
      }

      // Also include live temperature if available
      if (typeof weather?.temperature === 'number') apiData.temperature = weather.temperature;

      const response = await fetch(`${ML_API}/predict-crop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      const text = await response.text();
      let result;
      try { result = JSON.parse(text); } catch { throw new Error(`Invalid ML response: ${text.slice(0,120)}...`); }
      if (!response.ok) throw new Error(result.detail || `HTTP ${response.status}`);
      if (!result.success) throw new Error(result.error || 'Prediction failed');
      if (!result.predicted_crop || !Array.isArray(result.top_3_predictions)) throw new Error('Invalid prediction structure');

      // Warn if model returns same crop for all options
      if (result.top_3_predictions.length &&
          result.top_3_predictions.every(p => p.crop === result.top_3_predictions[0].crop)) {
        console.warn('Model returned identical alternatives.');
      }

      const recs = generateRecommendations(result, data);
      setPredictions(recs);

      // Save to backend prediction history (only when farmer selected)
      if (selectedFarmer?.id) {
        try { await savePredictionToBackend(selectedFarmer.id, result); }
        catch (e) { console.error(e); setError(prev => prev ? `${prev} | Failed to save to history.` : 'Failed to save to history.'); }
      }

    } catch (e) {
      console.error('Prediction error:', e);
      setError(`Failed to get crop recommendations: ${e.message}`);
      setPredictions(null);
    } finally {
      setLoading(false);
    }
  };

  const debouncedPredict = useCallback(debounce((d) => getCropPrediction(d), 900), [weather, selectedFarmer]);

  useEffect(() => {
    if (soilData.soilType && soilData.pH && soilData.nitrogen && soilData.phosphorus && soilData.potassium && soilData.agroZone && soilData.season) {
      debouncedPredict(soilData);
    } else {
      setPredictions(null);
    }
  }, [soilData, debouncedPredict]);

  // ----------------------
  // UI helpers
  // ----------------------
  const filteredFarmers = farmers.filter(f => (f.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  // ----------------------
  // PDFs (unchanged except we add humidity/rainfall lines)
  // ----------------------
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const generatePredictionPDF = async () => {
    if (!predictions) return;
    setPdfGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      const doc = new jsPDF();

      doc.setFontSize(18); doc.setTextColor(40,40,40);
      doc.text('Crop Recommendation Report', 105, 15, { align: 'center' });
      if (selectedFarmer) {
        doc.setFontSize(12);
        doc.text(`Farmer: ${selectedFarmer.name} (ID: ${selectedFarmer.id})`, 105, 25, { align: 'center' });
      }
      doc.setFontSize(12); doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

      let y=40;
      doc.setFontSize(14); doc.setTextColor(0,102,204);
      doc.text('Soil & Location Information',14,y); y+=10;
      doc.setTextColor(40,40,40); doc.setFontSize(10);
      const SD = soilData;
      const write = (t)=>{ doc.text(t,14,y); y+=6; };
      write(`Soil Type: ${SD.soilType}`); write(`Soil pH: ${SD.pH}`);
      write(`Nitrogen: ${SD.nitrogen} ppm`); write(`Phosphorus: ${SD.phosphorus} ppm`); write(`Potassium: ${SD.potassium} ppm`);
      if (SD.district) write(`District: ${SD.district}`);
      if (SD.agroZone) write(`Agro-ecological Zone: ${SD.agroZone}`);
      write(`Season: ${SD.season}`); if (SD.landArea) write(`Land Area: ${SD.landArea} hectares`);
      if (SD.avgHumidity !== '') write(`Avg Humidity (user): ${SD.avgHumidity}%`);
      if (SD.avgRainfall !== '') write(`Avg Rainfall (user): ${SD.avgRainfall} mm`);
      y+=4;

      if (weather) {
        doc.setFontSize(14); doc.setTextColor(0,102,204);
        doc.text('Weather Conditions',14,y); y+=10;
        doc.setTextColor(40,40,40); doc.setFontSize(10);
        if (typeof weather.temperature === 'number') write(`Temperature: ${weather.temperature}°C`);
        if (typeof weather.precipitation === 'number') write(`Precipitation (live): ${weather.precipitation} mm`);
        if (typeof weather.windspeed === 'number') write(`Wind Speed: ${weather.windspeed} m/s`);
        y+=4;
      }

      doc.setFontSize(14); doc.setTextColor(0,102,204);
      doc.text('AI Crop Recommendations',14,y); y+=10;
      doc.setTextColor(40,40,40); doc.setFontSize(12);
      doc.text(`Best Match: ${predictions.mlResult.predicted_crop}`,14,y); y+=6;
      doc.setFontSize(10);
      doc.text(`Confidence: ${predictions.mlResult.confidence}%`,14,y); y+=6;
      doc.text(`Model Accuracy: ${predictions.mlResult.ml_model_accuracy}%`,14,y); y+=10;

      doc.setFontSize(12); doc.text('Alternative Options:',14,y); y+=6;
      predictions.crops.slice(1).forEach(c => { doc.setFontSize(10); doc.text(`${c.name} - ${c.suitability} (${c.confidence}%)`,20,y); y+=6; });

      if (predictions.fertilizers.length) {
        y+=6; doc.setFontSize(14); doc.setTextColor(0,102,204); doc.text('Fertilizer Recommendations',14,y); y+=10;
        doc.setTextColor(40,40,40); doc.setFontSize(10);
        predictions.fertilizers.forEach(f => { doc.text(`• ${f}`,14,y); y+=6; });
      }

      if (predictions.soilIssues.length) {
        y+=6; doc.setFontSize(14); doc.setTextColor(0,102,204); doc.text('Soil Considerations',14,y); y+=10;
        doc.setTextColor(40,40,40); doc.setFontSize(10);
        predictions.soilIssues.forEach(s => { doc.text(`• ${s}`,14,y); y+=6; });
      }

      if (y > 250) { doc.addPage(); y = 20; }
      if (predictions.managementTips.length) {
        doc.setFontSize(14); doc.setTextColor(0,102,204); doc.text('Management Tips',14,y); y+=10;
        doc.setTextColor(40,40,40); doc.setFontSize(10);
        predictions.managementTips.forEach(t => { doc.text(`• ${t}`,14,y); y+=6; });
      }

      const filename = selectedFarmer ? `crop_recommendation_${selectedFarmer.id}_${Date.now()}.pdf` : `crop_recommendation_${Date.now()}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error(e); setError('Failed to generate PDF report');
    } finally {
      setPdfGenerating(false);
    }
  };

  const generateAgronomicPracticesPDF = async () => {
    if (!predictions?.mlResult?.predicted_crop) return;
    setPdfGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const crop = predictions.mlResult.predicted_crop;

      doc.setFontSize(18); doc.setTextColor(40,40,40);
      doc.text('Agronomic Practices Guide',105,15,{align:'center'});
      doc.setFontSize(16); doc.text(`For ${crop}`,105,25,{align:'center'});
      if (selectedFarmer) { doc.setFontSize(12); doc.text(`Farmer: ${selectedFarmer.name} (ID: ${selectedFarmer.id})`,105,35,{align:'center'}); }
      doc.setFontSize(12); doc.text(`Date: ${new Date().toLocaleDateString()}`,105,42,{align:'center'});

      let y=55;
      const add = (t)=>{ doc.text(t,14,y,{maxWidth:180}); y+=6; };

      doc.setFontSize(14); doc.setTextColor(0,102,204); doc.text('Introduction',14,y); y+=8;
      doc.setTextColor(40,40,40); doc.setFontSize(10);
      add(`This guide provides recommended agronomic practices for growing ${crop} in your specific conditions. Following these guidelines will help maximize yield and crop quality.`); y+=8;

      doc.setFontSize(14); doc.setTextColor(0,102,204); doc.text('Land Preparation',14,y); y+=8;
      doc.setTextColor(40,40,40); doc.setFontSize(10);
      const lc = crop.toLowerCase();
      if (lc.includes('rice')) { add('• Plow 15–20 cm and puddle thoroughly'); add('• Level field for uniform water'); add('• Prepare bunds to control water'); }
      else if (/potato|onion|carrot/.test(lc)) { add('• Plow 25–30 cm; prepare raised beds'); add('• Ensure good drainage'); }
      else { add('• Plow 20–25 cm; remove debris'); add('• Level for uniform irrigation'); }

      doc.setFontSize(14); doc.setTextColor(0,102,204); doc.text('Soil Amendments',14,y); y+=8;
      doc.setTextColor(40,40,40); doc.setFontSize(10);
      const ph = Number(soilData.pH);
      if (!Number.isNaN(ph)) {
        if (ph < 5.5) add('• Apply agri lime 2–3 t/ha to raise pH');
        else if (ph > 7.5) add('• Add organics/sulfur to gently lower pH');
      }
      add('• Apply well-decomposed manure 10–15 t/ha, 2–3 weeks before planting');

      doc.setFontSize(14); doc.setTextColor(0,102,204); doc.text('Fertilizer Application',14,y); y+=8;
      doc.setTextColor(40,40,40); doc.setFontSize(10);
      const n = Number(soilData.nitrogen), p = Number(soilData.phosphorus), k = Number(soilData.potassium);
      add('Base Application:');
      if (!Number.isNaN(n)) add(n < 20 ? '• N (Urea): 50–100 kg/ha' : '• N (Urea): 30–50 kg/ha');
      if (!Number.isNaN(p)) add(p < 15 ? '• P (TSP): 25–50 kg/ha'   : '• P (TSP): 15–25 kg/ha');
      if (!Number.isNaN(k)) add(k < 150 ? '• K (MOP): 30–60 kg/ha'  : '• K (MOP): 20–30 kg/ha');
      add('Top Dressing: follow crop-specific split doses.');

      if (y > 250) { doc.addPage(); y=20; }
      doc.setFontSize(14); doc.setTextColor(0,102,204); doc.text('Planting Information',14,y); y+=8;
      doc.setTextColor(40,40,40); doc.setFontSize(10);
      if (lc.includes('rice')) { add('• Seed rate 60–80 kg/ha (direct), 40–50 (transplant)'); add('• Spacing ~20×10–15 cm'); }
      else if (lc.includes('potato')) { add('• Seed tubers 1.5–2 t/ha'); add('• Spacing 60–75 cm × 20–25 cm'); }
      else if (lc.includes('tomato')) { add('• Seed 300–400 g/ha (direct) / 200–250 g/ha (nursery)'); add('• Spacing 75–90 cm × 30–45 cm'); }
      else if (lc.includes('onion')) { add('• Seed 7–8 kg/ha (direct) / sets 700–800 kg/ha'); add('• Spacing 15–20 cm × 7–10 cm'); }
      else { add('• Follow standard seed rate and spacing for the crop'); }

      doc.setFontSize(14); doc.setTextColor(0,102,204); doc.text('Irrigation Management',14,y); y+=8;
      doc.setTextColor(40,40,40); doc.setFontSize(10);
      if (lc.includes('rice')) { add('• Maintain 2–5 cm water depth in key stages'); add('• AWD to save water; drain before harvest'); }
      else if (/potato|tomato|onion/.test(lc)) { add('• Keep adequate moisture; avoid waterlogging'); add('• Critical stages: after planting, flowering, development'); }
      else { add('• Irrigate by soil moisture and crop need'); add('• Avoid stress at critical growth stages'); }

      if (y > 250) { doc.addPage(); y=20; }
      doc.setFontSize(14); doc.setTextColor(0,102,204); doc.text('Pest and Disease Management',14,y); y+=8;
      doc.setTextColor(40,40,40); doc.setFontSize(10);
      add('• Rotate crops; scout regularly; use resistant varieties');
      add('• Apply pesticides only when necessary per label; consider IPM');

      doc.setFontSize(14); doc.setTextColor(0,102,204); doc.text('Harvesting',14,y); y+=8;
      doc.setTextColor(40,40,40); doc.setFontSize(10);
      if (lc.includes('rice')) { add('• Harvest at ~80–85% golden grains; dry to 14% moisture'); }
      else if (lc.includes('potato')) { add('• Harvest after tops yellow; cure 7–10 days; store 4–5°C'); }
      else if (lc.includes('tomato')) { add('• Harvest firm, full color; mature-green for long transport'); }
      else if (lc.includes('onion')) { add('• Harvest when tops fall; cure well; store 0–4°C'); }
      else { add('• Harvest at proper maturity; handle gently'); }

      // Show inputs if provided
      const line = (t)=>{ doc.text(t,14,y); y+=6; };
      y+=6; doc.setFontSize(12); doc.setTextColor(0,102,204);
      doc.text('Provided Averages',14,y); y+=8; doc.setTextColor(40,40,40); doc.setFontSize(10);
      if (soilData.avgHumidity !== '') line(`Avg Humidity (user): ${soilData.avgHumidity}%`);
      if (soilData.avgRainfall !== '') line(`Avg Rainfall (user): ${soilData.avgRainfall} mm`);

      doc.setFontSize(10); doc.setTextColor(100,100,100);
      doc.text('Guide is AI-assisted. Consult local extension for specifics.',105,285,{align:'center'});

      const filename = selectedFarmer ? `agronomic_practices_${selectedFarmer.id}_${Date.now()}.pdf` : `agronomic_practices_${Date.now()}.pdf`;
      doc.save(filename);
    } catch {
      setError('Failed to generate agronomic practices PDF');
    } finally {
      setPdfGenerating(false);
    }
  };

  // ----------------------
  // UI
  // ----------------------
  return (
    <ThemeWrapper>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="rounded-lg shadow-lg p-6 mb-6" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
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
          <p style={{ marginTop: '0.5rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
            Get AI-powered crop recommendations based on your soil conditions, location, and season
          </p>
        </div>

        {/* Model Status */}
        <ModelStatusIndicator />

        {/* Farmer Selection */}
        <div className="rounded-lg shadow-lg p-6 border mb-6" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
            <Users className="h-5 w-5 text-green-500" />
            Farmer Selection
            {loadingFarmers && <Loader2 className="h-4 w-4 animate-spin text-green-500 ml-2" />}
          </h2>

          {/* Search */}
          <div className="mb-4 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search farmers by name..."
              className="w-full p-2 pl-10 border rounded-md focus:ring-2 focus:outline-none"
              style={{
                backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff',
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                color: isDark ? '#fff' : '#000'
              }}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto border rounded-md" style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}>
            {loadingFarmers ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: theme.colors.primary }} />
              </div>
            ) : filteredFarmers.length ? (
              <div className="divide-y" style={{ divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                {filteredFarmers.map(f => (
                  <div
                    key={f.id}
                    className="p-3 cursor-pointer transition-colors"
                    style={{
                      backgroundColor: selectedFarmer?.id === f.id
                        ? (isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)')
                        : 'transparent',
                      color: theme.colors.text
                    }}
                    onClick={() => setSelectedFarmer(f)}
                  >
                    <div className="font-medium">{f.name}</div>
                    <div className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      ID: {f.id} • {f.district || 'No district'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                {searchTerm ? 'No farmers match your search' : 'No farmers available'}
              </div>
            )}
          </div>

          {/* Selected */}
          {selectedFarmer && (
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium" style={{ color: theme.colors.text }}>Selected: {selectedFarmer.name}</h3>
                  <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    ID: {selectedFarmer.id} • {selectedFarmer.mobile || 'No contact'} • {selectedFarmer.district || 'No district'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFarmer(null)}
                  className="text-sm p-1 px-2 rounded"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="text-xs mt-2" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Select a farmer to associate predictions with their account and dashboard
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Soil & Location Information
              {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
            </h2>

            {/* API Status Indicator (non-blocking) */}
            <div className="mb-4 p-3 rounded-lg" style={{
              backgroundColor: modelState.error
                ? (isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)')
                : (isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)')
            }}>
              <div className="flex items-center gap-2">
                {modelState.error ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500">{modelState.error}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      ML Model: {modelState.loaded ? 'Connected' : 'Not connected'} — 
                      {modelState.testMode ? ' Running in test mode' : ' Predictions update automatically'}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Soil Type */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Soil Type *</label>
                  <select
                    value={soilData.soilType}
                    onChange={(e) => setSoilData({ ...soilData, soilType: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: isDark ? '#fff' : '#000' }}
                  >
                    <option value="">Select Soil Type</option>
                    {soilTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>

                {/* pH */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Soil pH Level *</label>
                  <input type="number" step="0.1" min="3" max="10" value={soilData.pH}
                         onChange={(e)=>setSoilData({ ...soilData, pH: e.target.value })}
                         className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                         style={{ backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: isDark ? '#fff' : '#000' }}
                         placeholder="e.g., 6.5" />
                </div>

                {/* N/P/K */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Nitrogen (N) ppm *</label>
                  <input type="number" value={soilData.nitrogen}
                         onChange={(e)=>setSoilData({ ...soilData, nitrogen: e.target.value })}
                         className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                         style={{ backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: isDark ? '#fff' : '#000' }}
                         placeholder="e.g., 25" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Phosphorus (P) ppm *</label>
                  <input type="number" value={soilData.phosphorus}
                         onChange={(e)=>setSoilData({ ...soilData, phosphorus: e.target.value })}
                         className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                         style={{ backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: isDark ? '#fff' : '#000' }}
                         placeholder="e.g., 18" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Potassium (K) ppm *</label>
                  <input type="number" value={soilData.potassium}
                         onChange={(e)=>setSoilData({ ...soilData, potassium: e.target.value })}
                         className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                         style={{ backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: isDark ? '#fff' : '#000' }}
                         placeholder="e.g., 200" />
                </div>

                {/* District / Zone / Season / Area */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>District</label>
                  <select
                    value={soilData.district}
                    onChange={(e)=>setSoilData({ ...soilData, district: e.target.value, agroZone: '' })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: isDark ? '#fff' : '#000' }}
                  >
                    <option value="">Select District</option>
                    {Object.keys(districts).map((d)=> <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Agro-ecological Zone *</label>
                  <select
                    value={soilData.agroZone}
                    onChange={(e)=>setSoilData({ ...soilData, agroZone: e.target.value })}
                    disabled={!soilData.district}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{
                      backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: isDark ? '#fff' : '#000',
                      opacity: !soilData.district ? 0.5 : 1,
                      cursor: !soilData.district ? 'not-allowed' : 'default'
                    }}
                  >
                    <option value="">Select Zone</option>
                    {soilData.district && districts[soilData.district].map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Cultivation Season *</label>
                  <select
                    value={soilData.season}
                    onChange={(e)=>setSoilData({ ...soilData, season: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: isDark ? '#fff' : '#000' }}
                  >
                    <option value="">Select Season</option>
                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Land Area (hectares)</label>
                  <input
                    type="number" step="0.1" value={soilData.landArea}
                    onChange={(e)=>setSoilData({ ...soilData, landArea: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: isDark ? '#fff' : '#000' }}
                    placeholder="e.g., 2.5"
                  />
                </div>

                {/* NEW: Avg Humidity */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    Avg Humidity (%)
                  </label>
                  <input
                    type="number" step="0.1" min="0" max="100" value={soilData.avgHumidity}
                    onChange={(e)=>setSoilData({ ...soilData, avgHumidity: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: isDark ? '#fff' : '#000' }}
                    placeholder="e.g., 75"
                  />
                </div>

                {/* NEW: Avg Rainfall */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    Avg Rainfall (mm)
                  </label>
                  <input
                    type="number" step="0.1" min="0" value={soilData.avgRainfall}
                    onChange={(e)=>setSoilData({ ...soilData, avgRainfall: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                    style={{ backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: isDark ? '#fff' : '#000' }}
                    placeholder="e.g., 120"
                  />
                </div>
              </div>

              <div className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                * Required fields — Predictions update automatically as you type
              </div>
            </div>
          </div>

          {/* Right Column: Recommendations, Charts, etc. */}
          <div className="space-y-6">
            {loading && (
              <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" style={{ color: theme.colors.primary }} />
                  <span style={{ color: theme.colors.text }}>Getting AI recommendations...</span>
                </div>
              </div>
            )}

            {predictions && (
              <>
                {/* Prediction Card */}
                <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: theme.colors.text }}>
                      <Leaf className="h-5 w-5" style={{ color: theme.colors.primary }} />
                      AI Crop Recommendations
                      {predictions.mlResult.test_mode && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{
                          backgroundColor: isDark ? 'rgba(234,88,12,0.2)' : 'rgba(234,88,12,0.1)',
                          color: isDark ? '#FDBA74' : '#EA580C'
                        }}>
                          Test Mode
                        </span>
                      )}
                    </h2>

                    {/* PDFs */}
                    <div className="flex gap-2">
                      <button
                        onClick={generatePredictionPDF}
                        disabled={pdfGenerating}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
                          color: isDark ? '#93C5FD' : '#2563EB',
                          opacity: pdfGenerating ? 0.5 : 1, cursor: pdfGenerating ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {pdfGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        <span>Recommendation PDF</span>
                      </button>
                      <button
                        onClick={generateAgronomicPracticesPDF}
                        disabled={pdfGenerating}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)',
                          color: isDark ? '#86EFAC' : '#16A34A',
                          opacity: pdfGenerating ? 0.5 : 1, cursor: pdfGenerating ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {pdfGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        <span>Agronomic Guide</span>
                      </button>
                    </div>
                  </div>

                  {/* Best match */}
                  <div className="mb-4 p-4 rounded-lg" style={{
                    backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)',
                    border: `2px solid ${isDark ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.2)'}`
                  }}>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: isDark ? '#86EFAC' : '#16A34A' }}>
                      🎯 Best Match: {predictions.mlResult.predicted_crop}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}>
                        Confidence: <strong>{predictions.mlResult.confidence}%</strong>
                      </span>
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}>
                        Model Accuracy: <strong>{predictions.mlResult.ml_model_accuracy}%</strong>
                      </span>
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}>
                        Processing: <strong>{predictions.mlResult.processing_time_ms}ms</strong>
                      </span>
                    </div>

                    {selectedFarmer && (
                      <div className="mt-2 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                        <Info className="h-4 w-4 inline-block mr-1" />
                        This prediction has been saved to {selectedFarmer.name}'s history
                      </div>
                    )}
                  </div>

                  {/* Alternatives */}
                  <div className="space-y-3">
                    <h4 className="font-medium" style={{ color: theme.colors.text }}>Alternative Options:</h4>
                    {predictions.crops.slice(1).map((crop, i) => {
                      const c = getSuitabilityStyle(crop.suitability);
                      return (
                        <div key={i} className="border rounded-lg p-3" style={{ borderColor: theme.colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)' }}>
                          <div className="flex justify-between items-center">
                            <h5 className="font-medium" style={{ color: theme.colors.text }}>{crop.name}</h5>
                            <div className="flex items-center gap-2">
                              <span className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>{crop.confidence}%</span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: c.bg, color: c.text }}>{crop.suitability}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Nutrient Chart */}
                <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    Nutrient Levels Overview
                  </h2>
                  <ChartComponent
                    data={{
                      labels: ['Nitrogen', 'Phosphorus', 'Potassium'],
                      datasets: [{
                        label: 'Current Levels',
                        data: [
                          Number(soilData.nitrogen) || 0,
                          Number(soilData.phosphorus) || 0,
                          Number(soilData.potassium) || 0
                        ],
                        borderColor: isDark ? '#818CF8' : '#6366F1',
                        backgroundColor: isDark ? '#818CF8' : '#6366F1',
                        tension: 0.4
                      }]
                    }}
                    options={{
                      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: 'ppm' } } }
                    }}
                  />
                </div>

                {/* Fertilizers */}
                {predictions.fertilizers.length > 0 && (
                  <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                      <Droplets className="h-5 w-5 text-blue-500" />
                      Fertilizer Recommendations
                    </h2>
                    <div className="space-y-4">
                      {predictions.fertilizers.map((f, i) => {
                        const m = f.match(/(\d+)-(\d+) kg\/ha/);
                        const minRate = parseInt(m?.[1] || 0);
                        const maxRate = parseInt(m?.[2] || 0);
                        const area = parseFloat(soilData.landArea) || 0;
                        const minTotal = (minRate * area).toFixed(1);
                        const maxTotal = (maxRate * area).toFixed(1);
                        return (
                          <div key={i} className="flex items-start gap-2 p-3 rounded-lg"
                               style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)', color: isDark ? '#93C5FD' : '#2563EB' }}>
                            <CheckCircle className="h-4 w-4 mt-0.5" />
                            <span className="text-sm">
                              {f} → For {soilData.landArea || 0} ha: <strong>{minTotal}-{maxTotal} kg</strong> total needed
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Weather */}
                {soilData.district && (
                  <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                      <SunIcon className="h-5 w-5 text-yellow-500" />
                      Live Weather in {soilData.district}
                    </h2>
                    {loadingWeather && <p style={{ color: theme.colors.text }}>Loading weather...</p>}
                    {weatherError && <p style={{ color: '#EF4444' }}>{weatherError}</p>}
                    {weather && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {typeof weather.temperature === 'number' && (
                          <div><span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Temperature:</span>
                            <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>{weather.temperature}°C</span></div>
                        )}
                        {typeof weather.windspeed === 'number' && (
                          <div><span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Wind Speed:</span>
                            <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>{weather.windspeed} m/s</span></div>
                        )}
                        {typeof weather.precipitation === 'number' && (
                          <div><span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Precipitation:</span>
                            <span className="ml-2 font-medium" style={{ color: theme.colors.text }}>{weather.precipitation} mm</span></div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Soil Issues */}
                {predictions.soilIssues.length > 0 && (
                  <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Soil Considerations
                    </h2>
                    <div className="space-y-2">
                      {predictions.soilIssues.map((s,i)=>(
                        <div key={i} className="flex items-start gap-2 p-3 rounded-lg"
                             style={{ backgroundColor: isDark ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.1)', color: isDark ? '#FDBA74' : '#EA580C' }}>
                          <AlertTriangle className="h-4 w-4 mt-0.5" />
                          <span className="text-sm">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Management Tips */}
                {predictions.managementTips.length > 0 && (
                  <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Management Tips
                    </h2>
                    <div className="space-y-2">
                      {predictions.managementTips.map((t,i)=>(
                        <div key={i} className="flex items-start gap-2 p-3 rounded-lg"
                             style={{ backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)', color: isDark ? '#86EFAC' : '#16A34A' }}>
                          <CheckCircle className="h-4 w-4 mt-0.5" />
                          <span className="text-sm">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
