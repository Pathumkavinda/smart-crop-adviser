'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import { useRouter } from 'next/navigation';
import {
  User, Calendar, Mail, Map, Settings, Save, AlertTriangle, CheckCircle,
  LogIn, Phone, MessageSquare
} from 'lucide-react';

const RAW_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = RAW_API.replace(/\/+$/, '');

// ---------------- Translations (FULL) ----------------
const translations = {
  en: {
    title: "User Profile",
    editProfile: "Edit Profile",
    cancelEdit: "Cancel Edit",
    saveChanges: "Save Changes",
    goToLogin: "Go to Login",
    loadingError: "Failed to fetch profile data. Please try again later.",
    updateError: "Failed to update profile. Please try again.",
    updateSuccess: "Profile updated successfully!",
    loginRequired: "You need to be logged in to view your profile.",
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
    adviser: {
      title: "Agricultural Adviser",
      subtitle: "Get expert advice for your farming needs",
      yourAdviser: "Your Adviser",
      noAdviser: "No adviser assigned yet",
      contactAdviser: "Contact Adviser",
      requestAdviser: "Request an Adviser",
      message: "Message",
      messagePlaceholder: "Type your message to the adviser...",
      send: "Send",
      sending: "Sending...",
      messageSuccess: "Message sent successfully!",
      messageError: "Failed to send message. Please try again.",
      phone: "Phone",
      email: "Email",
      location: "Location",
      specialization: "Specialization",
      experience: "Experience",
      years: "years",
      recentAdvice: "Recent Advice",
      noAdvice: "No recent advice available",
      viewAllAdvice: "View All Advice"
    }
  },
  si: {
    title: "පරිශීලක පැතිකඩ",
    editProfile: "පැතිකඩ සංස්කරණය කරන්න",
    cancelEdit: "සංස්කරණය අවලංගු කරන්න",
    saveChanges: "වෙනස්කම් සුරකින්න",
    goToLogin: "පිවිසීමට යන්න",
    loadingError: "පැතිකඩ දත්ත ලබා ගැනීමට අසමත් විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.",
    updateError: "පැතිකඩ යාවත්කාලීන කිරීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.",
    updateSuccess: "පැතිකඩ සාර්ථකව යාවත්කාලීන කරන ලදී!",
    loginRequired: "ඔබගේ පැතිකඩ බැලීමට ඔබ පුරනය වී සිටිය යුතුය.",
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
    adviser: {
      title: "කෘෂිකාර්මික උපදේශක",
      subtitle: "ඔබගේ ගොවිතැන් අවශ්‍යතා සඳහා විශේෂඥ උපදෙස් ලබා ගන්න",
      yourAdviser: "ඔබගේ උපදේශක",
      noAdviser: "තවම උපදේශකයෙක් පත් කර නොමැත",
      contactAdviser: "උපදේශක අමතන්න",
      requestAdviser: "උපදේශකයෙකු ඉල්ලා සිටින්න",
      message: "පණිවිඩය",
      messagePlaceholder: "උපදේශකයාට ඔබගේ පණිවිඩය ටයිප් කරන්න...",
      send: "යවන්න",
      sending: "යවමින්...",
      messageSuccess: "පණිවිඩය සාර්ථකව යවන ලදී!",
      messageError: "පණිවිඩය යැවීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.",
      phone: "දුරකථන",
      email: "විද්‍යුත් තැපෑල",
      location: "ස්ථානය",
      specialization: "විශේෂඥතාව",
      experience: "අත්දැකීම්",
      years: "වසර",
      recentAdvice: "මෑත උපදෙස්",
      noAdvice: "මෑත උපදෙස් නොමැත",
      viewAllAdvice: "සියලු උපදෙස් බලන්න"
    }
  },
  ta: {
    title: "பயனர் சுயவிவரம்",
    editProfile: "சுயவிவரத்தைத் திருத்து",
    cancelEdit: "திருத்துவதை ரத்துசெய்",
    saveChanges: "மாற்றங்களை சேமி",
    goToLogin: "உள்நுழைவுக்குச் செல்லுங்கள்",
    loadingError: "சுயவிவர தரவைப் பெற முடியவில்லை. பிறகு மீண்டும் முயற்சிக்கவும்.",
    updateError: "சுயவிவரத்தைப் புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    updateSuccess: "சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!",
    loginRequired: "உங்கள் சுயவிவரத்தைப் பார்க்க நீங்கள் உள்நுழைந்திருக்க வேண்டும்.",
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
    adviser: {
      title: "விவசாய ஆலோசகர்",
      subtitle: "உங்கள் விவசாய தேவைகளுக்கு நிபுணர் ஆலோசனை பெறுங்கள்",
      yourAdviser: "உங்கள் ஆலோசகர்",
      noAdviser: "இன்னும் ஆலோசகர் நியமிக்கப்படவில்லை",
      contactAdviser: "ஆலோசகரை தொடர்பு கொள்ளவும்",
      requestAdviser: "ஆலோசகரை கோருங்கள்",
      message: "செய்தி",
      messagePlaceholder: "ஆலோசகருக்கு உங்கள் செய்தியை தட்டச்சு செய்யவும்...",
      send: "அனுப்பு",
      sending: "அனுப்புகிறது...",
      messageSuccess: "செய்தி வெற்றிகரமாக அனுப்பப்பட்டது!",
      messageError: "செய்தியை அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
      phone: "தொலைபேசி",
      email: "மின்னஞ்சல்",
      location: "இருப்பிடம்",
      specialization: "சிறப்புத்துறை",
      experience: "அனுபவம்",
      years: "ஆண்டுகள்",
      recentAdvice: "சமீபத்திய ஆலோசனை",
      noAdvice: "சமீபத்திய ஆலோசனை இல்லை",
      viewAllAdvice: "அனைத்து ஆலோசனைகளையும் காண"
    }
  }
};

