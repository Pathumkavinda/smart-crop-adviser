'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import ThemeWrapper from '@/components/ThemeWrapper';

// External components
import UserChat from '@/components/UserChat';
import DocumentsForAdvisers from '@/components/document-for-adviser';
import RequestAdviser from '@/components/request_adviser';
import CultivationDates from '@/components/cultivation';
import FertilizerCalendar from '@/components/fertilizer';
import CropTimer from '@/components/timer';

import {
  User,
  Calendar,
  Clock,
  FileText,
  Bell,
  BarChart,
  LineChart,
  MessageSquare,
  Eye,
  ArrowLeft,
  Thermometer,
  Droplet,
  CloudRain,
} from 'lucide-react';

/* =======================
   API bases + tiny utils
   ======================= */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE = (API_URL || '').replace(/\/+$/, '');
const NOTIFICATIONS_URL = '/notifications';

// local read flags
const localReadKey = (type, id) => `notif_read:${type}:${id}`;
const isLocallyRead = (type, id) => {
  try { return !!localStorage.getItem(localReadKey(type, id)); } catch { return false; }
};

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
const authHeader = (token) => (token ? { Authorization: `Bearer ${token}` } : {});
const safeJSON = async (res) => { try { return await res.json(); } catch { return null; } };

// Safe fetch helper that ignores abort noise
const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (error?.name === 'AbortError') {
      return {
        ok: false,
        status: 499, // client-aborted sentinel
        aborted: true,
        json: async () => ({ aborted: true }),
      };
    }
    console.error(`Error fetching ${url}:`, error);
    return {
      ok: false,
      status: 500,
      json: async () => ({ error: 'Failed to fetch' }),
    };
  }
};

// Normalize {data:[…]} | {rows:[…]} | […]
const toArray = (body) => {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== 'object') return [];
  const keys = ['data', 'items', 'results', 'list', 'rows', 'records', 'notifications'];
  for (const k of keys) {
    if (Array.isArray(body[k])) return body[k];
    if (body[k] && typeof body[k] === 'object' && Array.isArray(body[k].rows)) return body[k].rows;
  }
  if (Array.isArray(body?.data?.items)) return body.data.items;
  return [];
};

/* =======================
   Feature flags (no 404s)
   ======================= */
const FEATURES = {
  // flip to true only when your backend exposes these routes
  messages: false,       // GET /api/v1/messages?receiver_id=…
  messageFiles: false,   // GET /api/v1/files?receiver_id=…
  userFiles: false,      // GET /api/v1/user-files/farmer/:id
  predictions: true,     // GET /api/v1/predictions?user_id=…
  fertilizers: true,     // GET /api/v1/fertilizers?user_id=… (set false if not available)
  appointments: true,    // GET /api/v1/appointments?user_id=… (set false if not available)
};

