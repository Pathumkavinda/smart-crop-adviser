// app/adviser/history/[id]/page.jsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Backend base URL (no trailing slash)
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

// i18n
const translations = {
  en: {
    title: "Crop Recommendation Details",
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
    misc: { ha: "ha", kgHa: "kg/ha", forHa: "For", totalNeeded: "kg total needed" },
    deleteModal: {
      title: "Delete Record",
      message: "Are you sure you want to delete this record? This action cannot be undone.",
      cancel: "Cancel",
      confirm: "Delete",
      success: "Record deleted successfully"
    }
  },
  si: {
    title: "බෝග නිර්දේශ විස්තර",
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
    misc: { ha: "හෙක්ටයාර", kgHa: "කි.ග්‍රෑ/හෙක්ටයාර", forHa: "සඳහා", totalNeeded: "කි.ග්‍රෑ මුළු අවශ්‍යතාවය" },
    deleteModal: {
      title: "වාර්තාව මකන්න",
      message: "ඔබට මෙම වාර්තාව මැකීමට අවශ්‍ය බව විශ්වාසද? මෙම ක්‍රියාව අහෝසි කළ නොහැක.",
      cancel: "අවලංගු කරන්න",
      confirm: "මකන්න",
      success: "වාර්තාව සාර්ථකව මකා දමන ලදී"
    }
  },
  ta: {
    title: "பயிர் பரிந்துரை விவரங்கள்",
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
    misc: { ha: "ஹெக்டேர்", kgHa: "கிலோ/ஹெக்டேர்", forHa: "க்கு", totalNeeded: "கிலோ மொத்தம் தேவை" },
    deleteModal: {
      title: "பதிவை நீக்கு",
      message: "இந்த பதிவை நீக்க விரும்புகிறீர்களா? இந்த செயலை செயல்தவிர்க்க முடியாது.",
      cancel: "ரத்து செய்",
      confirm: "நீக்கு",
      success: "பதிவு வெற்றிகரமாக நீக்கப்பட்டது"
    }
  }
};