// ---------------- Helpers ----------------
const safeJSON = async (res) => { try { return await res.json(); } catch { return null; } };
const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
const headersAuth = (token) => token ? { Authorization: `Bearer ${token}` } : {};
const normArr = (x) => Array.isArray(x) ? x : (x ? [x] : []);
const pick = (o, k, d) => (o && o[k] !== undefined ? o[k] : d);

export default function Profile() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme.name === 'dark';

  // Make sure trans is NEVER undefined
  const [trans, setTrans] = useState(translations.en);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [adviserData, setAdviserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [roomId] = useState('advice-room');

  const [dataLoading, setDataLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [messageText, setMessageText] = useState('');

  const [userData, setUserData] = useState({
    username: '', email: '', name: '', location: '', farmSize: ''
  });

  // Translation switch (defensive)
  useEffect(() => {
    const next = translations?.[language] || translations.en;
    setIsTransitioning(true);
    const t = setTimeout(() => {
      setTrans(next);
      const t2 = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(t2);
    }, 300);
    return () => clearTimeout(t);
  }, [language]);

  const contentStyle = useMemo(() => ({
    opacity: isTransitioning ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
  }), [isTransitioning]);

  const getTextStyle = (baseStyle = {}) => {
    const lh = language === 'si' ? 1.7 : language === 'ta' ? 1.8 : 1.5;
    return { ...baseStyle, lineHeight: lh, transition: 'all 0.3s ease' };
  };

  useEffect(() => {
    if (!user) return;
    setUserData({
      username: user.username || '',
      email: user.email || '',
      name: user.full_name || '',
      location: user.address || '',
      farmSize: user.landsize || '',
    });
  }, [user]);

  // Fetch adviser + messages (guards on trans to avoid undefined)
  const fetchAdviserAndMessages = useCallback(async () => {
    if (!user || !user.id) { setDataLoading(false); return; }
    const token = getToken();
    setDataLoading(true);
    setError('');
    try {
      // adviser
      let adviser = null;
      try {
        const res = await fetch(`${API_URL}/api/v1/advisers/user/${user.id}`, { headers: headersAuth(token) });
        if (res.ok) {
          const json = await safeJSON(res);
          adviser = pick(json, 'data', null) || json;
          if (adviser && adviser.id == null && adviser.adviser_id != null) adviser.id = adviser.adviser_id;
        }
      } catch { /* ignore */ }
      setAdviserData(adviser || null);

      // messages: thread or advice-room
      let threadMsgs = [];
      if (adviser?.id) {
        const url = `${API_URL}/api/v1/messages/thread?userA=${encodeURIComponent(user.id)}&userB=${encodeURIComponent(adviser.id)}&page=1&limit=30`;
        const res = await fetch(url, { headers: headersAuth(token) });
        if (res.ok) {
          const json = await safeJSON(res);
          threadMsgs = normArr(pick(json, 'data', json)).filter(Boolean);
        }
      } else {
        const url = `${API_URL}/api/v1/messages/room/${encodeURIComponent(roomId)}?page=1&limit=30`;
        const res = await fetch(url, { headers: headersAuth(token) });
        if (res.ok) {
          const json = await safeJSON(res);
          threadMsgs = normArr(pick(json, 'data', json)).filter(Boolean);
        }
      }

      const normalized = threadMsgs.map((m) => ({
        id: m.id ?? m._id ?? m.message_id ?? null,
        senderId: m.sender_id ?? m.senderId ?? m.sender ?? m.from_id ?? null,
        receiverId: m.receiver_id ?? m.receiverId ?? m.to_id ?? null,
        room: m.room ?? m.roomId ?? null,
        content: m.content ?? m.message ?? '',
        created_at: m.created_at ?? m.timestamp ?? m.date ?? new Date().toISOString(),
        delivered: !!(m.delivered),
        read: !!(m.read),
      }));
      setMessages(normalized);

      // best-effort mark delivered/read (only incoming with real ids)
      const toAck = normalized.filter(m =>
        m.id && m.senderId && String(m.senderId) !== String(user.id) && (!m.delivered || !m.read)
      );
      await Promise.allSettled(toAck.map(async (m) => {
        try {
          if (!m.delivered) {
            const r1 = await fetch(`${API_URL}/api/v1/messages/${encodeURIComponent(m.id)}/delivered`, { method: 'PUT', headers: headersAuth(token) });
            if (r1.ok) m.delivered = true;
          }
          if (!m.read) {
            const r2 = await fetch(`${API_URL}/api/v1/messages/${encodeURIComponent(m.id)}/read`, { method: 'PUT', headers: headersAuth(token) });
            if (r2.ok) m.read = true;
          }
        } catch {}
      }));
      setMessages([...normalized]);
    } catch (e) {
      console.error('fetchAdviserAndMessages:', e);
      setError(trans?.loadingError || 'Failed to fetch profile data.');
    } finally {
      setDataLoading(false);
    }
  }, [user, roomId, trans?.loadingError]); // guard with optional chaining

  useEffect(() => {
    if (authLoading) return;
    if (user) fetchAdviserAndMessages();
    else setDataLoading(false);
  }, [authLoading, user, fetchAdviserAndMessages]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserData((s) => ({ ...s, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) { setError('User not found'); return; }
    try {
      setDataLoading(true);
      setError('');
      setSuccess('');

      const updated = await updateUser?.({
        address: userData.location,
        landsize: userData.farmSize
      });

      if (!updated) throw new Error(trans?.updateError || 'Failed to update profile.');
      setSuccess(trans?.updateSuccess || 'Profile updated.');
      setEditMode(false);
      await fetchAdviserAndMessages();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message || trans?.updateError || 'Failed to update profile.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text) return;
    if (!user?.id) { setError('User not found'); return; }

    const token = getToken();
    setMessageLoading(true);
    setError('');
    try {
      const body = { senderId: user.id, content: text };
      if (adviserData?.id) body.receiverId = adviserData.id;
      else body.room = roomId;

      const res = await fetch(`${API_URL}/api/v1/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headersAuth(token) },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(trans?.adviser?.messageError || 'Failed to send message.');
      const json = await safeJSON(res);
      const saved = pick(json, 'data', json) || {};

      const uiMsg = {
        id: saved.id ?? saved._id ?? Date.now(),
        senderId: user.id,
        receiverId: adviserData?.id ?? null,
        room: adviserData?.id ? null : roomId,
        content: saved.content ?? saved.message ?? text,
        created_at: saved.created_at ?? new Date().toISOString(),
        delivered: saved.delivered ?? true,
        read: saved.read ?? true,
      };

      setMessages((prev) => [...prev, uiMsg]);
      setMessageText('');
      setSuccess(trans?.adviser?.messageSuccess || 'Message sent.');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Send message error:', err);
      setError(err.message || trans?.adviser?.messageError || 'Failed to send message.');
    } finally {
      setMessageLoading(false);
    }
  };

  // Loading
  if (authLoading || (dataLoading && !error)) {
    return (
      <ThemeWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.colors.primary }} />
        </div>
      </ThemeWrapper>
    );
  }

  // Not logged in
  if (!user && !dataLoading) {
    return (
      <ThemeWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-md p-4 mb-6" style={{
            backgroundColor: isDark ? 'rgba(234,179,8,0.2)' : '#FEF9C3',
            borderLeftWidth: 4, borderLeftColor: isDark ? '#EAB308' : '#CA8A04'
          }}>
            <div className="flex">
              <AlertTriangle className="h-5 w-5 mr-2" style={{ color: isDark ? '#FACC15' : '#CA8A04' }} />
              <p className="text-sm" style={{ ...getTextStyle({ color: isDark ? '#FACC15' : '#854D0E' }), ...contentStyle }}>
                {trans?.loginRequired || 'Please log in.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center px-4 py-2 rounded-md text-white hover:opacity-90"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <LogIn className="mr-2 h-4 w-4" />
            <span style={contentStyle}>{trans?.goToLogin || 'Go to Login'}</span>
          </button>
        </div>
      </ThemeWrapper>
    );
  }

  const renderMessages = () => (
    <div
      className="px-4 py-5"
      style={{ maxHeight: 400, overflowY: 'auto', backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}
    >
      {messages.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
            {trans?.adviser?.noAdvice || 'No messages.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => {
            const mine = String(m.senderId) === String(user.id);
            const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={m.id ?? Math.random()} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${mine ? 'rounded-tr-none' : 'rounded-tl-none'}`}
                  style={{
                    backgroundColor: mine
                      ? (isDark ? theme.colors.primary + '33' : theme.colors.primary + '22')
                      : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)'),
                    color: theme.colors.text
                  }}
                >
                  <p className="text-sm break-words whitespace-pre-wrap">{m.content}</p>
                  <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', textAlign: mine ? 'right' : 'left' }}>
                    {time}{!mine && (m.read || m.delivered) ? ' · ✓' : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <ThemeWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
            {trans?.title || 'User Profile'}
          </h1>
          {activeTab === 'profile' && (
            <button
              onClick={() => setEditMode(!editMode)}
              className="inline-flex items-center px-4 py-2 rounded-md text-white hover:opacity-90"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span style={contentStyle}>{editMode ? (trans?.cancelEdit || 'Cancel Edit') : (trans?.editProfile || 'Edit Profile')}</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: isDark ? 'rgba(220,38,38,0.2)' : '#FEF2F2', borderLeftWidth: 4, borderLeftColor: isDark ? '#EF4444' : '#DC2626' }}>
            <div className="flex">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p className="text-sm" style={{ ...getTextStyle({ color: isDark ? '#F87171' : '#B91C1C' }), ...contentStyle }}>{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : '#F0FDF4', borderLeftWidth: 4, borderLeftColor: isDark ? '#4ADE80' : '#22C55E' }}>
            <div className="flex">
              <CheckCircle className="h-5 w-5 mr-2" />
              <p className="text-sm" style={{ ...getTextStyle({ color: isDark ? '#86EFAC' : '#15803D' }), ...contentStyle }}>{success}</p>
            </div>
          </div>
        )}

        <div className="mb-6 border-b" style={{ borderColor: theme.colors.border }}>
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className="pb-3 px-1 flex items-center font-medium text-sm border-b-2"
              style={{ color: activeTab === 'profile' ? theme.colors.primary : undefined, borderColor: activeTab === 'profile' ? theme.colors.primary : 'transparent' }}
            >
              <User className="mr-2 h-5 w-5" />
              <span style={contentStyle}>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('adviser')}
              className="pb-3 px-1 flex items-center font-medium text-sm border-b-2"
              style={{ color: activeTab === 'adviser' ? theme.colors.primary : undefined, borderColor: activeTab === 'adviser' ? theme.colors.primary : 'transparent' }}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              <span style={contentStyle}>Contact Adviser</span>
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="shadow overflow-hidden sm:rounded-lg" style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                {trans?.profileInfo?.title || 'Profile Information'}
              </h2>
              <p className="mt-1 max-w-2xl text-sm" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
                {trans?.profileInfo?.subtitle || 'Personal details.'}
              </p>
            </div>

            {editMode ? (
              <div className="border-t px-4 py-5 sm:p-0" style={{ borderColor: theme.colors.border }}>
                <form onSubmit={handleProfileSubmit}>
                  <dl className="sm:divide-y" style={{ divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    {/* username */}
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium flex items-center" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
                        <User className="mr-2 h-4 w-4" />{trans?.profileInfo?.username || 'Username'}
                      </dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                        <input type="text" name="username" value={userData.username} onChange={handleProfileChange}
                          className="max-w-lg block w-full rounded-md" disabled
                          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`, color: theme.colors.text, padding: '0.5rem 0.75rem' }} />
                        <p className="mt-1 text-xs" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }), ...contentStyle }}>
                          {trans?.profileInfo?.usernameCannotChange || 'Username cannot be changed.'}
                        </p>
                      </dd>
                    </div>
                    {/* email */}
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium flex items-center" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
                        <Mail className="mr-2 h-4 w-4" />{trans?.profileInfo?.email || 'Email'}
                      </dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                        <input type="email" name="email" value={userData.email} onChange={handleProfileChange}
                          className="max-w-lg block w-full rounded-md" disabled
                          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`, color: theme.colors.text, padding: '0.5rem 0.75rem' }} />
                        <p className="mt-1 text-xs" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }), ...contentStyle }}>
                          {trans?.profileInfo?.emailCannotChange || 'Email cannot be changed.'}
                        </p>
                      </dd>
                    </div>
                    {/* name */}
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium flex items-center" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
                        <User className="mr-2 h-4 w-4" />{trans?.profileInfo?.fullName || 'Full name'}
                      </dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                        <input type="text" name="name" value={userData.name} onChange={handleProfileChange}
                          className="max-w-lg block w-full rounded-md"
                          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`, color: theme.colors.text, padding: '0.5rem 0.75rem' }} />
                      </dd>
                    </div>
                    {/* location */}
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium flex items-center" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
                        <Map className="mr-2 h-4 w-4" />{trans?.profileInfo?.location || 'Location'}
                      </dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                        <input type="text" name="location" value={userData.location} onChange={handleProfileChange}
                          placeholder={trans?.profileInfo?.locationPlaceholder || 'Location'} className="max-w-lg block w-full rounded-md"
                          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`, color: theme.colors.text, padding: '0.5rem 0.75rem' }} />
                      </dd>
                    </div>
                    {/* farm size */}
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium flex items-center" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
                        <Map className="mr-2 h-4 w-4" />{trans?.profileInfo?.farmSize || 'Farm size'}
                      </dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                        <input type="number" name="farmSize" value={userData.farmSize} onChange={handleProfileChange}
                          placeholder={trans?.profileInfo?.farmSizePlaceholder || '2.5'} className="max-w-lg block w-full rounded-md"
                          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`, color: theme.colors.text, padding: '0.5rem 0.75rem' }} />
                      </dd>
                    </div>
                    {/* save */}
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium" />
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                        <button type="submit" className="inline-flex items-center px-4 py-2 rounded-md text-white hover:opacity-90"
                          style={{ backgroundColor: theme.colors.primary }}>
                          <Save className="mr-2 h-4 w-4" />{trans?.saveChanges || 'Save Changes'}
                        </button>
                      </dd>
                    </div>
                  </dl>
                </form>
              </div>
            ) : (
              <div className="border-t px-4 py-5 sm:p-0" style={{ borderColor: theme.colors.border }}>
                <dl className="sm:divide-y" style={{ divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  {[
                    [<><User className="mr-2 h-4 w-4" />{trans?.profileInfo?.username || 'Username'}</>, userData.username || '-'],
                    [<><Mail className="mr-2 h-4 w-4" />{trans?.profileInfo?.email || 'Email'}</>, userData.email || '-'],
                    [<><User className="mr-2 h-4 w-4" />{trans?.profileInfo?.fullName || 'Full name'}</>, userData.name || '-'],
                    [<><Map className="mr-2 h-4 w-4" />{trans?.profileInfo?.location || 'Location'}</>, userData.location || '-'],
                    [<><Map className="mr-2 h-4 w-4" />{trans?.profileInfo?.farmSize || 'Farm size'}</>, userData.farmSize ? `${userData.farmSize} hectares` : '-'],
                    [<><Calendar className="mr-2 h-4 w-4" />{trans?.profileInfo?.joined || 'Joined'}</>, user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'],
                  ].map(([label, val], i) => (
                    <div key={i} className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium flex items-center" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>{label}</dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}

        {/* Adviser Tab */}
        {activeTab === 'adviser' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Adviser card */}
            <div className="lg:col-span-1">
              <div className="shadow overflow-hidden sm:rounded-lg" style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium" style={{ ...getTextStyle({ color: theme.colors.text }), ...contentStyle }}>
                    {trans?.adviser?.title || 'Agricultural Adviser'}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm" style={{ ...getTextStyle({ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }), ...contentStyle }}>
                    {trans?.adviser?.subtitle || 'Get expert advice.'}
                  </p>
                </div>

                {adviserData ? (
                  <div>
                    <div className="px-4 py-5 border-t" style={{ borderColor: theme.colors.border }}>
                      <div className="flex flex-col items-center">
                        <div className="h-24 w-24 rounded-full overflow-hidden mb-4"
                          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}` }}>
                          {adviserData.photo
                            ? <img src={adviserData.photo} alt={adviserData.name} className="h-full w-full object-cover" />
                            : <div className="h-full w-full flex items-center justify-center"><User className="h-12 w-12 text-gray-400" /></div>}
                        </div>
                        <h3 className="text-lg font-medium" style={{ color: theme.colors.text }}>{adviserData.name ?? adviserData.full_name ?? 'Adviser'}</h3>
                        <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>{adviserData.specialization ?? '-'}</p>
                      </div>
                    </div>
                    <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
                      <dl>
                        <div className="flex py-2">
                          <dt className="flex-shrink-0 flex items-center text-sm font-medium mr-2" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                            <Phone className="h-4 w-4 mr-2" />{trans?.adviser?.phone || 'Phone'}:
                          </dt>
                          <dd className="text-sm" style={{ color: theme.colors.text }}>{adviserData.phone ?? '-'}</dd>
                        </div>
                        <div className="flex py-2">
                          <dt className="flex-shrink-0 flex items-center text-sm font-medium mr-2" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                            <Mail className="h-4 w-4 mr-2" />{trans?.adviser?.email || 'Email'}:
                          </dt>
                          <dd className="text-sm" style={{ color: theme.colors.text }}>{adviserData.email ?? '-'}</dd>
                        </div>
                        <div className="flex py-2">
                          <dt className="flex-shrink-0 flex items-center text-sm font-medium mr-2" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                            <Map className="h-4 w-4 mr-2" />{trans?.adviser?.location || 'Location'}:
                          </dt>
                          <dd className="text-sm" style={{ color: theme.colors.text }}>{adviserData.location ?? '-'}</dd>
                        </div>
                        <div className="flex py-2">
                          <dt className="flex-shrink-0 flex items-center text-sm font-medium mr-2" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                            <Calendar className="h-4 w-4 mr-2" />{trans?.adviser?.experience || 'Experience'}:
                          </dt>
                          <dd className="text-sm" style={{ color: theme.colors.text }}>{adviserData.experience ?? 0} {trans?.adviser?.years || 'years'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-5 border-t text-center" style={{ borderColor: theme.colors.border }}>
                    <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      {trans?.adviser?.noAdviser || 'No adviser assigned yet'}
                    </p>
                    <button className="mt-4 inline-flex items-center px-4 py-2 rounded-md text-white hover:opacity-90"
                      style={{ backgroundColor: theme.colors.primary }}>
                      {trans?.adviser?.requestAdviser || 'Request an Adviser'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="lg:col-span-2">
              <div className="shadow overflow-hidden sm:rounded-lg" style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
                <div className="px-4 py-5 sm:px-6 border-b" style={{ borderColor: theme.colors.border }}>
                  <h3 className="text-lg leading-6 font-medium" style={{ color: theme.colors.text }}>
                    {trans?.adviser?.contactAdviser || 'Contact Adviser'}
                  </h3>
                </div>

                {renderMessages()}

                <div className="px-4 py-4 border-t" style={{ borderColor: theme.colors.border }}>
                  <form onSubmit={handleSend}>
                    <div className="flex">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={trans?.adviser?.messagePlaceholder || 'Type your message...'}
                        className="flex-1 rounded-l-md sm:text-sm"
                        style={{
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                          color: theme.colors.text, padding: '0.5rem 0.75rem'
                        }}
                        required
                      />
                      <button
                        type="submit"
                        disabled={messageLoading}
                        className="inline-flex items-center px-4 py-2 rounded-r-md text-white"
                        style={{ backgroundColor: theme.colors.primary, opacity: messageLoading ? 0.7 : 1, cursor: messageLoading ? 'not-allowed' : 'pointer' }}
                      >
                        {messageLoading ? (trans?.adviser?.sending || 'Sending...') : (trans?.adviser?.send || 'Send')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </ThemeWrapper>
  );
}
