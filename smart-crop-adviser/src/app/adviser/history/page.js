'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import { Clock, Leaf, MapPin, Calendar, Moon, Sun, AlertTriangle } from 'lucide-react';

// Prefer env, fall back to localhost
const RAW_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE = RAW_API.replace(/\/+$/, '');
const PREDICTIONS_URL = `${API_BASE}/api/v1/predictions`;

// Translations (unchanged)
const translations = {
  en: {
    title: "Crop Recommendation History",
    subtitle: "View your past soil tests and crop recommendations",
    loading: "Loading your soil test history...",
    backToDashboard: "Back to Dashboard",
    emptyState: "No soil test history found.",
    auth: {
      error: "Authentication Error",
      message: "Authentication required. Redirecting to login...",
      login: "Go to Login"
    },
    history: {
      soilTest: "Soil Test #",
      season: "Season",
      soilParameters: "Soil Parameters",
      recommendedCrops: "Recommended Crops",
      viewDetails: "View Full Details",
      parameters: {
        ph: "pH Level:",
        nitrogen: "Nitrogen (N):",
        phosphorus: "Phosphorus (P):",
        potassium: "Potassium (K):"
      }
    }
  },
  si: {
    title: "බෝග නිර්දේශ ඉතිහාසය",
    subtitle: "ඔබගේ පෙර පස් පරීක්ෂණ සහ බෝග නිර්දේශ බලන්න",
    loading: "ඔබගේ පස් පරීක්ෂණ ඉතිහාසය පූරණය වෙමින්...",
    backToDashboard: "උපකරණ පුවරුවට ආපසු",
    emptyState: "පස් පරීක්ෂණ ඉතිහාසයක් හමු නොවීය.",
    auth: { error: "සත්‍යාපන දෝෂය", message: "සත්‍යාපනය අවශ්‍යයි. පිවිසුමට යොමු කරමින්...", login: "පිවිසුමට යන්න" },
    history: {
      soilTest: "පස් පරීක්ෂණය #",
      season: "කන්නය",
      soilParameters: "පසෙහි පරාමිතීන්",
      recommendedCrops: "නිර්දේශිත බෝග",
      viewDetails: "සම්පූර්ණ විස්තර බලන්න",
      parameters: { ph: "pH මට්ටම:", nitrogen: "නයිට්‍රජන් (N):", phosphorus: "පොස්පරස් (P):", potassium: "පොටෑසියම් (K):" }
    }
  },
  ta: {
    title: "பயிர் பரிந்துரை வரலாறு",
    subtitle: "உங்களின் கடந்த மண் சோதனைகள் மற்றும் பயிர் பரிந்துரைகளைப் பார்க்கவும்",
    loading: "உங்கள் மண் சோதனை வரலாற்றை ஏற்றுகிறது...",
    backToDashboard: "டாஷ்போர்டுக்குத் திரும்பு",
    emptyState: "மண் சோதனை வரலாறு எதுவும் காணப்படவில்லை.",
    auth: { error: "அங்கீகார பிழை", message: "அங்கீகாரம் தேவை. உள்நுழைவுக்கு திருப்பி விடப்படுகிறது...", login: "உள்நுழைவுக்குச் செல்லுங்கள்" },
    history: {
      soilTest: "மண் சோதனை #",
      season: "பருவம்",
      soilParameters: "மண் அளவுருக்கள்",
      recommendedCrops: "பரிந்துரைக்கப்பட்ட பயிர்கள்",
      viewDetails: "முழு விவரங்களைக் காண்க",
      parameters: { ph: "pH நிலை:", nitrogen: "நைட்ரஜன் (N):", phosphorus: "பாஸ்பரஸ் (P):", potassium: "பொட்டாசியம் (K):" }
    }
  }
};