const daysUntil = (d) => {
  if (!d) return 9999;
  const target = new Date(d).setHours(0,0,0,0);
  const today = new Date().setHours(0,0,0,0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

// ---- Translations (complete)
const translations = {
  en: {
    title: 'User Dashboard',
    sections: {
      lastPrediction: 'Last Prediction',
      predictionHistory: 'Prediction History',
      adviserDocuments: 'Documents from Adviser',
      cultivationDates: 'Cultivation Dates',
      fertilizerCalendar: 'Fertilizer Application Calendar',
      notifications: 'Notifications',
      timer: 'Timer',
      contactAdvisor: 'Contact Advisor',
      messages: 'Messages',
    },
    lastPrediction: {
      title: 'Last Prediction',
      subtitle: 'Details of your most recent crop prediction',
      date: 'Date',
      suitability: 'Suitability',
      noPrediction: 'No recent prediction available',
      viewAllPredictions: 'View All Predictions',
    },
    predictionHistory: {
      title: 'Prediction History',
      subtitle: 'View your crop prediction history',
      date: 'Date',
      crop: 'Crop',
      district: 'District',
      suitability: 'Suitability',
      viewDetails: 'View Details',
      noPredictions: 'No prediction history available',
      highSuitability: 'High Suitability',
      mediumSuitability: 'Medium Suitability',
      lowSuitability: 'Low Suitability',
      predictionResult: 'Prediction Result',
      adviserName: 'Adviser Name',
      soilParameters: 'Soil Parameters',
      soilType: 'Soil Type',
      soilPh: 'Soil pH',
      nitrogen: 'Nitrogen',
      phosphate: 'Phosphate',
      potassium: 'Potassium',
      environmentalConditions: 'Environmental Conditions',
      temperature: 'Temperature',
      humidity: 'Humidity',
      rainfall: 'Rainfall',
      backToPredictions: 'Back to Predictions',
    },
  },
  
  // Sinhala translations
  si: {
    title: 'පරිශීලක ඩැෂ්බෝඩ්',
    sections: {
      lastPrediction: 'අවසන් අනාවැකිය',
      predictionHistory: 'අනාවැකි ඉතිහාසය',
      adviserDocuments: 'උපදේශකගෙන් ලැබුණු ලේඛන',
      cultivationDates: 'වගා දින',
      fertilizerCalendar: 'පොහොර යෙදීමේ දින දර්ශනය',
      notifications: 'දැනුම්දීම්',
      timer: 'කාල ගණකය',
      contactAdvisor: 'උපදේශක සම්බන්ධ කර ගන්න',
      messages: 'පණිවිඩ',
    },
    lastPrediction: {
      title: 'අවසන් අනාවැකිය',
      subtitle: 'ඔබගේ නවතම බෝග අනාවැකි විස්තර',
      date: 'දිනය',
      suitability: 'සුදුසුකම',
      noPrediction: 'මෑත අනාවැකි නොමැත',
      viewAllPredictions: 'සියලුම අනාවැකි බලන්න',
    },
    predictionHistory: {
      title: 'අනාවැකි ඉතිහාසය',
      subtitle: 'ඔබගේ බෝග අනාවැකි ඉතිහාසය බලන්න',
      date: 'දිනය',
      crop: 'බෝගය',
      district: 'දිස්ත්‍රික්කය',
      suitability: 'සුදුසුකම',
      viewDetails: 'විස්තර බලන්න',
      noPredictions: 'අනාවැකි ඉතිහාසයක් නොමැත',
      highSuitability: 'ඉහළ සුදුසුකම',
      mediumSuitability: 'මධ්‍යම සුදුසුකම',
      lowSuitability: 'අඩු සුදුසුකම',
      predictionResult: 'අනාවැකි ප්‍රතිඵලය',
      adviserName: 'උපදේශකගේ නම',
      soilParameters: 'පස් පරාමිතීන්',
      soilType: 'පස් වර්ගය',
      soilPh: 'පස් pH අගය',
      nitrogen: 'නයිට්‍රජන්',
      phosphate: 'පොස්පේට්',
      potassium: 'පොටෑසියම්',
      environmentalConditions: 'පාරිසරික තත්ත්වයන්',
      temperature: 'උෂ්ණත්වය',
      humidity: 'ආර්ද්‍රතාවය',
      rainfall: 'වර්ෂාපතනය',
      backToPredictions: 'අනාවැකි වෙත ආපසු යන්න',
    },
  },
  
  // Tamil translations
  ta: {
    title: 'பயனர் டாஷ்போர்டு',
    sections: {
      lastPrediction: 'கடைசி கணிப்பு',
      predictionHistory: 'கணிப்பு வரலாறு',
      adviserDocuments: 'ஆலோசகரின் ஆவணங்கள்',
      cultivationDates: 'சாகுபடி திகதிகள்',
      fertilizerCalendar: 'உர பயன்பாட்டு காலண்டர்',
      notifications: 'அறிவிப்புகள்',
      timer: 'டைமர்',
      contactAdvisor: 'ஆலோசகரை தொடர்புகொள்ளவும்',
      messages: 'செய்திகள்',
    },
    lastPrediction: {
      title: 'கடைசி கணிப்பு',
      subtitle: 'உங்கள் சமீபத்திய பயிர் கணிப்பின் விவரங்கள்',
      date: 'திகதி',
      suitability: 'பொருத்தம்',
      noPrediction: 'சமீபத்திய கணிப்பு இல்லை',
      viewAllPredictions: 'அனைத்து கணிப்புகளையும் காண',
    },
    predictionHistory: {
      title: 'கணிப்பு வரலாறு',
      subtitle: 'உங்கள் பயிர் கணிப்பு வரலாற்றைக் காண்க',
      date: 'திகதி',
      crop: 'பயிர்',
      district: 'மாவட்டம்',
      suitability: 'பொருத்தம்',
      viewDetails: 'விவரங்களைக் காண',
      noPredictions: 'கணிப்பு வரலாறு இல்லை',
      highSuitability: 'அதிக பொருத்தம்',
      mediumSuitability: 'நடுத்தர பொருத்தம்',
      lowSuitability: 'குறைந்த பொருத்தம்',
      predictionResult: 'கணிப்பு முடிவு',
      adviserName: 'ஆலோசகர் பெயர்',
      soilParameters: 'மண் அளவுருக்கள்',
      soilType: 'மண் வகை',
      soilPh: 'மண் pH',
      nitrogen: 'நைட்ரஜன்',
      phosphate: 'பாஸ்பேட்',
      potassium: 'பொட்டாசியம்',
      environmentalConditions: 'சுற்றுச்சூழல் நிலைமைகள்',
      temperature: 'வெப்பநிலை',
      humidity: 'ஈரப்பதம்',
      rainfall: 'மழைப்பொழிவு',
      backToPredictions: 'கணிப்புகளுக்குத் திரும்பு',
    },
  },
};

export default function UserDashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme.name === 'dark';

  const [trans, setTrans] = useState(translations.en);
  const [activeSection, setActiveSection] = useState('lastPrediction');
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  // data
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showPredictionDetails, setShowPredictionDetails] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [cultivationDates, setCultivationDates] = useState([]);
  const [fertilizerApplications, setFertilizerApplications] = useState([]);

  // timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedCultivation, setSelectedCultivation] = useState(null);
  const timerRef = useRef(null);

  // unread badges
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // controller for canceling in-flight requests
  const abortControllerRef = useRef(new AbortController());

  const farmerId = user?.id ?? null;
  const farmerDocumentsLink = farmerId ? `/farmer/documents?farmerId=${encodeURIComponent(farmerId)}` : '/farmer/documents';

  // language
  useEffect(() => {
    setTrans(translations[language] || translations.en);
  }, [language]);

  // cleanup aborts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        try { abortControllerRef.current.abort(); } catch {}
      }
    };
  }, []);

  // FIXED: Enhanced predictions fetch to get adviser names
  const fetchPredictionHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = getToken();
      const res = await safeFetch(`${API_URL}/api/v1/predictions?user_id=${encodeURIComponent(user.id)}`, {
        headers: authHeader(token),
        signal: abortControllerRef.current?.signal
      });
      if (res.aborted) return;
      if (res.ok) {
        const json = await res.json();
        const mine = (json?.data || json || []).filter((p) => p.user_id === user.id);
        
        // Fetch adviser details for each prediction with adviser_id
        const enhancedPredictions = await Promise.all(mine.map(async (prediction) => {
          if (prediction.adviser_id) {
            try {
              const adviserRes = await safeFetch(`${API_URL}/api/v1/users/${prediction.adviser_id}`, {
                headers: authHeader(token),
                signal: abortControllerRef.current?.signal
              });
              if (adviserRes.ok) {
                const adviserData = await adviserRes.json();
                const adviser = adviserData.data || {};
                return {
                  ...prediction,
                  adviser_name: adviser.username || adviser.name || 'Unknown Adviser'
                };
              }
            } catch (e) {
              if (e.name !== 'AbortError') console.error(`Adviser fetch failed for ID ${prediction.adviser_id}:`, e);
            }
          }
          // Return the original prediction if no adviser_id or fetch fails
          return {
            ...prediction,
            adviser_name: prediction.adviser_name || 'No Adviser Assigned'
          };
        }));
        
        setPredictionHistory(enhancedPredictions);
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.error('Predictions fetch failed:', e);
    }
  }, [user]);

  // demo cards
  const fetchStaticCards = useCallback(() => {
    const now = new Date();
    setDocuments([
      { id: 1, title: 'Potato Cultivation Guide', description: 'Highland potato guide', type: 'PDF', url: '/documents/potato_guide.pdf', adviser_name: 'John Smith', created_at: now },
    ]);
    setCultivationDates([
      { id: 1, user_id: user?.id, crop_id: 'potato', crop_name: 'Potato', planting_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 20), expected_harvest: new Date(now.getFullYear(), now.getMonth() + 2, now.getDate()), status: 'active', notes: 'Seed potatoes from last harvest' },
    ]);
    setFertilizerApplications([
      { id: 1, user_id: user?.id, crop_id: 'potato', crop_name: 'Potato', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15), fertilizer_type: 'NPK (10-10-10)', quantity: 250, notes: 'Around plant base' },
    ]);
  }, [user?.id]);

  /* ----------------------------------------
     NOTIFICATION BADGE: robust and silent
     ---------------------------------------- */
  const refreshUnreadNotifCount = useCallback(async () => {
    if (!user?.id) { setUnreadNotifCount(0); return; }

    const token = getToken();
    let total = 0;

    // fresh controller for this batch
    const signal = (() => {
      // don't replace the shared ref; just make a local derived signal
      return abortControllerRef.current?.signal;
    })();

    // Predictions (always safe)
    try {
      if (FEATURES.predictions) {
        const pRes = await safeFetch(`${API_BASE}/api/v1/predictions?user_id=${encodeURIComponent(user.id)}&limit=200`, {
          headers: authHeader(token), signal
        });
        if (pRes.aborted) return;
        if (pRes.ok) {
          const preds = toArray(await safeJSON(pRes));
          total += preds.filter(p => !isLocallyRead('prediction', p.id)).length;
        }
      }
    } catch (e) {
      if (e?.name !== 'AbortError') console.warn('predictions badge failed:', e);
    }

    // Fertilizers (optional)
    try {
      if (FEATURES.fertilizers) {
        const fRes = await safeFetch(`${API_BASE}/api/v1/fertilizers?user_id=${encodeURIComponent(user.id)}&limit=200`, {
          headers: authHeader(token), signal
        });
        if (fRes.aborted) return;
        if (fRes.ok) {
          const ferts = toArray(await safeJSON(fRes));
          const dueSoon = ferts.filter(f => {
            const nextDate = f.next_application_date || f.next_date || f.date || f.application_date;
            const d = daysUntil(nextDate);
            return d <= 4; // include today + overdue
          }).length;
          total += dueSoon;
        } else if (fRes.status === 404) {
          // ignore silently
        }
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {/* ignore */}
    }

    // Appointments (optional)
    try {
      if (FEATURES.appointments) {
        const aRes = await safeFetch(`${API_BASE}/api/v1/appointments?user_id=${encodeURIComponent(user.id)}&limit=200`, {
          headers: authHeader(token), signal
        });
        if (aRes.aborted) return;
        if (aRes.ok) {
          const apps = toArray(await safeJSON(aRes));
          const near = apps.filter(a => {
            if (a.status && String(a.status).toLowerCase() !== 'approved') return false;
            const when = a.appointment_date || a.date || a.scheduled_at;
            return daysUntil(when) <= 4;
          }).length;
          total += near;
        } else if (aRes.status === 404) {
          // ignore silently
        }
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {/* ignore */}
    }

    setUnreadNotifCount(total);
  }, [user?.id]);

  // refresh on tab focus / when returning from /notifications
  useEffect(() => {
    const handler = () => refreshUnreadNotifCount();
    document.addEventListener('visibilitychange', handler);
    window.addEventListener('focus', handler);
    return () => {
      document.removeEventListener('visibilitychange', handler);
      window.removeEventListener('focus', handler);
    };
  }, [refreshUnreadNotifCount]);

  // Fetch all data for dashboard
  const fetchAll = useCallback(async () => {
    if (!user?.id) { setDataLoading(false); return; }
    try {
      setDataLoading(true);
      setError('');

      // abort any previous batch before creating a new controller
      if (abortControllerRef.current) {
        try { abortControllerRef.current.abort(); } catch {}
      }
      abortControllerRef.current = new AbortController();

      await Promise.all([fetchPredictionHistory()]);
      fetchStaticCards();
      await refreshUnreadNotifCount();
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('fetchAll failed:', e);
        setError('Failed to fetch data. Please try again later.');
      }
    } finally {
      setDataLoading(false);
    }
  }, [user?.id, fetchPredictionHistory, fetchStaticCards, refreshUnreadNotifCount]);

  // Auth gate — no banner, just redirect if needed
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchAll();
  }, [authLoading, user, fetchAll, router]);

  // Timer ticker
  useEffect(() => {
    if (timerRunning && selectedCultivation) {
      timerRef.current = setInterval(() => {
        const plantingDate = new Date(selectedCultivation.planting_date);
        const now = new Date();
        setElapsedTime(Math.floor((now.getTime() - plantingDate.getTime()) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning, selectedCultivation]);

  // Deep-links from notifications page
  useEffect(() => {
    const section = params?.get('section');
    const predictionId = params?.get('predictionId');
    if (section) setActiveSection(section);

    if (section === 'predictionHistory' && predictionId && predictionHistory?.length > 0) {
      const found = predictionHistory.find(p => String(p.id) === String(predictionId));
      if (found) {
        setSelectedPrediction(found);
        setShowPredictionDetails(true);
      } else {
        setTimeout(() => {
          const again = predictionHistory.find(p => String(p.id) === String(predictionId));
          if (again) {
            setSelectedPrediction(again);
            setShowPredictionDetails(true);
          }
        }, 300);
      }
    }
  }, [params, predictionHistory]);

  const getTextStyle = (s = {}) => ({ ...s, lineHeight: language === 'si' ? 1.7 : language === 'ta' ? 1.8 : 1.5 });

  // Loading (only while auth/data are loading)
  if (authLoading || (user && dataLoading)) {
    return (
      <ThemeWrapper>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.colors.primary }} />
        </div>
      </ThemeWrapper>
    );
  }

  // If not logged-in, we already redirected; render nothing
  if (!user) return null;

  const latestPrediction =
    predictionHistory.length > 0
      ? [...predictionHistory].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
      : null;

  return (
    <ThemeWrapper>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header + badges */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            {trans.title}
          </h1>

          <div className="flex gap-2">
            {/* Messages (badge comes from <UserChat />) */}
            <button
              onClick={() => setActiveSection('messages')}
              className="relative inline-flex items-center px-3 py-2 rounded-md border hover:opacity-90"
              style={{
                backgroundColor: activeSection === 'messages' ? theme.colors.primary : 'transparent',
                color: activeSection === 'messages' ? 'white' : theme.colors.text,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              }}
            >
              <MessageSquare className="h-5 w-5" />
              {unreadMessageCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs"
                  style={{ background: '#EF4444', color: 'white' }}
                >
                  {unreadMessageCount}
                </span>
              )}
            </button>

            {/* Notifications -> full page */}
            <button
              onClick={() => router.push(NOTIFICATIONS_URL)}
              className="relative inline-flex items-center px-3 py-2 rounded-md border hover:opacity-90"
              style={{
                backgroundColor: 'transparent',
                color: theme.colors.text,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              }}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs"
                  style={{ background: '#EF4444', color: 'white' }}
                >
                  {unreadNotifCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Nav grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {Object.keys(trans.sections).map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === 'notifications') {
                  router.push(NOTIFICATIONS_URL);
                } else if (key === 'contactAdvisor') {
                  router.push('/profile/Dashboard?section=contactAdvisor');
                  setActiveSection('contactAdvisor');
                } else {
                  setActiveSection(key);
                }
              }}
              className="flex flex-col items-center p-4 rounded-lg transition-all border"
              style={{
                backgroundColor: activeSection === key ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 'transparent',
                borderColor: activeSection === key ? theme.colors.primary : 'transparent',
                color: theme.colors.text,
              }}
            >
              {key === 'lastPrediction' && <BarChart className="h-6 w-6 mb-2" />}
              {key === 'predictionHistory' && <LineChart className="h-6 w-6 mb-2" />}
              {key === 'adviserDocuments' && <FileText className="h-6 w-6 mb-2" />}
              {key === 'cultivationDates' && <Calendar className="h-6 w-6 mb-2" />}
              {key === 'fertilizerCalendar' && <Calendar className="h-6 w-6 mb-2" />}
              {key === 'notifications' && (
                <div className="relative mb-2">
                  <Bell className="h-6 w-6" />
                  {unreadNotifCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px]"
                      style={{ background: '#EF4444', color: 'white' }}
                    >
                      {unreadNotifCount}
                    </span>
                  )}
                </div>
              )}
              {key === 'timer' && <Clock className="h-6 w-6 mb-2" />}
              {key === 'contactAdvisor' && <User className="h-6 w-6 mb-2" />}
              {key === 'messages' && (
                <div className="relative mb-2">
                  <MessageSquare className="h-6 w-6" />
                  {unreadMessageCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px]"
                      style={{ background: '#EF4444', color: 'white' }}
                    >
                      {unreadMessageCount}
                    </span>
                  )}
                </div>
              )}
              <span className="text-sm text-center" style={getTextStyle()}>
                {trans.sections[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Last Prediction */}
        {activeSection === 'lastPrediction' && (
          <div
            className="shadow sm:rounded-lg overflow-hidden"
            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }}
          >
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium flex items-center" style={{ color: theme.colors.text }}>
                <BarChart className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                {trans.lastPrediction.title}
              </h2>
              <p className="mt-1 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                {trans.lastPrediction.subtitle}
              </p>
            </div>

            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              {latestPrediction ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Crop + meta */}
                    <div className="lg:col-span-2 rounded-lg p-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                      <div className="flex items-start">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(75,192,192,0.2)' : 'rgba(75,192,192,0.1)' }}>
                          <User className="h-6 w-6" style={{ color: '#4BC0C0' }} />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium" style={{ color: theme.colors.text }}>
                            {latestPrediction.crop_name}
                          </h3>
                          <div className="mt-1 space-y-1 text-sm" style={{ color: isDark ? '#bbb' : '#333' }}>
                            <div>{trans.lastPrediction.date}: {new Date(latestPrediction.created_at).toLocaleDateString()}</div>
                            <div>{trans.predictionHistory.district}: {latestPrediction.district || '-'}</div>
                            <div>{trans.predictionHistory.adviserName}: {latestPrediction.adviser_name || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Suitability */}
                    <div className="lg:col-span-2 rounded-lg p-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                      <div className="flex items-start">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
                          <BarChart className="h-6 w-6" style={{ color: '#22C55E' }} />
                        </div>
                        <div className="ml-4 w-full">
                          <h3 className="text-lg font-medium" style={{ color: theme.colors.text }}>
                            {trans.lastPrediction.suitability}
                          </h3>
                          <div className="mt-2">
                            <div className="h-2 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                              <div className="h-full rounded-full" style={{ width: `${Math.round((latestPrediction.suitability_score ?? 0.8) * 100)}%`, backgroundColor: '#22C55E' }} />
                            </div>
                            <p className="mt-1 text-right text-xs" style={{ color: isDark ? '#aaa' : '#444' }}>
                              {Math.round((latestPrediction.suitability_score ?? 0.8) * 100)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setActiveSection('predictionHistory')}
                      className="inline-flex items-center px-3 py-2 border rounded-md text-sm hover:opacity-90"
                      style={{ backgroundColor: 'transparent', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: theme.colors.text }}
                    >
                      <LineChart className="mr-2 h-4 w-4" />
                      {trans.lastPrediction.viewAllPredictions}
                    </button>

                    <button
                      onClick={() => {
                        setActiveSection('predictionHistory');
                        setSelectedPrediction(latestPrediction);
                        setShowPredictionDetails(true);
                      }}
                      className="inline-flex items-center px-3 py-2 rounded-md text-white"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {trans.predictionHistory.viewDetails}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm" style={{ color: isDark ? '#aaa' : '#555' }}>
                    {trans.lastPrediction.noPrediction}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prediction History */}
        {activeSection === 'predictionHistory' && (
          <div className="shadow sm:rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }}>
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium flex items-center" style={{ color: theme.colors.text }}>
                <LineChart className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                {trans.predictionHistory.title}
              </h2>
              <p className="mt-1 text-sm" style={{ color: isDark ? '#aaa' : '#555' }}>
                {trans.predictionHistory.subtitle}
              </p>
            </div>

            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              {showPredictionDetails && selectedPrediction ? (
                <div>
                  <button
                    onClick={() => { setShowPredictionDetails(false); setSelectedPrediction(null); }}
                    className="inline-flex items-center px-3 py-2 mb-4 border rounded-md text-sm hover:opacity-90"
                    style={{ backgroundColor: 'transparent', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: theme.colors.text }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {trans.predictionHistory.backToPredictions}
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium" style={{ color: isDark ? '#ddd' : '#111' }}>
                        {trans.predictionHistory.soilParameters}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm" style={{ color: theme.colors.text }}>
                        <div><div className="text-xs" style={{ color: isDark ? '#aaa' : '#555' }}>{trans.predictionHistory.soilType}</div>{selectedPrediction.soil_type}</div>
                        <div><div className="text-xs" style={{ color: isDark ? '#aaa' : '#555' }}>{trans.predictionHistory.soilPh}</div>{selectedPrediction.soil_ph_level}</div>
                        <div><div className="text-xs" style={{ color: isDark ? '#aaa' : '#555' }}>{trans.predictionHistory.nitrogen} (kg/ha)</div>{selectedPrediction.nitrogen}</div>
                        <div><div className="text-xs" style={{ color: isDark ? '#aaa' : '#555' }}>{trans.predictionHistory.phosphate} (kg/ha)</div>{selectedPrediction.phosphate}</div>
                        <div><div className="text-xs" style={{ color: isDark ? '#aaa' : '#555' }}>{trans.predictionHistory.potassium} (kg/ha)</div>{selectedPrediction.potassium}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium" style={{ color: isDark ? '#ddd' : '#111' }}>
                        {trans.predictionHistory.environmentalConditions}
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm" style={{ color: theme.colors.text }}>
                        <div><div className="flex items-center gap-1 text-xs" style={{ color: isDark ? '#aaa' : '#555' }}><Thermometer className="h-3 w-3" />{trans.predictionHistory.temperature} (°C)</div>{selectedPrediction.temp}</div>
                        <div><div className="flex items-center gap-1 text-xs" style={{ color: isDark ? '#aaa' : '#555' }}><Droplet className="h-3 w-3" />{trans.predictionHistory.humidity} (%)</div>{selectedPrediction.avg_humidity}</div>
                        <div><div className="flex items-center gap-1 text-xs" style={{ color: isDark ? '#aaa' : '#555' }}><CloudRain className="h-3 w-3" />{trans.predictionHistory.rainfall} (mm)</div>{selectedPrediction.avg_rainfall}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : predictionHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y" style={{ divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? '#aaa' : '#555' }}>{trans.predictionHistory.date}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? '#aaa' : '#555' }}>{trans.predictionHistory.crop}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? '#aaa' : '#555' }}>{trans.predictionHistory.district}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? '#aaa' : '#555' }}>{trans.predictionHistory.suitability}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? '#aaa' : '#555' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                      {predictionHistory
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .map((p) => {
                          const score = p.suitability_score ?? 0.8;
                          let label = trans.predictionHistory.lowSuitability;
                          let color = isDark ? '#F87171' : '#DC2626';
                          if (score > 0.7) { label = trans.predictionHistory.highSuitability; color = isDark ? '#4ADE80' : '#22C55E'; }
                          else if (score > 0.4) { label = trans.predictionHistory.mediumSuitability; color = isDark ? '#FACC15' : '#CA8A04'; }
                          return (
                            <tr key={p.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>{new Date(p.created_at).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>{p.crop_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>{p.district || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" style={{ backgroundColor: isDark ? `${color}20` : `${color}15`, color }}>
                                  {label}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <button
                                  onClick={() => { setSelectedPrediction(p); setShowPredictionDetails(true); }}
                                  className="hover:opacity-80"
                                  style={{ color: theme.colors.primary }}
                                >
                                  {trans.predictionHistory.viewDetails}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm" style={{ color: isDark ? '#aaa' : '#555' }}>
                    {trans.predictionHistory.noPredictions}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Adviser Documents — embedded + link to full page */}
        {activeSection === 'adviserDocuments' && (
          <div className="shadow sm:rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }}>
            <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" style={{ color: theme.colors.primary }} />
                <h2 className="text-lg font-medium">{trans.sections.adviserDocuments}</h2>
              </div>

              <a
                href={farmerDocumentsLink}
                className="inline-flex items-center px-3 py-2 rounded-md text-white hover:opacity-90"
                style={{ backgroundColor: theme.colors.primary }}
              >
                Open full page
              </a>
            </div>

            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              {!farmerId ? (
                <div className="rounded-md px-4 py-3 text-sm" style={{ border: `1px solid ${theme.colors.border}`, backgroundColor: 'rgba(0,0,0,0.06)', color: theme.colors.text }}>
                  Open{' '}
                  <a href="/farmer/documents" className="underline" style={{ color: theme.colors.primary }}>
                    the documents page
                  </a>{' '}
                  with <code>?farmerId=</code> in the URL.
                </div>
              ) : (
                <DocumentsForAdvisers apiBase={API_BASE} farmerId={farmerId} readOnly />
              )}
            </div>
          </div>
        )}

        {/* Cultivation Dates */}
        {activeSection === 'cultivationDates' && (
          <div className="shadow sm:rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }}>
            <div className="px-4 py-5 sm:px-6 flex items-center gap-2">
              <Calendar className="h-5 w-5" style={{ color: theme.colors.primary }} />
              <h2 className="text-lg font-medium">{trans.sections.cultivationDates}</h2>
            </div>
            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              <CultivationDates
                apiBase={API_BASE}
                userId={user?.id}
                cultivationDates={cultivationDates}
                setCultivationDates={setCultivationDates}
                theme={theme}
                isDark={isDark}
                language={language}
              />
            </div>
          </div>
        )}

        {/* Fertilizer Calendar */}
        {activeSection === 'fertilizerCalendar' && (
          <div className="shadow sm:rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }}>
            <div className="px-4 py-5 sm:px-6 flex items-center gap-2">
              <Calendar className="h-5 w-5" style={{ color: theme.colors.primary }} />
              <h2 className="text-lg font-medium">{trans.sections.fertilizerCalendar}</h2>
            </div>
            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              <FertilizerCalendar
                apiBase={API_BASE}
                userId={user?.id}
                fertilizers={fertilizerApplications}
                setFertilizers={setFertilizerApplications}
                theme={theme}
                isDark={isDark}
                language={language}
              />
            </div>
          </div>
        )}

        {/* Notifications — CTA to full page */}
        {activeSection === 'notifications' && (
          <div className="shadow sm:rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }}>
            <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                <h2 className="text-lg font-medium" style={{ color: theme.colors.text }}>{trans.sections.notifications}</h2>
              </div>
              <a
                href={NOTIFICATIONS_URL}
                className="inline-flex items-center px-3 py-2 rounded-md text-white hover:opacity-90"
                style={{ backgroundColor: theme.colors.primary }}
              >
                Open full page
              </a>
            </div>
            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              <p className="text-sm" style={{ color: isDark ? '#aaa' : '#555' }}>
                Your notifications are available on the dedicated page.
              </p>
            </div>
          </div>
        )}

        {/* Timer */}
        {activeSection === 'timer' && (
          <div className="shadow sm:rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }}>
            <div className="px-4 py-5 sm:px-6 flex items-center gap-2">
              <Clock className="h-5 w-5" style={{ color: theme.colors.primary }} />
              <h2 className="text-lg font-medium">{trans.sections.timer}</h2>
            </div>
            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              <CropTimer
                apiBase={API_BASE}
                userId={user?.id}
                cultivationDates={cultivationDates}
                timerRunning={timerRunning}
                setTimerRunning={setTimerRunning}
                selectedCultivation={selectedCultivation}
                setSelectedCultivation={setSelectedCultivation}
                elapsedTime={elapsedTime}
                setElapsedTime={setElapsedTime}
                theme={theme}
                isDark={isDark}
                language={language}
              />
            </div>
          </div>
        )}

        {/* Contact Advisor */}
        {activeSection === 'contactAdvisor' && (
          <div className="shadow sm:rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }}>
            <div className="px-4 py-5 sm:px-6 flex items-center gap-2">
              <User className="h-5 w-5" style={{ color: theme.colors.primary }} />
              <h2 className="text-lg font-medium">{trans.sections.contactAdvisor}</h2>
            </div>
            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              <RequestAdviser apiBase={API_BASE} />
            </div>
          </div>
        )}

        {/* Messages */}
        {activeSection === 'messages' && (
          <UserChat onUnreadChange={(n) => setUnreadMessageCount(n)} />
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {error}
            </div>
          </div>
        )}
      </div>
    </ThemeWrapper>
  );
}