export default function HistoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme.name === 'dark';

  const [trans, setTrans] = useState(translations.en);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [record, setRecord] = useState(null);
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  // i18n transitions
  useEffect(() => {
    setIsTransitioning(true);
    const t = setTimeout(() => {
      setTrans(translations[language] || translations.en);
      const t2 = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(t2);
    }, 300);
    return () => clearTimeout(t);
  }, [language]);

  const contentStyle = useMemo(
    () => ({ opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }),
    [isTransitioning]
  );
  const getTextStyle = (base = {}) => {
    const lh = language === 'si' ? 1.7 : language === 'ta' ? 1.8 : 1.5;
    return { ...base, lineHeight: lh, transition: 'all 0.3s ease' };
  };

  // Helpers
  const getToken = () => {
    try { return localStorage.getItem('token') || ''; } catch { return ''; }
  };
  const safeNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : '';
  };

  // Fetch detail (uses your real columns/route)
  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setErr('');

      const token = getToken();
      const headers = { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

      const res = await fetch(`${API_BASE}/api/v1/predictions/${id}`, { headers });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Failed to fetch record: HTTP ${res.status}`);
      }
      const json = await res.json();
      const r = json?.data ?? json ?? {};

      // Map to UI fields using PredictionHistory schema
      const normalized = {
        id: r.id ?? r._id ?? id,
        created_at: r.created_at ?? r.updated_at ?? r.date ?? new Date().toISOString(),
        district: r.district ?? '-',
        agro_zone: r.agro_ecological_zone ?? r.agro_zone ?? '-',
        season: r.cultivate_season ?? r.season ?? '-',
        land_area: safeNumber(r.land_area ?? 0),
        soil_type: r.soil_type ?? '-',
        ph: safeNumber(r.soil_ph_level ?? r.ph),
        nitrogen: safeNumber(r.nitrogen),
        phosphorus: safeNumber(r.phosphate),   // phosphate -> phosphorus
        potassium: safeNumber(r.potassium),
        crop_name: r.crop_name ?? '',
      };
      setRecord(normalized);

      // Minimal "recommendations" derived from crop_name (avoids 404 from /recommendations)
      setRecs({
        crops: normalized.crop_name
          ? [{ name: normalized.crop_name, suitability: 'Good', reason: 'Based on recorded crop name' }]
          : [],
        soil_issues: [],
        fertilizers: [],
        management_tips: []
      });
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Failed to fetch record data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const nutrientChartData = useMemo(() => ({
    labels: ['Nitrogen', 'Phosphorus', 'Potassium'],
    datasets: [{
      label: 'Current Levels',
      data: [
        Number(record?.nitrogen || 0),
        Number(record?.phosphorus || 0),
        Number(record?.potassium || 0)
      ],
      borderColor: isDark ? '#818CF8' : '#6366F1',
      backgroundColor: isDark ? '#818CF8' : '#6366F1',
      tension: 0.4
    }]
  }), [record, isDark]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: theme.colors.border,
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        ticks: { color: theme.colors.text }
      },
      x: {
        grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        ticks: { color: theme.colors.text }
      }
    }
  }), [isDark, theme.colors]);

  const handlePrint = () => window.print();

  const handleDelete = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error('Authentication required');

      const res = await fetch(`${API_BASE}/api/v1/predictions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Failed to delete record: HTTP ${res.status}`);
      }

      alert(trans.deleteModal.success);
      router.push('/adviser/history');
    } catch (e) {
      console.error(e);
      setErr(e.message || trans.loadingError);
    } finally {
      setLoading(false);
      setShowDelete(false);
    }
  }, [id, router, trans.deleteModal.success, trans.loadingError]);

  const getSuitabilityColor = (s) => {
    switch (s) {
      case 'Excellent': return { bg: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)', text: isDark ? '#86EFAC' : '#16A34A' };
      case 'Good': return { bg: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)', text: isDark ? '#93C5FD' : '#2563EB' };
      case 'Fair': return { bg: isDark ? 'rgba(234,179,8,0.2)' : 'rgba(234,179,8,0.1)', text: isDark ? '#FDE68A' : '#D97706' };
      default: return { bg: isDark ? 'rgba(107,114,128,0.2)' : 'rgba(107,114,128,0.1)', text: isDark ? '#D1D5DB' : '#4B5563' };
    }
  };

  const translateSuitability = (s) => {
    const map = {
      Excellent: { si: 'විශිෂ්ට', ta: 'சிறந்தது' },
      Good: { si: 'හොඳයි', ta: 'நல்லது' },
      Fair: { si: 'සාධාරණයි', ta: 'நியாயமானது' }
    };
    if (language === 'en') return s;
    return map[s]?.[language] || s;
  };
  const translateSeverity = (sev) => {
    const map = {
      High: { si: 'ඉහළ', ta: 'உயர்' },
      Medium: { si: 'මධ්‍යම', ta: 'நடுத்தர' },
      Low: { si: 'අඩු', ta: 'குறைந்த' }
    };
    if (language === 'en') return sev;
    return map[sev]?.[language] || sev;
  };
  const translateCropType = (ct) => {
    const map = { General: { si: 'සාමාන්‍ය', ta: 'பொது' } };
    if (language === 'en') return ct;
    return map[ct]?.[language] || ct;
  };

  // Renders
  if (loading) {
    return (
      <ThemeWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.colors.primary }} />
        </div>
      </ThemeWrapper>
    );
  }

  if (err) {
    return (
      <ThemeWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-md p-4" style={{ backgroundColor: isDark ? 'rgba(220,38,38,0.2)' : '#FEF2F2', borderLeftWidth: '4px', borderLeftColor: isDark ? '#EF4444' : '#DC2626' }}>
            <div className="flex">
              <AlertTriangle className="h-5 w-5" style={{ color: isDark ? '#F87171' : '#DC2626' }} />
              <p className="text-sm ml-3" style={{ ...getTextStyle({ color: isDark ? '#F87171' : '#B91C1C' }), ...contentStyle }}>{err}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/adviser/history" className="inline-flex items-center px-4 py-2 rounded-md text-white hover:opacity-90"
              style={{ backgroundColor: theme.colors.primary }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span style={{ ...contentStyle, ...getTextStyle() }}>{trans.backToHistory}</span>
            </Link>
          </div>
        </div>
      </ThemeWrapper>
    );
  }

  if (!record) {
    return (
      <ThemeWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-md p-4" style={{ backgroundColor: isDark ? 'rgba(234,179,8,0.2)' : '#FEF9C3', borderLeftWidth: '4px', borderLeftColor: isDark ? '#EAB308' : '#CA8A04' }}>
            <div className="flex">
              <AlertTriangle className="h-5 w-5" style={{ color: isDark ? '#FACC15' : '#CA8A04' }} />
              <p className="text-sm ml-3" style={{ ...getTextStyle({ color: isDark ? '#FACC15' : '#854D0E' }), ...contentStyle }}>{trans.recordNotFound}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/adviser/history" className="inline-flex items-center px-4 py-2 rounded-md text-white hover:opacity-90"
              style={{ backgroundColor: theme.colors.primary }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span style={{ ...contentStyle, ...getTextStyle() }}>{trans.backToHistory}</span>
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
        <div className="rounded-lg shadow-lg p-6 mb-6" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Leaf className="h-8 w-8" style={{ color: theme.colors.primary }} />
              <h1 className="text-3xl font-bold" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                {trans.title}
              </h1>
            </div>
            <div className="flex space-x-2">
              <Link href="/adviser/history" className="p-2 rounded-full transition"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: theme.colors.text }} title={trans.backToHistory}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <button onClick={handlePrint} className="p-2 rounded-full transition"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: theme.colors.text }} title={trans.printRecord}>
                <Printer className="h-5 w-5" />
              </button>
              <button onClick={() => setShowDelete(true)} className="p-2 rounded-full transition"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: '#EF4444' }} title={trans.deleteRecord}>
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Calendar className="h-5 w-5 mr-2" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} />
            <p style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
              {new Date(record.created_at).toLocaleDateString()} — {record.district}{record.agro_zone ? `, ${record.agro_zone}` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Recommendations + Chart */}
          <div className="space-y-6">
            {/* Crops */}
            <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                <Leaf className="h-5 w-5" style={{ color: theme.colors.primary }} />
                {trans.sections.recommendedCrops}
              </h2>
              <div className="space-y-3">
                {(recs?.crops ?? []).map((crop, i) => {
                  const color = getSuitabilityColor(crop.suitability);
                  return (
                    <div key={i} className="border rounded-lg p-4"
                      style={{ borderColor: theme.colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                          {crop.name}
                        </h3>
                        {crop.suitability && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: color.bg, color: color.text }}>
                            <span style={{ ...contentStyle, ...getTextStyle() }}>{translateSuitability(crop.suitability)}</span>
                          </span>
                        )}
                      </div>
                      {crop.reason && (
                        <p className="text-sm" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
                          {crop.reason}
                        </p>
                      )}
                    </div>
                  );
                })}
                {(!recs || (recs.crops || []).length === 0) && (
                  <p className="text-sm" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }) }}>
                    —
                  </p>
                )}
              </div>
            </div>

            {/* Nutrient chart */}
            <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                <BarChart3 className="h-5 w-5 text-purple-500" />
                {trans.sections.nutrientLevels}
              </h2>
              <div className="h-64">
                <Line data={nutrientChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Right: Extras */}
          <div className="space-y-6">
            {/* Fertilizers (render only when provided later) */}
            {(recs?.fertilizers || []).length > 0 && (
              <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                  <Droplets className="h-5 w-5 text-blue-500" />
                  {trans.sections.fertilizerRecommendations}
                </h2>
                <div className="space-y-4">
                  {(recs?.fertilizers || []).map((f, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg"
                      style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)', color: isDark ? '#93C5FD' : '#2563EB' }}>
                      <CheckCircle className="h-4 w-4 mt-0.5" />
                      <span className="text-sm" style={{ ...contentStyle, ...getTextStyle() }}>
                        {f.fertilizer}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soil issues */}
            {(recs?.soil_issues || []).length > 0 && (
              <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  {trans.sections.soilConsiderations}
                </h2>
                <div className="space-y-2">
                  {(recs?.soil_issues || []).map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg"
                      style={{ backgroundColor: isDark ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.1)', color: isDark ? '#FDBA74' : '#C2410C' }}>
                      <AlertTriangle className="h-4 w-4 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium" style={{ ...contentStyle, ...getTextStyle() }}>
                          {issue.issue}
                        </span>
                        {issue.severity && (
                          <span
                            className="ml-2 px-1.5 py-0.5 text-xs rounded"
                            style={{
                              backgroundColor:
                                issue.severity === 'High'
                                  ? (isDark ? 'rgba(220,38,38,0.5)' : 'rgba(220,38,38,0.2)')
                                  : (isDark ? 'rgba(234,179,8,0.5)' : 'rgba(234,179,8,0.2)'),
                              color:
                                issue.severity === 'High'
                                  ? (isDark ? '#FCA5A5' : '#B91C1C')
                                  : (isDark ? '#FDE68A' : '#B45309')
                            }}
                          >
                            <span style={{ ...contentStyle, ...getTextStyle() }}>{translateSeverity(issue.severity)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Management tips */}
            {(recs?.management_tips || []).length > 0 && (
              <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                  <Thermometer className="h-5 w-5" style={{ color: theme.colors.primary }} />
                  {trans.sections.managementTips}
                </h2>
                <div className="space-y-2">
                  {(recs?.management_tips || []).map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg"
                      style={{ backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)', color: isDark ? '#86EFAC' : '#16A34A' }}>
                      <CheckCircle className="h-4 w-4 mt-0.5" />
                      <div>
                        <span className="text-sm" style={{ ...contentStyle, ...getTextStyle() }}>{tip.tip}</span>
                        {tip.crop_type && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs rounded"
                            style={{ backgroundColor: isDark ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.2)', color: isDark ? '#A7F3D0' : '#065F46' }}>
                            <span style={{ ...contentStyle, ...getTextStyle() }}>{translateCropType(tip.crop_type)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soil parameters */}
            <div className="rounded-lg shadow-lg p-6 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                <MapPin className="h-5 w-5 text-purple-500" />
                {trans.sections.soilParameters}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <ParamRow label={trans.soilParams.district} value={record.district} />
                <ParamRow label={trans.soilParams.zone} value={record.agro_zone || '-'} />
                <ParamRow label={trans.soilParams.season} value={record.season} />
                <ParamRow label={trans.soilParams.landArea} value={`${record.land_area || 0} ${trans.misc.ha}`} />
                <ParamRow label={trans.soilParams.soilType} value={record.soil_type} />
                <ParamRow label={trans.soilParams.soilPh} value={record.ph} />
                <ParamRow label={trans.soilParams.nitrogen} value={`${record.nitrogen}`} />
                <ParamRow label={trans.soilParams.phosphorus} value={`${record.phosphorus}`} />
                <ParamRow label={trans.soilParams.potassium} value={`${record.potassium}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between">
          <Link href="/adviser/history" className="inline-flex items-center px-4 py-2 rounded-md text-white hover:opacity-90"
            style={{ backgroundColor: theme.colors.primary }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span style={{ ...contentStyle, ...getTextStyle() }}>{trans.backToHistory}</span>
          </Link>
          <button onClick={() => setShowDelete(true)} className="inline-flex items-center px-4 py-2 rounded-md text-white hover:opacity-90"
            style={{ backgroundColor: '#EF4444' }}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span style={{ ...contentStyle, ...getTextStyle() }}>{trans.deleteRecord}</span>
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-10">
          <div className="max-w-md w-full p-6 rounded-lg shadow-xl" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
            <h3 className="text-lg font-medium" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
              {trans.deleteModal.title}
            </h3>
            <p className="mt-2" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
              {trans.deleteModal.message}
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button type="button" className="inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff', color: theme.colors.text, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                onClick={() => setShowDelete(false)}>
                <span style={{ ...contentStyle, ...getTextStyle() }}>{trans.deleteModal.cancel}</span>
              </button>
              <button type="button" className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm hover:opacity-90"
                style={{ backgroundColor: '#EF4444' }} onClick={handleDelete}>
                <span style={{ ...contentStyle, ...getTextStyle() }}>{trans.deleteModal.confirm}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ThemeWrapper>
  );
}

function ParamRow({ label, value }) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme.name === 'dark';
  const getTextStyle = (base = {}) => {
    const lh = language === 'si' ? 1.7 : language === 'ta' ? 1.8 : 1.5;
    return { ...base, lineHeight: lh, transition: 'all 0.3s ease' };
  };

  return (
    <div>
      <span style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }) }}>{label}</span>
      <span className="ml-2 font-medium" style={{ ...getTextStyle({ color: theme.colors.text }) }}>{value}</span>
    </div>
  );
}