export default function HistoryPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme.name === 'dark';

  const [trans, setTrans] = useState(translations.en);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState('');

  // language transitions
  useEffect(() => {
    setIsTransitioning(true);
    const t = setTimeout(() => {
      setTrans(translations[language] || translations.en);
      const t2 = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(t2);
    }, 300);
    return () => clearTimeout(t);
  }, [language]);

  const contentStyle = { opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.3s ease-in-out' };
  const getTextStyle = (baseStyle = {}) => {
    const lh = language === 'si' ? 1.7 : language === 'ta' ? 1.8 : 1.5;
    return { ...baseStyle, lineHeight: lh, transition: 'all 0.3s ease' };
  };

  // ---- i18n helpers ----
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const locale = language === 'si' ? 'si-LK' : language === 'ta' ? 'ta-LK' : 'en-US';
    const d = new Date(dateString);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(locale, options);
  };

  const translateSoilType = (soilType) => {
    const map = {
      'Red Yellow Podzolic': { si: 'රතු-කහ පොඩ්සොලික්', ta: 'சிவப்பு மஞ்சள் போட்சோலிக்' },
      'Reddish Brown Earth': { si: 'රතු දුඹුරු පස', ta: 'சிவப்பு பழுப்பு நிலம்' }
    };
    if (language === 'en') return soilType;
    return map[soilType]?.[language] || soilType;
  };

  const translateSeason = (season) => {
    const map = { Yala: { si: 'යල', ta: 'யாலா' }, Maha: { si: 'මහ', ta: 'மஹா' } };
    if (language === 'en') return season;
    return map[season]?.[language] || season;
  };

  // ---- data fetch (DB only) ----
  const getToken = () => {
    try { return localStorage.getItem('token') || ''; } catch { return ''; }
  };

  // Accept common shapes; prefer `data`
  const extractArray = (json) => {
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.results)) return json.results;
    if (Array.isArray(json?.predictions)) return json.predictions;
    return [];
  };

  // Map your real PredictionHistory schema to UI
  const transformResults = (arr) =>
    arr.map((item, idx) => {
      const id = item.id ?? item._id ?? idx + 1;
      const date = item.created_at ?? item.updated_at ?? item.date ?? '';
      const district = item.district ?? '';
      const agroZone = item.agro_ecological_zone ?? '';
      const season = item.cultivate_season ?? '';
      const soilType = item.soil_type ?? '';
      const pH = item.soil_ph_level ?? item.ph ?? '';
      const nitrogen = item.nitrogen ?? '';
      const phosphorus = item.phosphate ?? '';
      const potassium = item.potassium ?? '';

      let recommendations = [];
      if (Array.isArray(item.recommendations)) recommendations = item.recommendations;
      else if (Array.isArray(item.recommendedCrops)) recommendations = item.recommendedCrops;
      else if (Array.isArray(item.crops)) recommendations = item.crops;
      else if (item.crop_name) recommendations = [item.crop_name];

      return {
        id,
        date,
        district,
        agroZone,
        season,
        soilType,
        pH: pH === null || pH === undefined ? '' : Number(pH),
        nitrogen: nitrogen === null || nitrogen === undefined ? '' : Number(nitrogen),
        phosphorus: phosphorus === null || phosphorus === undefined ? '' : Number(phosphorus),
        potassium: potassium === null || potassium === undefined ? '' : Number(potassium),
        recommendations
      };
    });

  // ---- NEW: fetch ALL pages and then sort latest → earliest
  const fetchHistoryData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = getToken();
      const headers = {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const PAGE_LIMIT = 500;
      const pullAllPages = async () => {
        const all = [];
        let page = 1;
        let totalPages = Infinity;

        while (page <= totalPages) {
          const url = `${PREDICTIONS_URL}?page=${page}&limit=${PAGE_LIMIT}`;
          const res = await fetch(url, { method: 'GET', headers });
          if (!res.ok) throw new Error(`Failed to fetch history data (HTTP ${res.status})`);

          const json = await res.json();
          const batch = extractArray(json);
          all.push(...batch);

          const reportedTotalPages = json?.pagination?.totalPages;
          if (Number.isFinite(reportedTotalPages)) totalPages = reportedTotalPages;
          if (!Number.isFinite(reportedTotalPages) && batch.length < PAGE_LIMIT) break;

          page += 1;
        }
        return all;
      };

      // Pull all pages; fallback to single call if needed
      let raw = await pullAllPages();
      if (!raw.length) {
        const res = await fetch(PREDICTIONS_URL, { method: 'GET', headers });
        if (!res.ok) throw new Error(`Failed to fetch history data (HTTP ${res.status})`);
        const json = await res.json();
        raw = extractArray(json);
      }

      const transformed = transformResults(raw);

      // >>> Sort by date DESC (latest → earliest) <<<
      transformed.sort((a, b) => new Date(b.date) - new Date(a.date));

      setHistoryData(transformed);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('History fetch error:', err?.message || err);
      setError(err?.message || 'Failed to fetch');
      setIsAuthenticated(false);
      setTimeout(() => router.push('/login'), 1200);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  const goToDetails = (id) => router.push(`/adviser/history/${id}`);

  // ---- render ----
  if (isLoading) {
    return (
      <ThemeWrapper className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-r-transparent"
            style={{ borderColor: theme.colors.primary }}
            role="status"
          />
          <p className="mt-2" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
            {trans.loading}
          </p>
        </div>
      </ThemeWrapper>
    );
  }

  if (!isAuthenticated && error) {
    return (
      <ThemeWrapper className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 rounded-lg shadow-lg" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
          <div className="text-center mb-4">
            <AlertTriangle size={48} className="mx-auto" style={{ color: '#EF4444' }} />
            <h2 className="text-xl font-semibold mt-2" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
              {trans.auth.error}
            </h2>
          </div>
          <p className="mb-4" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
            {trans.auth.message}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2 px-4 rounded-md hover:opacity-90 transition duration-200 font-medium text-white"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <span style={{ ...contentStyle, ...getTextStyle() }}>{trans.auth.login}</span>
          </button>
        </div>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="rounded-lg shadow-lg p-6 mb-6" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8" style={{ color: theme.colors.primary }} />
              <h1 className="text-3xl font-bold" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                {trans.title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-md transition"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: theme.colors.text }}
              >
                <span style={{ ...contentStyle, ...getTextStyle() }}>{trans.backToDashboard}</span>
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full transition"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: isDark ? '#FACC15' : theme.colors.text }}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <p style={{ marginTop: '0.5rem', ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
            {trans.subtitle}
          </p>
        </div>

        {/* History Cards (latest → earliest) */}
        <div className="space-y-6">
          {historyData.length === 0 ? (
            <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
              <p className="text-center py-8" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                {trans.emptyState}
              </p>
            </div>
          ) : (
            historyData.map((entry) => (
              <div key={entry.id} className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                      {trans.history.soilTest}{entry.id}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <Calendar className="h-4 w-4" style={{ color: '#3B82F6' }} />
                      <span style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
                        {formatDate(entry.date)}
                      </span>
                      {(entry.district || entry.agroZone) && (
                        <>
                          <MapPin className="h-4 w-4 ml-2" style={{ color: '#3B82F6' }} />
                          <span style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
                            {[entry.district, entry.agroZone].filter(Boolean).join(', ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.season && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)', color: isDark ? '#C4B5FD' : '#7C3AED' }}>
                        <span style={{ ...contentStyle, ...getTextStyle() }}>
                          {translateSeason(entry.season)} {trans.history.season}
                        </span>
                      </span>
                    )}
                    {entry.soilType && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)', color: isDark ? '#93C5FD' : '#2563EB' }}>
                        <span style={{ ...contentStyle, ...getTextStyle() }}>
                          {translateSoilType(entry.soilType)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Soil Parameters */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                    <h3 className="text-md font-medium mb-3" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                      {trans.history.soilParameters}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }), ...contentStyle }}>
                          {trans.history.parameters.ph}
                        </span>
                        <p className="font-medium" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                          {entry.pH !== '' && entry.pH !== undefined ? entry.pH : ''}
                        </p>
                      </div>
                      <div>
                        <span style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }), ...contentStyle }}>
                          {trans.history.parameters.nitrogen}
                        </span>
                        <p className="font-medium" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                          {entry.nitrogen !== '' && entry.nitrogen !== undefined ? `${entry.nitrogen} ppm` : ''}
                        </p>
                      </div>
                      <div>
                        <span style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }), ...contentStyle }}>
                          {trans.history.parameters.phosphorus}
                        </span>
                        <p className="font-medium" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                          {entry.phosphorus !== '' && entry.phosphorus !== undefined ? `${entry.phosphorus} ppm` : ''}
                        </p>
                      </div>
                      <div>
                        <span style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }), ...contentStyle }}>
                          {trans.history.parameters.potassium}
                        </span>
                        <p className="font-medium" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                          {entry.potassium !== '' && entry.potassium !== undefined ? `${entry.potassium} ppm` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Crops */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                    <h3 className="text-md font-medium mb-3" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                      {trans.history.recommendedCrops}
                    </h3>
                    <div className="space-y-2">
                      {(entry.recommendations || []).map((crop, index) => (
                        <div key={index} className="flex items-center gap-2 py-1.5 px-3 rounded-lg"
                          style={{ backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)', color: isDark ? '#86EFAC' : '#16A34A' }}>
                          <Leaf className="h-4 w-4" style={{ color: theme.colors.primary }} />
                          <span className="text-sm" style={{ ...contentStyle, ...getTextStyle() }}>
                            {typeof crop === 'string' ? crop : (crop?.name ?? '')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => goToDetails(entry.id)}
                    className="text-sm px-4 py-2 rounded-md transition text-white"
                    style={{ backgroundColor: isDark ? '#3B82F6' : '#2563EB' }}
                  >
                    <span style={{ ...contentStyle, ...getTextStyle() }}>
                      {trans.history.viewDetails}
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ThemeWrapper>
  );
}
